import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("PROJECT_URL");
    const SERVICE_KEY  = Deno.env.get("PROJECT_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error("Missing envs:", { SUPABASE_URL: !!SUPABASE_URL, SERVICE_KEY: !!SERVICE_KEY });
      return new Response(JSON.stringify({ error: "Server misconfiguration - missing env" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    const { data, error } = await supabase
      .from("public_rescue_view")
      .select("id,title,animal_name,location,target_amount,currency,status,image_url,story,total_donated,progress_pct,created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: "Upstream DB error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleaned = (Array.isArray(data) ? data : []).map((r) => ({
      id: r.id,
      title: r.title ?? "",
      animal_name: r.animal_name ?? "",
      location: r.location ?? "",
      target_amount: Number(r.target_amount || 0),
      currency: r.currency ?? "",
      image_url: r.image_url ?? "",
      story: r.story ? String(r.story).substring(0, 220) : "",
      total_donated: Number(r.total_donated || 0),
      progress_pct: Number(r.progress_pct || 0),
      created_at: r.created_at ?? null,
    }));

    return new Response(JSON.stringify(cleaned), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(err?.message || err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
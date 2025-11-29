// scripts/check_null_audits.js
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(2);
}
const supa = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false }});

(async () => {
  try {
    // Query: count of null audits in last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supa
      .from('audit_donations_log')
      .select('id', { count: 'exact', head: true })
      .or('donation_id.is.null,sale_id.is.null')
      .gte('created_at', since);

    if (error) throw error;

    const nullCount = Number(count || 0);
    console.log('null_audits_last_24h =', nullCount);

    if (nullCount > 0) {
      const text = `⚠️ *Alert:* ${nullCount} null audit(s) detected in the last 24h in audit_donations_log.`;
      console.log(text);

      if (SLACK_WEBHOOK) {
        await fetch(SLACK_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        console.log('Slack webhook notified.');
      } else {
        console.warn('No SLACK_WEBHOOK_URL configured. Set secret to receive Slack alerts.');
      }

      // fail the job so you see it in Actions UI
      process.exit(1);
    } else {
      console.log('No null audits in the last 24h.');
      process.exit(0);
    }
  } catch (e) {
    console.error('Check failed:', e);
    process.exit(2);
  }
})();

// api/mark-donation-sent.js (production hardened)
// - acepta token por header: x-admin-token OR Authorization: Bearer <token>
// - no acepta token en body
// - valida que donation exista (404 si no)
// - actualiza donation con tx_id y sent_at
// - inserta fila en donations_audit
// - rate-limit simple por token (en memoria) con advertencia sobre serverless
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ---- Simple in-memory rate limiter ----
// WARNING: this is per-process and ephemeral (works in dev and single-instance deployments).
// For production multi-instance, use Redis or an external rate-limit service.
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // max requests per token per window
const limiter = new Map(); // tokenFingerprint => { count, windowStart }

function tokenFingerprint(token) {
  // 8-byte hex fingerprint (non-reversible)
  return crypto.createHash('sha256').update(String(token)).digest('hex').slice(0, 16);
}

function checkRateLimit(fprint) {
  const now = Date.now();
  const rec = limiter.get(fprint);
  if (!rec) {
    limiter.set(fprint, { count: 1, windowStart: now });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (now - rec.windowStart > RATE_LIMIT_WINDOW_MS) {
    // new window
    limiter.set(fprint, { count: 1, windowStart: now });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (rec.count >= RATE_LIMIT_MAX) {
    return { ok: false, retry_after_ms: RATE_LIMIT_WINDOW_MS - (now - rec.windowStart) };
  }
  rec.count += 1;
  limiter.set(fprint, rec);
  return { ok: true, remaining: RATE_LIMIT_MAX - rec.count };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'only POST' });

  try {
    // Grab token from headers only (no body.token usage)
    const headerToken =
      req.headers['x-admin-token'] ||
      (req.headers['authorization'] && String(req.headers['authorization']).replace(/^Bearer\s+/i, ''));

    if (!headerToken) return res.status(401).json({ error: 'unauthorized: missing token' });

    // quick compare
    if (headerToken !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' });

    const fprint = tokenFingerprint(headerToken);

    // Rate limit check
    const rl = checkRateLimit(fprint);
    if (!rl.ok) {
      res.setHeader('Retry-After', Math.ceil(rl.retry_after_ms / 1000));
      return res.status(429).json({ error: 'rate_limited', retry_after_ms: rl.retry_after_ms });
    }

    // payload
    const { donation_id, tx_id } = req.body || {};
    if (!donation_id || !tx_id) return res.status(400).json({ error: 'missing donation_id or tx_id' });

    // ensure donation exists
    const { data: exist, error: existErr } = await supa
      .from('donations')
      .select('id')
      .eq('id', donation_id)
      .limit(1)
      .single();

    if (existErr && existErr.code !== 'PGRST116') {
      // PGRST116 may appear if single() has no rows in some supabase clients; handle gracefully below
      // but we still continue to check exist variable.
      console.error('mark-donation-sent: existence check error', existErr);
    }

    if (!exist || !exist.id) {
      // try a safe query fallback to detect non-existence
      const { data: maybe, error: maybeErr } = await supa.from('donations').select('id').eq('id', donation_id).limit(1);
      if (maybeErr) {
        console.error('mark-donation-sent: existence fallback error', maybeErr);
        return res.status(500).json({ error: 'internal' });
      }
      if (!maybe || maybe.length === 0) {
        return res.status(404).json({ error: 'donation_not_found' });
      }
    }

    // Update the donation (set tx_id, sent_at)
    const { data, error } = await supa
      .from('donations')
      .update({ tx_id, sent_at: new Date().toISOString() })
      .eq('id', donation_id)
      .select()
      .single();

    if (error) {
      console.error('mark-donation-sent: update error', error);
      return res.status(500).json({ error: 'update_failed' });
    }

    // Insert audit row (best-effort). If it fails, we still return success but log.
    try {
      await supa.from('donations_audit').insert([{
        donation_id,
        action: 'mark_sent',
        tx_id,
        admin_token_fingerprint: fprint,
        note: null
      }]);
    } catch (auditErr) {
      console.error('mark-donation-sent: audit insert failed', auditErr);
      // proceed - do not fail the main operation
    }

    return res.status(200).json({ ok: true, data });
  } catch (e) {
    console.error('mark-donation-sent error', e);
    return res.status(500).json({ error: e.message || 'internal' });
  }
}

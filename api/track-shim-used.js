import { requireAdmin } from '../lib/require-admin.js';
if (!requireAdmin(req, res)) return;

// api/track-shim-used.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const path = req.headers['x-path'] || req.body?.path || req.url || '/'
    const { error } = await supabase
      .from('shim_events')
      .insert({ path })
    if (error) {
      console.error('supabase insert error', error)
      return res.status(500).json({ ok: false })
    }
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ ok: false })
  }
}


// lib/require-admin.js
export function requireAdmin(req, res) {
  const authHeader = (req.headers.authorization || req.headers.Authorization || "").toString();
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  // optionally accept admin_token query param for easier testing
  const urlToken = (req.query && req.query.admin_token) ? req.query.admin_token : null;

  const expected = process.env.ADMIN_TOKEN || "";

  if (!expected) {
    // Fail closed: si no hay token en env, no permitimos nada
    res.status(500).json({ error: "Server misconfigured: ADMIN_TOKEN missing" });
    return false;
  }

  if (token === expected || urlToken === expected) {
    return true;
  }

  res.status(401).json({ error: "Unauthorized" });
  return false;
}

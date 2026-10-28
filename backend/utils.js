function requireDatabase(req, res, next) {
  const supabase = require("./supabase");
  if (!supabase) return res.status(503).json({ error: "Database is not configured. Fill in backend/.env and restart the server." });
  req.supabase = supabase;
  next();
}
function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0,10) === value;
}
module.exports = { requireDatabase, validDate };

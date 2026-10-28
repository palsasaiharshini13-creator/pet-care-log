const express = require("express");
const { requireDatabase, validDate } = require("../utils");
const router = express.Router();
const types = new Set(["health", "feeding", "appointment", "medication", "grooming"]);

router.get("/", requireDatabase, async (req, res) => {
  const { data, error } = await req.supabase.from("care_records").select("*").order("record_date", { ascending: false }).order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: "Could not load care records." });
  res.json({ data });
});

router.post("/", requireDatabase, async (req, res) => {
  const { pet_id, type, record_date, title, details = "", next_date = null } = req.body || {};
  if (!Number.isInteger(Number(pet_id)) || Number(pet_id) <= 0) return res.status(400).json({ error: "Choose a valid pet." });
  if (!types.has(type)) return res.status(400).json({ error: "Choose a valid record type." });
  if (!validDate(record_date)) return res.status(400).json({ error: "Enter a valid record date." });
  if (typeof title !== "string" || !title.trim() || title.trim().length > 100) return res.status(400).json({ error: "Title is required and must be 100 characters or fewer." });
  if (typeof details !== "string" || details.length > 1000) return res.status(400).json({ error: "Details must be 1000 characters or fewer." });
  if (next_date !== null && !validDate(next_date)) return res.status(400).json({ error: "Enter a valid next date." });
  const { data, error } = await req.supabase.from("care_records").insert({
    pet_id: Number(pet_id), type, record_date, title: title.trim(), details: details.trim(), next_date
  }).select("*").single();
  if (error) {
    if (error.code === "23503") return res.status(400).json({ error: "That pet no longer exists. Refresh the page and try again." });
    console.error("Record insert failed:", error.message);
    return res.status(500).json({ error: "Could not save this care record. Check your database setup." });
  }
  res.status(201).json({ data });
});

router.delete("/:id", requireDatabase, async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: "Invalid record ID." });
  const { error } = await req.supabase.from("care_records").delete().eq("id", Number(req.params.id));
  if (error) { console.error("Record delete failed:", error.message); return res.status(500).json({ error: "Could not delete this care record." }); }
  res.json({ message: "Care record deleted." });
});
module.exports = router;

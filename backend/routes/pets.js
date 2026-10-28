const express = require("express");
const { requireDatabase } = require("../utils");
const router = express.Router();
const speciesOptions = new Set(["Dog", "Cat", "Bird", "Rabbit", "Other"]);

router.get("/", requireDatabase, async (req, res) => {
  const { data, error } = await req.supabase.from("pets").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: "Could not load pet profiles." });
  res.json({ data });
});

router.post("/", requireDatabase, async (req, res) => {
  const { name, species, breed = "", birth_date = null, weight_kg = null, notes = "" } = req.body || {};
  if (typeof name !== "string" || !name.trim() || name.trim().length > 60) return res.status(400).json({ error: "Pet name is required and must be 60 characters or fewer." });
  if (!speciesOptions.has(species)) return res.status(400).json({ error: "Choose a valid pet species." });
  if (typeof breed !== "string" || breed.length > 60 || typeof notes !== "string" || notes.length > 500) return res.status(400).json({ error: "Breed or notes are too long." });
  if (birth_date !== null && (typeof birth_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(birth_date) || Number.isNaN(Date.parse(`${birth_date}T00:00:00Z`)))) return res.status(400).json({ error: "Enter a valid birth date." });
  if (weight_kg !== null && (!Number.isFinite(Number(weight_kg)) || Number(weight_kg) <= 0 || Number(weight_kg) > 500)) return res.status(400).json({ error: "Weight must be greater than 0 and at most 500 kg." });
  const payload = { name: name.trim(), species, breed: breed.trim(), birth_date, weight_kg: weight_kg === null ? null : Number(weight_kg), notes: notes.trim() };
  const { data, error } = await req.supabase.from("pets").insert(payload).select("*").single();
  if (error) { console.error("Pet insert failed:", error.message); return res.status(500).json({ error: "Could not save this pet. Check your database setup." }); }
  res.status(201).json({ data });
});

router.delete("/:id", requireDatabase, async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: "Invalid pet ID." });
  const { error } = await req.supabase.from("pets").delete().eq("id", Number(req.params.id));
  if (error) { console.error("Pet delete failed:", error.message); return res.status(500).json({ error: "Could not delete this pet." }); }
  res.json({ message: "Pet and related care records deleted." });
});
module.exports = router;

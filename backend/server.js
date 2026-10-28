require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const supabase = require("./supabase");
const petRoutes = require("./routes/pets");
const recordRoutes = require("./routes/records");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Pet Care Log", databaseConfigured: Boolean(supabase) });
});
app.use("/api/pets", petRoutes);
app.use("/api/records", recordRoutes);

app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API endpoint not found." });
  res.status(404).send("Page not found.");
});
app.use((err, _req, res, _next) => {
  console.error("Request failed:", err.message);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

app.listen(port, () => console.log(`Pet Care Log running at http://localhost:${port}`));

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const HazardZone = require("../models/HazardZone");

// Get all hazard zones (public)
router.get("/", async (req, res) => {
  try {
    const zones = await HazardZone.find();
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create hazard zone (admin)
router.post("/", auth, async (req, res) => {
  try {
    const zone = await HazardZone.create(req.body);
    res.status(201).json(zone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update hazard zone (admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const zone = await HazardZone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(zone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete hazard zone (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    await HazardZone.findByIdAndDelete(req.params.id);
    res.json({ message: "Hazard zone deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

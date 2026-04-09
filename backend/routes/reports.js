const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Report = require("../models/Report");

// Create report (residents)
router.post("/", auth, async (req, res) => {
  try {
    const report = await Report.create({ ...req.body, userId: req.user.id });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all reports (admin)
router.get("/", auth, async (req, res) => {
  try {
    const reports = await Report.find().populate(
      "userId",
      "name email barangay",
    );
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update report status (admin)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/validated", async (req, res) => {
  try {
    const reports = await Report.find({ status: "validated" });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete report (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;

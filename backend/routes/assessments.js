const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Assessment = require("../models/Assessment");

// Submit assessment
router.post("/", auth, async (req, res) => {
  try {
    const assessment = await Assessment.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(assessment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get assessments (admin)
router.get("/", auth, async (req, res) => {
  try {
    const assessments = await Assessment.find().populate(
      "userId",
      "name email barangay",
    );
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const GoBagItem = require("../models/GoBagItem");

// Get all go bag items (public)
router.get("/", async (req, res) => {
  try {
    const items = await GoBagItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add go bag item (admin)
router.post("/", auth, async (req, res) => {
  try {
    const item = await GoBagItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete go bag item (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    await GoBagItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

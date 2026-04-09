const mongoose = require("mongoose");

const GoBagItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String },
    whyImportant: { type: String },
    forRiskLevel: { type: [String] },
    imageUrl: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GoBagItem", GoBagItemSchema);

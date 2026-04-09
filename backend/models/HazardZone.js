const mongoose = require("mongoose");

const HazardZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    riskLevel: {
      type: String,
      enum: ["low", "moderate", "high"],
      required: true,
    },
    coordinates: [{ lat: Number, lng: Number }],
    description: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("HazardZone", HazardZoneSchema);

const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, required: true },
    emoji: { type: String, default: "⚠️" },
    severity: {
      type: String,
      enum: ["low", "moderate", "high"],
      default: "moderate",
    },
    description: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String },
    },
    startLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    endLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "validated", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", ReportSchema);

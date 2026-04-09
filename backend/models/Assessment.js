const mongoose = require("mongoose");

const AssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: { type: Object, required: true },
    riskScore: { type: Number },
    riskLevel: { type: String, enum: ["low", "moderate", "high"] },
    recommendations: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assessment", AssessmentSchema);

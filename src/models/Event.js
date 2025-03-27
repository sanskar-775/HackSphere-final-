import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    opportunityTitle: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      required: true,
    },
    websiteUrl: String,
    festival: String,
    opportunityType: String,
    opportunitySubType: String,
    visibility: {
      type: String,
      enum: ["public", "invite-only"],
      default: "public",
    },
    startDate: Date,
    endDate: Date,
    categories: [String],
    skills: [String],
    aboutOpportunity: String,
    image: String, // If you're storing image as a URL or base64
    userEmail: String, // Optionally track who posted it
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);

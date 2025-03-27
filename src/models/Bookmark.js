import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  name: String,
  url: String,
  image: String,
  startDate: String,
  endDate: String,
  location: String,
  platform: String,
}, { timestamps: true });

export default mongoose.models.Bookmark || mongoose.model("Bookmark", BookmarkSchema);

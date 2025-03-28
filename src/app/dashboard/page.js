import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Bookmark from "@/models/Bookmark";
import EventCard from "@/components/EventCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Optional: Add a page title
export const metadata = {
  title: "Your Dashboard | HackSphere",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-xl font-medium">
        Please login to view your dashboard.
      </div>
    );
  }

  await dbConnect();

  const rawBookmarks = await Bookmark.find({ userEmail: session.user.email }).lean();

  // ✅ Format bookmarks to align with event card requirements
  const bookmarks = rawBookmarks
    .map((b) => ({
      id: b.eventId, // use eventId as the consistent id
      name: b.name,
      url: b.url,
      image: b.image,
      startDate: b.startDate,
      endDate: b.endDate,
      location: b.location,
      platform: b.platform,
    }))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // optional sort by start date

  return (
    <div className="min-h-screen bg-base-200 py-12 px-6">
      {/* 👤 User Info */}
      <div className="max-w-5xl mx-auto mb-10 text-center">
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="w-16 h-16">
            <AvatarImage src={session.user.image} alt={session.user.name} />
            <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">{session.user.name}</h1>
          <p className="text-gray-400 text-sm">{session.user.email}</p>
        </div>
      </div>

      {/* ❤️ Bookmarked Events */}
      <h2 className="text-2xl font-semibold text-center mb-6 glow-gradient-text">
        Your Bookmarked Events
        <span className="ml-2 text-base text-gray-400">({bookmarks.length})</span>
      </h2>

      {bookmarks.length === 0 ? (
        <p className="text-center text-gray-400">No events bookmarked yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {bookmarks.map((event) => (
            <EventCard key={event.id} event={event} showRemove />
          ))}
        </div>
      )}
    </div>
  );
}

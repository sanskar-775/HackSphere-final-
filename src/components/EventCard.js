"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, HeartOff, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function EventCard({ event, showRemove = false }) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(false);

  const platformColors = {
    "Hack Club": "bg-blue-600",
    Unstop: "bg-red-500",
    Devpost: "bg-green-500",
    User: "bg-gray-500",
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setBookmarked(saved.includes(event.id || event.eventId));
  }, [event.id, event.eventId]);

  const removeBookmark = async () => {
    try {
      await fetch(`/api/bookmark?eventId=${event.eventId}`, { method: "DELETE" });
      toast.success("Bookmark removed");
      window.location.reload();
    } catch (err) {
      toast.error("Failed to remove bookmark");
    }
  };

  const toggleBookmark = async () => {
    if (!session?.user) {
      toast.error("Please login to bookmark events.");
      return;
    }

    const eventId = event.id || event.eventId;

    try {
      if (bookmarked) {
        await fetch(`/api/bookmark?eventId=${eventId}`, { method: "DELETE" });
        localStorage.setItem("bookmarks", JSON.stringify(
          JSON.parse(localStorage.getItem("bookmarks") || "[]").filter(id => id !== eventId)
        ));
        setBookmarked(false);
        toast.success("Removed from bookmarks");
      } else {
        await fetch("/api/bookmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event }),
        });
        localStorage.setItem("bookmarks", JSON.stringify([
          ...new Set([...JSON.parse(localStorage.getItem("bookmarks") || "[]"), eventId])
        ]));
        setBookmarked(true);
        toast.success("Bookmarked!");
      }
    } catch (err) {
      toast.error("Failed to update bookmark");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 70, damping: 15 }}
      viewport={{ once: true }}
    >
      <Card className="relative bg-white/10 backdrop-blur-lg border border-white/10 shadow-md hover:shadow-2xl transition-transform hover:-translate-y-2 rounded-xl overflow-hidden">
        {/* Platform Tag */}
        <div className={`absolute top-3 left-3 text-white text-xs px-3 py-1 rounded-full ${platformColors[event.platform] || "bg-gray-600"}`}>
          {event.platform}
        </div>

        {/* Bookmark or Remove */}
        {showRemove ? (
          <button
            onClick={removeBookmark}
            className="absolute top-3 right-3 z-20 p-1 bg-black/40 rounded-full"
          >
            <X className="text-red-400 w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={toggleBookmark}
            className="absolute top-3 right-3 z-20 p-1 bg-black/40 rounded-full"
          >
            {bookmarked ? (
              <HeartOff className="text-red-500 w-5 h-5" />
            ) : (
              <Heart className="text-white w-5 h-5" />
            )}
          </button>
        )}

        {/* Card Content */}
        <Link href={event.url} target="_blank">
          <img
            src={event.image || "/placeholder.jpg"}
            alt={event.name}
            className="w-full h-40 object-cover rounded-t-lg"
          />
          <CardContent className="p-4 text-white">
            <h3 className="text-lg font-bold mb-1">{event.name}</h3>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Start:</span>{" "}
              {new Date(event.startDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium">End:</span>{" "}
              {new Date(event.endDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-300 truncate">
              <span className="font-medium">Location:</span> {event.location || "Online"}
            </p>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}

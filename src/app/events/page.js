"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import { toast } from "sonner";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recent");

  const sortOptions = [
    { value: "recent", label: "Recently Added" },
    { value: "start", label: "Start Date" },
    { value: "end", label: "End Date" },
  ];

  const platformOptions = ["All", "Hack Club", "Unstop", "Devpost", "User"];

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const res = await fetch("/api/fetch-events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        toast.error("Failed to load events.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvents();
  }, []);

  const filteredEvents = events
    .filter((event) =>
      event.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((event) =>
      platformFilter === "All" ? true : event.platform === platformFilter
    )
    .sort((a, b) => {
      if (sortBy === "start") {
        return new Date(a.startDate) - new Date(b.startDate);
      } else if (sortBy === "end") {
        return new Date(a.endDate) - new Date(b.endDate);
      } else {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

  return (
    <div className="min-h-screen bg-base-200 py-10 px-6">
      <h1 className="text-3xl font-bold text-center mb-6 glow-gradient-text">Explore Hackathons</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search events..."
          className="input input-bordered w-full md:max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="select select-bordered w-full md:w-48"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by: {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {platformOptions.map((platform) => (
          <button
            key={platform}
            onClick={() => setPlatformFilter(platform)}
            className={`px-4 py-1 rounded-full border text-sm transition-all ${
              platformFilter === platform
                ? "bg-primary text-white border-primary"
                : "bg-white/10 text-gray-300 border-gray-600 hover:bg-primary/10"
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {/* Event Cards or Loader */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonEventCard key={idx} />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <p className="text-center text-gray-400">No events match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id || event.eventId} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

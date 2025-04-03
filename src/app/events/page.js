"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession, signIn } from "next-auth/react"; // Using useSession hook from next-auth
import { toast } from "sonner";

// Dynamically import components
const EventCard = dynamic(() => import("@/components/EventCard"), { ssr: false });
const SkeletonEventCard = dynamic(() => import("@/components/SkeletonEventCard"), { ssr: false });

export default function EventsPage() {
  const { data: session, status } = useSession(); // Get session data using useSession
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 12;

  const sortOptions = [
    { value: "recent", label: "Recently Added" },
    { value: "start", label: "Start Date" },
    { value: "end", label: "End Date" },
  ];

  const platformOptions = ["All", "Hack Club", "Unstop", "Devpost", "User"];

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Wait for the session to load
    if (!session) {
      toast.error("You must be logged in to access the events page.");
      signIn("google"); // Redirect to login if not authenticated
    }
  }, [session, status]);

  // Fetch events once the session is authenticated
  useEffect(() => {
    if (session) {
      setMounted(true);
      fetchEvents();
    }
  }, [session]);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/fetch-events?page=1&limit=100"); // Large batch
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      toast.error("Failed to load events.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || status === "loading") return null;

  // Apply filters and sorting
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

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="select select-bordered w-full md:w-48"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by: {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Platform Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {platformOptions.map((platform) => (
          <button
            key={platform}
            onClick={() => {
              setPlatformFilter(platform);
              setCurrentPage(1);
            }}
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

      {/* Event Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonEventCard key={idx} />
          ))}
        </div>
      ) : paginatedEvents.length === 0 ? (
        <p className="text-center text-gray-400">No events match your filters.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => changePage(currentPage - 1)}
              className="btn btn-sm"
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => changePage(pageNum)}
                  className={`btn btn-sm ${
                    currentPage === pageNum ? "btn-primary" : "btn-outline"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => changePage(currentPage + 1)}
              className="btn btn-sm"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

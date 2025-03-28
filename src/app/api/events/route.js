import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;

    const [hackclubRes, unstopRes, devpostRes, localEvents] = await Promise.all([
      fetch("https://hackathons.hackclub.com/api/events/upcoming").then(res => res.json()),
      fetch("https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&page=1&oppstatus=open&quickApply=true").then(res => res.json()),
      fetch("https://devpost.com/api/hackathons?page=1").then(res => res.json()),
      Event.find().lean(),
    ]);

    const hackclubFormatted = hackclubRes.map((e) => ({
      id: `hackclub-${e.id}`,
      name: e.name,
      url: e.website,
      startDate: e.start,
      endDate: e.end,
      platform: "Hack Club",
      location: e.location || "Online",
      image: e.banner,
      createdAt: new Date(e.start),
    }));

    const unstopFormatted = unstopRes.data.data.map((e) => ({
      id: `unstop-${e.id}`,
      name: e.title,
      url: "https://unstop.com/" + e.public_url,
      startDate: e.start_date,
      endDate: e.end_date,
      platform: "Unstop",
      location: e.location || "Online",
      image: e.banner_mobile?.image_url,
      createdAt: new Date(e.start_date),
    }));

    const devpostFormatted = devpostRes.hackathons.map((e) => ({
      id: `devpost-${e.id}`,
      name: e.title,
      url: e.url,
      startDate: e.submission_period_dates,
      endDate: e.time_left_to_submission,
      platform: "Devpost",
      location: e.location || "Online",
      image: "https://" + e.thumbnail_url,
      createdAt: new Date(), // Devpost has no true start date
    }));

    const localFormatted = localEvents.map((e) => ({
      id: `user-${e._id.toString()}`,
      name: e.opportunityTitle,
      url: e.websiteUrl || "#",
      startDate: e.startDate,
      endDate: e.endDate,
      platform: e.opportunityType || "User",
      location: e.location || "Unknown",
      image: e.image || "/global.jpg",
      createdAt: e.createdAt || new Date(),
    }));

    const allEvents = [...hackclubFormatted, ...unstopFormatted, ...devpostFormatted, ...localFormatted];

    // Sort by createdAt (most recent first)
    allEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const paginated = allEvents.slice(startIdx, endIdx);

    return NextResponse.json(paginated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

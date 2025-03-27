import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET() {
  try {
    await dbConnect();

    const [hackclubRes, unstopRes, devpostRes, localEvents] = await Promise.all([
      fetch("https://hackathons.hackclub.com/api/events/upcoming").then(res => res.json()),
      fetch("https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&page=1&oppstatus=open&quickApply=true").then(res => res.json()),
      fetch("https://devpost.com/api/hackathons?page=1").then(res => res.json()),
      Event.find().lean(),
    ]);

    const hackclubFormatted = hackclubRes.map((e) => ({
      id: e.id,
      name: e.name,
      url: e.website,
      startDate: e.start,
      endDate: e.end,
      platform: "Hack Club",
      location: e.location || "Online",
      image: e.banner,
    }));

    const unstopFormatted = unstopRes.data.data.map((e) => ({
      id: e.id,
      name: e.title,
      url: "https://unstop.com/" + e.public_url,
      startDate: e.start_date,
      endDate: e.end_date,
      platform: "Unstop",
      location: e.location || "Online",
      image: e.banner_mobile?.image_url,
    }));
    
      const devpostFormatted = devpostRes.hackathons.map((e) => ({
        id: e.id,
        name: e.title,
        url: e.url,
        startDate: e.submission_period_dates, // formatted range like "Mar 05 - Apr 30, 2025"
        endDate: e.time_left_to_submission,   // e.g., "about 1 month left"
        platform: "Devpost",
        location: e.location || "Online",
        image: "https://" + e.thumbnail_url,
      }));

    const localFormatted = localEvents.map((e) => ({
      id: e._id.toString(),
      name: e.opportunityTitle,
      url: e.websiteUrl || "#",
      startDate: e.startDate,
      endDate: e.endDate,
      platform: e.opportunityType || "User",
      location: e.location || "Unknown",
      image: e.image || "/global.jpg",
    }));

    const allEvents = [...hackclubFormatted, ...unstopFormatted, ...devpostFormatted, ...localFormatted];

    return NextResponse.json(allEvents);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

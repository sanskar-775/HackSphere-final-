import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    // Fetch data from all sources in parallel
    const [externalEvents, localEvents] = await Promise.all([
      Promise.all([
        fetch("https://hackathons.hackclub.com/api/events/upcoming").then(res => res.json()),
        fetch("https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&page=1&oppstatus=open&quickApply=true").then(res => res.json()),
        fetch("https://devpost.com/api/hackathons?page=1").then(res => res.json())
      ]),
      Event.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    // Format external events
    const [hackclubRes, unstopRes, devpostRes] = externalEvents;
    
    const hackclubFormatted = hackclubRes?.map((e) => ({
      id: `hackclub-${e.id}`,
      name: e.name,
      url: e.website,
      startDate: e.start,
      endDate: e.end,
      platform: "Hack Club",
      location: e.location || "Online",
      image: e.banner,
      createdAt: new Date(e.start),
      source: "external"
    })) || [];

    const unstopFormatted = unstopRes?.data?.data?.map((e) => ({
      id: `unstop-${e.id}`,
      name: e.title,
      url: "https://unstop.com/" + e.public_url,
      startDate: e.start_date,
      endDate: e.end_date,
      platform: "Unstop",
      location: e.location || "Online",
      image: e.banner_mobile?.image_url,
      createdAt: new Date(e.start_date),
      source: "external"
    })) || [];

    const devpostFormatted = devpostRes?.hackathons?.map((e) => ({
      id: `devpost-${e.id}`,
      name: e.title,
      url: e.url,
      startDate: e.submission_period_dates,
      endDate: e.time_left_to_submission,
      platform: "Devpost",
      location: e.location || "Online",
      image: "https://" + e.thumbnail_url,
      createdAt: new Date(),
      source: "external"
    })) || [];

    // Format local events with all host page fields
    const localFormatted = localEvents.map((e) => ({
      id: `user-${e._id.toString()}`,
      name: e.opportunityTitle,
      url: e.websiteUrl || "#",
      startDate: e.startDate,
      endDate: e.endDate,
      registrationDeadline: e.registrationDeadline,
      platform: e.opportunityType || "User",
      location: e.location || "Online",
      image: e.opportunityLogo?.url || "/default-event.png",
      categories: e.categories,
      skills: e.skills,
      about: e.aboutOpportunity,
      maxTeams: e.maxTeams,
      teamSize: e.teamSize,
      prizes: e.prizes,
      rules: e.rules,
      visibility: e.visibility,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      source: "local"
    }));

    // Combine all events
    const allEvents = [
      ...localFormatted, // Local events first
      ...hackclubFormatted,
      ...unstopFormatted,
      ...devpostFormatted
    ];

    return NextResponse.json({
      data: allEvents,
      pagination: {
        page,
        limit,
        total: allEvents.length,
        totalPages: Math.ceil(allEvents.length / limit)
      }
    });

  } catch (err) {
    console.error("Event fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch events", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());

    // Validate required fields
    const requiredFields = [
      'opportunityTitle',
      'organization',
      'startDate',
      'endDate',
      'aboutOpportunity'
    ];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Process file upload or use default image
    const file = formData.get("opportunityLogo"); // Changed from "file" to match your form field name
    let imageData = null;
    
    if (file && file.size > 0) {
      // Basic validation for image file
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: "Only image files are allowed" },
          { status: 400 }
        );
      }

      // In production, you would upload to Cloudinary/S3/etc.
      // For now, we'll just reference the default image
      imageData = {
        url: "/hacka.png", // Default image path in public folder
        publicId: "default_hacka",
        isDefault: true // Flag to indicate this is the default image
      };
      
      // In production, you would replace the above with actual upload code:
      // const uploadResult = await uploadToCloudinary(file);
      // imageData = {
      //   url: uploadResult.secure_url,
      //   publicId: uploadResult.public_id
      // };
    } else {
      // Use default image if no file was uploaded
      imageData = {
        url: "/hacka.png",
        publicId: "default_hacka",
        isDefault: true
      };
    }

    // Parse array fields safely
    const parseArrayField = (field) => {
      try {
        return field ? JSON.parse(field) : [];
      } catch {
        return [];
      }
    };

    // Create new event with all host page fields
    const newEvent = new Event({
      ...data,
      opportunityLogo: imageData,
      categories: parseArrayField(data.categories),
      skills: parseArrayField(data.skills),
      timeline: parseArrayField(data.timeline),
      maxTeams: data.maxTeams ? parseInt(data.maxTeams) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newEvent.save();

    return NextResponse.json({
      success: true,
      event: {
        id: newEvent._id.toString(),
        name: newEvent.opportunityTitle,
        url: newEvent.websiteUrl || "#",
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
        image: newEvent.opportunityLogo?.url || "/hacka.png", // Ensure image URL
        categories: newEvent.categories,
        skills: newEvent.skills,
        about: newEvent.aboutOpportunity,
        // Include all other relevant fields
        ...newEvent.toObject()
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create event",
        details: process.env.NODE_ENV === "development" ? error.message : "Please try again later"
      },
      { status: 500 }
    );
  }
}
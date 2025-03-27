import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Bookmark from "@/models/Bookmark";
import dbConnect from "@/lib/db";

export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { event } = body;

  const exists = await Bookmark.findOne({ userEmail: session.user.email, eventId: event.id });

  if (exists) {
    return NextResponse.json({ message: "Already bookmarked" }, { status: 200 });
  }

  const bookmark = await Bookmark.create({
    userEmail: session.user.email,
    ...event,
    eventId: event.id,
  });

  return NextResponse.json(bookmark, { status: 201 });
}

export async function DELETE(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  await Bookmark.deleteOne({ userEmail: session.user.email, eventId });
  return NextResponse.json({ message: "Bookmark removed" }, { status: 200 });
}

import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    const formData = await req.formData();

    // Upload image if exists
    let uploadedImageUrl = "";
    const file = formData.get("file");

    if (file && typeof file === "object") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "hacksphere-events" }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          })
          .end(buffer);
      });

      uploadedImageUrl = uploadRes.secure_url;
    }

    const newEvent = new Event({
      userId: session.user.email,
      opportunityLogo: uploadedImageUrl,
      opportunityType: formData.get("opportunityType"),
      opportunitySubType: formData.get("opportunitySubType"),
      visibility: formData.get("visibility"),
      opportunityTitle: formData.get("opportunityTitle"),
      organization: formData.get("organization"),
      websiteUrl: formData.get("websiteUrl"),
      festival: formData.get("festival"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      categories: JSON.parse(formData.get("categories") || "[]"),
      skills: JSON.parse(formData.get("skills") || "[]"),
      aboutOpportunity: formData.get("aboutOpportunity"),
    });

    await newEvent.save();

    return new Response(JSON.stringify({ success: true, eventId: newEvent._id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Event submission error:", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

"use client";
import { CldImage } from "next-cloudinary";

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <CldImage
        src="cld-sample-5" // Replace with your own Cloudinary public ID
        width={500}
        height={500}
        crop="fill" // Or "thumb", "crop", etc.
        alt="Sample Cloudinary Image"
      />
    </div>
  );
}

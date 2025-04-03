"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import HostForm from "@/components/HostForm"; // Adjust the import path as necessary

export default function HostPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("You must be logged in to host an event.");
      signIn("google");
    }
  }, [status]);

  if (status !== "authenticated") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Host Your Hackathon</h1>
          <p className="mt-4 text-xl text-gray-600">Fill in the details to create your hackathon event</p>
        </div>
        <HostForm />
      </div>
    </div>
  );
}
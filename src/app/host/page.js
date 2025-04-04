"use client";

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import HostForm from "@/components/HostForm";

export default function HostPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("You must be logged in to host an event.");
      signIn("google");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <p className="text-lg animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 py-16 px-6 sm:px-10 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Host Your Hackathon</h1>
          <p className="mt-3 text-lg text-blue-300">Fill in the details to create your hackathon event</p>
        </div>
        <div className="bg-gray-900/80 p-8 rounded-xl shadow-2xl border border-gray-800 backdrop-blur-lg">
          <HostForm />
        </div>
      </div>
    </div>
  );
}

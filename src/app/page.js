"use client";

import dynamic from "next/dynamic";

// Dynamically import client-heavy components
const Earth = dynamic(() => import("@/components/Earth"), { ssr: false });
const HackathonFlow = dynamic(() => import("@/components/HackathonFlow"), { ssr: false });
const RainingLetters = dynamic(() => import("@/components/ui/RainingLetters"), { ssr: false });
import { useState, useEffect } from "react";

export default function Home() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) return null; // or a loading skeleton later

    return (
        <main className="min-h-screen bg-black flex flex-col items-center text-center p-6">
            {/* Hero Section with 3D Earth */}
            <section className="relative w-full h-[500px] sm:h-[600px] flex items-center justify-center">
                <Earth className="w-full h-full" />

                {/* Hero Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 py-8 z-10 pointer-events-none">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold drop-shadow-lg glow-gradient-text text-center">
                        HackSphere
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mt-4 max-w-xl mx-auto">
                        Discover & Participate in the Best Hackathons Around the World!
                    </p>
                    <div className="mt-6">
                        <button className="btn btn-primary pointer-events-auto">
                            Explore Events
                        </button>
                    </div>
                </div>
            </section>

            {/* Hackathon Flow Section */}
            <section className="w-full mt-20 px-4 sm:px-8 md:px-16">
                <HackathonFlow />
                <RainingLetters />
            </section>
        </main>
    );
}

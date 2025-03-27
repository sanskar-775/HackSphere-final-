"use client";

import Earth from "@/components/Earth";
import HackathonFlow from "@/components/HackathonFlow";
import dynamic from "next/dynamic";

const RainingLetters = dynamic(() => import("@/components/ui/RainingLetters"), { ssr: false });


export default function Home() {
    return (
        <main className="min-h-screen bg-black flex flex-col items-center text-center p-6">
            
            {/* Hero Section with 3D Earth */}
            <section className="relative w-full h-[600px] flex items-center justify-center">
                <Earth />
                
                {/* Hero Text Overlay - Centered Inside Earth */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 py-8 z-10 pointer-events-none">
                    <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg glow-gradient-text text-center">
                       HackSphere
                    </h1>
                    <p className="text-lg text-gray-300 mt-4 max-w-xl">
                        Discover & Participate in the Best Hackathons Around the World!
                    </p>
                    <div className="mt-6">
                        <button className="btn btn-primary pointer-events-auto">Explore Events</button>
                    </div>
                </div>
            </section>

            {/* Hackathon Flow Section */}
            <section className="w-full mt-20">
                <HackathonFlow />
                <RainingLetters/>
            </section>

        </main>
    );
}

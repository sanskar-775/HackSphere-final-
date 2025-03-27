"use client";

import { motion } from "framer-motion";
import {
  GlobeAmericasIcon,
  CodeBracketIcon,
  ClockIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import BackgroundPaths from "@/components/ui/FloatingBackground";

export default function AboutPage() {
  const title = "HackSphere";

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundPaths />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 tracking-tight">
            {title.split(" ").map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Revolutionizing the way we hack! Stay tuned for something amazing.
          </p>
          <div className="animate-pulse text-yellow-400 flex items-center justify-center gap-2">
            <ClockIcon className="w-6 h-6" />
            <span className="text-lg">Status: Under Development</span>
          </div>
        </div>

        {/* What is HackSphere */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <GlobeAmericasIcon className="w-8 h-8 text-blue-400" />
            What is HackSphere?
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            HackSphere is a dynamic global platform that aggregates and showcases upcoming hackathons worldwide.
            We serve as the ultimate hub where developers, designers, and innovators can explore, register,
            and stay updated with hackathons across multiple platforms.
          </p>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <CodeBracketIcon className="w-8 h-8 text-green-400" />
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: GlobeAmericasIcon,
                color: "text-blue-400",
                title: "3D Earth Visualization",
                text: "Interactive globe visualization using Three.js & GSAP",
              },
              {
                icon: ClockIcon,
                color: "text-purple-400",
                title: "Live Listings",
                text: "Real-time updates from multiple sources (Devpost, Unstop, etc.)",
              },
              {
                icon: UserCircleIcon,
                color: "text-pink-400",
                title: "User System",
                text: "Secure login for users and organizers with admin panel",
              },
              {
                icon: EnvelopeIcon,
                color: "text-yellow-400",
                title: "Notifications",
                text: "Email alerts for registered events and updates",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
              >
                <feature.icon className={`w-10 h-10 mb-4 ${feature.color}`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">🚀 Powered By</h2>
          <div className="flex flex-wrap gap-4">
            {[
              "Next.js",
              "Three.js",
              "Tailwind CSS",
              "GSAP",
              "Hack Club Hackathons API",
              "Unstop API",
              "daisyUI",
              "ShadCN",
              "mongoose",
              "Framer Motion",
              "MongoDB",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-slate-800 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center border-t border-slate-700 pt-16">
          <p className="text-xl mb-8">
            Follow our progress and star the repository to stay updated!
          </p>
          <Link
            href="https://github.com/sanskar-775/HackSphere"
            target="_blank"
            className="btn btn-outline px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            View on GitHub
          </Link>
        </div>
      </div>
    </div>
  );
}

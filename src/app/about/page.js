"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  GlobeAmericasIcon,
  CodeBracketIcon,
  ClockIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

// Dynamically load SVG background
const BackgroundPaths = dynamic(() => import("@/components/ui/FloatingBackground"), {
  ssr: false,
});

export default function AboutPage() {
  const title = "HackSphere";

  const features = [
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
  ];

  const techStack = [
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
  ];

  const contributors = [
    {
      name: "Sanskar Sharma",
      role: "Developer",
      avatar: "https://github.com/sanskar-775.png",
      github: "https://github.com/sanskar-775",
      linkedin: "https://www.linkedin.com/in/sanskar-sharma-815aa9293",
    },
    {
      name: "Tanay Kaushal",
      role: "Developer",
      avatar: "https://github.com/code1fun1.png",
      github: "https://github.com/code1fun1",
      linkedin: "https://www.linkedin.com/in/tanay-kaushal-44b680253/",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Floating SVG Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundPaths />
      </div>

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
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
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

        {/* What is HackSphere Section */}
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

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <CodeBracketIcon className="w-8 h-8 text-green-400" />
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
              >
                <feature.icon className={`w-10 h-10 mb-4 ${feature.color}`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">🚀 Powered By</h2>
          <div className="flex flex-wrap gap-4">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-slate-800 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Contributors Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">🧑‍💻 Contributors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {contributors.map((person, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-slate-800 rounded-xl p-6 text-center hover:shadow-xl hover:scale-105 transition-all"
              >
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image
                    src={person.avatar}
                    alt={person.name}
                    fill
                    sizes="80px"
                    className="rounded-full border-4 border-slate-700 object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold">{person.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{person.role}</p>
                <div className="flex justify-center gap-4 text-sm">
                  {person.github && (
                    <a
                      href={person.github}
                      target="_blank"
                      className="text-blue-400 hover:underline"
                    >
                      GitHub ↗
                    </a>
                  )}
                  {person.linkedin && (
                    <a
                      href={person.linkedin}
                      target="_blank"
                      className="text-blue-300 hover:underline"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* GitHub CTA */}
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

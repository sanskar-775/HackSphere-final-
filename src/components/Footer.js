import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-10 px-6 md:px-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Logo & Navigation */}
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h2 className="text-2xl font-bold text-blue-500">HackSphere</h2>
          <nav className="mt-2 space-x-4">
            <Link href="/" className="hover:text-blue-400">Home</Link>
            <Link href="/events" className="hover:text-blue-400">Events</Link>
            <Link href="/about" className="hover:text-blue-400">About</Link>
            <Link href="/host" className="hover:text-blue-400">Host</Link>
          </nav>
        </div>
        
        {/* Newsletter Signup */}
        <div className="mb-6 md:mb-0">
          <h3 className="text-lg font-semibold">Subscribe to our Newsletter</h3>
          <div className="flex mt-2">
            <Input type="email" placeholder="Enter your email" className="w-full max-w-xs" />
            <Button className="ml-2 bg-blue-500 hover:bg-blue-600">Subscribe</Button>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-6">
          <a href="#" className="text-xl hover:text-blue-400">
            <FaGithub />
          </a>
          <a href="#" className="text-xl hover:text-blue-400">
            <FaTwitter />
          </a>
          <a href="#" className="text-xl hover:text-blue-400">
            <FaLinkedin />
          </a>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="text-center text-gray-500 mt-6">
        &copy; {new Date().getFullYear()} HackSphere. All rights reserved.
      </div>
    </footer>
  );
}

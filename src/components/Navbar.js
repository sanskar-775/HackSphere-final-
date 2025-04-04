"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react"; // Correct import for NextAuth.js session
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { gsap } from "gsap";

export default function Navbar() {
    const { data: session } = useSession(); // Get session data
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter(); // Next.js router for navigation
    useEffect(() => {

        // Preload routes (pages) dynamically
        const preloadPages = () => {
            if (window.location.pathname !== '/events') {
                import('@/app/events/page');
            }
            if (window.location.pathname !== '/about') {
                import('@/app/about/page');
            }
            if (window.location.pathname !== '/host') {
                import('@/app/host/page');
            }
        };

        preloadPages(); // Call preload when Navbar loads
    }, []);
    useEffect(() => {
        function breakTheText() {
            let h2 = document.querySelector("h2");
            if (!h2) return;
            
            let h2Text = h2.textContent;
            let splittedText = h2Text.split("");
            let halfIndex = Math.floor(splittedText.length / 2);
            let clutter = "";

            splittedText.forEach((letter, idx) => {
                if (idx <= halfIndex) {
                    clutter += `<span class="a">${letter}</span>`;
                } else {
                    clutter += `<span class="b">${letter}</span>`;
                }
            });

            h2.innerHTML = clutter;
        }

        breakTheText();

        gsap.from("h2 .a", {
            y: 70,
            duration: 1,
            delay: 0.3,
            opacity: 0,
            stagger: 0.15,
        });

        gsap.from("h2 .b", {
            y: 70,
            duration: 1,
            delay: 0.3,
            opacity: 0,
            stagger: -0.15,
        });
    }, []);

    return (
        <nav className="fixed top-0 left-0 w-full bg-black/30 dark:bg-gray-900/30 backdrop-blur-lg shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold text-primary">
                        <h2>HackSphere</h2>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-6 items-center">
                        {/* Redirect to Login if Not Authenticated */}
                        <button
                            className="text-gray-300 hover:text-cyan-800 nav-link"
                            onClick={() => {
                                if (session) {
                                    router.push("/events");
                                } else {
                                    router.push("/auth/login");
                                }
                            }}
                        >
                            Events
                        </button>
                        <Link href="/about" className="text-gray-300 hover:text-cyan-800 nav-link">
                            About
                        </Link>

                        {/* Conditional Rendering of Host Link */}
                        {session && (
                            <Link href="/host" className="text-gray-300 hover:text-cyan-400 nav-link">
                                Host
                            </Link>
                        )}

                        {/* Authentication */}
                        {session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="cursor-pointer">
                                        <AvatarImage src={session.user?.image || "/default-avatar.png"} alt="User Avatar" />
                                        <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                                    <DropdownMenuItem>
                                        <span className="text-gray-900 dark:text-white">{session.user?.name}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href="/dashboard">Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/auth/login">
                                <Button variant="outline" className="text-gray-300 hover:text-primary">
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                                {/* Redirect to Login if Not Authenticated */}
                                <DropdownMenuItem asChild>
                                    <button
                                        onClick={() => {
                                            if (session) {
                                                router.push("/events");
                                            } else {
                                                router.push("/auth/login");
                                            }
                                        }}
                                    >
                                        Events
                                    </button>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/about">About</Link>
                                </DropdownMenuItem>

                                {/* Conditional Rendering of Host Link in Mobile */}
                                {session && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/host">Host</Link>
                                    </DropdownMenuItem>
                                )}

                                {session ? (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard">Dashboard</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Logout</DropdownMenuItem>
                                    </>
                                ) : (
                                    <DropdownMenuItem asChild>
                                        <Link href="/auth/login">Login</Link>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react"; // Correct import for NextAuth.js session
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Moon, Sun } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
    const { data: session } = useSession(); // Get session data
    const [isOpen, setIsOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
        setDarkMode(savedTheme === "dark");
    }, []);

    const toggleDarkMode = () => {
        const newTheme = darkMode ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        setDarkMode(!darkMode);
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-black/30 dark:bg-gray-900/30 backdrop-blur-lg shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold text-primary">
                        HackSphere
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <Link href="/events" className="text-gray-300 hover:text-primary">
                            Events
                        </Link>
                        <Link href="/about" className="text-gray-300 hover:text-primary">
                            About
                        </Link>

                        {/* Conditional Rendering of Host Link */}
                        {session?.user && (
                            <Link href="/host" className="text-gray-300 hover:text-primary">
                                Host
                            </Link>
                        )}

                        {/* Authentication */}
                        {session?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="cursor-pointer">
                                        <AvatarImage src={session.user.image || "/default-avatar.png"} alt="User Avatar" />
                                        <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                                    <DropdownMenuItem>
                                        <span className="text-gray-900 dark:text-white">{session.user.name}</span>
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
                            <Button
                                variant="outline"
                                onClick={() => signIn("google", { callbackUrl: "/" })}
                                className="text-gray-300 hover:text-primary"
                            >
                                Login
                            </Button>
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
                                <DropdownMenuItem asChild>
                                    <Link href="/events">Events</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/about">About</Link>
                                </DropdownMenuItem>

                                {/* Conditional Rendering of Host Link in Mobile */}
                                {session?.user && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/host">Host</Link>
                                    </DropdownMenuItem>
                                )}

                                {session?.user ? (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard">Dashboard</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Logout</DropdownMenuItem>
                                    </>
                                ) : (
                                    <DropdownMenuItem onClick={() => signIn(undefined, { callbackUrl: "/" })}>
                                        Login
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

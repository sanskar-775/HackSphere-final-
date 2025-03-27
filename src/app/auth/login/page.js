"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await signIn("credentials", {
      redirect: false,
      email: e.target.email.value,
      password: e.target.password.value,
    });

    setLoading(false);

    if (res?.error) {
      alert(res.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-lg w-96">
        <h2 className="text-white text-2xl mb-4">Login</h2>
        <Input name="email" type="email" placeholder="Email" required className="mb-4" />
        <Input name="password" type="password" placeholder="Password" required className="mb-4" />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <Button className="mt-4" onClick={() => signIn("google")}>
        Sign in with Google
      </Button>
    </div>
  );
}

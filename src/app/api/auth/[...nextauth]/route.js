import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        try {
          console.log("🔍 Attempting to authenticate:", credentials.email);
          
          // Ensure credentials are provided
          if (!credentials?.email || !credentials?.password) {
            console.error("❌ Missing credentials");
            throw new Error("Missing email or password");
          }

          await dbConnect();

          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            console.error("❌ User not found:", credentials.email);
            throw new Error("User not found");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.error("❌ Invalid password for:", credentials.email);
            throw new Error("Invalid password");
          }

          console.log("✅ User authenticated:", user.email);
          return user;
        } catch (error) {
          console.error("❌ Authorization error:", error.message);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user._id;
      }
      return token;
    },
  },
};

console.log("🛠️ NextAuth API Route Initialized");
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in .env.local");
}

export const authConfig: NextAuthConfig = {
  providers: [
    // Admin / Staff login
    Credentials({
      id: "email-password",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email?: string; password?: string };

        if (!email || !password) throw new Error("Missing credentials");

        const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });

        if (!user) throw new Error("User not found");
        if (!["ADMIN", "STAFF"].includes(user.role)) throw new Error("Unauthorized role");
        if (!user.passwordHash) throw new Error("No password set");

        const isValid = await bcrypt.compare(password.trim(), user.passwordHash);
        if (!isValid) throw new Error("Invalid credentials");

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),

    // Student login
    Credentials({
      id: "student-login",
      name: "Student Login",
      credentials: {
        aadharNo: { label: "Aadhar Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { aadharNo, password } = credentials as { aadharNo?: string; password?: string };

        if (!aadharNo || !password) throw new Error("Missing credentials");

        const user = await db.user.findUnique({ where: { adharNo: aadharNo.trim() } });

        if (!user) throw new Error("Student not found");
        if (user.role !== "STUDENT") throw new Error("Unauthorized role");
        if (!user.passwordHash) throw new Error("No password set");

        const isValid = await bcrypt.compare(password.trim(), user.passwordHash);
        if (!isValid) throw new Error("Invalid password");

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
};

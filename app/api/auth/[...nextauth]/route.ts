import NextAuth, { type AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in env");
}

export const authConfig: AuthOptions = {
  adapter: PrismaAdapter(db),

  session: {
    strategy: "jwt", // <- database sessions allow multiple logins in the same browser
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    // Admin & Staff login
    Credentials({
      id: "email-password",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};
        if (!email || !password) throw new Error("Missing credentials");

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (!user) throw new Error("User not found");
        if (!user.passwordHash) throw new Error("User has no password set");
        if (!["ADMIN", "STAFF"].includes(user.role))
          throw new Error("Unauthorized role");

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) throw new Error("Invalid credentials");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
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
        const { aadharNo, password } = credentials ?? {};
        if (!aadharNo || !password) throw new Error("Missing credentials");

        const user = await db.user.findUnique({
          where: { adharNo: aadharNo.trim() },
        });

        if (!user) throw new Error("Student not found");
        if (user.role !== "STUDENT") throw new Error("Unauthorized role");
        if (!user.passwordHash) throw new Error("User has no password set");

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
};

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };

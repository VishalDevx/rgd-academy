// lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { type AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },

  providers: [
    Credentials({
      id: "email-password",
      name: "Email & Password",
      credentials: { email: { label: "Email", type: "text" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) throw new Error("Missing credentials");

        const user = await db.user.findUnique({ where: { email } });
        if (!user) throw new Error("User not found");
        if (!user.passwordHash) throw new Error("Password not set");
        if (!["ADMIN", "STAFF"].includes(user.role)) throw new Error("Unauthorized role");

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) throw new Error("Invalid credentials");

        return { id: user.id, name: user.name, email: user.email, role: user.role as "ADMIN" | "STAFF" };
      },
    }),
    // Add student credentials provider here if needed
  ],
};

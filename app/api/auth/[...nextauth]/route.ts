// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // use bcryptjs (lighter, better for serverless)
import { db } from "@/lib/prisma"; // must exist

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ✅ Strong runtime validation
        const email = (credentials?.email as string | undefined)?.trim();
        const password = (credentials?.password as string | undefined)?.trim();

        if (!email || !password) throw new Error("Missing credentials");

        // ✅ Query the user from Prisma
        const user = await db.user.findUnique({ where: { email } });
        if (!user) throw new Error("User not found");

        const isValid =
          user.passwordHash &&
          (await bcrypt.compare(password, user.passwordHash));
        if (!user || !user.passwordHash) throw new Error("Invalid credentials");

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

  session: {
    strategy: "jwt" as const, // ✅ Fix: proper literal type
  },

  secret: process.env.NEXTAUTH_SECRET,

callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role; // add role to JWT
    }
    return token;
  },
  async session({ session, token }) {
    if (token && session.user) {
      session.user.role = token.role as string;
    }
    return session;
  },
}

};

// ✅ Correct NextAuth v5 export pattern
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export const GET = handlers.GET;
export const POST = handlers.POST;

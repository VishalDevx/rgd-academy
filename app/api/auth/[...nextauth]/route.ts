import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";

const authConfig: NextAuthConfig = {
  providers: [
    // ✅ Admin / Staff Login (email + password)
    Credentials({
      id: "email-password",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim()?.toLowerCase();
        const password = (credentials?.password as string | undefined)?.trim();

        if (!email || !password) throw new Error("Missing credentials");

        const user = await db.user.findUnique({ where: { email } });
        if (!user) throw new Error("User not found");
        if (!user.passwordHash) throw new Error("User has no password set");

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) throw new Error("Invalid credentials");

        if (!["ADMIN", "STAFF"].includes(user.role)) {
          throw new Error("Unauthorized role");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    // ✅ Student Login (Aadhar + Password)
    Credentials({
      id: "student-login",
      name: "Student Login",
      credentials: {
        adharNo: { label: "Aadhar Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adharNo = (credentials?.adharNo as string | undefined)?.trim();
        const password = (credentials?.password as string | undefined)?.trim();

        if (!adharNo || !password) throw new Error("Missing credentials");

        const user = await db.user.findUnique({ where: { adharNo } });
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

  session: {
    strategy: "jwt",
  },

  // 👇 Add this block here
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: undefined, // session ends when browser closes
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET as string,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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


// ✅ added: NextAuth handler + exports for signIn / signOut usage
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const GET = handlers.GET;
export const POST = handlers.POST;

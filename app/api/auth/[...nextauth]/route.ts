
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in env");
} 


 export const authConfig: NextAuthConfig = {
  
  providers: [
    // ADMIN / STAFF LOGIN
    Credentials({
      id: "email-password",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email?: string;
          password?: string;
        };

        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedPassword = password?.trim();

        if (!normalizedEmail || !normalizedPassword) {
          throw new Error("Missing credentials");
        }

        const user = await db.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) throw new Error("User not found");
        if (!user.passwordHash) throw new Error("User has no password set");
        if (!["ADMIN", "STAFF"].includes(user.role)) throw new Error("Unauthorized role");

        const isValid = await bcrypt.compare(normalizedPassword, user.passwordHash);
        if (!isValid) throw new Error("Invalid credentials");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    // STUDENT LOGIN
    Credentials({
      id: "student-login",
      name: "Student Login",
      credentials: {
        aadharNo: { label: "Aadhar Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { aadharNo, password } = credentials as {
          aadharNo?: string;
          password?: string;
        };

        const normalizedAadhar = aadharNo?.trim();
        const normalizedPassword = password?.trim();

        if (!normalizedAadhar || !normalizedPassword) {
          throw new Error("Missing credentials");
        }

        const user = await db.user.findUnique({ where: { adharNo: normalizedAadhar } });
        if (!user) throw new Error("Student not found");
        if (user.role !== "STUDENT") throw new Error("Unauthorized role");
        if (!user.passwordHash) throw new Error("User has no password set");

        const isValid = await bcrypt.compare(normalizedPassword, user.passwordHash);
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

  secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
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

// Export handlers for Next.js Route Handler
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const GET = handlers.GET;
export const POST = handlers.POST;
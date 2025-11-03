import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "email-password",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Missing credentials");

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) throw new Error("User not found");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash ?? ""
        );
        if (!isValid) throw new Error("Invalid password");

        if (user.role !== "ADMIN" && user.role !== "STAFF")
          throw new Error("Use student login portal");

        return { id: user.id, role: user.role, email: user.email };
      },
    }),

    CredentialsProvider({
      id: "student-login",
      name: "Student Login",
      credentials: {
        aadhar: { label: "Aadhaar No", type: "text" },
        dob: { label: "Date of Birth", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.aadhar || !credentials?.dob)
          throw new Error("Missing credentials");

        const student = await db.student.findUnique({
          where: { admissionNo: credentials.aadhar },
          include: { user: true },
        });

        if (!student) throw new Error("Student not found");
        if (student.user.role !== "STUDENT")
          throw new Error("Invalid role");

        const dob = new Date(credentials.dob).toISOString().split("T")[0];
        const storedDob = student.dob?.toISOString().split("T")[0];
        if (dob !== storedDob) throw new Error("Invalid DOB");

        return { id: student.user.id, role: "STUDENT", email: student.user.email };
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  // 👇 ADD THIS SECTION HERE
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
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
    async signIn({ user }) {
      if (user.role === "ADMIN") return "/admin/dashboard";
      if (user.role === "STAFF") return "/staff/dashboard";
      if (user.role === "STUDENT") return "/student/dashboard";
      return false;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

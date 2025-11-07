// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authConfig } from "@/app/lib/auth";

const handler = NextAuth(authConfig);

// App Router requires named exports for methods
export { handler as GET, handler as POST };

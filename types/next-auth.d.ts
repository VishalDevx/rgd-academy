import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

type Role = "ADMIN" | "STAFF" | "STUDENT" | "SUPER_ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      organizationId: string | null;
      isSuperAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: Role;
    organizationId: string | null;
    isSuperAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    organizationId: string | null;
    isSuperAdmin: boolean;
  }
}

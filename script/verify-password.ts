import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  for (const email of ["admin@school.com", "teacher@school.com", "student@school.com"]) {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`❌ ${email}: not found`);
      continue;
    }
    const match = await bcrypt.compare("Pass@123", user.passwordHash!);
    console.log(`${email} (${user.role}) → password match: ${match}`);
  }
}

main().finally(() => db.$disconnect());

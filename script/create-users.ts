import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Pass@123", 10);

  const admin = await db.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      name: "School Admin",
      email: "admin@school.com",
      passwordHash: hash,
      role: Role.ADMIN,
      adharNo: "111122223333",
    },
  });
  console.log("✅ Admin:", admin.email, "/ Pass@123");

  const staff = await db.user.upsert({
    where: { email: "teacher@school.com" },
    update: {},
    create: {
      name: "Rahul Teacher",
      email: "teacher@school.com",
      passwordHash: hash,
      role: Role.STAFF,
      adharNo: "222233334444",
    },
  });

  await db.staff.upsert({
    where: { userId: staff.id },
    update: {},
    create: {
      userId: staff.id,
      staffId: "TCH-001",
      designation: "Teacher",
      department: "Science",
    },
  });
  console.log("✅ Staff:", staff.email, "/ Pass@123");

  const studentUser = await db.user.upsert({
    where: { email: "student@school.com" },
    update: {},
    create: {
      name: "Amit Student",
      email: "student@school.com",
      passwordHash: hash,
      role: Role.STUDENT,
      adharNo: "333344445555",
    },
  });

  await db.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      admissionNo: "ADM-1001",
      rollNumber: "01",
    },
  });
  console.log("✅ Student:", studentUser.email, "/ Pass@123");

  console.log("\n🎉 All users created! Login at /login");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

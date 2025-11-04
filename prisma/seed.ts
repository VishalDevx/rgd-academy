import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // --- HASHED PASSWORDS ---
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const staffPassword = await bcrypt.hash("Staff@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);

  // --- CLASS CREATION ---
  const class10A = await db.class.create({
    data: {
      name: "Class 10 A",
      grade: "TEN",
    },
  });

  // --- ADMIN CREATION ---
  const admin = await db.user.create({
    data: {
      name: "Principal Admin",
      email: "admin@school.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      adharNo: "999988887777",
 
    },
  });

  // --- STAFF CREATION ---
  const staff = await db.user.create({
    data: {
      name: "John Teacher",
      email: "staff@school.com",
      passwordHash: staffPassword,
      role: "STAFF",
      adharNo: "888877776666",
 
    },
  });

  // --- STUDENT CREATION ---
  const studentUser = await db.user.create({
    data: {
      name: "Ravi Student",
      email: "student@school.com",
      passwordHash: studentPassword,
      role: "STUDENT",
      adharNo: "123456789012",
     
    },
  });

  // --- STUDENT PROFILE CREATION ---
  await db.student.create({
    data: {
      userId: studentUser.id,
      admissionNo: "ADM-2200170100060",
      rollNumber: "2200170100060",
      dob: new Date("2007-08-15"),
      classId: class10A.id,
    },
  });

  console.log("✅ Seed data inserted successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

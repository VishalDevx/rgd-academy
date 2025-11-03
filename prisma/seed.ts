import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const db = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const staffPassword = await bcrypt.hash("Staff@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);

  // --- CLASS ---
  const class10A = await db.class.create({
    data: {
      name: "Class 10 A",
      grade :"TEN"
    },
  });

  // --- ADMIN ---
  const admin = await db.user.create({
    data: {
      name: "Principal Admin",
      email: "admin@school.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      adharNo: "999988887777",
      dob:new Date( "1980-05-10"), 
    },
  });

  // --- STAFF ---
  const staff = await db.user.create({
    data: {
      name: "John Teacher",
      email: "staff@school.com",
      passwordHash: staffPassword,
      role: "STAFF",
      adharNo: "888877776666",
      dob:new Date( "1988-09-21"), 
    },
  });

  // --- STUDENT ---
  const studentUser = await db.user.create({
    data: {
      name: "Ravi Student",
      email: "student@school.com",
      passwordHash: studentPassword,
      role: "STUDENT",
      adharNo: "123456789012",
      dob: new Date( "2007-08-15"), 
    },
  });

  await db.student.create({
    data: {
      userId: studentUser.id,
      admissionNo: "ADM-2200170100060",
      rollNumber: "2200170100060",
      dob:new Date( "2007-08-15"), 
      classId: class10A.id, 
    },
  });

  console.log("✅ Seed data inserted successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

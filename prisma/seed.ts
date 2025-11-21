import { PrismaClient, TransactionType } from "@prisma/client";
import bcrypt from "bcrypt";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // --- HASHED PASSWORDS ---
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const staffPassword = await bcrypt.hash("Staff@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);

  // --- CLASS CREATION ---
  const class9A = await db.class.create({ data: { name: "Class 9 A", grade: "NINE" } });
  const class10A = await db.class.create({ data: { name: "Class 10 A", grade: "TEN" } });

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
  const studentProfile = await db.student.create({
    data: {
      userId: studentUser.id,
      admissionNo: "ADM-2200170100060",
      rollNumber: "2200170100060",
      dob: new Date("2007-08-15"),
      classId: class9A.id,
      occupation:"Labours",
      religion:"Hindu",
      caste:"SC",
    },
  });

  // --- FEE STRUCTURE & PAYMENT ---
  const fee10 = await db.feeStructure.create({
    data: {
      classId: class10A.id,
      name: "Tuition 10th",
      tuitionFee: "25000.00" as any,
      examFee: "1500.00" as any,
      transportFee: "0.00" as any,
      miscFee: "500.00" as any,
      total: "27000.00" as any,
    },
  });

  await db.feePayment.createMany({
    data: [
      { studentId: studentProfile.id, feeStructureId: fee10.id, amountPaid: "10000.00" as any, status: "PARTIAL" ,remainAmount:"17000"},
      { studentId: studentProfile.id, feeStructureId: fee10.id, amountPaid: "17000.00" as any, status: "PAID",remainAmount:"0" },
    ],
  } as any);

  // --- EXPENSES ---
  await db.expense.createMany({
    data: [
      { title: "Electricity Bill", amount: "8500.00" as any, date: new Date(), createdById: admin.id ,transaction:TransactionType.CREDIT},
      { title: "Books & Supplies", amount: "12000.00" as any, date: new Date(), createdById: admin.id,transaction:TransactionType.DEBIT },
      { title: "Repairs & Maintenance", amount: "6000.00" as any, date: new Date(), createdById: admin.id ,transaction:TransactionType.DEBIT},
    ],
  } as any);

  // --- EXAM ---
  const exam = await db.exam.create({
    data: {
      name: "Mid Term",
      classId: class9A.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdById: (await db.staff.findFirst())?.id || (await db.staff.create({ data: { userId: staff.id, designation: "Teacher" } })).id,
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

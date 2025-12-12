import { PrismaClient, TransactionType } from "@prisma/client";
import bcrypt from "bcrypt";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Clearing old data...");

  // --- DELETE CHILD TABLES FIRST ---
  await db.result.deleteMany();
  await db.examDateSheet.deleteMany();
  await db.exam.deleteMany();
  await db.feePayment.deleteMany();
  await db.feeStructure.deleteMany();
  await db.subject.deleteMany();
  await db.attendance.deleteMany();
  await db.student.deleteMany();
  await db.staff.deleteMany();
  await db.expense.deleteMany();
  await db.announcementVisibility.deleteMany();
  await db.announcement.deleteMany();
  await db.notification.deleteMany();
  await db.auditLog.deleteMany();
  await db.account.deleteMany();
  await db.session.deleteMany();
  await db.verificationToken.deleteMany();

  // --- DELETE PARENT TABLES ---
  await db.user.deleteMany();
  await db.class.deleteMany();
  await db.schoolSettings.deleteMany();

  console.log("🌱 Old data cleared. Seeding new data...");

  // --- HASHED PASSWORDS ---
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const staffPassword = await bcrypt.hash("Staff@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);

  // --- CREATE CLASSES ---
  const class9A = await db.class.create({ data: { name: "Class 9 A", grade: "NINE" } });
  const class10A = await db.class.create({ data: { name: "Class 10 A", grade: "TEN" } });

  // --- CREATE ADMIN ---
  const admin = await db.user.create({
    data: {
      name: "Principal Admin",
      email: "admin@school.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      adharNo: "999988887777",
    },
  });

  // --- CREATE STAFF ---
  const staff = await db.user.create({
    data: {
      name: "John Teacher",
      email: "staff@school.com",
      passwordHash: staffPassword,
      role: "STAFF",
      adharNo: "888877776666",
    },
  });

  // --- STAFF PROFILE ---
  await db.staff.create({
    data: {
      userId: staff.id,
      designation: "Teacher",
      salary: 30000,
    },
  });

  // --- CREATE STUDENT USER ---
  const studentUser = await db.user.create({
    data: {
      name: "Ravi Student",
      email: "student@school.com",
      passwordHash: studentPassword,
      role: "STUDENT",
      adharNo: "123456789012",
    },
  });

  // --- STUDENT PROFILE ---
  const studentProfile = await db.student.create({
    data: {
      userId: studentUser.id,
      admissionNo: "ADM-2200170100060",
      rollNumber: "2200170100060",
      dob: new Date("2007-08-15"),
      classId: class9A.id,
      occupation: "Labours",
      religion: "Hindu",
      caste: "SC",
    },
  });

  // --- FEE STRUCTURE & PAYMENTS ---
  const fee10 = await db.feeStructure.create({
    data: {
      classId: class10A.id,
      name: "Tuition 10th",
      tuitionFee: 25000.0,
      examFee: 1500.0,
      transportFee: 0.0,
      miscFee: 500.0,
      total: 27000.0,
    },
  });

  await db.feePayment.createMany({
    data: [
      { studentId: studentProfile.id, feeStructureId: fee10.id, amountPaid: 10000, remainAmount: 17000, status: "PARTIAL" },
      { studentId: studentProfile.id, feeStructureId: fee10.id, amountPaid: 17000, remainAmount: 0, status: "PAID" },
    ],
  });

  // --- EXPENSES ---
  await db.expense.createMany({
    data: [
      { title: "Electricity Bill", amount: 8500, date: new Date(), createdById: admin.id, transaction: TransactionType.CREDIT },
      { title: "Books & Supplies", amount: 12000, date: new Date(), createdById: admin.id, transaction: TransactionType.DEBIT },
      { title: "Repairs & Maintenance", amount: 6000, date: new Date(), createdById: admin.id, transaction: TransactionType.DEBIT },
    ],
  });

  // --- CREATE EXAM ---
  await db.exam.create({
    data: {
      name: "Mid Term",
      classId: class9A.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdById: staff.id, // staff must exist for FK
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

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "usesTransport" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TransportAssignment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "routeName" TEXT,
    "stopName" TEXT,
    "busNumber" TEXT,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "feeAmount" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransportAssignment_studentId_key" ON "TransportAssignment"("studentId");

-- CreateIndex
CREATE INDEX "TransportAssignment_studentId_idx" ON "TransportAssignment"("studentId");

-- CreateIndex
CREATE INDEX "TransportAssignment_isActive_idx" ON "TransportAssignment"("isActive");

-- AddForeignKey
ALTER TABLE "TransportAssignment" ADD CONSTRAINT "TransportAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

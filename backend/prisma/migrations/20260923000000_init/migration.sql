-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'SUPER_ADMIN', 'WORKER', 'OFFICE_STAFF');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFF_DUTY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "username" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "workerStatus" "WorkerStatus" DEFAULT 'AVAILABLE',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "OtpType" NOT NULL DEFAULT 'EMAIL_VERIFICATION',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_enquiries" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT NOT NULL,
    "location" TEXT,
    "preferredDate" TIMESTAMP(3),
    "message" TEXT NOT NULL,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "customerId" TEXT,
    "officeStaffId" TEXT,
    "workerId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "otps_email_isUsed_idx" ON "otps"("email", "isUsed");

-- CreateIndex
CREATE UNIQUE INDEX "service_enquiries_trackingNumber_key" ON "service_enquiries"("trackingNumber");

-- CreateIndex
CREATE INDEX "service_enquiries_status_idx" ON "service_enquiries"("status");

-- CreateIndex
CREATE INDEX "service_enquiries_trackingNumber_idx" ON "service_enquiries"("trackingNumber");

-- CreateIndex
CREATE INDEX "service_enquiries_workerId_idx" ON "service_enquiries"("workerId");

-- CreateIndex
CREATE INDEX "service_enquiries_customerId_idx" ON "service_enquiries"("customerId");

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_enquiries" ADD CONSTRAINT "service_enquiries_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_enquiries" ADD CONSTRAINT "service_enquiries_officeStaffId_fkey" FOREIGN KEY ("officeStaffId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_enquiries" ADD CONSTRAINT "service_enquiries_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

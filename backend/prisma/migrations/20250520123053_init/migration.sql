/*
  Warnings:

  - The values [UNAVAILABLE] on the enum `BookStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [INFO,WARNING,ALERT] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[checkInCode]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[label]` on the table `Seat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookStatus_new" AS ENUM ('AVAILABLE', 'BORROWED', 'RESERVED', 'MAINTENANCE');
ALTER TABLE "Book" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Book" ALTER COLUMN "status" TYPE "BookStatus_new" USING ("status"::text::"BookStatus_new");
ALTER TYPE "BookStatus" RENAME TO "BookStatus_old";
ALTER TYPE "BookStatus_new" RENAME TO "BookStatus";
DROP TYPE "BookStatus_old";
ALTER TABLE "Book" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('RESERVATION_CONFIRMED', 'RESERVATION_REMINDER', 'RESERVATION_CANCELLED', 'LOAN_DUE_SOON', 'LOAN_OVERDUE', 'SYSTEM_ALERT');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReservationStatus" ADD VALUE 'CHECKED_IN';
ALTER TYPE "ReservationStatus" ADD VALUE 'FORFEITED';

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "checkInCode" TEXT,
ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "timeslotId" TEXT;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "Seat" ADD COLUMN     "label" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "universityId" TEXT;

-- CreateTable
CREATE TABLE "Timeslot" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timeslot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_checkInCode_key" ON "Reservation"("checkInCode");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_label_key" ON "Seat"("label");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_timeslotId_fkey" FOREIGN KEY ("timeslotId") REFERENCES "Timeslot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

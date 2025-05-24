/*
  Warnings:

  - Added the required column `dayOfWeek` to the `Timeslot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `Timeslot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Timeslot" ADD COLUMN     "dayOfWeek" TEXT NOT NULL,
ADD COLUMN     "roomId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Timeslot" ADD CONSTRAINT "Timeslot_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

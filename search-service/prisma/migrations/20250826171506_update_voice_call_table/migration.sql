/*
  Warnings:

  - You are about to drop the column `status` on the `voice_call_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "voice_call_sessions" DROP COLUMN "status";

-- DropEnum
DROP TYPE "VoiceCallStatus";

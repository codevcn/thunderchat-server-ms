/*
  Warnings:

  - You are about to drop the column `reason` on the `call_sessions` table. All the data in the column will be lost.
  - Changed the type of `status` on the `call_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CallVoiceStatus" AS ENUM ('REQUESTING', 'RINGING', 'ACCEPTED', 'CONNECTED', 'ENDED');

-- AlterTable
ALTER TABLE "call_sessions" DROP COLUMN "reason",
ADD COLUMN     "hangup_reason" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "CallVoiceStatus" NOT NULL;

-- DropEnum
DROP TYPE "ECallVoiceStatus";

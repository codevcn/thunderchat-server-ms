/*
  Warnings:

  - You are about to drop the `call_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "VoiceCallStatus" AS ENUM ('REQUESTING', 'RINGING', 'ACCEPTED', 'CONNECTED', 'ENDED');

-- DropForeignKey
ALTER TABLE "call_sessions" DROP CONSTRAINT "call_sessions_callee_user_id_fkey";

-- DropForeignKey
ALTER TABLE "call_sessions" DROP CONSTRAINT "call_sessions_caller_user_id_fkey";

-- DropForeignKey
ALTER TABLE "call_sessions" DROP CONSTRAINT "call_sessions_direct_chat_id_fkey";

-- DropTable
DROP TABLE "call_sessions";

-- DropEnum
DROP TYPE "CallVoiceStatus";

-- CreateTable
CREATE TABLE "voice_call_sessions" (
    "id" SERIAL NOT NULL,
    "direct_chat_id" INTEGER,
    "caller_user_id" INTEGER NOT NULL,
    "callee_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(3),
    "status" "VoiceCallStatus" NOT NULL,
    "hangup_reason" TEXT,

    CONSTRAINT "voice_call_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "voice_call_sessions_caller_user_id_idx" ON "voice_call_sessions"("caller_user_id");

-- CreateIndex
CREATE INDEX "voice_call_sessions_callee_user_id_idx" ON "voice_call_sessions"("callee_user_id");

-- AddForeignKey
ALTER TABLE "voice_call_sessions" ADD CONSTRAINT "voice_call_sessions_direct_chat_id_fkey" FOREIGN KEY ("direct_chat_id") REFERENCES "direct_chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_call_sessions" ADD CONSTRAINT "voice_call_sessions_caller_user_id_fkey" FOREIGN KEY ("caller_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_call_sessions" ADD CONSTRAINT "voice_call_sessions_callee_user_id_fkey" FOREIGN KEY ("callee_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

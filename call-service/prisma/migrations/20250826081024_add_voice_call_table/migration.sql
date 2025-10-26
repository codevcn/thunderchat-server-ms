-- CreateEnum
CREATE TYPE "ECallVoiceStatus" AS ENUM ('REQUESTING', 'RINGING', 'ACCEPTED', 'CONNECTED', 'ENDED');

-- CreateTable
CREATE TABLE "call_sessions" (
    "id" SERIAL NOT NULL,
    "direct_chat_id" INTEGER,
    "caller_user_id" INTEGER NOT NULL,
    "callee_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(3),
    "status" "ECallVoiceStatus" NOT NULL,
    "reason" TEXT,

    CONSTRAINT "call_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "call_sessions_caller_user_id_idx" ON "call_sessions"("caller_user_id");

-- CreateIndex
CREATE INDEX "call_sessions_callee_user_id_idx" ON "call_sessions"("callee_user_id");

-- AddForeignKey
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_direct_chat_id_fkey" FOREIGN KEY ("direct_chat_id") REFERENCES "direct_chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_caller_user_id_fkey" FOREIGN KEY ("caller_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_callee_user_id_fkey" FOREIGN KEY ("callee_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

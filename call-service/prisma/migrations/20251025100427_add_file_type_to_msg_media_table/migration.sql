/*
  Warnings:

  - Added the required column `file_type` to the `message_medias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message_medias" ADD COLUMN     "file_type" TEXT NOT NULL;

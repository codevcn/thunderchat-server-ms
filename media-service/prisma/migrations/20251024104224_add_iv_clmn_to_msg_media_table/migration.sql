/*
  Warnings:

  - Added the required column `iv` to the `message_medias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message_medias" ADD COLUMN     "iv" VARCHAR(128) NOT NULL;

/*
  Warnings:

  - Added the required column `dek_version_code` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "dek_version_code" VARCHAR(128) NOT NULL;

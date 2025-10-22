/*
  Warnings:

  - Added the required column `version_code` to the `message_mappings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message_mappings" ADD COLUMN     "version_code" VARCHAR(128) NOT NULL;

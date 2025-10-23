/*
  Warnings:

  - Added the required column `dek` to the `message_mappings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message_mappings" ADD COLUMN     "dek" VARCHAR(128) NOT NULL;

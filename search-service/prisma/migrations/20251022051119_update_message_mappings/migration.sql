/*
  Warnings:

  - You are about to drop the column `user_id` on the `message_mappings` table. All the data in the column will be lost.
  - Made the column `mappings` on table `message_mappings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."message_mappings" DROP CONSTRAINT "message_mappings_user_id_fkey";

-- DropIndex
DROP INDEX "public"."message_mappings_user_id_idx";

-- DropIndex
DROP INDEX "public"."message_mappings_user_id_key";

-- AlterTable
ALTER TABLE "message_mappings" DROP COLUMN "user_id",
ALTER COLUMN "mappings" SET NOT NULL;

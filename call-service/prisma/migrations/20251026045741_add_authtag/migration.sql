/*
  Warnings:

  - Added the required column `auth_tag` to the `message_medias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message_medias" ADD COLUMN     "auth_tag" VARCHAR(128) NOT NULL;

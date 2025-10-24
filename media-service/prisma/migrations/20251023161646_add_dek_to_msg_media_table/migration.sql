/*
  Warnings:

  - Added the required column `dek` to the `message_medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dek_version_code` to the `message_medias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message_medias" ADD COLUMN     "dek" VARCHAR(128) NOT NULL,
ADD COLUMN     "dek_version_code" VARCHAR(128) NOT NULL;

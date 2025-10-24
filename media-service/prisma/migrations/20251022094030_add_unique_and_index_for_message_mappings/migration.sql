/*
  Warnings:

  - A unique constraint covering the columns `[version_code]` on the table `message_mappings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "message_mappings_version_code_key" ON "message_mappings"("version_code");

-- CreateIndex
CREATE INDEX "message_mappings_version_code_idx" ON "message_mappings"("version_code");

/*
  Warnings:

  - You are about to drop the column `titre` on the `notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `notification` DROP COLUMN `titre`;

-- AlterTable
ALTER TABLE `reclamation` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

/*
  Warnings:

  - You are about to drop the column `depotId` on the `depot` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `depot` DROP COLUMN `depotId`;

-- AlterTable
ALTER TABLE `image` DROP COLUMN `imageId`;

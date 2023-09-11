/*
  Warnings:

  - You are about to drop the column `magasinId` on the `commande` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `commande` DROP FOREIGN KEY `Commande_magasinId_fkey`;

-- AlterTable
ALTER TABLE `commande` DROP COLUMN `magasinId`;

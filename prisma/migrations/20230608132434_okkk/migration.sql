/*
  Warnings:

  - Added the required column `adresse` to the `Livraison` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wilaya` to the `Livraison` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `livraison` ADD COLUMN `adresse` VARCHAR(191) NOT NULL,
    ADD COLUMN `wilaya` VARCHAR(191) NOT NULL;

/*
  Warnings:

  - Added the required column `depotId` to the `Produit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `depot` ADD COLUMN `depotId` INTEGER NULL;

-- AlterTable
ALTER TABLE `produit` ADD COLUMN `depotId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Produit` ADD CONSTRAINT `Produit_depotId_fkey` FOREIGN KEY (`depotId`) REFERENCES `Depot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

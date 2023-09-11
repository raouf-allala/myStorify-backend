/*
  Warnings:

  - Added the required column `commande_ProduitId` to the `Livraison` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `livraison` DROP FOREIGN KEY `Livraison_commandeId_fkey`;

-- AlterTable
ALTER TABLE `livraison` ADD COLUMN `commande_ProduitId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Livraison` ADD CONSTRAINT `Livraison_commande_ProduitId_fkey` FOREIGN KEY (`commande_ProduitId`) REFERENCES `Commande_Produit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

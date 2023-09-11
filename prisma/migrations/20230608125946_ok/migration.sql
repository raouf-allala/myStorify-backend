/*
  Warnings:

  - Added the required column `etat` to the `Commande_Produit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `etat` to the `Livraison` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Livraison_commandeId_fkey` ON `livraison`;

-- AlterTable
ALTER TABLE `commande_produit` ADD COLUMN `etat` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `livraison` ADD COLUMN `etat` VARCHAR(191) NOT NULL;

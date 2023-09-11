/*
  Warnings:

  - Added the required column `utilisateurId` to the `Magasin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `commande` ALTER COLUMN `date` DROP DEFAULT;

-- AlterTable
ALTER TABLE `magasin` ADD COLUMN `utilisateurId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Magasin` ADD CONSTRAINT `Magasin_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

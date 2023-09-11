/*
  Warnings:

  - You are about to drop the column `variantId` on the `commande_produit` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `review` table. All the data in the column will be lost.
  - You are about to drop the `variant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `variant_option` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `produitId` to the `Commande_Produit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Produit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `commande_produit` DROP FOREIGN KEY `Commande_Produit_variantId_fkey`;

-- DropForeignKey
ALTER TABLE `variant` DROP FOREIGN KEY `Variant_produitId_fkey`;

-- DropForeignKey
ALTER TABLE `variant` DROP FOREIGN KEY `Variant_variant_OptionId_fkey`;

-- AlterTable
ALTER TABLE `commande_produit` DROP COLUMN `variantId`,
    ADD COLUMN `produitId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `magasin` MODIFY `logo` VARCHAR(191) NOT NULL DEFAULT 'https://res.cloudinary.com/dodzuvmxz/image/upload/v1684270881/magasins-logo/Rectangle_16_orp09u.png';

-- AlterTable
ALTER TABLE `produit` ADD COLUMN `quantity` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `review` DROP COLUMN `data`,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    MODIFY `description` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `variant`;

-- DropTable
DROP TABLE `variant_option`;

-- AddForeignKey
ALTER TABLE `Commande_Produit` ADD CONSTRAINT `Commande_Produit_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `Produit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `verifier` on the `produit` table. All the data in the column will be lost.

*/


-- AlterTable
ALTER TABLE `utilisateur` ADD COLUMN `verifier` BOOLEAN NOT NULL DEFAULT false;

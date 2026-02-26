/*
  Warnings:

  - You are about to drop the column `productId` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `model_list` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_productId_fkey";

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "productId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "model_list",
ADD COLUMN     "modelIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

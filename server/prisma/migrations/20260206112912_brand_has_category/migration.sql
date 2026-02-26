/*
  Warnings:

  - You are about to drop the column `brandId` on the `Category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_brandId_fkey";

-- DropIndex
DROP INDEX "Category_brandId_key";

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "brandId";

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

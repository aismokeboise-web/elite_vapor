/*
  Warnings:

  - You are about to drop the `_FlavorToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FlavorToProduct" DROP CONSTRAINT "_FlavorToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_FlavorToProduct" DROP CONSTRAINT "_FlavorToProduct_B_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "flavorIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "_FlavorToProduct";

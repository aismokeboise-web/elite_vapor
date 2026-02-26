/*
  Warnings:

  - You are about to drop the column `imageUrls` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `is_best_seller` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `is_clearance` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `is_deal` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `is_new` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "is_best_seller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_clearance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_deal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_new" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrls",
DROP COLUMN "is_best_seller",
DROP COLUMN "is_clearance",
DROP COLUMN "is_deal",
DROP COLUMN "is_new",
ADD COLUMN     "model_list" JSONB DEFAULT '[]';

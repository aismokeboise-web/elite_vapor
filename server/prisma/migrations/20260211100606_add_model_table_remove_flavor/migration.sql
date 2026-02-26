/*
  Warnings:

  - You are about to drop the column `flavorIds` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Flavor` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "flavorIds";

-- DropTable
DROP TABLE "Flavor";

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2),
    "description" TEXT,
    "flavors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "productId" TEXT NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

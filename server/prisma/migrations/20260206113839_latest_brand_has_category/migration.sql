/*
  Warnings:

  - You are about to drop the `_ProductToFlavor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductToFlavor" DROP CONSTRAINT "_ProductToFlavor_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToFlavor" DROP CONSTRAINT "_ProductToFlavor_B_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "imageUrls" DROP DEFAULT;

-- DropTable
DROP TABLE "_ProductToFlavor";

-- CreateTable
CREATE TABLE "_FlavorToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FlavorToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FlavorToProduct_B_index" ON "_FlavorToProduct"("B");

-- AddForeignKey
ALTER TABLE "_FlavorToProduct" ADD CONSTRAINT "_FlavorToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Flavor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FlavorToProduct" ADD CONSTRAINT "_FlavorToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

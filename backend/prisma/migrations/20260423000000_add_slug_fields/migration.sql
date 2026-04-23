-- AlterTable Category: add optional unique slug
ALTER TABLE "Category" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AlterTable Product: add optional unique slug
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

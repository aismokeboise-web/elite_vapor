/*
  Warnings:

  - You are about to drop the column `isRead` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[resetToken]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[unsubscribeToken]` on the table `NewsletterSubscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetToken]` on the table `Subadmin` will be added. If there are existing duplicate values, this will fail.
  - The required column `unsubscribeToken` was added to the `NewsletterSubscription` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpires" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isRead",
ADD COLUMN     "repliedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "NewsletterSubscription" ADD COLUMN     "unsubscribeToken" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Privilege" ADD COLUMN     "canReply" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subadmin" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_resetToken_key" ON "Admin"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_unsubscribeToken_key" ON "NewsletterSubscription"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "Subadmin_resetToken_key" ON "Subadmin"("resetToken");

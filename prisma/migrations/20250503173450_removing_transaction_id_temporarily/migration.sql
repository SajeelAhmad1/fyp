/*
  Warnings:

  - You are about to drop the column `clientSecret` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "clientSecret",
DROP COLUMN "paymentMethod";

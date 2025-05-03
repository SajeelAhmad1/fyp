/*
  Warnings:

  - Added the required column `clientSecret` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "clientSecret" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" TEXT NOT NULL;

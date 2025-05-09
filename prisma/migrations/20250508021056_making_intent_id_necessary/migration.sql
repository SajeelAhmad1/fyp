/*
  Warnings:

  - Made the column `clientSecret` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentIntentId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentMethodId` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "clientSecret" SET NOT NULL,
ALTER COLUMN "paymentIntentId" SET NOT NULL,
ALTER COLUMN "paymentMethodId" SET NOT NULL;

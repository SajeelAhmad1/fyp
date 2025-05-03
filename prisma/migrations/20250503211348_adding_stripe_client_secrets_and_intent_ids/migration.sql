-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "clientSecret" TEXT,
ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "paymentMethodId" TEXT;

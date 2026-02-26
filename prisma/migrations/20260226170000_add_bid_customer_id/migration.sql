-- Add customer ID field for bids on used products
ALTER TABLE "Bid" ADD COLUMN "customerId" TEXT;

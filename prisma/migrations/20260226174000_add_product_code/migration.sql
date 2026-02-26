-- Add product code for business-visible sequential product ID
ALTER TABLE "Product" ADD COLUMN "productCode" INTEGER;

WITH ordered_products AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS rn
  FROM "Product"
)
UPDATE "Product"
SET "productCode" = (
  SELECT rn
  FROM ordered_products
  WHERE ordered_products."id" = "Product"."id"
);

CREATE UNIQUE INDEX "Product_productCode_key" ON "Product"("productCode");

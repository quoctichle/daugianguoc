-- CreateEnum
CREATE TYPE "EventFormat" AS ENUM ('REVERSE_AUCTION');

-- AlterTable Event
ALTER TABLE "Event" ADD COLUMN "eventId" INTEGER;
ALTER TABLE "Event" ADD COLUMN "format" "EventFormat" NOT NULL DEFAULT 'REVERSE_AUCTION';
ALTER TABLE "Event" ADD COLUMN "startsAt" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN "endsAt" TIMESTAMP(3);

CREATE SEQUENCE "Event_eventId_seq";
ALTER TABLE "Event" ALTER COLUMN "eventId" SET DEFAULT nextval('"Event_eventId_seq"');
UPDATE "Event" SET "eventId" = nextval('"Event_eventId_seq"') WHERE "eventId" IS NULL;
SELECT setval('"Event_eventId_seq"', COALESCE((SELECT MAX("eventId") FROM "Event"), 1), true);
ALTER TABLE "Event" ALTER COLUMN "eventId" SET NOT NULL;

UPDATE "Event"
SET "startsAt" = COALESCE("startsAt", "createdAt"),
    "endsAt" = COALESCE("endsAt", "createdAt" + INTERVAL '1 day');

ALTER TABLE "Event" ALTER COLUMN "startsAt" SET NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "endsAt" SET NOT NULL;

UPDATE "Event" SET "link" = '/auctions' WHERE "link" IS NULL OR btrim("link") = '';
ALTER TABLE "Event" ALTER COLUMN "link" SET DEFAULT '/auctions';
ALTER TABLE "Event" ALTER COLUMN "link" SET NOT NULL;

-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN "eventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventId_key" ON "Event"("eventId");
CREATE INDEX "Product_eventId_idx" ON "Product"("eventId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

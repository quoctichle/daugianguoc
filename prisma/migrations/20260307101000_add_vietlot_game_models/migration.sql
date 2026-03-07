-- CreateEnum
CREATE TYPE "VietlotPrizeTier" AS ENUM (
  'SPECIAL',
  'FIRST',
  'SECOND',
  'THIRD',
  'FOURTH',
  'FIFTH',
  'CONSOLATION',
  'NONE'
);

-- CreateTable
CREATE TABLE "VietlotPrizeConfig" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "specialPrize" TEXT NOT NULL,
  "firstPrize" TEXT NOT NULL,
  "secondPrize" TEXT NOT NULL,
  "thirdPrize" TEXT NOT NULL,
  "fourthPrize" TEXT NOT NULL,
  "fifthPrize" TEXT NOT NULL,
  "consolationPrize" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VietlotPrizeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VietlotDraw" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "roundStart" TIMESTAMP(3) NOT NULL,
  "roundEnd" TIMESTAMP(3) NOT NULL,
  "winningNumbers" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VietlotDraw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VietlotTicket" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "roundStart" TIMESTAMP(3) NOT NULL,
  "roundEnd" TIMESTAMP(3) NOT NULL,
  "pickedNumbers" JSONB NOT NULL,
  "matchCount" INTEGER,
  "prizeTier" "VietlotPrizeTier",
  "prizeLabel" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VietlotTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VietlotPrizeConfig_eventId_key" ON "VietlotPrizeConfig"("eventId");
CREATE UNIQUE INDEX "VietlotDraw_eventId_roundStart_key" ON "VietlotDraw"("eventId", "roundStart");
CREATE INDEX "VietlotDraw_eventId_roundEnd_idx" ON "VietlotDraw"("eventId", "roundEnd");
CREATE UNIQUE INDEX "VietlotTicket_eventId_userId_roundStart_key" ON "VietlotTicket"("eventId", "userId", "roundStart");
CREATE INDEX "VietlotTicket_eventId_roundStart_idx" ON "VietlotTicket"("eventId", "roundStart");
CREATE INDEX "VietlotTicket_userId_createdAt_idx" ON "VietlotTicket"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "VietlotPrizeConfig" ADD CONSTRAINT "VietlotPrizeConfig_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VietlotDraw" ADD CONSTRAINT "VietlotDraw_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VietlotTicket" ADD CONSTRAINT "VietlotTicket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VietlotTicket" ADD CONSTRAINT "VietlotTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

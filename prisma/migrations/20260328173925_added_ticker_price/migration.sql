-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "tickerPriceId" INTEGER;

-- CreateTable
CREATE TABLE "TickerPrice" (
    "id" SERIAL NOT NULL,
    "ticker" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "TickerPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TickerPrice.ticker_date_unique" ON "TickerPrice"("ticker", "date");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_tickerPriceId_fkey" FOREIGN KEY ("tickerPriceId") REFERENCES "TickerPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

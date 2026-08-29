-- Create the AssetTicker table
CREATE TABLE "AssetTicker" (
    "id" SERIAL NOT NULL,
    "ticker" VARCHAR(255) NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "dividendApr" INTEGER NOT NULL DEFAULT 0,
    "tickerDisplayName" VARCHAR(255) NOT NULL,

    CONSTRAINT "AssetTicker_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on ticker
CREATE UNIQUE INDEX "AssetTicker_ticker_key" ON "AssetTicker"("ticker");

-- Insert distinct (ticker, assetType) combos from existing Asset records
-- Use hardcoded display names, falling back to the raw ticker
INSERT INTO "AssetTicker" ("ticker", "assetType", "dividendApr", "tickerDisplayName")
SELECT DISTINCT
    a."ticker",
    a."assetType",
    0,
    CASE a."ticker"
        WHEN 'VOO' THEN 'S&P 500'
        WHEN 'FBND' THEN 'Total Bond Fund'
        WHEN 'VTIP' THEN 'TIPS Fund'
        WHEN 'VB' THEN 'Small Cap Index'
        WHEN 'VTI' THEN 'Total Market Index'
        WHEN 'CASH' THEN 'Cash'
        ELSE a."ticker"
    END
FROM "Asset" a;

-- Add nullable assetTickerId column to Asset
ALTER TABLE "Asset" ADD COLUMN "assetTickerId" INTEGER;

-- Populate assetTickerId by matching on (ticker, assetType)
UPDATE "Asset" a
SET "assetTickerId" = at."id"
FROM "AssetTicker" at
WHERE a."ticker" = at."ticker" AND a."assetType" = at."assetType";

-- Set assetTickerId to NOT NULL
ALTER TABLE "Asset" ALTER COLUMN "assetTickerId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assetTickerId_fkey"
    FOREIGN KEY ("assetTickerId") REFERENCES "AssetTicker"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the ticker and assetType columns from Asset
ALTER TABLE "Asset" DROP COLUMN "ticker";
ALTER TABLE "Asset" DROP COLUMN "assetType";

-- Add lookup column to AssetTicker (default true)
ALTER TABLE "AssetTicker" ADD COLUMN "lookup" BOOLEAN NOT NULL DEFAULT true;

-- Set lookup=false for CASH so it's handled by the generic fixed-price logic
UPDATE "AssetTicker" SET "lookup" = false WHERE "ticker" = 'CASH';

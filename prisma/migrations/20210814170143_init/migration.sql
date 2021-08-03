-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Item.date_index" ON "Item"("date");

-- AddForeignKey
ALTER TABLE "Item" ADD FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "apiKey" VARCHAR(255),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PingSetup" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phones" TEXT[],
    "emails" TEXT[],
    "notified" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ping" (
    "id" SERIAL NOT NULL,
    "pingSetupId" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "groupName" VARCHAR(255) NOT NULL,
    "tagName" VARCHAR(255),
    "details" TEXT,
    "progressBar" INTEGER,
    "interval" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrganizationToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization.name_unique" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey.apiKey_unique" ON "ApiKey"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationToUser_AB_unique" ON "_OrganizationToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationToUser_B_index" ON "_OrganizationToUser"("B");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PingSetup" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ping" ADD FOREIGN KEY ("pingSetupId") REFERENCES "PingSetup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToUser" ADD FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

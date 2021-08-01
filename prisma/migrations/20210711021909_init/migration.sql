/*
  Warnings:

  - You are about to drop the `_OrganizationToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_OrganizationToUser" DROP CONSTRAINT "_OrganizationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationToUser" DROP CONSTRAINT "_OrganizationToUser_B_fkey";

-- DropTable
DROP TABLE "_OrganizationToUser";

-- CreateTable
CREATE TABLE "UsersOnOrganizations" (
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("userId","organizationId")
);

-- AddForeignKey
ALTER TABLE "UsersOnOrganizations" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnOrganizations" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

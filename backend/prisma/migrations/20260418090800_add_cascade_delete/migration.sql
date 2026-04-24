-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_userId_fkey";

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

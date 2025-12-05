-- AlterTable
ALTER TABLE "Blueprint" ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "tenantId" TEXT;

-- CreateIndex
CREATE INDEX "Blueprint_organizationId_idx" ON "Blueprint"("organizationId");

-- CreateIndex
CREATE INDEX "Blueprint_tenantId_idx" ON "Blueprint"("tenantId");

-- AddForeignKey
ALTER TABLE "Blueprint" ADD CONSTRAINT "Blueprint_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blueprint" ADD CONSTRAINT "Blueprint_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

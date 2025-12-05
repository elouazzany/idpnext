-- CreateTable
CREATE TABLE "CatalogFolder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "organizationId" TEXT NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "CatalogFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "blueprintId" TEXT NOT NULL,
    "folderId" TEXT,
    "layout" TEXT NOT NULL DEFAULT 'table',
    "filters" JSONB NOT NULL DEFAULT '{}',
    "columns" JSONB NOT NULL DEFAULT '[]',
    "sortBy" TEXT,
    "sortOrder" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "organizationId" TEXT NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "CatalogPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatalogFolder_organizationId_idx" ON "CatalogFolder"("organizationId");

-- CreateIndex
CREATE INDEX "CatalogFolder_tenantId_idx" ON "CatalogFolder"("tenantId");

-- CreateIndex
CREATE INDEX "CatalogFolder_parentId_idx" ON "CatalogFolder"("parentId");

-- CreateIndex
CREATE INDEX "CatalogFolder_order_idx" ON "CatalogFolder"("order");

-- CreateIndex
CREATE INDEX "CatalogPage_organizationId_idx" ON "CatalogPage"("organizationId");

-- CreateIndex
CREATE INDEX "CatalogPage_tenantId_idx" ON "CatalogPage"("tenantId");

-- CreateIndex
CREATE INDEX "CatalogPage_blueprintId_idx" ON "CatalogPage"("blueprintId");

-- CreateIndex
CREATE INDEX "CatalogPage_folderId_idx" ON "CatalogPage"("folderId");

-- CreateIndex
CREATE INDEX "CatalogPage_order_idx" ON "CatalogPage"("order");

-- AddForeignKey
ALTER TABLE "CatalogFolder" ADD CONSTRAINT "CatalogFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CatalogFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogPage" ADD CONSTRAINT "CatalogPage_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "CatalogFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "title" TEXT,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "relations" JSONB NOT NULL DEFAULT '{}',
    "team" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "organizationId" TEXT,
    "tenantId" TEXT,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityHistory" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "entityIdentifier" TEXT NOT NULL,
    "propertyName" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changeType" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT,
    "snapshot" JSONB NOT NULL,
    "organizationId" TEXT,
    "tenantId" TEXT,

    CONSTRAINT "EntityHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Entity_blueprintId_idx" ON "Entity"("blueprintId");

-- CreateIndex
CREATE INDEX "Entity_identifier_idx" ON "Entity"("identifier");

-- CreateIndex
CREATE INDEX "Entity_organizationId_idx" ON "Entity"("organizationId");

-- CreateIndex
CREATE INDEX "Entity_tenantId_idx" ON "Entity"("tenantId");

-- CreateIndex
CREATE INDEX "Entity_createdAt_idx" ON "Entity"("createdAt");

-- CreateIndex
CREATE INDEX "Entity_updatedAt_idx" ON "Entity"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_identifier_blueprintId_organizationId_tenantId_key" ON "Entity"("identifier", "blueprintId", "organizationId", "tenantId");

-- CreateIndex
CREATE INDEX "EntityHistory_entityId_idx" ON "EntityHistory"("entityId");

-- CreateIndex
CREATE INDEX "EntityHistory_blueprintId_idx" ON "EntityHistory"("blueprintId");

-- CreateIndex
CREATE INDEX "EntityHistory_entityIdentifier_idx" ON "EntityHistory"("entityIdentifier");

-- CreateIndex
CREATE INDEX "EntityHistory_propertyName_idx" ON "EntityHistory"("propertyName");

-- CreateIndex
CREATE INDEX "EntityHistory_changedAt_idx" ON "EntityHistory"("changedAt");

-- CreateIndex
CREATE INDEX "EntityHistory_organizationId_idx" ON "EntityHistory"("organizationId");

-- CreateIndex
CREATE INDEX "EntityHistory_tenantId_idx" ON "EntityHistory"("tenantId");

-- AddForeignKey
ALTER TABLE "EntityHistory" ADD CONSTRAINT "EntityHistory_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

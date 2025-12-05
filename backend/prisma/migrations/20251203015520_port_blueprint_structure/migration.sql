-- Drop BlueprintProperty table if it exists
DROP TABLE IF EXISTS "BlueprintProperty" CASCADE;

-- Drop Blueprint table if it exists (to recreate with new structure)
DROP TABLE IF EXISTS "Blueprint" CASCADE;

-- CreateTable: Blueprint with Port.io compatible structure
CREATE TABLE "Blueprint" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT,
    "schema" JSONB NOT NULL DEFAULT '{"properties":{},"required":[]}',
    "mirrorProperties" JSONB NOT NULL DEFAULT '{}',
    "calculationProperties" JSONB NOT NULL DEFAULT '{}',
    "aggregationProperties" JSONB NOT NULL DEFAULT '{}',
    "relations" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Blueprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blueprint_identifier_key" ON "Blueprint"("identifier");

-- CreateIndex
CREATE INDEX "Blueprint_identifier_idx" ON "Blueprint"("identifier");

CREATE TABLE "CampusPhoto" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "reviewNote" TEXT,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampusPhoto_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CampusPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "CampusPhoto_status_createdAt_id_idx" ON "CampusPhoto"("status", "createdAt", "id");
CREATE INDEX "CampusPhoto_userId_createdAt_idx" ON "CampusPhoto"("userId", "createdAt");

-- CreateTable
CREATE TABLE "PreTrained" (
    "id" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "nextPlayer" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "move" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreTrained_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateObject" (
    "key" TEXT NOT NULL,
    "bytes" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivateObject_pkey" PRIMARY KEY ("key")
);

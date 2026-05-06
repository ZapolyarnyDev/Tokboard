-- CreateEnum
CREATE TYPE "BoardObjectType" AS ENUM ('TEXT', 'IMAGE', 'SHAPE');

-- CreateEnum
CREATE TYPE "ShapeKind" AS ENUM ('LINE', 'RECTANGLE', 'TRIANGLE', 'CIRCLE', 'POLYGON');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'TEAMLEAD');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardObject" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "BoardObjectType" NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "boardId" INTEGER NOT NULL,

    CONSTRAINT "BoardObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextObjectData" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "fontSize" DOUBLE PRECISION,
    "fontColor" TEXT,
    "boardObjectId" TEXT NOT NULL,

    CONSTRAINT "TextObjectData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageObjectData" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "boardObjectId" TEXT NOT NULL,

    CONSTRAINT "ImageObjectData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShapeObjectData" (
    "id" TEXT NOT NULL,
    "kind" "ShapeKind" NOT NULL,
    "strokeColor" TEXT,
    "fillColor" TEXT,
    "strokeWidth" DOUBLE PRECISION,
    "points" JSONB,
    "boardObjectId" TEXT NOT NULL,

    CONSTRAINT "ShapeObjectData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "BoardObject_boardId_idx" ON "BoardObject"("boardId");

-- CreateIndex
CREATE INDEX "BoardObject_type_idx" ON "BoardObject"("type");

-- CreateIndex
CREATE UNIQUE INDEX "TextObjectData_boardObjectId_key" ON "TextObjectData"("boardObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ImageObjectData_boardObjectId_key" ON "ImageObjectData"("boardObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ShapeObjectData_boardObjectId_key" ON "ShapeObjectData"("boardObjectId");

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardObject" ADD CONSTRAINT "BoardObject_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextObjectData" ADD CONSTRAINT "TextObjectData_boardObjectId_fkey" FOREIGN KEY ("boardObjectId") REFERENCES "BoardObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageObjectData" ADD CONSTRAINT "ImageObjectData_boardObjectId_fkey" FOREIGN KEY ("boardObjectId") REFERENCES "BoardObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShapeObjectData" ADD CONSTRAINT "ShapeObjectData_boardObjectId_fkey" FOREIGN KEY ("boardObjectId") REFERENCES "BoardObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

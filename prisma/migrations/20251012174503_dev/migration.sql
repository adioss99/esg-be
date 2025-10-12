-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOrder" (
    "id" SERIAL NOT NULL,
    "referenceNo" VARCHAR(50) NOT NULL,
    "modelName" VARCHAR(100) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QCInspection" (
    "id" SERIAL NOT NULL,
    "productionId" INTEGER NOT NULL,
    "inspectorId" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QCInspection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionOrder_referenceNo_key" ON "ProductionOrder"("referenceNo");

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspection" ADD CONSTRAINT "QCInspection_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "ProductionOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspection" ADD CONSTRAINT "QCInspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

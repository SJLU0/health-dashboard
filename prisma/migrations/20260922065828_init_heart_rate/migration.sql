-- CreateTable
CREATE TABLE "HeartRateMeasurement" (
    "id" SERIAL NOT NULL,
    "deviceUuid" TEXT NOT NULL,
    "bpm" INTEGER NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeartRateMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeartRateMeasurement_deviceUuid_measuredAt_key" ON "HeartRateMeasurement"("deviceUuid", "measuredAt");

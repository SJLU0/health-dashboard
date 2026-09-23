import prisma from "../utils/prisma";

// 定義 Repository 新增心率時需要接收的資料
interface CreateHeartRateData {
  deviceUuid: string;
  bpm: number;
  measuredAt: Date;
}

// 將一筆心率測量資料寫入 PostgreSQL
export function createHeartRateMeasurement(data: CreateHeartRateData) {
  return prisma.heartRateMeasurement.create({
    data: {
      deviceUuid: data.deviceUuid,
      bpm: data.bpm,
      measuredAt: data.measuredAt,
    },
  });
}
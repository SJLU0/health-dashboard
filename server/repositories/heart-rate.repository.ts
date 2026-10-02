import prisma from "../utils/prisma";
// 此 Repository 集中處理 HeartRateMeasurement 資料表的資料存取操作。

// 定義 Repository 新增心率時需要接收的資料
interface CreateHeartRateData {
  deviceUuid: string;
  bpm: number;
  measuredAt: Date;
}

// 新增一筆資料：將一筆心率測量資料寫入 PostgreSQL
export function createHeartRateMeasurement(data: CreateHeartRateData) {
  return prisma.heartRateMeasurement.create({
    data: {
      deviceUuid: data.deviceUuid,
      bpm: data.bpm,
      measuredAt: data.measuredAt,
    },
  });
}

// 依照測量時間由新到舊排序，取得最新一筆心率資料
export function getLatestHeartRateMeasurement() {
  return prisma.heartRateMeasurement.findFirst({
    orderBy: {
      measuredAt: "desc",
    },
  });
}

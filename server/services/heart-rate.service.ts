import { createHeartRateMeasurement } from "../repositories/heart-rate.repository";

// 定義 createHeartRateService 函式接收的原始輸入資料。
interface CreateHeartRateServiceInput {
  deviceUuid: unknown;
  bpm: unknown;
  measuredAt: unknown;
}

export function createHeartRateService(
  input: CreateHeartRateServiceInput,
) {
  // deviceUuid 不是字串型別、是空字串時拋錯
  if (
    typeof input.deviceUuid !== "string" ||
    input.deviceUuid.trim() === ""
  ) {
    throw new Error("deviceUuid 必須不是空字串");
  }

  // BPM 型別不是數字、不是整數，或小於等於 0 時拋錯
  if (
    typeof input.bpm !== "number" ||
    !Number.isInteger(input.bpm) ||
    input.bpm <= 0
  ) {
    throw new Error("bpm 必須是大於 0 的整數");
  }
  // measuredAt 不是字串或為空字串時拋錯
  if (
    typeof input.measuredAt !== "string" ||
    input.measuredAt.trim() === ""
  ) {
    throw new Error("measuredAt 必須不是空字串");
  }
  // 將 ISO 時間字串轉換成 JavaScript Date。
  const measuredAt = new Date(input.measuredAt);

  // 如果 measuredAt 是無效日期，就拋錯
  if (Number.isNaN(measuredAt.getTime())) {
    throw new Error("measuredAt 必須是有效的日期時間");
  }

  // 將驗證完成的資料交給 Repository 寫入資料庫。
  return createHeartRateMeasurement({
    deviceUuid: input.deviceUuid.trim(),
    bpm: input.bpm,
    measuredAt,
  });

}
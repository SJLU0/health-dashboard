import { createHeartRateService } from "../services/heart-rate.service";

export default defineEventHandler(
  async function createHeartRateController(event) {
    // 讀取 POST 請求傳入的 JSON
    const body = await readBody(event);

    // 將資料交給 Service 驗證並寫入資料庫。
    const heartRateMeasurement = await createHeartRateService(body);

    // 新增成功，設定 HTTP 狀態碼為 201 Created。
    setResponseStatus(event, 201);

    // 將新增完成的心率資料回傳給呼叫端。
    return {
      success: true,
      data: heartRateMeasurement,
    };
  }
);
import { createHeartRateService } from "../services/heart-rate.service";

export default defineEventHandler(
  async function createHeartRateController(event) {
    // 讀取 POST 請求傳入的 JSON
    const body = await readBody(event);

    // 將資料交給 Service 驗證並寫入資料庫。
    const createdHeartRateMeasurement = await createHeartRateService(body);

    //201 建立一筆新資料成功
    setResponseStatus(event, 201);

    // 將新增完成的心率資料回傳給呼叫端。
    return {
      success: true,
      data: createdHeartRateMeasurement,
    };
  }
);

import { getLatestHeartRateService } from "../services/heart-rate.service";

export default defineEventHandler(
  async function getLatestHeartRateController(event) {
    const foundHeartRateMeasurement = await getLatestHeartRateService();

    // 查詢成功，設定 HTTP 狀態碼為 200 OK。
    setResponseStatus(event, 200);

    return {
      success: true,
      data: foundHeartRateMeasurement,
    };
  },
);

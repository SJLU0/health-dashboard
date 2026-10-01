// 手錶畫面元件
import * as hmUI from "@zos/ui";
// 心率感測器
import { HeartRate } from "@zos/sensor";
// 保存這次 Mini App 安裝專屬的手錶識別碼
import { LocalStorage } from "@zos/storage";
// App 日誌工具
import { log as Logger } from "@zos/utils";
// Zepp OS Device App 與 Side Service 的通訊基底
import { BasePage } from "@zeppos/zml/base-page";
// 不同錶面尺寸共用的按鈕與文字樣式
import {
  FETCH_BUTTON,
  FETCH_RESULT_TEXT,
} from "zosLoader:./index.[pf].layout.js";

// 建立此頁面的日誌記錄器
const logger = Logger.getLogger("health_sync");

// 建立心率感測器實例
const heartRate = new HeartRate();

// 建立 Device App（手錶）的本機儲存空間
const localStorage = new LocalStorage();

// 讀取既有識別碼；第一次執行時建立並保存一組新的識別碼
function getOrCreateDeviceUuid() {
  const savedDeviceUuid = localStorage.getItem("deviceUuid");

  if (typeof savedDeviceUuid === "string" && savedDeviceUuid !== "") {
    return savedDeviceUuid;
  }

  const newDeviceUuid = `bip6-${Date.now()}-${Math.floor(Math.random() * 1000000000)}`;

  localStorage.setItem("deviceUuid", newDeviceUuid);

  return newDeviceUuid;
}

// 同一次安裝會持續使用相同的手錶識別碼
const deviceUuid = getOrCreateDeviceUuid();

// 保存顯示心率結果的文字元件，避免重複建立
let textWidget;

// 註冊手錶上的 Device App 頁面
Page(
  BasePage({
    state: {},

    // 建立頁面上的「讀取心率」按鈕
    build() {
      hmUI.createWidget(hmUI.widget.BUTTON, {
        ...FETCH_BUTTON,
        click_func: () => {
          logger.log("read heart rate");
          this.readHeartRate();
        },
      });
    },

    // 讀取最近一次心率，顯示於手錶並傳給手機 Side Service
    readHeartRate() {
      // 從 Bip 6 取得最近一次保存的心率
      const bpm = heartRate.getLast();

      logger.log(`latest heart rate: ${bpm}`);

      // 有有效心率時顯示 BPM，否則顯示沒有資料
      const text =
        typeof bpm === "number" && bpm > 0
          ? `${bpm} BPM`
          : "No heart rate data";

      // 第一次建立文字元件，之後只更新文字內容
      if (!textWidget) {
        textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
          ...FETCH_RESULT_TEXT,
          text,
        });
      } else {
        textWidget.setProperty(hmUI.prop.TEXT, text);
      }

      // 無效的心率不傳送給 Side Service
      if (typeof bpm !== "number" || bpm <= 0) {
        return;
      }

      const measuredAt = new Date().toISOString();

      // 透過 Bluetooth 將心率傳給手機 Zepp App 裡的 Side Service
      this.request({
        method: "UPLOAD_HEART_RATE",
        params: {
          deviceUuid,
          bpm,
          measuredAt,
        },
      })
        // 記錄 Side Service 成功回傳的結果
        .then((data) => {
          logger.log(`upload response: ${JSON.stringify(data)}`);
        })
        // 記錄傳送或回應過程中發生的錯誤
        .catch((error) => {
          logger.log(`upload error: ${JSON.stringify(error)}`);
        });
    },
  }),
);

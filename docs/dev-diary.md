# 開發紀錄

本文件從 2026 年 10 月開始，按日期記錄每日進度、理解與待處理事項。9 月完成的環境建置與開發成果記錄於 [`sep-milestones.md`](./sep-milestones.md)，系統目前的設計則以 [`architecture.md`](./architecture.md) 為準。

## 2026-10-01

### 今日進度

- 使用 Postman 呼叫 `POST /api/heart-rates`，成功取得 `201 Created`。(raw body 需選擇 JSON，請求才會以 `application/json` 傳送)
- 透過 Prisma Studio 確認測試心率資料已寫入 PostgreSQL 的 `HeartRateMeasurement` 資料表。
- 已驗證目前的測試資料流：Postman → Nuxt/Nitro API → Service → Repository → Prisma → PostgreSQL。
- 已將 Amazfit Bip 6 的真實心率，透過 Device App（手錶）與 Side Service（手機）傳至 Nuxt API（後端），並成功寫入 PostgreSQL（資料庫）。

### 今日理解

- Nitro 是 Nuxt 使用的後端伺服器引擎，`server/api` 內的檔案會建立 API 路由。
- 在 Nitro 中，未被 Controller 攔截的 `throw new Error(...)` 會被視為未預期的伺服器錯誤，預設回傳 `500 Internal Server Error`。目前 Service 的輸入驗證使用這種方式拋錯，因此即使是呼叫端資料錯誤，也會收到 `500`。
- 呼叫端輸入錯誤應由 Controller 攔截，再使用 `createError()` 指定 `statusCode: 400`，回傳 `400 Bad Request`；只有未預期的程式或資料庫錯誤才應保留為 `500 Internal Server Error`。

### 待處理

- 建立 `GET /api/heart-rates`，讓 Nuxt Vue 前端可以讀取真實心率資料。

### 10-01 完成真實心率寫入流程

```text
┌──────────────────────────────┐
│ Amazfit Bip 6（手錶）         │
│                              │
│ Device App                   │
│ - 取得真實 BPM                │
│ - 取得 deviceUuid             │
│ - 建立 measuredAt             │
└──────────────┬───────────────┘
               │
               │ this.request()
               │ Bluetooth
               ▼
┌──────────────────────────────┐
│ Zepp App（手機）              │
│                              │
│ Side Service                 │
│ - 接收心率資料                 │
│ - 使用 fetch() 發送 POST       │
└──────────────┬───────────────┘
               │
               │ HTTP POST
               │ /api/heart-rates
               ▼
┌──────────────────────────────┐
│ Nuxt API（後端／Mac）          │
│                              │
│ Controller                   │
│     ↓                        │
│ Service                      │
│     ↓                        │
│ Repository                   │
└──────────────┬───────────────┘
               │
               │ Prisma Client
               ▼
┌──────────────────────────────┐
│ PostgreSQL（資料庫／Mac）      │
│                              │
│ HeartRateMeasurement         │
│ - deviceUuid                 │
│ - bpm                        │
│ - measuredAt                 │
│ - createdAt                  │
└──────────────────────────────┘
```

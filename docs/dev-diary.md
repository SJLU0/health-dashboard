# 開發紀錄

本文件記錄專案每天的實作成果、驗證結果、學習重點、技術決策與後續工作。系統目前的設計以 [`architecture.md`](./architecture.md) 為準，實際程式碼變更則以 Git commit 為準。

## 2026-09-30

### 截至今日完成的里程碑

#### Zepp OS 與 Amazfit Bip 6

- 確認 Amazfit Bip 6 的 API Level 為 4.2。
- 建立 API Level 4.0 的 Zepp OS Fetch API 範例，並完成 Mini App 實機安裝。
- 確認 Bip 6 可透過 Side Service 取得官方範例的外部測試資料。
- 完成 Device App 呼叫 `HeartRate` Sensor API，取得 Bip 6 的真實心率資料。
- 完成 Device App 將心率透過 Bluetooth 傳送至手機 Side Service，並確認 Side Service 成功接收。

#### PostgreSQL 與 Prisma

- 安裝並啟動本機 PostgreSQL 18，建立 `health_dashboard` Database。
- 安裝 Prisma CLI 與 Prisma Client 6.12.0，完成初始化與 PostgreSQL 連線設定。
- 定義 `HeartRateMeasurement` Prisma Model，儲存裝置識別碼、BPM、測量時間與資料建立時間。
- 建立初始資料庫遷移紀錄，在 PostgreSQL 建立心率資料表與複合唯一索引。

#### Nuxt 前後端

- 將 Vite + Vue 3 前端轉為 Nuxt，搬移儀表板首頁、`SummaryCard` 元件與 Tailwind CSS 設定。
- 遷移過程曾在 Nuxt 4.5.2 驗證心率、步數、睡眠、壓力與血氧五張摘要卡片可正常顯示。
- 為了對齊目標職缺與常見既有企業專案，將專案調整為 Nuxt 3.21.11。
- 保留 `app/` 作為 Vue 前端原始碼目錄，並保留根目錄 `server/` 作為 Nitro 後端目錄。
- 建立心率資料的 Controller、Service 與 Repository 分層。

### 今日驗證

- 成功啟動 Nuxt 3 開發伺服器，現有頁面可在 `http://localhost:3000` 顯示。
- 使用 Postman 呼叫 `POST /api/heart-rates`，成功取得 `201 Created`。
- 透過 Prisma Studio 確認測試心率資料已寫入 PostgreSQL 的 `HeartRateMeasurement` 資料表。
- 已驗證目前的測試資料流：Postman → Nuxt/Nitro API → Service → Repository → Prisma → PostgreSQL。

### 今日理解

- Nitro 是 Nuxt 使用的後端伺服器引擎，`server/api` 內的檔案會建立 API 路由。
- Postman 的 raw body 需選擇 JSON，請求才會以 `application/json` 傳送。
- `measuredAt` 代表手錶的實際測量時間，`createdAt` 代表資料寫入資料庫的時間。
- 呼叫端輸入錯誤應回傳 `400 Bad Request`，非預期的伺服器或資料庫錯誤才應回傳 `500 Internal Server Error`。

### 技術決策

- 為了對齊目標職缺與常見既有企業專案，目前採用 Nuxt 3.21.11。
- Nuxt 3 已結束官方一般維護；若未來要正式上線，需重新評估 Nuxt 4 升級與安全維護。
- Service 使用自訂輸入型別與手寫驗證，避免 Controller 直接操作 Prisma。
- Repository 專注於資料庫存取，Service 負責輸入驗證與測量時間轉換。

### 待處理

- 將心率輸入驗證錯誤從 `500 Internal Server Error` 調整為 `400 Bad Request`。
- 將重複的 `deviceUuid + measuredAt` 資料回傳為 `409 Conflict`。
- 建立 `GET /api/heart-rates` 供 Nuxt Vue 前端查詢。
- 將 Zepp Side Service 串接到 Nuxt API，改用 Amazfit Bip 6 真實心率資料驗證寫入流程。
- 從 Device App 讀取血氧與睡眠資料。
- 定義血氧與睡眠的 Prisma 資料模型與資料庫遷移紀錄。
- 將 Nuxt 前端接上真實儀表板 API。

# 9 月里程碑

本文件記錄 2026 年 9 月完成的開發環境建置與專案基礎成果。系統目前的設計以 [`architecture.md`](./architecture.md) 為準，10 月起的每日進度記錄於 [`dev-diary.md`](./dev-diary.md)。

## Zepp OS 與 Amazfit Bip 6

- 確認 Amazfit Bip 6 的 API Level 為 4.2。
- 建立 API Level 4.0 的 Zepp OS Fetch API 範例，並完成 Mini App 實機安裝。
- 確認 Bip 6 可透過 Side Service 取得官方範例的外部測試資料。
- 完成 Device App 呼叫 `HeartRate` Sensor API，取得 Bip 6 的真實心率資料。
- 完成 Device App 將心率透過 Bluetooth 傳送至手機 Side Service，並確認 Side Service 成功接收。

## PostgreSQL 與 Prisma

- 安裝並啟動本機 PostgreSQL 18，建立 `health_dashboard` Database。
- 安裝 Prisma CLI 與 Prisma Client 6.12.0，完成初始化與 PostgreSQL 連線設定。
- 定義 `HeartRateMeasurement` Prisma Model，儲存裝置識別碼、BPM、測量時間與資料建立時間。
- 建立初始資料庫遷移紀錄，在 PostgreSQL 建立心率資料表與複合唯一索引。

## Nuxt 前後端

- 將 Vite + Vue 3 前端轉為 Nuxt，搬移儀表板首頁、`SummaryCard` 元件與 Tailwind CSS 設定。
- 遷移過程曾在 Nuxt 4.5.2 驗證心率、步數、睡眠、壓力與血氧五張摘要卡片可正常顯示。
- 為了模仿常見既有企業專案，將專案從 Nuxt 4.5.2 調整為 Nuxt 3.21.11。
- 保留 `app/` 作為 Vue 前端原始碼目錄，並保留根目錄 `server/` 作為 Nitro 後端目錄。
- 建立心率資料的 Controller、Service 與 Repository 分層。
- 成功啟動 Nuxt 3 開發伺服器，確認現有儀表板可以正常顯示。

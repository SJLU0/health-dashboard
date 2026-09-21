# 專案技術架構

## 專案目標

將 Amazfit Bip 6 取得的感測資料，透過 Zepp OS Mini App 與手機上的 Side Service 傳送至 Nuxt API，儲存於 PostgreSQL，最後由 Nuxt 前端呈現健康摘要與趨勢。

第一階段只處理手錶可取得的感測資料：

- 心率 `HEART_RATE`
- 血氧 `SPO2`
- 睡眠摘要與睡眠階段 `SLEEP`

## 系統資料流

```text
Amazfit Bip 6 感測器
          │
          ▼
Zepp OS Device App
  - 讀取心率、血氧與睡眠資料
          │ Bluetooth
          ▼
Zepp App Side Service
  - 接收 Device App 資料
  - 透過 HTTPS POST 上傳
          │
          ▼
Nuxt Server API (Nitro)
  Route → Controller → Service → Repository
          │ Prisma
          ▼
PostgreSQL
          │
          ▼
Nuxt Vue 前端
  - 使用 useFetch / $fetch 查詢 API
  - 顯示健康摘要與趨勢圖表
```

Device App 不直接連線 PostgreSQL。手錶與 Side Service 之間使用藍牙通訊，對外網路請求由手機上的 Side Service 負責。

## 應用分層

### Zepp OS Mini App

- **Device App**：讀取感測資料、處理手錶上的交互，並將資料交給 Side Service。
- **Side Service**：運行於手機 Zepp App，負責藍牙訊息處理、HTTP 請求與錯誤回應。

### Nuxt Server

- **Route**：使用 `server/api` 定義 URL 與 HTTP Method。
- **Controller**：讀取請求、執行輸入驗證並回傳 HTTP Response。
- **Service**：處理感測資料轉換、去重、時間標準化與儀表板摘要邏輯。
- **Repository**：集中封裝 Prisma 查詢，不處理 HTTP 細節。
- **Schema**：使用 Zod 驗證 Zepp Side Service 傳入的 JSON。

### Nuxt Vue 前端

- 使用 Vue 3 Composition API 建立儀表板。
- 使用 Nuxt `useFetch` 或 `$fetch` 存取內部 API。
- 顯示心率、血氧與睡眠的摘要及趨勢。

## 目標 Repository 結構

```text
health-dashboard/
├── app/                              # Nuxt Vue 前端
│   ├── components/
│   └── pages/
├── server/                           # Nuxt Nitro 後端
│   ├── api/                      # Route
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── schemas/
│   └── utils/
├── shared/
│   └── types/                    # 前後端共用型別
├── prisma/
│   └── schema.prisma             # PostgreSQL 資料模型
├── zepp-app/                         # Zepp OS Device App + Side Service
├── nuxt.config.ts
└── package.json
```

## 預計 API

```text
POST /api/measurements   # 上傳心率或血氧
POST /api/sleep          # 上傳睡眠摘要與階段
GET  /api/dashboard      # 取得儀表板摘要
```

## 資料處理原則

- 時間以 UTC 儲存，顯示時再轉換成使用者時區。
- 心率與血氧使用「裝置、類型、測量時間」識別重複資料。
- 睡眠資料保留原始開始與結束時間，跨日轉換由 Service 集中處理。
- Zepp 裝置識別資料、API 金鑰與資料庫連線資訊不寫入版本控制。

## 目前進度

### 已完成

- 確認 Amazfit Bip 6 的 API Level 為 4.2。
- 建立 API Level 4.0 的 Zepp OS Fetch API 範例。
- 完成 Mini App 在 Bip 6 的實機安裝。
- 確認 Bip 6 可透過 Side Service 取得官方範例的外部測試資料。

### 待完成

- 從 Device App 讀取心率、血氧與睡眠資料。
- 將感測資料透過 Side Service POST 至自有 Nuxt API。
- 建立 Nuxt Controller、Service 與 Repository 分層。
- 建立 Prisma 資料模型與 PostgreSQL 資料表。
- 將前端轉為 Nuxt，並接上真實儀表板 API。

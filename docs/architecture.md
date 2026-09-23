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

#### 感測資料取得方式

Zepp OS 不會自動把手錶的健康資料送到本專案後端。
專案需要在 Zepp OS Mini App 的 Device App 中撰寫 JavaScript，依資料類型呼叫 Zepp OS 官方開放的 Sensor API。這裡修改的是本專案的 Mini App，不是修改手機上的官方 Zepp App。

Device App 運行在 Amazfit Bip 6，程式主要位於 `zepp-health-sync-app/page/`。讀取感測資料前，需要先在 `zepp-health-sync-app/app.json` 宣告對應權限，再從 `@zos/sensor` 引入感測器 API。例如心率使用 `HeartRate`：

```js
import { HeartRate } from "@zos/sensor";

const heartRate = new HeartRate();
const bpm = heartRate.getLast();
```

不同資料需要呼叫不同的官方 API：

```text
心率 → HeartRate
血氧 → BloodOxygen
睡眠 → Sleep
```

Device App 取得資料後，使用 ZML 的 `this.request()`，透過 Bluetooth 將資料傳給手機 Zepp App 中運行的 Side Service。Side Service 程式位於 `zepp-health-sync-app/app-side/`，使用 `onRequest()` 接收 Device App 的訊息，再以 `fetch()` 將資料 POST 至 Nuxt API。

```text
【硬體：Amazfit Bip 6】
【軟體：Device App JavaScript】
呼叫 Zepp OS Sensor API 取得感測資料
          ↓ this.request()／Bluetooth
【硬體：手機】
【軟體：官方 Zepp App 中的 Side Service】
接收感測資料
          ↓ fetch()／HTTPS POST
【硬體：Mac 或伺服器】
【軟體：Nuxt Server API】
```

Device App 負責呼叫手錶感測器；Side Service 本身不直接讀取手錶感測器，只負責接收 Device App 傳來的資料並連接外部網路。

### Nuxt Server

- **Route**：使用 `server/api` 定義 URL 與 HTTP Method。
- **Controller**：讀取請求、執行輸入驗證並回傳 HTTP Response。
- **Service**：處理感測資料轉換、去重、時間標準化與儀表板摘要邏輯。
- **Repository**：集中封裝 Prisma 查詢，不處理 HTTP 細節。
- **Schema**：使用 Zod 驗證 Zepp Side Service 傳入的 JSON。

### PostgreSQL 與 Prisma

- **PostgreSQL 18**：負責實際儲存健康資料，專案使用 `health_dashboard` Database 與預設 `public` Schema。
- **Prisma CLI 6.12.0**：開發階段用於管理資料模型、建立 Migration 與產生 Prisma Client。
- **Prisma Client 6.12.0**：由 Repository 層使用，以型別安全的 API 查詢 PostgreSQL。
- **PostgreSQL Connector**：第一階段使用 Prisma 內建 Connector，暫不額外引入 `pg` Driver Adapter。
- **Prisma Schema**：使用 `prisma/schema.prisma` 定義 Model、欄位、關聯、唯一約束與索引。
- **Migration**：由 Prisma Migrate 根據 Schema 建立及變更資料表，不在 GUI 中手動維護表結構。

Prisma 不取代 PostgreSQL，而是位於 Nuxt Repository 與 PostgreSQL 之間的資料存取層：

```text
Repository → Prisma Client → PostgreSQL Connector → PostgreSQL
```

#### Prisma 功能與常用指令

以下指令均在 `health-dashboard` 專案根目錄執行，並需先確認 Postgres.app 處於 Running。

| 功能 | 在本專案的用途 | 常用指令或位置 |
| --- | --- | --- |
| Prisma Schema | 定義 Model、欄位、關聯、唯一條件與索引 | `prisma/schema.prisma` |
| Format | 統一 `schema.prisma` 排版 | `npx prisma format` |
| Validate | 檢查 Schema 與 Prisma 設定是否有效 | `npx prisma validate` |
| Prisma Migrate Dev | 開發時根據 Schema 變更產生 SQL、建立資料庫遷移紀錄並套用到本機 PostgreSQL | `npx prisma migrate dev --name <change_name>` |
| Migration Status | 檢查資料庫是否已套用所有 Migration | `npx prisma migrate status` |
| Prisma Migrate Deploy | 未來部署時套用已納入版控的 Migration，不產生新 Migration | `npx prisma migrate deploy` |
| Prisma Generate | 根據 Schema 重新產生 Prisma Client | `npx prisma generate` |
| Prisma Client | 供 Nuxt Repository 以 `create`、`findFirst`、`findMany` 等 API 讀寫 PostgreSQL | 由後端 TypeScript 程式引入使用 |
| Prisma Studio | 以瀏覽器 GUI 查看與編輯本機資料 | `npx prisma studio` |
| Prisma Seed | 未來可產生心率趨勢圖所需的本機測試資料，目前尚未設定 | `npx prisma db seed` |

Postgres.app 主畫面只顯示 Database，不會展開顯示 Schema 與 Table。`npx prisma studio` 會在瀏覽器開啟本機圖形介面，可用來查看 `HeartRateMeasurement` 的欄位與資料列。Prisma Studio 只是開發階段的查看與編輯工具，PostgreSQL 仍負責實際儲存資料。

#### 為何使用 Prisma ORM

如果後端直接操作 SQL，通常需要自行處理：

```text
建立資料庫連線
準備 SQL
放入查詢參數
執行查詢
讀取查詢結果
將結果轉換成 TypeScript 物件
處理資料庫錯誤
```

Prisma ORM 不是取代 PostgreSQL，而是在 Nuxt 後端與 SQL 之間提供較高階的資料存取 API。Prisma Client 將常見 CRUD 操作包裝成方法：

```text
create()     # 新增資料
findFirst()  # 查詢第一筆符合條件的資料
findMany()   # 查詢多筆資料
update()     # 更新資料
delete()     # 刪除資料
upsert()     # 存在時更新，不存在時新增
```

因此 Prisma 的定位是將常見 SQL 操作轉為有 TypeScript 型別與自動補全的 API，降低重複程式與欄位型別錯誤。後端仍需要理解資料表、索引、關聯、交易與查詢效能；複雜查詢必要時仍可使用原生 SQL。

#### 資料庫結構變更流程

```text
修改 prisma/schema.prisma
          ↓
npx prisma format / validate
          ↓
npx prisma migrate dev --name <change_name>
          ↓
產生 migration.sql 並更新 PostgreSQL
          ↓
重新產生 Prisma Client
```

`prisma/schema.prisma`、`prisma/migrations/` 與 `prisma.config.ts` 需要納入版本控制；`.env`、本機 PostgreSQL 資料與自動產生的 Prisma Client 不納入版本控制。

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
├── zepp-health-sync-app/             # Zepp OS Device App + Side Service
├── nuxt.config.ts
└── package.json
```

## 預計 API

```text
POST /api/heart-rates   # 上傳心率
POST /api/spo2          # 上傳血氧
POST /api/sleep         # 上傳睡眠摘要與階段
GET  /api/dashboard     # 取得儀表板摘要
```

## 資料處理原則

- 時間以 UTC 儲存，顯示時再轉換成使用者時區。
- 心率與血氧分別使用獨立資料表與 API，避免不同健康資料的欄位與邏輯相互影響。
- 心率使用「裝置識別碼、測量時間」作為複合唯一條件，避免重複儲存同一筆資料。
- 睡眠資料保留原始開始與結束時間，跨日轉換由 Service 集中處理。
- Zepp 裝置識別資料、API 金鑰與資料庫連線資訊不寫入版本控制。
- PostgreSQL 連線字串儲存在 `.env`，並將 `.env` 排除於版本控制。

## 目前進度

### 已完成

- 確認 Amazfit Bip 6 的 API Level 為 4.2。
- 建立 API Level 4.0 的 Zepp OS Fetch API 範例。
- 完成 Mini App 在 Bip 6 的實機安裝。
- 確認 Bip 6 可透過 Side Service 取得官方範例的外部測試資料。
- 完成 Device App 呼叫 `HeartRate` Sensor API，取得 Bip 6 的真實心率資料。
- 完成 Device App 將心率透過 Bluetooth 傳送至手機 Side Service，並確認 Side Service 成功接收。
- 安裝並啟動本機 PostgreSQL 18。
- 建立 `health_dashboard` Database。
- 安裝 Prisma CLI 與 Prisma Client 6.12.0。
- 完成 Prisma 初始化與 PostgreSQL 連線設定。
- 定義 `HeartRateMeasurement` Prisma Model，儲存裝置識別碼、BPM、測量時間與資料建立時間。
- 建立初始資料庫遷移紀錄，在 PostgreSQL 建立心率資料表與複合唯一索引。
- 將 Vite + Vue 3 前端轉為 Nuxt 4，搬移現有儀表板首頁、`SummaryCard` 元件與 Tailwind CSS 設定。
- 完成 Nuxt 4.5.2 開發伺服器啟動驗證，並確認心率、步數、睡眠、壓力與血氧五張摘要卡片可正常顯示。

### 待完成

- 從 Device App 讀取血氧與睡眠資料。
- 將感測資料透過 Side Service POST 至自有 Nuxt API。
- 建立 Nuxt Controller、Service 與 Repository 分層。
- 定義血氧與睡眠的 Prisma 資料模型與資料庫遷移紀錄。
- 將 Nuxt 前端接上真實儀表板 API。

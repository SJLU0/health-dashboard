# 專案技術架構

## 專案目標

將 Amazfit Bip 6 蒐集的健康資料，透過 Zepp OS Mini App 與 Side Service 傳送至後端，再由以 Vue 3 為核心的網頁前端呈現健康摘要與趨勢圖表。

## 資料流

```text
Amazfit Bip 6
      ↓
Zepp OS Mini App
      ↓
Side Service
      ↓ HTTP POST

┌──────── BACKEND ────────┐
│ Spring Boot             │
│ Spring Web              │
│ Spring Data JPA         │
│ Spring Validation       │
│ Maven                   │
│ PostgreSQL              │
└───────────┬─────────────┘
            │
         REST API
            │
          Axios
            ↓
┌──────── FRONTEND ───────┐
│ Vue 3 + TypeScript      │
│ Composition API         │
│ Pinia                   │
│ Vue Router              │
│ Tailwind CSS            │
│ ECharts                 │
└─────────────────────────┘
```

## Repository 規劃

```text
health-dashboard/
├── frontend/
│   ├── Vue 3 + TypeScript
│   ├── Composition API
│   ├── Vue Router
│   ├── Tailwind CSS
│   ├── Pinia
│   ├── Axios
│   └── ECharts
└── backend/
    ├── Spring Boot
    ├── Spring Web
    ├── Spring Data JPA
    ├── Spring Validation
    ├── Maven
    └── PostgreSQL
```

## 系統職責

- **Amazfit Bip 6**：蒐集穿戴式裝置的健康資料。
- **Zepp OS Mini App**：取得手錶資料並交由 Side Service 處理。
- **Side Service**：透過 HTTP POST 將資料傳送到後端。
- **Backend**：驗證、儲存健康資料，並提供 REST API。
- **Frontend**：本專案的主要開發重點，負責狀態管理、資料查詢、路由，以及健康資料的圖表與儀表板呈現。

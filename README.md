# BikeMap(單車地圖)
## 使用技術(Skill List)
`Nuxt.js 2`: Vue.js SSR Framework(Vue 2.6 / Nuxt 2.15,以 `nuxt generate` 產生靜態網站部署到 GitHub Pages)

`Vuex`: Vue.js State Manager(元件之間以 store 的狀態與 action 溝通,不使用 props / events)

`Axios`: Promise based HTTP client for the browser and node.js(`@nuxtjs/axios`,請求前自動帶入 TDX OAuth2 Bearer token)

`MapBox GL JS`: World Map plugin(v2.6,地圖、標記、彈窗與單車路線圖層)

`TDX API`: 交通部運輸資料流通服務,提供單車、單車路線與觀光資訊(OAuth2 Client Credentials 認證)

`Pug`: HTML Preprocessor

`Sass`: CSS Preprocessor(縮排語法 `.sass`,透過 `@nuxtjs/style-resources` 全域注入 mixin)

`PWA`: `@nuxtjs/pwa`,提供 manifest 與圖示

## 資料來源(Data Source)
[TDX 運輸資料流通服務](https://tdx.transportdata.tw/)(原 PTX,由交通部提供)

| 用途 | 端點(`https://tdx.transportdata.tw/api/` 之後) |
| --- | --- |
| 縣市單車站點 / 可租借數量 | `basic/v2/Bike/Station/City/{City}`、`basic/v2/Bike/Availability/City/{City}` |
| 縣市單車路線 | `basic/v2/Cycling/Shape/City/{City}` |
| 附近單車站點 / 可租借數量 | `advanced/v2/Bike/Station/NearBy`、`advanced/v2/Bike/Availability/NearBy` |
| 附近觀光資訊 | `tourism/service/odata/V2/Tourism/Nearby?X={經度}&Y={緯度}&Distance={公尺}` |
| 觀光資訊詳細資料 | `tourism/service/odata/V2/Tourism/` 之下的 `Restaurant/{id}`、`Attraction/{id}`、`Hotel/{id}`、`Event/{id}`、`TourismServiceSite/{id}` |

> 觀光資訊 V1.0(`Tourism/{類別}/{City}`)已於 2026/06/30 下架,本專案已改接交通部觀光署【觀光資料 V2.1】。
>
> `Nearby` 不接受 `$format` 參數(帶了會回 400)。TDX 對 API 呼叫頻率限制很嚴(超過會回 429),詳細資料每個地點只會查詢一次並快取。

## 開始使用(Getting Started)
### 1. 申請 TDX 金鑰
到 [TDX](https://tdx.transportdata.tw/) 註冊會員並取得 API 金鑰(Client ID / Client Secret),在專案根目錄建立 `.env`(已被 `.gitignore` 排除):

```
TDX_CLIENT_ID=你的 Client ID
TDX_CLIENT_SECRET=你的 Client Secret
```

Client ID 與 Client Secret 必須是同一組金鑰,否則 TDX 會回 `401 Invalid client secret`。修改 `.env` 後需要重新啟動 `npm run dev`。

網站啟動後會用金鑰向 TDX 換取 OAuth2 Bearer token(有效 24 小時,快取於記憶體,到期前自動更新)。因為這是純前端的靜態網站,金鑰會被打包進瀏覽器的 JS,請留意 TDX 後台的使用量。

### 2. 啟動
```bash
npm install
npm run dev
```
開發網址為 `http://localhost:3000/F2E-3-2/`(專案的 base path 是 `/F2E-3-2/`)。

若本機 3000 埠已被其他服務佔用(例如以 IPv6 監聽的服務),瀏覽器輸入 `localhost` 可能連到別的服務,請改用 `http://127.0.0.1:3000/F2E-3-2/` 或 `npm run dev -- --port 3001`。

### Node 版本
Nuxt 2 使用 Webpack 4,在 Node 17 以上會出現 `ERR_OSSL_EVP_UNSUPPORTED`:

- Node 16 以下:直接執行 `npm run dev`。
- Node 17 以上:`NODE_OPTIONS=--openssl-legacy-provider npm run dev`。

Node 16 以下不認得 `--openssl-legacy-provider` 這個旗標(會出現 `is not allowed in NODE_OPTIONS`),所以不能寫死在 `package.json`。

### 部署
```bash
npm run generate:gh-pages   # 產生靜態檔到 dist/
npm run deploy              # 推送 dist/ 到 gh-pages 分支
```

## 功能介紹(Provide)
### 單車租借(Bike Rent Search)
`基本搜尋(Bacic Search)`: 尋找指定縣市地點單車租借站詳細資料(站名、地點、可租借數量、未歸還數量)。

`進階顯示功能(Advance Infos)`: 選定站點後,整合站點附近 1000 公尺內的六種類別資料,每類最多顯示 10 筆,並可在畫面上方的資訊列勾選要不要顯示在地圖上:

| 類別 | 標記顏色 | 點擊標記可看到的細節 |
| --- | --- | --- |
| 餐廳 | 紅 | 地址、電話、營業時間 |
| 景點 | 綠 | 地址、電話、營業時間、票價 |
| 住宿 | 黃 | 地址、電話、營業時間 |
| 活動 | 紫 | 地址、電話、活動期間 |
| 旅遊服務站 | 橘 | 地址、電話、營業時間 |
| 捷運站 | 藍 | 僅名稱(觀光 API 沒有捷運站的詳細資料) |

- 附近搜尋只回傳 ID、名稱與座標,點擊標記時才會用 ID 查詢詳細資料,查詢期間彈窗顯示「載入中...」;資料本身沒有填寫的欄位會顯示「尚未提供」。
- 附近沒有資料的類別,勾選框會呈現 disabled(變暗、不可勾選)。
- 詳細資料的彈窗為卡片樣式:頂端色帶與類型標籤使用該類別的顏色,名稱為標題,下方依序列出各欄位。

`進階搜尋(Advance Search)`: 定位所在位置,搜尋附近距離內(250~1000m)單車租借站資料(站名、地點、可租借數量、未歸還數量、更新時間)。

- 切換搜尋範圍時,地圖上的站點標記、自己的位置點與彈窗內容會跟著更新。
- 直接點擊任一個租借站標記,就會顯示完整資訊(站名、可租借 / 未歸還、地址、更新時間),與從左側清單選站時一致。可租借數量只涵蓋最近的 10 個站,超出的站只會顯示站名與地址。
- 點擊某個租借站時,其他租借站的標記會變淡,彈窗關閉後恢復。
- 改用 `Search Path` 時,進階搜尋的內容會被清空:地圖上的附近租借站與自己的位置點、站點清單、以及選好的搜尋範圍(下拉選單回到「請選擇」)。

### 單車路線查詢(Bike Path Search)
`單車路線搜尋(Bike Path Search)`: 尋找指定縣市提供單車路線詳細資料(路線名、長度、起點、終點、地圖路線標示)

## 更新紀錄(Changelog)
### 2026-09-21
- **API**:
  - 認證由已失效的 HMAC-SHA1 簽章改為 TDX OAuth2 Bearer token,金鑰改由 `.env` 讀取。
  - 附近單車 API 改用 `advanced/v2`,其餘單車 API 使用 `basic/v2`。
  - 餐廳、景點、住宿由已下架的觀光資訊 V1.0 改接 V2.1 的 `Nearby` API,並新增「活動」、「旅遊服務站」、「捷運站」三個類別。
  - 新增以 ID 查詢詳細資料(`Restaurant` / `Attraction` / `Hotel` / `Event` / `TourismServiceSite`)並快取。
  - 觀光 API 失敗時只在主控台顯示警告,不影響單車站點搜尋。
- **功能**:
  - 進階搜尋切換範圍時同步更新地圖標記與彈窗。
  - 點擊任一附近租借站標記即顯示完整資訊,並淡化其他租借站。
  - 沒有資料的類別,勾選框改為 disabled。
  - 點擊 panel 外面會關閉 panel(資料保留),下拉選單也會自動收起。
- **介面**:
  - 資訊列改為貼齊瀏覽器右側,新增類別的色點補齊。
  - 標記詳細資料彈窗與進階搜尋租借站彈窗改為一致的卡片樣式,類型名稱改為中文。
- **修正**:
  - 每個附近租借站標記使用各自的 Popup;原本共用同一個 Popup,直接點標記時彈窗的位置與內容會錯亂。
  - 附近租借站的可租借數量改用 `StationUID` 對應,不再依賴陣列順序。
  - 自訂標記的 CSS `transition` 造成拖曳地圖時標記慢半拍滑動,現在只保留淡入淡出。
  - 標記清除:`getStationNearByMarkers` 原本把所有類別的標記都放進餐廳的陣列,`clearOldMarkers` 又只重新指派了區域變數,導致重新載入資料時舊標記不會被移除(標記會重複,點擊事件也會綁到舊標記上)。現在每個類別各自管理自己的陣列,並會真的清空。
  - `beforeDestroyed` 不是 Vue 的生命週期名稱,原本的清理函式從未執行;改為 `beforeDestroy`,離開頁面時會移除所有標記與地圖。
  - 進階搜尋後切換到 `Search Path`,附近租借站標記、自己的位置點、站點清單與搜尋範圍都沒有被清空;現在會一併清除。搜尋範圍也會重設,否則再選同一個距離不會觸發新的搜尋。

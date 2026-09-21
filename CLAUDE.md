# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

BikeMap (單車地圖): a Nuxt 2 (Vue 2, SSR-capable but deployed as a static site) app that shows bike-rental stations, cycling routes and six kinds of nearby places (restaurant, attraction, hotel, event, tourism service site, metro station) for Taiwan on a Mapbox map. Data comes from the TDX transport API (`https://tdx.transportdata.tw/api/`):

- `basic/v2/` for per-city bike stations / availability / cycling shapes, `advanced/v2/` for the "near by" bike stations / availability.
- `tourism/service/odata/V2/Tourism/` (tourism data standard V2.1) for the places: one `Nearby` call plus per-type detail endpoints. The old V1 `Tourism/{City}` endpoints were shut down.

Templates use Pug (`<template lang="pug">`) and styles use Sass (indented syntax). The README (Traditional Chinese) documents the features and has a changelog.

## Commands

- `npm run dev` — dev server (served under the `/F2E-3-2/` base path, e.g. `http://localhost:3000/F2E-3-2/`). Needs `TDX_CLIENT_ID` / `TDX_CLIENT_SECRET` in a git-ignored `.env`, and they must be the matching pair of one TDX key (otherwise the token request fails with 401 and every API call fails). Restart after editing `.env`.
- Webpack 4 fails on Node 17+ with `ERR_OSSL_EVP_UNSUPPORTED`; use Node 16 or older, or prefix the command with `NODE_OPTIONS=--openssl-legacy-provider` (Node 16 and older reject that flag, so it can't be hardcoded in `package.json`).
- If another service already listens on port 3000 over IPv6, `localhost` in the browser reaches that service instead (Nuxt only listens on IPv4); use `http://127.0.0.1:3000/F2E-3-2/` or `--port`.
- `npm run generate:gh-pages` — static build into `dist/` with `DEPLOY_ENV=GH_PAGES`
- `npm run deploy` — pushes `dist/` to the `gh-pages` branch (`push-dir`); `dist/` is committed to master too, so regenerate it when shipping changes
- `npm run build` / `npm start` / `npm run generate` — standard Nuxt commands

There is no lint or test setup.

## Architecture

- `layouts/default.vue` renders `SideMenu` (persistent) plus `<Nuxt/>`. `pages/index.vue` is the only page and owns the Mapbox map (`mapInstance`) and all markers/popups/route layers.
- **Communication is through the Vuex store, not props/events.** `store/index.js` holds the API actions and many boolean "signal" flags (`isClearMakers`, `isClearBikePath`, `basicSelect`, `updateUserPosSelect`, `loading`, `openModal`, …). Components such as `SideMenu`, `BikeRentInfo`, `BikePathInfo` and `CustomSelect` dispatch actions/set flags; `pages/index.vue` watches the corresponding state (`mapState` + `watch`) and updates the map imperatively.
- `BikeRentInfo.vue` (station search by city, or near by with geolocation and 250–1000 m radius) and `BikePathInfo.vue` (cycling route search) are the two side panels. `SideMenu` closes an open panel when the user clicks outside it (drags don't count, panel data is kept) and `CustomSelect` folds its list on any outside click. Opening `Search Path` clears the advanced search (`BikeRentInfo#resetAdvanceSearch`: store `clearNearByStation`, the chosen distance and the select via `CustomSelect#reset`; the near-by/self markers are removed by the `isClearMarkers` watcher in `pages/index.vue`). The distance must be reset too, re-picking the same value would not fire the `curMeters` watcher. `LoadingPage`/`EnterAnimation` are overlays driven by store flags.
- `plugins/axios.js` sets the TDX `baseURL` and, in a request interceptor, exchanges the client credentials (from `publicRuntimeConfig`, i.e. `.env` at build time — so the secret ends up in the client bundle) for an OAuth2 Bearer token, cached until shortly before expiry. `plugins/mapbox.js` exposes `mapbox-gl` as `Vue.prototype.$map`; the Mapbox access token is hardcoded in `pages/index.vue`.
- `nuxt.config.js`: `router.base` is `/F2E-3-2/` (also hardcoded in the favicon link) — asset/route paths must respect it. `assets/css/mixin.sass` is injected into every Sass file via `@nuxtjs/style-resources`; `@img` aliases `assets/img`. The Mapbox CSS is loaded from CDN at v1.10.0 while the npm package is v2. PWA module is enabled.

### Nearby places (six categories)

- Selecting a station dispatches `getTourismNearBy`, which makes **one** `Nearby` call (`X`=lon, `Y`=lat, `Distance`; it rejects `$format`) and commits six lists (`restaurantNearBy`, `scenicSpotNearBy`, `hotelNearBy`, `eventNearBy`, `serviceSiteNearBy`, `metroNearBy`) as `{ id, pos, name }`, max 10 each. Failures are swallowed with a warning and commit empty lists.
- Nearby has no address/phone/hours. Clicking a marker calls `pages/index.vue#getCurMarkerDetailInfo`, which opens `MarkerDetailModal` with "載入中..." and then merges the result of `getTourismDetail` (per-type endpoint and normalizer in `TOURISM_DETAIL`, results cached in `detailCache`; a 404 is cached as "no data", other errors are retried next time). Metro stations have no detail endpoint.
- TDX rate limits are strict (429 after a few quick requests, also on the token endpoint), so avoid firing many detail requests at once.
- Adding a category touches: the store (constant, state, mutation, commit in `getTourismNearBy`, `TOURISM_DETAIL`), `pages/index.vue` (marker array in `data`, `mapState`, the four places that use the marker arrays — the `getBasicSelect` watcher, the category's own watcher, the `isClearMarkers` watcher and `beforeDestroy` — plus the marker colour in the sass), `BikeRentInfo.vue` (`checkboxs` entry with `stateKey`, and the coloured dot by `nth-of-type`), and `MarkerDetailModal.vue` (`TYPE_LABELS` and the accent colour). A checkbox is disabled when its list is empty.

### Bike stations near by

- Each near-by station marker owns its own `Popup` (built by `createBikePopup`); a shared one gets repositioned by whichever marker updated last. Popup content comes from `getNearStationPopupHtml`, which matches availability to the station by `StationUID` (availability is requested with `$top=10`, so farther stations have none) and is re-read when the popup opens. `updateNearStationsFade` fades the other stations while one popup is open.
- A watcher on `stationNearBy` rebuilds the near-by markers whenever the search distance changes; it skips the rebuild when `userPos` is empty, which is how a cleared search differs from a range with no stations.
- Custom `.marker` elements must not transition `transform` (Mapbox positions markers with it, a transition makes them lag behind while the map moves); only opacity/visibility are animated.
- Mapbox popups are rendered outside the component, so their styles (`.bikePopup*`) live in the non-scoped `<style>` of `pages/index.vue`.

## Conventions

`.editorconfig`: 2-space indent, LF, final newline. Keep the README changelog in sync when behaviour changes.

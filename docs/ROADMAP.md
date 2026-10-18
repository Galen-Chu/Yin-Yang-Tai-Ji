# 開發路線 · Roadmap

里程碑對應[框架的建構順序](FRAMEWORK.md#建構順序--build-order)：先證明「光是變身就好玩」，再擴充內容與通路。

## ✅ M0 · 架構（目前）

- [x] 框架引擎 `core/`：型別、規則、純函式狀態機、手勢辨識、內容檢查
- [x] 台吉內容資料：9 地點、5 觸碰、4 季節、27 收集物、6 隱藏形態
- [x] 原型等級 UI：舞台、形態卡、地點／收集物、台吉圖鑑
- [x] `localStorage` 進度儲存（含資料淨化）
- [x] 單元測試（規則、所有隱藏形態、手勢、儲存）與 GitHub Actions CI

## M1 · 可玩版 Playable

- [ ] 部署到 GitHub Pages（需要在 repo 設定啟用 Pages → GitHub Actions）
- [ ] PWA：manifest、圖示、離線快取，可加到手機主畫面
- [ ] 在真實手機上調校手勢門檻（`DEFAULT_GESTURE_CONFIG`）
- [ ] 變身回饋：音效、觸覺回饋（`navigator.vibrate`）、新發現動畫
- [ ] 形態卡分享：把目前形態輸出成圖片
- [ ] 無障礙檢查：螢幕報讀文字、鍵盤操作流程
- [ ] ESLint＋Prettier、元件測試（React Testing Library）

## M2 · 現場打卡 Check-in

- [ ] `CheckInProvider` 介面：開發用「按鈕打卡」＋正式用「地理圍欄打卡」
- [ ] 定義每個地點的實際座標範圍（例：魚塭→台南七股，溫泉→北投）
- [ ] 隱私：位置只在裝置端比對，不上傳；首次使用說明用途
- [ ] 真實季節模式：依日期自動決定季節（保留手動切換）
- [ ] 日夜變化（框架的「時間」層允許日夜）

## M3 · 貼圖試行 Sticker pilot

- [ ] 風格指南：線條粗細、配色、表情規則
- [ ] 素材清單：原形＋5 觸碰形態
- [ ] 輸出成 LINE 貼圖規格（370×320 PNG）
- [ ] 上架後觀察：哪些形態最常被使用 → 決定下一批要擴充的地點

## M4 · 社群 Social

- [ ] 帳號與雲端同步（實作新的 `ProgressStore`）
- [ ] 真正的「朋友」：附近玩家或 QR code 邀請，取代按鈕
- [ ] 季節活動與限定隱藏形態

## 待決定的問題

- **後端選型**（M4 才需要）：Supabase / Firebase / 自架。
- **原生 App**：PWA 不足時再評估 Capacitor 或 React Native。

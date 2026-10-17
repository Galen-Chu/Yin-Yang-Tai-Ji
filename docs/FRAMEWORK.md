# 變身角色系統 · Changing-Character System

> 配方不變，每個角色都是一道新菜。照著空格填寫即可；台吉是示範。
> *The recipe stays the same; each base character is a new dish. Fill the blanks for any project. TaiJi is the worked example.*

這份框架描述「會變身的角色」該怎麼設計。它與程式碼一一對應：每個變化層都是 [`src/core/types.ts`](../src/core/types.ts) 裡的一個型別，台吉的填法在 [`src/characters/taiji/`](../src/characters/taiji/)。

---

## 一句話測試 · The one-line test

**地點・觸碰・季節・收集物 ＝ 一句聽起來像在形容一個人的話。**
*Place · Touch · Season · Item = a sentence that sounds like someone.*

> 「山巒・長按・冬・山櫻花」→ 山巒般的台吉，先抱住別人的情緒，抱緊一點，熬過寒冷才開花。
> "Ridges · Long press · Winter · Taiwan cherry blossom" → an olive-ridge TaiJi that holds others' feelings first, holds on tighter, and blooms after the cold.

如果組出來的句子不像在形容一個人，代表某一層的內容需要重寫。

---

## 變化層 · Layers

每一層**只改變自己負責的部分**。

| 層 Layer | 改變什麼 Changes | 空白模板 Template | 台吉示範 TaiJi example | 程式型別 |
| --- | --- | --- | --- | --- |
| **環境** Environment | 材質、顏色 | 它會去哪？每個地點＝角色色與對比的地面色 | 山巒、森林、梯田、水圳、峭壁、海灘、魚塭、溫泉、珊瑚礁 | `Place` |
| **觸碰＋情緒** Touch + Mood | 形狀、姿態、眼神 | 5 種手勢 → 5 種應對方式 | 跳跳・窩窩・飄飄・抖抖・繞繞 | `Touch`, `Shape` |
| **時間** Time | 世界色調＋一句特質 | 季節、日夜或真實日曆 | 夏＝原色最飽和；春淡、秋暖而沉、冬灰冷 | `Season` |
| **收集物** Items | 只加配件，不改身體 | 在哪取得：__・最多 __ 格・一物一特質 | 每個地點三件台灣在地物（共 27 件）・現場打卡取得・可帶 2 件 | `Item` |
| **互動** Others | 解鎖隱藏形態 | 跨層稀有組合＋朋友 | 6 種，各考驗不同的層組合（含觸碰順序與連鎖解鎖） | `HiddenForm` |

### 台吉的 6 個隱藏形態各考驗什麼

| 隱藏形態 | 考驗的層組合 |
| --- | --- |
| 雲海 Sea of Clouds | 地點 × 季節 × 觸碰 |
| 綿綿 MianMian | 季節 × 觸碰 × **朋友** |
| 螢河 Firefly River | 地點 × 季節 × **兩件收集物**（不需觸碰） |
| 黑潮旅人 Kuroshio Drifter | 地點 × 季節 × 觸碰 × 兩件收集物（全層） |
| 颱風眼 Typhoon Eye | 季節 × **觸碰順序**（抖抖 → 飄飄 → 繞繞） |
| 彩虹台吉 Rainbow TaiJi | **連鎖解鎖**：先發現颱風眼，再滿足地點 × 季節 × 觸碰 |

---

## 建構順序 · Build order

每個階段都有一個檢查點，沒通過就不要往下走。

### 1 · 基礎 Foundation — why

核心一句話・受眾與媒介・調性

- **台吉**：每個形態都是一種溫柔的應對。貼圖＋App。療癒。
- ✓ **檢查點**：陌生人也聽得懂？

### 2 · 基礎角色 Base character — who

剪影・永不改變的部分・原始個性・起源

- **台吉**：上下分半的圓——綿雲＋海綿。不變：中線與兩隻眼睛（各在一半）。
- ✓ **檢查點**：只看剪影認得出？

### 3 · 變化規則 Change rules — how

選 2 條主軸，其餘為修飾・寫下每層能改什麼・回原形方式

- **台吉**：主軸是 地點 × 觸碰；修飾是 季節、收集物、朋友。放著不動 → 回原形。
- ✓ **檢查點**：能從規則猜出形態？

### 4 · 形態 Forms — what

3×3 測試 → 一句話測試 → 隱藏形態 → 擴充 5×5

- **台吉**：45 形態＝地點前綴＋觸碰後綴（山巒跳跳、珊瑚繞繞…），另有 6 隱藏。
- ✓ **檢查點**：每個形態都有存在理由？

### 5 · 體驗 Experience — play

觸發方式・變身回饋・圖鑑・分享

- **台吉**：直接在角色上手勢、現場打卡取得收集物、「新發現」提示、台吉圖鑑、形態卡做成貼圖。
- ✓ **檢查點**：光是變身就好玩？

### 6 · 製作 Production — ship

風格指南・素材清單・先小量推出 → 觀察 → 擴充

- **台吉**：試行版＝原形＋5 觸碰形態做成貼圖組，之後再加地點。
- ✓ **檢查點**：大家真的在用哪些？

---

## 每次沿用 vs. 每次重做

| 每次沿用 Carries over | 每次重做 Redesign each time |
| --- | --- |
| 階段與順序 | 基礎角色 |
| 變化層的格子 | 每格在新情境的意義 |
| 規則與回原形 | 依媒介而定的觸發方式 |
| 檢查點與一句話測試 | 重跑第 1–2 階段 |

在程式裡，「每次沿用」就是 `src/core/`，「每次重做」就是 `src/characters/<角色>/`。

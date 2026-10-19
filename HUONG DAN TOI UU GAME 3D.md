# HƯỚNG DẪN TỐI ƯU GAME 3D TRÊN TOMKO (myActivity) — sổ tay rút từ RACING WORDS mẫu 3r (16/10/2026)

> Đọc file này TRƯỚC khi tối ưu bất kỳ game 3D nào (Rocket Race, Train Rush, Star Loot, Racing Words, game mới).
> Hồ sơ đầy đủ ca Racing Words: `speed-run/NGHIEN CUU GAMEPLAY.md` mục 30 · AWord `GHI CHU DU AN.md` Đợt 533 · công cụ: `tools/do-game-3d/`.
> Các ca trước: Train Rush 1am (AWord Đợt 475), Star Loot 2p (Đợt 476), Train Rush 1an (Đợt 477), Rocket Race (Đợt 478), Racing Words 3p (Đợt 529).

## 1. Máy đích — TOMKO (màn 86" lớp học, hostname `BOARD`)
- HP Z2 Mini G5 · **Quadro T2000 4 GB** · Xeon W-1250 6 nhân/12 luồng · 32 GB · màn **3840×2160, DPR 1,25**.
- WebGL = **ANGLE / Direct3D11**: dịch 1 shader ~**150 ms** (có KHR_parallel_shader_compile nhưng lần VẼ ĐẦU vẫn phải chờ link xong) ⇒ mỗi program mới giữa trận = 1 cú khựng.
  Chrome lưu shader đã dịch trên đĩa ⇒ lần nạp sau nhanh hơn nhiều; lần đầu trên máy / biến thể mới thì chậm.
- myActivity v2.27+ đặt `window.__awMaxPR = 1` trên màn 4K; game 3D chỉ chạy ở bảng 1 (v2.34). Khung game ≈ **3087×1504 CSS ⇒ ~4,7 triệu điểm ảnh ở độ nét 1,0**.
- Card NÓNG: 76 °C rảnh, **84 °C khi chơi, bị SW Thermal Slowdown** (nvidia-smi `clocks_event_reasons` 0x20) ⇒ GPU yếu đi giữa chừng. Đã khuyên thầy vệ sinh quạt.
- Ngân sách 1 khung 16,7 ms gồm: WebGL + **compositor của Chromium** (ghép canvas 4K với lớp HTML HUD) + giao diện myActivity. GPU WebGL nên ≤ ~11–12 ms.

## 2. Quy trình đo (làm đúng thứ tự)
1. **Mở myActivity có cổng CDP** (đóng bản đang chạy bằng `CloseMainWindow`, mở lại cùng hồ sơ để giữ đăng nhập):
   `node_modules\electron\dist\electron.exe "E:\LAP TRINH APP\myActivity\." --remote-debugging-port=9333` (thư mục làm việc = myActivity).
   Nạp trang vào bảng 1: `node cdp.mjs index.html -e "window.myactivity.viewCmd(0,'loadURL',['https://aword.andrewclasses.com/?a=572'])"`.
   **XONG VIỆC PHẢI MỞ LẠI BÌNH THƯỜNG** (không để cổng gỡ lỗi mở) và trả về đúng màn thầy để lại.
2. **Lấy act THẬT của thầy**: trang live cần đăng nhập Google, bản cục bộ (localhost) KHÔNG đăng nhập được (và không được đăng nhập thay thầy).
   ⇒ `capact.js` bọc `template.mount` trên trang live ⇒ bấm thẻ game + READY ⇒ chép `window.__rwAct` (act ĐÃ chuyển WORDS ⇒ câu hỏi, kèm Options) ra `act.json`.
3. **Bàn thử trong chính myActivity**: `node serve.mjs 5733` phục vụ AWord `web/` từ ổ E:, riêng `/templates/racing-words/` lấy từ thư mục ghi trong `root.txt`
   (bản gốc HEAD = đối chứng · bản nháp `stage/` · thư mục AWord thật) và tự chèn `window.__sr = game; window.__rwI = intro`. `bench.html?act=act.json` gọi đúng
   `template.mount` của AWord. Nạp `http://localhost:5733/__bench/bench.html` vào bảng 1.
   ⛔ **ĐỪNG dùng CDP `Fetch.fulfillRequest`** để thay file trên trang live: trong myActivity nó làm TREO trang (xung đột `session.webRequest`), status 0.
4. **Đầu đo** `probe.js` (cài sau mỗi lần tải lại): nhịp rAF từng khung · **số lần `composer.render` THẬT** · lỗi JS (`error`) · long-animation-frame (kèm hàm gây) ·
   program mới (`renderer.info.programs`) · mức độ nét tự chỉnh. `report.js` gom theo mốc. `gputime.js` = thời gian GPU từng pass (EXT_disjoint_timer_query_webgl2).
   `prof.mjs` = CPU profiler quanh một thao tác. `nvidia-smi --query-gpu=timestamp,temperature.gpu,clocks.gr,utilization.gpu,power.draw,clocks_event_reasons.active
   --format=csv,noheader -lms 500 -f gpu.csv` (ghi trễ vì đệm).
5. **Kịch bản** (`scen.js`, `scen2.js`, `runfull.sh <root> <out.json>`): xưởng 12 s → START → phim → 5 đèn → đua tự động cả ván (`__sr.auto`) → kết quả;
   nặng: đổi xe nặng nhất (Y4 + H7) → đua → PLAY AGAIN. Trước mỗi lần đo: **xoá mức độ nét đã học** (`localStorage aw.rr3d.pr.*`) và đặt lại xe mặc định.
6. **A/B**: khoá độ nét cố định (`ab.js` thay `renderer.setPixelRatio`), bật/tắt 1 thứ (CSS chèn, ẩn đèn, đổi kiểu bóng…), so khung trễ + GPU ms. Cùng cảnh, ≥ 12–25 s.
7. **Kiểm LIVE sau khi push**: `python tools/kiem-live.py` (AWord) rồi chơi thật trên web bằng DOM (`liveplay.js` bấm đúng/sai theo đáp án act) — 0 lỗi JS mới tính xong.

⚠️ **Bẫy đo:** (a) rAF vẫn 60 khi khung bị LỖI không vẽ ⇒ luôn đếm `composer.render` + lỗi. (b) Cửa sổ myActivity bị **thu nhỏ** ⇒ trang `hidden`, rAF dừng
⇒ kiểm `document.visibilityState` trước mỗi lần đo. (c) Khung chậm lúc NẠP (dịch shader ngầm, tải xe) làm bộ tự chỉnh độ nét học sai và NHỚ luôn. (d) Nhiệt độ card
làm số dao động ±3 fps giữa các lần — so A/B liền nhau.

## 3. Bẫy hiệu năng đã gặp (kiểm theo thứ tự này)
| # | Bẫy | Dấu hiệu | Cách sửa |
|---|---|---|---|
| 1 | Lỗi JS ném TRƯỚC `composer.render()` trong vòng vẽ | rAF 60 nhưng hình đứng; `error` mỗi khung | Bắt lỗi khi đo; sửa lỗi (3q: `const dist…` bị nuốt vào chú thích) |
| 2 | ShaderMaterial tạo / `dispose()` liên tục (vd mỗi phát tên lửa) | program mới mỗi lần, khoá có mã stage tăng dần ("44,45" → "46,47") | Dùng lại vật liệu (pool), không dispose giữa trận |
| 3 | Prewarm dispose vật liệu mẫu TRƯỚC `pinPrograms()` | program dịch lại lần đầu sự kiện xảy ra giữa trận | Ghim trước, dọn sau |
| 4 | Đèn nằm ở lớp (layers) riêng từng camera | cùng vật liệu nhưng khoá khác số đèn ("2,2" vs "2,3") ⇒ 2–3 bản shader | Đèn nhỏ cho hiện mọi camera (`layers.enableAll()`); prewarm đủ mọi tổ hợp lớp |
| 5 | Ẩn cả rig (kèm đèn) khi chụp CubeCamera | lần chụp sau START sinh program mới | Chỉ ẩn mảnh lưới, giữ đèn |
| 6 | RectAreaLight (LTC) | đắt kinh khủng: 5 cái = 22 ms ở 4K, **tính cả khi intensity 0** | Gộp còn 1 tấm; đèn tắt vẫn tốn ⇒ bỏ hẳn đèn không cần |
| 7 | SpotLight / bóng đổ PCFSoft nhiều đèn | 2 spot 8,6 ms; 3 bản đồ bóng 10 ms | Bỏ spot phụ; `shadowMap.autoUpdate = false`, chỉ `needsUpdate` khi vật di chuyển |
| 8 | MSAA HalfFloat ở 4K | phần đắt nhất của khung; bật/tắt giữa trận = cấp lại bộ đệm, khựng ~200 ms | Tắt hẳn từ đầu (samples 0, canvas antialias false) |
| 9 | Độ nét bỏ qua `__awMaxPR` | canvas 3858×1823 | Mọi renderer (cả intro/xưởng) dùng trần chung |
| 10 | Bộ tự chỉnh độ nét nhấp nhả | mỗi lần đổi = cấp lại bộ đệm + 5 tầng bloom ⇒ khựng | Thử nâng sau ~20 s êm; chỉ học ở cảnh ổn định; phim ngắn dùng ngân sách điểm ảnh cố định |
| 11 | Vẽ trời / đất (shader nhiễu fbm) TRƯỚC vật che | GPU tính điểm ảnh bị che | renderOrder: vật thường trước, đất – biển sau, trời CUỐI (`z = w`) ⇒ early-z |
| 12 | Pass hậu kỳ chạy cả khi vô hiệu (nhoè = 0) | 0,3–1 ms toàn màn | `pass.enabled = false` khi không dùng |
| 13 | CSS `filter` / `backdrop-filter` / animate `box-shadow` trên HUD đè canvas 4K | compositor quá tải: 51–58 fps dù WebGL dư | Bỏ filter trên phần tử đổi mỗi khung; `will-change: transform`; quầng = lớp `::after` chỉ đổi opacity; bỏ `blur` trong @keyframes (luật thường KHÔNG đè được animation) |
| 14 | Vật liệu xe Sketchfab nhiều biến thể (normal/roughness/metal/AO map, clearcoat) | đổi xe đứng 4–5 s (dịch 23–29 shader × 2 renderer) | `slimMat`: bỏ normal/AO map, roughness/metal map ⇒ trung bình ảnh, bỏ clearcoat |
| 15 | Dò tia + DecalGeometry giữa trận (vết cháy) | khung JS 86–117 ms ở xe nặng | Làm sẵn lúc rảnh, dùng lại chỗ cũ, không dispose hình |
| 16 | Vào trận chờ prewarm CŨ sau khi đổi xe | khựng ở 5 đèn | Chờ lần prewarm HIỆN HÀNH |
| 17 | Vật liệu `transparent` + `DoubleSide` | `material.version` tăng mỗi khung, `getParameters` nóng trong profiler, lệnh vẽ gấp đôi | `forceSinglePass = true` TRƯỚC khi dịch sẵn (Racing Words 5h) |
| 18 | `fit(true)` / đo HUD (`scrollWidth`, `offsetWidth`) khi chỉ đổi độ nét hoặc khi cột/khung trượt | khung 35–54 ms đúng lúc bộ tự chỉnh đổi ⇒ vòng xoáy hạ độ nét | đổi độ nét = `setPixelRatio` + `composer.setSize`; đo DOM 1 lần, không đọc sau khi ghi style |
| 19 | Lần vẽ cảnh thứ 3 (cột drone / gương / minimap 3D) | CPU vẽ gần gấp đôi (lệnh vẽ ~+300) | ẩn mảnh nhỏ riêng trong lượt đó; đo bằng `tools/do-game-3d/cpuview.js` |
| (cũ) | Tạo đèn / lưới / biến thể vật liệu mới giữa ván, thanh cuộn ⇒ resize | xem bộ nhớ Train Rush / Star Loot | dựng sẵn, ghim shader, khoá cuộn |

Lần theo program mới → vật liệu: `renderer.properties.get(mat).currentProgram.id` duyệt `scene.traverse`; khoá program (`cacheKey`) cho biết khác ở đâu
(số đèn, map, PHYSICAL, mã stage của ShaderMaterial).

## 4. Số liệu Racing Words (act 572, khung VẼ THẬT / giây, cùng máy, cùng kịch bản)
| | 3q (live Đợt 531) | 3r (Đợt 533) |
|---|---|---|
| Xưởng chờ | 28,7–37,5 | 60,1 |
| Phim intro | 17–18 (khung 67–317 ms) | 59,3 (live: 60,0) |
| 5 đèn | 45–48 | 60,0 |
| Đua | 58,3 + 49 khung lỗi + 17–19 lần dịch shader | 59,7 (live chơi bằng nút: 60,0), 0 lỗi, 0 dịch |
| Đổi xe Y4 + H7 | 4,9 s + 4,1 s | 0,7 s |
GPU WebGL trong trận (độ nét 1,0): 9,4–11,4 ms (SplitPass ~7–8, bloom 1,5, nhoè 0,5, output 0,3); 2 xe chỉ ~1,3 ms ⇒ nén HÌNH xe ít lợi, nén VẬT LIỆU lợi nhiều.
Intro GPU RenderPass: 32 ms ⇒ 11,8 ms (độ nét 1,0).

## 5. Quy trình ra bản (giữ nguyên luật kho)
1. Sửa ở myGame, **mẫu mới = tên file mới** (`*-3r.js`), trang thử `mau-3r-*.html`; giữ CRLF (dùng `tools/do-game-3d/ed.py`, đừng `sed -i` trên file CRLF).
2. Đo trên bản nháp: `python chep-stage.py` (công cụ chép của AWord, đích `stage/`) ⇒ `root.txt` trỏ stage ⇒ `runfull.sh`.
3. Commit + push myGame ⇒ AWord: đổi `GOC`/`CSS` trong `tools/chep-racing-words.py` + `GAME`/`CSS` trong template ⇒ chạy công cụ ⇒ đo lại trên thư mục AWord thật
   ⇒ ghi sổ (myGame NGHIEN CUU, AWord GHI CHU DU AN + APP_MASTER + GHI CHU template) ⇒ commit + push ⇒ `kiem-live.py` ⇒ chơi thử live.

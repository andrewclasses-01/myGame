# HỒ SƠ BÀN GIAO — RACING WORDS (chốt 16/10/2026)

Đọc file này TRƯỚC khi làm tiếp ở phiên sau. Chi tiết từng mẫu: `NGHIEN CUU GAMEPLAY.md` (mục 31–38). Ghi chú phía AWord: `AWord/web/templates/racing-words/GHI CHU RACING-WORDS.md`.

## 1. Trạng thái hiện tại
| Nơi | Bản | Mã commit | Trạng thái |
|---|---|---|---|
| myGame (thiết kế) | mẫu **4e** — bản đủ nhất (4d + 8 việc thầy 16/10, mục 39) | `3f5f9a6` | ✅ đã push |
| AWord (bản thật) | **Đợt 537** = myGame 4e (trước: Đợt 535 = 4d `be9e854`) | xem git log AWord | ✅ LIVE https://aword.andrewclasses.com (Action "Xuat ban AWord (thu gon)" success, live nạp `rw-4d.js`) |

⬜ **Chưa làm / chờ thầy:**
- Thầy thử 2 đội thật trên **TOMKO** (máy chiếu 86") + 2 iPad: cảm giác lái tay mới, xe khác ngược chiều, camera gộp, chế độ Time / Words với bộ từ thật.
- Đo fps trên TOMKO (máy nhà chỉ đo được ~100 fps vì trình duyệt giới hạn). Cách đo cũ: mục 30.
- Đường relay iPad `r:` ("Connected (slow)") chưa thử được (cục bộ luôn nối thẳng) — từ Đợt 534.

## 2. Thầy đã chốt (đừng hỏi lại)
- Giữ những gì tốt nhất; **ưu tiên số 1 là MƯỢT + HIỆU NĂNG**.
- Bố cục: khung đua TRÊN, dải câu hỏi 2 đội + bản đồ DƯỚI (sát ô đáp án).
- Phanh TRÁI, ga PHẢI (màn lớn + iPad). Dấu đỉnh vô lăng = máy bay giấy logo Andrew Classes.
- ⚙ Settings mở được MỌI LÚC (cả trên xưởng intro) và TẠM DỪNG game (cả phim intro). Mặc định (16/10, mẫu 4e): **Drive on iPad + Tilt · Cockpit · Sky view Off · Traffic Off** — khoá máy `.v2`.
- Trên không: vô lăng bên nào xe nghiêng bên đó; bay bằng boost đi xa hơn (×1,5); đáp nghiêng quá ⇒ BAD mất lái 1,2 s. Màn chờ AWord = ảnh tĩnh riêng `rw-loading.webp`.
- Nút iPad cũ ⇒ **⚙ Settings đa năng** có tab: **iPad** · **Camera** (Cockpit / Chase + Sky view Auto/Off) · **Race** (Traffic Off / Same way / Both ways). Nhớ theo MÁY (localStorage `racingwords.steer` · `.view` · `.sky` · `.traffic`), không theo act.
- Độ dài theo chế độ — **mọi kiểu thắng đều phải chạy qua vạch đích**:
  - Length ×1 / ×1,5 / ×2 / ×3 (mặc định ×2) · Time (đồng hồ trong khung bản đồ; hết giờ đội xa hơn được chốt, đích hiện trước 140 m) · Words (còn 2 từ ⇒ đặt đích, cờ đỏ nhấp nháy bản đồ) · hết mạng ⇒ xe cháy đứng lại, đích hiện trước xe còn lại.
- Camera gộp bay lên trời khi: 2 xe cách **50–100 m** · **tên lửa đang bay** (trúng xong về NHANH, mượt) · xe dẫn còn **150 m** tới đích.
- **Lái tay hoàn toàn**: không ai lái ⇒ vô lăng thẳng, vào cua là đâm rào; vô lăng chỉ tự lệch khi VA CHẠM. Đường cong phải ĐÚNG VẬT LÝ (đường xa không tự vắt qua lại).
- Vạch mạng: mảnh, kiểu racing, giữa chiều cao khung nhìn.
- Cây / cỏ: em tự chọn kiểu (thầy không cần trang mẫu).
- Quy trình: làm ở myGame trước (bản mới = tên mới), thầy OK mới đưa AWord.

## 3. Bản đồ file (myGame `speed-run/core/`)
⭐ Mới nhất: gói `rw-4e.js` ⇒ lõi `sr3d-4e.js` + intro `sr3d-intro-4e.js` (vẫn xe `sr3d-car-4b.js`), CSS thêm `rw-4e.css`, trang thử `mau-4e-cai-dat-moi-noi.html`, ảnh màn chờ `rw-loading.webp`. Phần dưới (4d) vẫn đúng cho các mô-đun còn lại.
Gói nhúng `rw-4d.js` ⇒ lõi `sr3d-4d.js` ⇒ nạp:
- `sr3d-world-4b.js` (thế giới: cong thật bảng `uBendT`, cây/bụi/cỏ, vạch ANDREW STUDIO, mốc dùng lại, cổng đích dời được `setFinish`)
- `sr3d-car-4b.js` (xe: bánh bám đường, bóng hình xe, lửa pô cong thật) · `sr3d-intro-4b.js` (xưởng — PHẢI cùng mô-đun xe với lõi)
- `sr3d-missile-4b.js` · `sr3d-stunt-4b.js` (dốc xoắn + phần thưởng) · `sr3d-traffic-4c.js` (xe khác) · `sr3d-fx-3c.js` (cầu nhảy, vệt gió) · `sr3d-autores-3r.js` · `sr3d-xe3d-3o.js` · `sr3d-dash-3h.js`
- iPad: `sr3d-padui-3y.js` + `sr3d-padlink-3y.js` (+ `padlink-3e` vì padui lấy TEAM_META)
- CSS (đúng thứ tự): `sr3d-3g · sr3d-3l · sr3d-intro-3o · rw-3r · rw-3z · rw-4a · rw-4b · rw-4c · rw-4d`
- Trang thử: `mau-4d-camera-troi.html` (bản đủ nhất; Options giả có mọi mục mới; `window.__opts({...})` = bấm Apply) · iPad thử `pad-3y.html?t=0|1`.
- Các mẫu trung gian (giữ để so): 3z `mau-3z-cai-dat` · 4a `mau-4a-duong-dai` · 4b `mau-4b-lai-that` · 4c `mau-4c-xe-khac`.

## 4. Đưa bản mới lên AWord (làm y Đợt 535)
1. Worktree mới từ `origin/main`: `git worktree add -b dotNNN ../web-wt-dotNNN origin/main` (trong `E:/LAP TRINH APP/AWord/web`). Một phiên một worktree.
2. Sửa `tools/chep-racing-words.py`: `GOC` (gói nhúng mới), `GOC_THEM` (iPad), `CSS` (thêm file mới, đúng thứ tự) ⇒ `PYTHONIOENCODING=utf-8 python tools/chep-racing-words.py` (tự lần import, đổi đường three, dọn file cũ, chép xe + tiếng, ghi NGUON.json).
3. `templates/racing-words/racing-words.js`: `GAME`, `CSS`; Options mới = khoá phẳng `sr*` (RW_DEF · RW_FLAT · gameOpts/flatOpts · buildExtraOptions). Hiện có: srSameQ srMsMax srSteps srLaps srRamps srLives srMsDmg srMsStreak srTie srMissWait **srRace srLenK srTimeS srTwists srPkBoost srPkLife srPkMissile**.
4. Đổi iPad thì sửa cả `pad.js` (rwMods) + `rw-pad-signal.js`.
5. Bàn thử: `scratch/dotNNN-rw.html?padsig=local` (chép từ dot535, thư mục scratch bị git bỏ qua) + `pad.html?padsig=local`; thêm launch config `aword-dotNNN` vào `D:/OTHERS/CLAUDE/.claude/launch.json`.
6. Ghi `APP_MASTER.md` (dòng ✏️ đầu) · `GHI CHU DU AN.md` (mục Đợt) · `GHI CHU RACING-WORDS.md` ⇒ commit ⇒ `git push origin HEAD:main` ⇒ `gh run watch` ⇒ curl live kiểm `racing-words.js` nạp gói mới.
- Khác biệt dòng (LF/CRLF) ở các file cũ khi chép là bình thường (autocrlf), không phải sửa nội dung.

## 5. Bẫy đã trả giá ở đợt này (nhớ!)
- ⛔ **Lõi và intro phải cùng mô-đun xe** (`SO_DO` số đo xe nằm trong mô-đun): khác ⇒ bước dịch sẵn chậm 20 s mỗi lần tải (dịch shader thật chỉ ~1,7 s).
- ⛔ Python vá file: file myGame có CRLF ⇒ đọc `newline=''` rồi đổi `\r\n`→`\n`, ghi lại đúng kiểu; viết script có `\r\n` bằng Write tool dễ hỏng ký tự — viết lại cả file thay vì sửa chuỗi thoát.
- ⚠️ Bàn thử: `game.step()` bật `manual` ⇒ vòng vẽ thật dừng, xong phải `game.resume()`; `game.drive(i, {...})` giữ tới khi `drive(i, null)`; `game.start()` thẳng (bỏ intro) không chờ dịch sẵn ⇒ thấy dịch shader giữa trận giả.
- ⚠️ Khung trình duyệt ẩn ⇒ rAF dừng; công cụ JS chạy "thế giới tách biệt" ⇒ muốn bọc `gl.draw*` / `linkProgram` phải chèn `<script>` vào trang.
- ⚠️ Khai báo `let/const` dùng trước chỗ định nghĩa trong `createSpeedRun` ⇒ lỗi TDZ (4c `trafficMode`) — đặt lệnh gọi sau dòng khai báo.
- Lái mới: tốc độ quay đầu `yawR(v) = min(1,25; 16/v)` — bám 10 m/s² thì boost không ôm nổi cua gắt; độ cong hình = độ cong vật lý (`kapV`, trần 0,0065 rad/m).

## 6. Số đo tham chiếu (máy nhà 1600×900, góc Chase, giữa trận)
- 3z 452 lệnh vẽ / 1,90 triệu đỉnh · 4a 465 / 2,44 · 4b 448 / 2,43 · 4d ~375 (gộp camera 309) · 63–65 shader, không dịch giữa trận · prewarm ~1,6–1,8 s · 96–100 fps (trần trình duyệt).

## 7. Hướng làm tiếp (khi thầy thử xong)
- Chỉnh theo phản hồi TOMKO: độ nhạy lái (`yawR`, `steer.max`), mật độ / tốc độ xe khác (`sr3d-traffic-4c.js`), khung camera trời (`game.mtune` chỉnh thử ngay: b0 b1 h0 h1 l0 l1), ngưỡng gộp (50–100 m / 150 m).
- Có thể thêm: âm thanh cho phần thưởng / va xe khác / dốc xoắn; AI tự lái lách dốc xoắn; hiện số mạng/phần thưởng trên iPad.

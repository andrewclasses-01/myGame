# HỒ SƠ BÀN GIAO — RACING WORDS (chốt 16/10/2026 · cập nhật DRONE 19/10/2026)

Đọc file này TRƯỚC khi làm tiếp ở phiên sau. Chi tiết từng mẫu: `NGHIEN CUU GAMEPLAY.md` (mục 31–40). Ghi chú phía AWord: `AWord/web/templates/racing-words/GHI CHU RACING-WORDS.md`.

## 0. ⭐ DRONE (iPad thứ 3) — TẠM DỪNG 19/10/2026, ĐỌC PHẦN NÀY TRƯỚC
Thầy: "Tạm thời thế đã… build tiếp ở các phiên sau, khi nào ok hết rồi mới đẩy bản cuối lên AWord". ⇒ Mọi việc tiếp theo làm ở myGame (bản mới = tên mới: 4t, 4u…);
CHƯA đụng template racing_words thật của AWord (vẫn Đợt 551 = 4j).

**Bản mới nhất: 4s** — trang `mau-4s-dan-gon.html` · gói `core/rw-4s.js` · lõi `core/sr3d-4s.js` · đạn `core/sr3d-dammo-4s.js` · mẫu drone `core/sr3d-drone3d-4p.js` + `drone3d/*.glb`
· iPad `pad-4l.html` (đường nối `sr3d-padlink-4l.js`, giao diện `sr3d-padui-4l.js`) · CSS (đúng thứ tự, sau rw-4j.css): `rw-4k.css · rw-4l.css · rw-4o.css · rw-4r.css`.
Thử nhanh: mở `mau-4s-dan-gon.html` ⇒ ⚙ Settings ▸ Drone ▸ 1 drone ⇒ phím J L (tâm ngang) · I K (xa / gần) · 1 2 3 (đạn) · Space (bắn). Góc trên trái = bàn đo fps / lệnh vẽ.

**Đã có (thầy duyệt từng bước):**
- Bố cục A: cột drone giữa vùng đua rộng 24 % (`DRONE_W`), 2 nửa đội hẹp lại; màn kết thu cột lại; Sky view tự tắt khi có drone.
- Settings ▸ tab DRONE: Off / 1 drone / "2 drones · soon" (mờ — chừa cửa) · Neutral / Help the losing team / Team drone (+ đội) · lưới MODEL · Ammo bật / tắt. Nhớ `racingwords.drone.v1`.
- Máy quay sau drone (`dcam`, khung cong `bendTex[2]`); drone tự bay sau + trên cụm xe; người chơi lái TÂM BẮN; khoá xe < 6 m theo `canTarget` (luật chế độ).
- 5 mẫu drone thầy giữ: Mavic · Quad · Osprey · Northstar · Dvergr (Sketchfab CC BY, ghi công ở tab Drone); cánh quạt quay quanh trọng tâm + vòng mờ; bay lượn như thật (lò xo giảm chấn thiếu, roll / pitch theo gia tốc, rung gió).
- Tâm ngắm lục giác HUD (R5): ảnh canvas phát sáng, cộng sáng, y 0,3 m.
- Đạn Heart / Boost / Missile: dáng tên lửa nhỏ, phóng về trước, đuôi chỉ thấy lửa + khói, lạng lách, bám xe có giới hạn; pin + thời gian chờ; trúng xe / đường 6 kiểu; dòng DRONE ở kết trận; tiếng.
- iPad drone: vai thứ 3 (t = 2) trong đường nối; màn chọn vai 3 nút; bảng lái (thẻ đạn, ô kéo lái tâm, FIRE, NEAR / FAR, TILT); thẻ DRONE · iPAD có QR ở xưởng (không chặn START).

**Trang thử ẩn trên AWord (ĐÃ ĐẨY trước khi thầy dặn chỉ myGame — để thử 3 iPad thật):** `https://aword.andrewclasses.com/lab/racing-drone.html` (+ `lab/racing-drone-pad.html`),
kênh riêng `templates/racing-words/rw-lab-signal.js` (tài liệu rwlab_*), bản 4s (Đợt 552h `ffcdb8b`, worktree `web-wt-dot552`). Template thật không đổi. Lần sau muốn thử 3 iPad: chép bản mới vào
`templates/racing-words/3d/` + đổi `lab/racing-drone.html` (cách làm: GHI CHU DU AN của AWord Đợt 552). Chốt xong ⇒ đưa vào template thật như Đợt 551 + xoá thư mục lab/.

**Còn lại / chờ thầy:**
- ⬜ Thầy thử 3 iPad thật trên trang ẩn (chưa thử lần nào) · đo fps TOMKO bật / tắt drone (máy nhà: 433 → ~700 lệnh vẽ, 0,78 → 1,2 M tam giác).
- ⬜ iPad drone: chưa hiện thời gian chờ từng loại đạn / thiếu pin trên thẻ (tin "j:" mới có pin); kiểm lái nghiêng trên iPad thật.
- ⬜ "2 drones" (mỗi đội 1 drone) — mới chừa cửa, chưa thiết kế.
- ⬜ Đưa lên template thật AWord khi thầy chốt hết (load-files.js đo lại, pad.js nhận vai DRONE, drone3d/ trong danh sách tải).

**Công cụ mẫu 3D** (`myGame/tools/*.mjs`, cần npm @gltf-transform 4 + meshoptimizer + sharp 0.34): `tex.mjs` (webp ≤ 1024, chạy RIÊNG tiến trình) → `process.mjs` (meshopt) · `split2.mjs` (tách cánh quạt theo mảnh liền ⇒ PROP_k) · `hubs.mjs` / `hubfix.mjs` (dò trục) · `nodes.mjs` (liệt kê). Bàn xem: `xem-drone-4m.html` (hướng mũi) · `xem-quat-4n.html?id=A1&w=0.6` (soi quạt).
⛔ Bẫy đợt này: vật thể trong thế giới cong phải `frustumCulled = false` · tâm ngắm sát mặt đường (y 0,08) bị đường che ⇒ y 0,3 + polygonOffset · node cánh quạt lồng nhau quay ngược triệt tiêu · đổi file .glb cùng tên ⇒ Chrome dùng bản cũ (đổi tên file) · trùng tên hàm `droneInfo` (import vs hàm nội bộ).

## 1. Trạng thái hiện tại
| Nơi | Bản | Mã commit | Trạng thái |
|---|---|---|---|
| myGame (thiết kế) | mẫu **4g** (18/10) — 4f + KẾT TRẬN SLOW MOTION (drift / bay) · số đếm 10 s · barrel roll tự chỉnh · lật chậm dốc xoắn · nảy khi đáp · đèn chậm · vạch boost mép mờ · mũi tên đối thủ (NGHIEN CUU mục 41) | (commit 18/10) | ✅ đã push myGame · ⬜ thầy thử TOMKO rồi mới lên AWord |
| AWord (bản thật) | **Đợt 551** = myGame **4j** `a24e266` (gồm 4g…4j) — worktree `web-wt-dot551`, GOC `rw-4j.js`, `core/loader3d.js` thêm `pace` (+ `h.mark`), `pad.js` nạp padui-4j/padlink-4j + `3d/rw-4j-fb.css`, load-files.js đo lại (70 file 5,1 MB) | `27825a2` | ✅ LIVE 18/10 (Action success, live nạp rw-4j + loader mới) · ⬜ thầy thử TOMKO + 2 iPad |
| myGame (BUILD) | **4s ĐẠN GỌN** (19/10, thầy: đạn nhỏ hơn · phóng từ drone tiến về trước · từ sau chỉ thấy khói + lửa) — `sr3d-4s.js` · `rw-4s.js` · `sr3d-dammo-4s.js` · trang `mau-4s-dan-gon.html`. Cỡ ×1,05–1,15 · phóng 1,5 m trước bụng drone, Bézier c1 = 16 m phía trước gần ngang rồi chúc · lửa đuôi = 2 hạt cộng sáng to phát mỗi khung ngay sau đuôi (lõi trắng nóng + màu đạn) che thân · khói phóng nhỏ lại. AWord trang ẩn Đợt 552h `ffcdb8b` | (commit 19/10) | ⬜ thầy thử |
| myGame (BUILD) | **4r ĐẠN DRONE** (19/10, thầy "ok, tiếp tục" — theo thiết kế v2 mục 3–4) — `sr3d-4r.js` · `rw-4r.js` · `rw-4r.css` · mô-đun vẽ `sr3d-dammo-4r.js` (DA: T 1,5 s · LOCK 0,45 s · DRIFT 3 m/s · pin Heart 40 % / Boost 25 % / Missile 35 % · chờ 4/3/3 s · sạc 6 %/s) · trang `mau-4r-dan-drone.html`. Đạn dáng tên lửa (missileGeos) phóng to 1,7–1,9, 3 màu + vệt hạt cộng sáng cùng màu, Bézier chúc xuống + lạng lách tắt dần, bám xe có giới hạn. Trúng = xe trong |ngang| < 1,9 m, |dọc| < 3,8 m VÀ canTarget: Heart +1 mạng (tắt mạng ⇒ +½ ô) · Boost +1 ô · Missile gọi impact({drone:true}) (không tính hits đội). Trượt: bụi hồng / tia điện / nổ nhỏ + vết cháy. Kết trận thêm dòng DRONE. Pin thật gửi iPad (tin j). Tiếng droneShot/droneHit/droneDeny ở rw-4r. AWord trang ẩn Đợt 552g `e48d95d` | (commit 19/10) | ⬜ thầy thử · ⬜ 3 iPad thật · ⬜ iPad drone hiện thời gian chờ từng loại (hiện chỉ pin) |
| myGame (BUILD) | **4q TÂM NGẮM LỤC GIÁC HUD** (19/10, thầy: tâm ngắm cần mảnh, blur, hiện đại; chọn R5 ở `thiet-ke-4q-tam-ngam.html`) — `sr3d-4q.js` · `rw-4q.js` · trang `mau-4q-tam-ngam.html`. Ảnh canvas 256 px vẽ sẵn (quầng màu đạn shadowBlur + lõi trắng 1,6 px), mỗi đạn 1 bộ (aim / in / out) + bộ trắng; mặt phẳng cộng sáng (AdditiveBlending) lớp 6; ngắm = lục giác khe + thoi (R 2,6 m), khoá = lục giác ôm xe (R 3,3 m, nhịp nhẹ) + lục giác ngoài khe rộng xoay ngược (R 4,3 m). ⛔ Đặt y 0,3 m + polygonOffset: ở 0,08 m bị mặt đường che hẳn. AWord trang ẩn Đợt 552f `765c09d` | (commit 19/10) | ⬜ thầy xem · ⬜ thử 3 iPad thật · đạn |
| myGame (BUILD) | **4p 5 MẪU GIỮ** (19/10, thầy: bỏ Basic · Combat · F-2 · Fighter; "Mavic vẫn lỗi trên Chrome"; "cánh Quad không quay") — `sr3d-4p.js` · `rw-4p.js` · `sr3d-drone3d-4p.js` (DRONE_PICK = Mavic · Quad · Osprey · Northstar · Dvergr; basic chỉ là hình tạm lúc nạp) · trang `mau-4p-drone-5-mau.html`. Quad: node cánh quạt LỒNG NHAU (cha + con cùng tên propeller) bị bọc 2 trục quay ngược ⇒ đứng yên — nay bỏ node có tổ tiên là cánh quạt. Mavic: bản live đã đúng, Chrome thầy còn file cũ (max-age 600) ⇒ đổi tên `drone-A1-mavic2pro-v2.glb` + `?v=4p`. AWord trang ẩn Đợt 552e `45d2c94` (xoá 4 file mẫu bỏ) | (commit 19/10) | ⬜ thầy tải lại (Ctrl+Shift+R) xem · ⬜ thử 3 iPad thật |
| myGame (BUILD) | **4o LƯỚI CHỌN MẪU + SỬA QUẠT** (19/10, thầy: không xem hết hàng Model · quạt Mavic lỗi) — `sr3d-4o.js` · `rw-4o.js` · `rw-4o.css` · `sr3d-drone3d-4o.js` · trang `mau-4o-chon-drone.html` · bàn soi quạt `xem-quat-4n.html?id=A1&w=0.6`. Model = lưới thẻ 4 cột theo nhóm DRONES / AIRCRAFT / SPACESHIPS. Quạt: Mavic tách lại bằng `tools/split2.mjs` (theo MẢNH LIỀN — split.mjs cắt bán kính sót đầu cánh dài 2,7 ⇒ mảnh vụn); trục quay mọi quạt = TRỌNG TÂM ĐỈNH của quạt (Osprey hết quay lệch); vòng mờ mỏng (opacity 0,09) theo tầm cánh. AWord trang ẩn Đợt 552d `f5db1ad` | (commit 19/10) | ⬜ thầy chọn mẫu giữ / bỏ · ⬜ thử 3 iPad thật |
| myGame (BUILD) | **4n 8 MẪU + QUẠT QUAY + BAY LƯỢN** (19/10, thầy thêm D1 · D6 · E1 · E3 · E4; "cánh quạt phải quay, bay lắng lắng như drone thật") — `sr3d-4n.js` · `rw-4n.js` · `sr3d-drone3d-4n.js` (kind quad/bug/jet/tilt/ship, span riêng) · trang `mau-4n-drone-bay.html`. Quạt: A1 Mavic + D6 Osprey vốn liền thân ⇒ `tools/split.mjs` tách node PROP_k (trục từ `hubs.mjs`/`hubfix.mjs`); A6 có sẵn node propeller; trục quay = phương đứng của mẫu đổi về hệ riêng node. Drone tự dựng có cánh 2 lá. Bay: ngang = lò xo giảm chấn thiếu (k 7, c 3,4), roll theo vận tốc + gia tốc ngang, pitch theo gia tốc tiến (quad), jet/ship nghiêng ×1,7, yaw về tâm, rung gió nhiều tần số. Nén: `tools/tex.mjs` (webp ≤ 1024, RIÊNG tiến trình — chung với meshopt thì sharp lỗi colourspace) → `process.mjs`. 8 file ~5,2 MB. AWord trang ẩn Đợt 552c `70b7c46` | (commit 19/10) | ⬜ thầy xem hướng mũi E1 + thử 3 iPad thật |
| myGame (BUILD) | **4m MẪU DRONE 3D** (19/10, thầy chọn A1 · A6 · B3) — `sr3d-4m.js` · `rw-4m.js` · `sr3d-drone3d-4m.js` (DRONE_MODELS: yaw mũi, chuẩn bề ngang 2,8 m, bend vật liệu, AnimationMixer) · file `speed-run/drone3d/*.glb` (Sketchfab CC BY, nén meshopt bằng scratchpad process.mjs — sharp lỗi libvips nên KHÔNG nén texture) · Settings ▸ Drone ▸ Model (Basic/Mavic/Quad/Combat, mặc định Mavic, ghi công tác giả) · bàn kiểm hướng mũi `xem-drone-4m.html` · trang chọn thêm máy bay/phi thuyền `chon-drone-4l-v2.html` (nhóm D/E). AWord trang ẩn nâng lên 4m: Đợt 552b `452a249` | (commit 19/10) | ⬜ thầy chọn D/E · ⬜ thử 3 iPad thật · đạn = đợt sau |
| myGame (BUILD) | **4l iPAD DRONE** (19/10, thầy: "cần chạy được trước, test kết nối 3 thiết bị") — `sr3d-4l.js` · `rw-4l.js` · `rw-4l.css` · đường nối `sr3d-padlink-4l.js` (chỗ t = 2 = DRONE, tài liệu pad2, tin "j:" game → iPad, "d0..d2" chọn đạn) · iPad `sr3d-padui-4l.js` (màn chọn vai 3 nút + `mountDroneApp`: thẻ đạn, ô kéo lái tâm, FIRE, NEAR/FAR, nút TILT) · trang `mau-4l-drone-ipad.html` + `pad-4l.html?t=2`. Xưởng: thẻ DRONE · iPAD giữa trên (QR, không chặn START). Thử 3 iPad THẬT: AWord Đợt 552 `7ff1fc7` trang ẩn `aword.andrewclasses.com/lab/racing-drone.html` (+ `lab/racing-drone-pad.html`), kênh riêng rwlab_*. Trang chọn mẫu drone Sketchfab `chon-drone-4l.html` (18 mẫu CC-BY, 3 nhóm A/B/C) | (commit 19/10) | ⬜ thầy chọn mẫu drone (mỗi nhóm 1) ⇒ tải + chọn trong tab Drone · ⬜ thử 3 iPad thật · đạn chuyển sang 4m |
| myGame (BUILD) | **4k DRONE đợt 1/3** (19/10, "ok build 4k", thiết kế `thiet-ke-4k-drone-v2.html`) — trang `mau-4k-drone.html` · gói `rw-4k.js` · lõi `sr3d-4k.js` · `rw-4k.css` (sau rw-4j.css). ⚙ Settings tab **DRONE**: Off / 1 drone / "2 drones · soon" (mờ, chừa cửa) · Neutral / Help the losing team / Team drone (+ đội) · Ammo Heart/Boost/Missile — nhớ `racingwords.drone.v1`. Bật ⇒ cột giữa rộng 24 % (`DRONE_W`, CSS `--rw-dw`, trượt 0,45 s; màn kết thu lại), Sky view tự tắt, nhoè có mép (`RadialBlurShader4k` uE). Máy quay `dcam` (khung cong `bendTex[2]`) 4,5 m sau + 4,5 m trên drone, ống kính 70°; drone bay 20 m sau xe cuối, cao 12 m (2 xe cách > 110 m ⇒ theo xe gần tâm). Tâm bắn + vòng khoá ở lớp 6 (chỉ máy quay drone thấy), khoá < 6 m theo `canTarget`. Phím J L / I K / 1 2 3 / Space (Space chưa có đạn). ⛔ vật thể cong trong shader phải `frustumCulled = false`. Đo máy nhà: 433 → ~700 lệnh vẽ, 0,78 → 1,18 M tam giác. Drone ở SAU 2 xe ⇒ 2 đội gần như không thấy drone | (commit 19/10) | ⬜ thầy thử TOMKO (đọc bàn đo góc trên trái) ⇒ 4l đạn |
| myGame (BUILD) | **4j** (18/10 đêm, "ok build", thiết kế `thiet-ke-4j-v8.html` sau 8 vòng chọn) — trang `mau-4j-nut-ban.html` + iPad `pad-4j.html` · lõi `sr3d-4j.js` · gói `rw-4j.js` · iPad `sr3d-padui-4j.js` + `sr3d-padlink-4j.js` (tin "i:" + "k/n" chuỗi đúng) · CSS `rw-4j-fb.css` (thẻ nút bắn DÙNG CHUNG game + iPad) + `rw-4j.css`. Giá tên lửa nóc xe LUÔN gập. Nút bắn = thẻ kính nghiêng: 2 ô tên lửa phẳng màu đội (cố định), "+x MISSILES" = KHO (tổng = icon + x), thanh chuỗi trắng mảnh, bắn = mờ dần / nạp = hiện dần, không mục tiêu = xanh lá nhạt + bấm hiện NO TARGET AHEAD. iPad: thẻ là lớp phủ `.ip-fbw` (CSS nút tròn cũ đè span/b/svg nếu nằm trong .ip-fire) | (commit 18/10) | ⬜ thầy thử |
| myGame (BUILD) | **4i** (18/10 đêm, "ok build", thiết kế `thiet-ke-4i.html`) — trang `mau-4i-goc-man-hinh.html` · lõi `sr3d-4i.js` · gói `rw-4i.js` · `sr3d-missile-4i.js` · `rw-4i.css` (nạp sau rw-4h.css). Cửa sổ góc dưới phải theo cqh (Settings kiểu C tab DRIVER/CAMERA/RACE, MENU, Switch activity) qua 1 bộ quản lý `winOpen/winClose` (chỉ 1 cửa sổ, mở = tạm dừng, đóng hết đang đua ⇒ đèn 3-2-1 `.rw-rs`); thứ tự chế độ 1 Drive on iPad · 2 Answer · 3 Drive on game (số padMode giữ); Drive on iPad ⇒ màn lớn lái đồng thời (`padMix`); chỉ bắn khi đối thủ trước ≥ 5 m; tên lửa H 4,6, quầng đỏ mờ (bỏ cột sáng), trôi ngang ≤ 2,5 m/s khoá 1,4 s; trúng ⇒ lệch 8+3L°, mất lái L s, khói gầm, cháy, thanh `.rw-dmg`; mũi tên kiểu 2 `.rw-oa2` dính mép; bảng đếm đầu vạch `.rw-cb` (Length/Words/Time + số to 10 s cuối). iPad 4i: `pad-4i.html` + `sr3d-padui-4i.js` + `sr3d-padlink-4i.js` — tin "i:" thêm dmg,dmgT,noaim (máy 4f vẫn đọc), thanh DAMAGE đếm lùi tại chỗ (mượt) + nút tên lửa mờ khi không có mục tiêu phía trước; chỉ khi nối THẲNG (đường relay chậm không có) | (commit 18/10) | ⬜ thầy thử |
| myGame (BUILD) | **4h** (18/10 tối, "ok build") — trang `mau-4h-cho-cau-moi.html` · gói `rw-4h.js` (+onProgress cars/race/studio/frame/warm, tiếng qwait R3 + qnew B1) · lõi `sr3d-4h.js` (bàn đạp C, chờ 3 s qGap + lớp .rw-qfill, fitAns chữ ô trả lời) · intro `sr3d-intro-4h.js` + xe `sr3d-car-4h.js` (CÙNG mô-đun xe; bóng tô theo lô, bỏ closePath: H4 10,8 s→0,07 s, Y4 50 s→0,15 s) · `rw-4h.css` · `rw-loadpace-4h.js` (% chia đều theo thời gian, nhớ theo máy, chạy trước bằng CSS khi luồng chính bận) · bàn đo `do-bong-4h.html`. Đo máy nhà: màn chờ 31 s (đứng 99 %) → 1,9 s, chạy đều | (commit 18/10) | ⬜ thầy thử ⇒ lên AWord cả 4g+4h (loader3d.js của AWord thay bộ đếm byte bằng rw-loadpace) |
| myGame (THIẾT KẾ) | **4h** (18/10 tối) — trang `thiet-ke-4h.html`: bàn đạp BOOST phát sáng không filter (B/C) · LOADING: gốc đứng 99 % = `silhouette()` (bóng xe, sr3d-car-4b) gọi `closePath` 60k lần ⇒ mỗi xe đơ ~10 s (đo H4 10,3 s, Y2 10,9 s), sửa + % chia theo thời gian · khoảng chờ 3 s trước câu mới (dải sáng rút giữa→ngoài + tiếng tăng dần + bùm) | (commit 18/10) | Thầy đã chọn: bàn đạp C · tiếng R3 gió hút + B1 bùm · Different mỗi đội tự chờ 3 s · dải sáng = lớp màu ĐẦY DẦN trong khung câu hỏi che câu cũ (từ giữa ra ngoài) · + chữ ô trả lời TỰ THU NHỎ (đo 1 lần mỗi câu, 4 ô một cỡ). ⬜ "ok build" 4h ⇒ lên AWord cả 4g+4h |
| myGame (thiết kế) | mẫu **4f** — bản đủ nhất (4e + iPad nối trước intro / giữ kết nối / tự nối lại / mốc tự lấy / khoá đội, mục 40) | `4077f92` | ✅ đã push |
| AWord (bản thật) | **Đợt 539** = myGame 4f + khoá đội (Đợt 538 `b3c3004` = 4f; Đợt 537 = 4e `b529ff5`) | `13dad6e` | ✅ LIVE https://aword.andrewclasses.com (live nạp `rw-4f.js`, pad.js có `watchTeams`) |

⬜ **Chưa làm / chờ thầy:**
- Thầy thử 2 đội thật trên **TOMKO** (máy chiếu 86") + 2 iPad: cảm giác lái tay mới, xe khác ngược chiều, camera gộp, chế độ Time / Words với bộ từ thật.
- Đo fps trên TOMKO (máy nhà chỉ đo được ~100 fps vì trình duyệt giới hạn). Cách đo cũ: mục 30.
- 16/10 thầy thử TOMKO: 1 iPad "slow" ⇒ mẫu 4f tự nối lại + chẩn đoán (mục 40). Thầy thử lại; còn slow ⇒ chụp dòng chẩn đoán dưới thẻ đội.
- Khoá đội iPad (Đợt 539) mới thử bằng iPad giả cùng trình duyệt — thầy thử 2 iPad thật: chọn trùng đội ⇒ tấm "already has an iPad"; bấm ◀ ⇒ iPad kia tự vào.

## 2. Thầy đã chốt (đừng hỏi lại)
- Giữ những gì tốt nhất; **ưu tiên số 1 là MƯỢT + HIỆU NĂNG**.
- Bố cục: khung đua TRÊN, dải câu hỏi 2 đội + bản đồ DƯỚI (sát ô đáp án).
- Phanh TRÁI, ga PHẢI (màn lớn + iPad). Dấu đỉnh vô lăng = máy bay giấy logo Andrew Classes.
- ⚙ Settings mở được MỌI LÚC (cả trên xưởng intro) và TẠM DỪNG game (cả phim intro). Mặc định (16/10, mẫu 4e): **Drive on iPad + Tilt · Cockpit · Sky view Off · Traffic Off** — khoá máy `.v2`.
- Trên không: vô lăng bên nào xe nghiêng bên đó; bay bằng boost đi xa hơn (×1,5); đáp nghiêng quá ⇒ BAD mất lái 1,2 s. Màn chờ AWord = ảnh tĩnh riêng `rw-loading.webp`.
- **iPad (4f):** chế độ Drive on iPad ⇒ START chỉ mở khi 2 iPad nối THẲNG + đã bẻ thử trái/phải (thẻ đội ở xưởng). Đường nối sống suốt trang — Apply / Start again / đổi xe KHÔNG nối lại. Mốc nghiêng tự lấy (bỏ LEVEL).
- **Khoá đội iPad (Đợt 539):** một đội = một iPad (chủ = mã máy `rwpad.dev`). iPad khác chọn trùng ⇒ bị chặn + tấm báo; màn chọn đội làm mờ đội đã có iPad. Chủ bấm ◀ về màn chọn đội / mất > 8 s mới nhả.
- Nút iPad cũ ⇒ **⚙ Settings đa năng** có tab: **iPad** · **Camera** (Cockpit / Chase + Sky view Auto/Off) · **Race** (Traffic Off / Same way / Both ways). Nhớ theo MÁY (localStorage `racingwords.steer` · `.view` · `.sky` · `.traffic`), không theo act.
- Độ dài theo chế độ — **mọi kiểu thắng đều phải chạy qua vạch đích**:
  - Length ×1 / ×1,5 / ×2 / ×3 (mặc định ×2) · Time (đồng hồ trong khung bản đồ; hết giờ đội xa hơn được chốt, đích hiện trước 140 m) · Words (còn 2 từ ⇒ đặt đích, cờ đỏ nhấp nháy bản đồ) · hết mạng ⇒ xe cháy đứng lại, đích hiện trước xe còn lại.
- Camera gộp bay lên trời khi: 2 xe cách **50–100 m** · **tên lửa đang bay** (trúng xong về NHANH, mượt) · xe dẫn còn **150 m** tới đích.
- **Lái tay hoàn toàn**: không ai lái ⇒ vô lăng thẳng, vào cua là đâm rào; vô lăng chỉ tự lệch khi VA CHẠM. Đường cong phải ĐÚNG VẬT LÝ (đường xa không tự vắt qua lại).
- Vạch mạng: mảnh, kiểu racing, giữa chiều cao khung nhìn.
- Cây / cỏ: em tự chọn kiểu (thầy không cần trang mẫu).
- Quy trình: làm ở myGame trước (bản mới = tên mới), thầy OK mới đưa AWord.

## 3. Bản đồ file (myGame `speed-run/core/`)
⭐⭐ Mới nhất 4f: gói `rw-4f.js` (+ `rw-4f.css`) — vẫn lõi `sr3d-4e.js` + intro `sr3d-intro-4e.js`; iPad `sr3d-padlink-4f.js` + `sr3d-padui-4f.js`; trang thử `mau-4f-ipad-giu-ket-noi.html` + `pad-4f.html?t=0|1` (nhiều iPad cùng trình duyệt: thêm `&dev=a` / `&dev=b` / `&dev=c` — không có thì các tab chung 1 mã máy ⇒ coi là CÙNG iPad).
  ⚠️ remote 4f phải do CHỦ TRANG giữ suốt đời (AWord: biến cấp mô-đun trong racing-words.js), game chỉ attach/detach; rời hẳn ⇒ `close()`.
⭐ Trước đó: gói `rw-4e.js` ⇒ lõi `sr3d-4e.js` + intro `sr3d-intro-4e.js` (vẫn xe `sr3d-car-4b.js`), CSS thêm `rw-4e.css`, trang thử `mau-4e-cai-dat-moi-noi.html`, ảnh màn chờ `rw-loading.webp`. Phần dưới (4d) vẫn đúng cho các mô-đun còn lại.
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
7. ⭐ (từ Đợt 544, 17/10) Màn chờ AWord đếm % theo `templates/racing-words/load-files.js` ⇒ chép bản mới xong PHẢI đo lại `scratch/dot543-rec.html?t=racing-words` + `python -I tools/tao-load-files.py <thư mục rec>`; đổi/thêm tiếng thì nén bằng myGame `tools/nen-tieng-3d.py`.
- Khác biệt dòng (LF/CRLF) ở các file cũ khi chép là bình thường (autocrlf), không phải sửa nội dung.

## 5. Bẫy đã trả giá ở đợt này (nhớ!)
- ⛔ **Lõi và intro phải cùng mô-đun xe** (`SO_DO` số đo xe nằm trong mô-đun): khác ⇒ bước dịch sẵn chậm 20 s mỗi lần tải (dịch shader thật chỉ ~1,7 s).
- ⛔ Python vá file: file myGame có CRLF ⇒ đọc `newline=''` rồi đổi `\r\n`→`\n`, ghi lại đúng kiểu; viết script có `\r\n` bằng Write tool dễ hỏng ký tự — viết lại cả file thay vì sửa chuỗi thoát.
- ⚠️ Bàn thử: `game.step()` bật `manual` ⇒ vòng vẽ thật dừng, xong phải `game.resume()`; `game.drive(i, {...})` giữ tới khi `drive(i, null)`; `game.start()` thẳng (bỏ intro) không chờ dịch sẵn ⇒ thấy dịch shader giữa trận giả.
- ⚠️ Khung trình duyệt ẩn ⇒ rAF dừng; công cụ JS chạy "thế giới tách biệt" ⇒ muốn bọc `gl.draw*` / `linkProgram` phải chèn `<script>` vào trang.
- ⚠️ Khai báo `let/const` dùng trước chỗ định nghĩa trong `createSpeedRun` ⇒ lỗi TDZ (4c `trafficMode`) — đặt lệnh gọi sau dòng khai báo.
- Lái mới: tốc độ quay đầu `yawR(v) = min(1,25; 16/v)` — bám 10 m/s² thì boost không ôm nổi cua gắt; độ cong hình = độ cong vật lý (`kapV`, trần 0,0065 rad/m).

- ⛔ Tên lớp CSS mới phải grep cả game trước (4f: `rw-wait` đã là thanh chờ lượt ⇒ gắn lên `.rw-root` làm khung cao 5 px).
- ⚠️ Bàn thử iPad 2 tab: tab nền bị dừng rAF ⇒ góc nghiêng (tính trong rAF) không gửi — front tab iPad khi giả nghiêng (`__padui.tiltDebug(deg)`). Giả mạng chặn: bọc `RTCPeerConnection` với `iceTransportPolicy: "relay"`.

## 6. Số đo tham chiếu (máy nhà 1600×900, góc Chase, giữa trận)
- 3z 452 lệnh vẽ / 1,90 triệu đỉnh · 4a 465 / 2,44 · 4b 448 / 2,43 · 4d ~375 (gộp camera 309) · 63–65 shader, không dịch giữa trận · prewarm ~1,6–1,8 s · 96–100 fps (trần trình duyệt).

## 7. Hướng làm tiếp (khi thầy thử xong)
- Chỉnh theo phản hồi TOMKO: độ nhạy lái (`yawR`, `steer.max`), mật độ / tốc độ xe khác (`sr3d-traffic-4c.js`), khung camera trời (`game.mtune` chỉnh thử ngay: b0 b1 h0 h1 l0 l1), ngưỡng gộp (50–100 m / 150 m).
- Có thể thêm: âm thanh cho phần thưởng / va xe khác / dốc xoắn; AI tự lái lách dốc xoắn; hiện số mạng/phần thưởng trên iPad.

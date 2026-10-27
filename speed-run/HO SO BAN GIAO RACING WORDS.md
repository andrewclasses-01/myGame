# HỒ SƠ BÀN GIAO — RACING WORDS (chốt 16/10/2026 · cập nhật DRONE 19/10/2026)

Đọc file này TRƯỚC khi làm tiếp ở phiên sau. Chi tiết từng mẫu: `NGHIEN CUU GAMEPLAY.md` (mục 31–40). Ghi chú phía AWord: `AWord/web/templates/racing-words/GHI CHU RACING-WORDS.md`.

## ⏭ MỚI NHẤT — MẪU 5l (27/10/2026) — ĐƯỜNG THẬT CUA GẮT + RÀO HÃM + DỐC HẸP + BAY CHÔNG CHÊNH / LỘN VÒNG + XE GIAO THÔNG 3D · myGame `56dc03a` = AWord Đợt 589 `7eb5829` LIVE · ⬜ thầy thử TOMKO + iPad
**Thầy yêu cầu:** đường thật dài hơn (không tăng vòng) · cua gấp ~90° + zigzag, xe cua tốt hơn nhưng cần kỹ thuật · cọ lan can: tóe lửa nhiều + khói đen ở điểm chạm + hãm
nặng khi chạm lâu · dốc rộng 1,5 lần xe · nửa xe trên dốc thẳng ⇒ không xoay trục dọc, chỉ vọt + nghiêng nhiều, phải nghiêng ngược để đáp · dốc xoắn bay nhanh hơn dốc thẳng ·
trên không bẻ lái mạnh ⇒ lộn vòng tới 360° đáp perfect, lộn ⇒ nhanh + xa hơn, có chữ + boost · bay dốc thẳng không bao giờ thẳng tắp, vô lăng nhạy hơn, khó perfect · xe traffic 3D nhẹ.
**Soát đồng bộ trước khi làm:** AWord Đợt 588 HEAD, racing-words = Đợt 571 = myGame 5k — 41 file `3d/` giống hệt (chỉ khác import mc3d-qr).
**File (5l, 5k giữ nguyên):** `mau-5l-duong-cua-gat.html` · `core/rw-5l.js` · `core/sr3d-5l.js` · `core/sr3d-track-5l.js` (MỚI) · `core/sr3d-world-5l.js` · `core/sr3d-traffic-5l.js` ·
`core/sr3d-car-5l.js` · `core/sr3d-missile-5l.js` · `core/sr3d-flycar-5l.js` · `core/sr3d-dammo-5l.js` · `core/sr3d-intro-5l.js` · `traffic3d/*.glb` (+ NGUON.md). iPad: `pad-5j.html`.
- **ĐƯỜNG (`sr3d-track-5l.js` `buildTrack()`):** đa giác `POLY` [x, y, R] (màn: x Đông, y Nam; θ tăng = cua PHẢI) bo cung R ⇒ bảng 1 m: κ (làm mượt ±3 m cho vật lý), θ, x, y.
  LAP 3.530 m, khép đúng 2π. Đoạn thẳng: 292 · 361 · 289 · 331 · 721 m (+ ngắn). `RAMP_SITES` / `TWIST_SITES` = [chỉ số cạnh thẳng, mét từ đầu đoạn, ±1] — chỉ nhận khi còn
  ≥ 240 / 230 m để đáp (xe bay dốc thẳng ~200 m, lộn vòng ~250–280 m, xoắn ~240 m). Vòng sau đổi bên dốc. Trường khoảng cách 4 m (byte = mét, trần 255) + `distAt` song tuyến
  như GPU; `SHORE_Y` = bờ biển (Nam đường ven biển + 55 m); `mapPts` 400 điểm vừa khung SVG 940×180. Lõi: `LAP` cố định, `LAPS = ceil(FIN / LAP − 0,02)`, đích ở đâu cũng được.
  ⚠️ Sửa hình đường ⇒ chạy lại kiểm khép vòng + khoảng cách đoạn (≥ ~120 m, cảnh/đất dựa vào đó) — bản thử node ở scratch: in LAP, TURN/2π, đoạn thẳng, sites, min sep.
- **HÌNH (`sr3d-world-5l.js` BEND_GLSL):** `uBendT` RGBA float 256 mẫu / 1.400 m: r = PHẢI, g = TỚI của tim đường so với máy quay, b = φ ⇒ đỉnh (x, a) = C(a) + x·(cos φ, −sin φ);
  xa hơn ⇒ tiếp tuyến; sau máy quay không uốn; độ võng uBend.y theo khoảng cách TỚI sau khi xoay. `bPhi` ⇒ makeBend xoay `vNormal` (chỉ vật liệu có normal_vertex).
  Lõi `bendProfile` lấy thẳng từ bảng thật (không tích phân) ⇒ cùng hệ với đất; `bendPJ` = bản JS (thẻ tên / mũi tên). ⚠️ Mọi shader có bản sao bendW (car / missile / flycar)
  nay import BEND_GLSL của world-5l — thêm module có shader riêng thì cũng phải lấy bản này.
  ĐẤT / BIỂN không uốn: lưới bám máy quay, `toW()` = tim đường tại máy quay + hướng (`U.uTrk` đặt trong prepView mỗi máy quay) ⇒ toạ độ thật ⇒ `groundH(q)` (TERRAIN_GLSL,
  ảnh `uDistT` R8 lọc tuyến tính) — JS `groundW(trk, X, Y)` / `sandW` đặt cây. Biển = tấm phủ cả quanh máy quay, chỗ nào đất thấp hơn −1,3 m thì thấy nước.
  Cây / bụi / cỏ / dừa / cột đèn: 2 bên, bỏ khi κ·x > 0,55 trong ±36 m (đỉnh uốn sẽ gập) hoặc khoảng cách tới đường < 12–13,5 m (sát đoạn khác); dừa chỉ trên cát.
- **VẬT LÝ:** `yawR = min(2,4, 58 / v)` (cũ min(1,25, 16 / v)); AI nhìn trước κ 0,12 s. Tự lái 1.920 m ~155 km/h: cọ rào 4 lần (zigzag).
- **RÀO (`railScrape`):** lần đầu −3…20 % theo vận tốc đâm ngang; cọ tiếp `v *= e^(−k·dt)`, k = 1,6 + 5,9·smooth(0,12, 1,2, railT) (rời > 0,3 s ⇒ reset); tia lửa theo nhịp
  (160 + 4v + 260·… hạt / s — ⚠️ bể `missiles.sparks` chỉ 300 hạt, phát theo khung là tràn) từ góc trước phía rào, vận tốc tới 25–70 % xe + văng ra lòng đường; khói đen
  `missiles.dark` mỗi 15–35 ms; sự kiện `rail` (crash + screech, cọ lâu rít mỗi 0,55 s). missile-5l: hạt cộng sáng mờ dần khi cách máy quay < 3,5 m.
- **DỐC:** `RAMP_W` 3,1 m. Nửa xe ⇒ `t.ar` = ±atan(H/W)·1,3–1,65 (38–48°), `t.arV` ±0,55–1,0 cùng chiều, toast "TILTED! STEER BACK", sự kiện `tilt`. Không còn forced barrel roll.
- **BAY (`flyStep`):** `AIR.STEER` 10 rad/s² · `DAMP` 0,45 · `RMAX` 8 · `GUST` 1,6 (2 sin) + `t.gB` ±0,5–1,2 cố định cả lần bay · rời mép `ar` ±0,07–0,16, `arV` ±0,25–0,55 ·
  không tự cân khi đang đua · lộn vòng khi |arV| > `ROLL_V` 3,4 và |ar − ar0| > `ROLL_A` 1,5 ⇒ `airK ×ROLL_K` 1,3, vy +1,4, v +5 m/s, toast "BARREL ROLL! +SPEED", sự kiện `roll`.
  PERFECT 10° / OK 30°. Dốc xoắn: `airK ×TWIST_K` 1,35, v ×1,1 (trần VNITRO×1,3), lộn ép như cũ; lệch sau lộn = `t.arVk` (vận tốc lật). AI trên không tự giữ thăng bằng.
- **XE GIAO THÔNG (`sr3d-traffic-5l.js`):** `MODELS` 6 mẫu (tỉ lệ ra xe), `loadModel` gộp mảnh (kể cả atlas của bán tải: lấy màu ảnh tại UV), mũi về −z theo vật liệu Headlights,
  bề ngang đích W ⇒ TSIZE đo lại; vật liệu chung chèn `aPaint` (thân = 1 ⇒ nhân instanceColor; taxi / bán tải giữ màu gốc). Hộp cũ làm lưới tạm khi chưa nạp.
**Đã kiểm:** xem GHI CHU DU AN chặng 27/10 (bay 3/4 BAD khi không lái, giữ cân PERFECT, lộn 434–445° bay 242–281 m, nửa dốc chỉnh ⇒ PERFECT, xoắn 225 km/h ×2,03, rào 162 ⇒ 43 km/h / 0,67 s,
6 mẫu xe đúng hướng, 0 lỗi, 298 lệnh vẽ). **Chưa kiểm:** TOMKO fps · iPad thật · Sky view / drone / Roadster / vạch lửa trên đường mới · Time / Words.
**Bàn thử:** `__rw().game` — `start()`, `step(n)` (sau start cần ~550 bước mới hết đếm đèn), `place(i, s, x)`, `T[i].manual = { steer, boost, brake }`, `ramps()`, `twists()`,
`traffic()`, `setTraffic("both")`. Ảnh khi khung Browser ẩn: vẽ canvas sang canvas 2D rồi `fetch` POST dataURL về máy nhận tạm (scratch recv.py, cổng 8877).

## ⏭ MỚI NHẤT — MẪU 5k (21/10/2026) — ROADSTER BÁM XE NHANH + TÊN LỬA TỰ ĐUỔI · ✅ myGame `43b74cf` = AWord THẬT Đợt 571 `178fa41` LIVE
**Thầy yêu cầu:** (1) Roadster đạt tốc độ cao hơn, luôn bám được xe nhanh hơn kể cả khi xe đó vượt dốc 150–200 km/h — đang đuối. (2) Tốc độ cao Roadster giật, đuối, khói xịt 2 bên bay lệch lung tung — mượt mọi tốc độ.
(3) Bỏ tâm tên lửa: tên lửa tự đuổi tới khi trúng — bấm 1 cái = xe XA, chạm đúp = xe GẦN, trúng 100 %; trên đường cũng vậy.
**5k-b (cùng ngày, thầy thêm):** "bấm 1 trong 3 nút loại tên lửa thì cũng bắn luôn · 1 drone bắn thoải mái không cần chờ, bắn liên tục". `droneSel(k, d, fire)` — nút iPad (`d0–2`) + phím 1 2 3 (bàn số 1 2 3 drone 2) = chọn + BẮN.
  1 drone (`!two()`): bỏ chờ đạn đang bay, bỏ hồi chiêu, không trừ pin (2 drone giữ luật cũ). Roadster: chạm thứ 3 liền / đổi loại đạn trong 0,3 s ⇒ `fireFw` bắn ngay phát đang chờ (đúng loại lúc bấm, `fw.k`) rồi chờ phát mới ⇒ bấm liên tục không mất phát.
  Kiểm: phím 3 ×3 ⇒ 3 phát / 3 trúng, 0 bị chặn · Space ×6 cách 0,1 s ⇒ 3 phát đúp (xe gần) / 3 trúng · phím 1 rồi 2 liền ⇒ 1 Heart + 1 Boost, đúng loại, trúng cả 2.
  ⚠️ Bấm dồn < 0,3 s thì 2 chạm gộp thành 1 phát ĐÚP (xe gần) — bản chất của luật đơn / đúp. Thẻ đạn iPad vẫn ghi "40 % · 4 s" (chữ cũ, 1 drone không còn áp dụng).
**Soát đồng bộ trước khi làm:** AWord Đợt 570 `d5eeeca` ⇄ myGame 5j-i `4f5cc79` — 40 file `templates/racing-words/3d/` giống hệt (chỉ khác dòng import three), glb Roadster giống byte; `mc3d-qr.js` chỉ AWord có (đúng).
**Nguyên nhân "đuối":** xe đua bay khỏi dốc đi `t.v × airK` (tới ×1,5, cộng ×1,2 lúc rời mép ⇒ ~350 km/h hiệu dụng) nhưng Roadster bám theo `t.v`; BOOST trên đường dừng ở VBOOST 47 m/s (169 km/h) < NITRO 57; tự bám xe cuối kẹp +7 m/s, gia tốc 10; bay kẹp ±14 m/s, nhịp 1,5/s; rời dốc bị hãm về VNITRO×1,15.
**Đã làm (`mau-5k-roadster-ten-lua-tu-duoi.html` · gói `core/rw-5k.js` · lõi `core/sr3d-5k.js` · `sr3d-dammo-5k.js` · `sr3d-flycar-5k.js` · `sr3d-intro-5k.js` = intro-5j chỉ đổi import flycar-5k; iPad vẫn `pad-5j.html`):**
- `vEff(t)` = tốc độ thật trên đường; trần Roadster `VC_MAX` 95 m/s (342 km/h), gia tốc `VC_ACC` 24. BOOST đường: đích = max(VNITRO+8, xe nhanh nhất (tốc chạy đất) + 14 + đẩy thêm tới +30 khi tụt sau xe dẫn) — KHÔNG lấy vEff ở đây (xe dẫn đang bay ⇒ Roadster vọt 330 km/h vô lý).
  Không BOOST: lò xo bám xe cuối theo vEff (±16, ×3, tới 24 m/s²). Bay: `C.vL` = vEff xe dẫn lọc nhẹ, vT = vL + (sT − s)·1,5 kẹp −24…+32, gia tốc −36…+45 m/s². Rời dốc không bị hãm nếu đã nhanh hơn trần cũ.
- Mượt: rung xe + máy quay = nhiễu sin `nz()` thay Math.random() mỗi khung · `C.bK` (lửa đuôi + máy quay lùi khi BOOST) giữ suốt lúc BOOST (cũ tắt khi ≥ 49 m/s ⇒ giật) · ống hông theo gia tốc ngang ĐÃ LỌC `C.swA`.
- Khói (`flycar-5k`): LỖI cũ — phát hạt xong mới `smoke.update` ⇒ hạt mới vọt trước miệng ống v·dt (~0,9 m ở 200 km/h) + nhịp hông dùng vận tốc xe LÚC PHÁT ⇒ xe đổi tốc là dải khói trôi lệch. Nay `update(dt, carry)` chạy TRƯỚC khi phát, hạt nhịp hông đi theo vận tốc xe hiện tại (dính ống); khói gầm / đuôi / tràn đường rải lùi trong 1 khung (`lui`) ⇒ hết thành cục.
- Bắn (`droneFire`): Roadster mọi lúc (đường + bay + 2 drone) chờ 0,3 s xem chạm đúp; 1 = xe XA · 2 = xe GẦN; `dammo-5k` `fire({ home, tgt })` — mỗi khung điểm rơi = chỗ xe đích sẽ tới khi chạm (s + vEff·tl, theo cả y), bay 1,2–3,2 s theo khoảng cách, không dấu điểm rơi; `droneHit` coi xe `h.tgt` là trúng chắc (kể cả đang bay khỏi dốc). Tâm ngắm Roadster tắt hẳn. Chữ cột: "AUTO-HOMING · FIRE = FARTHER · 2× = NEAREST". Sự kiện droneShot thêm `tgt`.
**Đã kiểm (localhost, bàn thử step):** BOOST đuổi từ 110 m sau xe dẫn đang bay dốc (236 km/h × airK) ⇒ bắt kịp + vượt · bay: xe dẫn rời dốc tụt tạm ~20 m rồi bắt lại ~2 s · 6/6 phát tên lửa trúng ĐÚNG xe (đơn = xa, đúp = gần; đường 2 + bay 4) · ảnh cột Roadster bay: không tâm, khói đuôi thành dải · 0 lỗi console · node --check bản .mjs 5 file sạch.
**Chưa kiểm:** cảm giác thật trên TOMKO + iPad (giật còn không) · 2 drone Roadster bắn (đã nối logic, chưa thử).
**ĐÃ lên AWord Đợt 571 `178fa41` (LIVE, 21/10):** GOC = "rw-5k.js" (GOC_THEM / CSS giữ) · load-files đổi 5 dòng 5j → 5k theo byte (chưa đo lượt tải thật) · bàn thử `scratch/dot571-rw.html` nạp đúng 5k, 0 lỗi · live là bản đã nén ⇒ kiểm bằng grep chuỗi. ⏭ Phiên sau: ⬜ thầy thử TOMKO + iPad · sửa chữ thẻ đạn iPad ở 1 drone · thử 2 Roadster bắn.
**Bẫy đợt này:** hàm phụ `sp` trùng tên biến tốc độ `sp` trong vòng khói tràn đường ⇒ "sp is not a function" chỉ khi bay sát đất — đổi tên `lui`. Phím thử: phát `keydown` trên `document` là NỔI lên `window` ⇒ gửi 2 lần (Space thành chạm đúp) — chỉ gửi trên window.

## ⏭ MỚI NHẤT — MẪU 5j (21/10/2026) — XE BAY ROADSTER trong bộ Drone · ✅ CHỐT 5j-i ⇒ AWord THẬT Đợt 570 `d5eeeca` LIVE (myGame `4f5cc79`)
**Phiên đóng 21/10.** ⏭ Việc chờ: ⬜ thầy thử TOMKO (fps) + 4 iPad thật với Roadster · ⬜ 2 drone + Roadster mới chỉ bay (chưa chạy đường) · ⬜ màn chờ load-files mới đổi tên + byte, chưa đo lại lượt tải thật (tools/tao-load-files.py).
**5j-i (21/10) — TỐI ƯU HIỆU NĂNG trước khi chốt (đo lệnh vẽ / khung, cùng máy, renderer.info cả 3 khung):**
| | 5i | 5j trước | 5j-i (chốt) |
|---|---|---|---|
| tắt drone | 404 | 474 | **406** |
| Mavic | 636 | 747 | 673 |
| Roadster sau 2 xe | — | 1.944 (3,28 M tam giác) | **658** (1,32 M) |
| Roadster trước 2 xe | — | 1.900 | **757** (1,64 M) |
| Roadster bay | — | 1.971 | **768** |
- Kính Ferrari `transmission` ⇒ three vẽ lại CẢ CẢNH thêm 1 lượt mỗi khung ⇒ đổi kính trong thường (opacity ≤ 0,38).
- Roadster sau lưng máy quay buồng lái (ds ∉ [−6, 340] m) ⇒ khung đó không vẽ (prepView).
- Dốc / dốc xoắn SAU vạch đích = bộ riêng rampsX / twistsX, chỉ dựng khi Roadster tới gần đích (C.s > FIN − 500).
- 16 ống phụt (64 mảnh) gộp theo vật liệu ⇒ 3 mảnh (parts.nozM); nhóm ống giữ làm điểm neo khói / lửa.
- ⛔ `node --check file.js` KHÔNG bắt lỗi cú pháp module ⇒ kiểm bằng bản sao .mjs.

**5j-h (21/10) — LỖI thầy báo: lộn vòng từ dốc, bấm TAKE OFF ⇒ xe đứng im, bấm ga không đi:**
- Nguyên nhân chính: bản vá 5j-g ghi chú chèn giữa dòng ⇒ lệnh `C.s += C.v * dt; d.s = C.s;` của nhánh BAY nằm sau `//` ⇒ mọi lúc bay (up / kick / air / down) xe KHÔNG TIẾN. Đã đưa về dòng riêng; đã rà các ghi chú 5j khác (không còn chỗ nào).
- Phụ: tốc bay vT = lead.v − 14 khi Roadster ở trước ⇒ đầu trận (xe đua ~10 m/s) ÂM ⇒ trôi lùi. Nay vT ≥ max(½ lead.v, 5 m/s); bay mà bấm BOOST ⇒ vT ≥ lead.v + 14 (phóng tới thật); cất cánh đặt d.bk = khoảng đang cách xe dẫn (không bị giật về).
- ⛔ Bài học: vá bằng python thay CẢ DÒNG; nếu thêm chú thích cuối dòng thì chắc chắn chuỗi bị thay nằm ở CUỐI dòng.

**5j-g (21/10) — thầy góp ý tiếp:**
- PHANH trên đường (Roadster): vệt bánh (2 bánh sau; > 22 m/s cả 4) + khói lốp ở đuôi (carSkid).
- XƯỞNG: Roadster lùi sâu FC_Z = CAR_Z + 7 (cũ +3,6: cảnh 2 máy quay cận ống xả xe đội 1 đứng ĐÚNG chỗ Roadster ⇒ che). Đã xem lại cảnh 1–3 bằng intro.seek: sạch.
- Bật thrust từ dốc: văng tiếp theo quán tính 0,4 s (thân thẳng) / tới lúc gầm song song đất (đang lộn) rồi mới nổ; giữ đà tiến, bám cụm xe từ từ. Máy quay đường ⇄ trời chuyển MƯỢT (C.ck êm, 0,9/s khi kick / hạ).
- Roadster ĐÂM XE GIAO THÔNG như xe thường (carTrafficHit).
- Tên lửa trúng xe giao thông: vùng nổ rộng ~6,5 m (dễ bắt lửa).

**5j-f (21/10) — thầy góp ý tiếp:**
- DỐC / DỐC XOẮN đặt tiếp QUA vạch đích tới FIN + 4 km (RMAX; chừa ±70 m quanh đích) ⇒ Roadster chạy xa trước vẫn gặp dốc.
- Chạy đường KHÔNG bấm BOOST ⇒ tự giữ ~14 m SAU xe cuối (vT theo xe cuối, a = (vT − v)·2,4) — thấy cả 2 xe. BOOST mới vượt lên.
- Đang HẠ CÁNH + BOOST ⇒ C.dF: đuôi phụt lửa + khói, vT + 20 m/s, vừa phi tới vừa xuống; chạm đất lửa dài thêm.
- XE GIAO THÔNG trúng tên lửa: `sr3d-traffic-5j.js` blast(v, side) — hất lên, lộn tới nằm NGHIÊNG (π/2) hoặc NGỬA (π), nảy, cháy 5,5 s (lõi burnTraffic phát lửa + khói đen), sơn cháy đen, tiếng "trafficBoom".
- Roadster có chấm "R" (màu xe) trên BẢN ĐỒ (.m-rd).
- Vết cháy vạch lửa = `scorch` (InstancedMesh ảnh mờ nhiều vòng loang, xoay + kéo dãn ngẫu nhiên) thay vệt chữ nhật burnSk.
- ĐÈN PHANH: tách tam giác đuôi của mảnh LightA ra mảnh riêng (parts.tail), phanh ⇒ emissive đỏ 3,75 (bình thường 0,35).

**5j-e (21/10) — thầy góp ý tiếp:**
- RUNG sau khi bật thrust từ dốc: lỗi — C.shake chỉ tắt dần khi chạy đường ⇒ bay rồi vẫn rung mãi. Nay tắt dần ở mọi chế độ.
- Tên lửa bệ 3 nòng: `sr3d-dammo-5j.js` fire({ dir, vel }) — rời nòng ngửa lên theo nòng, vượt qua đầu xe rồi cuộn xuống (đích sau xe ⇒ cắm từ phía trước), mang vận tốc xe (giảm (1−x)²) ⇒ không xuyên qua xe. Miệng nòng còn vương khói ~1,4 s (`fc.puffTube`).
- VẠCH LỬA loang lổ: các đám (spots) to nhỏ, lệch trước sau, độ mạnh khác nhau; vết cháy = nhiều vệt chéo đè nhau + lấm tấm muội; lửa / khói phát theo từng đám (flSpot).
- Biển số: ẩn hẳn mảnh `ManufacturerPlate` của mẫu, chỉ còn biển ANDREW TEAM.
- Cảnh: `sr3d-world-5j.js` update(…, sAlt) — Roadster ra khỏi cửa sổ cảnh của 2 xe ⇒ rải thêm cây / cột quanh nó (thử 2,2 km trước: có cây).

**5j-d (21/10) — thầy góp ý tiếp:**
- Khói hông lúc GIỮ CÂN: nhịp 1/2 thời gian (`burst(k)`, bS), 1/2 số hạt, dải ngắn hơn (tốc 2–14), mờ hơn (0,26). Lúc lái / dạt mạnh giữ như cũ.
- Tâm bắn khi Roadster BAY: `home = d.bk + v(xe nhanh nhất) × DA.T (1,5 s) + 4 m`, iPad chúc chỉ chỉnh −18…+12 m quanh đó (d.adO).
- Trên đường: BOOST ⇒ lửa đuôi nhẹ + khói đuôi + máy quay tụt lại chút (C.bK) · nhảy dốc ⇒ gầm hé thrust + khói đuôi. Lửa đuôi = nón cộng sáng `parts.flames`, st.flame.
- KICK (đang bay khỏi dốc mà bấm TAKE OFF, mode "kick"): thân thẳng ⇒ nổ ngay; đang lộn ⇒ lộn tiếp, gầm phụt mạnh (khói xoáy theo thân), tới lúc gầm song song mặt đất mới nổ. Nổ = st.blast (300×) + st.swirl khói xoáy, tiếng boom+boost+hit (rw-5j "carKick"), hất kvy 14 (xoắn 17), lắc tắt dần 3,2 s (carKickPose kr/kp), thrust hông giữ cân theo kr.
- LAND: hạ nhanh hơn (2,6 + 0,6·y m/s), vừa tiến vừa xuống; chạm đất văng đuôi nhẹ + nảy + đuôi phụt LỬA 1,6 s tăng tốc (C.flameT), tiếng "carTouch".
- iPad: lúc đang hạ nút hiện TAKE OFF và BẤM ĐƯỢC (cũ bị khoá "LANDING" ⇒ không huỷ được trên iPad).

**5j-c (21/10, khuya) — thầy góp ý tiếp:**
- XƯỞNG: Roadster ĐỨNG SÀN như xe thường, đặt CHÉO phía sau (z CAR_Z+3,6, quay 0,55 rad; 2 drone ⇒ 2 chiếc x ±1,9), giấu ống phụt + bệ (`fc.stealth(true)`), đèn trần riêng `fcSpot` + cột sáng `fcBeam`; phim START: lăn theo 2 xe ra cửa.
- Sơn mặc định tươi hơn `#1e8f4e` (export PAINT). Settings ▸ Drone: chọn Roadster ⇒ hàng **Roadster colour** (12 màu + ô custom), `dset.carCol` nhớ trên máy, `fc.setPaint()`; xưởng nhận qua setDrone.
- BÁNH: mẫu có camber 2–3° ⇒ quay quanh trục X làm vành đảo. Nay mỗi bánh quay quanh TRỤC THẬT (PCA đỉnh lốp, `piv.userData.ax`, rotateOnAxis), tâm = đỉnh lốp − bán kính.
- DỐC NHẢY / DỐC XOẮN khi chạy đường: chép luật xe đua (carRamp · carGround · carLaunch · carAir · carLand): dốc thẳng vọt ~5 m, dốc 1 bên / xoắn ⇒ barrel roll, trên không ◀ ▶ = nghiêng, BRAKE + lái = lộn, đáp lệch > 32° = BAD (mất đà). Không có toast PERFECT (cột drone). Bàn thử: `game.drone.carPut({s, x, v})`.

**5j-b (21/10, tối) — thầy góp ý sau khi thử lab:**
- XƯỞNG: `core/sr3d-intro-5j.js` (= intro-5f + Roadster trong ô ◀ ▶ drone; rw-5j.js nhập intro này). Xe CỠ THẬT bằng 2 xe đua, lơ lửng giữa (x 0, cao 0,6 m, nhô lên trước 1,2 m), khói sàn nhẹ, đèn rọi mạnh hơn; 2 drone ⇒ chiếc đội 2 cao 2,4 m phía sau. Phim START: bay theo xe ra cửa.
- Sơn mặc định XANH LÁ ĐẬM `#0f5c34` (PAINT trong sr3d-flycar-5j.js, bỏ map sơn) — 2 drone vẫn sơn màu đội.
- Khói hông: carry có cả vận tốc LÊN/XUỐNG của xe ⇒ dải khói không méo khi cất/hạ cánh; nhỏ 30 % (0,05→0,035, nở ×0,7), mờ hơn (0,66→0,42); đứng yên ⇒ phụt thưa (0,9–2,7 s).
- Cất cánh: 0,9 s đầu đứng trên đường xả khói (C.sp) rồi mới nhấc · khói tràn mặt đường `st.ground` = lift × (1 − y/4) (cả lúc hạ cánh sát đường) · hạt khói gầm chạm đất loang ngang.
- TAKE OFF / LAND bấm giữa chừng = huỷ: đang hạ ⇒ bay lên lại ngay; đang lên ⇒ hạ.
- load() của xe bay chỉ nạp 1 lần dù gọi 2 lần.

`mau-5j-xe-bay.html` · gói `core/rw-5j.js` · lõi `core/sr3d-5j.js` (dựng từ 5i bằng script, 5i giữ nguyên) · xe `core/sr3d-flycar-5j.js` + `drone3d/flycar-F296.glb` (155k tam giác, 3,9 MB) ·
iPad `pad-5j.html` (`core/sr3d-padui-5j.js` bảng ROADSTER gộp) · đường nối `core/sr3d-padlink-5j.js` (phím "fly", tin j: + car + kmh). Thiết kế: `thiet-ke-5j-xe-bay-v2.html` (thầy chốt).
- Kiểm 21/10: myGame 5i ⇄ AWord Đợt 558 KHỚP 100 % trước khi làm 5j.
- Settings ▸ Drone ▸ FLYING CAR · Roadster (cỡ thật 4,57 m). 1 drone: đỗ sau 2 xe lúc 5 đèn (bệ thu) → GO chạy đường (BOOST vô hạn, BRAKE, lái; bệ bật lên), VA CHẠM 2 xe đua (collidePair) →
  TAKE OFF (iPad / phím Y) bay lên độ cao drone, máy quay lùi xa → LAND về đường. Đạn ra từ đúng nòng (trái Heart · giữa Boost · phải Missile). Trên đường không tâm: FIRE 1 chạm = xe gần nhất, đúp = xe xa hơn (trước + sau).
- Mọi drone: BOOST = tiến · BRAKE = lùi (thay NEAR / FAR). Bàn thử: `__rw().game.drone.car` · `.fly()` · `game.step(n)`.
- ⬜ Còn: xưởng (intro) chưa hiện Roadster (vẫn Mavic) · 2 drone + Roadster chỉ bay (chưa chạy đường) · chữ đầu cột màn lớn còn "DRONE" · chưa đo TOMKO / 4 iPad thật · ⬜ thầy thử.

## ⏭ MỚI NHẤT — MẪU 5i (20/10/2026) — ✅ ĐÃ LÊN AWORD THẬT Đợt 558 `12eeef7` (LIVE 9/9) — NGHIEN CUU mục 49
`mau-5i-vach-lua.html` · gói `core/rw-5i.js` · lõi `core/sr3d-5i.js` · CSS `core/rw-5i.css` · iPad `pad-5i.html` (`core/sr3d-padui-5i.js`) · chung `core/rw-bloss-5i.js`.
- **VẠCH LỬA** (1 drone): tên lửa drone trúng xe ĐANG DẪN ⇒ giữ xe đó (mất lái như cũ) + lửa ngang đường 4,2 m sau nó; xe đuổi tự phanh, dừng cách lửa 6 m (bảng FIRE LINE),
  không bao giờ vượt; hết mất lái ⇒ thả cả 2 cùng lúc, xe đuổi chậm Fire line slow % trong 1,6 s. Trượt / 2 drone / trúng xe sau = như cũ.
- **⚙ Settings ▸ Boost** (nhớ theo máy `racingwords.boost.v1`): Next question 1–5 s (3) · Boost gain 0–100 % (15) · Boost max 0–100 % (50) · Boost off 0–100 % (15) · Fire line slow 0–50 % (15).
- Sai ⇒ khúc boost mất ĐỎ rồi xịt xuống + khói đen trên bàn đạp (màn lớn + iPad).
- ⏸ **TẠM CHỐT 20/10/2026** (thầy: "tạm chốt đến đây, tôi sẽ tiếp tục trong các phiên sau"). Phiên sau VÀO THẲNG: (1) hỏi thầy kết quả thử TOMKO vạch lửa + tab Boost + tab Driver;
  (2) 2 câu chờ thầy: nghĩa "Boost max" (em đang hiểu = mức nạp khi đúng NHANH NHẤT) · thanh thứ 5 = Fire line slow có đúng ý không; (3) chưa đo fps TOMKO lúc vạch lửa cháy
  (150 hạt lửa/s dùng chung pool tên lửa — nghi nhẹ, đo nếu thầy thấy khựng). Sửa tiếp = bản mới 5j ở myGame rồi chép AWord như Đợt 558.
- ✅ Lên AWord Đợt 558 (GOC rw-5i, GOC_THEM padui-5i, CSS + rw-5i.css, pad.js, load-files thay 4 mục). Sửa luôn tab Driver bấm không ăn (lỗi từ 4w). ⬜ Thầy thử TOMKO (+ iPad). Câu hỏi chờ thầy: nghĩa thanh "Boost max" + thanh thứ 5 (xem mục 49).

## ⏭ VIỆC CHỜ SỐ 1 — PHIÊN SAU VÀO THẲNG: TEST LẠI + TỐI ƯU TRÊN TOMKO (ghi 19/10/2026)
**✅ ĐÃ LÀM 19/10 ⇒ MẪU 5h** (`mau-5h-tomko.html` · `core/rw-5h.js` · `core/sr3d-5h.js` · `core/rw-5h.css`) — số đo + nguyên nhân: NGHIEN CUU mục 48.
2 drone: đua ≈ 85 ⇒ ≈ 40 khung trễ / ván, 5 đèn 56 ⇒ 60, độ nét giữ 0,9–1,0 (5f tụt 0,7), không còn khung > 50 ms. **✅ ĐÃ LÊN AWORD THẬT Đợt 556 `a4170d8`** (live kiểm 6/6, đo lại thư mục AWord thật: 2 drone 5 đèn 58–59 · đua 59,7). ⬜ thầy thử TOMKO thật + 4 iPad. Cách đã làm:
`chep-racing-words.py` GOC = "rw-5h.js" + CSS thêm "rw-5h.css" (đúng thứ tự, cuối) + template `GAME`/`CSS` ⇒ đo lại trên thư mục AWord thật. Không bỏ hiệu ứng nào (chỉ ẩn mảnh xe < 0,22 m trong cột drone).

Thầy 19/10: "sau đợt tối ưu game gần nhất cho TOMKO, hiện đã nâng phiên bản và thêm nhiều tính năng mới. Ghi việc chờ test lại trên TOMKO để tiếp tục tối ưu
các tính năng mới đó trên TOMKO, để phiên tiếp theo ngay lập tức vào việc test và tối ưu."
- **Đợt tối ưu TOMKO gần nhất = mẫu 3r** (16/10, AWord Đợt 533): xưởng 37 ⇒ 60 fps, phim intro 18 ⇒ ~55–60, đua 58,6 ⇒ ~60, hết dịch shader giữa trận.
  Cách đo + nguyên nhân + cách sửa: `NGHIEN CUU GAMEPLAY.md` mục 30 (ĐỌC TRƯỚC). Mục tiêu giữ nguyên: **≥ 59 fps trên TOMKO, không khựng, không dịch shader giữa trận**.
- **Bản cần đo = bản thật trên AWord Đợt 554 `12f3922`** (GOC `rw-5f.js` · lõi `sr3d-5f.js` · xưởng `sr3d-intro-5f.js` · iPad `padui-5g`). Thêm từ sau 3r, CHƯA đo trên TOMKO:
  · 3y lái nghiêng iPad · 3z HUD mới · 4a chế độ đua / đích dời / cây · 4b đường cong thật (bendProfile mỗi máy quay) + dốc xoắn + phần thưởng trên đường · 4c xe khác (Traffic) ·
    4d Sky view gộp camera · 4e Settings nổi + tạm dừng · 4f cổng iPad · 4g kết trận SLOW MOTION · 4h–4j loading, tên lửa mới, DAMAGE, nút bắn thẻ ·
  · DRONE 4k–5d: cột drone = LẦN VẼ CẢNH THỨ 3 mỗi khung (máy nhà: 433 ⇒ ~700 lệnh vẽ, 0,78 ⇒ 1,2 M tam giác), mẫu drone .glb + đĩa quạt trong suốt, tâm ngắm ảnh canvas cộng sáng,
    đạn drone có vệt + khói + dấu điểm rơi 2 lớp nét / nhoè, bảng kết quả nhiều hiệp ·
  · 2 DRONE 5e–5f: 2 mẫu drone + 2 bộ tâm ngắm + đạn 2 chủ, máy quay nâng cao khi 2 xe xa (nhìn xa hơn ⇒ nhiều cảnh hơn trong khung) ·
  · XƯỞNG 5f: 2 drone .glb + **PointLight mới** (thêm 1 đèn ⇒ mọi vật liệu xưởng đổi khoá shader + tốn GPU từng điểm ảnh — nghi số 1 cho phim intro) + ô chọn drone.
- **Kịch bản đo** (y mục 30: myActivity mở `--remote-debugging-port`, act thật 572, server cục bộ thay thư mục racing-words): đo riêng từng trường hợp
  Drone OFF · 1 drone · 2 drones × (xưởng 12 s · phim START · 5 đèn · đua cả ván · 2 xe cách xa > 60 m · PLAY AGAIN · đổi mẫu drone / đổi xe ở xưởng) + Traffic Both + Sky view Auto.
  Ghi: fps từng khung + long-animation-frame (hàm gây) · `renderer.info.programs` mới giữa trận · lệnh vẽ / tam giác (bàn đo góc trên trái trang mẫu) · timer query GPU từng pass · nvidia-smi.
- **Nghi vấn cần đo trước:** PointLight xưởng 5f · lần vẽ thứ 3 (cột drone) + bloom / nhoè hướng tâm trên cả 3 khung · đĩa quạt trong suốt + bóng drone · ảnh tâm ngắm cộng sáng ·
  vệt / khói đạn drone · dịch shader khi bật drone giữa chừng hoặc đổi mẫu (compileAsync đã có — kiểm có khựng không) · traffic + đường cong 4b · slow motion kết trận.
- **Làm:** sửa ở myGame bản mới tên mới (5h…, ghi vào mục này), đo lại trên TOMKO, thầy chốt ⇒ đưa lên AWord như Đợt 554 (`tools/chep-racing-words.py` + đo lại load-files).
  Được phép (như 3r): giảm đồ hoạ / bỏ hiệu ứng đắt nếu cần để giữ mượt — báo thầy những gì bỏ.

## 0. ⭐ DRONE — ✅ 2 DRONE CHỐT 19/10/2026 · ĐÃ LÊN AWORD THẬT (Đợt 554 `12f3922`, myGame 5f + iPad 5g) — ĐỌC PHẦN NÀY TRƯỚC
Thầy 19/10: "Bản 5g ổn rồi, chốt và đưa lên AWord" ⇒ template racing_words THẬT = GOC rw-5f + iPad padui-5g + padlink-5e (4 chỗ: t = 2 drone 1 · t = 3 drone 2, rwpad_pad3, cờ aw.rwDrone "2"/"3"),
anh-pad/ 4 ảnh, load-files 97 file 5,36 MB; trang thử ẩn lab/racing-drone* ĐÃ XOÁ. Không còn việc chờ drone — ⬜ thầy thử TOMKO + 4 iPad thật.
(Lịch sử bên dưới: 1 drone 5d ⇒ Đợt 553; 2 drone 5e → 5g ⇒ Đợt 554.)
Thầy 19/10 tối: "ok rồi nhé. chốt bản này đến đây, đưa lên AWord và myGame, ghi hồ sơ và ghi việc chờ tiếp theo là điều khiển drone thứ 2".
⇒ Bản CHỐT = 5d (lõi sr3d-5d = 5a + chỉ tải mẫu drone khi drone bật) + iPad padui-5c + padlink-5a. AWord Đợt 553 `f244280`: template racing_words THẬT dùng bản này
(GOC rw-5d, pad.js ?t=2 = vai DRONE với cờ riêng aw.rwDrone, rwpad_pad2, drone3d/ 5 mẫu, load-files đo lại 95 file 5,3 MB). Drone mặc định OFF.
✅ (xong 19/10) ĐIỀU KHIỂN DRONE THỨ 2 — 5e → 5g, Đợt 554. Ghi chép gốc:
  Cần thiết kế ở myGame trước (bản 5e…): bố cục 2 cột drone (hay chia đôi cột giữa?) · iPad thứ 4 (t = 3, rwpad_pad3, padlink 4 chỗ) · luật đạn từng đội · màu / mẫu riêng mỗi drone.
  Thử 4 thiết bị ở trang ẩn `lab/racing-drone.html` (giữ lại), chốt xong mới đưa lên template thật.
  ⏳ 19/10 thầy: "Drone 2 tính năng như drone 1, bay cao hơn chút để không che / không va; drone 1 bay gần mép dưới hơn — thiết kế cẩn thận cho gọn".
  ⇒ Trang thiết kế `thiet-ke-5e-hai-drone.html` (ảnh THẬT chụp từ game 5d trong `anh-5e/`: máy quay drone đặt tay + bản sao drone): 4 cách A hàng ngang lệch tầng (khuyên) ·
  B xếp tầng dọc · C tầng trời cao · D chia đôi cột 2 máy quay. Phát hiện: máy quay chếch trên-sau ⇒ drone 2 cao hơn chút là trồi lên đè xe / tâm (B); cách A = drone 2 cao 13 m (drone 1 12 m)
  nhưng LÙI 0,7 m ⇒ 2 drone ngang hàng sát đáy (82 %), mỗi chiếc giữ nửa đường đội mình; máy quay chung lùi ×1,15 + nhìn tới 42 m. Bảng đạn A1 trên trời / A2 dưới chân.
  ✅ THẦY ĐÃ CHỌN (19/10): A hàng ngang lệch tầng · bảng đạn A1 trên trời NHƯNG tối giản ("cái gì không cần thì bỏ") · NEAR/FAR = a (máy quay ở khoảng TRUNG BÌNH 2 iPad,
  mỗi drone nhích ±3 m theo người lái) · chung 1 mẫu drone, khác màu đội (vòng sáng + số 1/2; thẻ số cạnh tâm ngắm).
  Trang thiết kế mục 3b: bảng đạn tối giản 2 mức — M1 một hàng (số đội + 3 icon đạn: chọn = viền sáng, hồi chiêu = vòng chạy, không dùng = mờ + vạch pin mảnh) ·
  M2 siêu gọn (vòng pin quanh số đội + 1 icon đạn đang chọn). Bỏ: ô nền, chữ DRONE / TEAM, AIM ON THE ROAD / IN SIGHT, tên đạn, dòng phím, "SHOT IN THE AIR".
  ✅ BUILD 5e (19/10, thầy: "Dùng M1, nhưng không cần số 1 và 2 ở khu vực pin và trên thân drone; drone 2 đội thêm màu tương ứng với đội"):
  trang `mau-5e-hai-drone.html` · gói `core/rw-5e.js` (+ CSS `rw-5e.css` sau rw-4y.css) · lõi `core/sr3d-5e.js` · đạn `core/sr3d-dammo-5e.js` (owner + activeOf) ·
  iPad `pad-5e.html` (`sr3d-padlink-5e.js` 4 chỗ, t = 3 = DRONE 2 · `sr3d-padui-5e.js` màn chọn vai 4 nút).
  Settings ▸ Drone: Off / 1 drone / 2 drones (2 drone ẩn chế độ — luôn Team drone: drone 1 = TEAM 1, drone 2 = TEAM 2). Mỗi drone: pin, hồi chiêu, 1 quả một lúc, tâm + tâm bóng mờ riêng.
  Máy quay chung (×1,15, nhìn xa +15 m), F = đội hình (anchorS), máy quay ở NEAR/FAR trung bình, mỗi drone ±3 m; drone 2 cao 13 m lùi 0,7 m; mỗi drone giữ nửa đường mình; nhỏ 15 %.
  MÀU ĐỘI: pha 38 % màu đội vào thân mẫu 3D (+ phát sáng nhẹ, trả màu gốc khi về 1 drone) + quầng sáng dưới bụng + chấm thoi màu đội giữa tâm ngắm. KHÔNG số.
  Bảng đạn M1 trên trời (.rw-dv2): 3 icon (chọn = viền sáng · hồi chiêu = vòng chạy · thiếu pin = mờ) + vạch pin màu đội (đỏ khi < 25 %). Kết trận: 2 dòng TEAM 1 DRONE / TEAM 2 DRONE.
  Xưởng: 2 thẻ DRONE 1 · iPAD (xanh) + DRONE 2 · iPAD (cam) giữa trên. Phím drone 2: bàn số 4 6 8 5 · 7 9 · 1 2 3 · 0. Bàn thử: game.drone.drones / aim(ax, ad, n) / fire(n) / sel(k, n) / near(bk, n).
  Đã thử: khung đúng thiết kế (2 drone 83 % chiều cao, ngang hàng) · bắn 2 drone độc lập, luật đội đúng, chặn quả 2 khi đang bay · iPad t=3 nối, màu cam "TEAM 2 DRONE", lái + chọn đạn + FIRE ·
  1 drone y như 5d (màu gốc, không quầng, bảng cũ) · bảng kết quả 2 dòng · xưởng 2 thẻ QR. ⬜ thầy xem + thử 4 iPad thật; chốt mới đưa lên AWord (template thật: GOC rw-5f, pad.js t=3, rwpad_pad3).
  ✅ 5f (19/10, thầy chỉnh 5 điểm): trang `mau-5f-drone-xuong.html` · gói `core/rw-5f.js` (+ `rw-5f.css` sau rw-5e.css) · lõi `core/sr3d-5f.js` · xưởng `core/sr3d-intro-5f.js` ·
  iPad `pad-5f.html` (`sr3d-padui-5f.js`, ảnh `anh-pad/*.webp` chụp bằng `tao-anh-vai-ipad-5f.html?save=1` + máy lưu 8898, rồi PIL cắt viền + webp).
  1) MÀU SƠN trên thân drone, bỏ quầng sáng: color = lerp(màu gốc, màu đội ×2,4, 0,85), không emissive (⛔ thân Mavic có cờ transparent ⇒ chỉ bỏ vật liệu opacity < 0,3 = đĩa quạt; 5e bỏ nhầm nên chưa lên màu).
  2+3) máy quay ƯU TIÊN XE DẪN: neo xe đi trước, lùi bk + khoảng 2 xe (≤ GMAX 70 m); khoảng xa ⇒ drone cao D_ALT·(1+kg) (tới 24 m), máy quay +20 %, nhìn xa +0,6·khoảng; > 70 m xe sau rơi khỏi khung.
     D_FAR 90 ⇒ 130. Đo: 2 xe cách 60 m thấy cả 2; cách 110 m chỉ xe dẫn.
  4) XƯỞNG: drone lơ lửng khe giữa 2 xe ngang mui (2 drone sơn màu đội, lệch về xe đội mình, chúc mũi 0,32), đèn PointLight riêng (luôn có), ô chọn giữa dưới trên START:
     NO DRONE · 1 DRONE · 2 DRONES + ◀ mẫu ▶ ⇒ đặt thẳng cho trận (game.drone.setDrone), Settings đổi ⇒ intro.setDrone. Phim START: drone bay theo xe ra cửa, bốc cao.
  5) iPad màn chọn vai mới: 4 thẻ vát góc (TEAM 1 · TEAM 2 ảnh xe Revuelto / Jesko sơn màu đội · DRONE 1 · DRONE 2 ảnh Mavic sơn màu), vệt sáng lướt, drone bồng bềnh, TAKEN. Vừa iPad + điện thoại ngang.
  ✅ 5g (19/10, thầy chỉnh iPad): `pad-5g.html` (`core/sr3d-padui-5g.js`) · trang `mau-5g-ipad-vua-man.html` (= 5f + iPad 5g). Lõi / gói nhúng giữ 5f.
  · màn ĐỘI: thẻ tên lửa +x MISSILES dài HẾT bề ngang (dải chạm vốn hết ngang) · vô lăng --W = min(64vh, 47vw) hiện TRỌN (cũ 66vh chìm đáy ⇒ 16:9 / điện thoại cụt),
    bàn đạp --P = min(52vh, 60vw) · cầm dọc: vô lăng min(84vw, 36vh) trên, bàn đạp min(26vh, 60vw) dưới (cũ vô lăng đè bàn đạp). CSS chèn SAU CSS padui-4j (bọc mountPadApp).
  · màn chọn vai: + ANDREW STUDIO (chữ kim loại tím + 2 hình thoi) trên RACING WORDS · thẻ tự giãn phủ kín (top/bottom + 2 hàng 1fr) · cầm dọc 1 cột 4 thẻ.
  · màn DRONE (AERO YOKE) vốn đã phủ kín mọi tỉ lệ (đo 4:3, 16:9, 844×390, 768×1024) — giữ nguyên.
  Đã đo: 1280×720 · 1024×768 · 932×430 · 844×390 · 768×1024 — không cụt, không chồng, không khoảng trống thừa.

**Bản CHỐT: 5d** (19/10 tối) — trang `mau-5d-chot-drone.html` · gói `core/rw-5d.js` (+ CSS `rw-4w.css`, `rw-4y.css` sau rw-4r.css) · lõi `core/sr3d-5d.js` · iPad `pad-5c.html` (`sr3d-padlink-5a.js` + `sr3d-padui-5c.js`) · trang `mau-5c-ban-lai-dien-thoai.html` · icon `core/rw-icons-4x.js` · đạn `core/sr3d-dammo-4w.js` · iPad `pad-4x.html` (`sr3d-padlink-4u.js` + `sr3d-padui-4x.js`) · mẫu drone `core/sr3d-drone3d-4p.js` + `drone3d/*.glb`
· iPad `pad-4l.html` (đường nối `sr3d-padlink-4l.js`, giao diện `sr3d-padui-4l.js`) · CSS (đúng thứ tự, sau rw-4j.css): `rw-4k.css · rw-4l.css · rw-4o.css · rw-4r.css`.
Thử nhanh: mở `mau-5d-chot-drone.html` (+ tab `pad-5c.html?t=2&dev=c` = iPad drone giả; `__padui.tiltDebug(ngang°, chúc°)` giả nghiêng) ⇒ ⚙ Settings ▸ Drone ▸ 1 drone ⇒ phím J L (tâm ngang) · I K (xa / gần) · 1 2 3 (đạn) · Space (bắn). Góc trên trái = bàn đo fps / lệnh vẽ.

**Đã có (thầy duyệt từng bước):**
- Bố cục A: cột drone giữa vùng đua rộng 24 % (`DRONE_W`), 2 nửa đội hẹp lại; màn kết thu cột lại; Sky view tự tắt khi có drone.
- Settings ▸ tab DRONE: Off / 1 drone / "2 drones · soon" (mờ — chừa cửa) · Neutral / Help the losing team / Team drone (+ đội) · lưới MODEL · Ammo bật / tắt. Nhớ `racingwords.drone.v1`.
- Máy quay sau drone (`dcam`, khung cong `bendTex[2]`); drone tự bay sau + trên cụm xe; người chơi lái TÂM BẮN; khoá xe < 6 m theo `canTarget` (luật chế độ).
- 5 mẫu drone thầy giữ: Mavic · Quad · Osprey · Northstar · Dvergr (Sketchfab CC BY, ghi công ở tab Drone); cánh quạt quay quanh trọng tâm + vòng mờ; bay lượn như thật (lò xo giảm chấn thiếu, roll / pitch theo gia tốc, rung gió).
- Tâm ngắm lục giác HUD (R5): ảnh canvas phát sáng, cộng sáng, y 0,3 m.
- Đạn Heart / Boost / Missile: dáng tên lửa nhỏ, phóng về trước, đuôi chỉ thấy lửa + khói, lạng lách, bám xe có giới hạn; pin + thời gian chờ; trúng xe / đường 6 kiểu; dòng DRONE ở kết trận; tiếng.
- 4t (thầy chỉnh): drone nhỏ 10 % (mẫu thật + bóng) · đạn ra từ BỤNG: thả 0,22 s dưới bụng (½ cỡ, chưa lửa, bám drone) rồi mới đánh lửa đẩy về trước; lửa + vệt chỉ bùng khi đạn > 1 m trước tâm drone ·
  Settings ▸ Drone thêm **Column width** (18 / 21 / 24 / 28 / 32 %) + **View zoom** (Close · Normal · Wide · Wider · Widest = máy quay drone ×0,8…×1,8 xa).
- ✅ 4v (thầy: "điều khiển iPad khá ổn" rồi chỉnh): NEAR = drone TIẾN lại gần cụm xe · FAR = LÙI xa (khoảng sau xe 4…45 m, mặc định 20; phím U / O) — không dời tâm nữa ·
  tâm ngắm TAY HOÀN TOÀN (bỏ khoá + bám xe; chữ "IN SIGHT · TEAM x" chỉ báo) · bắn ⇒ DẤU ĐIỂM RƠI phát sáng màu đạn trên đường (mọi máy quay thấy ⇒ xe né được), co + nháy nhanh dần ·
  Settings ▸ Drone: **Auto target** Off (mặc định) / On + thanh **Auto pull** 1–10 = điểm rơi trượt về xe gần (bán kính 4 + 1,2·k m, ≤ 0,8·k m/s, mọi loại đạn, theo luật chế độ).
  Ô lái kéo dọc trên iPad = tâm xa / gần (như chúc). Đã thử giả lập + AWord trang ẩn Đợt 552j `905acdd`.
- ✅ 4w: tâm / thẻ / vệt / dấu điểm rơi Heart HỒNG #ff63c3 · Missile ĐỎ CHÓT #ff2020 · trên đường LUÔN 1 TÂM (đạn bay ⇒ tâm ngắm ẩn; chạm xong mới hiện) và 1 quả một lúc ("WAIT · SHOT IN THE AIR") ·
  hiện / ẩn tâm + dấu = 2 lớp ảnh nét / nhoè (canvas filter blur) đan nhau + nở to khi mờ · đổi tab Settings mượt (vệt sáng trượt, nội dung trồi lên mờ + nhoè → rõ, khung cao / thấp dần) ·
  bỏ dòng ghi công mẫu 3D trên màn hình (tab Drone + .ri-cred màn chọn xe) — ghi công CC BY vẫn nằm trong code (sr3d-drone3d-4p.js, xe3d) + hồ sơ. AWord trang ẩn Đợt 552k `1294629`.
- ✅ 4x ICON 2D NEON VIỀN (thầy chọn kiểu A ở `thiet-ke-4w-icon.html`) — `core/rw-icons-4x.js`: icon(tên) / iconize("[heart]") · 8 hình missile · heart · boost · ok · bad · warn · drone · hit, không dùng id SVG.
  Đã thay: cảnh báo MISSILE trên màn lớn + iPad đội (padui-4x bắt chữ ⚠ của 4j) · bảng kết trận ✔ ✘ 🚀 · dòng DRONE · thông báo +1 tim / HIT −n boost · thẻ đạn iPad drone.
  Giữ nguyên các mũi tên chữ (◀ ▶ ▲ ▼ ✕ ↻ ⚙) vì là ký hiệu nút, không phải icon. AWord trang ẩn Đợt 552l `30bc278`.
- ✅ 4y: đạn đang bay ⇒ vẫn hiện TÂM BÓNG MỜ trắng (độ mờ 0,3, hơi nhoè) theo chỗ đang ngắm để chuẩn bị quả sau (vẫn chỉ bắn được khi quả trước chạm) ·
  BẢNG KẾT QUẢ NHIỀU HIỆP: 2 cột 2 đội, đầu cột = tổng hiệp thắng (số to), dưới = từng hiệp R1, R2… (WIN / LOSE · mét · đúng / sai · tên lửa trúng), hiệp mới nhất lên đầu + viền sáng; giữa VS;
  dòng DRONE (hiệp này) bên dưới. PLAY AGAIN giữa màn ⇒ CỘNG DỒN · START ở màn chờ / Menu ▸ START AGAIN / CHANGE CARS / Options áp ngay / dựng lại game ⇒ về 0. Bàn thử: game.series.
  AWord trang ẩn Đợt 552m `951944c`.
- ✅ 4z: đạn drone chạm ⇒ MỌI xe trong vùng nổ (ngang < 1,9 m, dọc < 3,8 m) mà chế độ cho phép đều nhận tác dụng — 2 xe gần nhau: Heart / Boost cả 2, Missile trúng cả 2 (đã thử). AWord trang ẩn Đợt 552n `817ce6a`.
- ✅ 5a BẢNG LÁI DRONE MỚI — thầy chọn mẫu A AERO YOKE (`thiet-ke-4z-ban-lai-drone.html`) + chỉnh: CHÂN đế cố định (hộp côn + ống xếp cao su đứng yên),
  cột lái từ chân đế lên trục dài / ngắn theo đẩy kéo, không lăn; chỉ VÔ LĂNG lăn ±30° + đẩy / kéo ±18° theo tay lái (nghiêng iPad hoặc kéo ngón trên vùng cần lái) ·
  hàng cuối dòng ANDREW STUDIO (chữ kim loại + quầng tím, 2 vạch + hình thoi) · thẻ đạn có VÒNG HỒI CHIÊU + "READY IN n s" / "LOW BATTERY" · FIRE mờ + lý do (SHOT IN THE AIR…).
  ✅ 5b (thầy: cột + đế xấu): BỎ cột + chân đế — vô lăng LƠ LỬNG giữa vùng lái (to hơn), coi như gắn cần có trục VUÔNG GÓC màn: sau trục chỉ thấy ĐẦU CẦN tròn (vòng kim loại + quầng tím) co / giãn theo đẩy kéo ·
  ANDREW STUDIO nhỏ + thấp hơn · NEAR / FAR chỉ còn icon 2 mũi tên neon to (lên = tiến lại gần xe, xuống = lùi), nhấn giữ ⇒ sáng + mũi tên nhích. AWord trang ẩn Đợt 552p `f48c4b3`.
  ✅ 5c (thầy: "iPad rất ok; điện thoại ngang lỗi — nút tiến to đè nút khác"): cỡ không còn theo bề ngang mà theo đơn vị --u = min(1cqw, 1,333cqh) (luôn vừa khung 4:3) ·
  2 cột bên = max(21u, 19 % bề ngang) · chữ --t = max(u, 5,4px) · .dq container-type: size. Đã đo 900×360: không phần nào chồng, không chữ bị cắt; iPad y như cũ. AWord Đợt 552q `33935ac`.
  Game gửi thêm trong tin "j:" thời gian chờ từng loại + cờ đạn đang bay (sr3d-5a + padlink-5a). Kích thước theo bề ngang màn (cqw). AWord trang ẩn Đợt 552o `db4b8b0`.
- iPad drone: vai thứ 3 (t = 2) trong đường nối; màn chọn vai 3 nút; bảng lái (thẻ đạn, ô kéo lái tâm, FIRE, NEAR / FAR, TILT); thẻ DRONE · iPAD có QR ở xưởng (không chặn START).

**Trang thử ẩn trên AWord (ĐÃ ĐẨY trước khi thầy dặn chỉ myGame — để thử 3 iPad thật):** `https://aword.andrewclasses.com/lab/racing-drone.html` (+ `lab/racing-drone-pad.html`),
kênh riêng `templates/racing-words/rw-lab-signal.js` (tài liệu rwlab_*), bản 4s (Đợt 552h `ffcdb8b`, worktree `web-wt-dot552`). Template thật không đổi. Lần sau muốn thử 3 iPad: chép bản mới vào
`templates/racing-words/3d/` + đổi `lab/racing-drone.html` (cách làm: GHI CHU DU AN của AWord Đợt 552). Chốt xong ⇒ đưa vào template thật như Đợt 551 + xoá thư mục lab/.

**Còn lại / chờ thầy:**
- ⬜ Thầy thử 3 iPad thật trên trang ẩn (chưa thử lần nào) · đo fps TOMKO bật / tắt drone (máy nhà: 433 → ~700 lệnh vẽ, 0,78 → 1,2 M tam giác).
- ✅ (5a xong) iPad drone: chưa hiện thời gian chờ từng loại đạn / thiếu pin trên thẻ (tin "j:" mới có pin); kiểm lái nghiêng trên iPad thật.
- ✅ 4u LÁI NGHIÊNG 4 HƯỚNG (thầy chốt: kiểu cần lái — nghiêng càng nhiều tâm chạy càng nhanh; tư thế vô lăng ô tô ~25° = đứng yên + tâm từ từ về giữa khung):
  xoay = trái / phải · ngả mép trên ra xa = tâm xa · kéo về = tâm gần · drone NGHIÊNG THEO tay lái (cả phím J L I K) · nút LEVEL = tư thế đang cầm thành tư thế 0 (nhớ máy `rwdrone.th0`)
  · vòng nhỏ có chấm trên iPad = hướng đang nghiêng · gần nằm phẳng ⇒ "HOLD IT UP". Đã thử giả lập; ĐÃ ĐẨY trang thử ẩn AWord (Đợt 552i `0a6df44`) — ⬜ thầy thử iPad thật
  (bấm TILT ⇒ cho phép chuyển động; dấu trục chúc tự lấy lúc bật, coi tư thế đang cầm là màn ngửa — nếu ngược chiều thì báo để sửa).
- ✅ "2 drones" — điều khiển DRONE THỨ 2 (mỗi đội 1 drone) — myGame 5e→5g, AWord Đợt 554 `12f3922`. ⬜ thầy thử 4 iPad thật.
- ✅ Đã lên template thật AWord Đợt 553 `f244280` (myGame 5d): load-files đo lại, pad.js nhận vai DRONE (?t=2, cờ aw.rwDrone), drone3d/ chép kèm. ⬜ thầy thử TOMKO + iPad thật trên game thật.

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

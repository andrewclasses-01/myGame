# myGame — kho thiết kế game thử (CLAUDE.md)

## Mục đích
Nơi dựng **bản mẫu** game (Three.js/web thuần) để Teacher Andrew thử trên máy soạn, TOMKO 86" 4K, iPad… TRƯỚC khi đưa vào app chính (AWord `E:\LAP TRINH APP\AWord\web`, myActivity…). Công khai qua GitHub Pages: https://andrewclasses-01.github.io/myGame/ (repo `andrewclasses-01/myGame`, nhánh `main`). ⛔ Không đặt dữ liệu học sinh.

## Chạy / thử
- Máy soạn: cấu hình `mygame` trong `D:\OTHERS\CLAUDE\.claude\launch.json` (python http.server 8865, thư mục repo) → `http://localhost:8865/rocket-race/…`.
- Không build: Three.js r170 lấy từ jsDelivr qua `importmap` trong từng trang mẫu.
- Bàn thử trong trang: `window.__race` (lõi game) / `window.__launch` (mẫu 4) có `step(n)` (tự lái khung hình khi khung xem trước bị ẩn) + `resume()`.

## Kiến trúc
> ⭐ **03/10/2026 — DỌN BẢN CŨ (thầy):** `maze-chase/` (STAR LOOT) chỉ còn **mẫu 2n** + đúng các file lõi nó import + 46 file tiếng trong `LIB` của `mc3d-audio-2n.js`; `balloon-pop/` (TRAIN RUSH) chỉ còn **mẫu 1ak** (Single + Fight một trang; Fight = mô-đun `core/fight-1ak.js`, Single có chỗ nối AWord `host`, AWord chép bằng `tools/chep-train-rush.py`) + file nó dùng + `assets/sound-1ah`. Trang công cụ (chọn âm thanh, chọn D-pad, nghe âm thanh) đã bỏ. Mọi bản cũ vẫn lấy lại được từ lịch sử git. Danh sách file bên dưới là LỊCH SỬ — nhiều file đã không còn. Rocket Race giữ nguyên.

```
index.html                    mục lục (mảng GAMES cuối file — game mới thêm lên ĐẦU)
rocket-race/
  index.html                  chọn mẫu (thẻ mới lên đầu lưới)
  mau-*.html                  mỗi bản mẫu một file — KHÔNG ghi đè bản cũ
  core/rr3d-core.js           lõi game Fight 3D (bản CŨ hơn AWord `templates/rocket-race/rr3d-view.js`)
  core/shell.js, page.css     vỏ trang + BẢNG THỬ
  core/launch-site.js         (26/9) cảnh bệ phóng ven biển + intro phóng — mẫu 4
  core/launch-aerial.js       (26/9) mẫu 4b: góc nhìn từ trên cao, mặt đất = ảnh địa hình sinh sẵn
  core/launch-aerial-c.js     (26/9) mẫu 4c: nhà xưởng ANDREW STUDIO tiền cảnh, bệ ở xa, sao + nhảy tốc độ
  core/launch-aerial-d.js     (26/9) mẫu 4d: bản đồ dựng lại THEO ẢNH SpaceX 39A; bố cục ở assets/4d/layout.json
  core/launch-aerial-e.js     (26/9) mẫu 4e: cây thẻ lá, máy quay luôn trôi, nhịp gọn, nối game mới nhất
  core/launch-aerial-f.js     (26/9) mẫu 4f: bãi xe + xe 3D 5 mẫu, trời/mây shader/chim
  core/launch-aerial-g.js     (26/9) mẫu 4g: huy hiệu + cụm chữ ANDREW STUDIO cân đối, chữ nền bệ ra trước
  core/launch-aerial-h.js     (26/9) mẫu 4h: logo CŨ chỉ căn cân đối (thầy bỏ huy hiệu 4g)
  core/launch-aerial-i.js     (26/9) mẫu 4i: + cfg.onTick cho tiếng; core/intro-sound.js phát tiếng intro (assets/sound-intro, tools/tao-am-thanh-intro.py)
  core/launch-aerial-5.js     (26/9) MẪU 5 game hoàn chỉnh: intro + ván đua liền mạch; core/intro-sound-5.js, assets/sound-5
  game5/                      GAME RẼ NHÁNH của mẫu 5 (sửa tay — khác aword/ là bản chép tự động)
  game5b/ + core/launch-aerial-5b.js + core/intro-sound-5b.js + assets/sound-5b   MẪU 5b (= bản đang chạy trên AWord Đợt 398)
  game5c/ + core/launch-aerial-5c.js + core/auto-res.js   MẪU 5c: tự giữ 60 khung, bóng theo nhu cầu, dịch sẵn shader
  game6/ (+ rr3d-missile.js) + core/launch-aerial-6.js     MẪU 6: TÊN LỬA tấn công giữa 2 tàu + đội 2 CAM; tiếng tools/tao-am-thanh-6.py
  game8/ (+ rr3d-launch.js, launch/, rr3d-intro-sound.js, sfx-intro/)   MẪU 8 (05/10) = chép NGUYÊN AWord 156cf57 (sau Đợt 478) — cảnh phóng + tiếng intro cũng của AWord
  game10/ + mau-10-khop-aword.html            MẪU 10 (MỚI NHẤT, 13/10) = chép NGUYÊN AWord 20110c4 (Đợt 511 — đã ghép mẫu 9) — gốc để cải tiến tiếp
  mau-9-ipad-dieu-khien.html + pad-9.html   MẪU 9 (13/10): iPAD THAM GIA GAME — dùng game9; luật tên lửa trong trang = chép AWord msLoad/msFire/msBoost/msEnd
  game9/                      = game8 + `rr3d-missile.js` thêm CHẾ ĐỘ GƯƠNG (api.mirror / mirrorTick / mirrorFlash / ui; threatFor đọc MIR) — để iPad dựng CHÍNH bảng tên lửa
                              + cột vạch năng lượng LUÔN cao 4 ô dự phòng (cả màn lớn, mọi Missiles max) + icon BOOST BỎ 3 vạch tốc độ ở đáy
                              (thầy 13/10 — 2 thay đổi này đổi CẢ game ⇒ khi ghép AWord cũng đổi)
  core/rr-padscene-9.js       bảng 3D trên iPad: createMissiles({rockets: []}).buildConsole + hậu kỳ y game (ACES, bloom 0,85, lọc NaN, vignette/hạt); chạm = raycast vùng chạm game;
                              NGANG: tên lửa trái · BOOST phải (dời bst bằng nhóm cha vì tickUI ghi bst.position.x) · DỌC: trên/dưới · khung cảnh báo đỏ kéo ra viền màn
  core/rr-padlink-9.js        nối iPad ⇄ game HAI CHIỀU (gốc SPEED RUN sr3d-padlink-2): iPad gửi "fire"/"boost"/"load"; game gửi "i:<JSON trạng thái>" + "e:<sự kiện>" + "k:" (iPad khác giành đội);
                              host ghi c0/c1 (đội đang có iPad); localSignal("rrpad9") cho 2 tab. KHÔNG QR (thầy 13/10): iPad = trang chủ AWord ▸ nút iPad ▸ chọn đội
  core/rr-padui-9.js          màn iPad: thanh trên (đội · đèn nối · đường đua mini) + bảng 3D (rr-padscene-9) + chữ "INCOMING x s / BOOST NOW!" + tiếng Web Audio · rung; mountPadChooser (busy) · mountPadHub
  pad-9.html                  GIẢ LẬP pad.html AWord: nghe tài liệu "now" {game, ctl} (= ipad_now) ⇒ màn chờ / chọn đội (nhớ sessionStorage, mỗi tab 1 iPad) / bảng tên lửa
  game7d/ + core/launch-aerial-7d.js                       MẪU 7d (28/9): trúng lan tàu cùng nấc / cách 1 nấc (hitShip), sắp thắng ⇒ lửa đuôi dài 1,5 lần + xanh dương (view r.nearWin)
  game7c/ + core/launch-aerial-7c.js                       MẪU 7c (27/9): 2 tên lửa hút nhau va nổ giữa đường (nổ sát tàu vẫn tính trúng), cột vạch mỏng trắng, renderOrder nút BOOST, vầng sáng mũi tàu khi còn 1 câu
  game7b/ + core/launch-aerial-7b.js                       MẪU 7b (27/9): 1 nút BOOST giữa cột (thanh 5 đoạn trong nút, +1 nấc thật, tự canh né 1,25 s), cột vạch năng lượng tên lửa, setFxLevel cho act voice
  game7/ + core/launch-aerial-7.js                         MẪU 7 (27/9): CHÉP NGUYÊN AWord origin/main d793bfa (Đợt 413+416) bằng maze-chase/                   (29/9) Maze Chase 3D — dựng lại Wordwall Maze chase; hồ sơ: NGHIEN CUU GAMEPLAY.md
  mau-1-cheo-tren.html · mau-2-sau-lung.html · mau-3-tu-tren-xuong.html   (view tilt / chase / top)
  core/mc3d.js                lõi CHUNG (luật chép AWord maze-chase 2D + cảnh trạm vũ trụ + HUD); mẫu chỉ khác VIEWS
  mau-1b-cheo-tren-ro.html + core/mc3d-1b.js   (29/9) MẪU 1b — thầy chọn mẫu 1; màu gọn, nhân vật chi tiết, chậm (3 ô/s), sáng hơn; __mc.cam()/where() soi gần
  mau-1c-nhieu-map.html + core/mc3d-1c.js + core/mc3d-1c.css + core/mc3d-maps.js (10 map)   (29/9) MẪU 1c; chon-dpad.html so sánh 5 D-pad
  mau-1d-san-that.html + core/mc3d-1d.js + core/mc3d-floor.js   (29/9) MẪU 1d — D-pad Ring mặc định; sàn PBR (màu/pháp tuyến/nhám/đèn) vẽ canvas mỗi câu
  mau-1e-bom-doi-nguoi.html + core/mc3d-1e.js/.css + core/mc3d-floor-1e.js + core/mc3d-boom.js   (29/9) MẪU 1e — đổi người, bom + nổ, ANDREW STUDIO, thanh nút ngoài
  mau-1f-xac-robot.html + core/mc3d-1f.js/.css + core/mc3d-floor-1f.js + core/mc3d-boom-1f.js   (29/9) MẪU 1f — D-pad Ring SVG, xác robot = bộ phận thật
  mau-1g-nut-icon.html + core/mc3d-1g.js/.css (dùng floor-1f + boom-1f)   (29/9) MẪU 1g — nút chỉ icon + nút hệ AWord, robot bớt chói
  mau-1h-bom-pha-tuong.html + core/mc3d-1h.js/.css + core/mc3d-boom-1h.js   (29/9) MẪU 1h — Tablet, ô %, bom 5 s phá tường, chào, đỏ, ô sai nổ tại chỗ
  mau-1i-nap-boong-tau-vu-tru.html + core/mc3d-1i.js/.css + mc3d-boom-1i.js + mc3d-hatch-1i.js + mc3d-ship-1i.js   (29/9) MẪU 1i — nắp boong, tàu vũ trụ
  mau-1j-dom-dom-tau-san.html + core/mc3d-1j.js/.css + mc3d-boom-1j.js + mc3d-hatch-1j.js + mc3d-ship-1j.js   (29/9) MẪU 1j — đom đóm, hầm máy, tàu săn
  mau-1k-dem-5s-hud.html + core/mc3d-1k.js/.css + mc3d-ship-1k.js (boom/hatch 1j)   (29/9) MẪU 1k — đếm 5 s kiểu HUD, lửa nhấp nhô, xác tàu con, HUD nổi
  mau-1l-hud-duoi-ruot-duoi.html + core/mc3d-1l.js/.css + mc3d-ship-1l.js + mc3d-boom-1l.js (hatch 1j)   (29/9) MẪU 1l — HUD mép dưới, kết thúc vũ trụ, rượt đuổi, xác rơi
  mau-1m-thanh-tien-do.html + core/mc3d-1m.js/.css + mc3d-ship-1m.js + mc3d-boom-1m.js (hatch 1j)   (29/9) MẪU 1m — đếm 3-2-1, END GAME, thanh tiến độ, Show answers to
  mau-1n-sung-hong-tuong-ban.html + core/mc3d-1n.js/.css + mc3d-ship-1n.js (boom 1m, hatch 1j)   (29/9) MẪU 1n — vòng đếm bung, súng hông, tường bụi bẩn
  mau-1o-a|b|c-intro-*.html + core/mc3d-1o.js/.css + mc3d-intro-1o.js + mc3d-sound-1o.js + mc3d-ship-1o.js   (29/9) MẪU 1o — 3 bản INTRO điện ảnh (A hạm đội · B thả robot · C báo động)
  mau-1p-star-loot-intro.html + core/mc3d-1p.js/.css + mc3d-intro-1p.js + mc3d-sound-1p.js + mc3d-ship-1p.js   (29/9) MẪU 1p — STAR LOOT: tên mới + intro cốt truyện hạm đội (?robots=2 = Fight)
  mau-1q-star-loot-lo-giun.html + core/mc3d-1q.js/.css + mc3d-intro-1q.js (sound/ship 1p)   (29/9) MẪU 1q — START tối giản, cảnh báo ENEMY LOCATED, 3 lỗ giun, ba lô ANDREW TEAM (tham số act)
  mau-1r-star-loot-chui-gam.html + core/mc3d-1r.js/.css + mc3d-intro-1r.js (sound/ship 1p)   (29/9) MẪU 1r — tàu bay vào màn chờ, lỗ giun mượt, robot chui vào gầm, sàn dày x3, câu hỏi hiện lúc lùi máy quay
  mau-1s-star-loot-o-xuat-phat.html + core/mc3d-1s.js/.css + mc3d-intro-1s.js + mc3d-ship-1s.js + mc3d-hatch-1s.js (sound 1p)   (29/9) MẪU 1s — ô xuất phát cố định, NOT FOUND, bom chạm mới nổ, tường trung tính
  mau-1t-star-loot-lua-bung.html + core/mc3d-1t.js/.css + mc3d-intro-1t.js + mc3d-maps-1t.js (ship/hatch 1s, sound 1p)   (29/9) MẪU 1t — lửa bùng khi tăng tốc, chân không lún, tên thiên hà, map gọn
  core/mc3d-sound.js          tiếng tự tổng hợp Web Audio · core/questions-sample.js bộ câu mẫu
  Bàn thử: window.__mc — start() · step(n) · resume() · press(dir) · autoplay · state() · snap() · opt. Xem local: launch `mygame-maze` cổng 8866
tools/chep-aword-sang-game.py — gốc để cải tiến tiếp
  game6d/ + core/launch-aerial-6d.js                       MẪU 6d (= AWord Đợt 409): nạp tay, quả to lùi khỏi màn, chuông báo động (tools/tao-am-thanh-6d.py), vết cháy, MISS WAIT 3D (rr3d-misswait.js)
  game6c/ + core/launch-aerial-6c.js                       MẪU 6c (= AWord Đợt 407): như 6b, bỏ khung ô tên lửa + BOOST, sai-bị-lùi đúng lúc cũng né
  game6b/ + core/launch-aerial-6b.js                       MẪU 6b: tay robot + cửa theo vỏ, góc rộng khi bắn, vòng lên lao xuống, ô không chữ, BOOST thanh cyan
  aword/                      BẢN CHÉP game mới nhất từ AWord (tools/chep-game-aword.py) — đừng sửa tay
  assets/                     ảnh địa hình mới nhất (tools/tao-dia-hinh.py sinh ra); assets/4b/ = bộ cũ của mẫu 4b
speed-run/                    (11/10) SPEED RUN — đua ô tô 2 đội; hồ sơ + quyết định đã chốt + mẫu 1: NGHIEN CUU GAMEPLAY.md (mục 7, 9)
  mau-1a-cao-vua.html · mau-1b-truc-thang.html   MẪU 1: đường + 2 xe + camera theo khoảng cách (A cao vừa / B + trực thăng); vỏ thử core/page-1.js
  core/sr3d-1.js               lõi khuôn B: createSpeedRun({mount, view, questions, title, options, onEvent}) — luật C lai (đoạn 80 m), vật lý, camera, HUD DOM; bàn thử window.__sr
  core/sr3d-world-1.js         trời/đất/biển/đường 4 làn (mỗi đội 2)/cột đèn/cây/vạch đoạn/cổng đích + CONG THẾ GIỚI (makeBend) + groundH JS khớp GPU (Math.fround)
  core/sr3d-car-1.js           xe từ 5 dáng bãi xe Rocket Race (lambo/porsche/ferrari/suv/sedan), màu đội, đèn hậu dải, cánh gió, lửa pô
  mau-2-buong-lai.html + pad-2.html?t=0|1   (11/10) MẪU 2 "BUỒNG LÁI": chia đôi màn, góc nhìn TRONG XE, tap-lô DOM (đáp án + vô lăng có màn), lái iPad kiểu Asphalt, tên lửa né được (hồ sơ mục 10)
  core/sr3d-2.js               lõi mẫu 2: createSpeedRun({mount, questions, title, options, remote, onEvent}) — 2 máy quay vẽ vào 2 nửa CÙNG render target (SplitPass) rồi bloom 1 lần; bàn thử window.__sr
  core/sr3d-missile-2.js       tên lửa (Bézier tới điểm rơi dự đoán, khoá 1,1 s, cột sáng đỏ + vòng ngắm) + makeParticles (khói/lửa/tia lửa có cong)
  core/sr3d-padlink-2.js       nối iPad = STAR LOOT 2q + giao thức lái liên tục "s:lái,boost,brake" / "fire" / game→iPad "i:…" · core/sr3d-padui-2.js giao diện tay lái
balloon-pop/                  (29/9) Balloon Pop 3D — dựng lại Wordwall Balloon pop; hồ sơ luật chơi: NGHIEN CUU GAMEPLAY.md
  index.html                  chọn mẫu · mau-1-nhin-ngang.html (view "side") · mau-2-cheo-tren.html (view "top")
  core/bp3d.js                lõi CHUNG: cảnh sa mạc, tàu, khinh khí cầu, luật, HUD; mẫu chỉ khác `view` (VIEWS đầu file)
  core/bp3d-sound.js          tiếng tự tổng hợp Web Audio (KHÔNG chép mp3 Wordwall vào kho công khai)
  core/sound-1ah.js           (30/9) TIẾNG THU THẬT từ mẫu 1ah: Freesound CC0 + nhạc Pixabay (Sonican); assets/sound-1ah + NGUON.md; tools/tao-am-thanh-1ah.py; nghe thử: nghe-am-thanh-1ah.html
  core/words-lsa2-s4-t4.js    55 cặp từ mẫu (act AWord dg9hyp)
  mau-1b-dien-anh.html + core/bp3d-1b.js + core/west-world.js   (29/9) MẪU 1b điện ảnh — thầy CHỌN góc nhìn ngang; tàu TS=0.74, khinh khí cầu BS=0.84,
                              cảnh viễn tây sinh bằng code (trời shader, núi bậc thềm, cột đá), hậu kỳ EffectComposer (MSAA 4 + bloom + GRADE_SHADER)
  mau-1c-lia-theo-tau.html + core/bp3d-1c.js + core/west-world-1c.js   (29/9) MẪU 1c: thế giới VÔ TẬN theo máy quay (S.camX) — mặt đất + dãy núi
                              tính độ cao TRONG SHADER theo toạ độ thế giới (lưới chỉ bám máy quay), tiền cảnh chia khúc 48 đv (ray, cỏ thẻ chéo, bụi, xương rồng)
                              dời lên trước khi rơi sau; máy quay lia khi mũi đầu máy chạm 75% màn (updateCamera); thùng có vật lý (updateCrates)
  Bàn thử: window.__bp — start() · step(n) · resume() · testDrop(từ, toa) · popWord(từ) · opt · S
tools/chep-aword-sang-game.py chép nguyên bộ game Rocket Race 3D từ AWord origin/main ra thư mục game MỚI (python -X utf8 tools/chep-aword-sang-game.py game8)
tools/tao-dia-hinh.py         sinh ảnh địa hình (numpy + pillow + scipy), ~5 phút
tools/tao-dia-hinh-4d.py      sinh địa hình mẫu 4d từ assets/4d/layout.json (python -X utf8), ~6 phút
```
- `rr3d-core.js`: `export makeRocket` (mẫu 4 dùng chung mô hình tàu) · `cfg.hold` + `beginPlay()` = màn game đứng chờ ở góc đuổi, không mở màn, gọi `beginPlay()` là vào thẳng câu hỏi.
- `launch-site.js`: trời hoàng hôn TỰ VẼ (shader; `Sky` của three.js cháy trắng quanh mặt trời thấp), biển `Water` (normal map tự sinh), đảo = PlaneGeometry dìm dưới nước ngoài đường bờ, khung thép = `InstancedMesh` hộp đơn vị (`Struts`), hạt riêng (xoay góc, `rise`), sương khí quyển theo độ cao + cầu "không gian" đục dần.

## ⭐ ĐỒNG BỘ VỚI AWORD (thầy 05/10/2026: "myGame cũng phải có các bản mới nhất đồng bộ với AWord")
- STAR LOOT mới nhất = **mẫu 2r** (11/10/2026, = AWord Đợt 503): 2q + Options Enemies 0–10 (`opt.enemies`; difficulty chỉ còn tốc độ; thiếu khoá ⇒ `enemiesFor(difficulty)`),
  Lives nấc 10 = ∞, Bomb timer `opt.fuse` 1–10 s. `core/mc3d-2r.js/.css`, trang `mau-2r-star-loot-enemy-fuse.html`. Phần iPad vẫn là các file 2q dưới đây.
- STAR LOOT **mẫu 2q** (05/10/2026, = AWord Đợt 480b, thầy thử iPad thật OK): `core/mc3d-2q.js/.css` + iPad làm D-pad = `core/mc3d-padlink-2q.js` (WebRTC, cả phía máy chiếu
  `createPadHost` lẫn phía iPad `createPadClient`, + `localSignal` cho bàn thử 2 tab) · `core/mc3d-padui-2q.js` (giao diện D-pad iPad) ·
  `core/mc3d-qr.js` (chép NGUYÊN `AWord/web/core/qr.js`). Trang: `mau-2q-star-loot-ipad.html` + `pad-2q.html?t=0|1`. Lõi KHÔNG biết mạng:
  chỉ nhận `remote` { attach({press,status}), detach, panel, panelClosed }. Kênh bắt tay thật (Firestore) nằm ở AWord `templates/maze-chase/sl-pad-signal.js`.
- TRAIN RUSH mới nhất = **mẫu 1aq** (14/10/2026: 1ap + chỉnh cỡ Fight — tàu to, khinh khí cầu nhỏ, máy bay thấp, tiền cảnh; hồ sơ mục 41; bản phác iPad `thiet-ke-ipad-1aq.html` chờ thầy chọn kiểu). Trước đó **mẫu 1ap** (= AWord Đợt 515): FIGHT MỘT MÀN 2 tàu song song + iPad + Options LEVELS/TIME ROUND
  (hồ sơ `balloon-pop/NGHIEN CUU GAMEPLAY.md` mục 40; trang `mau-1ap-train-rush.html`, iPad `pad-1ap.html?t=0|1`). Ghép AWord: chép 1ap + iPad như Rocket Race.
- TRAIN RUSH (`balloon-pop/`) + STAR LOOT (`maze-chase/`): GỐC ở myGame. Sửa ở đây (bản mới = tên mới) ⇒ commit + push ⇒ AWord chạy
  `python -X utf8 tools/chep-train-rush.py` / `tools/chep-star-loot.py` (ghi `3d/NGUON.json` = commit myGame). Kiểm khớp: chạy lại script chép, AWord không đổi gì = khớp.
- ROCKET RACE: GỐC ở AWord (`templates/rocket-race/`). MỖI Đợt Rocket Race trên AWord ⇒ ở myGame chạy
  `python -X utf8 tools/chep-aword-sang-game.py gameN` (thư mục MỚI) + trang `mau-N-…html` (chép trang mẫu gần nhất, đổi import sang gameN) ⇒ commit + push.
  Bản mới nhất: `game10` = AWord `20110c4` (Đợt 511 — iPad Game controller). (game8 = `156cf57` Đợt 478.)
  ⚠️ 4 file iPad của AWord (`templates/rocket-race/rr-padlink.js` / `rr-padui.js` / `rr-padscene.js` = CHÉP `rocket-race/core/*-9.js` của kho này, chỉ đổi import;
  `rr-pad-signal.js` là của AWord) — tool chép KHÔNG lấy chúng ⇒ sửa ở `core/*-9.js` (hoặc bản mới `-10`), rồi chép tay sang AWord.
  ⚠️ NGOẠI LỆ mẫu 9 (iPad tham gia game): tính năng mới làm ở myGame TRƯỚC (thầy chọn) ⇒ thầy OK ⇒ ghép AWord (xem GHI CHU chặng "Rocket Race mẫu 9").

## Khám phá kỹ thuật
- CONG THẾ GIỚI (SPEED RUN): đường logic thẳng trục z, hình cong nhờ vertex `x += bx·dz²` — phải TẮT DẦN khi 2 xe xa (dz lớn ⇒ xe dẫn dời ngang hàng chục mét, máy quay nhìn hụt); mọi vật đặt trên đất tính độ cao bằng CÙNG hàm nhiễu ở JS với `Math.fround` từng phép để khớp float32 GPU.
- MÀN 3D ĐEN HẲN sau vài giây (SPEED RUN mẫu 2) = một đỉnh NaN (vd. `Math.pow(số âm cực nhỏ, 1.4)`) ⇒ bloom loang NaN ra CẢ khung. Truy: tắt bloom, đọc render target half-float bằng
  `readRenderTargetPixels` (Uint16Array, NaN/Inf = `(v & 0x7c00) === 0x7c00`) rồi ẩn dần từng vật. ⚠️ Sau `composer.render()` OutputPass đã ĐỔI bộ đệm ⇒ đọc `writeBuffer`.
- CHIA ĐÔI MÀN bằng scissor trên render target MSAA: three.js giải MSAA (blit) ở cuối mỗi `render()` và phép blit BỊ scissor cắt ⇒ phần ngoài scissor không bao giờ được giải ⇒
  vẽ thêm 1 cảnh RỖNG (autoClear=false, scissor tắt) để giải trọn khung. Dịch ống kính bằng `camera.setViewOffset` (không chúi máy) để đặt chân trời theo ý mà cột đèn vẫn thẳng.
- Vật PHẲNG trên mặt đường nhìn từ mắt người lái (1,1 m) gần như vô hình ở 30 m (3–4 px) ⇒ báo hiệu trên đường phải có vật ĐỨNG (cột sáng). Cộng sáng trên trời hoàng hôn bị nhoà ⇒ trộn thường.
- Trình duyệt giữ mô-đun ES cũ sau khi sửa file (python http.server) ⇒ `await fetch(url, {cache:'reload'})` từng file rồi `location.reload()`.
- Bàn thử trong Browser pane bị ẨN: `requestAnimationFrame` đứng hẳn (0 khung/giây, `visibilityState` hidden) ⇒ ô tên lửa kẹt "shuttle" mãi. Lái bằng `__view.step(n)`
  NHƯNG luật trong trang hẹn giờ bằng `setTimeout` thời gian THẬT (câu mới sau 1,5 s) ⇒ vòng thử phải vừa `step` vừa chờ giờ thật, đừng `step` dồn trong 80 ms.
- Trang mẫu là `<script type="module">` trên CÙNG một scope: đặt tên biến mới trùng hàm có sẵn (vd `pop` của đếm 3-2-1) ⇒ SyntaxError giết CẢ trang (màn đen, không bàn thử).
- iPAD ĐIỀU KHIỂN GAME (STAR LOOT 2q): phím đi WebRTC DataChannel thẳng iPad → máy chiếu; kho chung chỉ để bắt tay. ⛔ Kho bắt tay CÓ THỂ RƠI
  một lần báo (bàn thử: game đang nạp ⇒ lỡ lời chào ⇒ iPad kẹt "Connecting…" mãi) ⇒ bên chờ phải tự ghi lại định kỳ (`nudge` 4 s, tối đa 8 lần).
  Đường dự phòng qua kho: kho gộp nhiều lượt ghi sát nhau thành MỘT lần báo ⇒ phải gửi kèm ĐUÔI phím (`rq` 4 phím gần nhất + số đếm `rs`), không chỉ phím cuối.
  Không so đồng hồ 2 máy — chỉ so sid/nonce/số đếm.
- HIỆU NĂNG (Train Rush 1am, 05/10/2026): trên card yếu + màn 4K, MSAA 4 của render target HalfFloat là phần đắt nhất (đắt hơn bloom, bóng đổ) ⇒ cho tự bỏ MSAA trước khi hạ độ nét (`auto-res-1am.js`). Luôn đọc trần `window.__awMaxPR` (myActivity). Dịch sẵn shader: `compileAsync` khi đích vẽ = render target của composer, và GIỮ bộ mẫu (không thả) để shader không bị xoá khi huỷ vật cũ.
- NHẤP NHÁY: `EffectComposer` mặc định vẽ vào render target KHÔNG MSAA ⇒ vật mảnh lấp loá khi máy quay trôi — luôn truyền render target `samples: 4`.
- Ghi chú giữa dòng JS nhiều lệnh phải dùng `/* */`, không `//`.
- Mặt đất như thật = ảnh "vệ tinh" SINH SẴN bằng Python theo toạ độ thế giới (2 tấm: toàn cảnh + khu phóng chi tiết cao, khớp liền) rồi dựng 3D lên trên — hơn hẳn vẽ bằng shader lúc chạy.
- Hạt mây trong suốt phải vẽ SAU mọi mặt phẳng trong suốt khác (renderOrder) và sắp XA→GẦN (chỉ số `Points`), không thì bị đè / chồng sai.
- `Sky` (three/addons) ở độ cao mặt trời ~3° + ACES ⇒ một mảng trắng cháy tròn lớn — tự viết shader gradient dễ điều khiển hơn.
- Máy quay đuổi tàu đang tăng tốc (~95 đv/s): làm mượt kiểu `lerp(dt*4)` tụt lại hàng chục đơn vị ⇒ bám CỨNG khi đã vào pha đuổi.
- Nhìn mặt biển từ trên cao lộ vân lặp của normal map ⇒ sương dày dần theo độ cao; tàu đặt `material.fog = false` để không chìm sương.
- Hạt vệt khói phát theo khung hình ⇒ thành từng cục khi tàu nhanh ⇒ rải đều theo QUÃNG ĐƯỜNG (nội suy vị trí loa phụt giữa 2 khung).

## Roadmap
- ✅ ROCKET RACE iPad tham gia game (13/10/2026): mẫu 9 ⇒ ĐÃ GHÉP AWord Đợt 511 `20110c4` (myGame game10 / mẫu 10). ⬜ thầy thử 2 iPad thật. Kế hoạch ghép (đã làm): nút iPad thành bảng
  chọn Off / Question screen / Game controller (`fightScreen` hiện là true/false) · kênh bắt tay Firestore (khuôn `sl-pad-signal.js`, tài liệu riêng rrpad_*, cùng tài khoản thầy
  — KHÔNG QR) · AWord `rr3d-missile.js` nhận chế độ gương của game9 (thêm, không đổi gì cho game) + vendor three/addons cho trang iPad · claim `ipad_now` thêm `ctl` ⇒ `pad.html` rẽ "rocketrace + ctl" ⇒ đội đã nhớ (`aw.ipadTeam`) ⇒ màn tên lửa · luật trong `rocket-race.js` (ms*) gọi padEvent/padState.
- ⬜ SPEED RUN (11/10/2026): thầy chốt hết đề xuất; ✅ mẫu 1 (đường + 2 xe + camera theo gap, 2 góc, đã push) ⇒ thầy đổi hướng ⇒ ✅ mẫu 2 "buồng lái" (chia đôi màn, trong xe, iPad lái kiểu Asphalt, tên lửa né được; đã push) ⇒ ⬜ thầy thử ⇒ tiếng · vật phẩm/chướng ngại · intro bãi xe ⇒ ghép AWord khuôn STAR LOOT (+ bắt tay Firestore cho iPad thật).
- ⏸ Intro "phóng từ mặt đất" TẠM CHỐT ở **mẫu 4c** (26/9/2026); **mẫu 4d** (cùng ngày) = bản đồ dựng lại theo ảnh, chờ thầy xem. Ghép vào AWord theo kế hoạch 7 bước ở `GHI CHU DU AN.md` Chặng 4 (tàu dùng `makeRocket` của AWord, vendor three, nhịp 3-2-1 do template giữ, âm thanh, TOMKO).

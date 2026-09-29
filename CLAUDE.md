# myGame — kho thiết kế game thử (CLAUDE.md)

## Mục đích
Nơi dựng **bản mẫu** game (Three.js/web thuần) để Teacher Andrew thử trên máy soạn, TOMKO 86" 4K, iPad… TRƯỚC khi đưa vào app chính (AWord `E:\LAP TRINH APP\AWord\web`, myActivity…). Công khai qua GitHub Pages: https://andrewclasses-01.github.io/myGame/ (repo `andrewclasses-01/myGame`, nhánh `main`). ⛔ Không đặt dữ liệu học sinh.

## Chạy / thử
- Máy soạn: cấu hình `mygame` trong `D:\OTHERS\CLAUDE\.claude\launch.json` (python http.server 8865, thư mục repo) → `http://localhost:8865/rocket-race/…`.
- Không build: Three.js r170 lấy từ jsDelivr qua `importmap` trong từng trang mẫu.
- Bàn thử trong trang: `window.__race` (lõi game) / `window.__launch` (mẫu 4) có `step(n)` (tự lái khung hình khi khung xem trước bị ẩn) + `resume()`.

## Kiến trúc
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
  game7d/ + core/launch-aerial-7d.js                       MẪU 7d (mới nhất, 28/9): trúng lan tàu cùng nấc / cách 1 nấc (hitShip), sắp thắng ⇒ lửa đuôi dài 1,5 lần + xanh dương (view r.nearWin)
  game7c/ + core/launch-aerial-7c.js                       MẪU 7c (27/9): 2 tên lửa hút nhau va nổ giữa đường (nổ sát tàu vẫn tính trúng), cột vạch mỏng trắng, renderOrder nút BOOST, vầng sáng mũi tàu khi còn 1 câu
  game7b/ + core/launch-aerial-7b.js                       MẪU 7b (27/9): 1 nút BOOST giữa cột (thanh 5 đoạn trong nút, +1 nấc thật, tự canh né 1,25 s), cột vạch năng lượng tên lửa, setFxLevel cho act voice
  game7/ + core/launch-aerial-7.js                         MẪU 7 (27/9): CHÉP NGUYÊN AWord origin/main d793bfa (Đợt 413+416) bằng maze-chase/                   (29/9) Maze Chase 3D — dựng lại Wordwall Maze chase; hồ sơ: NGHIEN CUU GAMEPLAY.md
  mau-1-cheo-tren.html · mau-2-sau-lung.html · mau-3-tu-tren-xuong.html   (view tilt / chase / top)
  core/mc3d.js                lõi CHUNG (luật chép AWord maze-chase 2D + cảnh trạm vũ trụ + HUD); mẫu chỉ khác VIEWS
  core/mc3d-sound.js          tiếng tự tổng hợp Web Audio · core/questions-sample.js bộ câu mẫu
  Bàn thử: window.__mc — start() · step(n) · resume() · press(dir) · autoplay · state() · snap() · opt. Xem local: launch `mygame-maze` cổng 8866
tools/chep-aword-sang-game.py — gốc để cải tiến tiếp
  game6d/ + core/launch-aerial-6d.js                       MẪU 6d (= AWord Đợt 409): nạp tay, quả to lùi khỏi màn, chuông báo động (tools/tao-am-thanh-6d.py), vết cháy, MISS WAIT 3D (rr3d-misswait.js)
  game6c/ + core/launch-aerial-6c.js                       MẪU 6c (= AWord Đợt 407): như 6b, bỏ khung ô tên lửa + BOOST, sai-bị-lùi đúng lúc cũng né
  game6b/ + core/launch-aerial-6b.js                       MẪU 6b: tay robot + cửa theo vỏ, góc rộng khi bắn, vòng lên lao xuống, ô không chữ, BOOST thanh cyan
  aword/                      BẢN CHÉP game mới nhất từ AWord (tools/chep-game-aword.py) — đừng sửa tay
  assets/                     ảnh địa hình mới nhất (tools/tao-dia-hinh.py sinh ra); assets/4b/ = bộ cũ của mẫu 4b
balloon-pop/                  (29/9) Balloon Pop 3D — dựng lại Wordwall Balloon pop; hồ sơ luật chơi: NGHIEN CUU GAMEPLAY.md
  index.html                  chọn mẫu · mau-1-nhin-ngang.html (view "side") · mau-2-cheo-tren.html (view "top")
  core/bp3d.js                lõi CHUNG: cảnh sa mạc, tàu, khinh khí cầu, luật, HUD; mẫu chỉ khác `view` (VIEWS đầu file)
  core/bp3d-sound.js          tiếng tự tổng hợp Web Audio (KHÔNG chép mp3 Wordwall vào kho công khai)
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

## Khám phá kỹ thuật
- NHẤP NHÁY: `EffectComposer` mặc định vẽ vào render target KHÔNG MSAA ⇒ vật mảnh lấp loá khi máy quay trôi — luôn truyền render target `samples: 4`.
- Ghi chú giữa dòng JS nhiều lệnh phải dùng `/* */`, không `//`.
- Mặt đất như thật = ảnh "vệ tinh" SINH SẴN bằng Python theo toạ độ thế giới (2 tấm: toàn cảnh + khu phóng chi tiết cao, khớp liền) rồi dựng 3D lên trên — hơn hẳn vẽ bằng shader lúc chạy.
- Hạt mây trong suốt phải vẽ SAU mọi mặt phẳng trong suốt khác (renderOrder) và sắp XA→GẦN (chỉ số `Points`), không thì bị đè / chồng sai.
- `Sky` (three/addons) ở độ cao mặt trời ~3° + ACES ⇒ một mảng trắng cháy tròn lớn — tự viết shader gradient dễ điều khiển hơn.
- Máy quay đuổi tàu đang tăng tốc (~95 đv/s): làm mượt kiểu `lerp(dt*4)` tụt lại hàng chục đơn vị ⇒ bám CỨNG khi đã vào pha đuổi.
- Nhìn mặt biển từ trên cao lộ vân lặp của normal map ⇒ sương dày dần theo độ cao; tàu đặt `material.fog = false` để không chìm sương.
- Hạt vệt khói phát theo khung hình ⇒ thành từng cục khi tàu nhanh ⇒ rải đều theo QUÃNG ĐƯỜNG (nội suy vị trí loa phụt giữa 2 khung).

## Roadmap
- ⏸ Intro "phóng từ mặt đất" TẠM CHỐT ở **mẫu 4c** (26/9/2026); **mẫu 4d** (cùng ngày) = bản đồ dựng lại theo ảnh, chờ thầy xem. Ghép vào AWord theo kế hoạch 7 bước ở `GHI CHU DU AN.md` Chặng 4 (tàu dùng `makeRocket` của AWord, vendor three, nhịp 3-2-1 do template giữ, âm thanh, TOMKO).

# MAZE CHASE 3D — hồ sơ nghiên cứu gameplay (29/9/2026)

Game 3D thứ 3 của kho myGame (sau Rocket Race, Balloon Pop). Dựng lại Wordwall Maze chase bằng Three.js,
thử ở myGame trước, thầy OK rồi mới ghép vào AWord (`templates/maze-chase`) theo đúng đường Rocket Race
(luật chơi giữ ở template, cảnh 3D chỉ là VIEW vẽ lại).

## 1. Wordwall gốc — act của thầy
https://wordwall.net/resource/116866716/maze-chase (style **Space**; thầy đã chốt Space = "Classic" của Maze chase).

Quan sát khi chơi thử 29/9:
- Mở màn: đường hầm vàng → câu hỏi hiện TO giữa màn (lớp tối phủ mê cung) → thu về BĂNG CHỮ ở đáy.
- Đếm "3…" ở giữa trên: lúc này máy quay thấy TOÀN BỘ mê cung (4 bệ đáp án PULL/STRANGE/MATTER/BREAK,
  người chơi ở giữa có mũi tên 4 hướng gợi ý, 2 robot địch đỏ).
- Vào chơi: máy quay **PHÓNG TO + BÁM THEO người chơi** (không còn thấy hết mê cung).
- HUD: đồng hồ đếm lên (trái trên), 5 tim + ✓ số câu đúng (phải trên), ☰ menu, 🔊, toàn màn.
- Địch chạm ⇒ mất 1 tim, về điểm xuất phát giữa mê cung. Hết tim ⇒ panel GAME OVER (Score · Time ·
  Leaderboard · Start again · Play a different template) trên nền đường hầm.
- Lưu ý: điều khiển là GIỮ phím (lái bằng ảnh chụp trễ vài giây nên Claude thua 0 điểm/48 s — luật đã
  rõ nhờ hồ sơ bản AWord 2D).

## 2. Bản AWord 2D đang LIVE (`AWord/web/templates/maze-chase`, 738 dòng)
Luật chi tiết ở `GHI CHU MAZE-CHASE.md`. Tóm tắt: Quiz model · bệ đúng +1 điểm & sang câu · bệ sai ✗ mất tim +
bệ bị loại · địch chạm mất tim, văng về xuất phát, ân hạn 1,9 s · mê cung DFS+braid sinh mỗi câu (có vòng) ·
địch BFS đuổi + 22% ngẫu nhiên · Options: Timer/Shuffle/Show answers + Lives + Difficulty 1–10 (số địch ≤3→1,
≤6→2, ≤8→3, còn lại 4; tốc độ `max(230, 400−diff*14)` ms/ô; người 160 ms/ô) + Points off. Chưa có Fight.

## 3. Thầy chốt (29/9, AskUserQuestion)
- **Góc máy**: làm TẤT CẢ các mẫu để thầy chọn —
  (a) chéo từ trên cao · (b) bám sau lưng nhân vật · (c) thẳng từ trên xuống (gần Wordwall, có khối/đèn/bóng).
- **Phong cách**: TRẠM VŨ TRỤ (giữ tinh thần Space + cùng vũ trụ điện ảnh với Rocket Race).
- **Chế độ**: 1 người chơi trước; Fight 2 đội bàn sau.
- **Điều khiển**:
  - Chơi đơn: chạm HOẶC vuốt vào PHÍA của nhân vật (chạm bên trái nhân vật ⇒ đi trái…) + **D-pad 4 hướng sát mép
    màn** (HS đứng bấm không che giữa màn). Phím mũi tên/WASD vẫn có cho máy soạn.
  - Fight: KHÔNG chạm/vuốt, CHỈ D-pad (tránh 2 bên vuốt đè nhau).

## 4. Kế hoạch bản mẫu (chờ "ok build")
- Thư mục `myGame/maze-chase/`: `index.html` chọn mẫu · `mau-1-cheo-tren.html` · `mau-2-sau-lung.html` ·
  `mau-3-tu-tren-xuong.html` · lõi chung `core/mc3d.js` (mẫu chỉ khác `view`) · tiếng tự tổng hợp Web Audio
  (KHÔNG chép mp3 Wordwall vào kho công khai) · bàn thử `window.__mc` (step/resume/auto-play).
- Luật chép từ bản 2D (để ghép AWord sau không lệch). Bộ câu mẫu = sample-maze-chase.js.
- Chạy LOCAL (launch `mygame` cổng 8865) — push lên Pages công khai chỉ khi thầy cho.

## 5. ✅ Đã dựng 3 mẫu (29/9, thầy "ok build") — CHỈ LOCAL
- `mau-1-cheo-tren.html` (view `tilt`) · `mau-2-sau-lung.html` (view `chase`, có bản đồ nhỏ góc phải; lúc hiện câu +
  3-2-1 máy quay ở toàn cảnh, vào chơi thì bay xuống sau lưng và xoay theo hướng đi) · `mau-3-tu-tren-xuong.html` (view `top`).
- Lõi `core/mc3d.js` (luật + cảnh + HUD, mẫu chỉ khác `VIEWS`), `core/mc3d.css`, `core/mc3d-sound.js` (Web Audio tự tổng hợp),
  `core/questions-sample.js` (8 câu mẫu AWord + câu "Break" của act Wordwall).
- Cảnh: trạm vũ trụ nổi giữa trời tinh vân (shader), hành tinh sọc tím có quầng, mặt trăng có vành, cánh pin mặt trời 2 bên,
  4 cột đèn đỏ nhấp nháy; sàn tấm kim loại có viền sáng; tường kim loại mép cam (như Wordwall), cột nối đầu xanh.
  Tường MỌC LÊN từ chỗ người chơi mỗi câu, câu đúng thì SỤP xuống rồi dựng mê cung mới. Bệ đáp án = đế tròn + cột sáng + bảng chữ nổi.
  Phi hành gia + robot địch (đỏ/xanh) dựng bằng khối. Hậu kỳ: MSAA 4 + gột NaN + bloom + chỉnh màu/vignette.
- Nhịp 1 câu (như Wordwall): câu hỏi TO giữa màn → thu về dải trên → tường mọc + bệ bật lên + phi hành gia dịch chuyển xuống
  + địch xuất hiện ở 4 góc → 3-2-1-GO (câu đầu; câu sau chỉ GO) → chơi. Người đứng yên tới lệnh đầu tiên.
- Luật: chép bản 2D; 2 chỗ khác có chủ ý: (1) người 5 ô/giây (2D 6,25), địch giữ đúng tỉ lệ; (2) bệ không đặt trong vòng 2 ô
  quanh góc địch xuất phát (đo: bệ đúng cạnh góc địch ⇒ bị "canh" mãi vì địch về góc sau mỗi lần bắt).
- Điều khiển: mọi lệnh là hướng TRÊN MÀN; đổi sang hướng mê cung bằng cách chiếu 4 hướng quanh nhân vật lên màn (`screenToGrid`)
  ⇒ đúng cho cả máy quay xoay. Quay đầu giữa hành lang đổi ngay; rẽ thì nhớ lệnh tới ngã rẽ gần nhất (kiểu Pac-Man).
  Options trong màn START: Lives 1–10 · Difficulty 1–10 · D-pad Right/Left/Both/Off · Shuffle.
- Bàn thử `window.__mc`: `start()` · `step(n)` (lái tay khi khung bị ẩn) · `resume()` · `press('u'|'d'|'l'|'r')` (hướng màn) ·
  `autoplay = true` (tự đi tới bệ đúng, không né địch) · `state()` · `snap()` · `opt`.
- Đã tự kiểm (bàn thử, launch `mygame-maze` cổng 8866, 0 lỗi console): cả 3 mẫu vào chơi · chạm phía trên nhân vật ⇒ đi lên,
  vuốt trái ⇒ rẽ trái · tự chơi 9/9 câu ⇒ GAME COMPLETE + Show answers · Difficulty 10 + 2 tim ⇒ GAME OVER · Menu tạm dừng
  đồng hồ đứng, Resume chạy tiếp · chạy thời gian thật.
- ⬜ Thầy thử trên TOMKO (cảm ứng, cỡ chữ, tốc độ, âm thanh — Claude không nghe được) rồi chọn góc máy.
- ⬜ Chưa làm: Fight 2 đội (chỉ D-pad) · Timer đếm ngược · Points off · giọng đọc câu hỏi · nhạc nền.

## 6. Thầy CHỌN MẪU 1 (chéo từ trên cao) → MẪU 1b (29/9)
Thầy: "màu sắc lẫn lộn, khó nhìn · robot và kẻ địch hơi xấu, cần chi tiết hơn · tốc độ quá nhanh, giảm khá nhiều · tổng thể hơi tối".
- `mau-1b-cheo-tren-ro.html` + lõi RIÊNG `core/mc3d-1b.js` (chép mc3d.js; mẫu 1/2/3 không đổi).
- Màu: MỘT họ màu cho mê cung — sàn xám-xanh vừa, tường xanh dương đậm, mặt trên tường xanh sáng (bỏ viền cam + cột xanh ngọc);
  bệ đáp án VÀNG (vòng + viền bảng chữ); địch đỏ / tím; người trắng. Bỏ đèn xanh theo người (làm loá).
- Sáng: đèn trời 0,75 (mẫu 1: 0,6), mặt trời 2,6 (2,4), bloom nhẹ (0,32, ngưỡng 0,95), vignette 0,18.
  ⚠️ Đã thử sáng hơn nữa (sàn nhạt + mặt trên tường xanh nhạt) ⇒ tường và sàn cùng trắng, KHÔNG phân biệt được — sáng phải đi kèm tương phản.
- Tốc độ: người 3 ô/giây (mẫu 1: 5), địch theo tỉ lệ cũ (Difficulty 6 ≈ 1,5 ô/giây). Nhịp bước chân chậm theo.
- Nhân vật dựng lại: phi hành gia (kính mũ vàng phản chiếu, đèn 2 bên mũ, ăng-ten, cổ áo, bảng điều khiển ngực có màn + 3 nút,
  phù hiệu, thắt lưng khoá vàng, tay 3 khúc + găng, đệm gối xanh, ủng viền xanh, ba lô có tấm + khe + 2 bình khí xanh + 2 ống phụt) — to 1,75;
  robot địch (vỏ 2 nửa + khe sáng, vương miện 6 cạnh, vòng thép, mặt nạ tối + mắt ngang phát sáng + đồng tử, ăng-ten nhấp nháy,
  2 tay kẹp đung đưa, vây sau, khe tản nhiệt, động cơ dưới có vòng sáng + lửa phập phồng) — to 1,6.
- Bàn thử thêm: `__mc.cam([x,y,z],[x,y,z])` soi gần (gọi `__mc.cam()` trả lại) · `__mc.where()` toạ độ người/địch.
- Đã tự kiểm: tự chơi 9/9 ⇒ GAME COMPLETE, 0 lỗi console. ⬜ thầy xem trên TOMKO.

## 7. MẪU 1c (29/9) — 4 ý thầy sau 1b
Thầy: "(1) thiết kế để tôi chọn mẫu D-pad · (2) khi tới đích robot và chữ bị lẫn vào nhau, không chân thực · (3) sàn chia ngăn thành
các ô rất rối mắt · (4) mỗi màn một map khác nhau, cần nhiều map, tránh học sinh quen và thuộc lòng 1 map".
- `mau-1c-nhieu-map.html` + lõi `core/mc3d-1c.js` + `core/mc3d-1c.css` + KHO MAP `core/mc3d-maps.js`; trang so sánh `chon-dpad.html`.
- (1) 5 kiểu D-pad: A Glass (bản 1b) · B Ring (đĩa tròn 4 múi, cắt bằng clip-path — chạm theo múi) · C Keys (phím mũi tên chữ T ngược,
  nổi/lún) · D Console (dấu cộng đen trên đế tròn) · E Stick (cần gạt: kéo núm, đổi hướng khi lệch > 25% bán kính). Chọn ở Options
  "D-pad style" hoặc `?dpad=glass|ring|keys|console|stick`; vị trí vẫn Right/Left/Both/Off.
- (2) Bảng HOLOGRAM: bệ phẳng sát sàn (người đứng lên được) + máy chiếu + chùm sáng loe lên + bảng chữ có ĐÁY ở độ cao 5,0
  (đầu phi hành gia ≈ 4,2), luôn quay mặt về máy quay, có kiểm độ sâu. Đúng ⇒ bảng nảy phồng xanh ✓ + người quay mặt ra giơ 2 tay nhảy
  (bật thấp 0,3 để không chạm bảng) + tia sáng đưa người đi rồi mê cung sụp. Sai ⇒ bảng đỏ ✗ rung, người BỊ BẬT LÙI 1 ô (nhảy lùi) rồi
  đứng yên chờ lệnh; bệ tan sau 0,7 s. ⚠️ Đã thử lật bảng 360° ⇒ giữa chừng chữ bị NGƯỢC ⇒ đổi thành nảy phồng.
- (3) Sàn LIỀN theo hình map, không kẻ ô: màu theo map + vân kim loại mờ + tối dần sát mép; ô không có sàn trong suốt (thấy vũ trụ),
  mép sàn có vách dày (vách mép = mọi cạnh giữa ô có sàn và ô trống). Bỏ khối đế chữ nhật, viền sáng, 4 cột đèn, khối máy dưới đáy.
- (4) 10 MAP = hình trạm × kiểu mê cung × bảng màu: Classic Deck (full/dfs/blue) · Cross Station (cross/prim/teal) · Ring Module
  (vòng quanh lỗ giữa/dfs/indigo) · H-Bridge (h/rooms/emerald) · Hex Core (bát giác/prim/steel) · Twin Docks (2 đảo, 2 cầu/dfs/teal) ·
  U-Bay (u/arena/blue) · Zigzag Wing (s/dfs/emerald) · Four Labs (4 phòng nối cửa/rooms/indigo) · Open Arena (dấu cộng/arena/steel).
  Kiểu mê cung: dfs hành lang dài · prim nhiều nhánh ngắn · rooms có 3 phòng rộng · arena sân mở vách rải rác (đóng ~42% cạnh, giữ liền,
  không tạo ngõ cụt). Mỗi ván xáo bộ 10 map, không lặp map liền nhau; đường đi trong map vẫn ngẫu nhiên. Tên map hiện trên màn câu hỏi.
  Xuất phát = ô có sàn gần tâm nhất; địch = ô có sàn gần 4 góc nhất.
- Kiểm bằng máy: mỗi map sinh 200 lần ⇒ 0 lỗi liền mạch, 0 ngõ cụt (Hex lúc đầu có 2 ngõ cụt do đầu nhọn 1 ô ⇒ đổi thành bát giác) ·
  tự chơi 9/9 ⇒ 9 câu 9 map khác nhau, GAME COMPLETE · bệ sai ⇒ bật lùi đúng · 5 D-pad đều nhận lệnh · 0 lỗi console.
- Bàn thử thêm: `__mc.useMap(i)` xem map i ở màn chờ · `__mc.map()` tên map đang chơi · `__mc.autoTo(r, c)` tự đi tới ô.
- ⬜ Thầy chọn D-pad + xem 10 map trên TOMKO.

## 8. MẪU 1d (29/9) — thầy chọn D-pad B · Ring + "làm sàn đẹp và chi tiết hơn, sàn hiện tại trông giả quá"
- `mau-1d-san-that.html` + lõi `core/mc3d-1d.js` (chép 1c; D-pad mặc định `ring`) + SÀN `core/mc3d-floor.js` (dùng chung css 1c).
- Sàn PBR 4 lớp vẽ bằng canvas 160 px/ô (2400×1120): màu (+ trong suốt ô không sàn) · pháp tuyến (Sobel từ bản đồ độ cao) · độ nhám · phát sáng.
  Nội dung: tấm thép lát so le theo hàng ô (rộng 1 / 1,5 / 2 ô, hàng lẻ lệch 0,75 ô) có rãnh ghép + mép vát + 4 đinh tán; 55% thép sơn
  (đường ô mảnh, tấm vá bắt vít), ~30% thép GÂN KIM CƯƠNG (bóng hơn), ~15% LƯỚI thông gió (khe tối có đèn xanh hắt dưới); bẩn loang
  (nhiễu 4 lớp, nhân tối) + 420 vết xước + chữ in khu vực (DECK 3, B-07…); bóng tối sát chân tường theo mê cung của câu; mép giáp khoảng
  trống = sọc vàng-đen + đèn đường băng; vòng vàng nét đứt ở ô xuất phát. Vật liệu metalness 0,5, normalScale 1,3, emissive 1,6;
  thêm 1 đèn xiên thấp (`graze`) để gân/rãnh nổi. Vẽ lại mỗi câu ≈ 130 ms.
- Kiểm: 0 lỗi console · tự chơi (Difficulty 1, 10 tim) 3 lượt đều 9/9 · soi gần thấy rõ đinh tán, gân, sọc cảnh báo.
- ⬜ Thầy xem trên TOMKO: sàn có quá rối so với chữ đáp án không; tường giờ trông "trơn" hơn sàn — nếu cần thì làm chi tiết tường tương tự.

## 9. MẪU 1e (29/9) — đổi người, chữ ANDREW STUDIO, bom, nút ra ngoài màn
Thầy: "sau khi chết 1 mạng phải delay để người khác kịp chạy lên thay (mỗi HS chơi 1 mạng, kể cả chưa tìm được từ vẫn đổi) và robot
về vị trí xuất phát · trên sàn có chỗ trung tâm nổi bật chữ ANDREW STUDIO theo phong cách chữ khắc trên boong · thêm cơ chế đặt bom
bằng nút giữa D-pad · các nút chức năng đưa ra ngoài màn hình như Rocket Race". Chốt qua AskUserQuestion (2 lượt):
bom = VẬT CẢN, robot đuổi tới sát thì NỔ; robot trong tầm vỡ tung thành nhiều mảnh cháy đen bốc khói nằm lại gần chỗ nổ, KHÔNG xuất hiện
lại ở câu đó (câu sau có lại); người đứng sát cũng mất mạng; "vụ nổ siêu chân thực, khói lửa như thật" · Options Bombs 0–10 mỗi HS +
Bomb gift: cứ K câu đúng tặng 1 · đổi người = đếm 3 giây.
- `mau-1e-bom-doi-nguoi.html` + `core/mc3d-1e.js` + `core/mc3d-1e.css` + `core/mc3d-floor-1e.js` (sàn 1d + chữ khắc) + `core/mc3d-boom.js` (nổ + xác + mô hình bom).
- ĐỔI NGƯỜI: mọi lần mất mạng (robot bắt · ô sai · dính bom) ⇒ `startSwap(0,9 s)`: màn NEXT PLAYER + "Player k of N" đếm 3-2-1, robot BAY
  vòng về góc (1,1 s), người dịch chuyển về giữa ở giây cuối, HS mới nhận lại `Bombs` quả; xong ân hạn 1,2 s. Ô sai: bật lùi vẫn diễn rồi đổi.
  Robot đã nổ vẫn mất ở câu đó; bom đã đặt vẫn nằm trên sàn qua lượt đổi người (xoá khi sang câu).
- SÂN XUẤT PHÁT: mở hết vách trong khối tới 5×3 quanh ô xuất phát; hàng ngay dưới (gần máy quay) khắc ANDREW STUDIO 2 dòng (ANDREW to +
  STUDIO dãn rộng, gạch vàng 2 bên) trên tấm khắc có ke góc vàng — chữ chìm (bản đồ độ cao) + sơn trắng + hắt sáng nhẹ. Không đặt bệ trong
  sân và ở hàng ngay dưới chữ (bảng hologram treo cao sẽ đè lên chữ trên màn — đã gặp với "Mercury").
- BOM: nút giữa D-pad Ring (bom + số còn lại; xám khi hết) · Space/B · số bom cũng hiện ở dải trên. Đặt ở ô đang đứng (không trên bệ);
  người rời ô rồi không quay lại được (bom chặn cả người lẫn robot). Robot định bước vào ô bom ⇒ `detonate`: tầm hạ robot 1,6 ô, tầm làm
  người mất mạng 1,25 ô; bom khác trong tầm nổ lan (trễ 0,12 s).
- VỤ NỔ (`mc3d-boom.js`): đèn chớp có sẵn từ đầu (thêm đèn giữa trận ⇒ dịch lại shader ⇒ khựng) · lõi chớp cộng sáng 0,2 s · 30 mảng lửa
  PHỦ (không cộng sáng) màu vàng cam→đỏ sẫm→nâu, kết cấu cuộn có lỗ · 40 mảng khói đen dày cuộn lên tan 3–5 s + bụi quét sàn · 120 tàn lửa
  rơi nảy · sóng xung kích sát sàn · vết cháy xém nằm lại. XÁC: 16 mảnh (vỏ màu robot + thép tối) văng gần (1,4–4 đv/s), rơi–nảy–dừng, đỏ than
  → đen trong ~1 s, bốc khói từng làn + cột khói chính tới hết câu.
  ⚠️ Bẫy đã gặp: lửa CỘNG SÁNG nhiều lớp ⇒ trắng kem như mây (đổi sang phủ); lần nổ ĐẦU khựng 0,28–0,41 s do dịch shader ⇒ dựng sẵn lúc tải
  trang (`renderer.compile` với 1 vụ nổ + xác + bom giả rồi xoá) ⇒ đo lại trang mới: 0 khung > 30 ms.
- NÚT RA NGOÀI: khung game = cửa sổ − thanh 80 px; thanh dưới có MENU · SOUND · FULL SCREEN kiểu kính tối viền xanh của Rocket Race 3D.
- Kiểm bằng máy (0 lỗi console): nút giữa D-pad đặt bom (2→1) · bom chặn người · robot đuổi tới bom ⇒ nổ, robot mất, bom kề nổ lan ·
  người đứng sát lúc nổ ⇒ 5→4 mạng + NEXT PLAYER "Player 2 of 5" + nhận lại 2 bom + chơi tiếp từ giữa · tặng bom K=1 ⇒ 2→3 · ô sai ⇒ đổi người ·
  tự chơi hết ván 9/9 (máy tự chơi không né địch nên có ván thua — 10/11 mạng mất do bị bắt).
- Bàn thử thêm: `__mc.bomb()` · `dropBomb(r,c)` · `detonateAt(r,c)` · `bombs()` · `bombsLeft()` · `enemyNext()`.
- ⬜ Thầy thử trên TOMKO: tiếng nổ (Claude không nghe được — đang dùng tiếng "hit" tổng hợp), độ dài 3 giây đổi người, cỡ chữ ANDREW STUDIO.

## 10. MẪU 1f (29/9) — nút bom chỉ icon · ANDREW STUDIO khắc chìm · xác robot thật · D-pad nét
Thầy: "nút giữa chỉ dùng icon quả bom ở chính giữa, không số; icon đơn giản, cân đối, hiện đại · ANDREW STUDIO nhỏ hơn, tối hơn (đang nổi bật
quá, chỉ cần như khắc trên sàn, không cần sáng), đặt chỗ ít bị che, nhìn được cả dòng ANDREW và STUDIO · mảnh vỡ robot đơn điệu, cần giống
mảnh vỡ thật của robot sau vụ nổ · D-pad đang bị che mờ ở mỗi nửa phím, hiển thị rõ nét hết".
- `mau-1f-xac-robot.html` + `core/mc3d-1f.js/.css` + `core/mc3d-floor-1f.js` + `core/mc3d-boom-1f.js`.
- D-pad Ring = SVG (`ringSVG()`): 4 múi vành khăn tách khe 8°, nền đặc tối + viền xanh + mũi tên tam giác; bấm = múi sáng xanh. Bỏ kính mờ
  (backdrop-filter) + 2 vạch chéo đè lên phím của bản CSS cũ. Chạm theo đúng hình múi (SVG bắt chạm theo hình). Nút giữa: chỉ icon bom
  (thân tròn + chóp + ngòi + tia lửa + vệt bóng) trên nền cam đậm viền vàng; hết bom ⇒ mờ xám. Số bom vẫn ở dải trên.
- ANDREW STUDIO: cỡ ~½ bản 1e, chỉ rãnh tối + sơn mòn xám rất mờ + khung khắc mảnh; bỏ phát sáng, bỏ ke góc + gạch vàng. Mở vách NGAY TRƯỚC
  dòng chữ (phía máy quay) + nối các ô hàng dưới ⇒ tường không còn che dòng STUDIO.
- Xác robot (`robotParts`): 7 mảng vỏ màu (mảnh mặt cầu, đỉnh xô lệch ⇒ mép rách, 2 mặt) + 2 vỏ đáy tối + 2 đoạn vòng đèn gãy (le lói rồi tắt)
  + mặt nạ còn khe mắt + 2 tay kẹp đứt (vai–khuỷu–2 càng) + ăng-ten cong có đèn đầu + cụm động cơ (thân + loa phụt) + nửa vương miện 6 cạnh
  + 6 ốc lục giác + 3 dây điện đứt (đỏ/vàng/đen) + mảnh bảng mạch xanh có chip + đèn. Mảnh nhẹ văng xa hơn, mảng vỏ nằm gần; chạm sàn thì
  nảy rồi đổ nằm xuống (quay dần về tư thế gần phẳng). Cháy: vỏ → gần đen (còn phảng phất màu), thép → xám khói, đèn tắt dần; vỏ/động cơ/mặt nạ bốc khói.
- Kiểm: 4 múi + tâm bắt đúng hướng theo toạ độ thật · bấm múi trái ⇒ người đi trái · nút giữa đặt bom, không có số · tự chơi 9/9 · 0 lỗi ·
  lần nổ đầu trên trang mới: 2 khung ~30–36 ms (tạo 26 mảnh), không còn khựng lớn.

## 11. MẪU 1g (29/9) — nút chỉ icon · nút hệ AWord · robot bớt chói · bom đúng tâm
Thầy: "bỏ chữ NEXT PLAYER, chỉ đếm · icon bom ở chính giữa nút · giảm độ sáng robot mình cho đỡ chói, nhìn rõ hơn · các nút chỉ icon, không
text · bỏ nút full screen · thêm nút hệ AWord: mở thư mục, options, table, mode ở hàng nút".
- `mau-1g-nut-icon.html` + `core/mc3d-1g.js/.css` (sàn + nổ dùng lại `mc3d-floor-1f.js`, `mc3d-boom-1f.js`).
- Icon bom lệch trái vì nút giữa là flex chỉ căn DỌC (`align-items`) mà thiếu `justify-content` ⇒ icon dính mép trái 11 px. Sửa luật
  `.mc-dpad[data-style] .hub { justify-content:center }` + vẽ lại icon: thân tròn đúng tâm (12,12) khung 24. Đo: lệch 0 px.
- Robot mình: bộ đồ 0xf1f3f7 → 0x8290a6 (nhám 0.8, envMap 0.15), vải 0x5f6b82, đèn mũ 2.4 → 0.9, màn ngực 1.6 → 0.9, đèn ăng-ten 3 → 1.4.
- Hàng nút: Menu · Sound | Thư mục (icon actSwitch) · Options · Table (icon cúp = bảng xếp hạng) · Mode (icon Single) — icon chép từ AWord
  `core/icons.js`. Bảng nổi: Options = chính bảng tuỳ chọn cũ (dời vào bảng, đóng thì trả về); Thư mục / Table = dữ liệu MẪU (khi ghép vào
  AWord sẽ nối thật); Mode = Single (đang chơi) + Fight (sắp có). Mở giữa ván ⇒ tạm dừng, đóng ⇒ chơi tiếp. Bỏ link Options ở màn đầu.
- Kiểm: màn đổi người chỉ có số · 4 bảng mở/đóng đúng, Options trả về chỗ cũ · nút giữa đặt bom · tự chơi 9/9 · 0 lỗi.

## 12. MẪU 1h (29/9) — Tablet · ô % · bom 5 s phá tường · chào quân đội · đỏ khi bị đụng · ô sai nổ tại chỗ
Thầy: "không có nút table, đó là nút Tablet (nối iPad như Rocket Race, gán chức năng sau) — lần sau thấy yêu cầu lạ phải hỏi lại trước ·
thêm ô % và ô đếm thời gian như Rocket Race · nổ cạnh tường phá vách xung quanh sát quả bom; trên bom có thanh thời gian 5 s, robot chạm
trước thì nổ như cũ · đúng ô: quay mặt ra khán giả, giơ tay lên trán chào kiểu quân đội · ba lô khắc ANDREW CLASSES · bị đụng: không teo,
giữ hình + đỏ · vào ô sai: nổ như ăn bom, robot nảy lên vỡ tung, 3-2-1, robot mới hiện đúng chỗ đó giữ hướng mặt, còn vệt đen, mất 1
mạng, địch về xuất phát". Hỏi lại (AskUserQuestion) & thầy chốt: phá vách SÁT ô bom, giữ tường bao ngoài · bệ sai VỠ luôn · bị đụng ⇒ về
chỗ xuất phát hết + robot mới có HÀO QUANG bảo vệ 3 s · Single: đồng hồ GIỮ góc trái nhưng thiết kế lại cùng kiểu với ô điểm; hàng nút
KHÔNG cần đồng hồ (chỉ ô %).
- `mau-1h-bom-pha-tuong.html` + `core/mc3d-1h.js/.css` + `core/mc3d-boom-1h.js` (sàn dùng `mc3d-floor-1f.js`).
- Hàng nút: Menu · [✓ %] · Sound | Thư mục · Options · Tablet (icon máy tính bảng, bật/tắt viền vàng) · Mode. % = câu đã chơi / tổng.
- Dải trên: đồng hồ (icon + số) và cụm bom | tim | điểm = cùng "viên" kính tối viền xanh như ô câu hỏi; cột `auto 1fr auto` ⇒ câu hỏi dài
  co trong phần giữa, không đè 2 ô.
- Bom: thanh giờ billboard trên đầu (4,4 × 0,62, xanh → vàng → đỏ, tích mỗi giây), hết 5 s tự nổ (`FUSE_S`). `breakWalls`: mở cờ vách giữa
  ô bom và ô kề (chỉ khi ô kề có sàn ⇒ tường bao ngoài còn nguyên) → `layoutWalls` + vẽ lại → `boom.rubble` gạch vụn văng ra xa bom.
  ⚠ thanh giờ: nền trong suốt + phần đầy đục ⇒ nền vẽ SAU phủ lên làm xỉn màu; phải cho cả hai cùng `transparent`.
- Đúng ô: HOLD 0,9 → 1,7 s; đứng nghiêm, tay phải (arms[0] vì quay mặt ra máy quay) vai + KHUỶU mới (`SALUTE`) đưa lên mép mũ.
- Ba lô: tấm khắc canvas "ANDREW / CLASSES" (rãnh tối + mép sáng) thay 3 gờ tối.
- Bị đụng: `setRed` đổi màu mọi vật liệu của người sang đỏ (nhớ màu gốc), giữ tỉ lệ, khựng lắc; hết chờ ⇒ tia đưa đi, robot mới ở XUẤT PHÁT.
- Ô sai / dính bom: nảy vọt lên 0,5 s rồi `boom.wreck(...,"astro")` = xác phi hành gia (mảnh mũ, kính vàng, thân, ba lô móp, 2 bình xanh,
  tay, găng, ủng, bảng ngực có đèn, đai gãy, ốc, dây). Ô sai: bệ ẩn luôn + `boom.explode` (vệt cháy còn tới hết câu) + robot mới ở ĐÚNG ô đó,
  giữ hướng. Dính bom: robot mới ở xuất phát. Hào quang 3 s (`SHIELD_S`) nhịp thở, 0,8 s cuối nháy.
- Kiểm: phá 2 vách (104 → 102), ô bom mở cả 4 phía · bom tự nổ 5 s, người đứng sát mất mạng · đỏ giữ tỉ lệ 1,75 · robot mới ở xuất phát
  có hào quang · ô sai ⇒ robot mới ở đúng ô (0,3) hướng trái, bệ biến mất · chào quân đội · % 11% sau câu 1, 100% cuối ván · tự chơi
  9/9 ×2 · 0 lỗi · lần nổ đầu: 1 khung ~48 ms lúc hiện số đếm (DOM), không khựng lúc nổ.

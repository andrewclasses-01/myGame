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

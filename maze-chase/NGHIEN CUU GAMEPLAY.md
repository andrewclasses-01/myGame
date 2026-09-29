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

## 13. MẪU 1i (29/9) — nắp boong · vỡ từ hình robot · địch nổ khi đúng · sao xoay · tàu vũ trụ
Thầy: "ô sai: nổ trước rồi robot bị văng lên và vỡ tung từ chính hình dạng robot ngay lúc văng; mảnh nhỏ, thật, chi tiết · robot địch về vị
trí xuất phát = sàn boong mở, robot hạ xuống, nắp đóng; ở chỗ xuất phát boong mở, robot được đưa lên rồi đóng · chỗ xuất phát của mình vòng
nét đứt xoay, mình cũng lên từ dưới boong · đúng ô: mình đứng chào chờ chuyển màn (tường vẫn ẩn), địch nổ tung + xác cháy tại chỗ · sao
xoay rất chậm, tinh vân xoay chậm lệch với sao (3D) · thỉnh thoảng tàu vũ trụ xa xa bay qua chầm chậm, đẹp, lửa khói đẩy, cực chi tiết,
kiểu Star Wars (ảnh Star Destroyer), slogan ANDREW CLASSES sáng đèn, thỉnh thoảng chập chờn". Hỏi lại & thầy chốt: nắp boong dùng cho
MỌI lần xuất hiện (đầu câu, đổi người, hồi sinh ô sai) · đúng ô: chào xong HẠ XUỐNG qua nắp boong · tàu ~45–60 s/lần.
- `mau-1i-nap-boong-tau-vu-tru.html` + `core/mc3d-1i.js/.css` + `mc3d-boom-1i.js` + `mc3d-hatch-1i.js` (mới) + `mc3d-ship-1i.js` (mới).
- Nắp boong (`createHatches`): khung sọc cảnh báo + 4 đèn góc nháy cam + lòng giếng (canvas: thành giếng thu nhỏ dần, bệ nâng viền xanh) +
  2 cánh bản lề mép ngoài lật SẬP xuống (phần dưới sàn bị sàn che) + cột sáng xanh. `run(x,z,{mode:"rise"|"sink",depth,speed,onLift,
  onHidden,onDone})`. Robot "dưới boong" = y âm, sàn đục che. Nắp dùng xong cất KHO dùng lại (tạo mới mỗi lần = khựng 72 ms).
- Đổi người: địch — nắp mở dưới chân, hạ xuống (giữ toạ độ cũ `e.hold`), chìm hẳn ⇒ nắp ở góc xuất phát đưa lên; robot đỏ cũng hạ xuống rồi
  robot mới lên. Đầu câu: mình lên ở 0,1 s, địch lên ở 0,8 s (khoá di chuyển tới khi lên hẳn).
- Vỡ từ hình robot (`boom.shatter`): cắt tam giác của TỪNG mesh robot theo lưới ~0,34 (ranh giới xô lệch ⇒ mép vỡ lởm chởm), đặt đúng tư thế
  robot lúc đó, văng xa tâm nổ + hất lên; +22 vụn (ốc, dây, mạt). Mốc: 0–0,1 s nổ bùng trước · 0,1–0,22 s bị hất lên · rồi vỡ. ~270 mảnh.
  ⚡ Cắt SẴN (hệ toạ độ riêng từng mesh) + BỘ MẢNH dựng sẵn dùng lại + chỉ ≤6 mảnh to bốc khói, mảnh vụn không đổ bóng.
- Đúng ô: địch nổ (explode 0,6 + wreck) lệch nhau 0,16 s, xác cháy tại chỗ; mình chào tới lúc hạ; bệ đúng tan khi nắp mở; sang câu 1,75 s.
- Trời: sao xoay quanh trục nhìn của máy quay 0,012 rad/s; tinh vân (shader, `uRot`) 0,0075 rad/s ngược chiều, trục lệch 12°.
- Tàu (`createShip`): thân nêm + đai hông tối + ~2000 khối chi tiết (instanced) + thượng tầng 4 bậc + cổ tháp + đài chỉ huy + 2 vòm cầu +
  cửa sổ sáng (instanced) + 3 động cơ lớn/4 nhỏ (lõi xanh trắng + 2 nón lửa + vệt khói). Slogan phát sáng 2 bên sườn boong (bản xoay 180° khi
  bay sang trái để chữ không lộn ngược), chập "rẹt rẹt" 0,25–0,6 s mỗi 2,5–6 s. Dài 70, cách máy quay 340, dải trời ngay trên mép trạm, 24 s/lượt.
- ⛔ BẪY khựng lần đầu: làm nóng lúc tải trang (renderer.compile) KHÔNG khớp trạng thái trận ⇒ lần đầu nổ/vỡ/nắp/tàu vẫn dịch shader. Vẽ vào
  render target riêng cũng không khớp cho mảnh vỡ/nắp/robot. Cách được: `warmInGame()` lúc câu hỏi to đầu ván — robot + mảnh vỡ + nắp + bệ +
  tàu (thu 0,02) đặt DƯỚI SÀN rồi `composer.render()` thật; nổ/xác địch/gạch/bom vẽ khung ẩn. Dọn bằng clear nhưng vật liệu mảnh `keep`.
- Kiểm (chạy thật theo nhịp màn hình): trung bình 6,2 ms/khung; chỉ 1 khung ~0,25 s lúc làm nóng (màn câu hỏi to) + 1 khung 49 ms lúc vỡ ·
  tàu, nắp, nổ không khựng · ô sai hồi sinh đúng ô qua nắp · đổi người: địch về (0,0)/(6,14) · tự chơi 9/9 ×2 · 0 lỗi.

## 14. MẪU 1j (29/9) — đom đóm · vệt cháy nhiều kiểu · nắp tròn + hầm máy · tàu săn tàu con · sao lấp lánh
Thầy: "robot tan nhiều mảnh quá, bừa bộn ⇒ với robot mình: đốm sáng như đom đóm nổ bung rồi bay lên biến mất; vệt đen + khói vẫn còn, mỗi vụ
một kiểu vệt đen, khói cháy một lát rồi ít dần rồi tắt · nắp boong hình tròn, dưới boong không đen hẳn mà thấy máy móc, robot xa xa mờ mờ
· tàu ANDREW CLASSES nhỏ còn 2/3, xuất hiện chéo từ cạnh đáy (nửa trái/phải), bay chéo lên rượt tàu con, bắn đạn 2 bên, tàu con nổ ở chỗ
nhìn thấy sau nhiều phát; chữ ở giữa tàu, 1 chữ ngửa lên; bắn xong bay thẳng; lát sau quay lại săn tàu khác hình dạng khác · lửa đẹp,
thật, chi tiết · tàu chi tiết hơn (đang như lego), tàu con cũng chi tiết · sao nhỏ hơn, nhiều tầng, lấp lánh". Hỏi lại & thầy chốt: tàu
45–60 s/lượt · lượt sau vào hướng khác (dưới lên / trên xuống / đôi khi ngang), không trùng chỗ vào lượt ngay trước · khói tắt: MỌI vụ nổ.
- `mau-1j-dom-dom-tau-san.html` + `core/mc3d-1j.js/.css` + `mc3d-boom-1j.js` + `mc3d-hatch-1j.js` (mới) + `mc3d-ship-1j.js` (mới).
- Đom đóm (`boom.fireflies`): 240 đốm (xanh lá vàng / vàng chanh / hổ phách / bạc hà), bung ra khắp thân robot → chậm lại → chao lượn bay
  lên, lập loè, tắt dần sau 2,4–4,8 s. Robot vẫn bị hất lên 0,12 s rồi mới tan.
- Vệt cháy: 6 mẫu (loang + tia · sao nổ tia dài · vành cháy lõi nhạt · bắn toé lệch + giọt · nứt than · vệt muội dài) + cỡ 7–11,5, méo, xoay.
  Mỗi vụ nổ kèm `smolder` (khói âm ỉ 5–7 s, thưa + mỏng dần rồi tắt). Xác địch / gạch: tuổi thọ khói 8 / 6 s.
- Nắp tròn (`createHatches`): vành sọc + gờ thép + 6 đèn + 8 lá kiểu ống kính (thu vào vành + xoắn). LÒNG NẮP = "ảnh phụ" (`createPortal`):
  vẽ lớp 5 (hầm + robot đang nâng) bằng CHÍNH máy quay vào render target, đĩa lấy điểm ảnh theo toạ độ màn hình ⇒ phối cảnh thật. Giếng
  chỉ dày 1,3 (bằng sàn) + bệ nâng dạng KHUNG (vành + 6 nan + trục) để nhìn xuyên. Hầm (`createUnderdeck`, lớp 5, đèn riêng): sàn lưới, cột,
  dầm, 240 khối máy (2/3 dồn dưới trạm, cao 3–13), màn hình/khe đèn, bồn, ống, băng chuyền, quạt, 140 đèn nháy, 10 robot tuần tra, sương mờ.
  ⚠ Cột sáng xanh phủ lên lỗ từng che mất hầm (tưởng lỗi ảnh phụ) ⇒ để rất mờ 0,06; bệ đặc từng che kín ⇒ đổi thành khung.
- Hạm đội (`createFleet`): tàu lớn dài 47 (2/3), vỏ 2048px nhiều cỡ tấm + bump, 3 tầng hông, 3200 khối + 260 trụ chi tiết cỡ lệch (cùng tông vỏ
  — sáng hơn vỏ là trông như lego), 12 tháp pháo nòng đôi 2 bên (nơi bắn), thượng tầng vát cạnh + cửa sổ, 2 vòm cầu đa diện, 7 loa phụt tiện
  (lathe). Lửa shader: lõi xanh trắng + vòng sốc + viền cam nhiễu cuộn + quầng. Tàu con 3 kiểu: tiêm kích cánh X · tàu hàng đĩa có càng ·
  tàu chặn cầu + cánh lục giác — lạng lách, có lửa. Laser đỏ 2 bên luân phiên, ngắm đón đầu, ~25% trượt; nổ khi đủ 5–7 phát VÀ đang ở
  vùng nhìn thấy (ngoài vùng trạm che); mảnh tàu con văng + lửa + khói. 6 cửa vào (BL/BR/TL/TR/L/R), không trùng lượt trước; kiểu tàu con
  không trùng lượt trước. Chữ: 1 dòng giữa sống lưng (bản xoay 180° khi mũi hướng trái màn), dải boong dưới chữ để trống.
- Sao: 4 tầng Points shader (5200 li ti → 46 sáng), cỡ 0,7–3,3 px, lấp lánh nhịp riêng + thỉnh thoảng loé.
- ⛔ BẪY khựng 0,4–0,6 s: robot mang 1 PointLight (tắt) ⇒ robot ẩn/hiện làm SỐ ĐÈN đổi ⇒ shader MỌI vật dịch lại. Dời đèn ra khỏi robot.
  Làm nóng trong trận tách 2 khung (0,3 s + 1,0 s) lúc câu hỏi to.
- Kiểm (chạy thật): trung bình 8,4 ms/khung; chỉ 1 khung ~0,45 s lúc câu hỏi to đầu ván · đom đóm/nắp/đổi người/tàu săn không khựng ·
  tự chơi 9/9 ×2 · 0 lỗi.

## 15. MẪU 1k (29/9) — đếm 5 s · đếm kiểu HUD · lửa đuôi nhấp nhô · xác tàu con kiểu Rocket Race · cụm trên không ô chứa
Thầy: "đổi mọi chỗ đếm 3s thành 5s; đổi phong cách số đếm và chữ GO cho đồng bộ với style · lửa đuôi tàu cháy nhấp nhô chân thực hơn,
đang cứng và giả · tàu nhỏ bị bắn hạ nổ ra nhiều mảnh xác hơn, như tàu nổ trong Rocket Race · design lại đồng hồ, ô câu hỏi, bom, tim,
điểm cho đồng bộ phong cách, không cần ô chứa".
- `mau-1k-dem-5s-hud.html` + `core/mc3d-1k.js/.css` + `core/mc3d-ship-1k.js` (boom/hatch vẫn dùng bản 1j).
- Đếm: đầu ván 5-4-3-2-1-GO! (mỗi số 1 s, trước là 0,8 s); đổi người `SWAP_S` 3 ⇒ 5 rồi GO!. Một khối `.mc-count` dùng chung (`showCount`):
  vòng vạch 60 nấc xoay + rãnh + cung vàng chạy hết trong 1 s + 4 ngoặc xoay ngược; số chữ Baloo gradient trắng → xanh; GO! vàng, vòng bung
  1,75× rồi tan. Hào quang bảo vệ vẫn 3 s (không phải số đếm).
- Lửa: nón uốn trong vertex shader (phình/thắt chạy dọc + đuôi lắc cùng nhịp mọi lớp), vân fbm uốn miền, đuôi tách lưỡi lửa; dài/sáng đổi
  bằng tổng sóng lệch nhịp (bỏ `Math.random()` mỗi khung — nguyên nhân "cứng, giả"); 3 lớp (lõi · thân · quầng) + hạt lưỡi lửa liếm (75/s).
  ⚠ Lần đầu quá trắng (cộng sáng + bloom) ⇒ hạ lõi, thân xanh tím → cam, dài 9 ⇒ 12 lần bán kính loa.
- Xác tàu con (`makeWreckKit`, cách của Rocket Race `rr3d-view.js`): ~60 mảnh dựng sẵn, gắn ẩn trong tàu con — tấm vỏ rách (mép răng cưa,
  thủng, cong/quăn/móp theo nhiễu 3D, loang muội vertexColors), 12 tấm lớn thay vỏ chính (vỏ chính ẩn khi nổ), dải xoắn, ống gãy, cục máy,
  mảnh vụn; vật liệu cháy sạm (ửng đỏ rồi nguội); ~25% mảnh cháy kéo lửa, mảnh lớn kéo khói; 40 tàn lửa văng; 6,5 s sau thu nhỏ tan.
  Hệ hạt Points (1 lượt vẽ/hệ) cho lửa + khói. Xác vẫn trôi tiếp khi tàu lớn đã bay khỏi màn.
  ⚠ Khói hạt ShaderMaterial KHÔNG qua chuyển màu sRGB ⇒ 0,24 ra màn thành xám sáng như sỏi trắng ⇒ dùng 0,085.
- Cụm trên: bỏ ô kính; đồng hồ/số xanh neon, câu hỏi chữ trắng viền tối + gạch chân xanh–vàng–xanh, bom vàng, tim SVG hồng (mất = viền),
  điểm dấu tích tròn xanh lá; dải tối mờ dần phía trên giữ chữ dễ đọc.
- Kiểm (chạy thật): trung bình 7,3 ms/khung; tàu săn + nổ xác không khựng; khung ~150 ms lúc chuyển câu có sẵn từ 1j (màn câu hỏi to) ·
  tự chơi 9/9 · 0 lỗi.

## 16. MẪU 1l (29/9) — hào quang 5 s · HUD mép dưới · màn kết thúc vũ trụ · đom đóm từ thân robot · rượt đuổi vòng vòng · xác rơi
Thầy: "hào quang bảo vệ 5 s · đồng hồ, tim, bom, điểm về hàng dưới, hàng trên chỉ câu hỏi, bỏ dấu tích cạnh điểm · mọi tàu con nổ tan thành
nhiều mảnh nhỏ, bốc khói, tối, rơi dần xuống trong lúc vẫn bốc khói · điểm/chữ khi kết thúc game theo phong cách vũ trụ · ô sai: đốm sáng nổ
ra từ chính thân robot · tàu ANDREW CLASSES nghiêng ngả, lái theo hướng tàu con; laser nhỏ mảnh hơn; 2 tàu đuổi nhau vòng vòng trong màn
một chút, không bay thẳng bắn nổ ngay · chữ ANDREW CLASSES bị che một ít". Hỏi lại & thầy chốt: "hàng dưới" = MÉP DƯỚI TRONG MÀN CHƠI.
- `mau-1l-hud-duoi-ruot-duoi.html` + `core/mc3d-1l.js/.css` + `mc3d-ship-1l.js` + `mc3d-boom-1l.js` (hatch vẫn 1j).
- `SHIELD_S` 3 ⇒ 5. `.mc-top` phủ cả màn: câu hỏi giữa trên, `.mc-bot` giữa dưới (đồng hồ · bom · tim · điểm số xanh lá, không icon);
  2 dải tối mờ trên/dưới giữ chữ dễ đọc. `.mc-top{z-index:0}` để không đè màn kết thúc.
- Màn kết thúc: thẻ kính tối có sao li ti + ngoặc góc vàng, tiêu đề giãn chữ có 2 vạch, điểm trong vòng HUD (vạch xoay, cung vàng = tỉ lệ
  đúng, chạy lên khi hiện), đồng hồ, nút vát góc. ⚠ Bẫy cũ: `.mc-ans{display:grid}` đè `[hidden]` ⇒ danh sách đáp án luôn mở — đã sửa.
- Đom đóm: 420 điểm lấy mẫu sẵn trên bề mặt các bộ phận robot (MeshSurfaceSampler, theo diện tích), lúc nổ đổi sang toạ độ thế giới đúng
  tư thế; giữ nguyên hình 0,16–0,21 s sáng rực rồi bung từ tâm thân ra. Robot hất cao 2,2 (trước 1,3) cho khỏi lõi lửa che.
- Rượt đuổi: 1 đường Catmull-Rom (centripetal) qua các điểm NDC: ngoài màn → cửa vào → 3–4 điểm lượn quanh giữa màn cùng chiều quay →
  điểm nổ (dải trên/dưới, không bị trạm che) → 2 điểm ra (tính theo MÀN HÌNH — tính theo thế giới từng lao thẳng vào máy quay). Tàu con
  chạy trước, tàu lớn bám đúng vệt, trễ 1,7 thân; nghiêng = atan(v²·độ cong có dấu / 15), tối đa 0,95 rad. Rượt 11–15 s, đạn trúng chỉ
  toé lửa/khói, tới điểm cuối mới nổ. Chữ đổi mặt (cho xuôi) khi tàu quay đầu, đổi đúng lúc chữ đang chập tắt.
- Laser bán kính 0,35 ⇒ 0,16, quầng 6 ⇒ 3,2. Chữ ANDREW CLASSES dời về phía mũi (tâm 0,02 ⇒ 0,13, dài 0,44) — trước đầu chữ sát thượng tầng.
- Xác tàu con: ẩn toàn bộ bộ phận gốc; ~109 vụn nhỏ (70 tấm rách nhỏ, 8 vừa, 6 dải xoắn, ống, cục máy, mảnh tam giác), muội tối hơn; trọng
  lực theo "xuống màn hình" (đổi sang toạ độ tàu con) + cản ⇒ rơi đều chậm; mọi mảnh bốc khói 6–8,5 s; tan sau 7,5–9 s. Hệ khói 1800 hạt.
- Kiểm (chạy thật): trung bình 7,0 ms/khung; rượt đuổi + nổ + xác rơi không khựng (khung ~150 ms lúc chuyển câu có sẵn từ 1j) · tự chơi
  9/9 · 0 lỗi.

## 17. MẪU 1m (29/9) — đếm 3-2-1 không GO · câu hỏi thêm 3 s · END GAME · Show answers to · thanh tiến độ · tàu con nổ chỗ thấy
Thầy: "đếm 5-4-3-2-1 là vào game luôn, bỏ hẳn GO · game over bỏ vòng xoay, 2/9 cùng hàng · menu bỏ Back to start screen, thêm END GAME
dòng cuối · thêm 3 s hiện câu hỏi trước khi đếm · tàu con luôn bị bắn và nổ ở chỗ nhìn thấy · ô sai robot không nảy, vụ nổ làm nó bung
đốm sáng tại chỗ · Show answers to tối đa, hiện câu sai + đáp án đúng · bỏ ô %, thêm thanh mảnh ở hàng nút dài bằng khung game chạy theo %".
Hỏi lại & thầy chốt: câu MỚI ⇒ câu hỏi to thêm 3 s rồi đếm 3-2-1; vẫn câu đó ⇒ chỉ đếm 3-2-1; bỏ 5-4 và GO cho mọi dạng.
- `mau-1m-thanh-tien-do.html` + `core/mc3d-1m.js/.css` + `mc3d-ship-1m.js` + `mc3d-boom-1m.js`.
- Đếm: `["3","2","1"]` cho MỌI câu, hết số (3 s) là chơi (tiếng go vẫn kêu); đổi người `SWAP_S` 5 ⇒ 3, không GO. Câu hỏi to 2,2/1,7 ⇒ 5,2/4,7 s.
- END GAME (menu tạm dừng): xoá việc hẹn giờ, `endGame("over")`; câu chưa tới ghi "not played". Show answers: khung 94cqw × 94cqh,
  mỗi câu = đáp án sai đã chọn (gạch đỏ) + ✓ đáp án đúng.
- Thanh tiến độ `.mc-prog` giữa khung game và hàng nút, `fit()` đặt rộng = khung game; 6 px + lề 6 + hàng nút 68 = 80 (BAR_H).
- Ô sai: không hất; 0,04 s sau nổ là tan đốm sáng (giữ hình 0,07 s).
- Tàu con: điểm nổ ngoài hình chiếu hộp mê cung (`blockRect` chiếu 8 góc), y ≤ 0,62 (dưới câu hỏi), tránh 2 góc dưới; phát KẾT LIỄU bắn
  canh giờ tới điểm nổ, trúng mới nổ (dự phòng quá 0,6 s). Thử 6 lượt: nổ ở y 0,60–0,63, trên mê cung, dưới câu hỏi.
- ⛔ BẪY: `node --check file.js` KHÔNG bắt lỗi cú pháp của module (chú thích nuốt mất nửa dòng lệnh vẫn "OK") ⇒ chép sang `.mjs` rồi mới check.
- Kiểm: tự chơi 9/9 · END GAME + Show answers · ô sai không nảy · 0 lỗi.

## 18. MẪU 1n (29/9) — vòng đếm bung 4 phía · súng hông tàu ANDREW · tường bụi bẩn
Thầy: "khi đếm đến 1 thì vòng đếm bung tan ra 4 phía · tàu andrew trang bị thêm các khẩu súng bên hông để bắn cho nó chuẩn và hợp lý ·
các bức tường thật hơn một chút, đôi khi có chỗ bụi bẩn cho chân thực".
- `mau-1n-sung-hong-tuong-ban.html` + `core/mc3d-1n.js/.css` + `mc3d-ship-1n.js` (boom 1m, hatch 1j).
- Vòng đếm: SVG thêm 4 nhóm cung `.cd-shard` (trên/phải/dưới/trái: vạch + cung vàng + ngoặc), bình thường ẩn. Số 1 hiện 0,5 s thì
  `.is-burst`: vòng nguyên tắt, 4 mảnh bay 120 đơn vị ra 4 phía + xoay ±28° + tan (0,5 s), số 1 phóng to tan.
- Súng hông: 5 khẩu/bên ở bậc hông (x −0,33…0,19): đế tròn, tháp hộp + vòm, 2 nòng dài 0,05 có ống loe, mốc `tip`. `aimGuns` mỗi khung:
  toạ độ mục tiêu trong thân tàu ⇒ góc xoay ngang (kẹp chỉ quay ra phía ngoài mạn của mình) + góc ngẩng, xoay mượt; `fireFrom` chọn khẩu
  ở mạn có tàu con, gần theo chiều dọc, đang rảnh ⇒ đạn từ đầu nòng, giật nòng. Kiểm: các khẩu mạn có tàu con chĩa đúng vào nó (tích vô hướng 1,00).
- Tường: `grime()` chèn shader vào vật liệu chuẩn (tường 1 · cột 0,9 · nắp 0,45), theo toạ độ thế giới: mảng bẩn loang thỉnh thoảng,
  đọng chân tường, vệt chảy, bụi mặt ngang, đường ghép ngang (0,92) + dọc (mỗi 2), hạt sần; chỗ bẩn nhám hơn.
- Kiểm (chạy thật): trung bình 7,0 ms/khung, chỉ khựng lúc câu hỏi to như cũ · tự chơi 9/9 · 0 lỗi.

## 19. MẪU 1o (29/9) — INTRO ĐIỆN ẢNH, 3 bản để chọn (A hạm đội đến · B thả robot · C báo động đỏ)
Thầy: "cần một đoạn intro thật đẹp, ngầu, điện ảnh giống như cách làm intro của Rocket race. Hãy làm cho tôi vài bản để tôi chọn."
Cách Rocket Race (AWord rr3d-launch.js): màn chờ ⇒ START ⇒ cảnh điện ảnh ⇒ hoà thẳng vào game ở đúng góc máy; chạm đúp để bỏ qua.
- 3 trang `mau-1o-a-intro-ham-doi-den.html` · `mau-1o-b-intro-tha-robot.html` · `mau-1o-c-intro-bao-dong-do.html` (tham số `intro`, hoặc
  `?intro=a|b|c`) + `core/mc3d-1o.js/.css` + `mc3d-intro-1o.js` (MỚI) + `mc3d-sound-1o.js` (tiếng intro) + `mc3d-ship-1o.js` (chế độ `cine`).
- Intro chạy NGAY TRONG cảnh game (phase "cine"): cùng trạm, tàu, robot, nắp boong, bom nổ… ⇒ kết thúc đúng góc `overview` của game rồi
  `startGame()` (câu hỏi đầu). Chỉ nút START ở màn chờ chạy intro; "Start again" không. Bấm/chạm ĐÚP ⇒ `intro.skip()`.
- Máy quay: `cineCam {pos, look, fov, roll}` (updateCamera ưu tiên, có rung `shake`). Tàu: `fleet.cine.begin(scale)/set/aim/fire/end`
  (A phóng to ×3,2 = dài 150, B ×2,2); lửa/lưỡi lửa/khói/chữ/súng dùng chung `hunterFx`.
- Tường: `walls.flat/rise/sink` + `front(ox, oz, dist)` (mặt sóng — tường trong bán kính dist đã dựng, 5 đơn vị kế tiếp đang bật lên).
- A: 0–3,6 s tàu lướt qua đầu máy quay; 3,6–7,2 lướt dọc thân; 7,2–11,4 lao xuống lướt sát mê cung (tường dựng từ ô xuất phát); 11,4 tên
  game đập vào. B: khoang đổ bộ (4 cánh vỏ bản lề đáy, chóp nón, loa hãm đỏ rực); rơi 3,8→6,6 s, nổ `boom.explode` + sóng bụi + dựng tường;
  vỏ bung, robot (`robot.set`) đứng dậy, chào; địch trồi qua nắp; cuối cảnh robot + khoang chìm xuống boong. C: `dim(0,06)` (chỉ đổi cường độ
  đèn có sẵn + `scene.environmentIntensity`), 8 đèn xoay đỏ (vật tự sáng + lưỡi sáng cộng màu), `pLight` có sẵn đổi đỏ đi theo máy quay;
  máy quay bay theo hành lang BFS từ góc xa tới ô xuất phát (nghiêng theo khúc cua, kẹp ±0,32), vọt lên, đèn bật lại chập chờn.
- Tiếng tự tổng hợp (kênh riêng `ibus`, bỏ qua là tắt sạch): braam, rumble, whoosh (lia trái↔phải), engine (tụt giọng), impact, riser,
  shimmer, siren, beep, thud, hiss, servo, clank, powerUp, heart, laser.
- Làm nóng: 2 khung đầu dưới MÀN ĐEN — `warmInGame + warmInGame2` + khoang/đèn xoay/hạt hiện tạm ⇒ khung ~0,4 s nằm trong màn đen.
- Kiểm (chạy thật): A trung bình 6,4 ms/khung, chỉ khựng dưới màn đen; B, C cũng vậy · bấm đúp bỏ qua ⇒ vào câu hỏi · tự chơi 9/9 · 0 lỗi.

## 20. MẪU 1p (29/9) — STAR LOOT: đổi tên game + intro cốt truyện hạm đội ANDREW CLASSES (thầy chọn bản A rồi đổi cốt truyện)
Thầy: robot thuộc hạm đội ANDREW CLASSES, ở tàu ANDREW CLASSES cùng đồng đội, tới căn cứ địch thu CHIẾN LỢI PHẨM (các từ đúng) · màn START
là thiên hà bao la, nhiều hành tinh, màu lung linh (chưa chạy gì) · "ANDREW STUDIO PRESENTS" · đổi tên game (thầy chọn **STAR LOOT** trong
4 gợi ý: WORD RAIDERS · GALAXY HEIST · STAR LOOT · WORD STRIKE FORCE) · hạm đội xuyên qua nhiều thiên hà, tìm trạm địch, thả robot (đơn 1,
Fight 2) · robot NHẢY khỏi tàu, bay bằng phản lực ở hộp sau lưng, lượn, bay vào phía dưới mê cung · góc quay sát boong, robot được đẩy
lên từ dưới sàn, máy quay lùi về góc chơi, bắt đầu game ở đó · mọi cảnh nối mượt từ lúc bấm START tới lúc chơi.
- `mau-1p-star-loot-intro.html` + `core/mc3d-1p.js/.css` + `mc3d-intro-1p.js` (MỚI) + `mc3d-sound-1p.js` (+warp, +jet) + `mc3d-ship-1p.js` (+`cine.power`, `cine.sc`).
- Màn chờ = khung đầu intro, đứng yên: hạm đội (tàu mẹ ×2 + 3 tàu hộ tống = bản sao `fleet.group.clone(true)`) đậu, lửa nhỏ, máy quay trôi
  chậm; trạm khuất sau lưng máy quay (nhìn về +z). Map câu 1 dựng SẴN ở màn chờ ⇒ lúc tới căn cứ không khựng.
- Bầu trời: SKY_SHADER thêm uniform uB0/uB1/uN1/uN2/uBand (mặc định = trời game); 4 bộ màu home · teal · ember · enemy. Cảnh vật: thiên hà xoắn
  (canvas 14.000 chấm theo tay xoắn) đi theo máy quay (vô cực) + hành tinh dải màu có vành/khí quyển, lỗ đen có đĩa bồi tụ (đứng yên ⇒ thị sai).
- Nhảy siêu tốc: 520 nét sáng quanh máy quay (LineSegments), dài + nhanh dần 0,9 s trước mốc, chớp trắng che chỗ đổi thiên hà (3,3 · 6,0 · 8,4 s).
- Tới căn cứ: tàu thoát siêu tốc lướt qua đầu máy quay, hãm dần, treo trên trạm; chữ TARGET LOCATED · ENEMY BASE · LOOT: WORDS DETECTED.
- Robot: cửa khoang dưới bụng tàu (2 lá trượt + lòng sáng); 12,2 s robot nhảy ra — đường Catmull-Rom (dựng LÚC NHẢY theo vị trí tàu thật):
  lượn ra ngoài ⇒ sát mép boong trước ⇒ luồn xuống dưới sàn. Dáng bay nằm rạp (body.rotation.x 1,05), lửa 2 miệng ba lô (hạt) theo trục
  "xuống" của thân. Máy quay bám sau lưng rồi ở lại trên boong, lướt tới ô xuất phát. `robotFree` ⇒ lõi không đè dáng. ⚠ lookAt lúc bay để lại
  góc x/z trên robot ⇒ lúc trồi lên quay lưng — phải `rotation.set(0, heading, 0)`.
- 15,2 s nắp mở, `appearPlayer` đẩy robot lên (mặt hướng máy quay); 16,5 s lùi về góc chơi, chữ STAR LOOT đập vào; 18,7 s `startGame({fromIntro})`:
  câu 1 dùng ĐÚNG map đã dựng (`firstMapOverride`, không `useMap` lại), không ẩn robot, `buildMaze` bỏ `appearPlayer`.
- Fight (game chưa có): `?robots=2` ⇒ đồng đội (makeAstronaut thứ 2) bay song song, trồi lên ô bên cạnh; vào game thì chìm xuống nắp.
- Làm nóng: lúc tải trang (máy quay còn ở góc game) `warmInGame + warmInGame2`, rồi 3 khung đầu mọi cảnh vật intro hiện dưới màn đen.
- Kiểm (chạy thật): trung bình 6,2 ms/khung, KHÔNG khung khựng nào từ lúc bấm START tới câu hỏi đầu · bấm đúp bỏ qua ⇒ câu hỏi đầu,
  robot đứng sẵn · tự chơi 9/9 · 0 lỗi.

## 21. MẪU 1q (29/9) — STAR LOOT: intro lỗ giun + cảnh báo ENEMY LOCATED + ba lô ANDREW TEAM
Thầy: màn START chỉ cần tên STAR LOOT + nút START tinh tế · bỏ tia sáng toàn màn khi đổi không gian — tàu bay chầm chậm ⇒ cảnh báo đã tìm
thấy đối tượng (ENEMY LOCATED · POSITION: tên act · TARGET: số từ vựng), hiện lâu để đọc ⇒ tàu lao lên, máy quay từ góc rộng chuyển ra ngay
sau tàu, xem tàu phóng qua vài lỗ giun (mỗi lần chói loà, ra vùng không gian khác, vẫn đẹp lung linh) ⇒ tới nơi: góc rộng, đáy tàu mở, robot
nhảy ra, đáy đóng, máy quay nhìn toàn cảnh robot bay xuống gầm maze ⇒ sát boong: robot trồi lên QUAY LƯNG (thấy ANDREW TEAM — đổi từ ANDREW
CLASSES) rồi quay mặt lại, lùi rộng ra, vào game · góc quay chuyển mượt và CHẬM.
- `mau-1q-star-loot-lo-giun.html` + `core/mc3d-1q.js/.css` + `mc3d-intro-1q.js` (MỚI); tiếng + tàu dùng lại `sound-1p`, `ship-1p`.
- Tham số mới `createMazeChase({ act })` ⇒ dòng POSITION (trang mẫu: "LSA2-S3.T2.P1-2"; thiếu thì dùng title). TARGET = số câu (mỗi câu 1 từ đúng).
- Màn START: ẩn kicker/sub/how bằng CSS (giữ phần tử vì lõi còn ghi chữ vào); chữ STAR LOOT to phát sáng "thở", nút START viền mảnh phát sáng.
- Mốc (giây): cảnh báo 3,9 ⇒ tắt 9,6 · tàu lao 9,4 · máy quay ra sau lưng 10,2 ⇒ 13,6 · lỗ giun 14,6 / 17,9 / 21,2 · bụng mở 23,8 · nhảy 24,9 ·
  bụng đóng 25,9 ⇒ 26,8 · xuống gầm 29,7 · trồi lên 30,8 · quay mặt 33,7 · lùi về góc chơi 35,2 · vào game 38,8.
- Lỗ giun: ShaderMaterial đĩa xoáy (log-polar, 2 lớp sóng, viền sáng, lõi trắng) + quầng Sprite; mở ra (uOpen) 2,7 s trước mốc, đặt ĐÚNG chỗ tàu sẽ tới
  (`shipZ(t)` giải tích); 0,7 s cuối sáng dần; mốc −0,1 s chớp trắng dài (`.cine-flash.long` 1,6 s); đổi trời + cảnh vật ở mốc +0,15 s (đang trắng).
- Tốc độ: bụi sao nhỏ (Points 360 hạt quanh máy quay) — KHÔNG còn vệt sáng toàn màn (bỏ hẳn LineSegments 1p).
- Tới nơi: máy quay sau lưng 0,9 s ⇒ lùi ra góc NGANG bên trạm (104,40,48 ⇒ 82,29,42) — đứng trước mặt thì tàu mẹ dài 94 đơn vị lướt sát máy quay.
- Robot: `robot.rise(speed, camPos)` quay lưng về máy quay; `robot.turn(k)` quay dần (pl.heading); đồng đội quay ngược chiều.
- ⚠ Khựng 70–80 ms lúc tới căn cứ (không có chương trình vẽ mới, không texture mới — trình duyệt chuẩn bị trạng thái vẽ lần đầu). Sửa: 3 khung
  đầu lúc tải vẽ thử đúng cảnh tới nơi (trời enemy, tàu mẹ + hộ tống treo trên trạm, máy quay sau lưng) dưới màn đen ⇒ hết.
- ⚠ Đo khung hình thật: đừng chạy lệnh khác cùng lúc (máy bận ⇒ khung 130 ms giả).
- Kiểm: bước từng khung 0 ⇒ 38,8 s không khung nào >16 ms (máy) · chạy thật trung bình 6,1 ms/khung · bấm đúp bỏ qua ⇒ câu hỏi đầu, robot đứng sẵn.

## 22. MẪU 1r (29/9) — STAR LOOT: màn chờ có tàu bay vào, lỗ giun mượt, robot chui vào gầm trạm, câu hỏi hiện lúc máy quay lùi
Thầy: mở game chưa có tàu, tàu từ từ bay từ góc màn vào chỗ đậu, chậm dần, máy quay vẫn tiến lên · bấm START vẫn động, chậm rồi mới tăng tốc
và đổi góc · lỗ giun chỉ to hơn tàu một chút, viền mờ do ánh sáng mạnh (không viền tròn rõ) · chui vào sáng chói dần, ra tối dần, mượt · bớt
giật lúc qua lỗ giun · tới đích: ENEMY LOCATED xanh lá nhấp nháy ở góc · sàn maze dày gấp 3 · tàu thả robot ở XA căn cứ · đơn thả 1 robot:
bay xuống sát maze, dừng một nhịp nhìn ngắm, hạ xuống gầm, từ từ chui vào · bỏ chữ STAR LOOT lúc lùi máy quay · robot quay mặt ⇒ máy quay
lùi thì câu hỏi đầu hiện luôn (thời gian lùi tính vào thời gian đọc) · bỏ chữ double tap to skip; bấm đúp ⇒ tới cảnh tàu vừa xuyên tới vũ trụ
đích và thả robot · ngón tay, ngón chân robot chi tiết hơn.
- `mau-1r-star-loot-chui-gam.html` + `core/mc3d-1r.js/.css` + `mc3d-intro-1r.js` (MỚI); sound/ship 1p.
- "Thời gian bay" c chạy liền từ màn chờ sang intro: tàu = chỗ đậu + trôi `70(1−e^(−c/30))` + đoạn bay vào `ARR0·(1−c/8,5)³` (hộ tống trễ
  0,7/1,2/1,7 s); máy quay = chỗ cũ + cùng độ trôi + tiến thêm. START lưu c0 = menuT ⇒ không giật.
- Lỗ giun: lòng bán kính 64 (tàu rộng ~56), mép `smoothstep` + quầng loang, KHÔNG vòng viền; hộ tống KHÉP sát đuôi (đội hình `tuck`) để lọt.
  Trắng loá = lớp `.cine-white` đặt độ mờ TỪNG KHUNG: tăng 1,3 s (smoothstep bình phương) ⇒ giữ 0,25 s ⇒ giảm 1,9 s; đổi vùng lúc trắng hẳn;
  bỏ rung máy quay; các lỗ giun cách 4,2 s (15,6 / 19,8 / 24,0).
- Tàu mẹ treo ở z 135 (xa trạm), góc rộng lùi xa (150,50,150) để thấy cả tàu lẫn trạm.
- Robot: `jetPose` (yaw lọc mượt, dáng nằm rạp ⇒ đứng dần) · F1 lượn 5,2 s chậm dần tới điểm lơ lửng trước mép trạm · F2 dừng 2,2 s ngó trái
  phải (máy quay sau vai) · F3 hạ xuống gầm 2,8 s (máy quay xuống dưới mặt trạm nhìn lên) · F4 chui lên CỬA GẦM 2,4 s (lòng tối + viền đèn +
  2 lá trượt mở/đóng; phần robot lọt vào bị mặt đáy sàn che ⇒ trông như chui vào thật) ⇒ máy quay vòng ra mép lên boong ⇒ trồi lên quay lưng.
- Sàn dày: `DECK_T = 3.6` (đáy + viền mép), giàn/pin mặt trời hạ theo. `ctx.deckBottom`, `ctx.teammate.cell()`.
- Trao cho game ở BACKOUT: intro gọi startGame (câu hỏi to hiện) rồi `tailing` — lõi vẫn gọi `intro.update` để lái máy quay tới hết đoạn lùi;
  câu 1 giữ hướng robot (nhìn ra máy quay). Start again / END GAME lúc đang lùi ⇒ `intro.abort()` (kiểm cả `tailing`).
- Bấm đúp ⇒ T = lỗ giun cuối + 0,15 s (đang trắng, mờ dần ra vũ trụ đích), các mốc trước đó đánh dấu xong không chạy.
- Tay: mu bàn tay + cổ găng + 4 ngón 2 đốt hơi co + ngón cái chìa ra trước. Ủng: 3 ngón bo tròn ở mũi + khớp ngón + đế gai + gót.
- Kiểm: intro ~51 s chạy thật trung bình 6,1 ms/khung, 1 khung 127 ms ngẫu nhiên (chạy lại không có) · bấm đúp đúng cảnh · tự chơi hết ván.

## 23. MẪU 1s (29/9) — STAR LOOT: ô xuất phát cố định, tàu không chúi/ngóc, NOT FOUND, robot vào gầm nhanh, bom chạm mới nổ, tường trung tính
Thầy: chỗ robot xuất phát có ô tròn luôn ở đó (xuất hiện xong đóng nắp vẫn còn) · vùng sai nháy NOT FOUND đỏ ở góc · không cho tàu cúi/ngước
(xấu), chỉ lắc lư ngang hợp lý; bấm START lúc nào thì tàu đi tiếp từ đó · sát lỗ ánh sáng tàu đột ngột tăng tốc · robot ra khỏi tàu mẹ vòng
ngay xuống dưới maze, bay thẳng vào chỗ chui lên, nhanh, không dừng ngắm · 2 tàu đuổi nhau bớt quành, có thể ra ngoài khung rồi vòng lại ·
robot phải chạm bom mới nổ · tường màu trung tính, vừa phải · bấm START là hiện thông tin định vị và tàu đi dần luôn.
- `mau-1s-star-loot-o-xuat-phat.html` + `core/mc3d-1s.js/.css` + `mc3d-intro-1s.js` + `mc3d-ship-1s.js` + `mc3d-hatch-1s.js` (sound 1p).
- Ô xuất phát: `hatches.fixtures([[x,z],…])` dựng nắp ĐÓNG cố định (đèn viền sáng mờ) ở ô xuất phát (+ ô đồng đội nếu Fight) mỗi lần `useMap`;
  nắp động `run()` trùng chỗ thì ô cố định tạm ẩn, xong hiện lại. Vòng vàng nét đứt cũ ẩn. ⚠ `ROBOTS` khai báo SAU lần `useMap` đầu ⇒ đọc thẳng URL.
- Tàu: hướng bay = đạo hàm đường đi NHƯNG `y = 0` (luôn nằm ngang) + lệch hướng 0,03 rad chòng chành + nghiêng cánh `sway` nhỏ; bỏ đoạn ngóc lên.
  Bay vào màn chờ thấp hơn (ARR0 y −60 ⇒ −18).
- Mốc: định vị 0,4 s · tàu đi 0,5 s · ANDREW STUDIO PRESENTS 6,1 s · máy quay ra sau lưng 4,2 ⇒ 7,8 · lỗ giun 10,6 / 14,8 / 19,0 · nhảy 22,6 ·
  vào gầm 26,0 ⇒ 27,6 · trồi lên 29,5 · câu hỏi 33,9 · hết 37,7 s.
- Vọt trước lỗ giun: 0,9 s cuối tàu tiến thêm 120·u³; máy quay KHÔNG vọt theo (trừ lại độ vọt) ⇒ thấy tàu lao vượt lên; lửa + tốc độ tăng.
- NOT FOUND: sau lỗ giun 1 và 2 (+1,0 s) chữ đỏ nháy ở góc (cùng chỗ ENEMY LOCATED), tắt 1,4 s trước lỗ giun kế.
- Robot: một đường cong từ bụng tàu ⇒ vòng xuống dưới ⇒ luồn dưới mép trạm ⇒ thẳng tới dưới cửa gầm (3,4 s) ⇒ chui lên 1,6 s. Máy quay bám sau
  lưng robot (lọc mượt nhưng nhanh) rồi chuyển xuống dưới gầm nhìn lên cửa.
- Bom: bỏ "địch định bước vào ô bom ⇒ nổ từ xa"; nay địch đi vào ô bom, tâm cách tâm bom < 0,3 ô (1,2 đv) mới nổ. Đo: nổ khi địch cách 1,27 đv.
- Tường: giữ sắc của bảng màu nhưng bão hoà ≤ 0,16, độ sáng tường 0,30–0,38 / nắp 0,38–0,46 / cột 0,24–0,30 (⚠ HSL phải tính theo
  `THREE.SRGBColorSpace` — mặc định three tính theo linear nên màu ra trắng bệch).
- Tàu rượt: góc quay mỗi khúc 1,0–1,45 rad (cũ 1,5–2,3), bán kính 0,62–1,22 NDC (>1 = ra ngoài khung), rượt 13–17 s.
- Kiểm: chạy thật cả intro 0 khung khựng · bấm đúp đúng cảnh · tự chơi hết ván.

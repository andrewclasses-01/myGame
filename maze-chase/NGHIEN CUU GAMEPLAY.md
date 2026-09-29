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

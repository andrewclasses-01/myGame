# GHI CHÚ DỰ ÁN — myGame

> Kho thiết kế game thử. Đọc `CLAUDE.md` trước. Mỗi chặng: ngày · bối cảnh · việc đã làm · quyết định · lỗi & cách gỡ. Cuối file: VIỆC ĐANG CHỜ.

## Chặng trước 26/9/2026 (tóm tắt từ git log)
Rocket Race Fight 3D: mẫu 1 (ngang điện ảnh), 2 (đuổi theo), 3 (quỹ đạo); thầy chọn 2b rồi tinh chỉnh tới **2i** (hàng nút kiểu game) — 2i đã đưa vào AWord (Đợt 392, 26/9/2026). Chi tiết từng mẫu: comment đầu mỗi `mau-*.html` + `AWord/web/templates/rocket-race/GHI CHU ROCKET-RACE.md` mục 26.

## Chặng 1 — 26/9/2026 · MẪU 4: màn chờ + intro "phóng từ mặt đất"
**Bối cảnh (thầy, kèm 2 ảnh Starbase: tháp giàn + tàu phóng giữa mây hơi; booster rơi trên biển lúc hoàng hôn):** "2 con tàu đang cùng ở trên mặt đất, trong 1 trung tâm nghiên cứu vũ trụ mặt đất, ở vị trí sẵn sàng phóng, gần bờ biển. Khi start thì 2 tàu phóng ra ngoài không gian và vào màn game, camera đuổi theo đuôi 2 tàu và vào màn game như khi start hiện tại". Thiết kế ở myGame trước.

**Đã làm:**
- `rocket-race/core/launch-site.js` (mới) — `createLaunch({ container, hull, rocketScale, onHandoff, onFps })`:
  - Cảnh: trời hoàng hôn shader (đỉnh xanh chạng vạng → hồng tím → chân trời cam đào, quầng + đĩa mặt trời thấp bên phải), mây mỏng ửng hồng sát chân trời, biển `Water` phản chiếu, đảo phẳng (cỏ khô + cát ven bờ), đầm nước trước mặt, dải đất xa; 2 bệ phóng (sân bê tông, bàn phóng khoét lỗ + 6 chân), 2 tháp giàn (4 cột, đai, giằng X) phía ngoài mỗi bệ + tay kẹp "đũa" dạng dầm giàn + tay tiếp nhiên liệu + cột thu lôi + đèn đỏ nhấp nháy; khu bồn nằm ngang trên giá, bồn đứng, bồn cầu, nhà xưởng cao (vách tôn sóng + cửa cuốn), nhà thấp, cột đèn, ống dẫn; bụi cây. Bóng đổ từ mặt trời thấp.
  - 2 tàu = đúng `makeRocket` của game (màu đội, vỏ `#a9b1bd`), đứng trên bệ; màn chờ: hơi lạnh xả trắng trượt dọc thân, máy quay trôi chậm dọc bờ bên kia.
  - START ⇒ 3-2-1 (HUD) → đánh lửa T=2,3 s (tay kẹp mở, đèn cam hắt lên tháp) → LIFTOFF T=3 s → mây hơi có khối (đỉnh sáng, bụng tối) tràn ngang 2 bên + vài cột cuộn lên + quầng lửa chân bệ → tàu tăng tốc → T=6,2 s máy quay chuyển xuống ĐUỔI THEO ĐUÔI (sau-dưới 2 đuôi) → T 8,2–15,5 s tàu nghiêng dần về −z và xích vào làn game (±2,3) → sương khí quyển dày + trời tối thành vũ trụ, sao hiện → T=16,2 s `onHandoff`.
- `rocket-race/core/rr3d-core.js`: `export makeRocket`; `cfg.hold` (màn game đứng chờ ở góc đuổi) + `beginPlay()`.
- `rocket-race/mau-4-phong-tu-mat-dat.html`: khung như 2i; màn game 2i dựng sẵn bên dưới ở `hold`, đóng băng (`step(1)`); hoà cảnh = mờ lớp phóng 0,9 s + `race.resume(); race.beginPlay()` ⇒ vào thẳng câu hỏi (đếm 3-2-1 đã làm trên bệ).

**Lỗi đã gặp & cách gỡ:** `Sky` three.js cháy trắng mảng tròn lớn (bỏ, tự viết shader) · normal map mẫu `waternormals.jpg` không có trên CDN r170 (404) ⇒ tự sinh tổng sóng sin lặp liền mép · mặt nước như kính vỡ (giảm `distortionScale` 0,4, `size` 3) · máy quay đuổi tụt lại (bám cứng) · biển lộ vân lặp từ trên cao (sương theo độ cao, trời sát chân trời hoà vào sương) · vệt khói thành cục (rải theo quãng đường) · mây hơi thành bức tường phẳng (hạt to hơn, độ sáng chênh 0,5–1,05, kết cấu đỉnh sáng bụng tối, không xoay quá ±25°).

**Đã kiểm (localhost 1600×900, lái `__launch.step`):** màn chờ · đánh lửa · rời bệ · đuổi theo đuôi · tối dần · hoà cảnh ⇒ `__race.state.phase = "play"`, câu hỏi + cột đáp án hiện đúng góc đuổi · bấm START thật chạy · 0 lỗi console.

## VIỆC ĐANG CHỜ
- ⬜ Thầy xem mẫu 4 trên máy thật / TOMKO rồi góp ý (hình khu phóng, mây hơi, nhịp máy quay, độ dài intro ~16 s, âm thanh — mẫu CHƯA có tiếng).
- ⬜ Duyệt xong mới đưa vào AWord (Rocket race Fight 3D): vendor `Water.js`, thay mở màn ANDREW CLASSES/ROCKET RACE/START hiện tại.

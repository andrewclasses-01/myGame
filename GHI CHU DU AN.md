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

## Chặng 2 — 26/9/2026 · MẪU 4b: nhìn TỪ TRÊN CAO, mặt đất như thật, biển hiệu ANDREW STUDIO
**Bối cảnh (thầy, kèm ảnh drone Starship lao lên giữa mây khói nâu, bên dưới bờ biển/đụn cây/đầm):** "Thiết kế vẫn còn quá xấu. Tạo cảnh 2 tàu ở vị trí và góc nhìn như hình này, cảnh xung quanh chi tiết, chân thực từ gần đến xa. Trên mặt đất có chữ ANDREW STUDIO như biển hiệu công ty ngoài đời thật, thay cho ANDREW CLASSES".

**Đã làm:**
- `tools/tao-dia-hinh.py` (mới; cần `pip install numpy pillow scipy`, chạy ~5 phút): nhiễu giá trị bậc 3 trên lưới ngẫu nhiên cố định (`map_coordinates`, `grid-wrap`) ⇒ mọi lớp là HÀM THEO TOẠ ĐỘ THẾ GIỚI ⇒ tấm toàn cảnh 4096² (±240 đv) và tấm khu phóng 4096² (±64 đv) khớp liền. Lớp: bờ biển chéo tây bắc–đông nam (toạ độ vặn) · biển nông→sâu + 5 dải bọt sóng kéo dài dọc bờ đứt quãng tự nhiên · cát khô / cát ướt / vết sóng rút · đụn + cây bụi (mật độ theo vùng lớn, bụi lấm tấm theo cụm, 3 tông xanh xám/ô liu/nâu khô, lối mòn mảnh) · đầm lầy tây nam (nước xám lam, bãi bùn, doi cát, lạch hình nhánh) · khu san phẳng sỏi (vệt ẩm) · đổ bóng đụn nướng sẵn. Khu phóng vẽ bằng PIL: sân bê tông ron mờ + vết dầu, đường nhựa vạch vàng/trắng, bãi xe + ô tô, vết bánh xe, vết cháy loang quanh 2 bệ. Ra `rocket-race/assets/` (albedo, normal, mask nước R/G/B, site).
- `rocket-race/core/launch-aerial.js` (mới): mặt đất = 2 tấm ảnh (tấm khu phóng mờ mép) + mặt nước động (shader theo mặt nạ: gợn, lấp lánh nắng, bọt sóng chạy vào bờ) + biển ngoài rìa; công trình 3D (tháp giàn có sàn/lõi/nhà tời/cột thu lôi + tay kẹp dầm giàn mở ra lúc đánh lửa, bàn phóng vòng + 20 ngàm + 6 chân + tấm chắn lửa, cột đèn pha, khu bồn inox đứng/nằm/cầu + giàn ống, nhà xưởng lớn mái in chữ ANDREW STUDIO + logo, mặt tiền chữ ANDREW STUDIO + cửa cuốn, nhà kho mái tôn cửa trời, BIỂN HIỆU CỔNG tường đá chữ inox + logo + đèn hắt + bồn cây, 900 bụi cây 3D); nắng chiều từ tây bắc (khớp hướng bóng nướng trong ảnh), bóng đổ 4096.
  - Mây khói: hạt `billowTex` (nhiều bướu mềm sáng trên-trái tối dưới-phải), màu nâu vàng chênh sáng 0,45–1, ỬNG CAM theo khoảng cách tới chân bệ (shader, `uFire`), vẽ XA→GẦN (sắp chỉ số mỗi khung).
  - Máy quay: màn chờ flycam bay vòng chậm (thấy 2 bệ, mái chữ, biển) → START: bay tới góc DRONE nhìn xuống (0,5; 40; 13) → 3-2-1 → tàu lao lên về phía máy quay → khi tàu VỤT QUA độ cao máy quay (`passT`), máy quay luôn nhìn vào tàu và trượt ra sau đuôi → tàu nghiêng ngang trong 6,5 s → tối dần → hoà cảnh (passT + 7,4 s ≈ 16 s sau START).
- `rocket-race/mau-4b-phong-nhin-tu-tren.html`: như mẫu 4 nhưng dùng `launch-aerial.js`, bỏ chữ ANDREW CLASSES (biển hiệu ANDREW STUDIO dưới đất thay).

**Lỗi đã gặp:** tấm khu phóng trong suốt (renderOrder 1) vẽ SAU mây ⇒ đè mất mây (hạt phải renderOrder ≥ 5) · lúc tàu vụt qua máy quay mất dấu tàu (phải nhìn thẳng vào tàu trong suốt đoạn chuyển) · trình duyệt giữ ES module cũ ⇒ `fetch(url, {cache:'reload'})` rồi mới tải lại · ảnh chụp khung xem trước đứng hình ⇒ tự chép `toDataURL` ngay sau `step()` · mây vẽ bằng arc viền cứng thành "bong bóng" ⇒ gradient tới trong suốt.

**Đã kiểm (localhost 1600×900):** flycam · góc drone lúc phóng (mây nâu ửng cam, 2 tàu lao lên) · vụt qua · đuổi đuôi · vũ trụ · hoà cảnh ⇒ `__race.state.phase = "play"` · khung ~8 ms với 4.200 hạt mây sắp thứ tự · 0 lỗi console.

## VIỆC ĐANG CHỜ
- ⬜ Thầy xem MẪU 4b trên máy thật / TOMKO rồi góp ý (độ "như thật" của mặt đất/mây, bố cục khu phóng, biển hiệu ANDREW STUDIO, nhịp máy quay). Mẫu 4 giữ để so sánh. Cũ: thầy xem mẫu 4 rồi góp ý (hình khu phóng, mây hơi, nhịp máy quay, độ dài intro ~16 s, âm thanh — mẫu CHƯA có tiếng).
- ⬜ Duyệt xong mới đưa vào AWord (Rocket race Fight 3D): vendor `Water.js`, thay mở màn ANDREW CLASSES/ROCKET RACE/START hiện tại.

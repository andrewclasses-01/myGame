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

## Chặng 3 — 26/9/2026 · MẪU 4c: mở đầu kiểu ảnh nhà xưởng SpaceX · START mới lại gần · sao + NHẢY TỐC ĐỘ · sửa nhấp nháy
**Bối cảnh (thầy, kèm ảnh drone nhà xưởng SpaceX, bệ phóng ở xa):** "Để khu vực phóng ra xa, cảnh ban đầu tương tự ảnh này. Khi bấm START mới chuyển góc quay gần về khu 2 tàu. Góc chuẩn bị phóng không cần quá cao, như màn chờ START hiện tại" · "Có hiện tượng nhấp nháy, cần fix" · "Khi camera đuổi vào đuôi, nhìn lên trời phải lốm đốm vài ngôi sao, sau đó dùng hiệu ứng tăng tốc vượt thời gian để nối liền vào màn chơi".

**Đã làm:**
- `tools/tao-dia-hinh.py`: đồng cỏ nội địa XANH (cỏ + cỏ úa, bụi thẫm), ao hồ nội địa (`pond`, viền bùn chỉ trên đất liền), khu công ty = BÃI CỎ cắt tỉa có vệt máy cắt, chỉ quanh 2 bệ + khu bồn là sỏi (`pad`); tấm chi tiết mở rộng ±80; sơ đồ mới: vành đai khu phóng, trục bệ → nhà xưởng, trục đông–tây z = 32, đường cổng vào phía nam x = 14, đường vòng cong phía tây, sân nhà xưởng lớn (−44…−2, 36…56), bãi xe 3 dãy, sân 2 nhà phụ, hàng rào trắng có cọc.
- `rocket-race/assets/4b/` giữ bộ ảnh cũ cho mẫu 4b (`launch-aerial.js` trỏ vào đó) — bộ ảnh mới ở `assets/` cho 4c.
- `rocket-race/core/launch-aerial-c.js` (sinh từ `launch-aerial.js` bằng script vá): nhà xưởng 34 × 16 × 11 tường tôn trắng, mái dốc xanh xám, mặt nam chữ ANDREW STUDIO xanh đậm + logo, cửa cuốn đầu hồi đông, dãy nhà phụ thấp, mái hắt tây, máy lạnh mái; 3 nhà phụ trắng mái xanh; biển hiệu cổng dời cạnh đường cổng vào; 1.600 bụi/cây quanh khu công ty; trời xanh hơn + 40 mây tích trắng sát chân trời (mờ dần khi bay lên); biển ngoài rìa cùng màu biển sâu trên ảnh.
  - Máy quay: màn chờ = flycam phía tây nam nhà xưởng nhìn qua mái về 2 bệ ở xa (như ảnh); START ⇒ 4,2 s bay tới góc chờ phóng GẦN 2 tàu, cao vừa (−7; 24; 46) → đánh lửa 5,0 s → rời bệ 5,8 s → tàu vượt độ cao máy quay (`passT`) → đuổi đuôi.
  - Sao: 260 ngôi sao SÁNG hiện từ passT + 0,3 s (trời còn xanh thẫm), sao mờ theo độ tối trời.
  - NHẢY TỐC ĐỘ (`warp`): 1.400 vệt thẳng trong không gian máy quay lao về phía máy quay (tốc độ 40 → 940 đv/s, dài 0,5 → 70 đv, chừa tâm bán kính 7 để không che 2 tàu), nới góc nhìn 38° → 62°, loé sáng (phơi sáng tăng vọt quanh lúc hoà cảnh), hoà cảnh passT + 5,7 s; sau hoà cảnh vệt chậm lại + góc nhìn trả về 38° trong 0,9 s mờ dần.
  - NHẤP NHÁY: composer vẽ vào render target MSAA 4 mẫu (mặc định không khử răng cưa ⇒ thanh thép/hàng rào mảnh lấp loá khi flycam trôi) · camera near 0,5 / far 20.000 · tấm khu phóng y 0,05, mặt nước y 0,09 · đốm nắng trên nước bớt nhọn (mũ 70) + tắt dần theo khoảng cách (đốm nhỏ hơn 1 điểm ảnh nhấp nháy).
- `rocket-race/mau-4c-nha-xuong-nhay-toc-do.html`.

**Lỗi đã gặp:** chèn ghi chú `//` giữa một dòng JS dồn nhiều lệnh ⇒ phần sau thành ghi chú ⇒ SyntaxError, trang kẹt LOADING (bài học: ghi chú giữa dòng dùng `/* */`) · nhà xưởng che mất 2 bệ ở góc flycam đầu tiên ⇒ dời flycam sang tây nam.

**Đã kiểm (localhost 1600×900):** flycam (nhà xưởng tiền cảnh, 2 bệ ở xa bên phải, biển hiệu cổng) · góc chờ phóng gần · mây khói lúc rời bệ · đuổi đuôi có sao lốm đốm · nhảy tốc độ · hoà cảnh ⇒ `phase = "play"` · mẫu 4b vẫn chạy với `assets/4b/`.

## Chặng 4 — 26/9/2026 · TẠM CHỐT intro mẫu 4c (thầy: "tạm chốt đến đây… để tôi tiếp tục build phần intro này và ghép vào game thật trên AWord sau")
Bản dùng tiếp: **mẫu 4c** = `rocket-race/mau-4c-nha-xuong-nhay-toc-do.html` + `rocket-race/core/launch-aerial-c.js` + `rocket-race/assets/*` (sinh bằng `tools/tao-dia-hinh.py`). Mẫu 4 / 4b giữ để so sánh (4b đọc `assets/4b/`). Live: https://andrewclasses-01.github.io/myGame/rocket-race/mau-4c-nha-xuong-nhay-toc-do.html

**Kế hoạch ghép vào AWord (Rocket race ▸ Fight 3D) — làm khi thầy nói "ghép":**
1. Chép `launch-aerial-c.js` → `AWord/web/templates/rocket-race/rr3d-launch.js`; đổi `import "three"` / `three/addons/*` sang `./vendor/three/…` (như `rr3d-view.js`); ảnh `assets/*` → `templates/rocket-race/launch/` (≈ 5 MB — cân nhắc thu tấm toàn cảnh xuống 2048² cho máy yếu; TOMKO 4K giữ 4096²).
2. `makeRocket` của AWord ở `rr3d-view.js` KHÁC bản myGame (bản AWord mới hơn: xác tàu dựng sẵn, `material.fog`…) ⇒ xuất `makeRocket`/`TEAMS` từ `rr3d-view.js` và cho intro dùng đúng bản đó (tàu hai cảnh phải giống hệt).
3. Thay mở màn hiện tại (ANDREW CLASSES → ROCKET RACE → START + đếm 3-2-1 trong `rr3d-view.js`, `introTitles`, `countStep/go` do `rocket-race.js` giữ nhịp) bằng: cảnh phóng phủ lên canvas 3D trong `.aw-rr3d-canvas` (hai renderer, lớp trên mờ dần khi hoà cảnh — đúng cách mẫu làm). ⚠️ Nhịp đếm 3-2-1 của AWord do TEMPLATE giữ (khớp đồng hồ trận/trọng tài): nút START của intro phải gọi `play()` của fightScene (bấm hộ Play bàn 0) vào đúng lúc hoà cảnh, hoặc cho `countStep` chạy trong lúc tàu trên bệ — cần quyết khi ghép (đọc `rr3dScene` + `core/fight.js` `fightScene`).
4. Màn game vào thẳng góc đuổi khi hoà cảnh — tương đương `cfg.hold` + `beginPlay()` của lõi myGame (AWord: view đã có pha `intro/start/count/play`; thêm pha "chờ intro").
5. Âm thanh intro (chưa có): tiếng đếm (ting có sẵn), đánh lửa + gầm rền, gió khi bay, "vút" nhảy tốc độ — làm qua `rr3d-sfx.js` / `tools/rr3d-tao-am-thanh.py`.
6. Dọn: `destroy()` phải huỷ cả renderer intro (rời trang giữa intro — lưới `watchRoiTrang` của core/fight.js đã gọi teardown ⇒ `sceneHandle.destroy()`).
7. Kiểm: TOMKO 86" 4K (60 fps với 4.200 hạt mây sắp thứ tự + bóng 4096 — nếu tụt thì bóng 2048, hạt 2.500), nhấp nháy, iPad bật (intro vẫn chỉ trên màn chính), Start again / Apply không chạy lại intro dài (chỉ lần đầu? — hỏi thầy).

**Chưa làm / thầy chưa duyệt hẳn:** âm thanh · độ "thật" của công trình (khối 3D gọn) · nhấp nháy trên màn thật (máy soạn không thấy sau MSAA) · nhịp nhảy tốc độ.

## Chặng 5 — 26/9/2026 · MẪU 4d "bản đồ như ảnh" (thầy gửi lại ảnh nhà xưởng SpaceX 39A: "bản đồ thiết kế lại để thực sự giống như trong hình ảnh này")
Bản mới (4c giữ nguyên): `rocket-race/mau-4d-ban-do-nhu-anh.html` + `core/launch-aerial-d.js` + `assets/4d/*` (sinh bằng `tools/tao-dia-hinh-4d.py`, ~6 phút).
- Bố cục CHUNG một chỗ: `assets/4d/layout.json` (nhà xưởng tâm/góc/kích thước, bãi xe, đường, dốc, gò bệ, đầm, đồng cỏ, rào, nắng) — Python vẽ mặt đất, JS dựng 3D từ cùng file ⇒ sửa bố cục thì sửa JSON rồi chạy lại tool.
- Theo ảnh: máy quay trên cao phía TÂY NAM nhìn về bắc (`IDLE` pos −95,28,128 → −86,3,26; góc rộng `idleFov` 46°, thu về 38° khi bay tới bệ). Nhà xưởng 30×15×9 tường tôn trắng, mái 2 dốc rất thoải xanh xám (sóng từ diềm lên nóc), chữ ANDREW STUDIO nghiêng xanh đậm (Exo 2 italic 900) + logo tròn chỗ lá cờ, cửa lớn đầu hồi + tấm cửa nâng chéo, dãy nhà phụ thấp dọc chân. Bãi xe ~150 ô tô 3D (InstancedMesh thân + cabin kính). DỐC = nền đắp 3D cao dần (0,14 → mặt gò) 2 làn + dải cỏ. GÒ bệ cao `PY` 1,6 (mọi thứ của bệ trong nhóm `padG`; tàu/mây/lửa/đèn cộng PY). Rừng bụi Florida xanh thẫm, đầm xanh dài, mái vòm trắng, tháp nước, biển; trời xanh + 70 mây tích rải rác.
- Tấm chi tiết 6144² phủ x[−150,40]×z[−50,140] (~32 điểm/đv) + hạt mịn theo toạ độ thế giới (`microGrain`, tắt dần theo `fwidth`). Khung bóng nắng ±100 quanh (−48,42) phủ cả nhà xưởng lẫn gò.
- Chỉnh góc máy nhanh: `?cam=x,y,z&look=x,y,z&fov=46`.
- Bẫy: lửa đánh lửa hắt lên mặt gò bê tông SÁNG ⇒ cháy trắng cả khung (đèn 700 → 260, mặt gò tối hơn). Python đọc heredoc bằng cp1252 ⇒ chạy `python -X utf8`; file JS là CRLF.

## Chặng 6 — 26/9/2026 · MẪU 4e "nối game mới nhất" (6 ý thầy)
`rocket-race/mau-4e-noi-game-moi.html` + `core/launch-aerial-e.js` (bản đồ/ảnh vẫn `assets/4d/`).
1. CÂY: tán = thẻ lá (ảnh chùm lá vẽ canvas, `alphaTest` + `alphaToCoverage` trên render target MSAA), pháp tuyến hướng ra từ tâm tán (vá `normal_fragment_begin` bỏ lật mặt sau), trong tán tối hơn; 3 loại InstancedMesh: sồi 8000 · cọ lùn lá quạt 6000 · thông 900; bóng đổ cắt theo lá.
2. Đếm 3-2-1: máy quay trôi VÒNG quanh bệ (`ORB`, 0,06 rad/s) + tiến vào 12 % + nhấp nhô — không lúc nào đứng yên.
3. Sau 3-2-1: tàu tăng tốc nhanh hơn (4,5 → 11) ⇒ vượt máy quay ~2,7 s; vòng ra sau đuôi 1,7 s; nhảy tốc độ ở +2,4 s; hoà cảnh +3,9 s ⇒ ĐO: vào game 6,6 s sau LIFTOFF (trước ~10–11 s). Chốt an toàn: +3,2 s chưa vượt cũng chuyển.
4. ANDREW STUDIO mờ (alpha 0,24, chữ nghiêng + logo) sơn trên mặt gò, dải phía bắc sau 2 bệ.
5. Nhấp nháy xanh = ĐÁNH NHAU ĐỘ SÂU ở xa (nền ngoài rìa màu xanh sát dưới đất 0,06; lớp nước sát trên 0,09; near 0,5): near 1,5, nền ngoài −3, nước 0,25. (Bàn thử máy soạn không thấy nhấp nháy — ⬜ thầy xác nhận trên TOMKO.)
6. NỐI GAME MỚI NHẤT: `tools/chep-game-aword.py` chép `rr3d-view.js` (import → importmap, xuất thêm `makeRocket`), `rr3d-sfx.js` + `sfx/`, font, và hàm `RR3D_CFG` của rocket-race.js vào `rocket-race/aword/` + `NGUON.json` (mã commit AWord, hiện ở bảng thử). Lần chép đầu: AWord `3964391` (Đợt 396+397). Game dựng với `introTitles: [], startAt: 0, startHidden: true` ⇒ pha "wait" ở góc đuổi, không mở màn/START thứ hai; hoà cảnh ⇒ `nextRound()` + `view.go()`; tiếng chỉ bật sau hoà cảnh. Luật chơi trong trang là BẢN THỬ gọn (L=5, đúng trước ăn câu, sai khựng, 3 đúng liền TURBO, về đích `view.win` → `resultView`). Tàu intro = `makeRocket` của bản AWord.
⚠️ AWord có Đợt Rocket Race mới ⇒ chạy lại `python -X utf8 tools/chep-game-aword.py`.

## Chặng 7 — 26/9/2026 · MẪU 4f "bãi xe + bầu trời" (thầy: 4e "rất ổn rồi")
`rocket-race/mau-4f-bai-xe-bau-troi.html` + `core/launch-aerial-f.js`.
- BÃI XE: mặt nhựa là ẢNH RIÊNG 80 điểm/đv (canvas) phủ lên đất theo khung trục nhà xưởng (`lotG`): hạt đá, mảng vá, vết nứt, vạch ô, vết dầu, 3 ô ♿ xanh, 4 ô ⚡ sạc xanh lá, mũi tên chiều đi, chữ ANDREW STUDIO ở lối cuối, vạch dừng + vạch đi bộ ở 2 lối vào; bó vỉa 3D (chừa 2 lối vào), đảo cỏ đầu mỗi dãy + cây sồi nhỏ (`extraTrees` → khối CÂY trồng trước) + cột đèn tay vươn.
- XE: 5 mẫu (`MODELS`: lambo · porsche · ferrari · suv G-class · sedan S-class, tỉ lệ 14/18/13/25/30 %), đơn vị mét × `SC` 0,3. Thân = ExtrudeGeometry dáng hông (spline nóc + vòm bánh `absarc`) có vát mép, thu hẹp cabin theo độ cao (`taper`) + vuốt mũi/đuôi; bậu cửa/cản dưới đen bằng màu đỉnh; kính = dáng cabin phóng 4 % quanh tâm + rộng hơn thân ⇒ nổi ra ngoài; tấm nóc cùng màu; đèn pha/hậu phát sáng gắn đúng mép thân (`edgeX`); lốp + mâm 5 chấu (ảnh canvas, cùm phanh đỏ); bóng tiếp đất; sơn MeshPhysical clearcoat. InstancedMesh theo mẫu × bộ phận. 70 % xe lùi vào ô (mũi ra lối đi).
- TRỜI: dải màu 3 nấc (chân trời → giữa → đỉnh) + đĩa/quầng nắng. MÂY = 2 lớp shader trên mặt phẳng cao đi theo máy quay (tích ở 430, ti kéo dài ở 1150): fbm uốn miền, sáng tối theo hướng nắng, mép mỏng sáng/lõi xám, xa mờ vào chân trời, trôi theo gió; mờ dần khi bay vào vũ trụ (`clouds2`). Bỏ mây ảnh dán.
- CHIM: 6 đàn (41 con; có hải âu trắng ven biển), thân + 2 cánh gãy khúc, đập cánh/lượn trong shader (`aPhase`), bay vòng + nghiêng vào vòng (`birds.update`).
- Đo: vẫn vào game 6,6 s sau LIFTOFF; 0 lỗi.

## Chặng 8 — 26/9/2026 · MẪU 4g "logo cân đối"
`mau-4g-logo-can-doi.html` + `core/launch-aerial-g.js`. Thầy: logo + chữ nhà xưởng "chưa đẹp và cân đối"; chữ nền bệ đưa ra phía trước (thầy chọn GIỮ chữ ANDREW STUDIO).
- `drawEmblem` (huy hiệu tròn mực xanh, viền trắng, tên lửa trắng mũi đỏ chếch 45° + lửa, quỹ đạo quấn trước/sau) + `drawLockup` (huy hiệu + ANDREW STUDIO nghiêng + gạch chân đỏ, tự thu cỡ theo maxW) — dùng chung cho tường nhà xưởng (giữa bề ngang, 31 % chiều cao — trên dãy nhà phụ) và nền bệ.
- Nền bệ: rãnh thoát lửa chuyển ra SAU (bắc); cụm chữ ở z = +7,4 (trước 2 tàu, hướng máy quay), alpha 0,42.

## Chặng 9 — 26/9/2026 · MẪU 4h "logo cũ cân đối"
Thầy: "trả về góc nhìn camera của bản trước và logo của bản trước, chỉ điều chỉnh logo cân đối hơn chứ không thay đổi".
- Góc máy: code 4f/4g/4h GIỐNG HỆT (đã diff) — khung xem trước của Claude đang để `?cam=` soi cận nhà xưởng nên thầy tưởng đổi. ⚠️ Soi xong nhớ mở lại trang KHÔNG tham số.
- `mau-4h-logo-cu-can-doi.html` + `core/launch-aerial-h.js`: logo CŨ (vòng viền + mũi tên đỏ), chữ nghiêng cũ, bỏ gạch chân; `drawLockup` chỉ căn: vòng cao ≈ 1,6 lần chữ hoa, tâm vòng = giữa chữ, khe 0,55 chữ, cụm căn giữa tường (31 % chiều cao, rộng ≤ 72 %). Nền bệ giữ vị trí trước 2 tàu (như 4g) với cùng cụm logo cũ.
- ⛔ Bài học: thầy nói "cân đối hơn" = GIỮ thiết kế, chỉ căn chỉnh — đừng vẽ logo mới.

## VIỆC ĐANG CHỜ
- ⬜ Thầy xem mẫu 4h trên TOMKO.
- ⏸ TẠM CHỐT intro ở mẫu 4c (26/9/2026) — thầy sẽ build tiếp + ghép vào AWord sau; kế hoạch ghép ở Chặng 4.
- ⬜ Thầy xem mẫu 4c trên máy thật / TOMKO: nhấp nháy còn không, nhịp nhảy tốc độ, bố cục nhà xưởng / khu phóng.
- ⬜ Âm thanh intro.

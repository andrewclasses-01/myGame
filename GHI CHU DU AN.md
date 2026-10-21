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

## Chặng 10 — 26/9/2026 · MẪU 4i "âm thanh intro"
`mau-4i-am-thanh.html` + `core/launch-aerial-i.js` (thêm `cfg.onTick({phase,t,T,passT,handed})` mỗi khung) + `core/intro-sound.js` (Web Audio) + `assets/sound-intro/*.ogg|mp3` (tool `tools/tao-am-thanh-intro.py`, ~30 s, tự tổng hợp numpy/scipy — không bản quyền).
- Thầy: không nhạc nền; màn chờ = tiếng nhà máy nhỏ + chim hót + gió buổi sáng; phóng = động cơ rú thật lớn, khói, tàu vận hành.
- Nền lặp liền (trộn đè đuôi vào đầu; đo chỗ nối ≈ bước mẫu thường): wind (gió giật + huýt + lá) · factory (ù điện 50 Hz, quạt, máy dập 1,6 s, xì khí nén 3,2 s, kim loại lách cách, băng chuyền 7 Hz — lọc tối + vọng như TRONG nhà xưởng) · birds (4 kiểu: chíp, láy, huýt có rung, líu lo FM; xa gần, trái phải) · vent · roar.
- Phóng: ignite (nổ đanh + bùng 58→26 Hz + gầm dâng sáng dần) · steam · roar (rền + gầm dải trung + "rú" rung 17 Hz + LÁCH TÁCH xung Pareto, bão hoà tanh) · flyby (đổi tần kiểu Doppler + lia trái→phải) · warp (dâng vút → "thoom" ở 1,5 s đúng lúc hoà cảnh → lấp lánh).
- ⚠️ Bẫy: chuẩn hoá theo ĐỈNH làm gầm nhỏ (–23 dB, vài xung lách tách quyết định âm lượng) ⇒ `loud()`: kéo RMS lên mức đích rồi nén đỉnh tanh (gầm –12,5 dB). Gầm từng dồn 88 % dưới 150 Hz (loa TV nghe lép) ⇒ thêm dải trung.
- Nhịp tiếng theo TRẠNG THÁI cảnh (không đồng hồ riêng): màn chờ 3 lớp · START ⇒ xì hơi · T.ign ⇒ đánh lửa + khói + gầm dâng tới đỉnh lúc rời bệ, nền lùi xuống · passT ⇒ vút qua, gầm tối/xa dần, nền tắt · T.warp ⇒ nhảy tốc độ · hoà cảnh ⇒ `end()` tắt dần, đóng AudioContext. Chặn đỉnh DynamicsCompressor ở master. Đo trên bàn thử: ign 5,0 s · pass 8,5 s · warp 10,9 s · hoà cảnh 12,6 s.
- Trình duyệt chặn tiếng tới cú chạm đầu ⇒ màn chờ có tiếng từ cú chạm/phím đầu (TOMKO/Electron thường mở sẵn). Nút bảng thử 🔊 bật/tắt tiếng intro.
- ⛔ Claude KHÔNG nghe được — chỉ kiểm bằng số đo (độ to, dải tần, chỗ nối, mốc phát).

## Chặng 11 — 26/9/2026 · MẪU 5 "game hoàn chỉnh" (thầy chọn dựng ở myGame trước, OK rồi mới ghép AWord)
`mau-5-game-hoan-chinh.html` + `core/launch-aerial-5.js` + `core/intro-sound-5.js` + `assets/sound-5/` (tool `tools/tao-am-thanh-5.py`, gọi lại bộ tổng hợp của `tao-am-thanh-intro.py`) + GAME RẼ NHÁNH `rocket-race/game5/` (chép từ `aword/` rồi sửa — KHÔNG bị `chep-game-aword.py` ghi đè).
- TÀU LIỀN MẠCH: tàu intro = makeRocket/DEFAULT_TEAMS của game5; game dựng với `introCamera: null` (⛔ bẫy: góc mở màn của RR3D_CFG làm máy quay game đứng TRƯỚC mũi tàu ⇒ 2 đội ĐẢO trái/phải lúc nối); cuối intro fov về 38°, lửa thu về cỡ lửa game; CẮT TỨC THÌ ở đỉnh chớp sáng (`#launch` display:none + lớp `#flash` trắng tan 0,75 s). ĐO lúc cắt (toạ độ màn hình −1…1): tàu xanh intro (−0,198; −0,269) = game (−0,199; −0,270); tàu vàng lệch 0,02 (lắc nhẹ của game); cùng cỡ 0,094.
- Tiếng: `startboom` (bùm nhỏ khi bấm START, có thân dải trung cho loa TV) · `tuc` ×3 ở T.lift −2,7/−1,8/−0,9 · `warp` làm lại THẬT: tiếng vang ĐẢO NGƯỢC hút vào + luồng khí dồn → nổ áp suất trầm + xé gió + dư chấn (bỏ sin quét/lấp lánh) · game `sfx/stall.mp3` = động cơ nổ khục "giắt giắt" (thay tiếng khựng có kim loại nghe như chuông).
- Game5: đội 2 `#ffc21a` VÀNG (tàu + ô) · ô sai không dấu ✗ (chỉ đỏ + rung) · `dodge.rocks:false` (không thêm đá vào cảnh, vẫn tính né ⇒ lượn chao) · `portalVanish`: tâm tàu thắng vượt mặt cổng ⇒ ẩn tàu + lửa, `portalFlash()` (quả cầu sáng nở, vòng sóng, đèn chớp 900, 120 tia, rung nhẹ, tiếng portal + boomlow). Đo: ván tự chơi tàu thắng biến mất ở p 5,82 (L=5), cảnh kết chạy tiếp; 0 lỗi.
- ⬜ Khi thầy OK: mang các sửa của game5 sang AWord (rr3d-view.js, rocket-race.js RR3D_CFG, sfx/stall.mp3) + ghép intro vào Fight 3D (kế hoạch 7 bước Chặng 4).

## Chặng 12 — 26/9/2026 · MẪU 5b "liền mạch"
`mau-5b-lien-mach.html` + `core/launch-aerial-5b.js` + `core/intro-sound-5b.js` + `assets/sound-5b/` (tool `tools/tao-am-thanh-5b.py`) + game rẽ nhánh `game5b/` (chép từ game5 rồi sửa).
- ⛔ Lỗi thầy bắt "tàu chuyển sang xoay NGANG rồi mới xoay thẳng": `rig.quaternion.slerp(hướng, dt*6)` mà mô hình dựng NẰM NGANG (+x) + game đóng băng chờ intro (`step(1)`) ⇒ lúc nối tàu còn ngang, mất ~0,5 s xoay. Sửa: khung đầu ĐẶT THẲNG (`r.qInit`). Đo: hướng tàu game (0,03; 0; −1) từ lúc tải = intro (0; 0; −1).
- START: `startboom` = nổ đanh + bùng trầm + đập khí dải trung + luồng gầm phụt (lách tách) + vút đi, 2,4 s, −11 dB.
- Kết trận nhanh: `finale.hitsAfter 1300, hitGap 320, burnMs 550` ⇒ tàu thua nổ 3,2 s sau khi về đích (trước ~6,6 s).
- Máy quay kết trận: `startOrbit()` ngay khi về đích; góc/bán kính bắt đầu TỪ vị trí máy quay hiện tại, hoà 3 s (smoothstep) về vòng quay ĐỀU 0,2 rad/s quanh tàu thua → đám mảnh vỡ; `resultView()` giữ nguyên nhịp đang quay. ĐO vận tốc (lọc rung) mỗi 0,5 s: 3,7 15 25 28 25 16 6,7 5,7 6,0 … 7,2 — tăng giảm mượt, đều trước lúc nổ (3,18 s) và sau đó. (Bản đầu hoà 1,6 s từ góc toàn cảnh xa 85 đv ⇒ vụt 70 đv/s — đã bỏ.)
- ⛔ Bẫy: ghi chú `//` chèn giữa dòng nhiều lệnh NUỐT mất `const w` ⇒ tick lỗi, cảnh đứng hình (đã ghi trong CLAUDE.md: giữa dòng dùng `/* */`).

## Chặng 13 — 26/9/2026 · ✅ ĐÃ GHÉP MẪU 5b VÀO AWORD (Đợt 398, `040b509`, LIVE 10/10 mã băm)
Thầy: "ok, ghép bản 5b vào AWord thay cho bản cũ" + chọn cảnh phóng chạy lại MỖI ván. AWord: `templates/rocket-race/rr3d-launch.js`
(= core/launch-aerial-5b.js, import về ./vendor/three), `rr3d-intro-sound.js` (= intro-sound-5b.js + 2 kênh EFFECTS/BACKGROUND theo nút 🔊),
`launch/` (= assets/4d), `sfx-intro/` (= assets/sound-5b), `rr3d-view.js` (= game5b), `sfx/stall.mp3`; `rocket-race.js` `rr3dLaunch()`
+ `skipCount` (vào thẳng GO). ⚠️ Từ nay sửa intro: làm ở myGame trước → thầy OK → chép sang AWord (xem AWord GHI CHU ROCKET-RACE mục 32).

## Chặng 14 — 26/9/2026 · MẪU 5c "mượt" (hiệu suất trong myActivity) + myActivity v2.23.0 `ef75dff`
Thầy: game 3D chạy trên myActivity — tìm phương án đồng bộ 2 bên cho hiệu suất/độ mượt/nhạy tối đa; chọn gói "myActivity nhẹ hơn" + "game tự giữ 60 khung".
- Đo (bơm nguyên AWORD_CSS/AWORD_JS của myActivity vào trang thử AWord 1600×900): KHÔNG bóp khung 3D; MutationObserver 255 đổi/10 s, `apply()` ≤ 0,1 ms; Fight 2D ẩn chỉ ghi 1 thuộc tính/50 ms; chạm = `pointerdown` (nhận ngay).
- Game (mẫu 5c, hình/tiếng = 5b): `core/auto-res.js` MỚI — đo nhịp khung thật, TB > 18,2 ms ⇒ hạ tỉ lệ điểm ảnh 0,1 (0,2 nếu > 24 ms), êm ~7 s ⇒ thử +0,05, thử mà rớt ⇒ chốt trần; giả lập 4 máy: khoẻ giữ 1,5 · yếu dừng 1,15 · vừa 1,2 · rất yếu 0,8. Cảnh phóng sàn 0,8, cảnh đua sàn 1,0 (chữ ô đáp án vẽ bằng WebGL — thấp hơn là mềm chữ); đổi độ nét KHÔNG `buildUI` (`applyPR`). Cảnh phóng: giới hạn 60 khung (như cảnh đua) · BÓNG ĐỔ chỉ vẽ lại khi vật đổ bóng di chuyển (`shadowMap.autoUpdate=false`; đo: màn chờ 0 lần/120 khung, cả đoạn phóng 304/743 khung) · mây sắp xếp 2 khung/lần · `renderer.compile` với lửa + quầng loa + vệt nhảy tốc độ bật tạm ⇒ hết dịch shader giữa lúc đánh lửa/nhảy. Trang phát `MYACT:3D:ON/OFF`.
- ⛔ Đã thử và BỎ: ẩn mặt đất khi trời tối — tàu nằm ngang ở ~100 đv nên mặt đất VẪN trong tầm (sương xa 1.600); ẩn là mất dải chân trời xanh dưới vệt sao (chụp so trước/sau thấy rõ).
- myActivity v2.23.0: cờ `force_high_performance_gpu` + `ignore-gpu-blocklist`; sao bảng điểm lấp lánh đổi opacity lớp ảnh sao nhoè (trước đổi `filter: drop-shadow` ⇒ vẽ lại mỗi khung); marker `MYACT:3D:ON/OFF` ⇒ `body.is-3d-live` dừng quầng sao.
- ⬜ Thầy chạy mẫu 5c trong myActivity v2.23.0 trên TOMKO (mở ☰ BẢNG THỬ xem "tỉ lệ điểm ảnh … / tối đa …", có "đã hạ" không). OK ⇒ chép sang AWord: `core/auto-res.js` → `templates/rocket-race/rr3d-autores.js`, sửa `rr3d-launch.js` + `rr3d-view.js` như 5c, `rocket-race.js` rr3dScene phát `MYACT:3D:ON` lúc dựng / `OFF` lúc `destroy()`.

## Chặng 15 — 26/9/2026 · MẪU 6 "tên lửa tấn công" + đội 2 CAM (thầy "ok build")
`mau-6-ten-lua.html` + game rẽ nhánh `game6/` (từ game5c) + `game6/rr3d-missile.js` (MỚI, mô-đun riêng ⇒ ghép AWord gọn) + `core/launch-aerial-6.js`
(= 5c, tàu intro lấy từ game6 cho đội 2 cam) + 5 tiếng `game6/sfx/m*.mp3` (tool `tools/tao-am-thanh-6.py`).
- Luật thầy chốt (AskUserQuestion 3 lượt): đúng 3 câu LIÊN TIẾP = +1 tên lửa, cả 2 ô tối đa 3 quả (đủ 3 thì chuỗi không tích) · ô DỰ PHÒNG nhỏ + ô LÊN NÒNG to
  dưới cột đáp án, lên nòng ⇒ nóc tàu MỞ KHOANG đẩy quả đỏ to lên · CHẠM ô lên nòng = bắn · bay vòng rộng, song song rồi lao hơi ngang vào thân tàu ·
  trúng ⇒ lùi N nấc (Options mới: 0 = tắt, 1–10, ∞ = về vạch xuất phát) · 1,5 s cuối: trả lời ĐÚNG hoặc bấm BOOST ⇒ tàu vọt lên né (KHÔNG cộng nấc),
  tên lửa bay hụt, lao thêm ~1 s rồi nổ · BOOST: 5 câu liên tiếp, giữ tối đa 1, có ở cả Same lẫn Different · khoá khi Sudden death / đã phân thắng thua.
- Claude tự chọn (đã báo thầy): TURBO trang trí giữ nguyên (hiệu ứng nạp chạy sau TURBO 0,45 s) · chỉ câu SAI mới làm đứt chuỗi (bị đội kia giành câu trước không tính).
- View (thụ động, luật ở trang/rocket-race.js): `view.missile` = setArsenal · chargeFx · loadFx · launch(from,to) · dodge(side) · incoming(side) · clearAll · refuse;
  gọi ngược `cfg.onFire(side)` / `cfg.onBoost(side)` / `cfg.onMissileEnd(to, "hit"|"miss", from)`. `explosion(pos, sc)` thêm hệ số cỡ.
- Bẫy/đo: ⛔ quả nằm dọc nóc tàu nhìn từ góc đuổi (sau lưng) chỉ thấy cái đuôi tròn ⇒ bệ nâng lên rồi NGÓC MŨI 22° + to 1,2× ⇒ thấy rõ cả thân đỏ ·
  ô chứa phải ĐẶC (kính trong suốt thì vệt bụi tốc độ vẽ đè lên) · ô chữ dài KHÔNG mọc xuống dưới nữa (chỗ đó là ô tên lửa) ⇒ co chữ khi quá dài ·
  vòng bay rộng theo khoảng cách 2 tàu (xa ⇒ rộng hơn, trên màn vẫn thấy "vòng ra") · mọi hẹn giờ hiệu ứng chạy theo nhịp cảnh (pause/step đúng).
- Tự kiểm (tab ẩn, `view.step`): trúng lùi đúng 2 nấc / ∞ về 0 · trả lời đúng sớm hơn 1,5 s không né, trong 1,5 s né được (không mất nấc) · BOOST bấm lúc
  không có tên lửa hoặc quá sớm ⇒ lắc, KHÔNG mất nút; trong 1,5 s ⇒ né + mất nút · sai ⇒ chuỗi về 0 · về đích ⇒ khoá ô, quả đang bay nổ · 0 lỗi Console.
- Bảng thử: mức lùi, Same/Different, +1 quả / +BOOST từng đội, 3 sắc cam (`?orange=ff8c1a|ff7a00|ff9f2e`), số nấc, Bỏ intro (`?skip=1`).
- ⬜ Thầy thử trên TOMKO (cảm ứng 2 đội, âm lượng 5 tiếng mới, sắc cam) ⇒ OK thì ghép AWord: rr3d-missile.js + sửa rr3d-view.js (các chỗ "mẫu 6") +
  luật trong rocket-race.js (thanh Options mới qua buildExtraOptions, khoá khi Sudden death) + sfx.

## Chặng 16 — 26/9/2026 · MẪU 6b "tay robot + góc rộng" (thầy test mẫu 6 rồi chỉnh 5 ý)
`mau-6b-tay-robot.html` + `game6b/` (rẽ từ game6) + `core/launch-aerial-6b.js`. Tiếng giữ như mẫu 6.
- Bệ gắn "quá xấu" ⇒ CỬA KHOANG = lát cắt LatheGeometry theo ĐÚNG biên dạng vỏ (`HULL_PTS` phải khớp makeRocket), bản lề mép ngoài xoay quanh trục
  dọc thân ⇒ đóng lại thân tàu gần như cũ. 2 CÁNH TAY ROBOT 2 đốt (IK, khuỷu gập về mũi) đưa quả lên gắn SÁT + SONG SONG thân (hở 0,13 thấy 2 kẹp);
  gắn xong cửa ĐÓNG lại dưới bụng quả; bắn xong cửa mở, tay thu vào, cửa đóng. Quả chỉ hiện khi cửa đã mở (cánh đuôi quả thò ra ngoài vỏ).
- Bắn ⇒ `G.wideCam` ⇒ `cfg.camera({ wide })`: góc RỘNG riêng cho tên lửa (vừa khít 2 tàu + đỉnh vòng, nhìn chéo từ trên cao phía sau-bên,
  chuyển 1,1 s). ⛔ Dùng toàn cảnh cũ (`high`) thì tàu nhỏ xíu, nằm sau bàn đáp án bên trái — đã thử, bỏ. Về góc đuôi: câu trả lời KẾ TIẾP sau khi
  tên lửa đánh xong (trúng/hụt) mới tắt wide, rồi luật camera cũ (chênh ≥ 3 nấc / 3 nấc cuối) tự xét.
- Đường bay: VÒNG LÊN (cao 9 + khoảng cách × 0,18) rồi LAO THẲNG XUỐNG (điểm điều khiển cuối ngay trên tàu địch), thời gian 3,8 s. Bỏ dấu ngắm đỏ.
- MỘT ô tên lửa không chữ (quả to phía trong + tối đa 2 quả nhỏ phía ngoài, chạm ô = bắn) · BOOST = thanh năng lượng CYAN dài theo số câu liên tiếp
  (đầy = có BOOST, đập nhịp; né được thì đập nhanh). ⚠️ ACES làm nhạt màu sáng ⇒ cyan phải để cường độ thấp (0; 0,55; 0,78) mới ra cyan đậm.
- Bàn thử: `window.__camOverride = a => ({pos, look, mode})` soi cận cảnh khoang/tay robot.
- Tự kiểm: tay robot đưa ra/thu vào + cửa liền (ảnh chụp cận), đường bay vòng lên lao xuống ở góc rộng, trúng lùi đúng nấc, BOOST sớm giữ nút / trong 1,5 s né
  + mất nút, góc rộng tắt đúng câu trả lời kế tiếp, 0 lỗi Console.

## Chặng 17 — 27/9/2026 · MẪU 6c "không khung + né lùi"
`mau-6c-khong-khung.html` + `game6c/` (rẽ từ game6b) + `core/launch-aerial-6c.js`.
- Thầy: "khung trông xấu quá" ⇒ BỎ HẾT khung ô tên lửa + BOOST: quả to (lên nòng) + ≤ 2 quả nhỏ nổi tự do dưới cột đáp án, quầng đỏ mềm dưới
  quả to khi sẵn sàng, chưa có quả ⇒ BÓNG MỜ hình quả (biết chỗ chạm). BOOST = rãnh mờ + dải CYAN bo tròn 2 đầu (ShapeGeometry vẽ lại khi độ dài đổi —
  kéo giãn thì 2 đầu méo), quầng cyan khi đầy. Vùng chạm = mặt phẳng TÀNG HÌNH (opacity 0) phủ rộng hơn hình vẽ.
- Thầy: "bấm sai bị lùi đúng thời điểm cũng tránh được đạn, với điều kiện có trừ điểm khi sai" ⇒ Points off > 0 và tàu còn lùi được: sai trong 1,5 s
  cuối ⇒ `dodge(side, { back: true })` (tàu giật LÙI thêm 3,6 đv rồi về đúng chỗ nấc mới, tên lửa lao hụt). Sai sớm hơn: vẫn lùi nhưng vẫn trúng.
  Tàu ở vạch xuất phát (không lùi được) ⇒ không né. Bản thử: `?off=0|1|2|3` (mặc định 1).
- Tự kiểm: sai sớm lùi 1 rồi trúng lùi 2 (2→1→0) · sai trong 1,5 s cuối: 2→1, né, không bị lùi thêm · 0 lỗi Console.

## Chặng 18 — 27/9/2026 · ✅ ĐÃ GHÉP MẪU 6c VÀO AWORD (Đợt 407, `a7e4e99`, LIVE 9/9 mã băm)
Thầy: "ok, dùng cam đậm, ghép vào AWord". AWord `templates/rocket-race/rr3d-missile.js` = chép NGUYÊN `game6c/rr3d-missile.js`; view móc như game6c
(đội 2 `#ff7a00`, không còn `?orange=`); luật ở `rocket-race.js` khối `ms*`; Options "Missile" (0 Off · 1–10 · 11 = ∞, mặc định 2). Tiếng `sfx/m*.mp3`.
⚠️ Sửa tên lửa về sau: làm ở myGame (bản rẽ mới) → thầy OK → chép `rr3d-missile.js` sang AWord (AWord GHI CHU ROCKET-RACE mục 34).

## Chặng 19 — 27/9/2026 · MẪU 6d "nạp tay + vết cháy + chuông báo động + MISS WAIT giữa màn"
`mau-6d-nap-tay.html` + `game6d/` (rẽ từ game6c) + `core/launch-aerial-6d.js` + tiếng `tools/tao-am-thanh-6d.py`.
- Đủ 3 câu liên tiếp ⇒ +1 quả NHỎ ở hàng dự phòng (giờ tối đa 3 quả nhỏ, xếp dọc); KHÔNG tự lên nòng, trên tàu chưa có gì.
  CHẠM hàng quả nhỏ (vùng chạm riêng `kind "load"` → `cfg.onLoad`) ⇒ quả bay sang ô to + tay robot đưa quả lên thân tàu.
  Chạm ô to khi chưa nạp mà còn quả nhỏ ⇒ cũng nạp (đỡ bấm hụt). Bắn xong KHÔNG tự nạp quả kế.
- Chạm quả to ⇒ quả to nhún tới rồi LÙI (đuôi đi trước) ra khỏi MÉP NGOÀI màn trong `carry` 0,32 s, rồi tên lửa trên tàu mới rời bệ
  (`launch` hẹn `liftoff`; `clearAll` tăng `gen` ⇒ lần phóng đang chờ bị huỷ).
- Chuông BÁO ĐỘNG thay tiếng bíp `mwarn`: 3 kiểu `?alarm=a|b|c` (a klaxon tàu · b còi báo động đỏ · c chuông điện), mỗi kiểu 2 file
  `malarm_*` (nhịp thường) + `malarmf_*` (1,5 s cuối). Bảng thử có nút ▶ nghe từng kiểu. ⬜ THẦY CHỌN 1 kiểu ⇒ AWord chỉ mang file kiểu đó.
- Trúng ⇒ `scorch(r)`: mảng cháy = LÁT CẮT vỏ (LatheGeometry theo HULL_PTS, r × 1,018, φ = nóc ± 0,62–1,25 rad tránh khe cửa khoang)
  dán texture muội đen canvas + emissiveMap than hồng; tối đa 6 mảng/tàu. Lửa + khói nhỏ phụt ở mọi mảng, tắt dần sau `burnSecs` 8 s không bị trúng
  thêm; vết đen ở lại hết trận. Vật liệu dựng SẴN mỗi tàu (burnKit, trước warmBoom) ⇒ không giật khi trúng.
- MISS WAIT: `game6d/rr3d-misswait.js` vẽ 3D trong lớp UI ngay DƯỚI thanh câu hỏi, chính giữa: viên thuốc kính tối + viền màu đội,
  2 nửa thanh co dần vào huy hiệu tròn có số giây, ≤ 25 % ⇒ đỏ nhấp nháy, mũi tên ‹‹‹ chạy về cột đội còn trả lời. View chỉ vẽ:
  `view.setMissWait({ side, frac, secs } | null)` mỗi khung. Bản thử tự giữ đồng hồ (`?mw=` giây, mặc định 8, chỉ Same words).
  ⚠️ AWord: đồng hồ + thanh DOM là của trọng tài `core/fight.js` (KHÔNG sửa) ⇒ lúc ghép: CSS ẩn `.aw-fight-missbar` trong skin rr3d
  (visibility, để transition vẫn chạy) + rocket-race.js đọc `.is-on` / bề rộng fill mỗi khung rồi gọi `view.setMissWait`.
- Tự kiểm: nạp tay (reserve 3→2, has, rise 1) · bắn: quả to lùi khỏi màn, tên lửa trúng ⇒ 1 mảng cháy, lửa tắt đúng 8 s · tự chơi 25 s 0 lỗi Console.

## Chặng 20 — 27/9/2026 · ✅ ĐÃ GHÉP MẪU 6d VÀO AWORD (Đợt 409, `567cf99`)
Thầy: "ok, dùng chuông b, ghép vào AWord". AWord `rr3d-missile.js` + `rr3d-misswait.js` = chép NGUYÊN game6d (chỉ đổi `alarm: "b"`), chỉ mang
`malarm_b` + `malarmf_b`. MISS WAIT trên AWord: đọc thanh DOM của trọng tài (core/fight.js không đổi) — AWord GHI CHU ROCKET-RACE mục 35.

## Chặng 21 — 27/9/2026 · MẪU 7 "khớp AWord mới nhất" — điểm xuất phát để cải tiến tiếp
Thầy: "đọc template Rocket Race trong AWord và repo này, xem đồng bộ bản mới nhất chưa, chuẩn bị 1 bản để tiếp tục cải tiến".
- Soát: `game6d/` = AWord Đợt 409 `567cf99` (chỉ khác ghi chú + đường import). NHƯNG AWord đã đi tiếp **Đợt 413 `eab8c6a`** (11 ý thầy: tự lên nòng,
  BOOST vuông giương sẵn, bố cục cột, đầu cột chỉ tim, màu ô pale/reveal, `fightMissReveal`, Apply về cảnh phóng) + **Đợt 416 `37db5bd`**
  (ô tích "Play until finish"). AWord đã sửa thẳng `rr3d-missile.js` + `rr3d-misswait.js` ⇒ myGame tụt 2 đợt.
- Tool mới `tools/chep-aword-sang-game.py <thư mục mới>`: chép NGUYÊN bộ game từ AWord **origin/main** (git show — không đọc thư mục làm việc
  AWord vì có thể tụt sau origin): view (đổi import three sang importmap) + missile + misswait + autores + sfx.js + `rr3d-cfg.js`
  (RR3D_CFG + `export const RR3D_HULL`) + font + 25 mp3 + NGUON.json. Không ghi đè thư mục đã có.
- `game7/` = chép từ AWord `d793bfa` (Đợt 416) — khớp tuyệt đối; `core/launch-aerial-7.js` (tàu intro từ game7);
  `mau-7-khop-aword.html` = trang 6d + luật thử bám AWord: tự lên nòng (+1 s sau MISSILE +1, +1,1 s sau khi bắn), BOOST giương sẵn
  (`G.armed`, `missile.armBoost`), `missiles {boostCm 5.2, gapCm 2}`, màu ô correct/pale · wrong/dim · reveal, hết MISS WAIT lộ ô đúng giữ 2,1 s.
  Bỏ bảng chọn chuông + sắc cam (đã chốt b + `#ff7a00`). Bản thử vốn bốc lại câu cũ vô hạn = "Play until finish" bật.
- Tự kiểm (khung ẩn ⇒ lái bằng `__view.step`): màu ô 3 ca đúng · Miss wait 8,03 s lộ ô ⇒ 10,14 s câu mới · 3 đúng liên tiếp ⇒ tự nạp ·
  BOOST bấm khi còn 3,6 s ⇒ giương rồi né · tự chơi tới đích · có intro 0 lỗi Console.
- ⚠️ Từ nay cải tiến Rocket Race làm trên `game7/` (rẽ `game7b/`… khi cần bản mới); ghép sang AWord: chép file game7 sang `templates/rocket-race/`
  (đổi import three về `./vendor/three/...`) + mang luật thử trong trang sang `rocket-race.js`.

## Chặng 22 — 27/9/2026 · MẪU 7b "BOOST bấm tay + vạch năng lượng tên lửa + act voice" (thầy "ok build")
`mau-7b-boost-tay.html` + `game7b/` (rẽ từ game7 = AWord Đợt 416) + `core/launch-aerial-7b.js`. Thầy chốt qua AskUserQuestion:
- BOOST: MỘT nút to hơn (`boostCm` 5,2 → 6,5), CHÍNH GIỮA dưới cột đáp án, bỏ 5 vạch cạnh nút. Thanh 5 đoạn BÊN TRONG nút đầy dần TRÁI → PHẢI
  (mỗi câu đúng liên tiếp 1 đoạn, SAI ⇒ về 0). Đủ 5 ⇒ bấm LÚC NÀO CŨNG ĐƯỢC: tàu tiến THẬT 1 nấc (`view.move up` + `missile.boostFx`), thanh về 0.
  Giữ nguyên: BOOST đã đầy mà trả lời sai thì KHÔNG mất (chỉ thanh đang tích mới xịt).
- Né: TỰ CANH — BOOST (hoặc trả lời đúng) trong **1,25 s cuối** (`missiles.window` 1,25) ⇒ né + GIỮ nấc vừa tiến. Bấm sớm ⇒ tiến 1 nấc
  nhưng vẫn trúng (đo: bấm lúc còn 3,17 s ⇒ +1 rồi trúng −2 = −1; bấm lúc 0,97 s ⇒ né, +1). Bỏ "giương sẵn" Đợt 413 (`armBoost` không làm gì).
- Cột VẠCH NĂNG LƯỢNG tên lửa (đỏ) ở dải ngoài cùng vùng tên lửa, sáng từ dưới lên; số vạch = `pipsMax` (dựng lại khi đổi, `buildMsPips`).
  ⚠️ Đặt sát mép `s.w` thì bị màn cắt nửa (cột đáp án nghiêng `rotY` quanh mép ngoài) ⇒ đặt trong `areaW`, hàng quả nhỏ nhường `colW + colGap`.
- Options (bản thử = nút bảng thử / tham số): `?streak=1..10` (mặc định 3) số câu liên tiếp = 1 tên lửa · `?max=0..3` (mặc định 3; 0 = không có
  tên lửa nhưng BOOST vẫn có) · thanh Missile bỏ Off `?push=1..10|inf`.
- Act VOICE `?voice=1`: `rr3d-sfx.js setFxLevel(k)` — bus Effect × k CỐ ĐỊNH cả trận (`?fxl=25|35|50`, mặc định 35 %) + `lockBg`. Bản thử đọc câu
  hỏi bằng `speechSynthesis` để nghe độ rõ. ⬜ Thầy nghe TOMKO chốt mức.
- Khi ghép AWord: `rrMissile` Options bỏ mức 0/Off; thêm 2 thanh (`rrMsStreak` 1–10, `rrMsMax` 0–3); mô-đun tên lửa phải dựng CẢ khi max = 0 (vì
  BOOST nằm trong đó — hiện `missiles: st.ms ? … : false`); `st.voiceAct` ⇒ `sfx.setFxLevel(0,35)`; `msBoost` viết lại như `useBoost` trang 7b;
  `MS_WINDOW` 1,25.
- Tự kiểm: BOOST 3 đúng ⇒ 3/5, sai ⇒ 0, chưa đầy bấm bị từ chối, đầy bấm +1 · né sớm/đúng lúc như trên · streak 10 + max 1 · max 0 (BOOST vẫn +1)
  · voice fxLevel 0,35 + nền khoá · tự chơi hết trận · có intro 0 lỗi Console.

## Chặng 23 — 27/9/2026 · MẪU 7c "tên lửa va nhau + vầng sáng sắp thắng" (thầy test 7b rồi chỉnh 4 ý)
`mau-7c-va-cham.html` + `game7c/` (rẽ từ game7b) + `core/launch-aerial-7c.js`.
- 2 tên lửa NGƯỢC CHIỀU cùng đang bay (mỗi quả đã bay > 0,12 s, chưa né/qua) ⇒ HÚT nhau: `pairUp` ghép cặp, mỗi quả trượt dần về điểm giữa 2 quả
  (`pull` 0 → 1 trong `CLASH_PULL` 1,1 s, smoothstep) ⇒ `clash()` khi cách < 0,9 đv / pull đủ / một quả hết hành trình: nổ to + burst.
  Chỗ nổ cách tàu < `CLASH_NEAR` = 3,4 × rocketScale (≈ 3,7 đv) ⇒ tàu đó như bị trúng (`stall` + `scorch` + `onEnd "hit"`), không thì `onEnd "clash"`.
  Đo (bàn thử `lastClash`): bắn gần cùng lúc ⇒ va sau ~1 s, cách tàu 6–7 ⇒ không ai lùi; quả sau phóng khi quả trước còn 2,6 / 1,7 s ⇒ cách 6,2 / 4,9
  (không tính); còn 1,2 / 0,8 s ⇒ cách 3,3 / 2,4 ⇒ TÍNH TRÚNG (tàu nhận vết cháy).
- Cột vạch năng lượng: mỏng hơn (`colW` pad × 0,55 → 0,24), xám/TRẮNG (không lẫn tên lửa đỏ), cách hàng quả nhỏ `colGap` pad × 0,55; quả dự phòng nhỏ hơn
  (`miniS` spW × 0,95 → 0,72 ÷ 2,3).
- ⛔ LỖI thầy bắt ("đầu trận BOOST đã có 3 vạch, bấm không tăng"): dữ liệu đúng (boostPips 0) nhưng các lớp nút cách nhau 0,002–0,007 đv + cột nghiêng
  ⇒ trình vẽ xếp vật trong suốt THEO KHOẢNG CÁCH TỪNG VẬT ⇒ mặt nút (tối) đè lên ô ở phía trong, ô phía ngoài lộ ra sáng hơn = trông như "3 vạch".
  Sửa: `renderOrder` cố định viền 20 → mặt 21 → ô trống 22 → ô sáng 23 → icon 24; ô trống tối hẳn. ⚠️ Bài học: lớp UI 3D chồng sát nhau PHẢI đặt renderOrder.
- Còn ĐÚNG 1 câu nữa là về đích ⇒ vầng sáng vàng nhấp nháy trước mũi tàu (`missile.setNearWin`; mũi = hình hộp tàu chiếu lên hướng bay; phóng theo
  khoảng cách camera ⇒ góc cao vẫn thấy). Trang bọc `view.move` ⇒ mọi lần đổi nấc đều xét; tắt khi phân thắng thua.
- Bảng thử: "2 đội bắn CÙNG LÚC", "Bắn đuổi (sát tàu)", "Đội 1/2 còn 1 câu".
- Tự kiểm: nút BOOST đầu trận 5 ô trống đều · cột vạch mỏng trắng · va chạm 2 ca như trên · vầng sáng bật đúng 9/10, tắt khi kết · tự chơi hết trận ·
  có intro 0 lỗi Console.

## Chặng 24 — 28/9/2026 · MẪU 7d "trúng lan tàu kề + lửa xanh sắp thắng" (thầy test 7c rồi chỉnh 2 ý)
`mau-7d-trung-lan.html` + `game7d/` (rẽ từ game7c) + `core/launch-aerial-7d.js`.
- Bỏ vầng sáng mũi tàu 7c (thầy: quá chói). Còn 1 câu là thắng ⇒ `missile.setNearWin` đặt `r.nearWin`; VIEW (game7d/rr3d-view.js — lần đầu sửa view
  trong nhánh 7) cho lửa đuôi DÀI 1,5 lần (`flameGroup` y × 1,5 + hạt `emitExhaust` bay nhanh × 1,5) + XANH DƯƠNG (uCol 0,25/0,8/4,2, đèn 0x4f8dff).
- Trúng lan: `hitShip(to, from, pos)` — xét `inSplash` = |r.p hai tàu| ≤ 1 (nấc THẬT, view.move đặt r.p) TRƯỚC khi báo trúng; trong tầm ⇒ tàu kia cũng nổ nhỏ
  + khựng + vết cháy + chữ "HIT TOO!" + `onEnd(other, "hit", from, "splash")` ⇒ trang lùi y hệt. Áp cho cả trúng thật lẫn "nổ sát tàu" khi 2 tên lửa va
  (một vụ nổ chỉ tính một lần). Khung đỏ + BOOST nhấp nháy báo cả tàu KỀ (`threatFor`) để kịp chạy.
- Đo: cùng nấc 4/4 ⇒ cả hai về 2/2, mỗi tàu +1 vết cháy · cách 1 nấc 3/4 ⇒ 1/2 · bên bắn trả lời SAI lùi 3 → 2 trước lúc nổ ⇒ thoát (chỉ tàu bị bắn lùi) ·
  tàu bị bắn BOOST sớm 4 → 5 ⇒ vẫn trúng (bấm sớm) về 3, bên bắn ở 3 cách 2 nấc ⇒ thoát. ⚠️ Bên bắn BOOST 3 → 4 là tiến VÀO tầm nổ.
- Bảng thử: "2 tàu CÙNG nấc + đội 1 bắn", "Cách 1 nấc + đội 1 bắn".

## Chặng 25 — 28/9/2026 · ✅ ĐÃ GHÉP MẪU 7b + 7c + 7d VÀO AWORD (Đợt 417, `8482a48`, LIVE 4/4 mã băm)
Thầy: "ok, ghép 7d vào AWord". AWord `rr3d-missile.js` + `rr3d-sfx.js` = chép NGUYÊN `game7d/`; view vá đúng các dòng nearWin (AWord tự xét trong `move()`);
luật trong rocket-race.js (Options Missile streak / Missiles max, BOOST `board.boostStep`, act voice `setFxLevel`). AWord GHI CHU ROCKET-RACE mục 38.
⚠️ Làm mẫu mới: `python -X utf8 tools/chep-aword-sang-game.py game8` (lấy lại nguyên bộ AWord) — đừng rẽ từ game7d cũ nếu AWord đã sửa thêm.

## Maze Chase 3D — 29/9/2026 · 3 MẪU GÓC MÁY (thầy "ok build")
Game 3D thứ 3 của kho: dựng lại Wordwall Maze chase (act 116866716) trên trạm vũ trụ. Thầy chốt: làm cả 3 góc máy · trạm vũ trụ · 1 người trước ·
điều khiển chạm/vuốt về phía nhân vật + D-pad sát mép (Fight chỉ D-pad). Chi tiết + đã kiểm: `maze-chase/NGHIEN CUU GAMEPLAY.md` mục 5.

## Train Rush 1am — 05/10/2026 · HIỆU NĂNG: hết giật lag trên TOMKO (myActivity + Chrome) · phiên trên máy BOARD
Thầy: "chơi Train rush trên TOMKO rất giật lag trên myActivity (có lẽ cả Chrome) — mở chơi thử, đo, tìm nguyên nhân, khắc phục". Kho myGame chưa có trên máy này ⇒ clone từ GitHub.
**Đo 1al** (myActivity, CDP cổng 9351, đếm rAF + long-animation-frame trong khung game, `nvidia-smi`; Quadro T2000, 3840×2160, DPR 1,25):
màn chờ 40 fps · chơi 36–38 fps, 30–35 % khung > 33 ms · card 97–100 %, 60 W, 83 °C, **SW Thermal Slowdown** (1750 → 1500 MHz) · canvas 3840×1780
(bỏ qua `__awMaxPR` = 1 của myActivity) · 14 shader dịch GIỮA ván (khựng 1,3 s lúc START, 0,1–0,4 s giữa ván).
**Thử từng núm** (bản thử, không sửa kho): PR 1 ⇒ 48 fps · PR 1 + MSAA 0 ⇒ 59,5 (card 87 %) · PR 1,25 + MSAA 0 ⇒ 53 · PR 1 + MSAA 2 ⇒ 52 · bỏ bloom ⇒ 54 · bóng 1024/PCF ⇒ không đổi.
⇒ nút thắt = MSAA 4 HalfFloat + độ nét 1,25. Chrome cùng code ⇒ cùng lag.
**Mẫu 1am** (`mau-1am-train-rush.html` · `core/bp3d-1am.js` · `core/fight-1am.js` · `core/auto-res-1am.js` mới; CSS dùng lại 1al):
- `auto-res-1am.js` `makeAutoQuality`: thang [tối đa + MSAA 4] → [tối đa, MSAA 0] → hạ 0,1/nấc tới 0,8; trần `__awMaxPR`; nhớ nấc êm (localStorage `aw.bp3d.q.*`). Máy khoẻ vẫn y 1al.
- canvas `antialias: false` (mọi thứ vẽ qua composer). `__bp.quality` / `__bp.renderer` cho bàn thử.
- `prewarm`: dựng 1 bộ mẫu (đầu máy, toa than, toa đáp án, toa trơn, toa khách, toa than đá, thùng, bóng thưởng, máy bay + băng rôn, hạt) bằng chính các hàm dựng
  + `weather()`, `renderer.compileAsync` với ĐÍCH VẼ = render target của composer (vẽ ra màn hình thì khoá shader thêm ACES + sRGB ⇒ lệch, dịch phí). Giữ bộ mẫu
  (không vào cảnh, không thả) ⇒ shader sống qua các lần huỷ tàu cuối màn.
**Đo 1am** (cùng máy, `__awMaxPR = 1`): màn chờ 59,2 fps · chơi 59,3–59,5 fps, 1–2 khung > 33 ms / 12 s · khựng START 1,3 s → 0,1 s · còn 2 shader bóng đổ (depth) dịch giữa ván
(1 lần ~0,1–0,17 s; khoá phụ thuộc trạng thái đèn nội bộ lượt vẽ bóng — không làm) · bộ tự chỉnh chốt PR 1 + MSAA 0 (thử lại MSAA 4 rớt ⇒ chốt trần).
Fight: 1al 31 fps (47 % khung > 33 ms) → 1am 58,4 fps (2 %), 2 bàn dừng ở PR 0,8–0,9. Ảnh: bỏ MSAA hơi răng cưa ở mép gò cỏ / bụi cỏ, chữ + tàu nét như cũ.
✅ Đã ghép vào AWord: Đợt 475 `b8d36b2`, LIVE 4/4 mã băm; myActivity + game LIVE: hostCap 1, chơi 59,6 fps.
⚠️ Máy TOMKO (HP Z2 Mini G5): card 76 °C khi KHÔNG chạy game, 83–84 °C khi chơi, đang hạ xung vì nhiệt ⇒ nên vệ sinh bụi / kiểm quạt.
## Star Loot 2p — 05/10/2026 · HIỆU NĂNG: hết giật lag trên TOMKO (tiếp theo Train Rush 1am) · phiên máy BOARD
Thầy: "tạm ổn rồi (Train Rush). Tiếp tục đo đạc và tối ưu tương tự với STAR LOOT".
**Đo 2o LIVE trong myActivity** (cùng cách đo Train Rush; bàn thử `__mc` có sẵn renderer/composer ⇒ thử núm ngay lúc chạy, không cần bản thử):
màn chờ 52 fps · chơi 44 fps, 18–20 % khung > 33 ms · Fight 42–44 fps (21 %) · card 96–100 % · canvas 3840×1780 (bỏ qua `__awMaxPR`).
Thử: PR 1 + MSAA 4 ⇒ 44 (độ nét gần như KHÔNG ảnh hưởng) · PR 1 + MSAA 0 ⇒ 56 · PR 1,25 + MSAA 0 ⇒ 58 ⇒ MSAA quyết định.
Khựng 140–280 ms MỖI CÂU (profiler CDP): `nextQuestion → useMap → deck.paint` vẽ lại 4 canvas sàn + Sobel JS + `getImageData` đọc ngược GPU trong 1 khung.
Còn 11–19 ms/câu: `getProgramInfoLog`/`getProgramParameter` — shader mảnh xác robot bị three.js xoá khi dispose (pha hold) rồi dịch lại câu sau.
**Mẫu 2p** (`mau-2p-star-loot-aword.html` · `core/mc3d-2p.js/.css` · `core/mc3d-floor-2p.js` · `core/mc3d-autoq-2p.js` mới):
- `mc3d-autoq-2p.js` = auto-res-1am (Train Rush) + nấc nào RỚT 2 LẦN ⇒ chốt trần dưới nó (màn chờ nhẹ ⇒ thử MSAA 4 ⇒ vào chơi rớt ⇒ lặp, mỗi lần đổi MSAA khựng ~50 ms).
- canvas `antialias: false`; `renderer.debug.checkShaderErrors` tắt (`?glcheck=1` bật lại để dò lỗi shader); `__mc.quality`, `__mc.deckBusy`.
- sàn: `paintGen` (generator, điểm dừng mỗi tấm thép / hàng ô / 96 hàng Sobel) + `paintLazy`; canvas độ cao + pháp tuyến `willReadFrequently`.
  `useMap(m, true)` ở `nextQuestion` ⇒ vẽ ~4 ms/khung trong lúc câu hỏi to che màn (4,7 s), xong tải lên card mỗi khung 1 ảnh (needsUpdate đặt ngay trước initTexture);
  `finishDeck()` trước `buildMaze` (chắc chắn xong). Lúc tải / intro vẫn vẽ ngay.
- `pinPrograms()` (mỗi 30 khung): cộng 1 `usedTimes` cho mỗi program một lần ⇒ không bao giờ bị xoá ⇒ không dịch lại giữa ván.
**Đo 2p** (myActivity, `__awMaxPR = 1`): màn chờ 60 · intro 60 · chơi 59,2–59,8 fps, khung dài nhất 33–67 ms (2o: 200–280) · Fight 59,7–59,8 (1 % khung > 33 ms).
Không trần (như Chrome, DPR 1,25): tự xuống PR 1,05 + MSAA 0, 59–60 fps. Ảnh: sàn khớp đúng mê cung mới sau khi vẽ chia khung.
Còn: 1 lần ~40 ms/câu (`getImageData` sau bộ lọc làm mờ pháp tuyến) — chấp nhận.
✅ Đã ghép vào AWord: Đợt 476 `7c3c408`, LIVE 5/5 mã băm; myActivity + game LIVE: hostCap 1, chơi 59,2–59,8 fps.
## Train Rush 1an — 05/10/2026 · 60 khung PHẲNG (thầy: "làm bản 1an cho Train Rush luôn")
`mau-1an-train-rush.html` · `core/bp3d-1an.js` · `core/fight-1an.js` · `core/auto-res-1an.js` (= mc3d-autoq-2p, khoá aw.bp3d.q.*) · `core/west-world-1an.js`.
- Rút từ STAR LOOT 2p: chốt trần khi rớt 2 lần · `pinPrograms()` ghim shader · `checkShaderErrors` tắt (`?glcheck=1`).
- Đo 1am lại trên TOMKO: còn 1 khung 70–130 ms mỗi ~12 s — profiler: `regrow → tallSaguaro → cactus.saguaro` dựng lưới mới (ống 40×80 + mergeVertices)
  khi khúc cảnh quay vòng lên trước. 1an (`west-world-1an.js`): kho 10 saguaro dựng sẵn lúc tải + cây bị bỏ vào kho DÙNG LẠI (≤ 24),
  mọc lại = đặt chỗ mới / xoay mới / scale theo chiều cao mới (dáng tỉ lệ theo h). Hết kho mới dựng như cũ.
- Đo 1an (myActivity, `__awMaxPR = 1`): chơi 60,0 fps × 4 đoạn 12 s, khung dài nhất 17 ms (1am: 59,2–59,8, 66–150 ms) · Fight 60,0 fps, 0 khung > 17 ms.

## Đồng bộ AWord — 05/10/2026 · ROCKET RACE MẪU 8 = AWord Đợt 478 · TRAIN RUSH 1an đã ghép (Đợt 477)
Thầy: "repo myGame đã đồng bộ với 3 game 3D trên AWord chưa" → "myGame cũng phải có các bản mới nhất đồng bộ với AWord luôn".
- Kiểm: TRAIN RUSH (1an, `ca4d0ac`) + STAR LOOT (2p, `ed155cd`) — chạy lại 2 script chép phía AWord ⇒ AWord KHÔNG đổi file nào ⇒ khớp từng byte.
  ✅ TRAIN RUSH 1an đã ghép AWord Đợt 477 `3e28cc9`, LIVE 5/5 mã băm, app thật 60,0 fps.
- ROCKET RACE lệch: bản chụp mới nhất của myGame là game7 (AWord d793bfa, Đợt 416, 27/9); `aword/` còn cũ hơn (Đợt 397). AWord đã thêm 24 commit Rocket Race.
- `tools/chep-aword-sang-game.py` nâng cấp: chép thêm cảnh phóng `rr3d-launch.js` + `launch/` và tiếng intro `rr3d-intro-sound.js` + `sfx-intro/`
  (trước chỉ cảnh đua; trang mẫu dùng cảnh phóng riêng core/launch-aerial-*). Chạy ra `game8` ← AWord `156cf57` (8 file js, 25 tiếng, 27 tài nguyên phóng/intro).
- `mau-8-khop-aword.html` = trang 7d đổi import sang game8 (cả createLaunch / createIntroSound của AWord). Thử (localhost:8865): cảnh phóng AWord hiện,
  START ⇒ phóng ⇒ vào cảnh đua, câu hỏi + ô 2 đội, chạm ô ⇒ sang câu kế, 0 lỗi console. Luật thử của trang vẫn theo 7d (luật thật ở AWord rocket-race.js).
- `rocket-race/aword/` (cho các trang intro mẫu 4/5 cũ) GIỮ NGUYÊN — thay bằng bản mới thì các trang đó hỏng (API khác).
- Quy tắc đồng bộ ghi ở CLAUDE.md mục "ĐỒNG BỘ VỚI AWORD".

## Star Loot 2q — 05/10/2026 · iPAD LÀM D-PAD (WebRTC) · phiên máy MSI
**Bối cảnh (thầy):** "chạy trên màn hình 86 inch quá khổng lồ, học sinh thò tay lên màn hình bấm cũng không nhìn được toàn cảnh do đứng quá sát…
Tôi muốn điều khiển bằng iPad (2 iPad trong chế độ Fight)… iPad chỉ việc mở D-pad, không cần hiện câu hỏi. Tín hiệu từ iPad đi 1 chiều lên game".
Thầy chốt: **WebRTC** · **giữ D-pad trên màn để dự phòng** · **làm cả Single lẫn Fight**.
**Đã làm (mẫu 2q):**
- `core/mc3d-2q.js/.css` = 2p + tham số `remote`. Lõi không biết mạng: `remote.attach({ press(team,key), status(team,s) })` gọi lúc cuối
  createMazeChase; `press` đi đúng đường của D-pad trên màn (`screenToGrid` + `queueDir` / `placeBomb`), D-pad trên màn của đội đó cũng sáng nút.
  Single: chỉ iPad đội A lái (iPad B bị bỏ qua) · Fight: đội 0 = D-pad trái, đội 1 = D-pad phải. Đang tạm dừng ⇒ bỏ phím.
  Nhãn xanh "iPad" (`.mc-padtag`, anh em của D-pad vì Ring có overflow:hidden) trên D-pad đội đã nối; vàng "iPad · slow" = đường dự phòng; xám "iPad …" = đang nối.
  Nút **Tablet** (giữ chỗ từ 1h) mở bảng "iPad D-pad": QR + trạng thái từng đội (`remote.panel(el,{fight})`). destroy() ⇒ `remote.detach()`.
- `core/mc3d-padlink-2q.js`: `createPadHost` (máy chiếu) + `createPadClient` (iPad) + `localSignal` (bàn thử). Giao thức: 3 tài liệu MỖI CÁI 1 NGƯỜI GHI —
  `host` (sid phiên game, offer n_t/o_t cho iPad có nonce) · `pad0`/`pad1` (sid, nonce, answer, rs/rq dự phòng, hc nudge). Game mở lại = sid mới ⇒ iPad
  đang mở tự chào lại ⇒ tự nối. STUN Google; chờ gom ICE ≤ 2,5 s (không trickle). iPad ping 1 s ("p:n"), game trả "q:n" ⇒ iPad hiện độ trễ khứ hồi;
  game không nghe gì quá 4 s ⇒ nhãn về "đang nối". Không mở được kênh thẳng trong 7 s ⇒ iPad chuyển đường dự phòng (ghi phím vào kho).
- `core/mc3d-padui-2q.js`: D-pad 4 nút to + nút bom tròn (ngang: D-pad trái, bom phải · dọc: trên/dưới), pointerdown, nhiều ngón, chặn phóng to / menu giữ lâu,
  Wake Lock, thanh trên: tên đội màu đội + trạng thái + ms.
- `core/mc3d-qr.js` = chép nguyên AWord `core/qr.js`. Trang `mau-2q-star-loot-ipad.html` + `pad-2q.html?t=0|1` (kênh cục bộ — iPad thật nối qua AWord).
**Đã kiểm (browser pane localhost:8866, 3 tab):** nối WebRTC thật (DataChannel open, ICE connected, khứ hồi 1 ms cùng máy) · bấm nút thật trên pad ⇒ game nhận u/r/bomb ·
Fight: iPad A ⇒ robot A (3,3)→(5,3), iPad B ⇒ robot B (0,10)→(0,9), D-pad trên màn sáng đúng bên · bom iPad B trừ bom đội B · tạm dừng ⇒ phím bị bỏ ·
Single: phím iPad B không làm gì · game tải lại 2 lần ⇒ cả 2 iPad tự nối lại (0,5 s / 3,7 s) · chặn RTCPeerConnection trên pad ⇒ "relay", 4 phím l,bomb,d,r tới đủ đúng thứ tự ·
bảng QR 2 đội "Connected" · nhãn iPad nằm ngay trên D-pad 2 đội · trang pad 1366×1024.
**Lỗi gặp & gỡ:** (1) đường dự phòng mất phím giữa khi bấm dồn (kho gộp lượt ghi) ⇒ gửi đuôi 4 phím `rq` + đếm `rs`. (2) game tải lại ⇒ iPad kẹt "Connecting…"
vì lời chào rơi đúng lúc trang game đang nạp ⇒ iPad tự ghi lại mỗi 4 s (`hc`, tối đa 8 lần) tới khi nối. (2b) chiều ngược lại (thấy ở bàn thử AWord): game đã ghi offer mà iPad lỡ lần báo ⇒ game thấy `hc` tăng mà chưa có answer thì GHI LẠI offer + `h_t` mới (có thay đổi ⇒ chắc chắn báo). Sau vá: 3 vòng tải lại trang game, 2 iPad tự nối lại sau 4,2 / 5,7 / ~5 s. (3) vá file CRLF bằng chuỗi nhiều dòng trượt ⇒ chuẩn hoá LF, vá, ghi lại CRLF.
➡️ Ghép AWord: Đợt 480 (kênh bắt tay Firestore `sl-pad-signal.js`, trang `pad.html`).
**Chỉnh theo thầy (05/10, sau khi xem bản đầu, kèm ảnh):** "AWord đã có nút iPad này, tôi muốn iPad bấm vào thì mở ra trang và chọn 1 trong 2 đội ·
Thiết kế toàn bộ màn hình iPad là D-pad đang sử dụng của game, nút bom để ở góc trên bên phải, xa xa khu D-pad, D-pad to chiếm cả màn hình cũng được ·
Tôi bấm nút Fight trong Mode thì không chuyển được, tiện kiểm tra".
- **Màn chọn đội:** `pad.html` không có `?t` ⇒ 2 nút lớn TEAM A / TEAM B (hình D-pad màu đội) ⇒ `pad.html?t=0|1`. Nút iPad trên thanh AWord (cạnh Settings,
  Đợt 368f — trước mở `source.html`) nay mở `pad.html`; màn câu hỏi Rocket Race vẫn còn qua link nhỏ dưới màn chọn đội. Màn D-pad có nút ‹ góc trên trái để về chọn đội.
- **Màn D-pad:** đúng D-pad RING của game (4 múi vành khăn SVG + mũi tên, viền xanh; đội B ngả cam bằng hue-rotate như trong game), cao ~94 % màn; tâm ghi chữ đội A/B;
  vùng bấm = cả GÓC PHẦN TƯ theo góc so với tâm (chạm lệch vẫn ăn), vòng tâm bỏ qua. Bom = nút tròn riêng ở GÓC TRÊN PHẢI.
- **Lỗi Mode:** dòng "ENEMY LOCATED / POSITION / TARGET" là INTRO sau khi bấm START (pha `cine`), không phải màn START ⇒ bảng Mode khoá 2 nút + chữ
  "Change the mode from the start screen". Nay KHÔNG khoá: giữa chừng (intro / đang chơi / kết quả) bấm chế độ kia ⇒ bỏ ván, về màn START với chế độ mới
  (hàm chung `leaveToMenu()` tách từ END GAME); bấm lại đúng chế độ đang chơi ⇒ chỉ đóng bảng.
- Kiểm: intro bấm Fight ⇒ menu + fight ✓ · đang chơi Fight bấm Single ⇒ menu + single ✓ ⇒ START lại chơi Single bình thường, 0 lỗi · màn chọn đội + D-pad 1366×1024 (ảnh) ·
  chạm lệch góc trái ⇒ "l", robot B (6,11)→(6,10) · bom góc ⇒ bom đội B 1→0 · chạm tâm ⇒ bỏ qua.
✅ **THẦY ĐÃ THỬ iPad THẬT (05/10/2026): nhãn XANH (nối thẳng WebRTC trên Wi-Fi lớp), chơi ổn.** Thầy sẽ build thêm sau.

## Star Loot 2r — 11/10/2026 · 3 THANH OPTIONS MỚI: Enemies 0–10 · Lives ∞ · Bomb timer 1–10 s · phiên máy MSI
**Bối cảnh (thầy):** "Đọc game STAR LOOT trên cả myGame và AWord, sửa options trên AWord: thêm một thanh Enemy để quyết định số Robot địch, 0 đến 10 ·
thanh Lives thêm một nấc cuối là không giới hạn · thêm một thanh thời gian nổ bom, kéo từ 1s đến 10s".
**Đã làm (mẫu 2r = 2q + 3 tuỳ chọn; `core/mc3d-2r.js/.css`, trang `mau-2r-star-loot-enemy-fuse.html`; padlink/padui/pad-2q giữ nguyên):**
- `opt.enemies` 0..10 (`MAX_ENEMIES`) = số robot địch; trước gắn cứng theo difficulty (1–4). Difficulty nay CHỈ là tốc độ địch (nhãn phụ "enemy speed").
  Options truyền vào không có `enemies` ⇒ `enemiesFor(difficulty)` (export) = luật cũ ⇒ act AWord đã lưu chơi y như trước.
  Dựng sẵn 10 robot (trước 4). 4 robot đầu ở 4 góc `espots` (Fight vẫn chọn bộ góc công bằng); robot thứ 5+ ở `xspots` = `extraSpots(n)`:
  ô có sàn, ngoài sân xuất phát, cách ô xuất phát (+ 2 ô đội Fight) ≥ 5 ô, chọn tham lam ô xa mọi ô đã lấy nhất ⇒ trải đều. Hồi sinh sau đổi người dùng cùng `enemySpot(i)`.
  ⚠️ Cố ý KHÔNG nhét ô thêm vào `espots`: `pickFightSpots` duyệt mọi tổ hợp k góc ⇒ 10 ô là C(10,k) × mọi ô bệ, quá nặng; và `pickSpots` né bệ khỏi espots.
- `opt.lives` 10 = ∞ (`LIVES_INF`): bị trúng vẫn ngã / đổi người / hồi sinh, không trừ mạng, không "−1"; ô tim "♥ ∞"; vạch năng lượng luôn đầy.
- `opt.fuse` 1..10 = giây bom tự nổ (bỏ hằng `FUSE_S = 5`); mỗi bom giữ `b.fuse` lúc đặt (đổi Options giữa chừng không làm bom đang cháy nhảy giờ).
- Bảng Options riêng của myGame: + Enemies (0 = Off), Lives nấc ∞, Bomb timer "Ns"; `OPT_KEYS` + `DEFAULTS` thêm `enemies: 2, fuse: 5`.
**Đã kiểm (browser pane :8866, `__mc`):** 10 địch / 10 ô khác nhau (Single + Fight) · ∞ bị đâm ⇒ swap, mạng vẫn 10 · Fight 2 đội 10/in · mạng 3 dính bom ⇒ 2 ·
0 địch ⇒ 0 · ngòi 2 s ⇒ nổ 2,1 s · 10 s ⇒ 10,0 s · `enemiesFor` 1→1 3→1 4→2 6→2 7→3 8→3 9→4 10→4 · 0 lỗi console.
**Lỗi gặp & gỡ:** dòng dựng robot là MỘT DÒNG `.map(c => { … })` — chèn ghi chú `//` giữa dòng nuốt mất thân hàm ⇒ `node --check` báo "missing )" ⇒ đổi sang `/* */`
(đúng bẫy đã ghi ở CLAUDE.md "Ghi chú giữa dòng JS nhiều lệnh phải dùng /* */").
✅ Fight đã kiểm riêng (8 địch, ∞ hai đội, ngòi 3 s cả đội A/B, mạng thường trừ đúng). ✅ ĐÃ PUSH myGame `1fd3173` + AWord `1a5afe2` LIVE 4/4.
➡️ Ghép AWord: Đợt 503 (`tools/chep-star-loot.py` BAN 2r, khoá phẳng `slEnemies` / `slFuse`, `lives` kẹp 1..10; gỡ `mc3d-2q.js/.css` khỏi AWord).

## SPEED RUN — 11/10/2026 · NGHIÊN CỨU TRƯỚC (chưa dựng mẫu) · phiên máy MSI
**Bối cảnh (thầy):** "chuẩn bị cho một game mới với mục tiêu gắn cho AWord và với vibe tương tự: SPEED RUN — đua ô tô, tương tự Rocket race nhưng
thiết kế khác khá nhiều: đường đua nhìn từ phía sau 2 xe nhưng camera lên cao hơn, 2 xe cách xa thì camera lên cao hơn nữa; cân nhắc lái xe cho iPad;
trả lời đúng = năng lượng cho xe chạy; tên lửa trên thân xe bắn đối phương. Hãy nghiên cứu trước."
**Đã làm:** đọc lại 3 game (Rocket race game8 = AWord Đợt 478 · STAR LOOT 2q · TRAIN RUSH 1ao) + cách AWord gắn template (3 agent khảo sát mã) + chạy thử
mẫu 8 trong trình duyệt ⇒ viết hồ sơ **`speed-run/NGHIEN CUU GAMEPLAY.md`** (8 mục): kho có gì tái dùng được (bảng), khác biệt cốt lõi (nấc rời → chuyển
động liên tục), thiết kế đề xuất (bối cảnh đường cao tốc ven biển từ bãi xe ANDREW STUDIO · camera cao + cự ly LIÊN TỤC theo gap, trung điểm 2 xe ·
3 mô hình năng lượng A/B/C, đề xuất C lai: luật vẫn NẤC, vẽ liên tục · tên lửa bay thấp, trúng = quay tròn · lái iPad = đổi làn rời qua padlink 2q
có sẵn, né tên lửa bằng làn · HUD · intro bãi xe · tiếng), kỹ thuật (đường vô tận kiểu west-world-1c + curved world shader, xe từ 5 mẫu trong
`rr3d-launch.js:666–815`, bóng blob, autores), 2 khuôn ghép AWord (A qua `core/fight.js` như Rocket race / B tự vẽ trọn màn như STAR LOOT — đề xuất B),
rủi ro, **8 câu hỏi cần thầy chốt** (mục 7) và kế hoạch 4 mẫu (mục 8).
**Khám phá đáng nhớ:** `remote.press` của padlink 2q là phím RỜI (không down/up) ⇒ lái liên tục phải mở rộng giao thức (gói trạng thái 30 Hz + fail-safe
nhả ga 300 ms), còn ĐỔI LÀN RỜI thì dùng được ngay · Rocket race camera chỉ có 2 nấc chase/high (chuyển 3,2 s) chứ không liên tục · `mau-8 ?skip=1` lỗi
"Cannot read properties of null (reading 'g')" tại `rr3d-view.js:2159` (startBtn null khi bỏ intro) — lỗi sẵn có của bản thử, chưa sửa.
⬜ Chờ thầy trả lời mục 7 rồi "ok build" mẫu 1.

## SPEED RUN mẫu 1 — 11/10/2026 · thầy CHỐT 8 đề xuất ⇒ dựng đường + 2 xe + camera theo khoảng cách (2 góc máy) · phiên máy MSI
**Bối cảnh:** thầy đọc hồ sơ nghiên cứu, trả lời "chốt" = nhận cả 8 phương án đề xuất (luật C lai · khuôn B · iPad tay lái đổi làn rời · cao tốc ven biển · sai = phanh mất năng lượng dồn ·
trúng tên lửa = quay tròn mất 2 đoạn · 2 góc máy). Claude dựng luôn MẪU 1 theo mục 8 bước 1.
**Đã làm:** `speed-run/mau-1a-cao-vua.html` + `mau-1b-truc-thang.html` + `index.html`; lõi `core/sr3d-1.js`, thế giới `core/sr3d-world-1.js`, xe `core/sr3d-car-1.js`, HUD `core/sr3d-1.css`,
vỏ thử `core/page-1.js/.css`, `core/sr3d-autores.js` (chép nguyên Rocket Race). Chi tiết luật/camera/thế giới/xe + bảng số đo ở `speed-run/NGHIEN CUU GAMEPLAY.md` **mục 9**.
**Quyết định kỹ thuật:** đường đôi 4 làn, MỖI ĐỘI 2 LÀN (Claude tự quyết, đã báo) · camera tính góc chúi để luôn chứa cả 2 xe · cong thế giới trong vertex shader, tắt dần khi 2 xe xa ·
độ cao đất JS = GPU nhờ `Math.fround` · bóng blob thay shadow map · HUD là DOM theo cqw/cqh · nhãn số đội trên xe ở xa.
**Lỗi gặp & gỡ:** 7 lỗi ghi ở mục 9 hồ sơ (xe dẫn mất hút, trực thăng bị cột che, mù sương, nhãn dồn góc, máy quay kết vào cây, đèn chìm trong thân, trình duyệt giữ mô-đun cũ).
Phát hiện bên lề: Rocket Race `mau-8 ?skip=1` vẫn văng (`rr3d-view.js:2159`), chưa sửa.
⬜ Thầy xem 2 góc máy ⇒ chọn ⇒ mẫu 2 (tên lửa + BOOST + tiếng).
**Thầy (11/10): "Tạm thời bản 1 đến đây. Commit + push, tôi sẽ tiếp tục trong các phiên sau."** ⇒ đã commit + push mẫu 1 lên GitHub (andrewclasses-01/myGame, nhánh main).

## SPEED RUN mẫu 2 — 11/10/2026 · "BUỒNG LÁI": chia đôi màn, góc nhìn trong xe, lái iPad kiểu Asphalt, tên lửa né được · phiên máy MSI
**Bối cảnh / yêu cầu (thầy, sau khi mẫu 1 đã push):** "Chia màn hình làm 2, sử dụng góc nhìn thứ nhất làm điều khiển trong xe. Các thông số cũng hiển thị bên trong, để chừa một dải trên
hiện câu hỏi và bản đồ đường đua" · "Sử dụng điều khiển là iPad, điều khiển trái phải, tăng tốc phanh tương tự như các game Asphalt thông thường" · "Xe có trang bị tên lửa, có cơ chế bắn
tương tự như rocket race, có thể tăng tốc hoặc phanh để tránh, có thể lái trái phải để tránh". Đầu phiên đã kiểm git: myGame khớp origin `ce0a7ff`, không có file dở.
**Đã làm:** `speed-run/mau-2-buong-lai.html` + `speed-run/pad-2.html` (tay lái iPad) + thẻ mẫu 2 ở `speed-run/index.html`; lõi `core/sr3d-2.js`, `core/sr3d-2.css`, tên lửa + hạt
`core/sr3d-missile-2.js`, nối iPad `core/sr3d-padlink-2.js` (gốc STAR LOOT 2q + giao thức lái liên tục), giao diện tay lái `core/sr3d-padui-2.js`, vỏ thử `core/page-2.js`
(thêm 1 dòng `.hint` vào `core/page-1.css`). Dùng lại nguyên thế giới/xe/autores của mẫu 1. Chi tiết luật, màn hình, giao thức, số đo ở `speed-run/NGHIEN CUU GAMEPLAY.md` **mục 10**.
**Quyết định (Claude tự chốt, cần thầy duyệt khi thử):** dải trên = câu hỏi 2 đội + bản đồ; ĐÁP ÁN nằm trên màn cảm ứng TAP-LÔ ở mép ngoài mỗi nửa (TOMKO: em với tới phần dưới bảng dễ
hơn, 2 đội đứng tách 2 bên) · vô lăng kiểu F1 có màn km/h + năng lượng · ga TỰ ĐỘNG như Asphalt, BOOST nhanh hơn mà KHÔNG tốn thêm năng lượng (năng lượng = mét đường) · năng lượng
tối đa 4 ô · sai = mất ô đầy đang dồn + phanh · tên lửa: 3 đúng liền = 1 quả, tối đa 3, bay 2,6 s, khoá điểm rơi khi còn 1,1 s, trúng = xoay + mất 2 ô · không có iPad ⇒ xe tự lái,
trả lời đúng lúc tên lửa đang bay ⇒ tự né · dải phân cách bê tông giữa 2 nửa đường.
**Lỗi gặp & gỡ:** (1) màn trong xe ĐEN hẳn sau vài giây — truy bằng cách đọc thẳng render target half-float, đếm NaN: do `Math.pow(f, 1.4)` với f = −1e-8 ở mép capô ⇒ đỉnh NaN ⇒
bloom loang NaN ra cả màn ⇒ kẹp f · (2) three.js giải MSAA ở cuối mỗi `render()`, phép blit bị scissor cắt ⇒ thêm 1 lần vẽ cảnh rỗng không scissor · (3) chân trời thấp + capô mảnh ⇒
dịch ống kính `setViewOffset` · (4) vòng ngắm phẳng gần như vô hình từ ghế lái ⇒ cột sáng đỏ đứng, trộn thường · (5) khung báo động che chỗ tên lửa rơi ⇒ dời xuống trên capô ·
(6) tên lửa bay quá cao ngoài khung nhìn ⇒ vòng cung thấp · (7) nút TILT đè nút lái ⇒ dời góc trên trái.
**Đã kiểm:** trận tự chơi tới đích; 4 kịch bản tên lửa (đứng im trúng · lái né · phanh né · BOOST né); iPad giả ở tab 2 qua WebRTC (1–2 ms): lái, BOOST, bắn, nhận đồng hồ + báo động,
tải lại tự nối; phím; 173 lệnh vẽ / 286 nghìn tam giác; 60+ khung/s RTX 4060. Chưa đo TOMKO, chưa thử iPad thật (cần kênh bắt tay Firestore của AWord), chưa có tiếng.
⬜ Thầy chạy thử mẫu 2 ⇒ nhận xét ⇒ mẫu tiếp theo.
**Thầy (11/10): "Commit + push. Tôi sẽ tiếp tục trong các phiên sau."** ⇒ đã commit + push mẫu 2 lên GitHub (andrewclasses-01/myGame, nhánh main). ⏸ Tạm dừng ở mẫu 2.

## Rocket Race mẫu 9 — 13/10/2026 · iPAD THAM GIA GAME (bắn tên lửa + BOOST trên iPad) · phiên máy MSI
**Bối cảnh.** Thầy: "Đọc Rocket Race trên AWord và myGame để chuẩn bị build tiếp" ⇒ soát đồng bộ: AWord local tụt 1 commit (Đợt 510, không liên quan) ⇒
`pull --ff-only`; myGame = origin. AWord từ `156cf57` tới `c7f8296` chỉ đổi `rocket-race.js` (+4 dòng claim iPad Đợt 508) ⇒ 7 file 3D của `game8` vẫn khớp từng dòng
(chỉ khác import three + dòng ghi chú) ⇒ KHÔNG cần game9.
Rồi thầy: *"thêm một chế độ cho tính năng điều khiển bằng ipad … bấm vào nút ipad ở game sẽ hiện tùy chọn, làm nơi đọc câu hỏi hay tham gia game · tham gia game thì
chuyển toàn bộ phần bắn tên lửa và tránh vào ipad. Trên màn hình game vẫn hiển thị nhưng điều khiển ở ipad"*. Chốt qua AskUserQuestion:
2 iPad (mỗi đội 1) · màn lớn VẪN bấm được (cả hai) · iPad có: nút BẮN + BOOST to, báo động tên lửa tới, tiếng + rung, vị trí 2 tàu · làm MẪU myGame trước.

**Đã làm** (`rocket-race/`):
- `core/rr-padlink-9.js` — nối HAI CHIỀU, gốc SPEED RUN `sr3d-padlink-2.js` (bản hai chiều của STAR LOOT 2q đã thử iPad thật). Bỏ tay lái liên tục; iPad → game lệnh rời
  `fire` / `boost` / `load` (+ nhịp tim `p:`); game → iPad `i:<JSON>` (trạng thái, CHỈ gửi khi khác lần trước) + `e:<sự kiện>` (mplus · fire · boost · dodge · hit ·
  refuse-fire · refuse-boost · win · lose). Host có `state(t,obj)` / `event(t,name)` / `status(t)` / `attached`; `detach()` báo `status(t,"")` cho cả 2 đội.
  Bảng QR 2 đội (`panel(el)`) có link bấm được. Đường dự phòng qua kho: lệnh vẫn đi, trạng thái KHÔNG về (iPad ghi "Slow link").
- `core/rr-padui-9.js` — màn iPad: ngang = FIRE trái / BOOST phải; dọc = trên/dưới. FIRE: 2 ô bệ (đỏ dần theo `ck` lúc nạp, sáng + nhấp khi sẵn sàng, ô vượt
  Missiles max mờ), "+N" quả dự phòng, cột vạch chuỗi câu đúng; nhãn FIRE / LOAD / NO MISSILES / PEACE. BOOST: 5 đoạn, đầy thì phát sáng + tiếng. Báo động:
  `thr` = giây tới lúc nổ ở tàu mình (bỏ quả đã né/bay qua; CỘNG quả bay vào tàu kia khi 2 tàu cùng nấc — trúng lan) ⇒ viền đỏ + "⚠ INCOMING x.x s" + bíp
  nhanh dần (560 → 300 → 140 ms); trong cửa sổ né (1,25 s) mà có BOOST ⇒ nút BOOST chớp "BOOST NOW!". Đường đua mini 2 tàu + "nấc / L". Màn phủ:
  WAITING / CONNECTING / READY / YOU WIN! / YOU LOSE. Tiếng Web Audio tổng hợp (mở khoá ở lần chạm đầu — iOS). Rung chỉ khi trang đã được chạm (Chrome báo
  lỗi nếu chưa) — Safari iPad không có rung. Wake Lock giữ màn sáng.
- `pad-9.html?t=0|1` (không ?t ⇒ chọn đội) — kênh `localSignal("rrpad9")`.
- `mau-9-ipad-dieu-khien.html` — chép mẫu 8 (dùng NGUYÊN game8): hàng nút dưới khung (Options/Mode mờ, iPad thật) ⇒ bảng chọn **Off · Question screen · Game
  controller** (nhớ `localStorage rr9.ipad`, `?ipad=ctl` cho bàn thử). Đổi chế độ KHÔNG chơi lại trận. Game controller ⇒ `host.attach` + QR 2 đội; nút iPad có 2 chấm
  trạng thái + chip "iPad ●" góc khung mỗi đội. Question screen trong mẫu chỉ là ghi chú (đã có trên AWord Đợt 368/508). Gửi trạng thái 10 lần/giây.
  ⭐ Luật tên lửa trong trang CHÉP AWord hiện tại (mẫu 8 còn luật 7d 1 ô ⇒ lệch game8): `loaded` = số quả trên bệ, `CAP` 2, `load` thử lại 0,4 s khi view từ chối +
  nạp tiếp 0,6 s, `fireMissile` ⇒ `M.launch` trả false thì từ chối, tự nạp quả kế 0,7 s, `missileEnd` tag "half" = 50 % làm tròn LÊN, Missiles max 0–5 + ∞.
  Bảng thử: link mở 2 tab iPad, nút "+1 quả" nay tự lên nòng.
- `index.html` thẻ MẪU 9 lên đầu.

**Đã tự kiểm** (Browser pane, 3 tab: game + iPad đội 1 + iPad đội 2): 2 iPad nối thẳng (rtt 1 ms), chip + chấm xanh · 3 câu đúng ⇒ iPad đội 1 thấy ô "r", FIRE sáng,
BOOST đầy, 5/10 · bấm FIRE trên iPad 1 ⇒ quả bay về đội 2, iPad 2 báo "INCOMING 3.3 s" · tới 0,98 s: iPad 2 "BOOST NOW!" + báo động mức 2 ⇒ bấm BOOST trên iPad 2
⇒ NÉ (tiến 0 → 1, không trúng) · bắn lại không né ⇒ trúng, iPad 2 nhận `hit`, lùi về 0 · iPad 2 bấm FIRE/BOOST khi không có ⇒ `refuse-fire` / `refuse-boost` (nút lắc) ·
đội 1 về đích ⇒ iPad 1 "YOU WIN!", iPad 2 "YOU LOSE" · bắn từ MÀN LỚN vẫn chạy song song · 0 lỗi console (sau 2 sửa dưới) · chụp iPad ngang 1180×820 + dọc 820×1180.

**Lỗi gặp + gỡ.**
- `const pop` (bảng chọn iPad) trùng `function pop()` (đếm 3-2-1) cùng scope module ⇒ SyntaxError, cả trang chết ⇒ đổi `ipop`.
- `navigator.vibrate` trước khi chạm trang ⇒ Chrome báo lỗi đỏ ⇒ kiểm `navigator.userActivation.hasBeenActive`.
- Bàn thử: Browser pane ẩn ⇒ rAF 0 khung ⇒ lái bằng `__view.step` + chờ giờ thật (luật hẹn câu mới bằng setTimeout 1,5 s).

**Khi ghép AWord (đề xuất, chưa làm):** nút iPad (engine `qScreenBtn`) mở bảng 3 chế độ thay vì bật/tắt; `fightScreen` true/false ⇒ thêm giá trị "ctl" (hoặc khoá riêng)
— Question screen vẫn phải dựng lại trận, Game controller thì không · kênh bắt tay Firestore khuôn `templates/maze-chase/sl-pad-signal.js` (3 tài liệu riêng
`rrpad_host/pad0/pad1`, thêm kind vào APP_DATA_KINDS) · `pad.html` đọc `ipad_now` {game:"rocketrace", ctl:true} ⇒ mở màn tên lửa thay vì source.html (claim cần trường mới)
· chép `rr-padlink-9.js` + `rr-padui-9.js` vào `templates/rocket-race/` · trong `rocket-race.js` các hàm ms* gọi padEvent, thêm padState (đọc `v.missile.slots/flights/inSplash`) ·
PEACE: gửi `pc` (UI đã có nhãn PEACE). ⚠️ Câu hỏi để thầy chốt khi ghép: Question screen + Game controller có được bật CÙNG LÚC (3 iPad) không — mẫu 9 chọn một.

### Mẫu 9 · sửa 1 (13/10, cùng phiên) — BỎ QR, iPad chọn đội từ trang chủ AWord
Thầy: *"Tôi không muốn quét qr mà bấm vào nút ipad trên trang chủ AWord là mở ra chọn team luôn. Tất cả đều cùng đăng nhập kho AWord (firebase) như nhau từ đầu rồi"*.
Soát AWord: trang chủ đã có nút iPad ⇒ `pad.html` (`main.js:3026`, Đợt 480) — màn chọn đội + nghe `ipad_now` (Đợt 508); bắt tay STAR LOOT qua `users/{uid}/items` cùng tài khoản
⇒ luồng thầy muốn KHỚP hạ tầng sẵn có, chỉ cần thêm nhánh "rocketrace + ctl".
- Máy chiếu ghi tài liệu `now` {game:"rocketrace"|"", ctl} mỗi lần đổi chế độ (+ `pagehide` ⇒ game ""). Bảng Game controller bỏ QR, chỉ còn 2 thẻ đội + trạng thái
  ("iPad connected" / "Waiting for an iPad") + hướng dẫn "AWord home ▸ iPad ▸ choose the team".
- `pad-9.html` viết lại = GIẢ LẬP `pad.html`: nghe `now` (vào game 0,3 s, về màn chờ 1,5 s như AWord) ⇒ màn chờ "iPAD READY" (link Choose team) · ctl + chưa có đội ⇒ màn
  chọn đội (nhớ đội — bàn thử sessionStorage mỗi tab 1 iPad; AWord thật `aw.ipadTeam` localStorage) · ctl + có đội ⇒ bảng tên lửa tự nối · Question screen ⇒ màn ghi chú.
  Nút ‹ trên bảng tên lửa ⇒ chọn lại đội.
- ⭐ 2 iPad chọn TRÙNG đội: trước đây sẽ GIÀNH NHAU MÃI (host đổi nonce ⇒ đóng kênh iPad cũ ⇒ iPad cũ tự chào lại sau 0,8 s ⇒ cướp lại…). Nay host gửi `k:` cho kênh cũ
  trước khi đóng ⇒ iPad cũ vào trạng thái `kicked` (không chào lại, không nudge) ⇒ màn "TEAM 1 IS ON ANOTHER iPAD" + nút **Take it back** (`client.reconnect()`) / **Choose team**.
  Trận mới (sid mới) ⇒ bỏ `kicked` (chỉ giành 1 lần, không lặp). Host ghi `c0/c1` vào tài liệu host ⇒ màn chọn đội ghi "iPad already connected" dưới đội đã có iPad.
- Rung: Chrome chặn `vibrate` khi chưa có cú chạm THẬT (userActivation không đủ — click bằng script cũng bật nó) ⇒ chỉ rung sau `pointerdown` có `isTrusted`.
- Tự kiểm (3 tab): iPad A chọn TEAM 1 lúc máy chiếu Off ⇒ màn chờ · máy chiếu ▸ Game controller ⇒ A tự vào bảng tên lửa, nối · iPad B mới mở ⇒ màn chọn đội ghi
  "TEAM 1 · iPad already connected" · B chọn TEAM 1 ⇒ B nối, A "IS ON ANOTHER iPAD" và ĐỨNG YÊN (3 s sau vẫn kicked, không giành lại) · A ▸ Choose team ▸ TEAM 2 ⇒ 2 đội
  đều "on", chip xanh cả 2 · Off ⇒ cả hai về màn chờ · Game controller lại ⇒ cả hai TỰ vào lại đúng đội đã nhớ · bắn từ iPad ⇒ quả bay · 0 lỗi mới trong console.
- ⚠️ Bàn thử: tab nền bị trình duyệt hãm hẹn giờ ⇒ "về màn chờ 1,5 s" có lúc > 2 s; iPad thật luôn ở tiền cảnh.

### Mẫu 9 · sửa 2 (13/10, cùng phiên) — BẢNG 3D TRÊN iPAD GIỐNG HỆT GAME
Thầy: *"Tôi muốn thiết kế lại phần xem trên ipad. Vạch, tên lửa, nút boost cần có thiết kế 3D giống hệt trên game thật"*.
**Quyết định: KHÔNG vẽ lại — iPad chạy CHÍNH mã bảng của game.** Bảng tên lửa nằm trong `rr3d-missile.js` (`buildConsole` dựng, `tickUI` hoạt ảnh) và chỉ cần
`createMissiles(X)`; nó dựng được với `rockets: []` (mọi chỗ dùng tàu đều ở hàm chạy lúc trận). Chỉ vướng: trạng thái ô (`SL`) do máy trạng thái nội bộ chạy
(loadFx/tickSlots cần tàu) và `threatFor` đọc đường bay/tàu ⇒ thêm CHẾ ĐỘ GƯƠNG.
- `game9/` = chép `game8/` (rẽ thư mục mới vì sửa file game). `game9/rr3d-missile.js` thêm: `MIR[side]` + `threatFor` đọc `MIR` nếu có · `mirror(side, {sl:[[st,k]], threat})`
  đặt `SL` theo máy chiếu và CHẠY ĐÚNG hoạt ảnh chuyển trạng thái của game (empty→shuttle ⇒ `U.load` quả nhỏ bay sang ô · charge→ready ⇒ loé `B.flash` · →firing ⇒ `B.fireK`
  quả lùi khỏi màn); k nạp chỉ ghi đè khi lệch > 0,15 (giữa 2 lần gửi iPad tự chạy) · `mirrorTick(side, dt)` thay `tick()` (shuttle 0,5 s → charge, k += dt/2 s,
  đếm lùi threat, rồi `tickUI`) · `mirrorFlash` (MISSILE +1) · `get ui`. Game KHÔNG đổi hành vi (MIR luôn null trên máy chiếu).
- `core/rr-padscene-9.js` (mới): renderer + hậu kỳ y `rr3d-view.js` (ACES 1,05, RoomEnvironment 0,45, render target HalfFloat MSAA 4, lọc NaN, bloom 0,85/0,65/1,05,
  OutputPass, vignette + hạt; bỏ lệch màu rìa), đèn = ánh mặt trời game. `buildConsole({side: team}, inner, {w:16, h:0}, pad 1,4, cm 1)` — cùng cỡ cm như bàn TOMKO.
  Bố cục: NGANG ⇒ `U.am` trái, `U.bst` dời sang phải bằng NHÓM CHA (`tickUI` ghi `bst.position.x` để rung ⇒ không đặt x trực tiếp được); DỌC ⇒ trên/dưới. Máy quay tự lùi
  vừa khít (lề 12 %). `U.warn` (khung đỏ cảnh báo của game) thay hình = khung vừa VIỀN MÀN iPad. Chạm: raycast `hitList` (đúng 3 vùng chạm game: quả nhỏ = nạp, quả to = bắn,
  BOOST) ⇒ `M.tap()` (nhấn lún như game) ⇒ `onKey` ⇒ gửi. Gửi không được ⇒ `api.refuse` (lắc như game).
- Trang game: `padState` gửi `ar` = đúng đối tượng `setArsenal` (∞ = −1) + `sl` = `[st, k]` thật của view (bỏ mã 1 chữ / SLOT_CODE); import game9.
- `rr-padui-9.js`: bỏ nút FIRE/BOOST HTML (+ SVG, CSS), bỏ viền đỏ HTML (khung 3D thay); giữ thanh trên, chữ "INCOMING x s · BOOST NOW!", tiếng, rung, màn phủ.
  `pad-9.html` thêm importmap three r170 + font Baloo 2 (nhãn "+X" của bảng dùng FONT_UI).
- Tự kiểm (ngang 1180×820 + dọc 820×1180): 2 quả đỏ sẵn sàng phát sáng + cột vạch + BOOST đầy phát sáng cyan — y bảng game · ô đang nạp đỏ dần từ đuôi (shader fillMat) ·
  chạm BOOST trên bảng 3D ⇒ gửi "boost" ⇒ máy chiếu tiến 6 → 7 · chạm quả to ⇒ "fire" ⇒ quả bay sang đội 2 · đội 2 bắn ⇒ khung đỏ 3D viền màn iPad + "INCOMING 3.1 s" ·
  0 lỗi mới. Chưa đo tốc độ khung trên iPad THẬT (bloom + MSAA HalfFloat) — nếu nặng: bỏ MSAA / hạ pixelRatio như rr3d-autores.

### Mẫu 9 · sửa 3 (13/10, cùng phiên) — 5 ý thầy sau khi xem bảng 3D
Thầy: *"Còn thiếu số lượng tên lửa trên đầu · Thanh năng lượng ngắn quá, phải bố trí đều đẹp · Khi tên lửa bay từ tàu A sang B thì đoạn mô hình 2 tên lửa cũng có
1 tên lửa 2D bay theo đúng những gì bay trên game thật để mô phỏng lại. Va chạm mà nổ thì cũng có nổ ở đó · Bỏ chữ connected 2ms đi · Bỏ 3 cái gạch gạch ở đáy dấu boost
của cả ipad và game thật đi"* (kèm ảnh icon BOOST).
1. **Số tên lửa trên đầu** (`rr-padscene-9.js`): sprite canvas trên cụm quả to (x = `U.bigX`, y = 0,5 ammoH), chữ kiểu nhãn "+X" của game (FONT_UI 900, viền đỏ `#ff6a6a`,
   PEACE viền xanh): "N MISSILES" / "1 MISSILE" / "NO MISSILES" (mờ). N = reserve + loaded (quả trên bệ, kể cả đang nạp). Vẽ lại chỉ khi đổi.
   ⚠️ Em hiểu "trên đầu" = trên đầu khu tên lửa của bảng iPad — nếu thầy muốn ở chỗ khác (vd. trên tàu ở đường đua mini, hay cả trên màn lớn) thì chuyển.
2. **Cột vạch đều** (`game9/rr3d-missile.js` `buildMsPips`): `U.pipsSpan = { y0, H }` thì dùng thay chiều cao theo số ô dự phòng; iPad đặt −0,36…+0,36 ammoH (cao bằng
   cụm 2 quả to) ⇒ 3 vạch dài đều nhau. Màn lớn không đặt ⇒ không đổi.
3. **Tên lửa 2D trên đường đua mini** (`rr-padui-9.js`): đường đua cao 7 → 12 vmin. Máy chiếu gửi thêm `fl` = [id, từ, tới, t, dur] của `M.flights` (t làm tròn 0,1 s;
   iPad tự chạy t giữa 2 lần gửi, chỉ chỉnh khi lệch > 0,2 s). Vị trí: từ tâm tàu bắn tới tâm tàu bị bắn (bám vị trí tàu mới nhất), nhanh dần cuối đường, vồng LÊN
   rồi lao XUỐNG (sin), mũi xoay theo hướng bay; hình tên lửa SVG đỏ (PEACE xanh) có quầng sáng. Nổ: máy chiếu báo CẢ 2 iPad — `boom:<tàu>` khi trúng (nổ tại tàu đó, gỡ
   quả đang lao vào nó) · `clash` khi 2 quả đâm nhau (nổ TO giữa 2 quả, gỡ cả 2). ⚠️ `clash()` của game gọi `onEnd` cho CẢ 2 tàu cùng lúc (mỗi tàu "clash" hoặc
   "hit/half") ⇒ trang game nhận ra vụ đâm nhau qua `M.lastClash.at` đổi, báo "clash" MỘT lần và bỏ "boom" của các lần gọi trong 60 ms đó. Quả biến mất không kèm sự kiện
   (né rồi nổ xa) ⇒ khói nhỏ "puff".
4. Bỏ chữ "Connected · x ms" — còn chấm đèn xanh (các trạng thái khác vẫn có chữ: Connecting…, Slow link, …).
5. Icon BOOST (`game9/rr3d-missile.js` `boostIcon`): bỏ 3 vạch tốc độ dưới đáy, 2 mũi tên kép dời xuống 16 px cho cân giữa ô. Áp cho iPad + màn lớn mẫu 9; AWord (game thật đang
   chạy) đổi khi ghép.
- 🐞 Gặp: bảng gương CHƯA nhận trạng thái đầu tiên (đang chờ nối) ⇒ `threatFor` rơi xuống `inSplash` hỏi `rockets[side].p` (iPad không có tàu) ⇒ văng lỗi MỖI KHUNG (173 lỗi
  console). Sửa: `mirrorTick` đặt `MIR[side] = { threat: ∞ }` nếu chưa có. Lần kiểm trước không thấy vì đọc console bằng bộ lọc sai.
- 🐞 Bàn thử: iPad giả đứng màn chờ dù máy chiếu đã bật Game controller — kho cục bộ RƠI một lần báo "now" khi 2 trang cùng đang nạp ⇒ `pad-9.html` tự đọc lại "now"
  mỗi 3 s (AWord thật dùng onSnapshot, không cần).
- Tự kiểm: nhãn "1 MISSILE" sau khi bắn 1 trong 2 quả · cột 3 vạch cao đều · icon BOOST không vạch · không còn chữ Connected · 2 đội bắn cùng lúc ⇒ 2 tên lửa 2D vồng
  ngược chiều trên đường đua mini ⇒ game đâm nhau (lastClash) ⇒ iPad nổ TO giữa đường, 2 quả biến mất (ảnh chụp) · bắn trúng ⇒ iPad nhận `boom:1` · 0 lỗi mới.

### Mẫu 9 · sửa 4 (13/10, cùng phiên) — bố cục khu tên lửa iPad ĐÚNG bảng game
Thầy gửi ảnh bảng game (cột 4 tên lửa con + nhãn "+2" trên đỉnh + 2 quả to đã nạp): *"Phần tên lửa đã nạp, tên lửa con và tên lửa chờ được thiết kế như này cơ mà.
Hãy sửa lại thiết kế"*. ⇒ "số lượng tên lửa trên đầu" ở sửa 3 nghĩa là NHÃN "+X" CỦA GAME trên đỉnh cột tên lửa con (số quả CHỜ vượt 4), không phải nhãn mới.
- `rr-padscene-9.js`: BỎ nhãn "N MISSILES" (sửa 3 ý 1). Bảng vẫn do `buildConsole`/`tickUI` của game vẽ nên tên lửa con + "+X" + 2 quả to y game (chúng vốn có, chỉ cần
  khung nhìn đủ chỗ). Cột vạch: `pipsSpan` = đúng công thức `buildMsPips` khi Missiles max = ∞ (4 ô: đáy = (slotY(0) − 0,52·pitch)·ammoH, cao 4·0,3·1,05·ammoH) ⇒ thẳng
  hàng cột tên lửa con, luôn dài (game ở max 3 chỉ cao 1 ô). Khung nhìn tính theo nội dung thật: đáy cột vạch → đỉnh nhãn "+X" (≈ 1,06 ammoH), căn giữa bằng `AM_MID`
  (trước: đặt khu tên lửa lệch lên +0,12 ammoH ⇒ nhãn "+X" sẽ bị cắt mép trên khi có ≥ 5 quả dự phòng).
- Tự kiểm (`?max=inf`, đội 1: 2 quả nạp + 6 dự phòng): iPad ngang + dọc hiện "+2" · 4 tên lửa con · 2 quả to · cột 3 vạch cao bằng cột tên lửa con — khớp ảnh thầy · 0 lỗi mới.

### Mẫu 9 · sửa 5 (13/10, cùng phiên) — 4 ý thầy
Thầy: *"Sửa cả màn lớn cho cột vạch cao 4 ô luôn · Nâng 2 tên lửa lớn ở ipad lên giữa và cho cân bằng với nút boost (nút boost có thể không cần ở trung tâm) · 2 tên lửa
mô phỏng phải có size bằng nhau · Phần đích x/10 ghi số % tương tự vạch % trong game thật"*.
1. `game9/rr3d-missile.js` `buildMsPips`: cột vạch LUÔN cao `MINI_N` (4) ô, đáy = (slotY(0) − 0,52·pitch)·ammoH — bỏ công thức theo số ô dự phòng của trận và bỏ `U.pipsSpan`
   (iPad dùng chung). Đo màn lớn (Missiles max 3): cột cao 1,26 ammoH cả 2 đội (trước 0,315 = 1 ô). ⇒ khi ghép AWord: đổi dòng này trong `rr3d-missile.js`.
2. `rr-padscene-9.js` NGANG: tâm 2 quả to (y 0 của `U.am`) ĐÚNG giữa chiều cao màn; BOOST cùng độ cao với tâm đó; khung nhìn đối xứng = 2·max(đỉnh nhãn "+X", đáy cột vạch)
   ⇒ bảng nhỏ hơn chút (phải chừa chỗ đỉnh "+X" lẫn đáy cột vạch) nhưng cân. DỌC giữ như cũ (tên lửa trên, BOOST dưới).
3. Đường đua mini: 2 tàu CÙNG cỡ 5,8 vmin, tàu địch hết mờ (trước: tàu mình 6,4, địch 5 + mờ 0,8). (Em hiểu "2 tên lửa mô phỏng" = 2 tàu trên đường đua mini — 2 tên lửa 2D
   đang bay vốn đã cùng cỡ.)
4. Chỗ đích "x / 10" ⇒ **%** như thanh % của game (AWord Đợt 444 `view.lead()`): tàu DẪN ĐẦU đã đi bao nhiêu phần đường = round(100·max(p)/L).
- Tự kiểm: iPad ngang — 2 quả to giữa màn, BOOST ngang hàng, 2 tàu mini cùng cỡ, "40%" (đội 1 ở nấc 4/10) · 0 lỗi mới.

## Rocket Race mẫu 9 ⇒ ✅ ĐÃ GHÉP AWORD Đợt 511 (13/10, cùng phiên) · myGame `4755fe1` · AWord `20110c4` · mẫu 10
Thầy: *"Commit + push myGame đi. Và đưa lên Aword đi."* ⇒ push myGame `4755fe1` (mẫu 9) ⇒ ghép AWord **Đợt 511** `20110c4` (17 file, +1082 dòng):
- AWord `rr3d-missile.js` = game9 (vá diff game8→game9, 4 khúc; cần `patch --binary` vì file CRLF) · `rr3d-view.js` getter `trackLen` · 3 file iPad chép `core/*-9.js`
  (đổi import sang `./vendor/three/...` — AWord vendor đã đổi addon sang đường tương đối nên KHÔNG cần importmap) · `rr-pad-signal.js` Firestore (khuôn sl-pad-signal) ·
  `rocket-race.js` máy chủ iPad (rrPadStart/rrPadState/padEvent…) · core: nút iPad 3 thẻ (engine, option `fightPad`), `ipad-now` thêm `ctl`, kind `rocketrace-pad`, pad.js nhánh RR.
- Thử trên AWord (dev 5511, `scratch/dot511-ipad-ctl.html?padsig=local&raf=1` + `pad.html?padsig=local`): iPad tự vào chọn đội ⇒ nối 3 ms ⇒ bảng 3D đúng ⇒ bắn từ iPad
  trúng tàu đội 2 ⇒ đổi Questions ⇔ Controller qua bảng 3 thẻ, iPad tự theo · 0 lỗi.
- Gặp (sửa CẢ 2 kho): `.mp-3d-err{display:grid}` đè `hidden` ⇒ thêm `.mp-3d-err[hidden]{display:none}`. Bàn thử AWord 2 tab chung localStorage ⇒ chung đội ⇒
  `?padsig=local` lưu đội ở sessionStorage (core/ipad-now.js).
- Đồng bộ: `tools/chep-aword-sang-game.py game10` ⇒ game10 = AWord 20110c4 (khác game9: dòng ghi chú + `trackLen`) · `mau-10-khop-aword.html` (mẫu 9 trên game10,
  thử chạy được: trackLen 10, iPad nối). Thẻ MẪU 10 lên đầu rocket-race/index.html.

## Train Rush 1at — 14/10/2026 · mở vào Fight · thùng không văng theo tàu · điểm chỉ khi chắc chắn · máy bay mang LEVEL · phiên máy MSI
**Bối cảnh (thầy):** đọc Train Rush (myGame) + AWord chế độ Fight rồi sửa cùng 8 ý — mặc định Fight; thùng đã xuống tàu không bị tăng tốc văng đổi kết quả; khinh khí cầu
nhỏ + cao, chỉ chồng ≥ 3 tầng mới va; điểm chỉ khi chắc chắn; bị bật ra ⇒ trừ; khinh khí cầu tối đa ×2; máy bay mang LEVEL thay điểm; thú chạy gần đường đua.
**Đã làm:** mẫu `balloon-pop/mau-1at-train-rush.html` + `core/bp3d-1at.js` · `fight-1at.js` · `west-world-1at.js` · `animals-1at.js` · `sign-chase-1at.js`. Chi tiết kỹ thuật +
số đo: `balloon-pop/NGHIEN CUU GAMEPLAY.md` mục 44. Ghép AWord Đợt 521 (`tools/chep-train-rush.py` GOC fight-1at; `balloon-pop.js` mặc định Fight cho thầy, bấm Single ⇒ act
đó ở lại Single).
**Quyết định:** khung toa (cộng Δv tàu vào thùng đang nằm trên tàu) thay vì tăng ma sát / gắn chặt thùng — vẫn còn vật lý thật (nảy, lật khi rơi lệch, khinh khí cầu húc
chồng cao), chỉ bỏ lực quán tính do tàu tăng tốc. Điểm ngay chỉ ở ca "chạm thẳng nóc + trọn thân trên nóc + gần phẳng"; mọi ca khác chờ nằm yên.
**Lỗi gặp:** (1) dòng chặn trượt 1as lọt sau `//` (đã vá, xem mục 44). (2) làn khinh khí cầu xa đặt bằng làn gần ⇒ quả cao nhất lòi khỏi mép trên (đo NDC 1,01) ⇒ hạ làn xa.
(3) `sed -i` của Git Bash đổi CRLF ⇒ LF — chuẩn hoá lại bằng Python trước khi commit (file gốc có 5 CR trần `
`, giữ nguyên).

## Train Rush 1au — 14/10/2026 · iPad thấy nhiều toa hơn · thả nhiều toa cùng lúc · phiên máy MSI
**Bối cảnh (thầy):** iPad hiển thị ít quá ⇒ thu nhỏ để thấy toàn cảnh các ô tàu, thả được nhiều ô cùng lúc (đổi cả game chính); toa cần từ đầu tiên lùi về trái để kịp đọc chữ khinh khí cầu.
**Đã làm:** `balloon-pop/mau-1au-train-rush.html`, `pad-1au.html`, `core/bp3d-1au.js`, `core/fight-1au.js`, `core/tr-padui-1au.js` — chi tiết + số đo: `balloon-pop/NGHIEN CUU GAMEPLAY.md` mục 45.
**Quyết định:** chỉ đổi Fight (Single giữ lần lượt); 2 toa mở cùng lúc; iPad dãn dọc riêng vùng trời thay vì để trống nửa màn.
**Thầy bác bản nháp đầu:** nối liền toa đáp án + khung vàng ▼ ⇒ sửa: đoàn tàu GIỮ NGUYÊN y màn lớn (2 toa phụ), bỏ đánh dấu vàng; VIS 40 → 48, FOC 42 → 45 %; rồi thầy chê chữ trên toa tràn viền ⇒ bảng phủ kín hông toa + cỡ chữ tối thiểu theo cỡ toa, VIS về 40, FOC 46 %.
**Lỗi gặp:** khai `const top` trùng tên biến có sẵn trong `draw()` ⇒ SyntaxError giết cả mô-đun iPad (đổi `skyTop`); trang game bị phủ iPad giả ⇒ rAF game rất chậm ⇒ lái bằng `__fight.step`.

## Train Rush 1av + Rocket Race iPad — 14/10/2026 · GIẢM TẢI màn iPad (iPad nóng) · phiên máy MSI
**Bối cảnh (thầy):** chơi Rocket Race với iPad thấy khá nóng ⇒ nghiên cứu + đo phương án (gợi ý 25 khung/giây; iPad không cần mượt), cả Train Rush.
**Đã làm:** đo bằng giờ GPU (3D) / ép vẽ xong mỗi khung (2D) ở khổ iPad ×2 ⇒ Train Rush `core/tr-padui-1av.js` (25/8/10 khung/giây, độ nét ≤ 1,5, gradient dùng lại,
bớt tô chồng) + Rocket Race (gốc AWord `rr-padscene.js`: 25 khung/giây, độ nét ≤ 1,5, tắt antialias; bản chép tra `rocket-race/core/rr-padscene-12.js`). Chi tiết + số
đo: `balloon-pop/NGHIEN CUU GAMEPLAY.md` mục 46. Ghép AWord Đợt 523.
**Quyết định:** chọn thưa khung + bớt điểm ảnh (hiệu quả chắc, mọi máy) thay vì tối ưu từng lệnh vẽ. **Lỗi/ngõ cụt:** canvas nền đệm chậm hơn; đo JS-only nói dối (xem mục 46).

## Racing Words 3p — 15/10/2026 · MƯỢT + CHẠM ĐÚP BỎ INTRO · phiên máy CLASSES
**Bối cảnh (thầy):** sau AWord Đợt 528 "game chạy được nhưng khá lag — tham khảo cách tối ưu của Train Rush, trải nghiệm mượt nhất" + "double tap vào intro để vào màn chuẩn bị start luôn".
**Đã làm:** mẫu 3p (`speed-run/mau-3p-muot.html`, core `rw-3p` / `sr3d-3p` / `sr3d-car-3p` / `sr3d-intro-3p` / `sr3d-carmeta-3p`) — gộp lưới xe theo vật liệu, bỏ kính transmission,
bảng số đo 13 xe (bỏ ~200 tia/xe), cắt mũi xe bằng shader, prewarm (compileAsync đúng đích vẽ + 2 kiểu số đèn + hậu kỳ + texture + chỗ cháy làm sẵn) + pinPrograms, chạm đúp bỏ phim.
Số đo trước/sau + chi tiết: `speed-run/NGHIEN CUU GAMEPLAY.md` mục 28. Đưa lên AWord Đợt 529 (`tools/chep-racing-words.py` GOC = rw-3p.js).
**Quyết định:** đo bằng Chrome riêng điều khiển qua CDP (khung trình duyệt của app bị ẩn ⇒ rAF đứng, số đo sai) · gộp lưới thay vì hạ độ nét (nghẽn CPU, không phải GPU).
**Lỗi/bẫy gặp:** (1) `renderer.compile()` không có đích vẽ ⇒ khoá shader khác lúc vẽ vào render target ⇒ dịch phí; (2) khoá shader gồm SỐ ĐÈN camera thấy (đèn theo lớp);
(3) `compile()` bỏ qua `material.clippingPlanes`; (4) heredoc bash nuốt dấu gạch chéo ngược trong chuỗi JS ⇒ trang đen "Invalid or unexpected token"; (5) bộ tự chỉnh nhớ độ nét thấp từ lúc còn khựng ⇒ đổi khoá.

## Racing Words 3q — 15/10/2026 · FIGHT (Lives · Missile damages · Time delay · Miss wait) · CẢNH XA ĐÚNG VẬT LÝ · 35 km/h · phiên máy CLASSES
**Bối cảnh (thầy):** cảnh xa đổi bất hợp lý gây chóng mặt · tốc độ thường 35 km/h, dưới 40 km/h lên cầu nhảy chỉ chạy qua + rung khi chạm đất · Options như Fight Rocket Race · mặc định Fight.
**Đã làm:** mẫu 3q (`speed-run/mau-3q-fight.html`) — đường cong theo tiếp tuyến ngoài 150 m ở mọi shader + trời xoay cùng; VBASE 35 km/h, `lowDrop`; Same = theo lượt với
Time delay / Miss wait; Lives (vạch cột kính, hết ⇒ nổ, đội kia thắng); Missile damages 1–5; streak / Missiles max 0–10. Chi tiết + số đo: `speed-run/NGHIEN CUU GAMEPLAY.md` mục 29.
Lên AWord Đợt 531 (GOC rw-3q.js, CSS rw-3q.css; AWord thêm cờ `fightOnly` để màn chọn sáng FIGHT, mờ SINGLE).
**Quyết định (thầy chốt qua câu hỏi):** Same = theo lượt (Different giữ nhịp riêng) · hết mạng = xe nổ, đội kia thắng · Missile damages = mức 1–5 (thời gian xoay / đứng / khói).
**Lỗi/bẫy:** đo trong khung trình duyệt của app vẫn sai (ẩn) ⇒ dùng Chrome CDP; heredoc bash lại nuốt `\n` ⇒ viết script bằng file.

## Train Rush 1aw — 15/10/2026 · 1 ĐIỂM/THÙNG · TỐC ĐỘ +5 %/MÀN · BỎ NGƯỜI TRONG TOA · phiên máy nhà
**Bối cảnh (thầy):** mỗi hộp rơi trúng đích chỉ tính 1 điểm · sau mỗi màn tốc độ tăng một chút tính từ tốc độ Options ban đầu · bỏ hẳn người chạy trong toa để nhẹ máy. Sửa cả myGame và AWord.
**Đã làm:** mẫu 1aw (`balloon-pop/mau-1aw-train-rush.html`, lõi `core/bp3d-1aw.js`, trận `core/fight-1aw.js`, toa `core/coach-1aw.js`): điểm thùng 5 → 1 (x2 ⇒ 2);
`levelBoost` +5 %/màn (trần ×1,75) cho cả tàu lẫn khinh khí cầu, màn 1 = đúng nấc Options (bỏ +4 %/toa và +6 %/màn cũ); không dựng người trong toa, bỏ hoạt cảnh hoảng/chạy,
rèm toa thôi dùng kính truyền sáng (transmission — vẽ thêm cả cảnh mỗi khung). Chi tiết: `balloon-pop/NGHIEN CUU GAMEPLAY.md` mục 47. AWord: `tools/chep-train-rush.py` GOC = fight-1aw.js.
**Quyết định:** tăng tốc theo SỐ MÀN (không theo số toa) để Levels Off cũng đúng nấc Options; rèm đục thay kính mờ vì không còn gì phía sau để làm nhoè.
**Còn để nguyên, chờ thầy:** thưởng giờ thừa (1 giây = 1 điểm) giờ lớn hơn hẳn điểm thùng; Points off tối đa −10; toa than −2; bonus +10.

## Racing Words 4e — 16/10/2026 · SETTINGS MỌI NƠI + TẠM DỪNG · MẶC ĐỊNH MỚI · BAY XA · NGHIÊNG ĐÚNG CHIỀU · ẢNH LOADING RIÊNG (= AWord Đợt 537) · phiên máy nhà
- **Thầy:** 8 việc sau 4d (Settings cả trong intro, ảnh load riêng thay ảnh STAR LOOT, bỏ chữ phủ xưởng, Settings tạm dừng, mặc định Drive on iPad+Tilt/Cockpit/Sky Off/Traffic Off,
  bay xa hơn khi lên ramp bằng boost, nghiêng theo vô lăng + đáp nghiêng = BAD mất lái, Options làm mờ thanh không dùng) — "phải đảm bảo hiệu năng không bị ảnh hưởng".
- **Làm:** mẫu 4e = `rw-4e.js` · `sr3d-4e.js` · `sr3d-intro-4e.js` · `rw-4e.css` · `mau-4e-cai-dat-moi-noi.html` · `rw-loading.webp` (commit `41f798b` + `3f5f9a6`). Chi tiết + số đo: `speed-run/NGHIEN CUU GAMEPLAY.md` mục 39.
- **Quyết định:** khoá nhớ máy đổi `.v2` để mặc định mới có hiệu lực cả trên máy đã thử; chế độ iPad nhớ theo máy cả trong AWord; ảnh loading chụp từ chính xưởng intro (biển đã có chữ ⇒ màn chờ không phủ chữ).
- **Lỗi & gỡ:** Settings không hiện trên xưởng = bảng z 8 dưới intro z 50 ⇒ nâng z 60. Bàn thử bay sai vì trận đã "end" và xe lệch dốc ⇒ đo lại chế độ Time. AudioContext đã đóng ⇒ chặn sự kiện sau destroy.

## Racing Words 4f — 16/10/2026 · iPad NỐI TRƯỚC INTRO + GIỮ KẾT NỐI + TỰ NỐI LẠI + MỐC CÂN BẰNG TỰ LẤY (= AWord Đợt 538) · phiên máy nhà
- **Thầy (sau khi thử TOMKO + 2 iPad):** 1 iPad nối ngon, 1 iPad "slow" không lái nổi — điều tra; mốc cân bằng tự lấy, không cần LEVEL; nối iPad từ trước intro, test ok mới cho START;
  đã nối thì giữ qua Options / Start again / đổi xe.
- **Nguyên nhân slow:** kênh WebRTC thẳng trượt ⇒ đường kho Firestore; đường nối 3y không bao giờ thử lại + mỗi Apply dựng lại cả đường nối (bắt tay lại từ đầu). Chi tiết `speed-run/NGHIEN CUU GAMEPLAY.md` mục 40.
- **Làm:** mẫu 4f = `sr3d-padlink-4f.js` (nối bền attach/detach/close · tự bắt tay lại 5→20 s · Reconnect · nhịp tim đường kho · chẩn đoán ICE · live/onChange) ·
  `sr3d-padui-4f.js` (mốc tuyệt đối theo hướng màn, bỏ LEVEL, tự bật nghiêng) · `rw-4f.js` + `rw-4f.css` (cổng iPad ở xưởng chặn START) · `mau-4f-ipad-giu-ket-noi.html` · `pad-4f.html`.
- **Quyết định:** START chỉ mở khi 2 đội nối THẲNG + đã bẻ thử trái/phải; relay không tính; lối thoát = đổi chế độ iPad trong ⚙. Cờ đã thử giữ suốt đời đường nối.
- **Lỗi & gỡ:** lớp `rw-wait` trùng tên thanh chờ lượt ⇒ màn đen ⇒ `rw-padwait`. Cờ thử bị xoá khi nối lại ⇒ giữ.

- **Bổ sung cùng ngày — KHOÁ ĐỘI iPad (= AWord Đợt 539):** iPad 2 chọn trùng đội đã có iPad ⇒ cũ: 2 máy Connecting mãi; nay đội có CHỦ (mã máy), máy khác bị chặn + màn chọn đội làm mờ, chủ thoát / mất > 8 s mới nhả. Chi tiết mục 40 (cuối).

## Chặng 21/10/2026 (tối) · RACING WORDS MẪU 5k — Roadster bám xe nhanh + tên lửa tự đuổi
**Bối cảnh (thầy):** soát RACING WORDS AWord ⇄ myGame đã đồng bộ chưa; Roadster phải đạt tốc cao hơn, luôn bám xe nhanh kể cả khi xe vượt dốc 150–200 km/h; ở tốc cao Roadster giật + khói hông bay lệch;
bỏ tâm tên lửa — tên lửa tự đuổi tới khi trúng, 1 chạm = xe xa, đúp = xe gần, trúng 100 %, trên đường cũng vậy.
**Đồng bộ:** AWord Đợt 570 = myGame 5j-i, KHỚP 100 % (chỉ khác import three).
**Đã làm:** mẫu 5k (file mới, 5j giữ nguyên) — chi tiết + số đo + bẫy ở `speed-run/HO SO BAN GIAO RACING WORDS.md` mục "MẪU 5k". Tóm tắt: tốc độ theo xe = vEff (×airK khi bay dốc), trần Roadster 342 km/h,
lò xo bám chặt hơn; rung mượt (sin); khói hông dính ống (update trước phát + theo vận tốc hiện tại); đạn tự đuổi (dammo-5k home/tgt), không tâm, droneHit trúng chắc xe đích.
**Lỗi gặp:** hàm phụ `sp` trùng biến `sp` ⇒ đổi `lui`. **Kiểm:** 6/6 phát trúng đúng xe, đuổi kịp xe dẫn qua dốc, 0 lỗi console.
**5k-b (thầy thêm):** bấm nút loại đạn (iPad / phím 1 2 3) = chọn + bắn luôn; 1 drone bắn thoải mái (không chờ đạn bay, không hồi, không tốn pin); bấm liên tục không mất phát (`fireFw`). Kiểm: 3/3, 3/3, Heart + Boost liền nhau đúng loại.

## VIỆC ĐANG CHỜ
- ⬜ **RACING WORDS 5k** (21/10, myGame, CHƯA lên AWord): thầy chạy `speed-run/mau-5k-roadster-ten-lua-tu-duoi.html` (+ `pad-5j.html?t=2`) trên TOMKO ⇒ Settings ▸ Drone ▸ 1 drone ▸ Roadster:
  BOOST đuổi xe NITRO / xe qua dốc, bay bám xe dẫn, còn giật không, khói hông; FIRE 1 chạm = tên lửa tự đuổi xe XA, đúp = xe GẦN. OK ⇒ AWord: HO SO BAN GIAO mục 4 với GOC = "rw-5k.js".
- ⏸ **RACING WORDS — TẠM CHỐT 20/10** sau 5i (= AWord Đợt 558). Phiên sau: đọc speed-run/HO SO BAN GIAO mục "MỚI NHẤT — MẪU 5i" trước.
- ⬜ **RACING WORDS 5i** (20/10, ✅ ĐÃ LÊN AWord Đợt 558 `12eeef7`): thầy thử trên AWord thật (hoặc `speed-run/mau-5i-vach-lua.html` + `pad-5i.html?t=0|1`) trên TOMKO ⇒ thử vạch lửa (Settings ▸ Drone ▸ 1 drone, Help the losing team,
  bắn Missile vào xe dẫn) + tab ⚙ Settings ▸ Boost. Trả lời 2 câu: "Boost max" có đúng ý (mức nạp khi trả lời nhanh nhất) không · thanh thứ 5 (Fire line slow) có đúng ý không.
  OK ⇒ lên AWord: HO SO BAN GIAO mục 4 (GOC rw-5i, GOC_THEM padui-5i, CSS + rw-5i.css, pad.js, load-files đo lại).
- ⬜ **ROCKET RACE MẪU 12 — TÀU + TÊN LỬA 3D** (19/10, CHƯA push, CHƯA lên AWord): thầy mở `rocket-race/mau-12-tau-3d.html` trên máy nhà + TOMKO ⇒ ⚙ Settings thử
  từng tàu (R1 R2 R8 S5 S7 S9 S10) + tên lửa (M1–M5): cỡ tàu, màu sơn 2 đội, chỗ lửa đuôi (vòi đặt tay — lệch thì sửa `engines` trong `game11/rr3d-ships.js`,
  soi bằng `xem-tau-3d.html?ship=S7&view=back`), intro phi thuyền cất cánh thẳng đứng, fps TOMKO (đo: lệnh vẽ ít hơn tàu cũ, tam giác +6–12 %).
  OK ⇒ ghép AWord: chép rr3d-ships.js + tau3d/*.glb + 3 file sửa (view/launch/missile — chỉ đổi đường import three), ⚙ Settings vào rocket-race.js
  (AWord không có nút này — xem Options/thanh dải nút), thêm glb vào load-files.js, chọn mẫu đồng bộ theo act hay theo máy (hỏi thầy).
  Chưa làm: bảng tên lửa trên iPad (`rr-padscene`) vẫn vẽ tên lửa CŨ · ghi công tác giả chỉ ở cửa sổ Settings · thầy chọn mẫu mặc định.
  12b (19/10 tối): lượn riêng từng tàu + nghiêng theo gia tốc, tàu sáng hơn, iPad vào ⚙ Settings, ảnh mô phỏng — thầy xem lại cảm giác lượn ở góc rộng.
  12c (19/10 khuya): tàu + tên lửa TỰ SÁNG theo màu bề mặt (12d: GLOW ship 0,45 / rocket 0,34 / missile 0,27) — thầy xem độ sáng trên TOMKO.
- ⬜ **TRAIN RUSH 1ax = AWord Đợt 550 `7cc6b6c` (LIVE 9/9, 18/10)**: thầy chơi TOMKO + 2 iPad thật — iPad mượt chưa, còn nóng không (chạm 3 lần góc phải dưới iPad = bảng đo: FPS 30,
  dòng 3 có `st`). iPad đang mở trang cũ thì tải lại. Còn giật ⇒ xem dòng "msg every … (max …)" (Wi-Fi) trước khi sửa vẽ.
- ⬜ **RACING WORDS 4g** (18/10, đã push myGame, CHƯA lên AWord): thầy chạy `speed-run/mau-4g-ket-slow-motion.html` (máy nhà + TOMKO) ⇒ duyệt màn kết slow motion (drift / bay), số đếm 10 s,
  barrel roll tự chỉnh, lật chậm dốc xoắn không ga, nảy khi đáp, 5 đèn chậm + bíp, vạch boost mép mờ, mũi tên đối thủ ⇒ OK thì chép AWord (HO SO BAN GIAO mục 4: GOC = "rw-4g.js", CSS thêm rw-4g.css, đo lại load-files).
- ⬜ **RACING WORDS 4f (= AWord Đợt 538)**: thầy thử TOMKO + 2 iPad — cổng iPad ở xưởng (thử trái/phải ⇒ START), Apply Options / Start again / đổi xe không phải nối lại,
  bật nghiêng khi đang cầm lệch vẫn đúng (không LEVEL). Nếu còn "SLOW": chụp dòng chẩn đoán dưới thẻ đội (hoặc ⚙ ▸ iPad) — "iPad: none" = iPad khác mạng / chặn UDP;
  có mDNS mà ICE failed = mạng chặn multicast ⇒ cho 2 iPad cùng băng Wi-Fi với TOMKO hoặc thêm máy TURN.
- ⬜ **RACING WORDS 4e (= AWord Đợt 537)**: thầy thử trên TOMKO + 2 iPad — Settings trên xưởng / giữa trận (dừng đúng chưa), mặc định Drive+Tilt, bay xa ×1,5 có quá lợi không,
  nhịp hất nghiêng 0,15–0,32 rad/s (không chỉnh thì hay BAD quá không — hằng trong `takeOff`), mất lái 1,2 s sau BAD đủ phạt chưa, ảnh màn chờ mới.
- ⬜ **TRAIN RUSH 1aw (= AWord)**: thầy chơi trên TOMKO — +5 %/màn đủ cảm giác chưa (hằng 0,05 và trần 1,75 trong `levelBoost`), rèm toa đục trông ổn không,
  fps có lên không. Hỏi thầy: thưởng giờ thừa (1 giây = 1 điểm) / Points off / toa than −2 / bonus +10 có cần đổi theo thang 1 điểm/thùng không.
- ⬜ **RACING WORDS 3q (= AWord Đợt 531)**: thầy chơi trên TOMKO — cảnh xa còn chóng mặt không (nếu còn: giảm `bend` 0,75 hoặc tầm cong 150 m), 35 km/h có quá chậm không, cầu nhảy chậm + rung, Lives / Time delay / Miss wait đúng ý chưa.
- ⬜ **RACING WORDS 3p (= AWord Đợt 529)**: thầy chơi trên TOMKO trong myActivity — còn lag không (đo fps nếu còn), chạm đúp bỏ intro có tiện không; kính xe (bỏ transmission) trông ổn không.
- ⬜ **iPad bớt nóng (AWord Đợt 523)**: thầy chơi Rocket Race + Train Rush với iPad thật vài trận ⇒ còn nóng không, 25 khung/giây có bị khó chịu không. Còn nóng ⇒ 20 khung/giây + độ nét 1,25 (hằng PAD_FPS / PR_MAX đầu file).
- ⬜ **TRAIN RUSH 1au (= AWord Đợt 522, thầy duyệt 14/10)**: thầy chơi Fight trên TOMKO + 2 iPad thật — chữ trên toa iPad đủ to chưa, có cần thấy trọn toa đáp án
  thứ 2 (hiện nửa toa ở mép trái iPad) không; thùng còn văng khi tàu lao/phóng không, điểm trễ ~0,6 s khi rơi lệch, khinh khí cầu nấc 10 (×2) có quá nhanh không;
  có đổi Single sang thả nhiều toa không. Xem thử trên máy: `balloon-pop/xem-1au.html`.
- ⬜ **ROCKET RACE iPad Game controller — ĐÃ LÊN AWord Đợt 511**: thầy thử 2 iPad THẬT trên lớp (trang chủ AWord ▸ nút iPad ▸ chọn đội; máy chiếu: trận Rocket Race ▸
  nút iPad ▸ Controller) ⇒ đo độ mượt bảng 3D trên iPad (nặng ⇒ bỏ MSAA / hạ pixelRatio). Lịch sử mẫu 9: thầy thử `rocket-race/mau-9-ipad-dieu-khien.html` + 2 tab `pad-9.html` (mỗi tab = 1 iPad, chọn đội;
  cùng trình duyệt — hoặc GitHub Pages sau khi push) ⇒ nhận xét bố cục iPad / tiếng / báo động ⇒ ghép AWord (kế hoạch cuối chặng "Rocket Race mẫu 9"). iPad THẬT chỉ chạy được
  sau khi ghép (kênh Firestore cùng tài khoản).
- ⬜ **STAR LOOT 2r** (11/10, = AWord Đợt 503): thầy chơi trên TOMKO — 10 địch có quá rối / tụt khung không, ngòi 1 s có kịp chạy không, Lives ∞ dùng ổn chưa.
- ⬜ **SPEED RUN**: 11/10 đã dựng MẪU 2 "buồng lái" (`speed-run/mau-2-buong-lai.html` + `pad-2.html`, hồ sơ mục 10) — ĐÃ push; ⏸ thầy tạm dừng, phiên sau tiếp. Thầy chạy thử ⇒ nhận xét bố cục tap-lô / lái / tên lửa / luật năng lượng ⇒ mẫu tiếp (tiếng · vật phẩm + chướng ngại · intro bãi xe) ⇒ ghép AWord khuôn B (+ kênh bắt tay Firestore để iPad THẬT lái được; TILT chưa thử trên iPad thật).
- ✅ 05/10 thầy thử iPad D-pad trên lớp thật (AWord Đợt 480b `bc6d839`, myGame `ea20330`): nhãn XANH (nối thẳng), chơi ổn. Thầy sẽ build thêm sau.
- ⬜ Thầy chơi TRAIN RUSH 1an (AWord) trên TOMKO: xương rồng mọc lại trông có tự nhiên không (cây dùng lại từ khúc khác).
- ⬜ Thầy chơi STAR LOOT 2p (AWord) trên TOMKO: độ mượt, sàn đổi đúng mỗi câu, độ lấp loá khi bỏ MSAA.
- ⬜ Thầy chơi TRAIN RUSH 1am (AWord) trên TOMKO: nhìn độ mượt + độ lấp loá vật mảnh khi máy quay lia (bỏ MSAA); nếu chói mắt ⇒ cân nhắc thêm FXAA/SMAA rẻ.
- ✅ Maze Chase mẫu 1 ⇒ … ⇒ 1e ⇒ 1f ⇒ 1g ⇒ 1h ⇒ 1i ⇒ 1j ⇒ 1k ⇒ 1l ⇒ 1m ⇒ 1n (thầy: ổn) ⇒ 1o (3 intro, thầy chọn A) ⇒ 1p STAR LOOT (tên mới + intro cốt truyện hạm đội) ⇒ 1q (intro lỗ giun + cảnh báo ENEMY LOCATED + ba lô ANDREW TEAM) ⇒ 1r (tàu bay vào màn chờ, lỗ giun mượt, robot chui vào gầm, sàn dày gấp 3, câu hỏi hiện lúc lùi máy quay) ⇒ 1s (ô xuất phát cố định, tàu không chúi/ngóc, NOT FOUND, bom chạm mới nổ, tường trung tính) ⇒ ✅ 29/9 thầy CHỐT MẪU 1t (chưa đưa vào AWord, thầy còn cải tiến tiếp) (lửa bùng khi tăng tốc, chân không lún, tên thiên hà, map gọn) `maze-chase/mau-1t-star-loot-lua-bung.html`.
- ⬜ Thầy bấm tay Đợt 417 trên AWord thật (TOMKO): BOOST +1 nấc, canh né 1,25 s, 2 thanh Options mới, va chạm, trúng lan, lửa xanh, act voice 35 %.
- ⬜ Thầy bấm tay Đợt 409 trên AWord thật (TOMKO): nạp tay, còi báo động b, vết cháy, MISS WAIT giữa màn.
- ⬜ Thầy bấm tay tên lửa trên AWord thật (TOMKO): chạm tên lửa/BOOST, 5 tiếng mới, 2 đội bắn cùng lúc, Same words + Sudden death.
- ⬜ Thầy bấm tay + nghe Rocket race Fight 3D trên AWord thật (TOMKO).
- ⬜ Thầy thử MẪU 5c trong myActivity v2.23.0 trên TOMKO ⇒ OK thì ghép 5c sang AWord.
- ⏸ TẠM CHỐT intro ở mẫu 4c (26/9/2026) — thầy sẽ build tiếp + ghép vào AWord sau; kế hoạch ghép ở Chặng 4.
- ⬜ Thầy xem mẫu 4c trên máy thật / TOMKO: nhấp nháy còn không, nhịp nhảy tốc độ, bố cục nhà xưởng / khu phóng.
- ⬜ Âm thanh intro.

## Chặng 17/10/2026 · ẢNH + % LOAD + NÉN TIẾNG cho 4 game 3D (= AWord Đợt 540 · 541 · 544)
- **Kiểm khớp (đầu + cuối phiên):** TRAIN RUSH `balloon-pop/core` (1aw `f32004b`) · STAR LOOT `maze-chase/core` (2r `1fd3173`) · RACING WORDS `speed-run/core` (4f `4077f92`) = AWord `templates/*/3d/`
  — chỉ khác dòng import three, CSS trang thử bị bỏ ở bản nhúng, URL phông tự host (cố ý); ROCKET RACE gốc ở AWord, `rocket-race/game10` là bản tra Đợt 511 (AWord hơn 1 chỗ Đợt 514 bắn đúng ô iPad).
  Tiếng (sound-1ah, am-thanh, game10/sfx + sfx-intro, speed-run/sfx) + 13 xe xe3d: GIỐNG HỆT từng byte hai bên.
- **Thiết kế ảnh:** `anh-game-3d/thiet-ke-v1.html` (`3a0a84f`) — ảnh chụp CHÍNH cảnh 3D 1920×1080 (renderer + toBlob gửi máy chủ tạm). Thầy chọn chữ ANDREW STUDIO;
  ô màn chọn: thầy KHÔNG thích khung phim (dải đen) ⇒ dùng đúng ảnh màn chờ (Đợt 541).
- **Nén tiếng mức Vừa:** `tools/nen-tieng-3d.py [--thu] [--aw <kho AWord>]` thay cùng lúc AWord + bản chép myGame giống hệt: trái/phải rõ (S/M ≥ 0,08) ⇒ 96k 2 kênh, còn lại 64k 1 kênh,
  nhẹ < 10 % giữ gốc ⇒ 30,8 → 19,0 MB (`57ab464`). Trang nghe `speed-run/nghe-nen-tieng/` (⚠️ nút "Gốc" nay phát bản đã nén vì sfx gốc đã thay).
- **% load thật** chỉ ở AWord (`core/loader3d.js` + `templates/<game>/load-files.js`). ⛔ Sửa game ở đây rồi chép sang AWord mà đổi tiếng / xe / module ⇒ ở AWord phải đo lại
  (`scratch/dot543-rec.html?t=<game>`) + `python -I tools/tao-load-files.py <thư mục rec-*.json>`, không thì % lệch (game không hỏng).
- ⬜ Thầy thử TOMKO: màn chờ % ở mạng trường, nghe lại tiếng đã nén (nhạc đua RACING WORDS thành 1 kênh — kém thì giữ 2 kênh riêng bài này).

## Racing Words 4g — 18/10/2026 · KẾT TRẬN ĐIỆN ẢNH SLOW MOTION + 8 việc thầy (chưa lên AWord) · phiên máy nhà
- **Đầu phiên:** myGame `d0b310b`, AWord `c092b4d` = origin, sạch; AWord `racing-words/3d` = myGame 4f `4077f92` khớp từng file (16 JS + 11 CSS + 30 tiếng). Kế hoạch: NGHIEN CUU mục 41.
- **Thầy giao 9 việc** + chốt: Time / hết mạng (KO) ⇒ chốt NGAY lúc 0 s; Length / Words vẫn chạy qua vạch đích rồi mới diễn cú kết mới.
- **File mới** (4f giữ nguyên): `core/sr3d-4g.js` (từ sr3d-4e.js) · `core/rw-4g.js` (từ rw-4f.js) · `core/rw-4g.css` · `mau-4g-ket-slow-motion.html`. iPad / intro không đổi.
- **Kết trận** (`finish` · `finTick` · `startDrift` · `finCam` · `finInput`): G.ts = hệ số thời gian (dt game = dt thật × ts). Nhịp "lose" 1,05 s thật: mỗi nửa màn quay ngoài xe của mình —
  xe thua phanh + drift ngắn (đang bay thì chạm đất mới drift), xe thắng vụt ga (lửa pô, finGas) hoặc đang bay thì "treo" ×0,12. Nhịp "win": cắt sang 1 khung rộng (máy quay gộp 4d,
  không thêm lượt vẽ) quay quanh xe thắng — chạy đất ⇒ DRIFT (góc ~67° rồi ~49°, mũi quay ra mép gần, thân trượt vào lòng đường, máy quay phía lòng đường thấy sườn + khói),
  slow ×0,14 ~2,3 s; đang bay ⇒ slow co giãn theo thời gian bay còn lại (~3 s thật, ×0,12–0,45), tự cân thân ⇒ PERFECT + nảy ⇒ trượt dừng. Chữ thắng (+ win/reo) rồi 3,2 s sau bảng kết quả.
  Cắt cảnh ⇒ dọn tên lửa còn bay. Kết quả ghi quãng đường lúc chốt (sEnd).
- **Khói + vết lốp cháy:** khói 2 bánh sau từ bể `missiles.smoke` có sẵn (bùng 1 đám lúc vào drift); vết cháy = InstancedMesh thứ 2 (`burnSk`, cùng kiểu vật liệu ⇒ cùng shader).
  ⚠️ PHÁT HIỆN: từ 3j, `O.updateMatrix()` của vết lốp bị nuốt vào chú thích ⇒ vết lốp chưa từng hiện đúng chỗ (mọi đoạn nằm ở gốc toạ độ). 4g sửa luôn (`makeSkids`).
  Cùng kiểu bẫy 2 chỗ nữa — thầy bảo BẬT LẠI (commit sau): `slip()` (từ 4b) rung máy quay + thân chông chênh khi trả lời sai / xe trước phanh gấp; `land()` BAD (từ 4e) bật nảy lên lại (vy 3,4) rồi chạm lần 2 đi nhánh wasBad. Bàn thử: sai ⇒ wobA 0,05 · shake 0,42; đáp xấu ⇒ bay lại ~0,5 m rồi chạm.
- **Số đếm 10 s** (Time): `.rw-cd` giữa vạch chia, chữ nửa xanh nửa cam viền trắng + vòng 2 màu, đỏ ở 3 giây cuối, "đập" mỗi giây; onEvent("tick", n) ⇒ bíp 880 / 1.320 Hz.
- **Barrel roll** (dốc 1 bên + dốc xoắn có ga): lộn xong lệch ±0,18–0,42 rad (`rollErr`), dốc xoắn thêm hất arW, 0,45 s cuối chông chênh (nearW + lắc) — bàn thử: buông tay 3/3 OK (18–28°), chỉnh 3/3 PERFECT.
- **Dốc xoắn không ga** (nitroK < 0,35 hoặc < 40 km/h): `tumbleStart/tumbleStep` lật chậm 1 vòng ~1,55 s quanh mép thân (nâng rig theo điểm thấp nhất của hộp xe), còn ~5 km/h,
  tia lửa khi nóc cạ đường, xong mất lái 1 s + chông chênh; máy quay ngoài phía lòng đường cao 2,3 m.
- **Nảy khi đáp:** `bounce()` hopV theo vận tốc rơi (≤ 2,1) + nảy lần 2 ×0,38 + chúc mũi nodA; chông chênh wobA +40 %.
- **5 đèn:** 0,8 + k·0,75 s (GO ~4,85 s, cũ ~3,55); lõi báo onEvent("light", k) ⇒ rw phát start_lights ×1,6 + bíp tổng hợp 660 Hz (sóng vuông + sin, lọc 5,2 kHz); nhạc đua 35 % lúc đếm.
- **Bàn đạp BOOST màn lớn:** gradient `#rw4gNit` mép mờ y như iPad, translateY + transition 0,5 s (HUD chỉ ghi khi đổi).
- **Mũi tên đối thủ** (`oppArrow`): chỉ khi xe kia NGOÀI khung nhìn — phía trước ⇒ đường chân trời (xiên về phía xe) · phía sau ⇒ mép dưới khung nhìn chĩa xuống · ngang hàng ⇒ mép bên; chevron đôi màu đội kia + số mét.
- **Đo (máy nhà, step):** giữa trận 540 lệnh vẽ (4f 563), màn kết 430–490, shader 65 ⇒ 65 (không dịch thêm). Lỗi console `checkMaterialsReady … isReady` khi Apply dựng lại game lúc đang dịch shader — CÓ SẴN ở 4f, không do 4g.
- **Bẫy bàn thử:** khung Browser ẩn ⇒ rAF đứng + ảnh chụp chậm 1 nhịp ⇒ chạy bằng `game.step(n)`, chụp canvas bằng `toDataURL` ngay sau step rồi gắn `<img>` mới, chụp màn 2 lần (lần 1 để trang vẽ lại).
  Kịch bản drift: Time, ramps Off, `auto(true)`, `G.timeLeft = 0.001`. Kịch bản bay: `place` xe trước cầu nhảy + `drive(boost)` tới khi `air` rồi hết giờ.

## Racing Words 4h → 4j — 18/10/2026 tối/đêm · ✅ LÊN AWord Đợt 551 `27825a2` · phiên máy nhà
- **4h** (`e1efecd`): GỐC "LOADING đứng 99 %" = `silhouette()` (bóng xe 3z) gom ~60k tam giác + closePath mỗi tam giác ⇒ Skia chậm theo cấp số ⇒ ĐƠ 10–50 s / xe lần đầu mỗi trang
  (đo bằng bọc CanvasRenderingContext2D: closePath 10,3 s/60k lần). Sửa: bỏ closePath + tô theo lô 1.500 (H4 10,8 s → 0,07 s, Y4 50 s → 0,15 s; bàn đo `do-bong-4h.html`).
  `rw-loadpace-4h.js` % theo THỜI GIAN 5 chặng, nhớ theo máy, "chạy trước" bằng CSS transition (luồng chính bị khoá 1,1–1,7 s lúc dựng trận / vẽ khung đầu — JS không vẽ được).
  Chờ 3 s trước câu mới (qGap, lớp .rw-qfill đầy dần từ giữa ra ngoài, tiếng R3 + B1 Web Audio), chữ ô trả lời fitAns, bàn đạp BOOST phát sáng không filter (quầng gradient tĩnh).
- **4i** (`7914045`, + iPad DAMAGE `c214797`): bộ quản lý cửa sổ winOpen/winClose (Menu / Switch activity — trước KHÔNG tạm dừng / Options AWord / Settings), góc dưới phải theo cqh,
  Settings kiểu C (tab DRIVER / CAMERA / RACE), đèn 3-2-1 (.rw-rs) khi đóng hết lúc đua; padMix (Drive on iPad màn lớn lái cùng); fire() chỉ khi đối thủ trước ≥ 5 m;
  tên lửa H 4,6 + quầng đỏ mờ + trôi ngang ≤ 2,5 m/s khoá 1,4 s; trúng = lệch 8+3L°, mất lái L s, khói gầm, cháy, thanh .rw-dmg (+ iPad qua tin "i:"); mũi tên .rw-oa2 dính mép;
  bảng đếm .rw-cb đầu vạch (Length m LEFT / Words / Time + số to 10 s cuối). ⚠️ Ghi chú cũ "đỉnh tên lửa 11 m" SAI: H cũ 3,6–8,1 (đỉnh ~3–6,7 m).
- **4j** (`a24e266`): nút bắn kiểu thẻ (qua 8 vòng thiết kế; thầy thích PHẲNG, gọn, ít động) — 2 ô tên lửa phẳng màu đội cố định, "+x" = KHO (tổng = icon + x),
  thanh chuỗi trắng mảnh, bắn = mờ dần / nạp = hiện dần, không mục tiêu = xanh lá nhạt + bấm hiện NO TARGET AHEAD; giá tên lửa nóc xe luôn gập. iPad: thẻ là lớp phủ .ip-fbw.
- ⛔ BẪY lặp 3 lần trong phiên: vá chuỗi có "// chú thích" chèn GIỮA dòng ⇒ nuốt phần code sau (lần 3 làm object H mất tag/msHold). Dùng /* */ hoặc kiểm phần đuôi dòng gốc.
- AWord Đợt 551: worktree web-wt-dot551, GOC rw-4j.js, `core/loader3d.js` + `pace` / `h.mark`, pad.js padui-4j + rw-4j-fb.css, load-files.js đo lại. ⬜ thầy thử TOMKO + 2 iPad.

## Racing Words 2 DRONE 5e → 5g — 19/10/2026 · ✅ CHỐT · AWord Đợt 554 `12f3922`
- 5e chế độ 2 drone (hàng ngang lệch tầng, máy quay chung, bảng đạn M1, iPad t=3) · 5f màu SƠN drone, máy quay ưu tiên xe dẫn + nâng theo khoảng cách, drone + chọn drone trong xưởng, màn chọn vai iPad ảnh thật ·
  5g iPad: nút tên lửa hết bề ngang, vừa mọi tỉ lệ (cả cầm dọc), ANDREW STUDIO. Chi tiết: speed-run/HO SO mục 0.
- ⛔ Bẫy: thân mẫu Mavic có cờ transparent ⇒ pha màu bỏ qua nhầm (chỉ bỏ vật liệu opacity < 0,3) · đo load-files lần đầu có thể thiếu CSS ⇒ so danh sách, đo lại.

## Racing Words DRONE 4k → 5d — 19/10/2026 · ✅ CHỐT · AWord Đợt 553 · TẠM DỪNG (chỉ myGame; AWord có trang thử ẩn /lab/racing-drone.html)
- 4k cột drone + tab Drone + camera sau drone + tâm bắn · 4l iPad drone (vai t=2) · 4m–4p mẫu drone Sketchfab (giữ 5: Mavic · Quad · Osprey · Northstar · Dvergr), cánh quạt quay, bay lượn
  · 4q tâm ngắm lục giác HUD · 4r đạn Heart/Boost/Missile + pin + trúng xe/đường · 4s đạn nhỏ, phóng về trước, đuôi chỉ lửa + khói.
- 4t: drone nhỏ 10 % · đạn ra từ bụng (thả rồi mới đánh lửa) · Settings ▸ Drone: Column width + View zoom · nghiên cứu lái nghiêng 2 trục (NGHIEN CUU mục 47).
- 4u: iPad drone lái nghiêng 4 hướng (tư thế vô lăng = 0, nghiêng = tốc độ tâm, drone nghiêng theo, nút LEVEL) · AWord trang thử ẩn Đợt 552i.
- 4v: NEAR / FAR dời drone · tâm ngắm tay (bỏ khoá) · dấu điểm rơi trên đường · Auto target + thanh Auto pull · AWord trang ẩn Đợt 552j.
- 4w: màu tâm hồng / đỏ chót · 1 tâm trên đường + hiện / ẩn nhoè · đổi tab mượt · bỏ ghi công trên màn hình · trang mẫu icon 2D thiet-ke-4w-icon.html (chờ chọn) · AWord Đợt 552k.
- 4x: icon 2D Neon viền vẽ riêng thay emoji (rw-icons-4x.js) · AWord Đợt 552l.
- 4y: tâm bóng mờ trắng khi đạn bay · bảng kết quả nhiều hiệp 2 cột (PLAY AGAIN cộng dồn, START / Menu / Options xoá) · AWord Đợt 552m.
- 4z: vùng nổ trúng mọi xe trong vùng · trang mẫu bảng lái drone 4 kiểu thiet-ke-4z-ban-lai-drone.html (chờ chọn) · AWord Đợt 552n.
- 5a: bảng lái drone AERO YOKE (chân đế cố định, vòng hồi chiêu, ANDREW STUDIO) · AWord Đợt 552o.
- 5b: iPad drone bỏ cột + đế, vô lăng lơ lửng, slogan nhỏ, NEAR / FAR icon (padui-5b) · AWord Đợt 552p.
- 5c: bảng lái drone cân cả điện thoại ngang (đơn vị theo chiều hẹp, padui-5c) · AWord Đợt 552q.
- 5d CHỐT (chỉ tải mẫu drone khi bật) ⇒ AWord template thật Đợt 553 `f244280`. ⬜ Việc chờ: điều khiển drone thứ 2 (2 drones).
- Chi tiết + việc còn lại: speed-run/HO SO BAN GIAO RACING WORDS.md mục 0. Công cụ mẫu 3D: tools/*.mjs.

## Train Rush 1ax — 18/10/2026 · MÀN iPAD MƯỢT (30 khung, nền cam trơn, hết thùng "nảy") · phiên máy MSI
**Bối cảnh (thầy):** iPad vẫn giật (cần tăng fps) · khinh khí cầu ("máy bay") và hộp chuyển động rất giật · có hộp rơi xuống đường rồi lại nảy lên trên iPad (màn lớn rơi chuẩn) ·
đồ hoạ iPad không cần đẹp, cảnh sau một màu cam trơn. Điều kiện: không sai tính năng khác, không ảnh hưởng hiệu năng game đã tối ưu. Đầu phiên đã kiểm: AWord (Đợt 532 `8018252`)
= myGame 1aw `f32004b` + iPad 1av, từng file khớp, live khớp HEAD. Thầy chốt phương án: 30 khung, nền cam trơn, giữ ray + tà vẹt, bỏ khói, thùng rơi đất mờ dần; làm myGame trước, đo xong báo thầy rồi mới chép AWord.
**Đã làm:** mẫu 1ax — `core/tr-padui-1ax.js` (30 khung theo mốc, canvas đục + nền cam một `fillRect`, chỉ ray + tà vẹt, bỏ khói, khinh khí cầu tự bập bềnh + đà riêng,
thùng nội suy theo đầu máy trễ 0,08 s, thùng lạc ghim mặt ray + mờ dần, nhớ bố cục chữ, nhận lại khi giờ game lùi), `core/tr-padlink-1ax.js` (kênh "st" không xếp hàng cho tin
trạng thái, bắt tay tương thích bằng nonce "2."), `core/bp3d-1ax.js` (chỉ thêm trường vào `padState`: khinh khí cầu baseY/pha/boost, thùng cờ g), `core/fight-1ax.js` (import 1ax,
gửi iPad đều 30 tin/giây). Trang `mau-1ax-train-rush.html`, `pad-1ax.html`, `xem-1ax.html`. Bàn đo `tools/do-ipad-train-rush/` (`node server.mjs` rồi `node run.mjs 1av|1ax <lag ms> <giây> [1 = thả thùng xuống đường]`).
Chi tiết nguyên nhân + bảng số đo: `balloon-pop/NGHIEN CUU GAMEPLAY.md` mục 48. Kết quả chính: 22 → 30 khung/giây, vẽ 1 khung 9,6 → 2,9 ms (tải mỗi giây −60 %),
thùng lún rồi bật lên (Wi-Fi trễ 0–150 ms) 15/17 → 0/16, khinh khí cầu giật dọc 0,37 → 0,03 px, thùng dưới đất hết lơ lửng.
**Quyết định:** nội suy CHỈ cho thùng (vật lý không tuyến tính); tàu / máy quay / khinh khí cầu vẫn đoán tiếp tới "bây giờ" để canh thả trên iPad vẫn khớp màn lớn (trễ thêm sẽ lệch chỗ thả);
thùng tính theo đầu máy để thùng trên tàu không trễ so với tàu; không thêm trường mới vào kho Firestore (cờ phiên bản nằm trong nonce).
**Lỗi gặp:** bàn đo treo vì gắn `ws.onopen` sau khi đã ngủ (sự kiện open bắn trước) ⇒ chờ open ngay khi tạo; màn máy soạn rAF 83 Hz ⇒ ngưỡng "≥ 31 ms" chỉ ra 26 khung ⇒ đổi sang lịch theo mốc.
**Lên AWord (cùng ngày, thầy xem `xem-1ax.html` OK):** Đợt 550 `7cc6b6c` — `tools/chep-train-rush.py` GOC fight-1ax / GOC_THEM tr-padui-1ax, sửa tay `balloon-pop.js`, `pad.js`, `tr-pad-signal.js` (localSignal từ tr-padlink-1ax), `load-files.js` (đổi tên + số byte). Thử bàn đo trỏ vào AWord (cả bản thu gọn tải từ live): 30 khung, 0 thùng lún, chạm iPad nổ quả, kênh `st` mở. Live 9/9.

## Rocket Race chọn tàu 3D — 19/10/2026 · SOÁT ĐỒNG BỘ + TRANG CHỌN MẪU TÀU · phiên máy MSI
**Bối cảnh (thầy):** "Đọc Rocket Race trên AWord và myGame, kiểm tra đồng bộ chưa; nghiên cứu dùng model 3D miễn phí thiết kế sẵn thay 2 tàu vũ trụ cũ thô sơ" ⇒ rồi "làm trang chọn tàu 3D như trang chọn drone".
**Soát đồng bộ (đầu phiên):** myGame = origin `74c0fab`, AWord = origin `a4170d8`, không file dở. `rocket-race/game10` (= AWord Đợt 511 `20110c4`) so AWord hiện nay (đã chuẩn hoá dòng import three):
autores / intro-sound / launch / misswait / sfx / view **khớp từng dòng**; launch/ + sfx/ + sfx-intro/ giống (AWord thêm `sfx/NGUON AM THANH.md`, layout.json chỉ khác CRLF);
`rr3d-missile.js` lệch đúng 1 chỗ Đợt 514 (`launch(from, to, want)` bắn đúng ô iPad chạm). File iPad: `core/rr-padscene-12.js` = AWord `rr-padscene.js` (chỉ khác import + dòng ghi chú);
`core/rr-padlink-9.js` / `rr-padui-9.js` là bản mẫu 9 — AWord đã đi tiếp Đợt 514 (fire0/fire1, từ chối iPad thứ 2 `x<t>`, màn "taken"), lệch 21 / 86 dòng. Luật `rocket-race.js` chỉ ở AWord
(sau Đợt 511 có Đợt 513 · 514 · 523 · 527 · 530 · 540 · 544). ⇒ phần 3D đồng bộ; ai làm mẫu 12 nên chạy `tools/chep-aword-sang-game.py game11` trước để lấy luôn bản Đợt 514.
**Tàu hiện nay:** `makeRocket(team, idx, H)` trong AWord `rr3d-view.js:364` dựng tay (lathe thân + mũi ogive màu đội, 4 cánh extrude, số đội vẽ canvas, lửa shader 2 nón, PointLight, khiên cầu);
trả `{rig, ship, model, hullMat, teamMat, mats, base, flameGroup, flameOuter, flameInner, light, shield, nozzleGlow, …}`; `setDamageLook` đổi màu `mats` theo dmg. Gọi ở `rr3d-view.js:630` (cảnh đua)
và `rr3d-launch.js:958` (intro phóng) ⇒ thay mô hình phải giữ NGUYÊN giao diện trả về. Thầy nhắc 19/10: đổi tàu = đổi CẢ tàu ở INTRO (intro dựng tàu đứng trên bệ, `NOZ = 2,52 × sc`, vòi lửa đặt cứng `(-2.5,0,0)` trong `nozzle()` rr3d-launch.js:1036) ⇒ mẫu mới chuẩn hoá đuôi đúng −2,52 hoặc sửa 2 hằng này; nhóm S không đứng được trên bệ ⇒ phải làm lại intro. Trang chọn đã ghi rõ.
**Đã làm:** `rocket-race/chon-tau-3d.html` (khung giống `speed-run/chon-drone-4l-v2.html`, thêm nút Chọn + thanh dưới "Chép danh sách", nhớ lựa chọn trong localStorage) — 27 mẫu, tất cả
CC Attribution + tải được (lấy qua API công khai `api.sketchfab.com/v3/search`/`models/<uid>`, lọc bỏ NC / SA / Standard, bỏ mẫu dính thương hiệu/phim: SpaceX, Star Trek, Rick and Morty,
Capsule Corp, Gorilla Tag…): **R1–R15 tên lửa đứng**, **S1–S12 phi thuyền** (S7 / S9 / S10 = drone E1 / E3 / E4 đã tải ở `speed-run/drone3d`). Thẻ index Rocket Race lên đầu.
Thử trên máy chủ myGame 8865: 26 ảnh tải đủ, Xoay 3D mở khung Sketchfab, Chọn/Bỏ chọn + lưu chạy, 0 lỗi console.
**Nguồn khác đã xem (chưa đưa vào trang vì không xoay xem được trên Sketchfab):** Quaternius Ultimate Space Kit + LowPoly Spaceships Pack (CC0, glTF — không phải ghi công),
Kenney Space Kit (CC0, có tàu), NASA 3D Resources (tên lửa thật, miễn phí — tránh logo NASA), Poly Pizza (nhiều "Rocket ship" Poly by Google CC-BY).
**Kế hoạch sau khi thầy chọn (mẫu 12):** tải glb ≤ 1K texture (cách Racing Words: thầy đăng nhập Sketchfab, tải từng mẫu cách ~45 s) ⇒ nén meshopt (`tools/process.mjs`) ⇒
`core/rr3d-tau3d.js` kiểu `sr3d-xe3d.js` (bảng TAU[]: tên, trục mũi, cỡ chuẩn dài ≈ 4,8 đv như tàu cũ y −2,52…2,25, vật liệu sơn màu đội, vị trí vòi lửa, tác giả, giấy phép) ⇒ `makeRocket`
nhận mô hình đã tải sẵn (tải TRƯỚC khi dựng cảnh, qua loader3d — makeRocket đang đồng bộ), giữ lửa / đèn / khiên / số đội / `mats` cho setDamageLook ⇒ ghi công tác giả ở màn chờ.
**Quyết định:** chỉ Sketchfab vào trang chọn (xoay 3D xem được ngay, cùng quy trình đã chạy với xe + drone); nhóm R đặt trước vì thay thẳng không đổi intro phóng đứng.
**Lỗi gặp:** Python in tiếng Việt / emoji ra màn hình lỗi cp1252 ⇒ chạy với `PYTHONIOENCODING=utf-8`; heredoc bash lớn chứa dấu nháy làm lệnh vỡ ⇒ viết file bằng công cụ Write; công cụ Edit của Claude XOÁ 1 CR trần có sẵn (dòng "5 CR trần" chặng Train Rush 1at) ⇒ git diff cả 1.590 dòng ⇒ chèn lại CR đúng chỗ bằng Python (so với git show HEAD).

## Rocket Race MẪU 12 — 19/10/2026 · TÀU + TÊN LỬA 3D CÓ SẴN + ⚙ SETTINGS · phiên máy MSI
**Bối cảnh (thầy, sau khi xem trang chọn):** chọn S10 · S9 · S7 · S5 · R8 · R1 · R2. "Thêm một nút cài đặt như Racing Words để chọn loại tàu và cài đặt khác nếu cần ·
các màn có tàu giống loại, chỉ khác màu sơn · tàu đưa vào phải nén để ưu tiên độ mượt, khói lửa đẹp như tàu cũ · tìm thêm missiles đẹp thay loại cũ". Trước đó thầy nhắc:
đổi tàu là đổi cả tàu ở INTRO. Thầy cho phép tải 9 file glb bằng Chrome đã đăng nhập Sketchfab (AskUserQuestion).
**Tải:** bản gốc ở `Desktop\MAU TAU ROCKET\rr-*.glb` (12 file: 4 tàu mới + S7/S9/S10 lấy lại từ speed-run/drone3d + 5 tên lửa). Cách tải không cần bấm tay: trong tab
sketchfab.com gọi `fetch('/i/models/<uid>/download')` ⇒ `latest.glb[]` (chọn bản nhỏ nhất) ⇒ `url` của nó trả JSON có `url` THẬT (bước 2) ⇒ blob ⇒ thẻ `<a download>`
(về Downloads rồi chuyển). Cách nhau 45 s. Tên lửa chọn 5: Sci-fi missile (robnewman76) · AIM-9 (rickslash) · AIM-120 low poly (Mustafa Garip) · Ballistic kiểu hoạt hình
(leslava) · Missile Rocket (Jawad Abedin) — CC BY, tải được, bỏ mẫu có chữ/thương hiệu (Tomahawk…).
**Nén:** `tools/nen-tau3d/nen.sh` (= tex2.mjs: ảnh màu webp ≤ 1024, ảnh phụ ≤ 512, tiến trình riêng · mesh2.mjs: dedup/weld/flatten/join theo vật liệu, simplify khi quá
12k (tên lửa đứng) / 14k (phi thuyền) / 3k (tên lửa), meshopt). Kết quả `rocket-race/tau3d/`: tàu 0,10–0,79 MB, tên lửa 0,02–0,10 MB, tổng 3,1 MB (gốc ~13 MB).
**Đã làm:** `game11/` = chép AWord a4170d8 (Đợt 556) bằng `chep-aword-sang-game.py` (có luôn Đợt 514) +
- `game11/rr3d-ships.js` (MỚI): bảng SHIPS / MISSILES (rot về mũi +X nóc +Y, engines [x,y,z,r] đặt tay, paint, hide, tác giả + giấy phép) · `bake()` nướng mọi lưới
  về khung tàu cũ (đuôi −2,5 mũi 2,25 dài 4,75; bề ngang ≤ 2×1,3 tên lửa / 2×1,7 phi thuyền — mẫu bè thì nhỏ lại, tâm giữ −0,125) · sơn màu đội: "accent" đổi pixel
  CÓ MÀU sang màu đội (giữ trắng/xám/đen, chỗ tối sáng lên chút), "all" phủ màu đội k phần trên vật liệu chỉ định (S7/S9/S10 gần như toàn xám) · `makeShipRocket` trả
  ĐÚNG giao diện makeRocket cũ (FlameSet: nhiều vòi mà code cũ vẫn gọi `.visible` + `.scale.set` như 1 nhóm, vật liệu lửa CHUNG ⇒ màu xanh sắp thắng / turbo tự ăn) ·
  mặt cắt ellipse 24 khúc (tên lửa chạm vỏ thật) · `shipWreckKit` cắt CHÍNH thân tàu thành mảnh theo lưới 6×2×3 · `hullSpot` dò điểm trên vỏ cho vết cháy ·
  tên lửa glb làm MẬP thân (bán kính thân ≈ 0,16, tối đa ×2,4) cho dễ thấy.
- `rr3d-view.js`: shader lửa tách thành `makeFlameMat`/`makeFlameGroup` (tàu glb dùng CÙNG shader) · `makeAnyRocket` · createView tải mẫu trước khi dựng (lỗi ⇒ tàu cũ) ·
  hạt lửa chia đều các vòi, cỡ theo miệng vòi · mảnh vỡ glb.
- `rr3d-missile.js`: tên lửa glb (trên tàu, đang bay, bảng nạp "đổ đầy" bằng fillMat trên vật liệu glb, PEACE ngả xanh lá) · tàu glb: không cửa khoang / tay robot, quả
  trượt ra hông ở `mount` · chạm vỏ theo mặt cắt · vết cháy = tấm muội dán đúng điểm trên vỏ (khung mô hình = khung tàu xoay −90°: (x,y,z) ↦ (−y,x,z)).
- `rr3d-launch.js`: tải mẫu trước khi dựng bệ · tên lửa glb đứng cao theo đuôi mẫu · phi thuyền NẰM trên bệ (ẩn vòng đỡ + 20 ngàm, tay kẹp/tay tiếp nhiên liệu hạ
  ngang thân), cất cánh THẲNG ĐỨNG: 3 vòi nâng dưới bụng (tự đặt theo mặt cắt) chĩa xuống + hạt lửa thổi xuống bệ, mũi ngóc 0,42 rad rồi về phẳng; đường bay /
  máy quay / lúc cắt vào game giữ nguyên.
- `mau-12-tau-3d.html` (từ mẫu 10, nối game11): nút ⚙ Settings trên dải nút (nút Options mờ đổi icon thanh trượt) ⇒ cửa sổ góc dưới phải kiểu Racing Words
  (tab icon Ship / Missile, ô chọn theo nhóm ROCKETS / SPACESHIPS, ghi công tác giả, nút APPLY — RESTART GAME hiện khi đổi). Lưu `localStorage rocketrace.ship.v1`.
  `?ship=S9&missile=M2` thử nhanh. Bàn soi `xem-tau-3d.html` (?ship= / ?missile= / &view=back|side|top, vòng đỏ = vòi đang cấu hình).
**Thử (máy MSI, khung xem trước lái bằng step):** 7 tàu × intro + đua + bắn + trúng + nổ, 0 lỗi console. R8: lửa 5 vòi, M4 gắn hông, bay vòng, "HIT 50 %", vết cháy.
S9: nằm bệ → cất cánh thẳng đứng → bay vào game; nổ ra mảnh thân thật. Settings: chọn Northstar + AIM-9 ⇒ APPLY ⇒ tải lại đúng mẫu. Tải đồ hoạ (1 khung trong đua):
Classic 188 lệnh vẽ / 204k tam giác · S9 148 / 229k · R1 170 / 217k — chưa đo fps thật (TOMKO).
**Quyết định:** chỉnh tàu trong KHUNG TÀU CŨ (không đổi đường đua / camera / luật) · 2 đội 1 mẫu, sơn bằng đổi màu pixel thay vì tô cả tàu (giữ chi tiết) · đổi mẫu = dựng
lại (tàu dựng lúc vào cảnh) · iPad chưa đổi tên lửa.
**Lỗi gặp:** (1) file meshopt lượng tử hoá: vị trí là Int16 CHUẨN HOÁ ⇒ xoay/phóng thẳng trên đó bị kẹp [−1,1] ⇒ hình nát thành khối ⇒ chép ra Float32 bằng
`getComponent` trước. (2) R8 kèm hộp nền 246×200 (Object_16 / Material.002) ⇒ `hide`. (3) S5 / S9 / M1 / M2 / M5 sai trục mũi — soi bằng bàn soi 3 hướng. (4) R1 bè
4,3 đv ⇒ 2 tàu chạm nhau ⇒ luật giới hạn bề ngang. (5) tex.mjs trên file đã meshopt cần đăng ký CẢ encoder. (6) công cụ trình duyệt chặn đọc URL có chữ ký
(query string) ⇒ tải bằng blob trong trang thay vì curl. (7) `python -I` bỏ qua PYTHONIOENCODING ⇒ dùng `-X utf8`.

## Rocket Race MẪU 12b — 19/10/2026 (tối) · LƯỢN RIÊNG TỪNG TÀU + SÁNG HƠN + iPad VÀO ⚙ SETTINGS + ẢNH MÔ PHỎNG · phiên máy MSI
**Bối cảnh (thầy xem mẫu 12, gửi ảnh góc rộng S7):** "độ nghiêng và láng của 2 tàu khá giống nhau ⇒ cần khác nhau hoàn toàn · góc rộng lượn quá nhanh, không hợp lý,
nhất là phi thuyền dẹt ⇒ láng nhẹ nhàng, đều, mượt, chuẩn vật lý · tàu mới tối quá · phần iPad đưa vào nút cài đặt · chọn tàu / missiles cần hình mô phỏng".
**Nguyên nhân đo được:** (1) 2 tàu dùng CHUNG một công thức lượn (chỉ lệch pha `i`). (2) nghiêng = sóng sin tự do 0,18 rad, không gắn chuyển động.
(3) Đợt 398 bỏ HÌNH đá nhưng giữ LỰC né đá ẩn ⇒ cứ 0,8–1,7 s tàu bị đẩy ngang (gia tốc ±3 đv/s², nghiêng ±0,5 rad đổi chiều trong 0,5 s). (4) vỏ glb nhiều kim loại
(metal 1) mà cảnh vũ trụ không có gì để phản chiếu ⇒ đen.
**Đã làm (game11/rr3d-view.js):** `flightOf(r, i)` — mỗi tàu một bộ tham số bay riêng (3 sóng lượn ngang + 2 sóng lên xuống, tần số không chia hết nhau, tàu 1 / tàu 2
tần số chính khác hẳn; nhấp nhô riêng; phi thuyền chậm ×0,62) · đích lượn qua bộ lọc (0,9 s phi thuyền / 0,55 s tên lửa) rồi lò xo mềm (k 3,2 / 5,5 thay 11) ·
NGHIÊNG = atan(gia tốc ngang × hệ số) lọc 0,6 / 0,4 s, tối đa 0,3 / 0,38 rad, tốc độ nghiêng ≤ 0,45 / 0,75 rad/s; ngóc mũi theo vận tốc lên xuống · lực né đá ẩn còn 30 %.
Đo S9 ở góc rộng 15 s: nghiêng tối đa 0,16 / 0,20 rad, tốc độ ≤ 0,45 rad/s, gia tốc ≤ 0,7 (trước: 0,5 rad · 2,85 rad/s · 3). Áp cho CẢ tàu Classic.
**Sáng hơn (rr3d-ships.js `upgrade`):** kim loại ≤ 0,45, nhám ≥ 0,32, phản chiếu môi trường ×2,6, màu nền ×1,45 (phi thuyền) / ×1,15 (tên lửa) — đổi màu đội chuẩn hoá
màu > 1 trước khi đổi.
**⚙ Settings (mau-12):** thêm tab **iPad** đầu tiên — CHUYỂN HẲN 3 thẻ Off / Question screen / Game controller + bảng đội vào cửa sổ (logic nối iPad giữ nguyên; nút iPad
dưới khung ẩn, chip iPad trên khung vẫn hiện) · ô Ship / Missile có **ảnh mô phỏng** `tau3d/anh/ship-<id>.webp`, `missile-<id>.webp` (14 ảnh, 3–12 KB) chụp từ CHÍNH
mô hình game (sơn đội 1, lửa bật, nền trong suốt) bằng `rocket-race/tao-anh-tau.html?save=1` + máy nhận tạm 127.0.0.1:8877 (scratchpad luu_anh.py) — đổi mẫu ⇒ chụp lại.
**Thử:** 0 lỗi console; Settings 3 tab chạy (Game controller hiện 2 thẻ đội trong cửa sổ, về Off được); ảnh hiện đủ 8 tàu + 6 tên lửa; góc rộng S7 sáng rõ xanh / cam.
**Chưa:** thầy xem trên máy thật (nhịp lượn có đủ "sống" không — chỉnh `wa`/`bank` trong flightOf) · tên lửa trên bảng iPad vẫn kiểu cũ · chưa push / AWord.

## Rocket Race MẪU 12c — 19/10/2026 (khuya) · TÀU TỰ SÁNG · phiên máy MSI
**Bối cảnh (thầy):** "màu và độ sáng của tàu vẫn còn đang rất tối, muốn sáng rõ ràng" (sau 12b nâng màu ×1,45 + phản chiếu ×2,6 vẫn chưa đủ: mặt khuất nắng trong cảnh
vũ trụ gần như đen).
**Đã làm (game11/rr3d-ships.js):** `addGlow(m, k)` — chèn shader sau `emissivemap_fragment`: `totalEmissiveRadiance += diffuseColor.rgb * uGlow` ⇒ tàu tự sáng theo
CHÍNH màu bề mặt (texture đã sơn đội × màu), mặt có nắng vẫn có sáng tối / bóng như cũ, đèn emissiveMap sẵn có của mẫu vẫn giữ; hư hại làm tối luôn phần tự sáng.
Mức `GLOW = { ship 0,55 · rocket 0,42 · missile 0,32 }` (ghi đè từng mẫu bằng trường `glow`). Gắn ở `makeShipRocket` (mỗi vật liệu 1 lần) + tên lửa glb (prepMissile);
mảnh vỡ dùng bản clone ⇒ không tự sáng (cháy sạm). Chụp lại 14 ảnh mô phỏng (`tao-anh-tau.html?save=1`).
**Thử:** góc rộng S7 / S9 / R8 rõ màu xanh / cam, thấy chi tiết thân; intro ban ngày không chói; 0 lỗi console. Chưa đo trên TOMKO (độ sáng màn 4K khác máy soạn).
**Chỉnh nhanh nếu thầy thấy quá / thiếu sáng:** đổi 3 số trong `GLOW` (đầu mục TỰ SÁNG) hoặc `glow:` riêng từng mẫu trong SHIPS.

## Rocket Race MẪU 12d — 19/10/2026 (khuya) · BỚT CHÓI
**Thầy:** "hơi sáng chói quá rồi, giảm một chút xíu" ⇒ `GLOW` 0,55 / 0,42 / 0,32 → **0,45 / 0,34 / 0,27** (ship / rocket / missile, ~−18 %); chụp lại 14 ảnh mô phỏng.
Thử S9 góc rộng: vẫn rõ xanh / cam, bớt loá; 0 lỗi console. Ghi chú: khung xem trước bị thu 0×0 thì mẫu 10 / 12 đều văng "startBtn null" ở view.step(1) đầu trang
(nút START 3D chỉ dựng khi khung có cỡ) — lỗi CŨ của bản thử, không do mẫu 12.

## Rocket Race MẪU 12e — 19/10/2026 (khuya) · ĐỘ SÁNG RIÊNG TỪNG TÀU
**Thầy:** Retro Toy, Toy Rocket giảm chút · Northstar giảm nhiều · Low Poly Ship tăng nhiều · Space Fighter tăng chút ⇒ trường riêng trong `SHIPS` (game11/rr3d-ships.js):
R1 / R2 `glow 0,26` (mặc định tên lửa 0,34) · S9 `glow 0,28 + bright 1,2` (mặc định phi thuyền 0,45 + 1,45) · S5 `glow 0,78 + bright 1,75` · S7 `glow 0,56`; R8, S10 giữ mặc định.
Chụp lại 14 ảnh mô phỏng. Thử S5 góc rộng: sáng rõ xanh / cam; 0 lỗi. Chỉnh tiếp: sửa 2 trường glow / bright của mẫu đó.

## Rocket Race MẪU 12 ⇒ ✅ GHÉP AWORD Đợt 557 (19/10/2026) · AWord `10c1298`
**Thầy:** "commit và push cả myGame, cả AWord". myGame `f4deb77` đã push. Chép 4 file 3D + tau3d bằng `tools/chep-rr-mau12-sang-aword.py` (MỚI — đổi import three ⇒
./vendor/three/, ../tau3d/ ⇒ ./tau3d/; soát: dòng cũ của AWord bị đổi chỉ là phần mẫu 12). AWord tự viết thêm ⚙ Settings trong `rocket-race.js` (`rr3dSettings`, nút trong
`rr3dToolbar`, tab iPad gọi ctl.setIpadLive / applyOptions, ẩn nút iPad engine) — bản AWord KHÁC trang mẫu 12 ở phần giao diện này (mẫu 12 vẫn dùng popup iPad của mẫu 10).
Thử AWord `scratch/dot416-rr-endless.html`: R8 / S9 intro + đua, đổi tàu APPLY, iPad Controller bật tại chỗ / tắt — 0 lỗi. Hồ sơ AWord: GHI CHU DU AN Đợt 557 + GHI CHU ROCKET-RACE mục 48.
⬜ còn: bảng tên lửa iPad (rr-padscene) vẫn kiểu cũ · thầy thử TOMKO.

## Racing Words 5i — 20/10/2026 · VẠCH LỬA DRONE + ⚙ Settings ▸ Boost + boost mất hiện đỏ · ✅ AWord Đợt 558 `12eeef7` (LIVE 9/9) · phiên máy MSI
**Bối cảnh (thầy):** "Đọc game RACING WORDS trên AWord và myGame — check đã đồng bộ phiên bản tốt nhất chưa" · drone 1 chiếc bắn tên lửa cản đội nhanh đôi khi quá mạnh (đội nhanh thành chậm)
⇒ khi trúng: vụ nổ rung chấn giữ xe bị trúng + đường lửa ngay sau nó, xe đuổi dừng trước lửa (có báo trên màn), xe bị trúng chạy thì xe sau chạy cùng nhưng vẫn bất lợi + chậm hơn chút ·
thêm tab trong Settings: thời gian chờ câu mới 1–5 s, boost mỗi câu đúng, boost tối đa (mặc định 50 %), Boost off (phạt khi sai, phần giảm đỏ rồi xịt xuống + khói đen ở bàn đạp).
**Soát đồng bộ:** AWord `web` (main, ad63862) + myGame (main, 1fad0b6) sạch, khớp origin; AWord live nạp rw-5h; 50 file 3d/ của AWord = myGame 5h (chỉ khác dòng import) ⇒ ĐÃ ĐỒNG BỘ bản 5h.
**Đã làm:** mẫu 5i — lõi `sr3d-5i.js` (fireLine / fireRelease / fireTick / fireClear, chặn xe đuổi trong drive(), tab boostTab + bset, qGap theo bset.gap, nạp/phạt boost theo %),
gói `rw-5i.js` (nạp lõi 5i + tiếng vạch lửa), `rw-5i.css` (bảng FIRE LINE + thanh kéo), `rw-bloss-5i.js` (đỏ + khói bàn đạp, tự chèn CSS), iPad `sr3d-padui-5i.js` + `pad-5i.html`,
trang `mau-5i-vach-lua.html`. Chi tiết + số đo: speed-run/NGHIEN CUU mục 49.
**Quyết định:** vạch chỉ ở chế độ 1 drone + trúng đúng xe đang dẫn · dừng cách lửa 6 m (3 m lửa trùm kín kính lái) · lửa dùng hạt sẵn có (0 shader mới) · cài đặt Boost theo MÁY ·
"Boost max" = mức nạp khi trả lời nhanh nhất · thanh thứ 5 = Fire line slow (thầy kể 4 thanh) · iPad nhận boost mất bằng cách so 2 tin "i:" (không đổi đường nối).
**Sửa thêm (thầy báo):** tab DRIVER bấm không có tác dụng — lỗi từ 4w (khung `.rw-c` mang `data-tab` nên bị gắn lệnh mở tab ⇒ mọi cú bấm dựng lại bảng, xoá hộp xác nhận). 5i sửa bộ chọn thành `nav [data-tab]`. AWord live (5h) VẪN CÒN lỗi tới khi lên 5i hoặc vá nóng.
**Lỗi & gỡ:** trùng tên `FL` với biến máy quay ⇒ `FIRE_L` · getter `fire` bị hàm `fire` (bắn) trong API đè im lặng ⇒ `fireL` · khói đen tuyền không thấy trên táp-lô ⇒ rìa xám ·
heredoc nuốt `\b` · `sed -i` đổi CRLF ⇒ ghi lại CRLF bằng Python.

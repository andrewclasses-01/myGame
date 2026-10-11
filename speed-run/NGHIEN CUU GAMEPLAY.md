# SPEED RUN 3D — hồ sơ nghiên cứu gameplay (11/10/2026)

Game 3D thứ 4 của kho myGame (sau ROCKET RACE, STAR LOOT, TRAIN RUSH). Đua Ô TÔ 2 đội, cùng vibe Rocket race
nhưng thiết kế khác hẳn: có ĐƯỜNG ĐUA thật, camera sau lưng 2 xe nhưng CAO hơn, trả lời đúng = NĂNG LƯỢNG cho xe
chạy, tên lửa gắn trên thân xe bắn đối phương, cân nhắc LÁI XE bằng iPad. Mục tiêu cuối: ghép vào AWord.

Trạng thái: **11/10/2026 thầy CHỐT cả 8 đề xuất (mục 7) ⇒ đã dựng MẪU 1a + 1b (mục 9). ⏸ Thầy TẠM DỪNG ở mẫu 1, đã commit + push lên GitHub; phiên sau tiếp tục từ mục 9 (⬜ chọn góc máy ⇒ mẫu 2).**

Yêu cầu gốc của thầy (11/10/2026):
> "Game đua ô tô, tương tự như rocket race nhưng thiết kế sẽ khác khá nhiều. Đường đua sẽ nhìn từ phía sau 2 xe nhưng camera
> lên cao hơn, khi 2 xe ở một khoảng cách khá xa thì camera lên cao hơn nữa. Có thể cân nhắc tới việc lái xe cho iPad, còn việc
> trả lời đúng là để lấy năng lượng cho xe chạy và có tên lửa trên thân xe để bắn đối phương."

---

## 1. Kho đã có gì — bài học từ 3 game trước

### 1.1 ROCKET RACE (gốc ở AWord `templates/rocket-race/`, myGame `rocket-race/game8` = AWord Đợt 478, ~5.800 dòng, 12,4 MB)
- **Kiến trúc "view thụ động"**: `rr3d-view.js` CHỈ VẼ, không giữ luật. Luật nằm ở trang (myGame) / `rocket-race.js` + `core/fight.js` (AWord).
  View nhận callback `onTap/onFire/onLoad/onBoost/onMissileEnd/sfx/loop/swell`, trả API `move(side,p,"up"|"back",n)`, `stall`, `damage`,
  `win`, `setAnswers/tileStates`, `countdown/go`, `step(n)/resume()` (bàn thử lái khung hình khi tab ẩn).
- **Không có đường đua**: tàu bay trong không gian trống, vị trí = `cfg.track(i,t)` (2 làn x = ±2,3; z từ 0 tới −64), cổng đích torus. Nền
  tinh vân + 7.000 sao + hành tinh đi theo camera. "Tốc độ" chỉ là 420 vệt bụi chạy ngược + hạt khói đuôi.
- **Camera** (`rr3d-cfg.js` / `RR3D_CFG`): FOV 38, góc đuổi `pos (0, 3.3, zc+16.5)`, `look (0, .1, zc−14)`, `zc` bám tàu ĐI SAU. Chuyển sang góc
  CAO (`high`: `pos (D·.8, D·.5, zMid)`) khi chênh ≥ 3 nấc, hoặc tàu dẫn còn ≤ 3 nấc là tới đích, hoặc đang có tên lửa (`wide`). Chuyển bằng
  `camK` trượt 3,2 s + smoothstep; bám mềm `lerp(dt·1.8)`. ⇒ SPEED RUN cần camera LIÊN TỤC theo khoảng cách chứ không nhảy 2 nấc (mục 3.2).
- **Tiến độ RỜI theo NẤC**: đúng ⇒ `p += 1`, xe trượt tới nấc mới (`r.vis += (r.p − r.vis)·dt·3`). Đường đua Fight dài `ceil(n/2)` nấc.
  Sai ⇒ lùi `rrStepsOff` nấc + khựng. Chạm vạch = thắng ngay. Hết câu/hết giờ ⇒ `settleByPosition`, bằng nhau ⇒ SUDDEN DEATH.
- **Tên lửa** (`rr3d-missile.js`, 1.031 dòng, chỉ vẽ): `rrMsStreak` (mặc định 3) câu đúng LIÊN TIẾP = +1 quả, tối đa `rrMsMax` 3, 2 bệ phóng, tự lên
  nòng, chạm = bắn. Bay Bézier bậc 4 lên cao rồi lao xuống, dẫn đường bám tàu. Hai quả ngược chiều HÚT nhau và nổ giữa đường; nổ cách tàu < 3 đv
  ⇒ "HIT 50 %". NÉ tự động trong 1,25 s cuối nếu trả lời đúng / bấm BOOST / bị lùi. Trúng ⇒ lùi `rrMissile` nấc (mặc định 2) + vết cháy + lửa
  8 s; trúng LAN khi 2 tàu cùng nấc. BOOST = 5 đúng liên tiếp ⇒ +1 nấc thật. Chuông báo động 2 nhịp. Khoá khi đã phân thắng / Sudden death.
- **Intro cảnh phóng** (`rr3d-launch.js`, 1.224 dòng + 5,3 MB ảnh địa hình): nhà xưởng ANDREW STUDIO, **BÃI XE ĐẦY Ô TÔ với 5 MẪU XE 3D dựng bằng
  primitive** (siêu xe kiểu Lamborghini · Porsche 911 · Ferrari · SUV kiểu G-class · sedan kiểu S-class — `rr3d-launch.js:666–815`, thân đùn từ
  dáng cắt, có đèn, lốp). ⭐ Dùng lại được làm xe đua + làm BỐI CẢNH XUẤT PHÁT (xe đua lăn bánh từ bãi xe ANDREW STUDIO ra đường ⇒ cùng vũ trụ với Rocket race).
- **Hiệu năng**: `rr3d-autores.js` tự giữ 60 khung (bỏ MSAA trước rồi hạ pixel ratio 0,1; êm 10 lượt thì thử nâng; rớt 2 lần ở một mức ⇒ chốt trần;
  nhớ localStorage; trần `window.__awMaxPR` do myActivity đặt 1,0 trên 4K). `warmBoom` + `pinPrograms` chống khựng dịch shader. maxFps 60.
- **Hậu kỳ**: EffectComposer (render target HalfFloat MSAA 4) → lọc NaN → UnrealBloom (.6/.65/1.05) → OutputPass → grade (lệch màu rìa, tối góc, nhiễu).
  Bảng `Q`: ultra (PR 2, MSAA 4) / high (1.25, 4) / low (1, 0).
- **Tiếng** (`rr3d-sfx.js`): fetch+decode 25 mp3, 2 bus fx/bg nhớ localStorage, `loop/swell` theo đồng hồ âm thanh, `setFxLevel` cho act voice (35 %),
  tiếng tổng hợp `charge/servo`. Dùng lại gần nguyên, chỉ đổi `NAMES` + file.
- **UI 3D gắn camera**: thanh câu hỏi 90×7 cm + 2 cột đáp án 1×4 nghiêng ±0,3 rad sát 2 mép; chạm = raycast ⇒ `onTap(side,k)`. ⚠️ Lớp UI 3D chồng sát
  phải đặt `renderOrder` cố định (bài học 7c "BOOST đầu trận 3 vạch").
- **MISS WAIT 3D** (`rr3d-misswait.js`): viên thuốc kính ở mép dưới, dải màu đội co về bên đội, đỏ nhấp nháy ≤ 25 %. Dùng lại nguyên.

### 1.2 STAR LOOT (gốc ở myGame `maze-chase/`, bản 2q = AWord Đợt 480b)
- **iPad làm tay điều khiển qua WebRTC** (`mc3d-padlink-2q.js`): DataChannel `ordered:true`, STUN Google, không trickle (gom ICE ≤ 2,5 s). Bắt tay qua kho
  3 tài liệu MỖI TÀI LIỆU 1 NGƯỜI GHI (`host` / `pad0` / `pad1`; sid phiên game + nonce iPad; game mở lại = sid mới ⇒ iPad tự chào lại). Nudge 4 s ×8.
  Đường dự phòng qua kho khi 7 s không mở được kênh (đuôi 4 phím `rq` + đếm `rs`). Đo: WebRTC 10–30 ms, Firestore 150–500 ms. **Thầy đã thử iPad thật 05/10: nhãn xanh, chơi ổn.**
- Hợp đồng lõi: `remote.attach({ press(team, key), status(team, s) })`, `detach()`, `panel(el,{fight})`, `panelClosed()`. ⚠️ `press` là **phím RỜI** (1 chuỗi
  mỗi `pointerdown`, không down/up, không giữ) — LÁI XE liên tục phải mở rộng giao thức (mục 3.5).
- Giao diện iPad (`mc3d-padui-2q.js`): màn chọn đội → D-pad Ring SVG chiếm 94 % màn, vùng bấm = cả góc phần tư, bom góc trên phải, `pointerdown` nhiều ngón,
  chặn zoom/menu giữ lâu/touchmove, Wake Lock, viewport-fit cover; KHÔNG dùng Fullscreen API. Trang AWord `pad.html?t=0|1`, QR chỉ mang URL (ghép cặp nhờ
  cùng tài khoản Google của thầy ⇒ không cần luật Firestore mới, chỉ thêm kind vào `APP_DATA_KINDS`).
- Hợp đồng `host` AWord cho game tự vẽ trọn màn: `{ listActs(), openAct(id), saveOptions(o), options({layer, top, onClose}), home(), templates(), switchTemplate(t) }`;
  game trả `setOptions(o) → bool` (qua `ui.liveOptions`), `destroy()` (11 việc dọn: rAF, listener, remote.detach, AudioContext, composer/pmrem dispose,
  `forceContextLoss`, xoá mount…). Hàng nút chuẩn 44×44: Menu · Sound | Thư mục · Options · Mode (+ Tablet). Chép sang AWord bằng `AWord/tools/chep-star-loot.py`
  (đổi import three sang `../../rocket-race/vendor/three/`, ghi `3d/NGUON.json` = commit myGame; ⛔ không sửa tay `3d/`).
- Tự giữ 60 khung `mc3d-autoq-2p.js` (= autores + thang chất lượng), ghim shader, tắt `checkShaderErrors`, canvas `antialias:false`.

### 1.3 TRAIN RUSH (gốc ở myGame `balloon-pop/`, bản 1ao = AWord Đợt 477)
- **Thế giới VÔ TẬN theo máy quay** (`west-world-1c`): mặt đất + dãy núi tính độ cao TRONG SHADER theo toạ độ thế giới (lưới chỉ bám máy quay), tiền cảnh
  chia KHÚC 48 đv dời lên trước khi rơi sau; kho vật thể dựng sẵn/dùng lại (hết khựng 70–130 ms khi mọc lại cây). ⭐ Đúng kỹ thuật cho ĐƯỜNG ĐUA dài.
- Fight = 2 lõi, 2 WebGLRenderer, 2 bàn trái–phải (tốn 2 context). SPEED RUN đua CHUNG MỘT đường ⇒ 1 renderer như STAR LOOT.
- Tiếng thu thật Pixabay/Freesound CC0 + `NGUON.md` (không chép mp3 Wordwall vào kho công khai).

### 1.4 Bảng tái dùng cho SPEED RUN
| Lấy gần nguyên | Lấy kiến trúc, đổi nội dung | Phải làm mới |
|---|---|---|
| `rr3d-autores.js` (đổi key) · lõi `rr3d-sfx.js` (đổi NAMES) · `rr3d-misswait.js` · importmap/khung trang/bàn thử/flash nối cảnh · `mc3d-padlink` (bắt tay, nudge, dự phòng) · `mc3d-qr.js` · autoq/pinPrograms | View thụ động + callback · pipeline hậu kỳ `Q` + bloom + grade · `class Particles` (khói lốp, bụi, lửa pô) · UI 3D gắn camera (cm thật → tỉ lệ màn) · `cfg.camera()` chase/high/wide + lerp · cổng đích → vạch đích/cổng ANDREW STUDIO · luật tên lửa (Bézier, clash, dodge window, splash, scorch) · 5 mẫu xe của `rr3d-launch.js` · thế giới vô tận `west-world-1c` · pad UI iPad | ĐƯỜNG ĐUA + cảnh 2 bên · mô hình xe đua (từ 5 mẫu) · vật lý xe (lái, trượt, quay) · luật NĂNG LƯỢNG liên tục · giao thức lái liên tục · intro xuất phát từ bãi xe · HUD năng lượng/tốc độ |

---

## 2. Khác biệt cốt lõi so với Rocket race (phải chốt trước khi dựng)

| | Rocket race | SPEED RUN (đề xuất) |
|---|---|---|
| Chuyển động | RỜI theo nấc, xe "dịch chuyển" tới nấc | LIÊN TỤC: xe luôn lăn bánh, tốc độ do NĂNG LƯỢNG |
| Đúng | +1 nấc | +E năng lượng (xe chạy nhanh hơn/lâu hơn) |
| Sai | lùi N nấc + khựng | mất năng lượng / xe khựng (phanh gấp) — KHÔNG lùi (xe không chạy lùi tự nhiên) |
| Đích | nấc L = ceil(n/2) | quãng đường D (m), hiện thanh tiến độ 2 xe |
| Hết câu | xe gần đích hơn thắng | như cũ, hoặc cho xe chạy tiếp bằng năng lượng còn lại tới khi cạn |
| Không gian | vũ trụ trống | mặt đường + 2–3 làn + cảnh 2 bên vô tận |
| Camera | chase ↔ high theo 2 nấc | chase cao, ĐỘ CAO + CỰ LY LIÊN TỤC theo khoảng cách 2 xe |
| Né tên lửa | trả lời đúng / BOOST trong 1,25 s | như cũ + (nếu có iPad) ĐỔI LÀN bằng tay lái |
| Điều khiển thêm | không | iPad lái: đổi làn, nhặt vật phẩm, né chướng ngại |

Bài học bắt buộc giữ từ Rocket race: nấc/thanh tiến độ phải RÕ trên TOMKO 86"; 2 đội độc lập, không có "ai bấm nhanh hơn thì thắng câu"
trừ khi thầy bật chế độ Same (Time delay); mọi hẹn giờ hiệu ứng chạy theo nhịp cảnh (pause/step đúng); UI 3D có renderOrder.

---

## 3. Thiết kế đề xuất

### 3.1 Vibe và bối cảnh
Đề xuất **"đường cao tốc ven biển lúc hoàng hôn"** chạy ra từ **bãi xe nhà xưởng ANDREW STUDIO** (cảnh đã có của Rocket race) — cùng vũ trụ:
Rocket race phóng từ bệ, SPEED RUN lăn bánh từ bãi xe cạnh đó. Trời hoàng hôn shader (đã có `launch-site.js`), biển + bờ cát bên phải, đồi/cây
bên trái, cột đèn + rào chắn + biển báo lặp theo khúc 48 đv, mặt đường asphalt 3 làn vạch trắng/vàng, vết phanh. Phương án khác để thầy chọn:
(b) đường đua sa mạc đất đỏ (gần Train Rush), (c) đường phố đêm neon (synthwave, bloom đẹp nhưng tối, chữ đáp án dễ chìm), (d) đường đua trên sao Hoả.
Đường **LOGIC thẳng** theo trục z (2 xe cùng khung hình, camera đơn giản), **HÌNH ẢNH có cua** bằng "curved world" trong vertex shader (bẻ cong
theo z² như Subway Surfers) + đổi hệ số cua theo khúc ⇒ cảm giác đường uốn lượn mà luật/camera vẫn thẳng. Cần thử: chữ UI gắn camera KHÔNG bẻ cong.

### 3.2 Camera (ý chính của thầy)
Góc đuổi sau lưng, **cao hơn Rocket race** (Rocket race `h 3.3, lùi 16.5, FOV 38` ⇒ SPEED RUN đề xuất `h 6–7, lùi 14, nhìn xuống ~18°, FOV 46`
để thấy mặt đường và cả 2 xe). Điểm nhìn = TRUNG ĐIỂM 2 xe (không bám xe đi sau như Rocket race, vì xe sau sẽ che/nằm sát mép dưới).
Độ cao và cự ly tăng LIÊN TỤC theo khoảng cách `gap` (m) giữa 2 xe:
- `h = clamp(h0 + k·gap, h0, hMax)`, `back = clamp(b0 + k2·gap, b0, bMax)`, góc chúi tăng theo (gap lớn ⇒ gần như nhìn từ trên xuống, thấy cả đoạn
  đường tới xe dẫn). Dùng smoothstep theo gap + lerp theo thời gian (dt·2) ⇒ không giật khi gap đổi nhanh (trúng tên lửa).
- Khi gap vượt ngưỡng lớn (xe sau ra khỏi khung dù đã lên cao nhất) ⇒ chuyển sang "góc trực thăng" từ bên hông cao (như `high` Rocket race),
  đồng thời xe dẫn thu nhỏ nhưng có MŨI TÊN/khung màu đội để lớp không mất dấu.
- Lúc bắn tên lửa: góc rộng chéo (`wide`) như Rocket race, 1,1 s.
- Tránh rung cả UI: giữ `steadyUI` (cảnh rung, bảng chỉ rung 10 %).
Cần ĐO trên TOMKO: tỉ lệ khung 2:1 của myActivity ⇒ góc cao phải không cắt xe dẫn ở mép trên.

### 3.3 Luật năng lượng — 3 mô hình để thầy chọn
- **A · Nấc như Rocket race (an toàn nhất):** đúng = +1 nấc, xe CHẠY tới nấc (không dịch chuyển), sai = khựng/mất tim. Ghép AWord y hệt Rocket race
  (dùng `core/fight.js`), không thay đổi luật trọng tài. Nhược: không có cảm giác "năng lượng", xe đứng yên giữa 2 câu.
- **B · Năng lượng thuần (liên tục):** xe luôn chạy khi còn năng lượng; mỗi câu đúng +E (thanh đầy), mỗi giây chạy −e; hết năng lượng ⇒ xe chậm dần
  rồi dừng (động cơ ho). Đội trả lời nhanh và đúng = chạy liên tục. Sai ⇒ mất ½ thanh + phanh gấp (khói lốp). Đích = D m. Nhược: đội yếu bị bỏ
  rất xa (camera lên rất cao), trận có thể kéo dài; cần "níu dây" (xe sau được +10 % tốc độ) như Rocket race Solo.
- **C · Lai (đề xuất):** đường đua chia **đoạn** (= nấc, hiện vạch sáng ngang đường); mỗi câu đúng nạp đúng 1 ĐOẠN năng lượng ⇒ xe chạy LIÊN TỤC
  hết đoạn đó trong ~2,5 s rồi lăn chậm dần về 0 ở vạch (không dừng khựng). Trả lời đúng liên tiếp ⇒ năng lượng cộng dồn ⇒ xe không giảm tốc
  (cảm giác "speed run"). Sai ⇒ phanh gấp + mất năng lượng đang dồn (không lùi). Luật thắng/thua, tên lửa, BOOST, Sudden death giữ nguyên "nấc"
  của Rocket race ⇒ ghép AWord vẫn theo nấc, chỉ phần VẼ là liên tục. ⭐ Vừa có vibe năng lượng, vừa không phá luật đã chốt.

### 3.4 Tên lửa trên thân xe
Giữ luật Rocket race (streak 3 = +1, tối đa 3, 2 bệ, tự lên nòng, chạm = bắn, hút nhau, né 1,25 s, trúng lan cùng nấc, vết cháy, chuông).
Khác về HÌNH: bệ phóng 2 ống trên nóc/sau cabin (kiểu xe chiến đấu), tên lửa bay THẤP bám đường (vòng cung thấp, không lên cao 9 đv như Rocket
race vì camera thấp hơn), vệt khói sát mặt đường. Trúng ⇒ xe QUAY TRÒN 360° (spin-out) + trượt + khói lốp + mất 1 đoạn (hoặc `rrMissile` đoạn),
thay cho "nổ + lùi nấc". Thêm tuỳ chọn mới nếu có lái iPad: **né bằng đổi làn** (tên lửa bay theo làn lúc bắn; trong 1,25 s cuối xe sang làn
khác ⇒ hụt) — đây là lý do lớn nhất để có tay lái.

### 3.5 Lái xe bằng iPad
Hai cách hiểu "lái xe cho iPad" — cần thầy chốt:
1. **iPad là TAY LÁI của đội** (như iPad D-pad STAR LOOT): 1 em cầm iPad lái, các em khác trả lời trên TOMKO ⇒ chia vai trong đội, lớp đông
   vẫn tham gia. Đề xuất chính.
2. **Bản Single chơi trên iPad** (em tự lái + tự trả lời): khả thi về kỹ thuật nhưng là game khác hẳn (1 người), để sau.

Nếu theo (1):
- **Lái để làm gì** (đường thẳng thì lái vô nghĩa): đổi 3 làn để (a) NÉ tên lửa, (b) NHẶT vật phẩm trên đường (bình năng lượng +½ đoạn, tên lửa
  +1, BOOST), (c) NÉ chướng ngại (thùng/vũng dầu ⇒ mất năng lượng/trượt), (d) không có iPad ⇒ xe tự giữ làn, mọi thứ vẫn chơi được như Rocket race.
  ⚠️ Vật phẩm/chướng ngại phải CÔNG BẰNG 2 đội: sinh theo hạt giống chung, mỗi đội cùng dãy vật phẩm ở làn của mình.
- **Giao diện lái trên iPad**, 3 kiểu để thầy chọn: (i) NGHIÊNG iPad như vô lăng (DeviceOrientation; iOS cần `requestPermission` sau một cú chạm,
  trang phải HTTPS — AWord là HTTPS, bàn thử localhost được coi là an toàn) + nút GA/PHANH; (ii) 2 nút TRÁI/PHẢI to 2 bên + GA giữa (chắc ăn nhất,
  cùng kiểu D-pad Ring); (iii) vô lăng vẽ SVG kéo xoay. Luôn giữ D-pad/nút trên TOMKO làm dự phòng như STAR LOOT.
- **Giao thức phải mở rộng** (KEYS hiện chặn ở 3 chỗ: iPad `send`, host `press`, lõi): gửi TRẠNG THÁI `"s:<steer −1..1>,<gas 0|1>,<brake 0|1>"`
  theo tick 30 Hz khi đang chạm + 1 gói lúc thả; game tự NHẢ lái/ga khi kênh im > 300 ms (an toàn khi rớt mạng); đường dự phòng qua kho ghi
  TRẠNG THÁI MỚI NHẤT (không hàng đợi phím). Cân nhắc kênh thứ 2 `{ordered:false, maxRetransmits:0}` cho gói trạng thái, kênh reliable cho
  lệnh rời (bắn, BOOST). Nếu chỉ đổi LÀN rời (trái/phải = sang làn) thì giao thức phím rời hiện có ĐỦ ⇒ đơn giản nhất cho bản đầu.
- Đề xuất bản đầu: **đổi làn RỜI** (phím l/r = sang làn, u = BOOST/ga, nút BẮN) qua đúng padlink 2q ⇒ không mở rộng giao thức; lái mượt liên tục để
  bản sau nếu thầy muốn.

### 3.6 Chế độ chơi
- **Fight 2 đội** (chính, TOMKO): mỗi đội cột đáp án bên mình như Rocket race; Same/Different + Time delay/Miss wait nếu đi khuôn `core/fight.js`.
- **Single**: 1 xe + xe máy đối thủ (như Rocket race Solo 2D có `rrRivals`), chơi được ở nhà trên máy/iPad ⇒ chỉ có nếu chọn khuôn B (mục 5).

### 3.7 Màn hình, HUD
- Khung 2:1 dính mép trên như Rocket race 2b (TOMKO, myActivity); cột đáp án 1×4 nghiêng sát 2 mép; thanh câu hỏi trên.
- HUD mỗi đội: THANH NĂNG LƯỢNG (đoạn đang nạp + dồn), đồng hồ tốc độ nhỏ, ô tên lửa + nút BOOST (như 7b), thanh TIẾN ĐỘ đường đua 2 chấm màu đội
  ở mép trên (thay `view.lead()` %). Nhãn "iPad" xanh/vàng/xám cạnh HUD đội đã nối.
- Vạch sáng ngang đường ở mỗi đoạn + bảng số đoạn ở lề; vạch đích = cổng ANDREW STUDIO + khán đài.

### 3.8 Intro, kết trận
- Intro: flycam bãi xe nhà xưởng ANDREW STUDIO (tái dùng cảnh `rr3d-launch`, bỏ bệ phóng) ⇒ 2 xe đua màu đội (xanh/cam) rời bãi ⇒ ra cổng ⇒ vào
  đường cao tốc ⇒ 3-2-1 đèn xuất phát (đèn F1 5 đỏ tắt = GO) ⇒ cắt sang cảnh đua ngay chớp sáng (như handoff mẫu 5b). ~8 s, `skip` cho bàn thử.
- Kết: xe thắng qua cổng đích pháo giấy, xe thua quay tròn/khói; máy quay quay quanh xe thắng; bảng kết quả nấc/đoạn đã đi + Play again (bảng
  `rr3dResult` của Rocket race).

### 3.9 Âm thanh
Động cơ loop đổi cao độ theo tốc độ (`playbackRate` theo năng lượng), phanh/khói lốp, tiếng nạp tên lửa (giữ charge/servo), còi báo động, nổ, gió, nhạc
nền; act voice ⇒ `setFxLevel(0.35)`. Nguồn Pixabay/Freesound CC0 + `NGUON.md` như Train Rush. Claude KHÔNG nghe được ⇒ thầy chốt trên TOMKO.

---

## 4. Kỹ thuật dựng mẫu (khi thầy "ok build")

- Thư mục `myGame/speed-run/`: `index.html` chọn mẫu · `mau-1-<tên>.html` (mỗi mẫu 1 file, không ghi đè) · `core/sr3d-1.js` lõi (view + luật bản thử gọn),
  `sr3d-1.css`, `sr3d-road-1.js` (đường + cảnh vô tận), `sr3d-car-1.js` (xe từ 5 mẫu launch), `sr3d-missile-1.js` (chép rr3d-missile rồi hạ đường bay),
  `sr3d-sfx-1.js` (chép rr3d-sfx), `sr3d-autores.js` (chép nguyên), bàn thử `window.__sr` (`start/step/resume/tap/fire/boost/lane/gap/autoplay/cam`).
  Three r170 jsDelivr importmap như mẫu 8 (chép sang AWord sẽ đổi sang vendor).
- **Đường đua vô tận**: lưới đường + lề bám camera theo khúc 48 đv (kỹ thuật west-world-1c); vật thể lề (cột đèn, rào, biển, cây) `InstancedMesh`
  dùng lại; xa mờ bằng Fog + sương màu hoàng hôn. Curved-world: uniform `uCurve` trong vertex shader của MỌI vật cảnh (`onBeforeCompile`), KHÔNG áp cho UI
  gắn camera. Thử trước: bóng đổ dưới curved world có lệch không (có thể dùng bóng blob dán dưới xe thay shadow map ⇒ rẻ cho TOMKO).
- **Xe**: `rig → body → model` như makeRocket; 4 bánh quay theo quãng đường, nghiêng thân khi đổi làn (roll 6°), nhún khi phanh; đổi làn = lerp x
  0,35 s + roll; spin-out = quay yaw 360° 0,9 s + trượt. Màu đội xanh `#3b8cff` / cam `#ff7a00` (= `DEFAULT_TEAMS`), số đội dán hông.
- **Tốc độ cảm giác**: vệt bụi/khí (từ Rocket race) + mặt đường cuộn + cột đèn lướt + motion blur giả (vệt sau xe) + FOV nới 2–3° khi BOOST.
- **Hạt**: `class Particles` cho khói lốp (xám, chậm), bụi lề, lửa pô (ngắn, additive), tàn lửa tên lửa.
- **Hiệu năng TOMKO 4K trong myActivity (PR trần 1,0)**: autores + bỏ MSAA trước, bóng chỉ blob, instancing, giữ bộ mẫu shader, đo `?do=1` như sổ tay
  `AWord/docs/TOI-UU-TOC-DO-WEB.md`. Mục tiêu 60 khung phẳng như Train Rush 1an / Star Loot 2p.
- **Bàn thử phải đo HÀNH VI**: camera cao theo gap (đo `camera.position.y` ở gap 0/3/6 đoạn), xe chạy liên tục (đo `vis` theo thời gian), tên lửa
  hụt khi đổi làn trong cửa sổ, công bằng vật phẩm 2 đội, 0 lỗi console, `step(n)` khi tab ẩn.

---

## 5. Ghép AWord — 2 khuôn, cần chốt sớm vì quyết định cấu trúc lõi

| | **A · như ROCKET RACE** | **B · như STAR LOOT / TRAIN RUSH** |
|---|---|---|
| Ai giữ luật | `core/fight.js` (trọng tài) + `speed-run.js`; view 3D thụ động gắn qua `fightFrame.fullscene` + `fightScene()` | Game tự vẽ trọn màn, tự có Single + Fight; nối AWord qua `ui.host` + `ui.liveOptions` |
| Có sẵn | Time delay · Miss wait · Same/Different · Speed bonus · Question screen iPad (`rr_link`) · bảng kết quả · Sudden death · nút engine | Chỉ hàng nút + Options thật + Library/Change template; iPad D-pad đã có khuôn (`sl-pad-signal`) |
| Chuyển động liên tục / năng lượng | Phải ép vào "nấc" (mô hình C làm được: luật nấc, vẽ liên tục) | Tự do (mô hình B/C đều được) |
| Lái iPad | Phải tự viết kênh (như rr-link) + nối vào bàn của fight | Khuôn `remote` + padlink có sẵn, chỉ mở rộng phím |
| Single 3D | KHÔNG (Rocket race Solo chỉ 2D) | CÓ |
| Core phải xin sửa | `catalog.js` + icon (+ `convert.js` nếu dạng Quiz) | như A + 1 kind `speedrun-pad` trong `store.js` |
| Chép mã | thủ công (Rocket race gốc ở AWord) | `tools/chep-speed-run.py` tự động, `3d/NGUON.json` |

**Đề xuất: khuôn B** (gốc ở myGame, chép tự động, lái iPad và chuyển động liên tục tự nhiên, có Single 3D), chấp nhận tự viết trọng tài Fight gọn
(Different mặc định: 2 đội câu riêng, không Time delay; Same/Miss wait để sau nếu thầy cần). Nếu thầy coi Time delay/Same words là bắt buộc ngay bản
đầu ⇒ chọn A với mô hình C. Dạng nội dung: **Quiz** (câu hỏi + đáp án) như Rocket race/STAR LOOT (words-picker nhóm "3 game 3D" `G3` sẽ thành 4).

---

## 6. Rủi ro đã thấy trước
- Camera lên cao khi gap lớn ⇒ xe và CHỮ đáp án (UI gắn camera) vẫn ổn, nhưng xe dẫn bé ⇒ cần khung/mũi tên màu đội; đo trên 86".
- Curved world + bóng đổ + raycast chạm (UI không cong nên raycast UI bình thường; chạm vào vật cảnh không cần).
- Năng lượng liên tục ⇒ 2 xe lệch rất xa ⇒ trận dài; phải có "níu dây" hoặc trần gap; giữ Sudden death khi hết câu.
- Lái liên tục qua WebRTC: kênh reliable nghẽn đầu hàng khi rớt gói; fail-safe nhả ga; đường dự phòng qua kho KHÔNG đủ nhanh để lái ⇒ chỉ dự phòng cho đổi làn rời.
- DeviceOrientation trên iPad: cần quyền + HTTPS + chạm trước; nếu thầy chọn nghiêng, bản thử localhost vẫn chạy nhưng iPad thật phải qua AWord.
- 2 phiên song song sửa AWord/myGame: `git fetch` + `git log` trước khi đánh số mẫu/đợt (bài học Đợt 480).

---

## 7. CÂU HỎI CẦN THẦY CHỐT — ✅ 11/10/2026 thầy trả lời "chốt" = nhận TẤT CẢ phương án đề xuất
Kết quả: (1) luật **C lai** · (2) khuôn **B** tự vẽ trọn màn như STAR LOOT · (3) iPad = **tay lái của đội**, lái để né tên lửa + nhặt vật phẩm + né chướng ngại ·
(4) **2 nút trái/phải + ga, đổi làn RỜI** · (5) **cao tốc ven biển hoàng hôn** từ bãi xe ANDREW STUDIO · (6) sai = **phanh + mất năng lượng đang dồn, không lùi** ·
(7) trúng tên lửa = **quay tròn + mất 2 đoạn** · (8) mẫu đầu **2 góc máy**.
⚠️ Claude tự quyết thêm khi dựng (báo thầy): đường là **đường đôi 4 làn, MỖI ĐỘI 2 LÀN** (đội 1 nửa trái, đội 2 nửa phải, dải vàng giữa) thay cho "3 làn chung" ở mục 3.5 —
để 2 xe không bao giờ đâm nhau và vật phẩm/chướng ngại chia công bằng theo nửa đường; đổi làn = sang làn kia trong nửa của mình.

Câu hỏi gốc:
1. **Luật năng lượng**: A nấc như Rocket race · B liên tục thuần · **C lai (đề xuất)**?
2. **Khuôn ghép AWord**: **B tự vẽ trọn màn như STAR LOOT (đề xuất)** hay A qua `core/fight.js` như Rocket race (có Time delay/Same words ngay)?
3. **Lái iPad**: (1) iPad là tay lái của đội (đề xuất) · (2) bản Single trên iPad · (3) chưa làm lái ở bản đầu? Và lái để làm gì: né tên lửa · nhặt vật phẩm · né chướng ngại (chọn nhiều)?
4. **Kiểu tay lái**: nghiêng iPad · 2 nút trái/phải + ga (đề xuất bản đầu, đổi làn rời) · vô lăng vẽ?
5. **Bối cảnh**: đường cao tốc ven biển hoàng hôn từ bãi xe ANDREW STUDIO (đề xuất) · sa mạc · phố đêm neon · sao Hoả?
6. **Sai thì sao**: chỉ phanh + mất năng lượng đang dồn (đề xuất) hay vẫn lùi N đoạn như Rocket race?
7. **Trúng tên lửa**: quay tròn + mất N đoạn (đề xuất N = 2) · nổ như Rocket race?
8. **Mẫu đầu** làm mấy góc camera để chọn (như Maze chase 3 mẫu): đề xuất 2 — "cao vừa" và "cao hơn + trực thăng khi xa".

---

## 8. Kế hoạch MẪU 1 (sau khi thầy chốt mục 7)
1. Dựng đường + cảnh vô tận + 2 xe (từ 5 mẫu launch) + camera theo gap (2 mẫu góc) + bộ câu mẫu (`questions-sample.js` của Maze chase) + luật bản
   thử gọn (đúng/sai/đoạn/đích) + bàn thử `__sr`. Chạy LOCAL cổng 8865 (`speed-run/`), 0 lỗi console, đo gap→camera.
2. Mẫu 2: tên lửa trên xe (chép rr3d-missile, hạ đường bay, spin-out) + BOOST + HUD năng lượng.
3. Mẫu 3: iPad đổi làn qua padlink 2q (kênh cục bộ 2 tab) + vật phẩm/chướng ngại + né bằng làn.
4. Mẫu 4: intro bãi xe ANDREW STUDIO + tiếng + kết trận; autores 60 khung; thầy thử TOMKO/iPad thật.
5. Ghép AWord theo khuôn đã chốt (`templates/speed-run/`, `tools/chep-speed-run.py`, đề xuất sửa core: catalog/icon/store kind), hồ sơ `GHI CHU SPEED-RUN.md`.

---

## 9. ✅ MẪU 1 (11/10/2026) — đường + 2 xe + camera theo khoảng cách · 2 góc máy
Trang: `speed-run/mau-1a-cao-vua.html` (góc A) · `speed-run/mau-1b-truc-thang.html` (góc B) · mục lục `speed-run/index.html`. Server `mygame` cổng 8865.
File: `core/sr3d-1.js` (lõi: luật + vật lý + camera + HUD, `createSpeedRun({mount, view, questions, title, options, onEvent})` — đúng dáng khuôn B để sau nối AWord) ·
`core/sr3d-world-1.js` (trời, đất, biển, đường, cột đèn, cây, vạch đoạn, cổng đích, cong thế giới) · `core/sr3d-car-1.js` (xe) · `core/sr3d-1.css` (HUD) ·
`core/sr3d-autores.js` (chép nguyên Rocket Race) · `core/page-1.js` + `core/page-1.css` (vỏ trang thử + BẢNG THỬ). Bộ câu mẫu = `maze-chase/core/questions-sample.js`.

**Luật đã dựng (C lai):** mỗi đoạn 80 m (8 đoạn mặc định = 640 m, `?steps=`). Đúng ⇒ `p+1` ⇒ xe tăng tốc 15 m/s² tới tốc độ "vừa đủ dừng đúng vạch"
(`v = √(2·11·quãng còn lại)`, trần 46 m/s = 166 km/h) ⇒ 1 câu đúng khi đang đứng = chạy ~4,6 s, đỉnh ~120 km/h; đúng dồn ⇒ không giảm tốc.
Sai ⇒ `p = ceil(s/80)` (chỉ còn chạy NỐT đoạn đang dở), phanh tới 26 m/s², đèn hậu sáng bừng + khói lốp; xe đang đứng thì không mất gì. Không lùi.
Chạm đích ⇒ thắng ngay, xe thắng chạy qua cổng rồi phanh dừng sau 110 m; chữ "TEAM n WINS!" ⇒ 2,6 s sau bảng kết quả (đoạn, số đúng/sai) + PLAY AGAIN.
Mỗi đội câu RIÊNG (Different), câu xáo, hết thì xáo lại. Đúng ⇒ câu mới sau 0,55 s; sai ⇒ lộ đáp án đúng, câu mới sau 1,3 s.

**Camera:** điểm đặt sau xe ĐI SAU; góc chúi tính sao cho CẢ 2 xe trong khung (trung bình góc tới 2 xe) — 2 xe sát nhau thì xe ở 1/3 dưới, thấy đường phía trước.

| | gap 0 | gap đầy | trực thăng |
|---|---|---|---|
| A cao vừa | cao 6,8 m · lùi 13,5 m · FOV 46 | cao 42 · lùi 56 · FOV 52 (đầy ở 300 m) | không |
| B cao hơn | cao 10 · lùi 15 · FOV 48 | cao 52 · lùi 54 (đầy ở 190 m) | 170→270 m: bay sang hông phía biển, nhìn dốc xuống, khung chỉ dùng ½ giữa (2 bên là cột đáp án) |

Đổi LIÊN TỤC (smoothstep theo gap + lerp dt·2,4). Sương lùi xa khi máy quay lên cao. Xe ở xa có **nhãn số đội màu đội** bay trên nóc (chiếu toạ độ đã cong; ẩn khi ngoài khung).

**Thế giới:** trời hoàng hôn shader (mặt trời trước-phải trên biển, mây sọc) · đất 1 tấm lưới 1700 m bám máy quay, độ cao tính trong shader (đồi + núi trái, bãi cát phải, bờ lượn theo z) ·
biển shader (lấp lánh theo mặt trời, bọt sát bờ) · đường 1440 m ghép theo bội 48 m: 4 làn, vạch đứt, dải vàng đôi giữa, **chỉ màu đội** trong vạch mép (xanh trái/cam phải),
gờ đỏ-trắng, rào hộ lan · cột đèn mỗi 24 m so le · thông/cây tròn bên đồi, dừa trên cát — InstancedMesh, vị trí tất định theo khúc ·
vạch sáng ngang đường mỗi đoạn + biển số đoạn 2 bên · vạch xuất phát/đích ô cờ + cổng FINISH · ANDREW STUDIO.
**Cong thế giới:** vertex `x += bx·dz²`, `y −= by·dz²` (dz = khoảng trước máy quay) cho mọi vật liệu cảnh + xe; bx/by đổi theo quãng đường ⇒ đường uốn lượn, đổ dốc ở xa;
TẮT DẦN khi gap 60→220 m và ở góc trực thăng (không thì xe dẫn ở xa bị dời ngang hàng chục mét, máy quay nhìn hụt). Bóng xe = blob (không shadow map).
⚠️ Độ cao đất cho cây tính lại trong JS bằng CÙNG hàm nhiễu, từng phép `Math.fround` để khớp float32 của GPU.

**Xe:** 5 dáng chép bãi xe Rocket Race (`?car=lambo|porsche|ferrari|suv|sedan`, mặc định lambo), sơn màu đội, 2 sọc trắng ôm dáng nóc, số đội trên nóc, cánh gió đuôi
(xe thể thao), đèn pha + **đèn hậu dải ngang** (phanh sáng bừng), lửa pô khi tăng tốc, bánh quay theo quãng đường, thân chúi/ngóc khi phanh/tăng tốc, nghiêng khi đổi làn.
Đổi làn đã có (phím A/D đội 1, ←/→ đội 2, nút bảng thử) — chuẩn bị cho iPad mẫu 3.

**Đã kiểm (browser pane, bàn thử `step()` vì bảng bị ẩn hãm còn 3 khung/s):** 0 lỗi console · trọn trận tự chơi 85 %/60 % ⇒ đội 1 thắng 8/8 sau ~47 s ·
gap 0/74/234/480 m ⇒ máy quay cao 6,8/11,4/36,7/42 m (A) · B ở gap 240–320 ⇒ trực thăng 88–100 %, 2 nhãn xe trong khung giữa · bấm tay ô đáp án: sai ⇒ đỏ + lộ đúng + khoá ·
logic ~0,05 ms/khung · vẽ ~1 ms trên RTX 4060 (108 lệnh vẽ, 141 nghìn tam giác) — **chưa đo TOMKO/myActivity**.
**Lỗi gặp & gỡ:** (1) xe dẫn ở 230–480 m nhỏ không thấy ⇒ nhãn số đội · (2) góc trực thăng đặt xe sau 2 cột đáp án ⇒ khung chỉ dùng ½ giữa · (3) trực thăng quá xa + mù sương ⇒
nhìn dốc xuống + sương theo độ cao · (4) nhãn xe thua dồn vào góc màn ⇒ ẩn khi ngoài khung · (5) máy quay kết lượn vào hàng cây ⇒ lượn phía biển ·
(6) đèn xe chìm trong mép vát thân (bản bãi xe cũng vậy) ⇒ đẩy ra 0,07 m · (7) trình duyệt giữ mô-đun cũ sau khi sửa ⇒ `fetch(..., {cache:'reload'})` rồi nạp lại.
**Chưa có (theo kế hoạch):** tiếng · tên lửa + BOOST (mẫu 2) · iPad + vật phẩm/chướng ngại (mẫu 3) · intro bãi xe ANDREW STUDIO (mẫu 4) · Single · tự giữ 60 khung đã gắn nhưng chưa đo máy yếu.
⬜ Thầy xem 2 góc máy (TOMKO nếu được) ⇒ chọn A hay B (hoặc trộn), nhận xét xe/đường/độ cong/tốc độ ⇒ mẫu 2.

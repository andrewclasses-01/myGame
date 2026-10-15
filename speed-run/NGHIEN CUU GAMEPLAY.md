# SPEED RUN 3D — hồ sơ nghiên cứu gameplay (11/10/2026)

Game 3D thứ 4 của kho myGame (sau ROCKET RACE, STAR LOOT, TRAIN RUSH). Đua Ô TÔ 2 đội, cùng vibe Rocket race
nhưng thiết kế khác hẳn: có ĐƯỜNG ĐUA thật, camera sau lưng 2 xe nhưng CAO hơn, trả lời đúng = NĂNG LƯỢNG cho xe
chạy, tên lửa gắn trên thân xe bắn đối phương, cân nhắc LÁI XE bằng iPad. Mục tiêu cuối: ghép vào AWord.

Trạng thái: **15/10/2026 MẪU 3q (mục 29): FIGHT (theo lượt, Lives, Missile damages, Time delay, Miss wait, streak) + cảnh xa đúng vật lý + 35 km/h — lên AWord Đợt 531. Trước đó MẪU 3p (mục 28): MƯỢT (gộp lưới xe, số đo xe sẵn, dịch sẵn shader) + CHẠM ĐÚP bỏ intro — đã lên AWord Đợt 529. Trước đó MẪU 3o (mục 27): GÓI NHÚNG rw-3o.js để đưa RACING WORDS lên AWord (Options AWord, 13 xe, iPad Firestore). Trước đó 3n intro + âm thanh thật (26)… Các mẫu cũ giữ nguyên.**

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

## 10. ✅ MẪU 2 "BUỒNG LÁI" (11/10/2026) — chia đôi màn · góc nhìn trong xe · lái iPad kiểu Asphalt · tên lửa né được
Thầy (11/10, phiên sau mẫu 1):
> "Chia màn hình làm 2, sử dụng góc nhìn thứ nhất làm điều khiển trong xe. Các thông số cũng hiển thị bên trong, để chừa một dải trên hiện câu hỏi và bản đồ đường đua"
> "Sử dụng điều khiển là iPad, điều khiển trái phải, tăng tốc phanh tương tự như các game Asphalt thông thường"
> "Xe có trang bị tên lửa, có cơ chế bắn tương tự như rocket race, có thể tăng tốc hoặc phanh để tránh, có thể lái trái phải để tránh"
⇒ Câu hỏi "chọn góc A hay B" của mẫu 1 KHÔNG CÒN: thầy chuyển hẳn sang góc nhìn TRONG XE.

Trang: `speed-run/mau-2-buong-lai.html` (+ tay lái iPad `speed-run/pad-2.html?t=0|1`). Mẫu 1 giữ nguyên.
File mới: `core/sr3d-2.js` (lõi) · `core/sr3d-2.css` · `core/sr3d-missile-2.js` (tên lửa + hạt khói/lửa/tia lửa dùng chung) · `core/sr3d-padlink-2.js` (nối iPad, gốc STAR LOOT 2q,
MỞ RỘNG giao thức) · `core/sr3d-padui-2.js` (giao diện tay lái) · `core/page-2.js` (vỏ thử). Dùng lại NGUYÊN `sr3d-world-1.js`, `sr3d-car-1.js`, `sr3d-autores.js`.

**Màn hình:** dải trên 15 % = câu hỏi đội 1 | BẢN ĐỒ đường đua (đường lượn từ xuất phát tới cờ đích, vạch mỗi đoạn, 2 chấm xe, chấm đỏ tên lửa đang bay, "TEAM n +34 m") | câu hỏi đội 2.
Dưới = 2 nửa, mỗi nửa 1 máy quay TRONG XE của đội đó: cột kính + mép mui (SVG), gương chiếu hậu = "TEAM 2 ahead 34 m", nhãn xe đối thủ trên đường, nắp capô 3D màu đội có 2 sọc.
TAP-LÔ (DOM, 27 % chiều cao khung) = màn cảm ứng 4 đáp án (2×2) + giá 3 tên lửa + nút FIRE + 3 chấm chuỗi đúng; VÔ LĂNG kiểu F1 quay theo tay lái, màn giữa vô lăng hiện
nguồn lái (AUTO / KEYS / iPAD) + km/h + 4 ô năng lượng. 2 tap-lô ĐỐI XỨNG: màn đáp án ở MÉP NGOÀI (2 nhóm em đứng tách 2 bên bảng như cột đáp án Rocket Race), vô lăng ở giữa.
Giữa 2 nửa: vạch chia xanh|cam. Màn chờ: máy quay đuổi sau xe mình, nút START + "iPad steering"; đếm đèn F1 thì máy quay lùi vào ghế lái; kết: máy quay ra lại sau xe + bảng kết.

**Lái (kiểu Asphalt):** xe TỰ CHẠY ga đều 112 km/h khi còn năng lượng; ◀ ▶ lái LIÊN TỤC trong nửa đường của đội (dải phân cách bê tông giữa, rào hộ lan ngoài; quệt rào ⇒ chậm + tia lửa;
đứng yên thì không lách ngang được); BOOST ⇒ 169 km/h; BRAKE ⇒ phanh 22 m/s². Nguồn lái theo thứ tự: iPad đã nối > bàn phím (A/D/W/S/F · ←/→/↑/↓/Enter, 4 s không chạm ⇒ thôi)
> TỰ LÁI (giữ làn trong, BOOST khi còn > 1,15 ô). iPad đã nối mà em không chạm ⇒ xe đi thẳng ga đều.

**Luật năng lượng (giữ "C lai" mẫu 1):** năng lượng E tính bằng MÉT; mỗi câu đúng +80 m (1 ô), tối đa 4 ô; xe chạy bao nhiêu trừ bấy nhiêu; tốc độ trần √(2·9·E) ⇒ hết năng lượng là
lăn chậm dần dừng ĐÚNG chỗ (không có quãng "trôi không mất tiền") ⇒ TỔNG QUÃNG ĐƯỜNG = TỔNG NĂNG LƯỢNG, công bằng; lái giỏi (BOOST, né) chỉ làm tới SỚM hơn.
SAI ⇒ phanh gấp 0,55 s + mất các ô ĐẦY đang dồn, giữ ô đang chạy dở (đúng tinh thần quyết định 6). Chạm đích trước thắng.

**Tên lửa (như Rocket Race):** 3 câu đúng LIÊN TIẾP = +1 quả (tối đa 3, hiện đầu đạn đỏ trên 2 ống phóng ở nóc xe). Bắn: nút FIRE trên tap-lô / nút tên lửa iPad / phím F, Enter (cách nhau ≥ 1 s).
Bay 2,6 s theo vòng cung thấp (Bézier, đỉnh 5–12 m) tới ĐIỂM RƠI DỰ ĐOÁN = chỗ xe bị bắn SẼ ở (theo v, a hiện tại, không quá năng lượng còn lại), cập nhật liên tục tới khi còn
1,1 s thì KHOÁ. Đánh dấu điểm rơi: CỘT SÁNG ĐỎ đứng thẳng + vòng ngắm trên đường; nửa màn bị bắn viền đỏ nhấp nháy + "⚠ MISSILE 1.8 s" → "DODGE!"; iPad cũng báo đỏ.
Lúc chạm: lệch ngang < 1,55 m VÀ lệch dọc < 3,4 m ⇒ TRÚNG: xe xoay tròn 1,4 s (máy quay trong xe xoay theo) + mất 2 ô năng lượng (quyết định 7); trong ~4,2 m ⇒ SƯỢT (khựng);
xa hơn ⇒ "DODGED!". Né được bằng: lái sang làn kia (3,6 m) · phanh · BOOST (nếu chưa ở tốc độ tối đa). Không có người lái (tự lái): trả lời ĐÚNG khi tên lửa đang bay ⇒ xe tự đánh lái né.

**iPad — giao thức mở rộng** (`sr3d-padlink-2.js`, bắt tay y hệt 2q): iPad → game `"s:<lái −100..100>,<boost>,<brake>"` (gửi khi đổi + nhắc lại 120 ms khi đang giữ; game NHẢ hết nếu im
> 450 ms) + `"fire"`; game → iPad `"i:km/h,ô,tên lửa,báo động,pha"` 4 lần/giây. Đường dự phòng qua kho: `sn/st` = trạng thái lái MỚI NHẤT (≤ 5 lần/giây) + `rs/rq` cho lệnh rời.
Tay lái iPad (`pad-2.html`): cầm ngang 2 tay — ngón cái trái ◀ ▶ (giữ để lái), ngón cái phải BRAKE + BOOST (bàn đạp), nút tên lửa góc trên phải (số quả), giữa trên đồng hồ km/h + 4 ô
năng lượng + "⚠ MISSILE / DODGE! / ANSWER FOR ENERGY"; nút TILT = lái bằng nghiêng iPad (thử nghiệm, iOS hỏi quyền, lúc bật lấy tư thế đang cầm làm "thẳng"; CHƯA thử trên iPad thật).
⚠️ Bàn thử myGame dùng kênh bắt tay CỤC BỘ (2 tab cùng trình duyệt). iPad THẬT cần kênh bắt tay qua kho chung (Firestore của AWord) ⇒ làm khi ghép AWord.

**Đã kiểm (browser pane):** cả trận tự chơi tới đích (~38 s, có trúng tên lửa) · 4 kịch bản tên lửa: đứng im ⇒ TRÚNG (xoay, mất 2 ô) · lái sang làn ngoài sau khi khoá ⇒ NÉ · phanh ⇒ NÉ ·
BOOST ⇒ NÉ · tay lái iPad ở tab thứ 2: nối WebRTC (trễ 1–2 ms), ◀ ▶ lái, BOOST tăng tốc, bắn tên lửa từ iPad, iPad nhận km/h + báo động; tải lại trang iPad ⇒ tự nối lại ·
phím A/F ⇒ nguồn lái KEYS · 0 phần tử NaN trong cảnh · 173 lệnh vẽ, 286 nghìn tam giác (2 máy quay) · thực tế 60+ khung/s trên RTX 4060 — **chưa đo TOMKO/myActivity, chưa thử iPad thật**.
**Lỗi gặp & gỡ:** (1) MÀN ĐEN sau vài giây trong xe: `Math.pow(f, 1.4)` với f âm 1e-8 ở mép capô ⇒ NaN ⇒ bloom loang NaN đen CẢ 2 nửa ⇒ kẹp f vào 0..1 ·
(2) three.js giải MSAA (blit) ở cuối mỗi `render()` và phép blit BỊ scissor cắt ⇒ dải dưới tap-lô không được giải ⇒ vẽ thêm 1 cảnh rỗng không scissor để giải trọn khung ·
(3) chân trời thấp, capô chỉ là vệt mảnh ⇒ dịch ống kính `setViewOffset` (không chúi máy, cột đèn vẫn thẳng) đặt chân trời ở 42 % khoảng 3D + capô "ăn gian" kích thước ·
(4) vòng ngắm phẳng trên đường nhìn từ mắt người lái (1,1 m) ở 30 m chỉ còn 3–4 px ⇒ thêm CỘT SÁNG đứng · (5) cột cộng sáng bị nhoà trên trời hoàng hôn ⇒ trộn thường ·
(6) khung báo động che đúng chỗ tên lửa lao xuống ⇒ dời xuống trên capô · (7) tên lửa vọt cao 11 m, ngoài khung nhìn (chỉ thấy tới ~18° trên chân trời) ⇒ vòng cung thấp, đầu đường bay nhanh ·
(8) nút TILT đè nút ▶ trên iPad ⇒ dời lên góc trên trái. Bài học bàn thử: sau `composer.render()` OutputPass đã ĐỔI bộ đệm ⇒ đọc điểm ảnh ở `writeBuffer`, không phải `readBuffer`.
**Chưa có:** tiếng · vật phẩm/chướng ngại trên đường · intro bãi xe ANDREW STUDIO · bản Single · ghép AWord (khuôn B + kênh bắt tay Firestore cho iPad thật).
⬜ Thầy chạy thử (bàn phím hoặc 2 tab iPad giả) ⇒ nhận xét: bố cục tap-lô, cỡ chữ đáp án, cảm giác lái, tốc độ, độ khó né tên lửa, luật năng lượng (ga tự động + BOOST không tốn thêm).

---

## 11. ✅ MẪU 3 "ĐUA VÒNG" (15/10/2026) — va chạm · cầu nhảy · đường vòng · tốc độ tối thiểu · nút trên màn
Thầy chạy thử mẫu 2 (Chrome, 2 tab iPad giả) rồi dặn 7 ý, "trong game trước, iPad sau":
1. Bỏ vạch cứng giữa 2 đội ⇒ lái sang đường nhau, va chạm, húc, chèn, ép, chắn đầu "như thật".
2. Cầu nhảy (Jump Ramp): lực đẩy lên + tới giữ xe trên không lâu hơn thật · +20 % tốc độ lúc rời mép · máy quay rộng + thấp + FOV +15–20 % · motion blur + rung lúc cất cánh/đáp ·
   vệt gió sau đuôi · điều khiển nhẹ trên không · phanh/drift trên không = xoay 360 (Barrel Roll / Flat Spin), mỗi vòng +Nitro · đáp 4 bánh song song < 15° = Landing Boost (vọt + toé lửa/khói),
   nghiêng/lật = mất đà, nảy nổ, văng đuôi.
3. Bản đồ ra GIỮA dải trên, 2 khung câu hỏi sang 2 bên; dải trên THẤP hơn; bỏ chữ TEAM trong khung, "TEAM n" hiện giữa khung khi chưa có câu hỏi.
4. Bản đồ = đường VÒNG, đi trọn vòng và nhiều vòng nếu nhiều câu hỏi.
5. Xe luôn có tốc độ tối thiểu (trừ khi bị tấn công, dừng tạm) + không để 2 xe quá xa nhau.
6. Hàng nút chức năng như các game khác (sẽ vào AWord) nhưng DỒN về góc phải vào 1 nút: bấm ⇒ các nút mở ra bên trái; bấm chỗ khác ⇒ thu lại.
7. Thêm nút PHANH + TĂNG TỐC trên màn chính (không iPad vẫn chơi); vô lăng bấm 2 bên để lái, bấm thì sáng mờ màu đội bên đó.

Trang: `speed-run/mau-3-dua-vong.html` + tay lái iPad `speed-run/pad-3.html?t=0|1` (= pad-2, kênh cục bộ riêng `srpad3` để mở cùng lúc với mẫu 2 không giành nhau; giao thức lái giữ nguyên).
File mới: `core/sr3d-3.js` (lõi, chép sr3d-2) · `core/sr3d-3.css` (CSS mẫu 2 + khối MẪU 3 cuối file) · `core/sr3d-fx-3.js` (dốc + vệt gió + pass nhoè) ·
`core/sr3d-world-3.js` (chép world-1: vạch giữa trắng đứt, cổng LAP n / FINAL LAP / FINISH) · `core/page-3.js` + `core/page-3.css` (vỏ thử + hàng nút 80 px). Mẫu 1, 2 không đổi.

**Va chạm:** 2 thân xe = 2 hình chữ nhật xoay trên mặt đường (x, s), dò bằng SAT; tách nửa độ chồng mỗi xe; xung lực e 0,28 (dọc ⇒ đổi thẳng tốc độ chạy, ngang ⇒ lực đẩy `px` tắt dần
2,2/s ⇒ ÉP được nhau sang ngang tới rào); mô-men r × J ⇒ văng đuôi (`yk`, lò xo tắt dần); tia lửa + rung theo độ mạnh; "BUMP!" / "SLAM!" (≥ 1,1 s một lần). Đo: xe 159 km/h húc đuôi
xe 43 km/h ⇒ xe trước vọt 134, xe sau còn 89; xe lái sang ngang ép xe kia trôi từ x 0,8 → 4,9 m.
**Đường vòng:** bản đồ = Catmull-Rom khép kín (14 điểm, chiều kim đồng hồ) trong SVG 1000 × 200; LAPS = `?laps` hoặc tự động round(số đoạn / 4) (mặc định 12 đoạn = 960 m = 3 vòng × 320 m);
thế giới 3D vẫn là đường thẳng + "cong thế giới" nhưng độ cong `uBend.x` nay LẤY TỪ ĐỘ CONG BẢN ĐỒ 30–150 m phía trước (khớp khúc cua trên bản đồ), làm mượt 0,08/khung.
Cổng "LAP 1 / 3" ở xuất phát, "LAP 2 / 3", "FINAL LAP", "FINISH"; toast "LAP n" / "FINAL LAP!" khi qua mốc.
**Tốc độ tối thiểu + kéo gần:** VMIN 12 m/s (43 km/h) luôn có khi đang đua (trừ trúng tên lửa: a −26 ⇒ gần dừng trong 1,4 s xoay; phanh vẫn dưới VMIN được để né). Năng lượng E (m) nay
chỉ cho chạy NHANH hơn: trần √(VMIN² + 2·DEC·E). Kéo gần: cách > 25 m thì xe sau +14 m/s VMIN (+6 trần), xe trước ×(1 − 0,32), đủ mức ở 115 m; trần cứng 150 m (xe trước không nhanh
hơn xe sau). Tự chơi 85 % / 40 %: 2 vòng 640 m hết 23 s, cách xa nhất 120 m, về đích cách 46 m ⇒ đổi mặc định 8 → 12 đoạn.
**Cầu nhảy:** dốc 10 m × cao 1,7 m (9,7°), rộng 7 m, mỗi vòng 2 dốc ở 30 % và 70 % vòng, lệch nửa trái/phải xen kẽ (phải lái sang ⇒ tranh nhau); bỏ dốc trong 90 m đầu và 70 m cuối.
Rời mép dốc ⇒ v ×1,2 (`AIR.BOOST`), vy = min(8,2; 2,8 + v·sin θ·0,55 + v·0,035); trọng lực 4,5 trong 0,45 s đầu rồi 10,5 ("lơ lửng"). Đo: 52 km/h ⇒ bay 1,5 s / 22 m / cao 3,6 m ·
131 km/h ⇒ 2,0 s / 74 m · 210 km/h ⇒ ~2,5 s. Trên không: ◀ ▶ = nghiêng 1,5 rad/s + lượn 0,45 rad/s + trôi ngang; nhả tay ⇒ tự cân về vòng trọn gần nhất. PHANH = xoay 7,4 rad/s
(phanh thẳng = Flat Spin quanh trục đứng, phanh + lái = Barrel Roll); nhả phanh ⇒ tự xoay NỐT tới vòng trọn. Đáp: sai lệch lớn nhất (chúc/nghiêng/hướng) < 15° = PERFECT (+8 m/s ngay +
`lbT` 1 s trần +12, toé lửa + khói, rung) · < 32° = đáp thường · còn lại = BAD (v × 0,45, nảy lại 3,4 m/s, nổ nhỏ, văng đuôi theo góc đang lệch). Mỗi vòng trọn khi đáp được (không BAD)
= +0,34 Nitro (+0,1 nếu PERFECT). NITRO: giữ BOOST khi thanh còn ⇒ VNITRO 57 m/s (205 km/h), tốn 0,3/s, lửa pô + FOV +5. Tên lửa nổ khi xe đang bay cao > 1,6 m ⇒ "JUMPED IT!".
Máy quay nhảy (`jk`): ra ngoài sau–bên xe (±2 m, lùi 8,6 m, cao 0,8 + 0,35·y — THẤP hơn xe), nhìn thẳng xe, FOV ×1,18; đáp đất thì về ghế lái. Nhoè: ShaderPass hướng tâm riêng 2 nửa
(mẫu không loang qua vạch chia), mạnh khi bay/cất cánh/đáp/Nitro. Vạch tốc độ CSS (repeating-conic-gradient + mask) khi bay/Nitro. Vệt gió: 2 dải ở 2 góc sau, mỗi dải 2 băng chéo, 34 điểm.
Bóng blob tách khỏi rig (nằm trên đường, nhạt + to theo độ cao).
**Dải trên:** 10cqh (mẫu 2: 15cqh), cột `1fr 27cqw 1fr`; bản đồ giữa = cột LAP n/N | vòng SVG | khoảng cách; "TEAM n" giữa khung khi chưa đua, câu hỏi ẩn; lúc đua ngược lại.
**Tap-lô:** màn đáp án | BOOST (xanh, có thanh Nitro dâng trong nút, "N2O" khi có) + BRAKE (đỏ) | vô lăng. Vô lăng: giữ nửa trái/phải ⇒ lái, vầng sáng mờ màu đội bên đó (nhiều ngón
cùng lúc được — mỗi pointerId 1 việc). Nguồn lái: iPad > TOUCH/KEYS (4 s) > TEST > AUTO. Màn vô lăng thêm thanh Nitro.
**Hàng nút** (`bar` truyền vào createSpeedRun, ngoài khung game như AWord): 1 nút ô vuông 4 ô ở góc phải; bấm ⇒ Menu · Sound · Switch activity · Options · iPad · Full screen bung sang
trái; bấm ra ngoài ⇒ thu. Menu = về màn chờ; Folder/Options báo "có khi ghép AWord".
**Đã kiểm (browser pane, step tay):** nhảy + Flat Spin ⇒ "PERFECT! 360 SPIN ×1 +NITRO" (N 0,44) · Barrel Roll giữ phanh tới lúc chạm đất ⇒ "BAD LANDING!" · ép ngang + húc đuôi (số ở trên) ·
cả trận tự chơi tới đích, mỗi xe nhảy 3 lần, 0 vị trí NaN · bấm thật nửa vô lăng đội 2 ⇒ nguồn lái TOUCH · nút gom bung/thu đúng · pad-3 nối WebRTC với mẫu 3. Chưa đo fps (khung ẩn).
⬜ Thầy chạy thử mẫu 3 ⇒ nhận xét: cảm giác va chạm, độ dài bay, độ khó xoay/đáp, tốc độ tối thiểu, kéo gần, bố cục dải trên + tap-lô. ⬜ iPad (thầy dặn làm sau): nút xoay/nitro trên tay lái iPad.

---

## 12. ✅ MẪU 3b (15/10/2026) — bàn đạp thật 2 bên vô lăng · dải nút gọn · ANDREW STUDIO · 3 chế độ iPad
Thầy thử mẫu 3 rồi dặn tiếp:
- BOOST và BRAKE ở 2 bên vô lăng (BOOST trái, BRAKE phải), vẽ đúng hình bàn đạp ga và phanh thật.
- Nút control bằng cỡ các nút khác; dải chứa nút bé lại.
- Màn khởi động: bỏ dòng hướng dẫn (Answer right = …), bỏ chữ "Space Explorers" (tên bộ câu hỏi), bỏ nút iPad steering (đã có nút control); thêm ANDREW STUDIO thật ngầu trên chữ SPEED RUN.
- Nút iPad có 3 tùy chọn: (1) tắt iPad — đua + câu hỏi + trả lời trong game; (2) đua trong game, trả lời trên iPad — câu hỏi CHỈ trên iPad, game chỉ hiện đáp án;
  (3) đua trên iPad, game hiện mọi thứ (cả vô lăng, boost, brake nhưng không điều khiển được); iPad hiện đúng vô lăng + bàn đạp y hệt game, thêm 1 nút tên lửa ở chỗ phù hợp.

Trang: `speed-run/mau-3b-ban-dap.html` + iPad `speed-run/pad-3b.html?t=0|1` (kênh cục bộ `srpad3b`). Mẫu 3 giữ nguyên.
File mới: `core/sr3d-3b.js` (lõi, chép sr3d-3) · `core/sr3d-3b.css` (CSS mẫu 3 + khối MẪU 3b cuối file) · `core/sr3d-dash-3b.js` (SVG vô lăng + bàn đạp GA + PHANH + tên lửa
DÙNG CHUNG game/iPad) · `core/sr3d-padlink-3b.js` (chép padlink-2 + giao thức chế độ/câu hỏi/trả lời) · `core/sr3d-padui-3b.js` (màn iPad 3 chế độ) · `core/page-3b.js/.css`.

**Bàn đạp:** GA = tấm cao kiểu "organ pedal" (bản lề ở chân, cao su gân ngang, khung kim loại) — thanh NITRO dâng màu xanh ngọc TRONG mặt đạp (`.sr-nfill`, scaleY);
PHANH = tay đòn kim loại thả từ trên + mặt đạp rộng thấp viền đỏ. Cụm `.sr-drive` = GA | vô lăng | PHANH, KHÔNG đảo chiều ở đội 2 (GA luôn trái). Nhấn ⇒ bàn đạp lún (rotateX)
+ sáng màu đội. Vô lăng 34cqh (mẫu 3: 37). Bàn đạp/vô lăng sáng theo MỌI nguồn lái tay (chạm màn, phím, iPad) — tự lái thì không.
**Hàng nút:** 60 px (mẫu 3: 80), mọi nút 42 px kể cả nút Control.
**Màn khởi động:** chỉ còn ANDREW STUDIO (dải nền tối nghiêng −12°, viền vàng trên/dưới, chữ kim loại vàng chạy ánh sáng `sr-shine`, 2 vạch sáng 2 bên) · SPEED RUN · START.
**3 chế độ iPad** (`padMode`, nhớ localStorage `speedrun.padMode`, mặc định 0; chọn trong bảng iPad của hàng nút — 3 thẻ, thẻ đang chọn viền vàng; chế độ 2/3 hiện QR/link nối iPad):
- 0 TẮT: game bỏ qua iPad; iPad hiện "iPad is OFF".
- 1 TRẢ LỜI TRÊN iPAD: khung câu hỏi trong game hiện "QUESTION ON THE iPAD" (nhấp nháy), đáp án vẫn hiện trên tap-lô nhưng KHÔNG bấm được; iPad hiện câu hỏi + nút đáp án,
  bấm ⇒ `a:<k>:<số câu>` (game bỏ nếu số câu đã cũ), tô đúng/sai/đáp án đúng theo game gửi lại; chưa đua ⇒ GET READY / 3·2·1 / RACE OVER. Xe trong game lái bằng chạm/phím/tự lái.
- 2 ĐUA TRÊN iPAD: iPad = tap-lô y hệt (GA | vô lăng có màn km/h + năng lượng + Nitro | PHANH), giữ nửa trái/phải vô lăng để lái; NÚT TÊN LỬA tròn đỏ GÓC TRÊN PHẢI (ngay trên
  bàn đạp phanh — ngón cái phải trượt lên là tới, không lẫn bàn đạp), số quả trên nút; báo động đỏ viền màn + "⚠ MISSILE / DODGE!". Trong game vô lăng + bàn đạp KHÔNG bấm được,
  chỉ quay/lún/sáng THEO iPad; câu hỏi + đáp án vẫn bấm trên màn lớn.
**Giao thức thêm** (padlink-3b): game → iPad `m:<0|1|2>` + `Q:<json>` (gửi khi đổi, gửi lại khi iPad vừa nối, đồng thời GHI m0/m1/q0/q1 vào tài liệu "host" ⇒ Wi-Fi chặn nối thẳng
vẫn nhận); `i:` thêm trường Nitro. iPad → game `a:<k>:<n>` (đi được cả đường dự phòng rs/rq). Số câu `qn` lấy từ bộ đếm toàn cục (không đặt lại khi chơi lại).
**Đã kiểm (browser pane):** chế độ 2 — iPad hiện đúng câu hỏi + 3 đáp án, bấm THẬT "Rocket" ⇒ game ✔ +1 ô năng lượng, sang câu mới, iPad nhận câu mới; khung câu hỏi game hiện
"QUESTION ON THE iPAD". Chế độ 3 — giữ GA + nửa trái vô lăng trên iPad ⇒ game nguồn lái iPAD, steer −1, boost 1, bàn đạp GA game lún + vô lăng sáng trái; bấm THẬT nút FIRE iPad ⇒
tên lửa bay (2 → 1 quả). Bảng iPad 3 thẻ + QR. Không lỗi console.
⬜ Thầy thử mẫu 3b trên Chrome + nhận xét bàn đạp, ANDREW STUDIO, 2 màn iPad. ⬜ iPad THẬT cần kênh bắt tay qua kho chung khi ghép AWord.

---

## 13. ✅ MẪU 3c (15/10/2026) — boost tích trữ · tên lửa mới + cánh tay nóc xe · slow motion về đích · iPad đồng bộ mọi lúc
Thầy thử 3b rồi dặn 16 ý: bỏ cột JUMP cạnh dốc · leo dốc không boost thì chậm như vật lý · húc đuôi xe đang phanh ⇒ xe trước được đẩy nhanh, xe sau chậm (không tự tránh) ·
sai ⇒ vạch boost giảm + khói đen + chậm chút · đúng ⇒ KHÔNG tự tăng tốc, vạch boost tăng (nhanh tay tăng nhiều), bàn đạp boost = năng lượng tích trữ, giữ thì dùng dần ·
mặc định cùng câu hỏi (đổi trong Options) · bảng chọn chế độ iPad nhỏ giữa màn + hỏi xác nhận, OK là đóng, đổi chế độ vẫn chơi tiếp · máy quay bay/về ghế lái nhanh hơn ·
điều khiển iPad hiện lên game cả lúc chờ · tên lửa đẹp/nhỏ/tinh tế + cánh tay robot trên nóc 2 quả cạnh nhau · mỗi lần trúng một kiểu văng khác ·
nút tên lửa chỉ icon 2 quả chéo, bấm ⇒ quả vút lên trong nút, tên lửa chờ dựng đứng ≤ 4 + "+x" · vô lăng chỉ sáng 1 cung 1/4 bên bấm (game + iPad) ·
bàn đạp: trên cố định, dưới lún · về đích slow motion + cinematic · tên lửa bay nhanh hơn, quỹ đạo thật hơn.

Trang: `speed-run/mau-3c-boost.html` + iPad `speed-run/pad-3c.html?t=0|1` (kênh `srpad3c`). 3b giữ nguyên.
File: `core/sr3d-3c.js/.css` (chép 3b) · `core/sr3d-dash-3c.js` (vô lăng 2 cung sáng `.wg.wl/.wr`, bàn đạp TREO: nhóm `.mv` quay quanh trục giá, icon 2 quả chéo + quả bay `.sr-fly`,
`reserveHTML(n)`) · `core/sr3d-missile-3c.js` (`missileGeos()` + `buildMissile()` dùng chung cho quả bay và quả trên giá; MS.T 2,0 s, khoá 0,9 s; Bézier leo dốc rồi bổ nhào;
u = 0,38x + 0,62x² = tăng tốc dần; khói mảnh) · `core/sr3d-fx-3c.js` (bỏ biển JUMP) · `core/sr3d-padlink-3c.js` (= 3b) · `core/sr3d-padui-3c.js` · `core/page-3c.js/.css`.

**Boost tích trữ:** xe luôn chạy tốc độ NỀN `VBASE` 22 m/s (79 km/h; xe sau được +12 theo kéo gần). E (m, 4 ô × 80) = thanh boost, hiện bằng lớp xanh dâng trong bàn đạp ga + 4 ô trên vô lăng.
Giữ BOOST khi E > 0 ⇒ tiến tới VBOOST 47 (169 km/h), tốn `BUSE` 0,55 ô/giây (đầy 4 ô ≈ 7 s). ĐÚNG ⇒ +0,6…1,2 ô theo tốc độ trả lời (≤ 1,5 s: 1,2 · ≥ 7,5 s: 0,6), toast "+BOOST"/"FAST! +BOOST",
KHÔNG đổi tốc độ. SAI ⇒ −0,6 ô, v × 0,86, khựng 0,12 s, khói ĐEN 1,3 s từ 2 ống xả (`missiles.dark`). Xoay 360 đáp được ⇒ +0,6 ô/vòng (+0,25 nếu PERFECT) (Nitro cũ gộp vào đây).
Đo: đúng 74 → 79 km/h (không tăng tốc), giữ boost 1 s ⇒ 142 km/h; sai ⇒ 1,48 ô, 67 km/h, khói đen.
**Dốc:** trên dốc không đạp boost ⇒ a −= 9,8·sin θ·3,2 (≈ −5,3 m/s²). **Húc đuôi:** va chạm dọc (|n.s| > 0,55) ⇒ xe trước +2 + 0,35j m/s và `pushT` 1,3 s (giảm tốc rất chậm),
xe sau −1,5 − 0,4j m/s + khựng 0,15 s. Tự lái bỏ luật tự vượt/tránh xe chắn đầu; tự lái đạp boost khi > 1,4 ô hoặc sắp tới dốc.
**Cùng câu hỏi** (`opt.sameQ`, mặc định true): `G.qList` chung — cùng thứ tự câu + thứ tự đáp án, mỗi đội đi theo nhịp mình (`t.qi`). Options (hàng nút): Same/Different + Missiles max 1–10,
lưu localStorage `speedrun.opts` (sau này = Options AWord).
**Bảng iPad:** nhỏ (40cqw) giữa màn, 3 dòng chế độ + đèn nối 2 iPad; bấm ⇒ lớp xác nhận "Switch to …? Cancel / OK", OK ⇒ đổi + đóng bảng; trận không dừng. Bỏ QR (iPad thật vào từ trang chủ AWord).
**iPad lúc chờ:** ngoài pha đua, `idleInput()` lấy tay lái iPad (chế độ 3) / phím / chạm ⇒ vô lăng quay, cung sáng, bàn đạp lún trên màn lớn. Máy quay nhảy: vào 13/s, ra 8/s (3b: 5 / 2,6).
**Bệ phóng nóc xe:** đế + tay A (bản lề sau, 2 thanh) + khớp + tay B giữ GIÁ có 2 quả cạnh nhau (×0,62). Có tên lửa ⇒ tay nâng 0,85 rad, giá chếch lên; hết ⇒ gập sát nóc.
Bắn quả nào ⇒ quả rời đúng vị trí trên giá (`slotWorld`), chỗ đó trống rồi quả mới lớn dần lên (nạp) nếu còn. Đã soi gần: 2 quả mảnh mũi màu đội trên giá nâng.
**Trúng tên lửa ngẫu nhiên:** xoay 1,0–1,8 s, 0,55–2,15 vòng (phần lẻ trả về bằng lò xo văng đuôi), v × 0,3–0,6, văng ngang 2–7,5 m, nảy 1,2–4,8 m/s, nghiêng ±0,65 rad.
**Slow motion về đích:** `SLOW_T` 2,6 s thật, thời gian game ×0,2 (vào 0,3 s, ra 0,36 s cuối); nửa trái quay vòng quanh xe thắng (bán kính 9,5, từ chếch trước ra hông, nâng dần),
nửa phải đặt thấp sau cổng đích 11 m nhìn xe lao tới; FOV 40; khung đen điện ảnh trên/dưới; chữ "TEAM n WINS!" hiện SAU slow motion.
**Đã kiểm (browser pane):** cả trận tự chơi ~32 s về đích + slow motion 2 nửa thấy xe thắng · bệ phóng + 2 quả · bắn ⇒ quả bay từ giá · bảng iPad xác nhận + bấm THẬT OK ⇒ đổi chế độ 3, đóng ·
iPad (chế độ 3) giữ PHANH + nửa phải vô lăng LÚC CHỜ ⇒ game: nguồn iPAD, vô lăng quay phải, cung phải sáng, phanh lún · không lỗi console.
⬜ Thầy thử 3c trên Chrome + nhận xét cảm giác boost tích trữ, va chạm đẩy, slow motion, tên lửa mới.

---

## 14. ✅ MẪU 3d (15/10/2026) — bàn đạp bằng nhau · nút tên lửa giữa · lộn trục dọc khi nửa xe trên dốc · khói đen khi trúng
Thầy thử 3c rồi dặn: bỏ chữ BOOST/BRAKE để bàn đạp dài ra · 2 bàn đạp rộng bằng nhau, tay đòn bằng nhau · 2 bàn đạp sát vô lăng hơn (phanh đội 1 / ga đội 2 không sát nhau) ·
phần sáng vô lăng mờ 2 đầu · nút tên lửa ở giữa bảng đáp án, số tên lửa sát mép màn, chấm năng lượng tên lửa phía còn lại · nút tên lửa dài, 2 quả đứng song song ·
xe lên dốc một nửa ⇒ lộn 1 vòng quanh trục dọc (đầu–đuôi) rồi tiếp đất, hiệu ứng như bay qua dốc, KHÔNG xoay quanh như bị bắn · bị bắn trúng: xoay + chậm + khói đen mù mịt phía trước, không thấy đường một lúc.

Trang: `speed-run/mau-3d-lon-doc.html` + iPad `speed-run/pad-3d.html?t=0|1` (kênh `srpad3d`). 3c giữ nguyên. File: `core/sr3d-3d.js/.css` · `core/sr3d-dash-3d.js` · `core/sr3d-padui-3d.js` ·
`core/sr3d-padlink-3d.js` (= 3c) · `core/page-3d.js/.css`; dùng lại `sr3d-missile-3c.js`, `sr3d-fx-3c.js`.
**Bàn đạp:** cả 2 viewBox 76 × 150, mặt đạp rộng 68 BẰNG NHAU, tay đòn + giá giống hệt; ga cao 84 (viền kim loại, lớp boost), phanh cao 60 (viền đỏ). Không chữ ⇒ cao 96 % tap-lô.
Margin −1,1cqw ⇒ sát vô lăng (vô lăng nằm trên, che nhẹ mép trong); tap-lô chừa 2,4cqw ở mép giữa 2 nửa màn. iPad giống hệt (−2vmin, cao 58vmin).
**Vô lăng:** cung 1/4 tô bằng dải màu đội trong suốt → đặc → trong suốt dọc theo cung (gradient userSpaceOnUse) + nhoè 6 ⇒ 2 đầu mờ dần.
**Hàng dưới bảng đáp án:** tên lửa chờ (sát MÉP màn) | NÚT TÊN LỬA dài ở giữa (≤ 62 %) | chấm chuỗi đúng (phía trong); đội 2 đối xứng. Icon 2 quả đứng song song, cách nhau.
**Nửa xe trên dốc:** `rampContact()` đo phần BỀ NGANG xe nằm trên dốc (cov); cov < 0,85 ⇒ xe nghiêng (bánh bên dốc nâng: ar = side·atan(h/W)), cao h/2; rời mép ⇒ `takeOff(t, side)`:
vy × 0,7, lộn ép buộc (`forced`) quanh trục DỌC (ar) cùng chiều đang nghiêng, tốc độ tính để xong 1 vòng trước khi chạm đất (`rollW` 4–12 rad/s), phanh không cắt ngang được; đáp ⇒ tính
như stunt (PERFECT + boost). Máy quay nhảy/nhoè/vệt gió như bay thường. Đo: lên dốc lệch nửa ⇒ ar 0,72 → 6,28 sau ~1,0 s, ay = 0, "PERFECT! BARREL ROLL ×1 +BOOST".
Bàn thử: nút "Xe 1 lên dốc MỘT NỬA (lộn trục dọc)".
**Trúng tên lửa:** như 3c (xoay ngẫu nhiên + chậm) + điểm nổ dời 3 m trước mũi (không loá trắng buồng lái) + 70 hạt khói ĐEN to bung phía trước xe + lớp `.sr-smoke` (5 đám khói đen
nhoè phình ra) phủ kính nửa màn đội bị bắn ~2,3 s. Đo: trúng ⇒ 6 km/h, đang xoay 1,4 s, lớp khói bật. Bàn thử: "Bắn trúng xe 2 (khói đen)".
**Đã kiểm (browser pane):** lộn trục dọc (ảnh: xe lộn ngửa giữa không) · bố cục tap-lô mới · iPad chế độ đua: bàn đạp bằng nhau, nút 2 quả song song, cung trái sáng mờ 2 đầu · không lỗi console.
⬜ Thầy thử 3d. Lớp khói CSS chạy theo thời gian thật nên chưa xem được trong khung thử ẩn — cần xem trên Chrome.

---

## 15. ✅ MẪU 3e (15/10/2026) — nạp tên lửa từ kho · vệt sáng vô lăng mới · bàn đạp dài/hẹp · vô lăng chỉ nhận trong vòng tròn
Thầy dặn sau khi thử 3d: khói che lâu hơn · tên lửa bay chậm hơn · bàn đạp ga dài lên trên (thanh kim loại còn 1/3), phanh dài hơn · cả 2 hẹp lại (đang chạm khung đáp án) ·
khung đáp án hẹp lại, cách bàn đạp · bấm nút tên lửa ⇒ CHÍNH icon trong nút bay lên, icon chờ thụt xuống mép dưới khung, từ dưới bay 1 quả vào chỗ vừa trống (nạp từ kho) ·
vệt sáng tay vô lăng làm lại: mềm, viền mờ, rộng ≈ 2/3 độ dày vô lăng, bên xanh sáng xanh, bên cam sáng cam · chấm năng lượng tên lửa cân lại · chỉ nhận xoay vô lăng khi bấm
trong vòng tròn vô lăng (ra ngoài một chút), bấm quá xa không nhận.

Trang: `speed-run/mau-3e-nap-ten-lua.html` + iPad `speed-run/pad-3e.html?t=0|1` (kênh `srpad3e`). 3d giữ nguyên.
File: `core/sr3d-3e.js/.css` · `core/sr3d-dash-3e.js` · `core/sr3d-padui-3e.js` · `core/sr3d-padlink-3e.js` (= 3d) · `core/sr3d-missile-3e.js` (= 3c, MS.T 2,45 s, khoá 1,0 s) · `core/page-3e.js/.css`.
**⚠️ LỖI CŨ đã gỡ (có từ 3c):** 2 vô lăng trên cùng trang dùng CHUNG id gradient/filter SVG (`srwg…`) ⇒ `url(#id)` lấy cái ĐẦU TIÊN trong trang ⇒ vệt sáng vô lăng đội 2 ra màu XANH
của đội 1. Nay mỗi vô lăng đổi tiền tố id theo đội (`WHEEL_SVG.replace(/srwg/g, "srwg" + i)`). Bài học: SVG dựng nhiều bản trong 1 trang thì id defs phải riêng từng bản.
**Vệt sáng:** 3 lớp trên cung 1/4 vành: quầng rộng 24 nhoè 6 (38 %) + lõi 14,5 (≈ 2/3 vành 22) nhoè 1,8 + đường bóng 4,5 màu đội pha trắng; cả 3 tô dải mờ dần 2 đầu.
**Bàn đạp:** viewBox 60 × 150 (3d: 76), mặt đạp rộng 52; ga: thanh kim loại lộ ~16 (3d ~50), mặt đạp cao 116; phanh: mặt đạp cao 78. Khung đáp án cách cụm lái 2cqw.
**Nút tên lửa:** 2 ô `.sr-slot` (quả + lửa đuôi) song song. Bắn: ô cao nhất có quả bay vút lên (lửa đuôi bật) 0,52 s; nếu còn kho (≥ 3 quả trước khi bắn): icon chờ cuối THỤT xuống
(ô chờ cắt ở mép dưới khung đáp án) + quả mới TRỒI từ dưới nút lên đúng ô đó. Icon chờ = số quả ngoài 2 quả trong nút (≤ 4 + "+x"). Được thêm quả ⇒ ô trống trồi quả lên (nạp).
iPad (chế độ đua trên iPad) diễn y hệt. Đo: 3 quả ⇒ bắn ⇒ ô 2 "fly", 1 icon "sink", 0,8 s sau ô 2 lại có quả, kho 0.
**Vô lăng:** chỉ nhận bấm khi khoảng cách tới tâm ≤ bán kính × 1,12 (tính theo cỡ thật trên màn); kéo ra ngoài giữa chừng giữ nguyên hướng đang bấm. Đo bằng chạm THẬT: góc khung
vô lăng ngoài vòng tròn ⇒ không nhận; trong vòng ⇒ TOUCH.
**Khác:** khói đen 3,6 s (3d: 2,3) · chấm chuỗi đúng 1,5cqh cân giữa ô của nó.
⬜ Thầy thử 3e. Hiệu ứng CSS (bay/nạp tên lửa, khói) chạy theo thời gian thật — khung thử ẩn không chạy CSS animation, cần xem trên Chrome.

---

## 16. ✅ MẪU 3f (15/10/2026) — BỎ HẲN XOAY NGANG TRÊN KHÔNG
Thầy: "Xe khi phóng lên race ramp có hiện tượng xoay ngang trên không trung, tôi không thích cái này. Hãy tìm hiểu xem đó là tính năng hay lỗi."
**Kết luận: TÍNH NĂNG** (không phải lỗi), từ mẫu 3: (1) xe TỰ LÁI tự bấm phanh lúc bay ở 60 % số lần nhảy (`aiFlipT`) ⇒ Flat Spin — đo trên 3e: 13/18 lần nhảy xoay ngang;
(2) người lái bấm PHANH trên không (không lái) = Flat Spin quanh trục đứng (theo yêu cầu cầu nhảy 15/10); (3) ◀ ▶ trên không còn lượn hướng nhẹ (yaw 0,45 rad/s).
Người lái không bấm gì ⇒ không xoay (đo 0/3). Thầy chọn (AskUserQuestion): **bỏ hẳn xoay ngang**.
Trang: `speed-run/mau-3f-khong-xoay-ngang.html` — chỉ `core/sr3d-3f.js` + `core/page-3f.js` mới; CSS `sr3d-3e.css`/`page-3e.css`, iPad `pad-3e.html` (kênh `srpad3e`) dùng chung 3e
⇒ đừng mở 3e và 3f cùng lúc khi thử iPad.
Đổi: tự lái không tự xoay · PHANH trên không chỉ có tác dụng khi kèm LÁI ⇒ lộn trục dọc (Barrel Roll, giữ thì lộn tiếp), phanh không thì không xoay · ◀ ▶ trên không chỉ nghiêng thân.
Đo trên 3f: tự lái 0/19 lần nhảy xoay ngang · phanh không lái: yaw 0, PERFECT LANDING · phanh + lái: yaw 0, lộn dọc · chỉ lái: yaw 0 (nghiêng thân).

---

## 17. ⏳ THIẾT KẾ màn iPad "Đua trên iPad" — 4 mẫu chờ thầy chọn (15/10/2026)
Thầy: "Trên máy tạm được rồi, nhưng trên iPad chưa ổn vì 2 bàn đạp hơi to và sát vô lăng quá. Thiết kế cho tôi chọn mẫu trên iPad đã. Size 3–4 nhưng trừ phần thanh trạng thái phía trên của iPad."
Trang phác: `speed-run/thiet-ke-ipad-dua.html` (chưa sửa game). Mỗi khung = đúng cỡ iPad nằm ngang TRỪ thanh trạng thái (chọn máy: iPad 10/Air 11" 1180 × 820 mặc định, Pro 11", iPad 9,
mini, Pro 12,9"; ô thanh trạng thái mặc định 24 px ⇒ 1180 × 796). Nội dung bằng cqw/cqh của khung; `?v=A&full=1` mở 1 mẫu toàn màn để thử trên iPad thật. Hình vô lăng / bàn đạp /
tên lửa = `core/sr3d-dash-3e.js`. Bấm thử được (vô lăng chỉ trong vòng tròn +12 %, bàn đạp lún, tên lửa bay + nạp). Đường đo: vòng nhận bấm vô lăng + ô bàn đạp; dòng số đo px thật.
Số đo ở 1180 × 796:
- **A Gọn giữa** — vô lăng Ø 478, ga 146 × 366, phanh 127 × 318, cách vành 71 / 71 px.
- **B Bàn đạp sát 2 mép** (đúng chỗ 2 ngón cái) — vô lăng Ø 525, ga 172 × 430, phanh 146 × 366, cách vành 96 / 122 px.
- **C Vô lăng lớn, bàn đạp nhỏ ở 2 góc dưới** — vô lăng Ø 637, ga 115 × 287, phanh 96 × 239, cách vành 110 / 129 px.
- **D Lái trái — đạp phải** — vô lăng lệch trái Ø 557, cụm ga 159 × 398 + phanh 140 × 350 + tên lửa bên phải.
(3e hiện tại: vô lăng 66vmin, bàn đạp 62vmin cao, margin −2vmin ⇒ bàn đạp chồng lên vành.) ⬜ Thầy chọn ⇒ áp vào sr3d-padui (bản mới).

---

## 18. ✅ MẪU 3g (15/10/2026) — iPad bố cục B + vô lăng ĐÁY PHẲNG
Thầy xem thiet-ke-ipad-dua.html (mục 17): **chọn B** (bàn đạp sát 2 mép) + gửi ảnh vô lăng Thrustmaster T248: "đổi phần dưới vô lăng trên cả iPad và trên game theo phong cách
mép dưới phẳng như trong ví dụ".
Trang: `speed-run/mau-3g-vo-lang-day-phang.html` + iPad `speed-run/pad-3g.html?t=0|1` (kênh `srpad3g`). File mới: `core/sr3d-3g.js` (= 3f) · `core/sr3d-3g.css` (= 3e + khối 3g) ·
`core/sr3d-dash-3g.js` · `core/sr3d-padui-3g.js` · `core/page-3g.js/.css`; dùng lại padlink-3e, missile-3e, fx-3c.
**Vô lăng (dash-3g, chung game + iPad):** vành chữ D — mép trên tròn r 92, ĐÁY PHẲNG y 170; lỗ trong r 70 đáy phẳng y 146; 3 chấu (trái, phải viền bạc trên, dưới xuống đáy phẳng),
mặt hub bo góc viền bạc quanh màn hình km/h, 4 nút màu trên 2 chấu (xanh/đỏ trái, xanh lá/vàng phải), nút tròn màu đội ở chấu dưới; giữ vạch màu đội trên đỉnh + 2 vệt sáng 1/4.
Game: vô lăng 31cqh (3e: 34), bottom −4,2cqh ⇒ thấy trọn mép dưới phẳng. iPad: Ø 66vh, bottom −9,6vh.
**iPad bố cục B (padui-3g):** ga sát mép TRÁI (left 5vw, cao 54vh), phanh sát mép PHẢI (right 5vw, cao 46vh), vô lăng giữa, tên lửa 17vh góc trên phải (top 6vh), tên lửa chờ dưới nó.
Đã kiểm ở 1180 × 796 (iPad 10/Air 11" trừ thanh trạng thái): bố cục đúng, vô lăng đáy phẳng, chế độ đua trên iPad nối được.
⬜ Thầy thử trên iPad thật: link Pages https://andrewclasses-01.github.io/myGame/speed-run/pad-3g.html chỉ nối được với game cùng trình duyệt (kênh cục bộ) ⇒ iPad thật cần ghép AWord.

---

## 19. ✅ MẪU 3h (15/10/2026) — chữ ATEAM LED màu đội trên đáy vô lăng + góc đáy bo tròn
Thầy (sau 3g): "Ở viền dưới vô lăng (cả iPad, cả game) thêm một dòng ATEAM ở đoạn phẳng dưới vô lăng. Góc phẳng và cong ở điểm giao nhau cần bo cong hơn một chút. Thiết kế lại cho
tôi xem phần đó. Chữ ATEAM đẹp và ngầu, LED sáng theo màu đội." ⇒ bản phác `speed-run/thiet-ke-vo-lang-ateam.html` (4 kiểu: A LED đặc · B neon viền · C LED chấm · D chữ bạc + 2 vạch
LED; thanh kéo độ bo góc ngoài/trong) ⇒ thầy chọn **kiểu A, chữ bé hơn một chút**.
Trang: `speed-run/mau-3h-ateam.html` + iPad `speed-run/pad-3h.html?t=0|1` (kênh `srpad3h`). File mới: `core/sr3d-dash-3h.js` · `core/sr3d-3h.js` (= 3g) · `core/sr3d-padui-3h.js` (= 3g) ·
`core/page-3h.js`; CSS dùng `sr3d-3g.css` / `page-3g.css`.
**Vành:** `dRim(R, yf, f)` — cung lớn R + đoạn phẳng + cung bo f tiếp xúc cả hai (tâm bo cách tâm vô lăng R − f); ngoài R 92 / đáy 170 / bo 12, trong R 70 / đáy 146 / bo 8.
**ATEAM kiểu A:** rãnh tối bo tròn 68 × 14 khắc chìm trên đoạn phẳng; chữ Exo 2 nghiêng 900 cỡ 11 (bản phác 13), giãn 2,3, màu đội + quầng sáng (filter `srwgat`) + lớp lõi trắng nóng 75 %.
id filter có tiền tố `srwg` ⇒ lõi đổi id theo đội (đã kiểm: srwg0at / srwg1at) — tránh lại lỗi màu đội 2 (mục 15).
Đã kiểm: game 2 đội (ATEAM xanh / cam), iPad 1180 × 796 (ATEAM cam, góc bo).

---

## 20. 🚗 XE 3D THẬT (15/10/2026) — chọn mẫu + phòng trưng bày (CHƯA ghép vào game)
Thầy: "tạo lại xe thật đẹp, thật xịn, thật chi tiết với các mẫu xe đẹp và ngầu nhất thế giới". Thầy chọn: dùng MẪU 3D CÓ SẴN (không tự dựng bằng code); dòng xe: siêu xe Ý + hypercar + xe đua.
1. `speed-run/chon-xe-3d.html` — 27 xe Sketchfab tải được, giấy phép CC-BY (vài xe NC), bấm ảnh xoay 3D. Thầy chọn 14: Y1 Aventador SV · Y2 Revuelto · Y3 Centenario · Y4 SF90 XX ·
   Y5 LaFerrari · Y6 488 Pista Widebody · Y7 Huayra · Y8 Utopia · Y9 Zonda Cinque · H3 Bugatti Divo (CC-BY-NC) · H4 Koenigsegg Jesko · H7 McLaren Senna · H8 McLaren P1 GTR · H9 McLaren 720S.
2. Tải: thầy đăng nhập Sketchfab trên Chrome; lấy bản glb texture nhỏ nhất (≤1K). ⚠️ Sketchfab chặn "Too many requests" nếu hỏi liên tục ⇒ tải từng xe cách ~45 s. Bản gốc ở Desktop\MAU XE (163 MB).
3. Nén (gltf-transform: dedup + weld + simplify ≤150k tam giác + texture webp ≤1024 + meshopt): 163 MB → 33 MB, ở `speed-run/xe3d/<id>.glb` (0,3–5 MB/xe).
4. `core/sr3d-xe3d.js`: XE[] (tên, dài thật L, rotY, vật liệu sơn, tác giả, giấy phép) + `loadXe(id)` (chuẩn hóa: mũi −z, bánh y 0, dài L m) + `setPaint(xe, màu)`.
   Sơn: "Body" = bỏ texture sơn phẳng màu đội · "~Body" = giữ vân/chữ: texture chuyển TRẮNG ĐEN rồi nhân màu đội (P1 GTR sọc, Jesko, Centenario carbon, Zonda) · "Body*" = theo tiền tố.
   Hướng xe đã kiểm từng chiếc (nhìn ngang + cả dàn từ đầu xe): Y2 Y3 Y4 Y5 Y7 Y8 Y9 H3 H4 H7 H8 H9 xoay π.
5. `speed-run/phong-xe-3d.html` — GARAGE: sàn trưng bày, xoay tròn, nút Màu gốc / TEAM 1 / TEAM 2 / 2 đội cạnh nhau, "Chọn xe này" + Chép danh sách, ← → đổi xe; góc trên phải ghi công tác giả (CC-BY bắt buộc).
⬜ Chờ thầy chọn xe trong garage ⇒ ghép vào game (thay sr3d-car-1: bánh quay, nhún, đèn phanh, lửa pô…) = mẫu 3i.

---

## 21. ✅ MẪU 3i (15/10/2026) — 14 XE 3D THẬT trong game, mỗi đội tự chọn xe
Thầy: "Đưa cả 14 xe vào game, mỗi đội tự chọn xe trước khi đua."
Trang: `speed-run/mau-3i-xe-that.html` + iPad `speed-run/pad-3i.html?t=0|1` (kênh `srpad3i`). File mới: `core/sr3d-3i.js` (= 3h + xe thật) · `core/sr3d-car-3i.js` · `core/page-3i.js` · `core/sr3d-3i.css`;
`core/sr3d-xe3d.js` thêm `prepXe(id)` (tải trước) + `buildXe(id)` (dựng đồng bộ).
**Chọn xe:** màn chờ mỗi nửa có ô ◀ TÊN XE ▶ (bấm, hoặc A/D đội 1 · ←/→ đội 2). Máy quay màn chờ vốn quay quanh xe của đội ⇒ thấy xe đổi ngay. Nhớ lựa chọn (localStorage `speedrun.cars`);
trang tải trước 2 xe rồi mới dựng game (chữ LOADING CARS…); `?cars=Y2,H4` để ép. Mặc định Y2 Revuelto / H4 Jesko.
**sr3d-car-3i.js (makeCar3d)** giữ ĐÚNG giao diện makeCar cũ: rig → body (nhún, nghiêng) · M đo từ xe thật (dài, rộng, nóc = tia chiếu xuống giữa xe ⇒ bệ tên lửa đúng nóc) ·
bánh QUAY: nhận mảnh TRÒN ở 4 góc (lốp + mâm + đĩa; kẹp phanh đứng yên), không đủ thì theo TÊN mảnh ⇒ 10/14 xe quay bánh (Y3 Centenario, Y9 Zonda, H8 P1 GTR, H9 720S gộp bánh vào thân ⇒ bánh đứng) ·
đèn phanh = vật liệu tên tail/brake light… · lửa pô · bóng blob · mọi vật liệu qua bend (thế giới cong). Va chạm 2 xe dùng kích thước từng xe.
⚠️ Bẫy đã gặp: bánh trước Aventador nằm TRONG nút tên "Brake_Caliper" ⇒ loại trừ theo tên phải xét tên CHÍNH mảnh, không xét tên cha.
Centenario (Y3) đổi sang sơn phẳng màu đội (sơn giữ vân carbon ra gần đen, khó nhận đội).
Đã kiểm (bàn thử, chạy từng khung): màn chờ đổi đủ 14 xe · đua tự lái 1 trận: bay cầu nhảy, bắn trúng (xe thật xoay), về đích TEAM 1 WINS.
⬜ iPad chưa chọn xe được (chọn trên màn lớn) · tốc độ khung hình trên máy thật thầy xem ở Chrome.

---

## 22. ✅ MẪU 3j (15/10/2026) — buồng lái thật, biển ANDREW TEAM, MENU, cháy khi trúng tên lửa
Thầy (sau 3i), 9 việc ⇒ trang `speed-run/mau-3j-buong-lai-that.html` + iPad `pad-3j.html?t=0|1` (kênh `srpad3j`). File mới: `core/sr3d-3j.js` · `core/sr3d-car-3j.js` · `core/page-3j.js` · `core/sr3d-3j.css`.
1. **Mũi xe buồng lái = xe đang chọn**: `car.hoodView()` = bản sao xe CẮT bằng mặt phẳng ở chân kính chắn gió (clippingPlanes, `renderer.localClippingEnabled`) + tấm táp-lô tối;
   chân kính = điểm đầu tiên (từ mũi ra sau) tia chiếu xuống trúng vật liệu KÍNH. Mắt tài xế theo từng xe: cao hơn mép capô 0,15 m, sau chân kính 0,32 m.
   ⚠️ Màn chỉ thấy được ~25° dưới tầm mắt (dưới nữa là bảng điều khiển) ⇒ mắt cao thì capô siêu xe (dốc xuống rất nhanh) lọt hết xuống dưới bảng — đã thử 0,24 / 0,36 m đều chỉ thấy 1 sợi.
2. **Bấm tên xe ⇒ sổ danh sách** 14 xe (ITALIAN SUPERCARS / HYPERCARS), xe đang chọn có viền màu đội; ◀ ▶ + A/D, ←/→ vẫn dùng được.
3. **Biển ANDREW TEAM** trước + sau (nền trắng, dải màu đội có chữ AT): xe có biển gốc (Aventador, SF90, Divo, Senna) ⇒ ẩn biển gốc, đặt đúng chỗ; còn lại dò mặt cản phẳng đủ rộng (tia ngang ở 3 điểm ±0,2 m).
4. **Controls** không tự đóng (chỉ đóng khi bấm lại nút), bỏ nút Full screen.
5. **MENU** = bảng giữa màn như Rocket Race (AWord engine.js openMenu + rr3dMenuHost): RESUME (vàng) · START AGAIN · CHANGE CARS · CHANGE TEMPLATE; game ĐỨNG HÌNH khi mở; đóng bằng RESUME / bấm ☰ lại / bấm nền mờ / Esc.
6. **Tốc độ nền −30 %**: VBASE 22 → 15,4 m/s (≈ 55 km/h), VMIN 12 → 8,4.
7. **Đường dài + đa dạng**: mặc định 1 vòng / 6 đoạn (12 đoạn ⇒ 2 vòng × 480 m, trước 3 × 320 m); bản đồ 34 điểm (chữ S, 2 chỗ lượn, kẹp tóc thụt vào, chicane, cua kép).
8. **Tiếp đất chông chênh** (lắc nghiêng tắt dần, mạnh hơn sau barrel roll) + **VẾT LỐP** (InstancedMesh vòng đệm 900 đoạn; khi chạm đất, bị bắn xoay, phanh gấp > 58 km/h).
   ⚠️ đoạn vết lốp phải dài ĐÚNG khoảng cách (chồng mép ⇒ chỗ chồng đậm gấp đôi ⇒ sọc bậc thang).
9. **Trúng tên lửa ⇒ CHÁY** tại 1 điểm trên thân SƠN (tránh bánh) ~2,6 s (hạt lửa + khói đen bay ngược theo xe) ⇒ vết **CHÁY ĐEN loang lổ** (DecalGeometry dán lên chính mảnh thân) hiện dần, ở lại tới hết trận.
Sửa thêm: Y3 Centenario có mảnh lạ Object_12 cao 2 m làm xe lơ lửng ⇒ `XE[].hide` (ẩn trước khi đo khung bao).
⚠️ Bẫy: lõi chuyển xe sang lớp (layers) riêng của đội ⇒ Raycaster mặc định chỉ quét lớp 0 ⇒ phải `ray.layers.enableAll()`. Bẫy 2: chú thích `//` chèn GIỮA dòng nuốt luôn lệnh phía sau (danh sách mảnh rỗng) — node --check vẫn qua.
Đã kiểm (bàn thử chạy từng khung): mũi xe 6 xe · danh sách chọn Huayra · Controls mở nguyên khi bấm ra ngoài · MENU dừng game · bắn trúng ⇒ cháy + vết đen trên Jesko · tiếp đất lắc tắt dần · vết lốp.

---

## 23. ✅ MẪU 3k (15/10/2026) — hiệu ứng trả lời, boost chỉ khi đạp, bánh luôn lăn, lực văng khúc cua
Thầy (sau 3j), 7 việc ⇒ trang `speed-run/mau-3k-hieu-ung.html` + iPad `pad-3k.html?t=0|1` (kênh `srpad3k`). File mới: `core/sr3d-3k.js` · `core/sr3d-car-3k.js` · `core/page-3k.js` · `core/sr3d-3k.css`.
1. **Nút trả lời**: đúng + nhanh (≤ ~2,5 s) ⇒ nút BÙNG NỔ (chớp trắng-xanh, vòng sóng lan, 16 tia lửa, nút nảy); đúng thường ⇒ toả sáng 1 nhịp; SAI ⇒ 9 cụm KHÓI xịt quanh nút + nút rung,
   xe GIẬT LẮC + hơi MẤT LÁI (`slip`: văng ngang 1,7 m/s, lò xo xoay thân, lắc nghiêng, rung máy quay). Lớp `.sr-afx` chèn vào nút, tự gỡ sau 1,6 s.
2. **Đúng chỉ nạp vạch BOOST** — nguyên nhân "đúng là tăng tốc" ở 3j: xe TỰ LÁI tự đạp boost khi đủ 1,4 ô ⇒ 3k: tự lái KHÔNG đạp boost (trừ "Tự chơi" của bàn thử, G.auto).
   Đã đo: trả lời đúng ⇒ năng lượng 0 → 95 m (1,2 ô), tốc độ giữ 15,4 m/s.
3. **MENU ▸ START AGAIN** ⇒ về màn chờ START.
4. **Bánh luôn lăn**: góc bánh CỘNG DỒN theo quãng đường mỗi khung, tối đa 0,42 rad/khung (nhanh vẫn thấy lăn tới, hết "bánh đứng/quay ngược" do mâm 5 chấu trùng nhịp khung hình).
   4 xe gộp bánh (Centenario, Zonda, P1 GTR, 720S) ⇒ TÁCH tam giác bánh theo 4 góc (trung vị tâm tam giác, nhận trong 0,55 m) thành mảnh riêng, dùng chung bộ đỉnh,
   KHÔNG sửa hình gốc (các bản sao xe dùng chung) ⇒ 14/14 xe quay bánh; đo lệch tâm khi quay ≤ 1 cm.
   ⚠️ Đo khung bao mảnh đã tách phải theo CHỈ SỐ tam giác (Box3.setFromObject đọc toàn bộ đỉnh dùng chung ⇒ ra sai cả xe).
5. **Xe trước phanh gấp** (cách 2–24 m, cùng làn ±2,8 m) ⇒ xe sau slip 0,7 (cách nhau ≥ 2,4 s).
6. **Màn chờ: pô nổ** — mỗi 2,2–6 s xịt lửa 0,2 s (45 % nổ 2 phát) + khói + tia lửa; lửa pô đặt đúng miệng ống xả thật (dò mảnh/vật liệu exhaust…, không có ⇒ 2 miệng mặc định).
7. **Lực văng khúc cua** (`cx` = −độ cong bản đồ × tốc độ × DRIFT 3, kẹp 3,5 m/s): người cầm lái được trợ 20 %; tự lái bám làn nhẹ (hệ số 0,25)
   ⇒ đo 1 trận không ai lái (không cầu nhảy): lệch làn tối đa 1,26 m, trung bình 0,48 m. (Thử DRIFT 4,5 ⇒ lệch 6,5 m đâm mép đường — quá mạnh.)
⚠️ Bẫy: chèn khối code giữa `if {…}` và `else` của nó ⇒ lỗi cú pháp nhưng `node --check file.js` vẫn qua ⇒ kiểm bằng `node --input-type=module --check < file.js`.
⬜ Đổi sang Centenario mất ~5,5 s (lốp 97 nghìn tam giác) — thầy thấy chậm thì nén lại riêng xe này.

---

## 24. ✅ MẪU 3l (15/10/2026) — LỬA PÔ THẬT
Thầy: "Phần lửa xì ra từ xe trông giả quá, tôi muốn nó phải giống thật." (3k: 1 cái nón trơn cộng sáng, nhiễu sọc thô.)
Trang: `speed-run/mau-3l-lua-that.html` + iPad `pad-3l.html` (kênh `srpad3l`) + trang xem riêng **`speed-run/thu-lua-po.html?car=Y2`** (chọn xe, kéo Boost, nút Nổ pô, Tự nổ pô, đổi góc nhìn;
cùng ánh sáng/tone/bloom như game). File mới: `core/sr3d-car-3l.js` (lửa) · `core/sr3d-3l.js` (= 3k, chỉ đổi xe) · `core/page-3l.js` · `core/sr3d-3l.css` (= 3k).
**Cấu tạo lửa:** mỗi ống = 3 tấm cắt chéo quanh trục ống (thân lửa) + 1 ĐĨA quay ra sau (xe đối thủ nhìn từ sau thấy tấm dọc bị nhìn cạnh) + đèn cam chập chờn ở đuôi xe (hắt lên xe + mặt đường).
Shader: "nhiệt" = (1 − |lệch trục| / bề ngang lửa) − độ xa miệng ống + nhiễu fbm cuộn ⇒ chỉ chỗ nhiệt > ngưỡng mới cháy ⇒ lưỡi lửa rời, mép rách, đầu lửa tan thành sợi đỏ;
màu theo nhiệt đỏ sẫm → cam → vàng → trắng (chỉ lõi); chập chờn độ sáng mỗi khung + độ dài ±12 %; pô nổ (màn chờ) ngắn, phình, vàng; boost dài theo lực đạp, lõi xanh + vòng kim cương khi đạp mạnh.
⚠️ Bài học chỉnh: 3 tấm cộng sáng chồng nhau + bloom ⇒ cháy thành KHỐI TRẮNG nhạt — phải hạ hệ số sáng (×0,85 tấm, ×0,7 đĩa) và đẩy trắng lên ngưỡng nhiệt cao; đèn 7 ⇒ 3,2 (mặt đường loá).

---

## 25. ✅ MẪU 3m (15/10/2026) — ĐỔI TÊN GAME: RACING WORDS
Thầy: "ok được rồi nhé. Tôi muốn đổi tên game thành RACING WORDS" (chốt lửa pô 3l).
Trang: `speed-run/mau-3m-racing-words.html` + iPad `pad-3m.html?t=0|1` (kênh `srpad3m`). File mới: `core/sr3d-3m.js` (= 3l) · `core/page-3m.js` · `core/sr3d-padui-3m.js` (= padui-3h); CSS dùng 3l, xe dùng car-3l.
Đổi chữ hiển thị: tiêu đề lớn màn chờ, câu báo CHANGE TEMPLATE, màn iPad (chờ kết nối + chọn đội), tiêu đề tab, trang mục lục.
GIỮ NGUYÊN (không ai thấy, đổi sẽ gãy link/mất lựa chọn đã lưu): thư mục `speed-run/`, tên file `sr3d-*`, hàm `createSpeedRun`, khóa lưu `speedrun.*`, các mẫu cũ (vẫn ghi SPEED RUN).
Đã kiểm: chữ RACING WORDS rộng 917/1850 px ở màn chờ (vừa khung), iPad tiêu đề đổi.

---

## 26. 🎬 MẪU 3n (15/10/2026) — INTRO XƯỞNG ANDREW STUDIO (+ bộ máy âm thanh, chờ chọn tiếng)
Thầy: "tạo intro cinematic tương tự như ROCKET RACE" ⇒ chọn **kịch bản A · Xưởng ANDREW STUDIO**; âm thanh: "làm âm thanh cho intro và mọi hiệu ứng trong game, toàn bộ bằng âm thanh THẬT, điện ảnh, xịn, cả nhạc nền".
Trang: `speed-run/mau-3n-intro.html` + iPad `pad-3n.html` (kênh `srpad3n`). File mới: `core/sr3d-intro-3n.js` + `.css` (intro) · `core/sr3d-sound-3n.js` (âm thanh) · `core/sr3d-3n.js` (= 3m + `hold()` + onEvent "menu") · `core/page-3n.js`.
**Màn chờ = xưởng:** sàn bê tông mài bóng (phản chiếu bằng CubeCamera chụp lại khi đèn/cửa đổi), tường ốp kim loại, giàn thép, tủ đồ nghề đỏ, chồng lốp, ô đỗ màu đội "TEAM n",
biển ANDREW STUDIO / RACING WORDS tường sau; tối + 2 đèn rọi (có bóng đổ) + quầng sáng hình nón + bụi lơ lửng; pô thỉnh thoảng nổ; máy quay lượn chậm; ô chọn xe (◀ tên ▶ + danh sách) + START trên cảnh.
**START ⇒ ~11,75 s:** 0,25–1,45 đèn trần bật từng dãy (5 dãy LED + RectAreaLight ⇒ vệt sáng trên sơn) · 1,6 biển nháy rồi sáng · 2,25 cận ỐNG XẢ xe đội 1 nổ máy phụt lửa + thẻ tên ·
3,85 cận đầu xe đội 2 · 5,35–7,3 máy quay ngoài cửa, CỬA CUỐN (26 lá thép) kéo lên, nắng hoàng hôn tràn vào · 7,7 hai xe tăng tốc ra (9,5 m/s²) lửa pô, máy quay lia ngang ·
9,3 chữ RACING WORDS đập vào · 10,7 xe vút qua máy quay thấp · 11,5 CHỚP TRẮNG ⇒ onHandoff: ẩn intro, game.start() (máy quay vào buồng lái, 5 đèn, GO), lớp trắng mờ dần 0,6 s. Nút SKIP.
Viền đen điện ảnh khi chiếu. Đội 1 đỗ ở +x (máy quay màn chờ nhìn từ cửa vào ⇒ đội 1 nằm BÊN TRÁI khớp ô chọn). Đèn pha xe bật khi nổ máy (để 4 — mạnh hơn ⇒ 2 vệt chói trên sàn bóng).
Game ngừng vẽ khi intro hiện (2 khung WebGL không chạy cùng lúc); MENU ▸ CHANGE CARS / START AGAIN ⇒ xưởng hiện lại. Bàn thử: "▶ START (intro)" / "Bỏ intro, đua ngay".
**Âm thanh (sr3d-sound-3n.js):** Web Audio, 2 kênh Effect / Music (nút loa tắt cả 2, nhớ theo máy), tiếng lặp nối không khựng + trượt âm lượng, máy xe đổi cao độ theo tốc độ, lệch trái/phải theo nửa màn;
gắn sẵn mốc intro (đèn, nổ máy, pô, cửa, lăn bánh, chữ, vút qua) + trận (máy, gió, nhạc, 5 đèn, GO, boost, lốp rít, tên lửa, nổ, cháy, đúng/sai, tiếp đất, va chạm, thắng + khán giả, nhạc kết quả).
**✅ Âm thanh (15/10):** trang `chon-am-thanh.html` (29 loại × 3–5 bản thu thật Pixabay/Mixkit, 117 bản) ⇒ thầy: "Em tự chọn bản hay nhất mỗi loại giúp tôi, rồi tải về và gắn vào game luôn".
Em tải 117 bản vào thư mục tạm, đo độ to/độ dài/đoạn lặng + dò đường bao độ to theo 0,1 s để cắt đúng đoạn, chọn 29 bản, cắt + ghép lặp chéo + chuẩn độ to ⇒ `speed-run/sfx/*.mp3` (3,9 MB),
nguồn + tác giả + giấy phép từng file: `speed-run/sfx/NGUON AM THANH.md`; bộ xử lý: `tools/lam-am-thanh-racing-words.py`.
Nổi bật: nổ máy + máy chờ + máy khi đua = bản thu Lamborghini thật (máy khi đua = đoạn gầm đều, cao độ 0,85 + tốc độ/45 ⇒ chậm ~1,2×, boost ~1,9×) · xe đua thật vút qua ở Nürburgring
(phát lúc lăn bánh + 1,3 s ⇒ đỉnh tiếng đúng lúc xe lướt máy quay ~11 s) · cửa cuốn thép thật · lốp rít phanh tay thật · nhạc intro "Cinematic Intro" 15,5 s · nhạc đua "Racing Car Automotive Music" (Pixabay).
⚠️ Pixabay CDN không gửi CORS ⇒ Web Audio không đọc thẳng từ CDN được ⇒ phải tự host. mp3 có đệm câm 2 đầu ⇒ tiếng lặp đặt loopStart/loopEnd bỏ 30 ms mỗi mép.
⬜ Chưa có bản thu thật: máy siêu xe vòng tua đều (dùng đoạn máy chờ Lamborghini nâng cao độ), đèn sân vận động bật (dùng cầu dao), xe tiếp đất (trộn va nặng + nắp capô).

---

## 27. ✅ MẪU 3o (15/10/2026) — GÓI NHÚNG cho AWord (thầy "đưa lên AWord, sử dụng options của AWord" ⇒ chốt 4 Options · 13 xe bỏ Divo · iPad làm luôn ⇒ "ok build")
Trang thử: `speed-run/mau-3o-aword.html` (dựng bằng gói nhúng + cầu AWord GIẢ: bảng Options giả, danh sách act giả) + `pad-3o.html` (kênh `srpad3o`).
- `core/rw-3o.js` — **createRacingWords({ mount, questions, title, options, host, remote, onEvent }) ⇒ { setOptions, destroy }**: gom intro xưởng + trận + âm thanh + tải xe (việc của page-3n.js),
  không bàn thử, không window.__*, destroy() dỡ hết (bộ đếm giờ, listener, AudioContext, 2 khung WebGL). Khung `.rw-root` (rw-3o.css): game ≤ 2:1 giữa dọc + hàng nút 60 px.
- `core/sr3d-3o.js` (= 3n + chỗ nối AWord): Options ⇒ `host.options({layer, top, onClose})` (game dừng tới khi đóng) · `setOptions(o)`: cùng/khác câu hỏi + số tên lửa áp ngay,
  đường/vòng/cầu nhảy đổi ⇒ false (AWord dựng lại) · có host ⇒ không đọc/ghi speedrun.opts, iPad mặc định Off không nhớ · Thư mục = act cùng thư mục · MENU ▸ CHANGE TEMPLATE = template + LIBRARY · gỡ phím Esc.
- `core/sr3d-xe3d-3o.js` 13 xe (BỎ H3 Bugatti Divo — CC-BY-NC) · `sr3d-car-3o.js` · `sr3d-intro-3o.js/.css` (dòng ghi công mẫu 3D dưới ô chọn xe + destroy trả card đồ hoạ) · `sr3d-sound-3o.js` (close()).
Đã kiểm: Options mở + dừng/chạy lại · setOptions áp ngay / báo dựng lại · destroy không sót canvas / lỗi.

---

## 28. ✅ MẪU 3p (15/10/2026) — MƯỢT + CHẠM ĐÚP BỎ INTRO (thầy: "double tab vào intro để vào màn chuẩn bị start luôn" · "khá lag, tham khảo cách tối ưu của Train Rush")
Trang thử: `speed-run/mau-3p-muot.html` (= mau-3o-aword.html, nạp `core/rw-3p.js`). File mới: `rw-3p.js` · `sr3d-3p.js` · `sr3d-car-3p.js` · `sr3d-intro-3p.js` · `sr3d-carmeta-3p.js`
(xe3d / âm thanh / CSS / iPad giữ bản 3o / 3m).

**Đo 3o (Chrome thật qua CDP, RTX 4060, cửa sổ 1920×1080, `long-animation-frame` + đếm rAF + đếm lệnh vẽ `renderer.info`):**
- Bấm START ⇒ **ĐỨNG HÌNH 4,3 s rồi 5,3 s** (shader 4 ⇒ 78 dịch ngay khung đầu của trận) = "dừng ở 5 đèn đỏ" thầy thấy (cùng với lỗi AWord Đợt 528).
- Giữa trận khựng ~200 ms mỗi lần tên lửa / nổ / vết cháy đầu tiên (vật liệu mới, dispose xong lần sau dịch lại).
- **1.092 lệnh vẽ/khung, 1,23 triệu tam giác**: xe Sketchfab 20–1.107 mảnh lưới (Y4 1.107 · Y5 976 · H7 934), frustumCulled tắt (thế giới cong), thêm BẢN SAO mũi xe ở buồng lái.
  **Nghẽn CPU**: 9,2 ms/khung chỉ để gửi lệnh vẽ — hạ độ nét 0,8 ⇒ 0,5 gần như không đổi ⇒ bộ tự chỉnh (sr3d-autores) chỉ làm MỜ hình (đã xuống 0,8 + tắt MSAA).
- Kính **transmission** (Y4 Y5 Y6 H4 H7): có 1 vật liệu là three.js VẼ LẠI CẢ CẢNH vào ảnh nền cho mỗi camera mỗi khung (1 mảnh kính H4 kéo 192 lệnh vẽ).
- **Dựng 1 xe (makeCar3d) 0,2–3,6 s**, ~97 % là raycast (~20 ms/tia × 150–300 tia: nóc, chân kính, mép capô, chỗ biển số); mỗi xe dựng 2 lần (xưởng + trận) ⇒ "LOADING CARS rất lâu".
- burn() (vết cháy khi trúng) 6–110 ms giữa trận (tia + DecalGeometry).

**Sửa (cách Train Rush 1am / Star Loot 2p + riêng game này):**
1. `sr3d-car-3p.js` **mergeStatic**: gộp mảnh TĨNH cùng (vật liệu + bộ thuộc tính) thành 1 mảnh (đổi thuộc tính nén meshopt về Float32, ma trận lật ⇒ đảo chiều tam giác),
   cả bản sao mũi xe. Bánh đã ở trục quay riêng ⇒ không gộp (13/13 xe vẫn 4 bánh quay). Cây gốc (ghost) giữ ngoài cảnh, gắn TẠM khi tìm chỗ cháy. Y4 1.107 ⇒ 79 mảnh.
2. **noTransmission**: kính transmission ⇒ trong suốt thường (mờ 0,3–0,45). Ảnh xưởng cùng góc 3o/3p sai khác trung bình 0,6/255.
3. **Số đo xe sẵn** `sr3d-carmeta-3p.js` (13 xe) + nhớ trong phiên ⇒ dựng xe 6–211 ms. Xe mới: tự đo 1 lần; sinh lại bảng = `carMeta()` (xem đầu file bảng).
4. **Cắt mũi xe bằng shader** (`hoodClip`: uniform mặt phẳng + discard, khoá "|hoodclip") thay `material.clippingPlanes` — `renderer.compile()` BỎ QUA clippingPlanes ⇒
   biến thể cắt chỉ dịch được khi vẽ thật. Ảnh buồng lái 3o/3p giống nhau.
5. `sr3d-3p.js` **prewarm()** (gọi ngay khi dựng game, thầy còn ở xưởng): mẫu tên lửa + nổ + vết cháy ⇒ `compileAsync` 2 lần — lớp camera ngoài xe (3 đèn điểm) và buồng lái
   (2 đèn: đèn lửa pô mỗi xe ở lớp đội ⇒ SỐ ĐÈN camera thấy nằm trong khoá shader) — ⚠️ với đích vẽ = `composer.renderTarget1` (không thì khoá lệch tone mapping / hệ màu
   ⇒ dịch phí, đúng bẫy Train Rush ghi) · vật liệu hậu kỳ (trừ OutputPass) · texture đẩy lên card từng cái (nghỉ khi quá 12 ms) · 1 khung ẩn · `pinPrograms()` mỗi 30 khung.
   START / chạm đúp chờ prewarm xong (tối đa 4 s; thường đã xong từ lâu). Đổi xe ⇒ dịch lại.
6. **Chỗ cháy làm sẵn** (`prepBurns`, 3 chỗ/xe, từng chỗ một cách 40 ms): lúc prewarm + lúc hiện bảng kết quả ⇒ trúng tên lửa không dò tia.
7. `rw-3p.js` **CHẠM ĐÚP** lúc phim intro chiếu (2 lần ≤ 350 ms, lệch ≤ 40 px, không tính nút) ⇒ `intro.skip()` ⇒ vào thẳng 5 đèn. Khoá nhớ độ nét bộ tự chỉnh đổi `rw-3p`.

**Đo 3p (cùng máy, cùng cách):** START ⇒ đèn: không khựng (dài nhất 24 ms) · đua 85–144 khung/giây ở độ nét 1,0 + MSAA (3o: 46–65, 0,8, không MSAA) · ~430 lệnh vẽ (~380 với Y4+H7),
CPU 4,9–5,3 ms/khung · cả ván 0 khung > 70 ms trừ 1 lần làm sẵn vết cháy ở bảng kết quả (cố ý) · prewarm 2,2–3,7 s ngầm (lần ĐẦU TIÊN trên máy: Chrome dịch lạnh ⇒ tới 34 s,
các lần sau Chrome lấy shader đã lưu) · dựng xe 6–211 ms. Trong AWord (`scratch/dot529-rw.html`, engine thật): chạm đúp vào trận, 99–130 khung/giây, 0 khung > 70 ms.
⚠️ Cú khựng ~200 ms còn lại chỉ khi bộ tự chỉnh NÂNG độ nét (cấp lại khung đệm MSAA + 5 tầng bloom) — sau khi đã nhớ mức êm thì hết.
⬜ Chưa đo trên TOMKO (Quadro T2000, 4K, myActivity `__awMaxPR = 1`).

---

## 29. ✅ MẪU 3q (15/10/2026) — FIGHT KIỂU ROCKET RACE · CẢNH XA ĐÚNG VẬT LÝ · 35 km/h · CẦU NHẢY CHẬM
Trang thử: `speed-run/mau-3q-fight.html` (bảng Options giả có đủ mục mới). File mới: `rw-3q.js` · `sr3d-3q.js` · `sr3d-car-3q.js` · `sr3d-intro-3q.js` · `sr3d-world-3q.js` ·
`sr3d-missile-3q.js` · `rw-3q.css` (xe3d / âm thanh / số đo xe / iPad giữ bản cũ).

**Thầy (sau khi chơi 3p):** (1) "núi và cảnh phía xa thay đổi rất bất hợp lý … chóng mặt, cần đúng quy tắc vật lý" · (2) "tốc độ mặc định khi không boost ~35 km/h;
dưới 40 km/h phóng lên ramp thì không đổi góc quay, xe cứ lao qua như đường thường, tiếp đất rung lắc nhiều một chút" · (3) Options gần như Fight Rocket Race:
Lives (vạch năng lượng mảnh ở góc lái, cạnh mép màn mỗi bên; sai −1, trúng tên lửa −1) · Missile damages · Time delay · Miss wait · Missile streak · Missiles ⇒ Missiles max ·
(4) game là FIGHT ⇒ mặc định Fight ở màn chọn, tạm tắt Single. Chốt qua câu hỏi: Same = THEO LƯỢT · hết mạng = xe nổ, đội kia thắng · Missile damages = mức 1–5.

**1. Cảnh xa:** công thức cong cũ `x += b·d²` ở MỌI khoảng cách ⇒ núi 1.000 m lệch ~1.800 m mỗi lần độ cong đổi (góc nhìn tới núi đổi tới ~60°). Nay `bendQ`:
cong thật trong 150 m (đúng tầm đọc khúc cua 30–150 m của `bendFor`), xa hơn theo TIẾP TUYẾN (lệch tuyến tính) ⇒ cảnh xa chỉ XOAY một góc atan(2·b·150) — đúng như xe quay
đầu thật. Áp đồng bộ 5 chỗ: shader `world` (đất, biển, mọi vật liệu `bend`), `missile` (hạt, lửa, cột sáng), lửa pô `car`, nhãn HUD (JS `bendQ`), và BẦU TRỜI (vốn bám camera,
không cong ⇒ nay xoay hướng nhìn bằng `uRot` = nghịch đảo góc lệch của cảnh xa ⇒ mặt trời, mây, chân trời đi cùng núi). Độ cong vào dần theo GIÂY THẬT
(cũ lerp 0,08 MỖI KHUNG ⇒ màn 165 Hz xoay nhanh gấp 2,7 lần màn 60 Hz). Ảnh cùng chỗ cong gắt nhất (m 210): 3p đồi trái quét chiếm nửa màn, 3q cảnh xa đứng đúng chỗ.

**2. Tốc độ + cầu nhảy:** `VBASE` 15,4 ⇒ 9,72 m/s (55 ⇒ 35 km/h), `VMIN` 6,5, bù xe sau +12 ⇒ +5 m/s. Dưới 40 km/h (`LOW_V`) tới mép dốc ⇒ `lowDrop`: không lực
phóng, không +20 % tốc độ, không camera bay (`jk` giữ 0), không lộn vòng; chạm đất `shake` 0,95 (đáp thường 0,45). Đo: 35 km/h ⇒ leo dốc, rơi từ 1,7 m, jk 0,
rung 0,86 lúc chạm · 124 km/h (boost) ⇒ bay như cũ (jk 1).

**3. Fight:** Same = THEO LƯỢT (`startRound` / `roundAnswered` / `roundTick`): 2 đội cùng câu cùng lúc; đội ĐÚNG trước ⇒ đội kia còn `tieWait` (Time delay, mặc định 0,1 =
khoá ngay như Fight AWord; ∞ = chờ); đội SAI trước ⇒ đội kia còn `missWait` (Miss wait, mặc định 20 s); thanh đếm ngược `.rw-wait` dưới ô câu hỏi đội đang được chờ; xong cả
hai / hết giờ ⇒ cả 2 sang câu mới. Different giữ nhịp riêng. LIVES (`lives`, 0 = tắt): vạch `.rw-lives` dọc cột kính mép ngoài (đội 1 trái, đội 2 phải), mỗi bậc 1 mạng, còn 1
⇒ đỏ nhấp nháy; sai −1, trúng tên lửa −1 (sượt qua không trừ); hết ⇒ `knockOut`: nổ + cháy + khói, đội kia thắng (`finish`). MISSILE DAMAGES `msDmg` 1–5: xoay
min(L, 0,6 + 0,4·L) s + đứng yên phần còn lại tới ≈ L s (`stallT`, không nhận lái), khói đen che kính 0,8 + 0,75·L s (mức 2 ≈ bản cũ). Missile streak `streak` 1–10 (số chấm
HUD tự theo), Missiles max `msMax` 0–10 (0 = không tên lửa). `setOptions`: đổi số mạng / đổi Same↔Different giữa trận ⇒ dựng lại; các mục khác áp ngay.
Kiểm (CDP): cùng câu 2 đội · Time delay 0,1 khoá đội chậm ⇒ câu mới · đội sai ⇒ thanh chờ hiện bên kia · lives 5 ⇒ trả lời sai tới 0 ⇒ phase end, winner đội kia ·
ván tự động 112–146 khung/giây, 0 lỗi.

---

## 30. ✅ MẪU 3r (16/10/2026) — MƯỢT TUYỆT ĐỐI TRÊN TOMKO (thầy: "đo từng khung hình với bộ từ thật … tối ưu độ mượt là nhiệm vụ tối thượng; chấp nhận bỏ khử răng cưa, nén xe, giảm đồ hoạ")
Trang thử: `speed-run/mau-3r-muot.html`. File mới: `rw-3r.js` · `sr3d-3r.js` · `sr3d-intro-3r.js` · `sr3d-car-3r.js` · `sr3d-world-3r.js` · `sr3d-missile-3r.js` ·
`sr3d-autores-3r.js` · `rw-3r.css` (xe3d / âm thanh / số đo xe / iPad / fx giữ bản cũ).

**Cách đo (TOMKO = HP Z2 Mini G5, Quadro T2000 4 GB, Xeon W-1250, 32 GB, màn 3840×2160 DPR 1,25; card 84 °C, bị SW thermal slowdown):** myActivity mở lại với
`--remote-debugging-port`; act thật **572 "1. CAU BI DONG 1 WORDS"** (50 câu, Fight · Same · Track 20 · Laps 6 · Missiles max 10 · Streak 1) chép từ trang live (bọc
`racingWordsTemplate.mount` lấy act đã chuyển WORDS ⇒ câu hỏi) ⇒ bàn thử chạy ĐÚNG template AWord + engine trong bảng 1 của myActivity (server cục bộ, thư mục
racing-words thay được bằng bản nháp). Đầu đo: nhịp rAF từng khung, long-animation-frame (kèm hàm gây), program mới (`renderer.info.programs`), mức độ nét, timer query
GPU từng pass (EXT_disjoint_timer_query_webgl2), CPU profiler CDP, nvidia-smi 0,5 s. Kịch bản: xưởng 12 s → START → phim → 5 đèn → đua tự động cả ván (trả lời, tên lửa,
nổ, cầu nhảy, boost) → kết quả; tình huống nặng: đổi xe Y4 + H7 ở xưởng → đua → PLAY AGAIN.
⚠️ CDP `Fetch.fulfillRequest` trong myActivity làm TREO trang (xung đột `webRequest` của app) — đừng dùng; dùng server cục bộ + act chép ra file.

**Đo 3q (trước):** xưởng 37,5 fps · PHIM 17,9 fps (khung 67–150 ms, cú đầu 317 ms) · 5 đèn 48 · đua 58,6 (17 lần dịch shader giữa trận, độ nét nhấp nhả 9 lần,
MSAA bật lại giữa trận ~200 ms) · đổi xe Y4 / H7 đứng hình 4,9 s + 4,1 s.

**Nguyên nhân + sửa:**
1. **Intro xưởng** (GPU RenderPass 32 ms ở độ nét 1,0): 5 RectAreaLight 22 ms (tính cả lúc tắt!) ⇒ 1 tấm gộp 18 × 3 m sáng dần theo số dãy LED · 2 đèn pha SpotLight
   8,6 ms ⇒ bỏ · sàn clearcoat 2,5 ms ⇒ MeshStandard · canvas MSAA vô ích ⇒ bỏ · độ nét bỏ qua `__awMaxPR` (vẽ 3858×1823) ⇒ trần chung + tự chỉnh (khoá `rw-3r-intro`,
   chỉ học ở màn chờ, chỉ chạy sau khi trận dịch sẵn shader xong — `intro.arGo/arWait`) · bóng đổ `autoUpdate = false`, vẽ lại khi vật di chuyển (dựng xe, cửa cuốn,
   xe lao ra) · chụp môi trường tối đa 4 lần/giây và chỉ ẩn MẢNH xe (giữ đèn ⇒ cùng khoá shader) · `warmIntro()` làm nóng phim lúc nạp / đổi xe · PHIM có ngân sách
   điểm ảnh ~2,3 triệu (TOMKO ⇒ 0,7; 1080p không chạm) · chữ lớn RACING WORDS: keyframes bỏ `filter: blur` + bóng chữ nhẹ (cũ tụt 30 fps suốt 1,5 s).
2. **Dịch shader giữa trận**: (a) tên lửa tạo/huỷ ShaderMaterial cột sáng mỗi phát ⇒ three xoá shader stage ⇒ mã stage mới ⇒ dịch lại MỖI phát ⇒ `beamPool` dùng lại;
   (b) prewarm dispose vật liệu mẫu (vết cháy, tên lửa) TRƯỚC khi `pinPrograms()` ⇒ ghim trước khi dọn; (c) đèn trong xe ở lớp đội ⇒ mỗi máy quay thấy số đèn khác
   ⇒ 2–3 bản shader / vật liệu ⇒ đèn trong xe `layers.enableAll()` (program trận 115 ⇒ 65).
3. **Trận**: MSAA tắt hẳn (không nấc MSAA) · tự chỉnh độ nét thử nâng sau ~20 s êm (cũ ~7 s) · thứ tự vẽ: đường/xe/cây trước, đất – biển – trời sau (early-z bỏ
   shader nhiễu bị che) · pass nhoè hướng tâm tắt khi không nhoè.
4. **HUD (CSS, A/B cùng độ nét 1,0: 51,7–58,7 ⇒ 59,9 fps)**: vô lăng xoay mỗi khung kèm drop-shadow + filter SVG ⇒ bỏ filter, `will-change: transform`, không
   transition · bàn đạp / nút FIRE / bản đồ bỏ filter, FIRE hết nhấp nháy box-shadow · xưởng: ô chọn xe bỏ backdrop-filter, START hết nhấp nháy · ô câu hỏi đúng/sai:
   quầng là lớp `::after` chỉ đổi opacity (cũ animate box-shadow).
5. **Nén xe** (`slimMat`): bỏ normal / bump / AO / light map, roughness-metalness map ⇒ trung bình kênh G/B của chính ảnh, bỏ clearcoat/sheen ⇒ ít biến thể shader
   (Y4 + H7: +33 ⇒ +15 program), đổi xe đứng 4,9 s ⇒ 0,7 s. Vết cháy: chỗ đã dùng giữ lại, hết kho thì dùng lại ⇒ không dò tia giữa trận.
7. **LỖI 3q (bản live Đợt 531)**: `updateHUD` — `const dist = PJ.distanceTo(cam.position); PJ.project(cam);` bị nuốt vào chú thích ⇒ xe kia cách ~60–120 m
   trong khung nhìn ⇒ ReferenceError MỖI khung, ném ra trước `composer.render()` ⇒ khung KHÔNG được vẽ (đo: 49–83 khung / ván; đầu đo rAF không thấy — phải đếm
   lần `composer.render` thật + bắt `error`). Đã trả lại thành mã.
6. Gói nhúng: vào trận chờ lần dịch sẵn HIỆN HÀNH (`game.prewarm()`) — cũ chờ lần đầu, đổi xe rồi bấm START có thể khựng ở 5 đèn.

**Đo cuối (đếm khung VẼ THẬT, cùng máy, cùng act, cùng kịch bản):** 3q live: xưởng 28,7 · phim 17 · 5 đèn 45 · đua 58,3 (+49 khung lỗi không vẽ, 19 lần dịch
shader) ⇒ **3r: xưởng 60,1 · phim 59,3 · 5 đèn 60,0 · đua 59,7 · kết quả 59,8 · 0 lỗi · 0 dịch shader giữa trận**.
Lần đo trước đó (đếm rAF): xưởng **59,5–60** · phim **60,0 (0 khung trễ)** · 5 đèn **60,0** · đua **59,6** ở độ nét 1,0 (0 lần dịch shader, không
khung nào > 50 ms cả ván) · kết quả 59,9. Xe nặng Y4 + H7: đổi xe 0,7 s, phim 60,0, đua 59,9 (không khung > 33 ms), chơi lại 59,3.
⚠️ Cửa sổ myActivity bị thu nhỏ ⇒ trình duyệt ngừng rAF (trang hidden) — đo lại khi cửa sổ hiện.

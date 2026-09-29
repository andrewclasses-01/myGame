# BALLOON POP 3D — hồ sơ nghiên cứu gameplay (29/9/2026)

Mục tiêu: dựng lại **Balloon pop** của Wordwall thành game **3D** trong kho myGame (cạnh Rocket Race),
thử trên TOMKO/iPad rồi mới ghép vào AWord. Template 2D cũ trong AWord (`templates/balloon-pop/`) thầy
**KHÔNG phát triển tiếp** — chỉ dùng làm tài liệu tham khảo (dữ liệu, âm thanh, Options).

Nguồn đã soi:
- Wordwall https://wordwall.net/resource/116864480 (theme Wild West) — chơi thật 2 ván trong trình duyệt,
  đọc tuỳ chọn + danh sách hình/âm thanh game tải về.
- AWord act `dg9hyp` "A_29/9.07:11_LSA2-S4.T4.P1-2-3-4-5 / WORDS/BALLOON" — đọc dữ liệu + tuỳ chọn (không vào chơi,
  để khỏi sinh điểm giả).
- Mã `E:\LAP TRINH APP\AWord\web\templates\balloon-pop\balloon-pop.js` + `GHI CHU BALLOON-POP.md`.

---

## 1. Game gốc Wordwall chơi thế nào (quan sát thật)

**Một câu:** khinh khí cầu (zeppelin bạc) chở TỪ trôi ngang trên trời; dưới đất đoàn tàu chở các toa mang
ĐỊNH NGHĨA; bấm nổ khinh khí cầu ⇒ thùng hàng mang từ **rơi thẳng xuống** ⇒ phải canh để thùng rơi **trúng
đúng toa** có định nghĩa khớp.

### Diễn biến một ván
1. Màn bắt đầu: tên act + nút START + câu "Pop the balloons to drop each keyword onto its matching definition."
2. Biển gỗ **"Level 1"** trượt vào giữa màn; đoàn tàu chạy vào từ bên trái (đầu máy mang số level trên nóc).
3. **Số toa = số level**: Level 1 = 1 toa, Level 2 = 2 toa, Level 3 = 3 toa … Mỗi toa một định nghĩa (chữ trắng
   trên bảng màu). Đầu máy đổi màu mỗi level (đỏ → xanh dương → xanh lá).
4. Khinh khí cầu trôi **phải → trái**, ở ~3 độ cao khác nhau, **được phép chồng lên nhau** (chữ bên trên đè
   chữ bên dưới). Từ trên khinh khí cầu = từ đúng của các toa đang có + **từ nhiễu** (lấy từ mục khác, ví dụ
   THROW của level trước xuất hiện lại ở level 3). Ở level 1 thấy chỉ 2 loại từ: đúng + 1 nhiễu, lặp nhiều lần.
5. Bấm khinh khí cầu: chữ **"POP"** hồng nổ ra, khinh khí cầu biến mất, **thùng gỗ mang từ rơi thẳng đứng**
   (có trọng lực, không bay về toa).
   - Rơi trúng **toa đúng** ⇒ thùng nằm lại trên nóc toa, **+5 điểm**, ✓.
   - Rơi trúng **toa sai / toa đã có thùng** ⇒ **✗ đỏ**, thùng rơi mất, **không trừ điểm**.
   - Rơi xuống đất (không có toa bên dưới) ⇒ mất, không gì cả.
   - Tàu **chạy chậm** qua màn trong lúc chơi (có lúc dừng) ⇒ kỹ năng chính là **canh thời điểm**.
6. Đủ thùng trên mọi toa ⇒ trời xoá sạch khinh khí cầu, **đồng hồ dừng**, tàu chở thùng chạy ra phải;
   **máy bay kéo băng rôn "Score 95"** bay ngang (tổng kết); cộng **điểm thưởng qua màn** (lớn: 5 → 57 sau level 1,
   có vẻ theo thời gian còn lại) và **cộng thêm giờ**; sang level kế.
7. **Bóng thưởng** (bóng tròn vàng, lẫn giữa các khinh khí cầu): `$` = cộng điểm, đồng hồ cát = cộng giờ,
   ×2 = nhân đôi điểm. Bấm là ăn ngay, không cần rơi trúng toa.
8. Hết giờ ⇒ bảng **TIME'S UP**: Score · "You're 1st on the leaderboard" · Leaderboard · **Show answers** ·
   Start again · Play a different template. Hoàn thành hết level trước khi hết giờ ⇒ màn thắng.
9. **Show answers**: lưới tất cả cặp — thùng (từ) đặt trên toa (định nghĩa).

### Giao diện trong ván
- Trái trên: đồng hồ đếm ngược **một đồng hồ cho cả ván** (1:00). Giữa trên: thanh tiến độ. Phải trên: ✓ điểm.
- Trái dưới: nút ☰ menu; phải dưới: loa + toàn màn hình.

### Tuỳ chọn của act (API `getoptions`)
`{"timer":60,"lives":0,"speed":1,"levels":10,"extratime":true,"points":true,"doublescore":true,"review":true}`
⇒ 60 giây, tốc độ 1 (chậm nhất), 10 level, bật cả 3 loại bóng thưởng, cho xem đáp án.

### Bộ hình/âm thanh game tải (chỉ để hiểu cấu trúc cảnh — KHÔNG chép ảnh)
Cảnh: nền trời, núi (2 lớp), mặt đất, xương rồng ×3, khói, đường ray. Tàu: đầu máy ×3 màu, bánh xe, toa ×3,
**hành khách ×3**, toa than. Trời: khinh khí cầu (blimp), thùng dưới blimp (blimpcrate), mảnh nổ (blimppop),
chữ POW, bóng thưởng points/time/double, biển gỗ + băng rôn, máy bay + khói máy bay. Phản hồi: ✓ ✗ (có sprite động).
Âm thanh (theme western): planeflyby, trainbell, trainchug, traintime (sắp hết giờ), traintoot, ting1/ting2,
reveal, gamesuccessful/unsuccessful, leaderboards, restart, timesup.
→ 27 file mp3 đã tải sẵn từ đợt làm 2D: `D:\APP AND DATA\AWord-data\Source\Sound effect\BALOON POP\`.

---

## 2. Bản AWord 2D cũ — vì sao "chạy không đúng ý"

### Khác luật so với Wordwall (lỗi thiết kế)
| Điểm | Wordwall | AWord 2D cũ |
|---|---|---|
| Số định nghĩa cùng lúc | Level N = **N toa** cùng lúc | Luôn **1** định nghĩa |
| Cách thùng rơi | **Rơi thẳng**, phải canh trúng toa | **Bay tự động về toa** — bấm đúng là ăn, không cần canh |
| Tàu | Chạy chậm qua màn, rời đi khi đủ | Đứng yên, chỉ "giật" nhẹ khi qua level |
| Sai | ✗, không trừ điểm | Thùng vỡ (có option trừ điểm) |
| Điểm | +5/đúng + thưởng qua màn theo giờ + bóng thưởng | +1/đúng |
| Tổng kết màn | Máy bay kéo băng "Score N" | Không có |
| Đồng hồ | Dừng khi chuyển màn, cộng giờ khi qua màn | Chạy liên tục |

### Lỗi cụ thể của act `dg9hyp` (55 cặp từ)
- Act **không lưu** `bpLevels` / `bpTimerSeconds` / `bpSpeed` ⇒ lấy mặc định: **chơi cả 55 level trong 60 giây**
  (không thể xong — ván nào cũng "Time's up").
- Options lại có `timer:"countUp"` + `timerTotalSeconds:120` của engine ⇒ **hai đồng hồ cùng hiện**
  (một đếm lên, một đếm ngược 60 s) — đúng lỗi "POLISH #2" ghi từ 8/2026 mà chưa sửa.
- `contentMode:"voice"` nhưng không mục nào có file giọng ⇒ chế độ giọng không có tác dụng.
- Khinh khí cầu dồn 3 làn sát nhau (10/22/34 % chiều cao) ⇒ chồng chữ, khó đọc trên TOMKO.
- Định nghĩa dài (vd "To make someone feel sad because a result was worse than they hoped") — bản cũ co chữ
  trong 1 toa; nếu làm nhiều toa như Wordwall thì **chữ trên toa sẽ rất nhỏ** ⇒ phải tính cỡ toa/khung hình.

---

## 3. Dữ liệu dùng lại được
- Mô hình dữ liệu giữ nguyên: `content.items = [{ keyword, definition, voice?, hideText? }]` (min 5 / max 100) —
  để act cũ mở được ngay trong game mới (đổi template không phải soạn lại).
- Options nên có: thời gian ván, tốc độ, số level, 3 loại bóng thưởng, show answers (+ trừ điểm khi sai: tuỳ thầy).
- Bài học kỹ thuật từ bản 2D + Rocket Race: một vòng lặp rAF theo delta (Menu pause không mất giờ — `onPause`),
  bấm bằng `press()` (chạm là nổ ngay), mọi `setTimeout` có cờ `dead`, chữ người dùng phải escape.

---

## 4b. THẦY ĐÃ CHỐT (29/9/2026)
1. Thả thùng **giống Wordwall**: rơi thẳng, phải canh trúng toa.
2. Số toa **tăng dần như Wordwall** (màn N = N toa).
3. Góc máy: **làm mẫu CẢ 2 loại** (nhìn ngang có chiều sâu + chéo từ trên xuống). Mẫu làm và chạy **ở máy này
   (local)**, chưa đưa lên mạng; thầy thử ngay trên máy.
4. Làm trước chế độ **cả lớp chơi 1 màn hình**. Fight sau, nhưng **phải nghiên cứu ngay** cách để 2 đội cùng chơi,
   **2 tàu ở 2 bên** (mục 5).

## 5. Nghiên cứu chế độ FIGHT — 2 tàu 2 bên

Khung FIGHT thật của AWord (đã đo 25/9): dải điểm 69 px ở trên + **2 bàn 620×408 đặt cạnh nhau** (trái / phải,
cách 16 px), mỗi bàn có thanh nút riêng. Trên TOMKO hai em đứng hai bên màn hình ⇒ chia **trái / phải** là tự nhiên
(giống Rocket Race).

**Đề xuất bố cục:** mỗi bàn là một cảnh 3D riêng (một đoàn tàu + bầu trời riêng); vẽ chung một WebGL, chia 2 khung
nhìn (như Rocket Race). Bầu trời **không dùng chung**: nếu dùng chung, hai em sẽ tranh bấm cùng một quả, và thùng
có thể rơi nhầm sang tàu đội kia ⇒ rối, dễ cãi nhau.

**Vấn đề lớn: số toa tăng dần trong bàn hẹp 620 px.** Màn 5 có 5 toa thì mỗi toa chỉ còn ~120 px, định nghĩa dài
không đọc nổi. **Cách giải (dùng cho CẢ chế độ 1 màn hình):** toa có **bề rộng cố định, đủ to để đọc**; đoàn tàu
**dài hơn màn hình và chạy liên tục** — các toa lần lượt đi qua dưới khinh khí cầu rồi vòng lại. Như vậy màn cao chỉ
làm tàu dài hơn, không làm chữ nhỏ đi, và việc "canh lúc thả" càng có ý nghĩa.

**Công bằng giữa 2 đội:**
- Hai đội cùng bộ định nghĩa, cùng thứ tự màn; khinh khí cầu sinh theo cùng một hạt giống ngẫu nhiên ⇒ hai bên
  gặp cùng loại thử thách. Mỗi đội tự lên màn theo tốc độ của mình.
- Bấm hai bên cùng lúc: mỗi bàn xử lý chạm riêng theo từng ngón (`pointerId`) — Rocket Race đã làm được trên TOMKO.
- Thắng: hết giờ, đội nhiều điểm hơn thắng (hoặc đội qua hết màn trước). Có thể thêm "cướp": bóng thưởng đặc biệt
  làm tàu đội kia chạy nhanh hơn vài giây — để thầy quyết sau.

**Điểm cần thử trên TOMKO khi làm Fight:** chữ trên khinh khí cầu và toa có đọc được ở bàn 620×408 không;
tốc độ tàu hai bên; hai em chạm cùng lúc có bị nuốt chạm không.

## 4. Những câu hỏi thầy cần chốt trước khi thiết kế 3D (đã trả lời — xem 4b)
1. **Luật thả thùng**: giữ đúng Wordwall (rơi thẳng, phải canh trúng toa — khó, vui) hay "bấm đúng là ăn"
   (dễ, như bản cũ) hay có tuỳ chọn cả hai?
2. **Số toa mỗi level**: tăng dần 1→2→3… như Wordwall? Tối đa mấy toa (định nghĩa dài ⇒ đề xuất tối đa 3)?
3. **Góc máy 3D**: nhìn ngang kiểu Wordwall nhưng có chiều sâu (tàu chạy trên ray, khinh khí cầu trôi ở nhiều
   lớp xa–gần) hay góc máy chéo từ trên xuống?
4. **Chế độ**: một người/cả lớp chơi trên TOMKO trước, hay cần ngay chế độ **Fight 2 đội** (2 đoàn tàu) như Rocket Race?
5. **Khung cảnh**: giữ Wild West (sa mạc, xương rồng, tàu hơi nước) hay đổi chủ đề?

## 6. Hai mẫu đã dựng (29/9/2026, chạy local)
`index.html` chọn mẫu · `mau-1-nhin-ngang.html` · `mau-2-cheo-tren.html` — cùng lõi `core/bp3d.js`, chỉ khác góc máy.
- Luật: màn N = N toa (tối đa 10 màn); thùng rơi thẳng theo trọng lực, chạm nóc toa mới xét; đúng +5 (×2 khi có
  bóng ×2), sai ✗ không trừ; thùng rơi xuống đất thì mất. Đủ toa ⇒ khinh khí cầu bay lên, tàu tăng tốc chạy đi,
  máy bay kéo băng "Score N", cộng điểm = số giây còn lại + thêm 5 giây, sang màn sau.
- Toa rộng cố định 6,2 đơn vị (chữ không nhỏ đi khi nhiều toa); tàu dài hơn màn thì chạy vòng lại từ trái.
- Bóng thưởng: +10s (xanh), $ +10 điểm (vàng), ×2 cho 3 thùng đúng tiếp (tím).
- Options (màn bắt đầu): Timer (mặc định 2:00), Levels 1–10, Balloon speed 1–5, Train speed 1–5, Extra time,
  Points, Double score, Drop guide (vạch + vòng trắng chỉ chỗ thùng rơi — mặc định BẬT ở mẫu 2, TẮT ở mẫu 1).
- Hết giờ: TIME'S UP / hết màn: GAME COMPLETE · Score · Show answers (từng toa: từ, định nghĩa, ✓/✗) · Start again.
- ☰ Menu tạm dừng (đồng hồ + mọi thứ đứng) · loa · toàn màn hình.

## 7. Mẫu 1b điện ảnh (29/9/2026) — thầy chọn góc NHÌN NGANG
Thầy: "đồ hoạ quá xấu, cần chất lượng cao, chân thực, điện ảnh · tàu to quá, cần nhỏ lại · nền là dãy núi xa xa,
sa mạc miền viễn tây, bầu trời đẹp lung linh". ⇒ `mau-1b-dien-anh.html` (lõi `core/bp3d-1b.js` + cảnh `core/west-world.js`);
mẫu 1 và 2 giữ nguyên để so sánh. Luật chơi không đổi.

## 8. Mẫu 1c (29/9/2026)
Thầy (kèm ảnh sa mạc thật): cần đường ray · mặt đất chi tiết với bụi cỏ, xương rồng như thật · cỏ + thỉnh thoảng xương rồng tiền cảnh · logo ANDREW STUDIO trên đầu tàu · đầu tàu tới 75% màn thì máy quay lia theo, cảnh chuyển động như thật, thùng rơi có vật lý (quán tính, va chạm, văng ở tốc độ cao).
⇒ `mau-1c-lia-theo-tau.html` (lõi `core/bp3d-1c.js` + cảnh `core/west-world-1c.js`). Tàu dài hơn màn: máy quay ưu tiên giữ toa CHƯA đầy ngoài cùng bên trái ở ~25% màn.

## 9. Mẫu 1d (29/9/2026)
14 ý thầy: tàu nhanh chậm tự nhiên · bỏ ✓/✗ (chỉ +điểm, −điểm khi Points off) · bỏ vật văng ra khi thùng rơi (khoang lái) · từ quay vòng tới hết giờ (Levels → Max cars) · xương rồng tai thỏ + saguaro làm lại, saguaro xa cao hơn · chữ Hollywood ANDREW CLASSES / NO HOMEWORK - NO FUN lần lượt trên đồi xa · toa khách có bóng người sau rèm (nói chuyện, giật mình, ngước nhìn trần) · thùng đúng trượt dừng hẳn mới tính, quá mép thì rơi · máy bay bay ngược chiều · ANDREW STUDIO chỉ ở đầu máy, toa than hoa văn · cỏ + đá chi tiết · lạc đà chạy ra xem tàu · đàn chim + đại bàng rượt.
⇒ `mau-1d-song-dong.html` (lõi `core/bp3d-1d.js`, cảnh `core/west-world-1d.js` + `core/west-props-1d.js`, toa khách `core/coach-1d.js`).

## 10. Mẫu 1e (29/9/2026)
9 ý thầy: va chạm khi đúng chỉ 1/10 · toa trống tối đa ở giữa màn, toa sau giữ ngoài mép ⇒ xen 2 toa phụ giữa các toa đáp án + máy quay giữ toa trống đầu ở giữa · chữ nền nhỏ lại, cột chống chỉ nửa dưới và khuất sau chữ · con vật chi tiết hơn, chỉ trên đồi xa · đàn chim liền mạch · bỏ ✓ ở điểm · người trong toa chi tiết (ngón tay) · thêm nhiều toa có người · toa than: thùng + than văng, trừ điểm (max(2, Points off)).
⇒ `mau-1e-toa-phu.html` (lõi `core/bp3d-1e.js`, cảnh `core/west-world-1e.js` + `core/west-props-1e.js` + `core/animals-1e.js`, toa `core/coach-1e.js`).

## 11. Mẫu 1f (29/9/2026) — vật lý vật rắn thật
7 ý thầy: khinh khí cầu bay vào từ ngoài màn (không hiện giữa màn) · thùng đúng chạm toa chỉ trượt + lắc rất nhẹ, không ảnh hưởng tốc độ tàu · người trong toa luôn thành cặp đối diện nói chuyện, mỗi người hoảng một kiểu, thêm phụ nữ + trẻ em · máy bay đẹp hơn, chỗ nối dây–băng thật, băng phần phật · thêm sư tử, lợn, gà, bò, voi; gò đồi chi tiết thật, không che chữ; con vật chạy từ sau gò lên đỉnh, ngắm, lắc lư rồi quay đầu chạy khuất · thùng gỗ cứng không méo · một toa chứa nhiều thùng, rơi trước/sau/chồng/nghiêng theo vật lý thật.
⇒ `mau-1f-vat-ly.html` (lõi `core/bp3d-1f.js` dùng **cannon-es 0.20** qua jsDelivr; cảnh `core/west-world-1f.js` + `core/west-props-1f.js` + `core/animals-1f.js`; toa `core/coach-1f.js`).
- Cả đoàn tàu = 1 vật động học ghép nhiều khối (mỗi khối biết thuộc toa nào); bước vật lý 1/120 s, đặt tàu ở vị trí ĐẦU khung rồi cho chạy đúng quãng của khung ⇒ thùng và toa không lệch pha.
- Thùng đúng nằm yên hẳn 0,3 s trên toa của nó ⇒ +điểm và gắn chặt thành một khối của tàu (thùng khác vẫn va vào). Thùng SAI chạm toa ⇒ văng khỏi toa như Wordwall (nhãn ửng đỏ, trừ Points off) — thầy chốt 29/9. Thùng trùng từ đúng rơi vào toa đã có thì vẫn nằm lại (chồng/nghiêng).
- Bẫy: sự kiện `collide` của cannon-es dùng lại MỘT đối tượng ⇒ phải chép `body/shape/vận tốc va chạm` ngay trong hàm nghe, không giữ đối tượng sự kiện.

## 12. Mẫu 1g (29/9/2026)
6 ý thầy: cổ người liền đầu–thân + bóng mờ nhoè · thùng đúng chạm toa rung lắc, xê dịch thêm · thùng tì một phần vào toa đúng vẫn tính điểm · rơi vào toa khách nằm lại trên nóc (không tính điểm) · chồng thùng cao bị khinh khí cầu húc đổ, thùng đúng đã tính điểm rơi xuống đất thì trừ lại điểm toa đó · bỏ ô điểm (đồng hồ sang chỗ đó), điểm chỉ bay lên + hiện trên băng máy bay.
⇒ `mau-1g-huc-do.html` (lõi `core/bp3d-1g.js`, toa `core/coach-1g.js`, HUD `core/bp3d-1g.css`; cảnh dùng lại bản 1f).
- Thùng đúng KHÔNG còn gắn chặt vào toa (vẫn là vật động để bị húc). Tính điểm khi nằm yên 0,3 s và đang CHẠM khối toa đúng (đọc danh sách tiếp xúc của cannon mỗi bước) hoặc tâm nằm trên toa đúng. Rơi xuống đất (y < 2,2) hoặc rời toa > 0,6 s ⇒ trừ lại, toa mở lại, máy quay quay về toa đó (bỏ luật “máy quay không lùi”).
- Khinh khí cầu = vật động học 4 quả cầu, nhóm va chạm riêng: chỉ va thùng ĐÃ nằm trên tàu (thùng đang rơi xuyên qua, không bị gạt lệch).
- Rèm toa khách = MeshPhysicalMaterial transmission 1, roughness 0,48 ⇒ bóng mờ thật; tốn thêm 1 lượt vẽ (≈ 104 fps, trước 123).

## 13. Mẫu 1h (29/9/2026)
3 ý thầy: vào game máy quay chuyển tới toa đầu quá đột ngột · đồng hồ trái + thanh thời gian phải, thiết kế theo theme · hàng nút ra ngoài như Rocket Race, bỏ fullscreen.
⇒ `mau-1h-hang-nut.html` (lõi `core/bp3d-1h.js`, HUD `core/bp3d-1h.css`, font Rye; toa `coach-1g.js`, cảnh 1f).
- Vào ga: vận tốc giảm ĐỀU từ V0 về đúng `cruiseV()` trong 3,4 s, toa đáp án đầu dừng đúng tâm; máy quay đứng yên suốt lúc vào ga.
- Máy quay = lò xo giảm chấn tới hạn (K 2,2) có bám vận tốc tàu. Lại luật 1e: toa chờ còn bên trái ⇒ máy quay ĐỨNG CHỜ; chỉ lia NGƯỢC khi một toa trước bị mở lại (1g bỏ luật này nên máy quay lùi 15 đv mỗi lần thả đúng — đã sửa).
- Thanh trên giờ là THANH THỜI GIAN (giờ còn lại / giờ nhiều nhất từng có), ≤ 10 s chuyển đỏ; tiến độ toa không còn hiện ở đây.
- Hàng nút 80 px ngoài màn chơi: Menu · Sound | Switch activity · Options · Leaderboard · Mode (icon chép từ AWord core/icons.js qua Maze Chase 1g); 3 bảng Switch/Leaderboard/Mode là dữ liệu mẫu; mở bảng giữa ván thì tạm dừng.

## 14. Mẫu 1i (29/9/2026)
5 ý thầy: thùng đúng nảy + xê dịch thật hơn · tàu/máy bay bớt nhựa (bẩn, bụi, gồ ghề, xước) + saguaro sần sùi mỗi cây một khác · người hoảng lâu hơn + chạy lung tung khi thùng rơi liên tiếp · con vật húc đổ chữ Hollywood · Options theo kiểu AWord.
⇒ `mau-1i-cu-bui.html` (lõi `core/bp3d-1i.js` + `core/bp3d-1i.css`, làm cũ `core/grime-1i.js`, toa `core/coach-1i.js`, cảnh `core/west-world-1i.js` + `core/west-props-1i.js` + `core/animals-1i.js`).
- Thùng: rơi ra hơi nghiêng dọc toa, gỗ nảy (restitution 0,3); SẮP chạm nóc thì hãm dần đà ngang ngược chiều tàu (quán tính khinh khí cầu −1,5 vs tàu +2,6 ⇒ trước đây lật văng); nằm trên toa thì giữ ở giữa bề ngang (nóc hẹp, dễ bập bênh). Đo vận tốc thả THẬT: 11/12 lần nảy 0,05–0,5, trượt ≤ 0,4 rồi nằm yên.
- ⚠️ Các phép thử trước 1i dùng vx = vận tốc tàu (không có đà ngược) ⇒ không lộ lỗi lật văng. Thử vật lý phải dùng đúng vận tốc thả trong game.
- Làm cũ: 3 kết cấu canvas dùng chung (bẩn màu / nhám / bump), `weather(train)` + `weather(plane)`; clearcoat ≈ 0, kim loại bớt bóng, đồng thau xỉn. Saguaro: ống 40×80 đỉnh, phình/thắt + cong + u sần theo pháp tuyến + gốc gỗ + sẹo + mắt gai, `mergeVertices` để pháp tuyến mượt; khúc cảnh quay vòng thì mọc cây mới. ≈ 77 fps (1h 104).
- Con vật húc chữ: 25–55 s/lần, bò/voi/ngựa/lạc đà/sư tử phóng to 2,2–2,8 lần, từ sau đỉnh đồi chữ lao xuống, chữ đổ về phía trước theo mô-men trọng lực + nảy + bụi; chữ nằm đổ tới khi bảng được thay.
- Options: Timer None / Count up / Count down (+ ô giờ) · MAX CARS · BALLOON SPEED · TRAIN SPEED · POINTS OFF 0–100 (thang AWord) · Shuffle questions · Show answers at end · Bonus extra time/points/x2 · Drop guide · Apply ⇒ về màn bắt đầu.

## 15. Mẫu 1j (29/9/2026)
Thầy chốt (AskUserQuestion): Max cars giữ tên, thanh kéo 3–20 + nấc cuối ∞ · Points off thanh LUÔN đỏ, 0–10 · Count down hết từ trước giờ ⇒ kết thúc, hiện điểm + thời gian · Menu thêm End game (xem đáp án) · bảng kết quả theo phong cách game.
⇒ `mau-1j-het-tu.html` (lõi `core/bp3d-1j.js` + `.css`; cảnh `west-world-1j.js` + `west-props-1j.js` + `animals-1j.js`; toa 1i; làm cũ 1i).
- Mỗi từ (khoá duy nhất) chơi 1 lần; `beginLevel` không còn từ ⇒ `endGame("done")`. `endGame(why)`: time / done / ended; `S.elapsed` đếm cả intro+play+clear.
- Tốc độ 1–10: blimpV = 0,6 + 0,25·s (mặc định 4 ⇒ 1,6), cruiseV = (1,0 + 0,35·s)·… (4 ⇒ 2,4). Khinh khí cầu đi theo máy quay (b.x −= (bv − camV)·dt) ⇒ tốc độ TRÊN MÀN không đổi.
- Thùng rơi vx = camV − bv − 2,2 (văng chéo). Chạm nóc toa: đà ngang còn lại kẹp ±1,3, quay kẹp ±2,6 (thùng nghiêng rơi từ 7 đv chạm bằng góc từng văng ngang 6–7 đv/s ⇒ trượt khỏi toa). Đo vận tốc thật: 11/12 và 12/12 nằm yên.
- Thùng đúng thứ 2, 3… trên cùng toa: mỗi thùng +5 khi nằm yên; mất một thùng chỉ mở lại toa khi không còn thùng đúng nào khác.
- Cỏ: thêm loại "fine", lá 1–3 px, toả hình quạt; vật liệu alphaToCoverage + làm sắc alpha theo mức mip (không nhoè thành tấm); cỏ cao sát ray thấp lại ×0,5; khe cát z −27…−33 không cỏ cao ⇒ đường cho cặp con vật đuổi nhau (mặt đất ở đó gần phẳng).
- ⚠️ Thử 2 thùng thả cùng lúc sát nhau (cách < 2,15 đv = bề dài thùng) ⇒ chúng va nhau giữa trời: lỗi PHÉP THỬ, không phải lỗi game.

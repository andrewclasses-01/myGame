# tools/do-game-3d — bộ đo game 3D trong myActivity (CDP cổng 9333)

Cách dùng + bẫy: `../../HUONG DAN TOI UU GAME 3D.md` (mục 2). Viết cho Racing Words 3r (16/10/2026); đổi đường template / tên biến (`__sr`, `__rwI`) cho game khác.

| File | Việc |
|---|---|
| `cdp.mjs <url-chứa> <file.js \| -e "biểu thức"> [ms]` | chạy JS trong trang myActivity (chờ Promise, trả JSON) |
| `raw.mjs` · `listen.mjs` | gửi lệnh CDP thô · in lỗi / console trong lúc chạy một đoạn JS |
| `prof.mjs <url> "<js kích hoạt>" <ms>` | CPU profiler quanh 1 thao tác (top self / total) |
| `capact.js` | trên trang LIVE: chép act đã chuyển đổi ra `window.__rwAct` (bấm READY sau khi chạy) |
| `serve.mjs [port]` + `root.txt` + `bench.html?act=act.json` | AWord cục bộ, template lấy từ thư mục trong root.txt, chèn `window.__sr` / `__rwI` |
| `probe.js` · `report.js` | đầu đo từng khung (rAF, composer.render thật, lỗi, LoAF, program, độ nét) · báo cáo theo mốc |
| `gputime.js` | `__gpuT(composer, renderer, ms)` = GPU ms từng pass |
| `scen.js` · `scen2.js` · `runfull.sh <root> <out>` | kịch bản cả ván · kịch bản nặng (đổi xe, chơi lại) · chạy trọn 1 lần đo |
| `ab.js` · `filmexp.js` · `filmcss.js` · `introexp*.js` | A/B khoá độ nét: CSS HUD · độ nét phim · CSS phim · đèn / bóng / sàn intro |
| `liveplay.js` | chơi thật trên web live bằng DOM (cần `window.__liveAct` = đáp án act) |
| `chep-stage.py` | công cụ chép AWord, đích `stage/` (bản nháp để đo trước khi chép thật) |
| `ed.py FILE < sửa.json` | thay chuỗi giữ CRLF, mỗi chuỗi phải khớp đúng 1 lần |
| `gpuwin.py` | ghép kết quả A/B với log nvidia-smi |

Không commit dữ liệu đo / act (`.gitignore`): `*.json`, `stage/`, `base/`, `root.txt`, log.

// (5h, 19/10/2026) Ghi file game tải từ lúc mount tới khi dịch sẵn xong (thay scratch/dot543-rec.html khi máy không có trang đó).
// Chạy SAU khi tải lại bench (no-store ⇒ không có bộ nhớ đệm). Trả {t, rec:[{u, i}]} đúng dạng tools/tao-load-files.py của AWord.
// ⚠️ Bàn thử không nạp app AWord ⇒ thiếu core/*.js của app: ghép từ load-files.js cũ (engine không đổi) trước khi chạy tao-load-files.
(async () => {
  const sr = () => window.__sr;
  for (let k = 0; k < 240 && !(sr() && sr().warm); k++) await new Promise(r => setTimeout(r, 500));
  await new Promise(r => setTimeout(r, 1500));
  const E = performance.getEntriesByType('resource');
  const rec = E.map(e => ({ u: new URL(e.name).pathname, i: e.initiatorType }));
  return JSON.stringify({ t: 'racing-words', n: E.length, full: E.length >= 250, rec });
})()

// Chạy trên trang AWord LIVE (đã đăng nhập) TRƯỚC khi bấm READY: bọc mount của template để chép act ĐÃ CHUYỂN ĐỔI (WORDS ⇒ câu hỏi) vào window.__rwAct.
// node cdp.mjs aword.andrewclasses capact.js  → bấm thẻ game + READY → node cdp.mjs aword.andrewclasses -e "JSON.stringify(window.__rwAct)" > act.json
(async () => {
  const m = await import('/templates/racing-words/racing-words.js');   // đổi đường template cho game khác
  const t = m.default;
  if (!t.__wrapped) { const o = t.mount; t.mount = function (root, act, ui) { try { window.__rwAct = JSON.parse(JSON.stringify(act)); } catch (e) { window.__rwAct = { err: String(e) }; } return o.apply(this, arguments); }; t.__wrapped = 1; }
  return 'wrapped';
})()

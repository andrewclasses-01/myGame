// Vỏ trang cho mỗi bản mẫu: dựng cảnh + BẢNG THỬ (góc trên phải, thu gọn được).
import { createRace } from "./rr3d-core.js";

export async function boot(cfg) {
  const stage = document.getElementById("stage");
  const loading = document.getElementById("loading");
  const panel = document.getElementById("panel");
  const fpsEl = panel.querySelector(".fps");
  let race;
  try {
    race = await createRace({ ...cfg, container: stage, onFps: f => { fpsEl.textContent = f + " fps"; } });
  } catch (e) {
    loading.textContent = "Lỗi dựng cảnh 3D: " + e.message;
    console.error(e);
    return;
  }
  loading.remove();

  panel.querySelector(".toggle").onclick = () => panel.classList.toggle("is-open");
  panel.querySelectorAll("[data-act]").forEach(b => b.onclick = () => {
    const [act, a1] = b.dataset.act.split(":");
    if (act === "ok") race.sim(+a1, true);
    else if (act === "bad") race.sim(+a1, false);
    else if (act === "turbo") race.turbo(+a1);
    else if (act === "boom") race.explode(+a1);
    else if (act === "again") race.restart();
    else if (act === "auto") { b.classList.toggle("is-on"); race.auto(b.classList.contains("is-on")); }
    else if (act === "fs") { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
  });
  panel.querySelector("select").onchange = e => race.setQuality(e.target.value);
  window.__race = race;
}

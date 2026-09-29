// Phụ kiện cảnh — bản 1r (29/9/2026): 5 kiểu đồi chữ để duyệt (HILL_STYLES, ?nui=0..4); còn lại như 1q.
// Phụ kiện cảnh — bản 1q (29/9/2026): như 1l + showBoth()/dropExtra() (màn chờ hiện cả 2 bảng chữ), đàn chim ra sớm.
// Phụ kiện cảnh — bản 1l (29/9/2026): cây cỏ nhỏ trên đồi/gò xa NHỎ + THƯA + CHI TIẾT (búi cỏ lá kim, hoa dại, bụi cành thưa);
// bụi tiền cảnh vẽ lại kiểu cành thưa lá nhỏ (shrubTexture).
// Phụ kiện cảnh viễn tây — bản 1k (29/9/2026): đồi chữ MỀM lại (vòm + sóng đất thoải) phủ cỏ thật (farGrassKit: búi cỏ
// mảnh + bụi sa mạc, mọc thành vạt); cỏ BÔNG LAU (reedTexture) cho tiền/hậu cảnh.
// Phụ kiện cảnh viễn tây — bản 1j (29/9/2026): đồi đỡ chữ Hollywood làm lại NHỌN, gồ ghề, lởm chởm (nhiễu gờ sắc nhiều lớp),
// có đốm cây cỏ xanh lác đác; cỏ mảnh + nhiều lá hơn (loại mới "fine" — cỏ cao mảnh).
// Bản 1i: saguaro sần sùi, mỗi cây một khác (phình/thắt, cong, gốc hoá gỗ, sẹo, mắt gai);
// chữ Hollywood có thể bị con vật HÚC ĐỔ từng chữ (knock) — chữ đổ về phía trước, nảy nhẹ, bụi tung.
// Bản 1f: chữ Hollywood đặt CAO hơn 3,5 (đồi đỡ chữ cao theo) để con vật trên gò phía trước không che chữ.
// Bản 1e: chữ Hollywood nhỏ lại + cột chống chỉ nửa dưới, khuất sau chữ; đàn chim bay liền mạch.
// Lịch sử 1d:
// • cỏ thẻ cong nhiều loại (cỏ khô cao có bông, cỏ vàng xanh, cỏ lún phún) · đá sa thạch chi tiết (lưới mịn, vân lớp, khe tối)
// • xương rồng tai thỏ (opuntia) mọc NỐI NHAU từ gốc · saguaro cao, gân sâu, ngọn tròn
// • chữ kiểu HOLLYWOOD trên đồi xa ("ANDREW CLASSES", "NO HOMEWORK - NO FUN") lần lượt từng bảng
// • lạc đà thỉnh thoảng chạy ra xem đoàn tàu rồi chạy đi · đàn chim đuổi nhau, đôi khi có đại bàng rượt
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { makeBunchKit, GRASS_STYLES } from "./bunchgrass-1n.js";

export function mulberry(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function makeNoise(seed) {
  const r = mulberry(seed), perm = new Uint8Array(512), p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const g = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const dot = (h, x, y) => { const v = g[h & 7]; return v[0] * x + v[1] * y; };
  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, xf = x - Math.floor(x), yf = y - Math.floor(y), u = fade(xf), v = fade(yf);
    const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1], ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
    const x1 = dot(aa, xf, yf) + u * (dot(ba, xf - 1, yf) - dot(aa, xf, yf));
    const x2 = dot(ab, xf, yf - 1) + u * (dot(bb, xf - 1, yf - 1) - dot(ab, xf, yf - 1));
    return x1 + v * (x2 - x1);
  };
}
// pháp tuyến bằng 0 (tam giác suy biến: chữ 3D, cực mặt cầu bị ép dẹt) ⇒ GPU normalize(0) = NaN ⇒ bloom loang ĐEN CẢ MÀN.
// Thay mọi pháp tuyến hỏng bằng (0,1,0).
export function fixNormals(geo) {
  const n = geo.attributes.normal; if (!n) return geo;
  for (let i = 0; i < n.count; i++) { const x = n.getX(i), y = n.getY(i), z = n.getZ(i), l = x * x + y * y + z * z; if (!(l > 1e-8)) n.setXYZ(i, 0, 1, 0); }
  n.needsUpdate = true; return geo;
}
const N3 = makeNoise(71);
const n3 = (x, y, z) => N3(x + z * 0.71, y - z * 0.43) * 0.6 + N3(y * 1.3 + 5, z * 1.3 - x * 0.5) * 0.4;
function canvasTexture(w, h, draw, repeat = false) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ============================================================ CỎ
// thẻ cắt chéo, mỗi thẻ có 3 đốt để uốn cong ra ngoài (trông có khối), pháp tuyến hướng lên
export function bentCards(n, w, h, bend) {
  const parts = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.PlaneGeometry(w, h, 2, 3); g.translate(0, h / 2, 0);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const y = p.getY(k) / h; p.setZ(k, p.getZ(k) + y * y * bend * (Math.abs(p.getX(k)) / (w / 2) * 0.5 + 0.5)); }
    g.rotateY(i * Math.PI / n + (i % 2) * 0.2);
    const nr = g.attributes.normal; for (let k = 0; k < nr.count; k++) nr.setXYZ(k, 0, 1, 0);
    parts.push(g);
  }
  return mergeGeometries(parts);
}
// kind: "tall" cỏ khô cao có bông · "tuft" cỏ vàng xanh búi dày · "stub" cỏ lún phún thấp
export function grassTexture(kind) {
  return canvasTexture(1024, 1024, (ctx, w, h) => {
    const r = mulberry(kind.length * 97 + 3);
    const fine = kind === "fine";
    const count = kind === "stub" ? 760 : kind === "tuft" ? 640 : fine ? 900 : 560;
    const pal = fine ? [[214, 196, 132], [190, 176, 112], [168, 170, 96], [232, 214, 160], [150, 150, 88]] : kind === "tuft" ? [[176, 176, 84], [150, 160, 70], [214, 196, 104], [128, 146, 62]]
      : kind === "stub" ? [[200, 176, 110], [178, 160, 96], [150, 140, 84], [222, 200, 140]]
        : [[226, 204, 140], [206, 182, 118], [238, 222, 168], [180, 162, 104]];
    for (let i = 0; i < count; i++) {
      const spread = kind === "stub" ? 0.8 : fine ? 0.1 : kind === "tall" ? 0.18 : 0.36;   // 1j: cỏ cao mọc TOẢ từ gốc (hình quạt), không thành tấm
      const x0 = w / 2 + (r() - 0.5) * w * spread;
      const len = h * (kind === "stub" ? 0.18 + r() * 0.35 : kind === "tuft" ? 0.4 + r() * 0.5 : fine ? 0.55 + r() * 0.44 : 0.5 + r() * 0.48);
      const lean = (r() - 0.5) * w * (fine ? 0.85 : kind === "tall" ? 0.7 : 0.45), wid = fine ? 1.1 + r() * 1.6 : (kind === "stub" ? 1.4 : 1.8) + r() * 2.2;   // 1j: lá mảnh hơn
      const c = pal[Math.floor(r() * pal.length)];
      const grd = ctx.createLinearGradient(0, h, 0, h - len);
      grd.addColorStop(0, `rgb(${c[0] * 0.45 | 0},${c[1] * 0.45 | 0},${c[2] * 0.4 | 0})`);
      grd.addColorStop(0.5, `rgb(${c[0] * 0.85 | 0},${c[1] * 0.85 | 0},${c[2] * 0.8 | 0})`);
      grd.addColorStop(1, `rgb(${Math.min(255, c[0] * 1.08) | 0},${Math.min(255, c[1] * 1.08) | 0},${c[2] | 0})`);
      ctx.strokeStyle = grd; ctx.lineCap = "round";
      // lá thon dần: vẽ 3 đoạn với bề dày giảm dần
      const pts = []; for (let k = 0; k <= 3; k++) { const t = k / 3; pts.push([x0 + lean * t * t * (0.7 + r() * 0.3) + (r() - 0.5) * 6, h - len * t]); }
      for (let k = 0; k < 3; k++) { ctx.lineWidth = wid * (1 - k * 0.3); ctx.beginPath(); ctx.moveTo(pts[k][0], pts[k][1]); ctx.lineTo(pts[k + 1][0], pts[k + 1][1]); ctx.stroke(); }
      if ((kind === "tall" && r() < 0.35) || (fine && r() < 0.2)) {   // bông cỏ
        const [tx, ty] = pts[3];
        for (let s = 0; s < 11; s++) { ctx.fillStyle = `rgba(${240},${226},${180},${0.9})`; ctx.beginPath(); ctx.ellipse(tx + (r() - 0.5) * 8, ty + s * 5, 2.2, 5, (r() - 0.5), 0, 7); ctx.fill(); }
      }
      if (kind === "tuft" && r() < 0.1) { const [tx, ty] = pts[3]; ctx.fillStyle = "rgb(236,200,70)"; ctx.beginPath(); ctx.arc(tx, ty, 5 + r() * 4, 0, 7); ctx.fill(); }
    }
  });
}

// ============================================================ 1l: CÂY CỎ NHỎ trên đồi/gò xa — nhỏ, thưa, lá mảnh, chi tiết
// Thầy (1k): "các dạng cây nhỏ như này không đẹp, quá dày và xấu ⇒ đẹp hơn, nhỏ hơn, chi tiết hơn".
// 3 loại thẻ vẽ độ phân giải cao: búi cỏ lá kim mảnh cong như đài phun (vài cọng trổ bông), cây hoa dại li ti
// (vàng/cam/tím), bụi sa mạc cành thưa lá nhỏ. Phủ bù ở xa nhẹ tay (không nhoè thành cục), rải thưa theo vạt.
function drawShrub(ctx, w, h, r, pal, flowers) {
  ctx.lineCap = "round";
  const twig = (x, y, a, L, wd, depth) => {
    const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L;
    ctx.strokeStyle = `rgb(${86 + r() * 26 | 0},${66 + r() * 16 | 0},${48 + r() * 12 | 0})`; ctx.lineWidth = wd;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + x2) / 2 + (r() - 0.5) * L * 0.3, (y + y2) / 2, x2, y2); ctx.stroke();
    if (depth > 0) for (let k = 0; k < 2 + (r() < 0.5 ? 1 : 0); k++) twig(x2, y2, a + (r() - 0.5) * 1.1, L * (0.55 + r() * 0.2), wd * 0.65, depth - 1);
    else for (let k = 0; k < 7; k++) {   // chùm lá nhỏ ở đầu cành
      const c = pal[Math.floor(r() * pal.length)], lx = x2 + (r() - 0.5) * 14, ly = y2 + (r() - 0.5) * 12;
      ctx.fillStyle = `rgb(${c[0] + (r() - 0.5) * 20 | 0},${c[1] + (r() - 0.5) * 20 | 0},${c[2] + (r() - 0.5) * 16 | 0})`;
      ctx.beginPath(); ctx.ellipse(lx, ly, 1.6 + r() * 2.2, 1 + r() * 1.3, r() * 3, 0, 7); ctx.fill();
      if (flowers && r() < 0.25) { ctx.fillStyle = flowers[Math.floor(r() * flowers.length)]; ctx.beginPath(); ctx.arc(lx, ly - 2, 1.8 + r() * 1.4, 0, 7); ctx.fill(); }
    }
  };
  for (let i = 0; i < 7; i++) twig(w / 2 + (r() - 0.5) * 20, h, -Math.PI / 2 + (r() - 0.5) * 1.5, h * (0.2 + r() * 0.12), 3 + r() * 2, 3);
}
// bụi tiền cảnh: cùng kiểu cành thưa lá nhỏ (thay vòm lá tròn như bắp cải)
export function shrubTexture(kind) {
  return canvasTexture(512, 512, (ctx, w, h) => {
    const r = mulberry(kind.length * 131 + 7);
    const pal = kind === "sage" ? [[130, 142, 112], [152, 162, 132], [112, 122, 96], [172, 178, 150]]
      : kind === "rabbit" ? [[128, 138, 76], [150, 152, 80], [110, 120, 64]] : [[84, 104, 54], [104, 124, 62], [70, 88, 44], [120, 136, 74]];
    drawShrub(ctx, w, h, r, pal, kind === "rabbit" ? ["rgb(232,196,72)", "rgb(240,208,90)", "rgb(214,170,52)"] : null);
  });
}
let FARKIT = null;
export function farGrassKit() {
  if (FARKIT) return FARKIT;
  const tuftTex = canvasTexture(512, 512, (ctx, w, h) => {
    const r = mulberry(5151);
    const pal = [[206, 186, 124], [188, 170, 108], [164, 158, 92], [140, 146, 80], [220, 204, 150], [124, 136, 72]];
    ctx.lineCap = "round";
    for (let i = 0; i < 30; i++) {   // lá kim mảnh, cong ra ngoài như đài phun
      const x0 = w / 2 + (r() - 0.5) * w * 0.08, len = h * (0.4 + r() * 0.55), lean = (r() - 0.5) * w * 0.95, c = pal[Math.floor(r() * pal.length)];
      const grd = ctx.createLinearGradient(0, h, 0, h - len);
      grd.addColorStop(0, `rgb(${c[0] * 0.45 | 0},${c[1] * 0.45 | 0},${c[2] * 0.4 | 0})`); grd.addColorStop(0.5, `rgb(${c[0] * 0.85 | 0},${c[1] * 0.85 | 0},${c[2] * 0.8 | 0})`); grd.addColorStop(1, `rgb(${c[0]},${c[1]},${c[2]})`);
      ctx.strokeStyle = grd; ctx.lineWidth = 2 + r() * 1.6;
      const ex = x0 + lean * 0.62, ey = h - len * (0.75 + r() * 0.25);
      ctx.beginPath(); ctx.moveTo(x0, h); ctx.quadraticCurveTo(x0 + lean * 0.12, h - len * 0.95, ex, ey); ctx.stroke();
      if (r() < 0.22) {   // cọng trổ bông: chuỗi hạt nhỏ ở ngọn
        for (let k = 0; k < 8; k++) { ctx.fillStyle = "rgba(236,220,178,0.85)"; ctx.beginPath(); ctx.ellipse(ex + (r() - 0.5) * 5, ey + k * 4, 1.6, 3.2, (r() - 0.5), 0, 7); ctx.fill(); }
      }
    }
  });
  const flowerTex = canvasTexture(256, 256, (ctx, w, h) => {
    const r = mulberry(7373), cols = ["rgb(246,196,52)", "rgb(238,132,48)", "rgb(186,120,196)", "rgb(250,232,120)"];
    ctx.lineCap = "round";
    for (let i = 0; i < 9; i++) {
      const x0 = w / 2 + (r() - 0.5) * 20, L = h * (0.35 + r() * 0.45), lean = (r() - 0.5) * w * 0.6, ex = x0 + lean, ey = h - L;
      ctx.strokeStyle = "rgb(104,128,64)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, h); ctx.quadraticCurveTo(x0 + lean * 0.2, h - L * 0.6, ex, ey); ctx.stroke();
      ctx.fillStyle = "rgb(120,146,70)"; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(x0 + lean * (0.2 + k * 0.2), h - L * (0.25 + k * 0.2), 4, 1.6, 0.6 * (k % 2 ? 1 : -1), 0, 7); ctx.fill(); }
      const c = cols[Math.floor(r() * cols.length)];
      for (let k = 0; k < 5; k++) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(ex + Math.cos(k * 1.26) * 3.4, ey + Math.sin(k * 1.26) * 3.4, 2.6, 0, 7); ctx.fill(); }
      ctx.fillStyle = "rgb(120,80,30)"; ctx.beginPath(); ctx.arc(ex, ey, 1.8, 0, 7); ctx.fill();
    }
  });
  const shrubTex = canvasTexture(512, 512, (ctx, w, h) => drawShrub(ctx, w, h, mulberry(6262), [[96, 110, 58], [118, 128, 70], [80, 94, 50], [140, 146, 90]], null));
  const mk = (map, glow, size) => {
    const m = new THREE.MeshStandardMaterial({ map, alphaTest: 0.35, alphaToCoverage: true, side: THREE.DoubleSide, roughness: 1,
      emissive: new THREE.Color(glow, glow * 0.88, glow * 0.66), emissiveMap: map });
    m.onBeforeCompile = sh => {   // xa: bù độ phủ nhẹ tay (lá mảnh không mất, cũng không nhoè thành cục)
      sh.fragmentShader = sh.fragmentShader.replace("#include <alphatest_fragment>", `
        #ifdef USE_MAP
          vec2 tsz = vMapUv * ${size}.;
          float mipK = max(0., log2(max(length(dFdx(tsz)), length(dFdy(tsz)))));
          diffuseColor.a *= 1. + mipK * 0.14;
        #endif
        diffuseColor.a = clamp((diffuseColor.a - 0.42) / max(fwidth(diffuseColor.a), 0.0001) + 0.5, 0., 1.);
        if (diffuseColor.a < 0.02) discard;`);
    };
    m.customProgramCacheKey = () => "farcard" + size;
    return m;
  };
  const cards = (n, wd, ht) => { const parts = []; for (let i = 0; i < n; i++) { const g = new THREE.PlaneGeometry(wd, ht); g.translate(0, ht / 2, 0); g.rotateY(i * Math.PI / n + 0.3); const nr = g.attributes.normal; for (let k = 0; k < nr.count; k++) nr.setXYZ(k, 0, 1, 0); parts.push(g); } return mergeGeometries(parts); };
  // mặt đất đồi: đất cát + vô số sợi cỏ khô li ti (lặp dày) ⇒ gần/xa đều thấy vân cỏ, không bệt màu
  const groundTex = canvasTexture(512, 512, (ctx, w, h) => {
    const Nn = makeNoise(88), r = mulberry(88), img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = Nn(x / 60, y / 60) * 0.5 + Nn(x / 14, y / 14) * 0.3 + (r() - 0.5) * 0.25, i = (y * w + x) * 4;
      img.data[i] = 214 + n * 50; img.data[i + 1] = 172 + n * 44; img.data[i + 2] = 124 + n * 36; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.lineCap = "round";
    for (let i = 0; i < 6400; i++) {
      const x = r() * w, y = r() * h, L = 2 + r() * 5, a = -Math.PI / 2 + (r() - 0.5) * 1.4, t = r();
      ctx.strokeStyle = t < 0.45 ? `rgba(${170 + r() * 50 | 0},${150 + r() * 40 | 0},${84 + r() * 30 | 0},.75)` : t < 0.8 ? `rgba(${118 + r() * 30 | 0},${124 + r() * 26 | 0},${64 + r() * 20 | 0},.7)` : `rgba(${96 + r() * 20 | 0},${76 + r() * 16 | 0},${56 + r() * 12 | 0},.55)`;
      ctx.lineWidth = 0.6 + r() * 0.7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke();
    }
  }, true);
  return (FARKIT = { tuftGeo: cards(3, 1.25, 1.0), flowerGeo: cards(2, 0.9, 0.8), shrubGeo: cards(3, 1.0, 0.85), tuftMat: mk(tuftTex, 0.16, 512), flowerMat: mk(flowerTex, 0.14, 256), shrubMat: mk(shrubTex, 0.1, 512), groundTex });
}
// rải cỏ + hoa + bụi lên một địa hình h(lx,lz): mọc thành vạt theo nhiễu `patch` (0..1), tránh vùng `skip`
export function scatterFarGrass(group, h, { n = 2000, ns = 60, nf = 200, rx, rz, cz = 0, inside, skip = () => false, patch, s0 = 0.3, s1 = 0.65, seed = 1 }) {
  const K = farGrassKit(), r = mulberry(seed), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s3 = new THREE.Vector3(), e = new THREE.Euler(), c = new THREE.Color();
  const put = (geo, mat, count, sa, sb, colFn) => {
    if (!count) return;
    const inst = new THREE.InstancedMesh(geo, mat, count); let k = 0, guard = 0;
    while (k < count && guard++ < count * 14) {
      const lx = (r() - 0.5) * 2 * rx, lz = cz + (r() - 0.5) * 2 * rz;
      if (!inside(lx, lz) || skip(lx, lz)) continue;
      const p = patch(lx, lz); if (r() > p) continue;
      const s = (sa + r() * (sb - sa)) * (0.75 + p * 0.35);
      m4.compose(v.set(lx, h(lx, lz) - 0.05 * s, lz), q.setFromEuler(e.set((r() - 0.5) * 0.16, r() * 6, (r() - 0.5) * 0.16)), s3.set(s * (0.85 + r() * 0.4), s * (0.75 + r() * 0.5), s));
      inst.setMatrixAt(k, m4); inst.setColorAt(k, colFn(c)); k++;
    }
    inst.count = k; inst.receiveShadow = true; group.add(inst); return inst;
  };
  put(K.tuftGeo, K.tuftMat, n, s0, s1, c => c.setRGB(1, 1, 1).offsetHSL((r() - 0.5) * 0.04, 0, (r() - 0.5) * 0.12));
  put(K.flowerGeo, K.flowerMat, nf, s0 * 0.7, s1 * 0.8, c => c.setRGB(1, 1, 1).offsetHSL(0, 0, (r() - 0.5) * 0.1));
  put(K.shrubGeo, K.shrubMat, ns, s0 * 1.5, s1 * 1.7, c => c.setRGB(1, 1, 1).offsetHSL((r() - 0.5) * 0.05, 0, (r() - 0.5) * 0.14));
}

// ============================================================ 1k: CỎ BÔNG LAU (tiền/hậu cảnh)
// Thầy gửi ảnh cỏ lau: thân mảnh cao, bông lông tơ mềm rủ nghiêng, màu kem vàng óng khi ngược nắng. Nhỏ, nhẹ, thưa.
export function reedTexture(seed = 1) {
  return canvasTexture(512, 1024, (ctx, w, h) => {
    const r = mulberry(4040 + seed * 31);
    ctx.lineCap = "round";
    // lá gốc dài, mảnh, cong rủ
    for (let i = 0; i < 7; i++) {
      const x0 = w / 2 + (r() - 0.5) * 30, L = h * (0.18 + r() * 0.2), lean = (r() - 0.5) * w * 0.7;
      const g = ctx.createLinearGradient(0, h, 0, h - L); g.addColorStop(0, "rgb(92,80,50)"); g.addColorStop(1, "rgb(190,170,112)");
      ctx.strokeStyle = g; ctx.lineWidth = 4 + r() * 2;
      ctx.beginPath(); ctx.moveTo(x0, h); ctx.quadraticCurveTo(x0 + lean * 0.3, h - L * 0.95, x0 + lean, h - L * 0.72); ctx.stroke();
    }
    const stems = 3 + Math.floor(r() * 3);
    for (let s = 0; s < stems; s++) {
      const x0 = w / 2 + (r() - 0.5) * 40, ty = h * (0.3 + r() * 0.2), tx = x0 + (r() - 0.5) * w * 0.36;
      const cx = x0 + (tx - x0) * 0.25, cy = h - (h - ty) * 0.55;
      // thân: vẽ 3 đoạn thon dần (đủ dày để còn thấy ở xa)
      const g = ctx.createLinearGradient(0, h, 0, ty); g.addColorStop(0, "rgb(104,86,56)"); g.addColorStop(0.6, "rgb(196,166,108)"); g.addColorStop(1, "rgb(232,206,150)");
      ctx.strokeStyle = g;
      const Q = t => [(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * tx, (1 - t) * (1 - t) * h + 2 * (1 - t) * t * cy + t * t * ty];
      for (let k = 0; k < 6; k++) { const [ax, ay] = Q(k / 6), [bx, by] = Q((k + 1) / 6); ctx.lineWidth = 6 - k * 0.6; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
      // bông: trục cong nghiêng rủ về một phía; lông tơ mọc xiên dọc trục như chiếc lông vũ
      const [px0, py0] = Q(0.97), ux0 = tx - px0, uy0 = ty - py0, ul = Math.hypot(ux0, uy0), ux = ux0 / ul, uy = uy0 / ul;
      const side = tx >= x0 ? 1 : -1, PL = h * (0.2 + r() * 0.1), droop = side * PL * (0.35 + r() * 0.4);
      const A = t => [tx + ux * PL * t * 0.8 + droop * t * t, ty + uy * PL * t * 0.8 + PL * 0.45 * t * t];
      ctx.strokeStyle = "rgb(214,190,146)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(tx, ty); for (let k = 1; k <= 10; k++) { const [x, y] = A(k / 10); ctx.lineTo(x, y); } ctx.stroke();
      for (let k = 0; k < 900; k++) {
        const t = Math.pow(r(), 0.85), [px, py] = A(t), [qx, qy] = A(Math.min(1, t + 0.02));
        let dx = qx - px, dy = qy - py; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
        const sgn = r() < 0.5 ? -1 : 1, ang = sgn * (0.2 + r() * 0.5), ca = Math.cos(ang), sa = Math.sin(ang);
        const fx = dx * ca - dy * sa, fy = dx * sa + dy * ca, L = (14 + r() * 34) * (1 - t * 0.5) * (0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, t * 1.3 + 0.1)));
        const lum = r();
        ctx.strokeStyle = `rgba(${248 - lum * 22 | 0},${232 - lum * 30 | 0},${204 - lum * 44 | 0},${0.75 + r() * 0.25})`;
        ctx.lineWidth = 1.3 + r() * 1.2;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + fx * L * 0.5, py + fy * L * 0.5 + 2, px + fx * L, py + fy * L + L * 0.18); ctx.stroke();
      }
    }
  });
}

// ============================================================ ĐÁ SA THẠCH
export function makeRockKit() {
  const protos = [];
  for (let s = 0; s < 4; s++) {
    const g = new THREE.IcosahedronGeometry(1, 5), p = g.attributes.position, col = new Float32Array(p.count * 3);
    const cBase = new THREE.Color(0xb86d3e), cLight = new THREE.Color(0xd9a06d), cDark = new THREE.Color(0x6e3a20), cTop = new THREE.Color(0xd8b08a), c = new THREE.Color();
    const sx = 1 + s * 0.25, ph = s * 3.7;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, i);
      const big = n3(v.x * 0.9 + ph, v.y * 0.9, v.z * 0.9) * 0.34, mid = n3(v.x * 2.6, v.y * 2.6 + ph, v.z * 2.6) * 0.1, fine = n3(v.x * 7, v.y * 7, v.z * 7 + ph) * 0.035;
      // lớp đá nằm ngang: bậc nhẹ theo độ cao
      const d = 1 + big + mid + fine;
      v.multiplyScalar(d);
      v.y = Math.round(v.y * 5) / 5 * 0.25 + v.y * 0.75;
      if (v.y < -0.35) v.y = -0.35 + (v.y + 0.35) * 0.15;   // đáy phẳng, nằm trên đất
      v.x *= sx; v.y *= 0.62;
      p.setXYZ(i, v.x, v.y, v.z);
      const band = 0.5 + 0.5 * Math.sin(v.y * 22 + N3(v.x * 2, v.z * 2) * 2);
      c.copy(cBase).lerp(cLight, band * 0.55).lerp(cDark, Math.max(0, -(big + mid) * 2.2)).lerp(cTop, Math.max(0, v.y) * 0.5);
      c.multiplyScalar(0.92 + (Math.random() - 0.5) * 0.12);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    protos.push(g);
  }
  const pebble = new THREE.IcosahedronGeometry(1, 1);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93 });
  return { protos, pebble, mat };
}

// ============================================================ XƯƠNG RỒNG
export function makeCactusKit() {
  const sagMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82 });
  const padMat = new THREE.MeshStandardMaterial({ map: padTexture(), roughness: 0.62 });
  const fruitMat = new THREE.MeshStandardMaterial({ color: 0xb02a4a, roughness: 0.45 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf2cf3a, roughness: 0.5, emissive: 0x3a2a00 });
  // gân dọc + màu: rãnh tối, sống gân sáng (gai), gốc sẫm, ngọn sáng
  function ribbed(geo, ribs, radial, depth, yMin, yMax) {
    const p = geo.attributes.position, n = geo.attributes.normal, col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const j = i % (radial + 1), a = j / radial * Math.PI * 2, rib = Math.cos(a * ribs);
      const d = (rib > 0 ? rib : rib * 0.6) * depth;
      p.setXYZ(i, p.getX(i) + n.getX(i) * d, p.getY(i) + n.getY(i) * d, p.getZ(i) + n.getZ(i) * d);
      const t = Math.min(1, Math.max(0, (p.getY(i) - yMin) / (yMax - yMin)));
      const ridge = Math.pow(rib * 0.5 + 0.5, 3);
      const base = [0.30 + 0.07 * t, 0.42 + 0.08 * t, 0.22 + 0.05 * t];
      const k = 0.55 + 0.45 * (rib * 0.5 + 0.5);
      col.set([base[0] * k + ridge * 0.16, base[1] * k + ridge * 0.14, base[2] * k + ridge * 0.08], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    return geo.index ? geo.toNonIndexed() : geo;
  }
  // 1i: SAGUARO sần sùi, mỗi cây một khác — thân phình/thắt theo mùa lớn, nghiêng/cong nhẹ, gân sâu có mắt gai nổi,
  // gốc hoá gỗ nâu xám, sẹo/vết cháy nắng, màu xanh mỗi cây một sắc; cành to nhỏ, chĩa lên/rủ xuống khác nhau.
  function saguaro(x, z, h, r) {
    const R = h * (0.058 + r() * 0.028), parts = [];
    const lean = (r() - 0.5) * 0.14 * h, leanZ = (r() - 0.5) * 0.1 * h, ph1 = r() * 6, ph2 = r() * 6, bulge = 0.04 + r() * 0.08, taper = 0.08 + r() * 0.12;
    const ribs = 12 + Math.floor(r() * 6), twist = (r() - 0.5) * 0.5;
    const rOf = t => R * (1.05 - taper * t) * (1 + bulge * Math.sin(t * 8 + ph1) + 0.035 * Math.sin(t * 21 + ph2)) * (t > 0.93 ? Math.sqrt(Math.max(0.02, 1 - Math.pow((t - 0.93) / 0.07, 2) * 0.85)) : 1);
    const axis = t => [lean * t * t, leanZ * t * t];
    // thân: ống đơn vị → gân + phình + cong + chóp tròn liền
    const RAD = 40, HS = 80;
    const trunk = new THREE.CylinderGeometry(1, 1, 1, RAD, HS, false); trunk.translate(0, 0.5, 0);
    const tp = trunk.attributes.position;
    for (let i = 0; i < tp.count; i++) {
      const lx = tp.getX(i), ly = tp.getY(i), lz = tp.getZ(i), a = Math.atan2(lz, lx), rr0 = Math.hypot(lx, lz);
      let t = ly, rad = rOf(t) * (rr0 > 0.5 ? 1 : 0);
      if (ly > 0.999 && rr0 < 0.5) { t = 1; rad = 0; }
      const rib = Math.cos(a * ribs + twist * t * 6), d = (rib > 0 ? rib : rib * 0.55);
      rad *= 1 + 0.13 * d;
      const [ax, az] = axis(Math.min(t, 1));
      tp.setXYZ(i, ax + Math.cos(a) * rad, Math.min(t, 1) * h + (ly > 0.999 && rr0 < 0.5 ? R * 0.55 : 0), az + Math.sin(a) * rad);
    }
    parts.push(trunk.index ? trunk.toNonIndexed() : trunk);
    // cành: số lượng/độ cao/chiều cong khác nhau (có cành rủ xuống rồi mới vểnh lên)
    const arms = r() < 0.12 ? 0 : 1 + Math.floor(r() * (h > 11 ? 5 : 3.5));
    for (let i = 0; i < arms; i++) {
      const ang = i * (Math.PI * 2 / arms) + r() * 1.1, tA = 0.32 + r() * 0.36, ay = h * tA;
      const [bx, bz] = axis(tA), rr = R * (0.5 + r() * 0.28), out = R * (1.7 + r() * 1.5), up = h * (0.12 + r() * 0.3), droop = r() < 0.25 ? R * (0.8 + r()) : 0;
      const dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)), o = new THREE.Vector3(bx, 0, bz);
      const pts = [o.clone().setY(ay), o.clone().addScaledVector(dir, out * 0.5).setY(ay - rr * 0.2 - droop), o.clone().addScaledVector(dir, out * 0.95).setY(ay + out * 0.25 - droop * 0.6),
        o.clone().addScaledVector(dir, out * (1 + r() * 0.15)).setY(ay + out * 0.7 + up * 0.5), o.clone().addScaledVector(dir, out * (1 + r() * 0.2)).setY(ay + out * 0.7 + up)];
      const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, rr, 24, false);
      parts.push(ribbed(tube, 10 + Math.floor(r() * 3), 24, rr * 0.13, 0, h));
      const cap = new THREE.SphereGeometry(rr, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2); cap.scale(1, 0.75, 1); cap.translate(pts[4].x, pts[4].y, pts[4].z);
      parts.push(ribbed(cap, 11, 24, rr * 0.1, 0, h));
    }
    let geo = mergeGeometries(parts.map(g => { const q = g.index ? g.toNonIndexed() : g; if (!q.attributes.color) q.setAttribute("color", new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 3), 3)); q.deleteAttribute("normal"); q.deleteAttribute("uv"); return q; }));
    geo = mergeVertices(geo, 1e-4);   // nối lại đỉnh trùng ⇒ pháp tuyến MƯỢT (không bị mặt phẳng từng tam giác)
    geo.computeVertexNormals();
    // sần sùi: u nổi nhiều lớp theo pháp tuyến + mắt gai lấm tấm
    const P = geo.attributes.position, Nn = geo.attributes.normal, col = geo.attributes.color, sd = r() * 50;
    const tint = [0.95 + r() * 0.35, 0.85 + r() * 0.25, 0.55 + r() * 0.3], barkH = 0.08 + r() * 0.2, sun = 0.3 + r() * 0.7;
    for (let i = 0; i < P.count; i++) {
      const px = P.getX(i), py = P.getY(i), pz = P.getZ(i);
      const lump = n3(px * 1.4 + sd, py * 1.1, pz * 1.4) * 0.16 * R + n3(px * 4 + sd, py * 3.2, pz * 4) * 0.07 * R + n3(px * 11, py * 9 + sd, pz * 11) * 0.03 * R;
      const areole = Math.pow(Math.max(0, n3(px * 12, py * 12 + sd, pz * 12) - 0.25), 2) * 0.35 * R;
      P.setXYZ(i, px + Nn.getX(i) * (lump + areole), py + Nn.getY(i) * (lump + areole), pz + Nn.getZ(i) * (lump + areole));
      const t = py / h, a = Math.atan2(pz, px);
      let cr = 0.3 + 0.07 * t, cg = 0.42 + 0.08 * t, cb = 0.22 + 0.05 * t;
      if (col.getX(i) > 0) { cr = col.getX(i); cg = col.getY(i); cb = col.getZ(i); }
      else { const rib = Math.cos(a * ribs + twist * t * 6), k = 0.55 + 0.45 * (rib * 0.5 + 0.5), ridge = Math.pow(rib * 0.5 + 0.5, 3); cr = cr * k + ridge * 0.16; cg = cg * k + ridge * 0.14; cb = cb * k + ridge * 0.08; }
      cr *= tint[0]; cg *= tint[1]; cb *= tint[2];
      // gốc hoá gỗ (ranh giới lởm chởm theo nhiễu)
      const bark = Math.min(1, Math.max(0, (barkH + n3(a * 2 + sd, py * 0.8, 0) * 0.05 - t) / 0.04));
      cr = cr * (1 - bark) + (0.34 + n3(px * 6, py * 6, pz * 6) * 0.06) * bark; cg = cg * (1 - bark) + 0.3 * bark; cb = cb * (1 - bark) + 0.24 * bark;
      // sẹo nâu + mảng cháy nắng vàng nhạt phía hướng nắng
      const scar = Math.max(0, n3(px * 2.2 + 9, py * 1.3 + sd, pz * 2.2) - 0.18) * 3.2;
      cr += (0.42 - cr) * Math.min(1, scar) * 0.8; cg += (0.33 - cg) * Math.min(1, scar) * 0.8; cb += (0.22 - cb) * Math.min(1, scar) * 0.8;
      const sunburn = Math.max(0, -Math.cos(a - 1.2)) * sun * Math.max(0, n3(px * 1.1, py * 0.7 + 4, pz * 1.1) + 0.2);
      cr += sunburn * 0.18; cg += sunburn * 0.12; cb += sunburn * 0.02;
      if (areole > 0.01 * R) { cr = cr * 0.45 + 0.4; cg = cg * 0.45 + 0.37; cb = cb * 0.45 + 0.3; }   // mắt gai trắng ngà
      col.setXYZ(i, cr, cg, cb);
    }
    geo.computeVertexNormals(); fixNormals(geo);
    const m = new THREE.Mesh(geo, sagMat); m.castShadow = true; m.receiveShadow = true;
    m.position.set(x, -0.15, z); m.rotation.y = r() * 6; m.userData.saguaro = true;
    return m;
  }
  // tai thỏ: mỗi tấm lá mọc từ mép trên tấm cha (nối liền), gốc chạm đất
  const padGeo = (() => {
    const g = new THREE.SphereGeometry(1, 26, 18), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const w = 0.52 * (1 - 0.25 * Math.max(0, -y));     // hình trứng ngược: dưới hẹp, trên rộng
      x *= w * (1 + N3(y * 3, x * 3) * 0.06); z *= 0.1 * (1 - Math.abs(y) * 0.4 + 0.25); y *= 0.66;
      p.setXYZ(i, x, y + 0.64, z);
    }
    g.computeVertexNormals(); return fixNormals(g);
  })();
  function opuntia(x, z, s, r) {
    const g = new THREE.Group();
    const grow = (parent, depth, tilt, yaw, sc) => {
      const pad = new THREE.Group();
      pad.rotation.set(0, yaw, tilt); pad.scale.setScalar(sc);
      const m = new THREE.Mesh(padGeo, padMat); m.castShadow = true; m.receiveShadow = true; pad.add(m);
      parent.add(pad);
      if (depth > 0) {
        const kids = 1 + Math.floor(r() * 2.2);
        for (let k = 0; k < kids; k++) {
          const joint = new THREE.Group(); joint.position.set((r() - 0.5) * 0.5, 1.18, 0); pad.add(joint);
          grow(joint, depth - 1, (r() - 0.5) * 1.1, (r() - 0.5) * 1.4, 0.72 + r() * 0.18);
        }
      } else if (r() < 0.6) {
        const n = 1 + Math.floor(r() * 3);
        for (let k = 0; k < n; k++) {
          const f = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), r() < 0.5 ? fruitMat : flowerMat);
          f.scale.set(1, 1.35, 1); f.position.set(-0.3 + k * 0.28, 1.28 - Math.abs(k - 1) * 0.06, 0); pad.add(f);
        }
      }
    };
    const bases = 2 + Math.floor(r() * 3);
    for (let i = 0; i < bases; i++) {
      const base = new THREE.Group(); base.position.set((r() - 0.5) * 0.9, -0.08, (r() - 0.5) * 0.7); g.add(base);
      grow(base, 1 + Math.floor(r() * 2), (r() - 0.5) * 0.7, r() * Math.PI, 0.9 + r() * 0.3);
    }
    g.scale.setScalar(s); g.position.set(x, 0, z); g.rotation.y = r() * 6;
    return g;
  }
  return { saguaro, opuntia };
}
function padTexture() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h / 2, w * 0.6);
    g.addColorStop(0, "#9bb56a"); g.addColorStop(0.7, "#78964c"); g.addColorStop(1, "#6a6a52");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const r = mulberry(5);
    for (let i = 0; i < 1400; i++) { ctx.fillStyle = `rgba(${60 + r() * 60},${90 + r() * 50},${40 + r() * 30},.18)`; ctx.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5); }
    // mắt gai xếp lưới chéo, mỗi mắt có túm gai trắng
    for (let y = 18; y < h; y += 44) for (let x = (y / 44 % 2) * 26 + 10; x < w; x += 52) {
      const px = x + (r() - 0.5) * 6, py = y + (r() - 0.5) * 6;
      ctx.fillStyle = "#5b4a2a"; ctx.beginPath(); ctx.arc(px, py, 4.5, 0, 7); ctx.fill();
      ctx.fillStyle = "#e9dfb8"; ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(246,240,214,.9)"; ctx.lineWidth = 1.4;
      for (let k = 0; k < 3; k++) { const a = -1.9 + r() * 1.4; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * 14, py + Math.sin(a) * 14); ctx.stroke(); }
    }
  });
}

// ============================================================ 1j: ĐỒI ĐỠ CHỮ nhọn, gồ ghề, lởm chởm, đốm cây xanh
// Toạ độ trong nhóm bảng chữ: chân chữ ở z = 12, y ≈ 17 (vùng chân chữ giữ phẳng vừa đủ để chữ đứng vững).
// ============================================================ 1r: 5 KIỂU ĐỒI CHỮ để thầy duyệt (?nui=0..4)
// Thầy: "thiết kế lại mấy quả núi có chữ ANDREW CLASSES và NO HOMEWORK NO FUN … chưa được đẹp".
// Mọi kiểu giữ: đồi elip tâm (0, cz), chân chữ ở lz ≈ 12,5 (chữ đứng trên cột như Hollywood), hàm độ cao hh cho con vật húc chữ leo.
export const HILL_STYLES = ["Hiện tại (1q)", "Đồi đá sa thạch phân tầng", "Đồi Hollywood bụi xanh", "Đồi cát đỏ gợn sóng", "Núi đá tảng + xương rồng"];
export const NUI = (() => { try { const v = parseInt(new URLSearchParams(location.search).get("nui"), 10); return v >= 0 && v < HILL_STYLES.length ? v : 1; } catch { return 1; } })();
function ruggedHill(cx, soilMat, seed) {
  if (NUI === 1) return hillMesa(cx, seed);
  if (NUI === 2) return hillChaparral(cx, seed);
  if (NUI === 3) return hillDune(cx, seed);
  if (NUI === 4) return hillBoulder(cx, seed);
  return hillSoft(cx, soilMat, seed);
}
const smooth01 = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// lưới đồi dùng chung: tô màu từng đỉnh qua colFn(c, x, y, z, ny)
function hillMesh(hh, sx, sz, cz, colFn, map, rep, rough = 1) {
  const W = sx * 2, D = sz * 2 * 1.15, geo = new THREE.PlaneGeometry(W, D, 200, 110); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, cz);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, hh(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const nr = geo.attributes.normal, col = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { colFn(c, p.getX(i), p.getY(i), p.getZ(i), nr.getY(i)); col.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  let tex = null; if (map) { tex = map.clone(); tex.repeat.set(W / rep, D / rep); tex.needsUpdate = true; }
  const m = new THREE.Mesh(fixNormals(geo), new THREE.MeshStandardMaterial({ vertexColors: true, map: tex, roughness: rough }));
  m.receiveShadow = true; return m;
}
const nearLetters = (lx, lz, cx, pad = 3) => Math.abs(lz - 12.5) < 4 + pad * 0.3 && Math.abs(lx) < cx / 2 + pad;

// ---- 1: ĐỒI ĐÁ SA THẠCH PHÂN TẦNG — bậc đá đỏ vách dựng, mặt bậc cát vàng lác đác bụi (kiểu Monument Valley / Utah)
function hillMesa(cx, seed) {
  const N = makeNoise(seed), r = mulberry(seed), sx = cx * 0.75 + 32, sz = 38, cz = -14, H = 36, STEP = 6.2;
  const hh = (lx, lz) => {
    const u = lx / sx, v = (lz - cz) / sz, r2 = u * u + v * v;
    if (r2 >= 1) return -4 - (Math.sqrt(r2) - 1) * 8;
    const base = H * Math.pow(1 - r2, 0.65) * (1 + N(lx * 0.02, lz * 0.025) * 0.18) - 2;
    const t = Math.max(0, base) / STEP, k = Math.floor(t), f = t - k;
    const stepped = (k + smooth01(0.72, 0.97, f + N(lx * 0.08 + 7, lz * 0.08) * 0.08)) * STEP;   // bậc thềm + vách đá
    const mask = (1 - Math.min(1, Math.max(0, (Math.abs(lx) - cx / 2 - 2) / 6))) * (1 - Math.min(1, Math.abs(lz - 12.5) / 4.5));
    return -4 + stepped + N(lx * 0.3, lz * 0.3) * 0.35 * (1 - mask);
  };
  const bands = [new THREE.Color(0xb8552e), new THREE.Color(0xd6804a), new THREE.Color(0xe8a868), new THREE.Color(0xc4643a), new THREE.Color(0xf0c690)];
  const top = new THREE.Color(0xe9c89a), tuft = new THREE.Color(0xb2a266);
  const m = hillMesh(hh, sx, sz, cz, (c, x, y, z, ny) => {
    const steep = smooth01(0.85, 0.45, ny);
    const b = Math.floor((y + 4) * 0.9 + N(x * 0.05, y * 0.2) * 1.2);
    c.copy(bands[((b % 5) + 5) % 5]).multiplyScalar(0.85 + 0.15 * Math.sin(y * 3.1 + x * 0.05));
    c.lerp(top, (1 - steep) * 0.75);
    c.lerp(tuft, (1 - steep) * Math.max(0, N(x * 0.12, z * 0.12)) * 0.6);
    c.multiplyScalar(0.92 + N(x * 1.1, z * 1.1) * 0.08);
  }, strataTex(), 9, 0.95);
  const hill = new THREE.Group(); hill.add(m);
  scatterFarGrass(hill, hh, { n: 900, ns: 110, nf: 60, rx: sx, rz: sz, cz, seed: seed + 5, s0: 0.35, s1: 0.8,
    inside: (lx, lz) => (lx / sx) ** 2 + ((lz - cz) / sz) ** 2 < 0.9, skip: (lx, lz) => nearLetters(lx, lz, cx, 1.5),
    patch: (x, z) => { const e = 0.6, sl = Math.abs(hh(x + e, z) - hh(x - e, z)) + Math.abs(hh(x, z + e) - hh(x, z - e)); return sl > 0.5 ? 0 : 0.8; } });
  const RK = makeRockKit();   // đá lở dưới chân vách
  for (let k = 0, g = 0; k < 40 && g < 900; g++) {
    const lx = (r() - 0.5) * sx * 1.8, lz = cz + (r() - 0.5) * sz * 1.8;
    if ((lx / sx) ** 2 + ((lz - cz) / sz) ** 2 > 0.95 || nearLetters(lx, lz, cx, 4)) continue;
    const e = 1.2, sl = Math.abs(hh(lx + e, lz) - hh(lx - e, lz)) + Math.abs(hh(lx, lz + e) - hh(lx, lz - e)); if (sl < 2.5) continue;
    const s = 0.8 + r() * 2.4, rock = new THREE.Mesh(RK.protos[k % RK.protos.length], RK.mat);
    rock.scale.set(s * (1 + r() * 0.6), s * (0.6 + r() * 0.5), s); rock.rotation.set(r() * 0.4, r() * 6, r() * 0.4);
    rock.position.set(lx, hh(lx, lz) - 0.3 * s, lz); rock.receiveShadow = true; hill.add(rock); k++;
  }
  return { hill, hillH: hh };
}
function strataTex() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    const r = mulberry(404);
    for (let y = 0; y < h; y += 2) { const v = 205 + (r() - 0.5) * 50 + Math.sin(y * 0.3) * 18; ctx.fillStyle = `rgb(${v | 0},${v * 0.9 | 0},${v * 0.82 | 0})`; ctx.fillRect(0, y, w, 2); }
    for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(${90 + r() * 60 | 0},${60 + r() * 30 | 0},${40 + r() * 20 | 0},.35)`; ctx.fillRect(r() * w, r() * h, 1 + r() * 5, 1); }
  }, true);
}

// ---- 2: ĐỒI HOLLYWOOD BỤI XANH — sườn đất vàng nâu phủ bụi cây rậm xanh ô-liu (chaparral) theo khe rãnh, sống đồi trơ đất
function hillChaparral(cx, seed) {
  const N = makeNoise(seed), r = mulberry(seed), sx = cx * 0.75 + 30, sz = 36, cz = -14, H = 40;
  const ridged = (x, z) => 1 - Math.abs(N(x, z));
  const hh = (lx, lz) => {
    const u = lx / sx, v = (lz - cz) / sz, r2 = u * u + v * v;
    if (r2 >= 1) return -4 - (Math.sqrt(r2) - 1) * 8;
    const mask = (1 - Math.min(1, Math.max(0, (Math.abs(lx) - cx / 2 - 2) / 6))) * (1 - Math.min(1, Math.abs(lz - 12.5) / 4.5));
    const up = Math.sqrt(1 - r2), gully = (ridged(lx * 0.045 + 2, lz * 0.03) - 0.6) * 5;   // sống + khe rãnh chạy xuống
    return -4 + H * Math.pow(1 - r2, 0.85) + (gully + N(lx * 0.02, lz * 0.02) * 4) * up * (1 - 0.85 * mask);
  };
  const veg = (x, z) => Math.max(0, Math.min(1, 0.55 - (ridged(x * 0.045 + 2, z * 0.03) - 0.6) * 2.2 + N(x * 0.09, z * 0.09) * 0.5));   // khe rậm, sống thưa
  const soil = new THREE.Color(0xd8b588), dark = new THREE.Color(0x5e6a34), olive = new THREE.Color(0x7c8446);
  const m = hillMesh(hh, sx, sz, cz, (c, x, y, z, ny) => {
    const g = veg(x, z);
    c.copy(soil).lerp(N(x * 0.2, z * 0.2) > 0 ? olive : dark, g * 0.8);
    c.multiplyScalar(0.9 + N(x * 0.9, z * 0.9) * 0.1);
  }, farGrassKit().groundTex, 7);
  const hill = new THREE.Group(); hill.add(m);
  // bụi cây rậm: bụi cành lá (thẻ) + khối tán tròn xanh sẫm nhỏ
  scatterFarGrass(hill, hh, { n: 1200, ns: 1500, nf: 0, rx: sx, rz: sz, cz, seed: seed + 9, s0: 0.7, s1: 1.4,
    inside: (lx, lz) => (lx / sx) ** 2 + ((lz - cz) / sz) ** 2 < 0.93, skip: (lx, lz) => nearLetters(lx, lz, cx, 1.5), patch: veg });
  const bushGeo = new THREE.IcosahedronGeometry(1, 2), bushMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  const nb = 1400, bushes = new THREE.InstancedMesh(bushGeo, bushMat, nb), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), cc = new THREE.Color();
  let k = 0;
  for (let g = 0; k < nb && g < nb * 10; g++) {
    const lx = (r() - 0.5) * sx * 1.9, lz = cz + (r() - 0.5) * sz * 1.9;
    if ((lx / sx) ** 2 + ((lz - cz) / sz) ** 2 > 0.9 || nearLetters(lx, lz, cx, 2) || r() > veg(lx, lz)) continue;
    const s = 0.5 + r() * 0.9;
    m4.compose(v3.set(lx, hh(lx, lz) + s * 0.2, lz), q.setFromEuler(new THREE.Euler(0, r() * 6, 0)), s3.set(s * 1.3, s * 0.75, s * 1.2)); bushes.setMatrixAt(k, m4);
    bushes.setColorAt(k, cc.setHSL(0.19 + r() * 0.06, 0.32 + r() * 0.1, 0.16 + r() * 0.1)); k++;
  }
  bushes.count = k; bushes.receiveShadow = true; hill.add(bushes);
  return { hill, hillH: hh };
}

// ---- 3: ĐỒI CÁT ĐỎ GỢN SÓNG — cùng chất đất cát đỏ của mặt đất game, gợn cát theo gió, bụi cỏ sa mạc lác đác
function hillDune(cx, seed) {
  const N = makeNoise(seed), r = mulberry(seed), sx = cx * 0.78 + 30, sz = 36, cz = -14, H = 34;
  const hh = (lx, lz) => {
    const u = lx / sx, v = (lz - cz) / sz, r2 = u * u + v * v;
    if (r2 >= 1) return -4 - (Math.sqrt(r2) - 1) * 8;
    const mask = (1 - Math.min(1, Math.max(0, (Math.abs(lx) - cx / 2 - 2) / 6))) * (1 - Math.min(1, Math.abs(lz - 12.5) / 4.5));
    const up = Math.sqrt(1 - r2);
    const crest = N(lx * 0.015 + 4, lz * 0.02) * 5 + Math.sin(lx * 0.06 + N(lx * 0.02, lz * 0.03) * 3) * 1.6;   // lưng cồn cong
    return -4 + H * Math.pow(1 - r2, 0.9) + crest * up * (1 - 0.8 * mask);
  };
  const lo = new THREE.Color(0xb65a32), mid = new THREE.Color(0xd8804c), hi = new THREE.Color(0xf0aa70);
  const m = hillMesh(hh, sx, sz, cz, (c, x, y, z, ny) => {
    c.copy(lo).lerp(mid, smooth01(-4, 14, y)).lerp(hi, smooth01(0.95, 0.75, ny) * 0.0 + smooth01(18, 32, y) * 0.5);
    c.multiplyScalar(0.94 + N(x * 0.6, z * 0.6) * 0.06 + (ny > 0.9 ? 0.04 : -0.04));
  }, rippleTex(), 6, 0.98);
  const hill = new THREE.Group(); hill.add(m);
  const BK = makeBunchKit(GRASS_STYLES[0]), nB = 700, inst = new THREE.InstancedMesh(BK.geos[4], BK.mat, nB), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  let k = 0;
  for (let g = 0; k < nB && g < nB * 8; g++) {
    const lx = (r() - 0.5) * sx * 1.9, lz = cz + (r() - 0.5) * sz * 1.9;
    if ((lx / sx) ** 2 + ((lz - cz) / sz) ** 2 > 0.92 || nearLetters(lx, lz, cx, 1.5) || N(lx * 0.08, lz * 0.08) < -0.1) continue;
    const s = 1.2 + r() * 1.3;
    m4.compose(v3.set(lx, hh(lx, lz) - 0.05, lz), q.setFromEuler(new THREE.Euler(0, r() * 6, 0)), s3.set(s, s * (0.8 + r() * 0.4), s)); inst.setMatrixAt(k++, m4);
  }
  inst.count = k; inst.receiveShadow = true; hill.add(inst);
  return { hill, hillH: hh };
}
function rippleTex() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    const img = ctx.createImageData(w, h), r = mulberry(77);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ph = (y + Math.sin(x / w * Math.PI * 4) * 14 + Math.sin(x / w * Math.PI * 10 + 1) * 5) / (h / 36) * Math.PI * 2;
      const v = 222 + Math.sin(ph) * 20 + Math.pow(Math.max(0, Math.sin(ph + 0.8)), 6) * 22 + (r() - 0.5) * 16, i = (y * w + x) * 4;
      img.data[i] = v; img.data[i + 1] = v * 0.9; img.data[i + 2] = v * 0.84; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, true);
}

// ---- 4: NÚI ĐÁ TẢNG + XƯƠNG RỒNG — đồi đất khô, cụm đá tảng lớn trên sống núi, saguaro đứng rải rác trên sườn
function hillBoulder(cx, seed) {
  const N = makeNoise(seed), r = mulberry(seed), sx = cx * 0.75 + 30, sz = 36, cz = -14, H = 36;
  const hh = (lx, lz) => {
    const u = lx / sx, v = (lz - cz) / sz, r2 = u * u + v * v;
    if (r2 >= 1) return -4 - (Math.sqrt(r2) - 1) * 8;
    const mask = (1 - Math.min(1, Math.max(0, (Math.abs(lx) - cx / 2 - 2) / 6))) * (1 - Math.min(1, Math.abs(lz - 12.5) / 4.5));
    return -4 + H * Math.pow(1 - r2, 0.8) + (N(lx * 0.025 + 3, lz * 0.03) * 5 + N(lx * 0.08, lz * 0.08) * 1.2) * Math.sqrt(1 - r2) * (1 - 0.85 * mask);
  };
  const soil = new THREE.Color(0xd9a878), red = new THREE.Color(0xc07448), grass = new THREE.Color(0xc4b27a);
  const m = hillMesh(hh, sx, sz, cz, (c, x, y, z, ny) => {
    c.copy(soil).lerp(red, smooth01(0.9, 0.6, ny) * 0.7).lerp(grass, Math.max(0, N(x * 0.07, z * 0.07)) * 0.6);
    c.multiplyScalar(0.92 + N(x, z) * 0.08);
  }, farGrassKit().groundTex, 7);
  const hill = new THREE.Group(); hill.add(m);
  scatterFarGrass(hill, hh, { n: 1400, ns: 60, nf: 120, rx: sx, rz: sz, cz, seed: seed + 3, s0: 0.3, s1: 0.65,
    inside: (lx, lz) => (lx / sx) ** 2 + ((lz - cz) / sz) ** 2 < 0.92, skip: (lx, lz) => nearLetters(lx, lz, cx, 1.5),
    patch: (x, z) => Math.max(0, Math.min(1, 0.4 + N(x * 0.07, z * 0.07))) });
  const RK = makeRockKit();
  // cụm đá tảng: mỗi cụm 3–7 tảng chồng nhau, đặt ở nửa trên đồi
  for (let cI = 0, g = 0; cI < 11 && g < 300; g++) {
    const lx = (r() - 0.5) * sx * 1.5, lz = cz + (r() - 0.6) * sz * 1.3;
    if ((lx / sx) ** 2 + ((lz - cz) / sz) ** 2 > 0.6 || nearLetters(lx, lz, cx, 6)) continue;
    const n = 3 + Math.floor(r() * 5);
    for (let j = 0; j < n; j++) {
      const ox = lx + (r() - 0.5) * 7, oz = lz + (r() - 0.5) * 6, s = 1.6 + r() * 3.4, rock = new THREE.Mesh(RK.protos[(cI + j) % RK.protos.length], RK.mat);
      rock.scale.set(s * (0.9 + r() * 0.5), s * (0.75 + r() * 0.5), s * (0.9 + r() * 0.4)); rock.rotation.set(r() * 0.8, r() * 6, r() * 0.8);
      rock.position.set(ox, hh(ox, oz) + s * 0.25 + (j > 2 ? s * 0.6 : 0), oz); rock.receiveShadow = true; hill.add(rock);
    }
    cI++;
  }
  const kit = makeCactusKit();
  for (let k = 0, g = 0; k < 16 && g < 400; g++) {
    const lx = (r() - 0.5) * sx * 1.7, lz = cz + (r() - 0.5) * sz * 1.6;
    if ((lx / sx) ** 2 + ((lz - cz) / sz) ** 2 > 0.8 || nearLetters(lx, lz, cx, 5)) continue;
    const sg = kit.saguaro(lx, lz, 6 + r() * 5, r); sg.position.y = hh(lx, lz) - 0.3; sg.userData.saguaro = false; hill.add(sg); k++;
  }
  return { hill, hillH: hh };
}

function hillSoft(cx, soilMat, seed) {

  // 1k: thầy thấy đồi 1j "quá nhấp nhô" ⇒ đồi MỀM: vòm tròn + sóng đất thoải (không gờ sắc), con vật leo lên hợp lý;
  // phủ cỏ thật (farGrassKit) mọc thành vạt, đất lộ ở chỗ dốc
  const N = makeNoise(seed), r = mulberry(seed), sx = cx * 0.75 + 30, sz = 36, cz = -14, H = 38;
  const hh = (lx, lz) => {
    const u = lx / sx, v = (lz - cz) / sz, r2 = u * u + v * v;
    if (r2 >= 1) return -4 - (Math.sqrt(r2) - 1) * 8;
    const dome = Math.pow(1 - r2, 0.8);
    const inX = 1 - Math.min(1, Math.max(0, (Math.abs(lx) - cx / 2 - 2) / 6)), inZ = 1 - Math.min(1, Math.abs(lz - 12.5) / 4.5), mask = inX * inZ;
    const swell = N(lx * 0.018 + 3, lz * 0.022) * 7 + N(lx * 0.045, lz * 0.05 + 5) * 2.6 + N(lx * 0.12 + 9, lz * 0.12) * 0.6;   // vai đồi, yên ngựa, sống thoải
    const up = Math.sqrt(1 - r2);
    return -4 + H * dome + swell * up * (1 - 0.85 * mask);
  };
  const W = sx * 2, D = sz * 2 * 1.15, geo = new THREE.PlaneGeometry(W, D, 170, 96); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, cz);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, hh(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  // vạt cỏ: nhiễu to (0..1) — dùng CHUNG cho màu đất dưới cỏ và mật độ búi cỏ
  const patch = (x, z) => { const v = N(x * 0.05 + 40, z * 0.06) * 1.1 + N(x * 0.17, z * 0.17 + 9) * 0.4; return Math.max(0, Math.min(1, (v - 0.02) * 2)); };   // 1l: vạt cỏ thưa, đất trống nhiều hơn
  const nr = geo.attributes.normal, col = new Float32Array(p.count * 3), c = new THREE.Color();
  const cSand = new THREE.Color(0xf4d8b8), cRock = new THREE.Color(0xcf9272), cDry = new THREE.Color(0xd8c088), cOlive = new THREE.Color(0xa7a468);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ny = nr.getY(i);
    const steep = Math.min(1, Math.max(0, (0.8 - ny) / 0.35));
    c.copy(cSand).lerp(cRock, steep * 0.7);
    const g = patch(x, z) * (1 - steep * 0.7);
    c.lerp(N(x * 0.05 + 3, z * 0.05) > 0 ? cOlive : cDry, g * 0.55);
    c.multiplyScalar(0.93 + N(x * 0.8, z * 0.8) * 0.08);
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const K = farGrassKit(), gtex = K.groundTex.clone(); gtex.repeat.set(W / 7, D / 7); gtex.needsUpdate = true;
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: gtex, roughness: 1 });
  const hill = new THREE.Group();
  const m = new THREE.Mesh(fixNormals(geo), mat); m.receiveShadow = true; hill.add(m);
  scatterFarGrass(hill, hh, { n: 2600, ns: 70, nf: 320, rx: sx, rz: sz, cz, seed: seed + 5, s0: 0.3, s1: 0.62,
    inside: (lx, lz) => (lx / sx) ** 2 + ((lz - cz) / sz) ** 2 < 0.93,
    skip: (lx, lz) => Math.abs(lz - 12.5) < 3.2 && Math.abs(lx) < cx / 2 + 1.5,   // chân chữ gọn
    patch });
  // đá sa thạch lộ trên sườn dốc
  const RK = makeRockKit();
  for (let k = 0, guard = 0; k < 26 && guard < 400; guard++) {
    const lx = (r() - 0.5) * sx * 1.7, lz = cz + (r() - 0.5) * sz * 1.7;
    if ((lx / sx) ** 2 + ((lz - cz) / sz) ** 2 > 0.8 || (Math.abs(lz - 12.5) < 5 && Math.abs(lx) < cx / 2 + 3)) continue;
    const e = 0.8, sl = Math.abs(hh(lx + e, lz) - hh(lx - e, lz)) + Math.abs(hh(lx, lz + e) - hh(lx, lz - e));
    if (sl < 1.1 && r() < 0.75) continue;
    const rock = new THREE.Mesh(RK.protos[k % RK.protos.length], RK.mat), s = 0.9 + r() * 2.2;
    rock.scale.set(s * (1 + r() * 0.8), s * (0.6 + r() * 0.5), s * (0.8 + r() * 0.6)); rock.rotation.set((r() - 0.5) * 0.3, r() * 6, (r() - 0.5) * 0.3);
    rock.position.set(lx, hh(lx, lz) - 0.25 * s, lz); rock.receiveShadow = true; hill.add(rock); k++;
  }
  return { hill, hillH: hh };
}

// ============================================================ CHỮ KIỂU HOLLYWOOD TRÊN ĐỒI XA
export function createHillSigns(scene, soilMat) {
  const TEXTS = ["ANDREW CLASSES", "NO HOMEWORK - NO FUN"];
  const Z = -215, LETTER_H = 6;
  let font = null, idx = 0, cur = null, nextAt = null, extra = null;
  new FontLoader().load("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/fonts/helvetiker_bold.typeface.json", f => { font = f; }, undefined, () => { font = "fail"; });
  const letterMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.55, metalness: 0.1 });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2c, roughness: 0.9 });
  function build(text, x) {
    const g = new THREE.Group(), r = mulberry(text.length * 7 + idx);
    const chars = [...text];
    let cx = 0; const glyphs = [];
    for (const ch of chars) {
      if (ch === " ") { cx += LETTER_H * 0.55; continue; }
      let geo;
      if (font && font !== "fail") { geo = fixNormals(new TextGeometry(ch, { font, size: LETTER_H, depth: 0.5, curveSegments: 6, bevelEnabled: false })); geo.computeBoundingBox(); }
      else { geo = new THREE.BoxGeometry(LETTER_H * 0.7, LETTER_H, 0.5); geo.translate(LETTER_H * 0.35, LETTER_H / 2, 0); geo.computeBoundingBox(); }
      const bb = geo.boundingBox, lw = (bb.max.x - bb.min.x) * 0.82;
      const m = new THREE.Mesh(geo, letterMat); m.scale.x = 0.82; m.castShadow = true; m.receiveShadow = true;
      m.position.set(cx - bb.min.x * 0.82, (r() - 0.5) * 0.8, 0); m.rotation.set(-0.12 + (r() - 0.5) * 0.05, (r() - 0.5) * 0.06, (r() - 0.5) * 0.05);
      m.userData.w = lw; g.add(m); glyphs.push(m);
      // giàn chống phía sau
      // cột chống: chỉ nửa dưới chữ, đứng thẳng ngay SAU chữ (bị chữ che, không đè lên chữ)
      for (const px of [0.3, 0.7]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, LETTER_H * 0.5, 6), poleMat); pole.position.set(m.position.x + lw * px, LETTER_H * 0.25 - 0.3, -0.75); g.add(pole); }
      cx += lw + LETTER_H * 0.2;
    }
    g.children.forEach(o => { o.position.x -= cx / 2; });
    // đồi đỡ chữ: gò đất thoai thoải cùng màu nền
    const { hill, hillH } = ruggedHill(cx, soilMat, text.length * 13 + idx);
    const signs = new THREE.Group(); signs.add(hill);
    g.position.set(0, 17, 12); signs.add(g);
    signs.position.set(x + cx / 2, 0, Z);
    signs.userData.width = cx; signs.userData.glyphs = glyphs; signs.userData.hill = hill; signs.userData.hillH = hillH; signs.userData.letters = g;
    scene.add(signs);
    return signs;
  }
  // bụi tung khi chữ đổ
  const dustTex = canvasTexture(64, 64, (ctx) => { const gr = ctx.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = gr; ctx.fillRect(0, 0, 64, 64); });
  const falling = [], puffs = [];
  let lastT = performance.now();
  function step() {
    const now = performance.now(), dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    for (let i = falling.length - 1; i >= 0; i--) {
      const f = falling[i], m = f.m;
      f.w += 3.2 * Math.sin(m.rotation.x) * dt + 0.5 * dt;         // mô-men trọng lực: càng nghiêng càng đổ nhanh
      m.rotation.x += f.w * dt;
      if (m.rotation.x >= f.end) {
        m.rotation.x = f.end;
        if (Math.abs(f.w) > 0.6) { f.w = -f.w * 0.28; dust(f); } else { falling.splice(i, 1); }
      }
    }
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i]; p.t += dt; const k = p.t / p.life;
      p.s.position.addScaledVector(p.v, dt); p.s.scale.setScalar(p.s0 * (1 + k * 2.5)); p.s.material.opacity = 0.75 * (1 - k);
      if (k >= 1) { p.s.parent && p.s.parent.remove(p.s); p.s.material.dispose(); puffs.splice(i, 1); }
    }
  }
  function dust(f) {
    const wp = new THREE.Vector3(); f.m.getWorldPosition(wp);
    for (let k = 0; k < 10; k++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, color: 0xd6b48a, transparent: true, depthWrite: false, opacity: 0.75 }));
      s.position.set(wp.x + f.wd * (0.2 + Math.random()), wp.y + 0.4, wp.z + 1 + Math.random() * 3); scene.add(s);
      puffs.push({ s, t: 0, life: 1.6 + Math.random(), s0: 1.2 + Math.random(), v: new THREE.Vector3((Math.random() - 0.5) * 3, 0.8 + Math.random() * 1.2, (Math.random() - 0.3) * 2) });
    }
  }
  return {
    // bảng chữ đang hiện (hoặc null)
    current() { return cur && cur.userData.glyphs ? cur : null; },
    // húc đổ chữ thứ i về phía trước (về phía máy quay)
    knock(i) {
      if (!cur) return false;
      const m = cur.userData.glyphs[i]; if (!m || m.userData.down) return false;
      m.userData.down = true;
      falling.push({ m, w: 1.1, end: 1.42 + (Math.random() - 0.5) * 0.12, wd: m.userData.w || 3 });
      dust({ m, wd: m.userData.w || 3 });
      return true;
    },
    // 1q: màn chờ — hiện CẢ HAI bảng chữ cạnh nhau (bảng thứ hai đặt bên trái bảng chính)
    showBoth() {
      if (!font || !cur || extra) return !!extra;
      const text = TEXTS[idx % TEXTS.length];
      extra = build(text, 0);
      extra.position.x = cur.position.x - cur.userData.width / 2 - 34 - extra.userData.width / 2;
      return true;
    },
    dropExtra() { if (!extra) return; scene.remove(extra); extra.traverse(o => { if (o.geometry && o.geometry.type !== "SphereGeometry") o.geometry.dispose(); }); extra = null; },
    get extra() { return extra; },
    update(camX, halfFar) {
      step();
      if (!font) return;
      if (!cur) {
        const x = nextAt == null ? camX + 10 : Math.max(nextAt, camX + halfFar + 20);
        cur = build(TEXTS[idx % TEXTS.length], x); idx++;
      } else if (cur.position.x + cur.userData.width / 2 + 45 < camX - halfFar) {
        scene.remove(cur); cur.traverse(o => { if (o.geometry && o.geometry.type !== "SphereGeometry") o.geometry.dispose(); });
        cur = null; nextAt = camX + halfFar + 90;   // bảng sau hiện một lát sau khi bảng trước đã qua
      }
    },
  };
}

// ============================================================ LẠC ĐÀ chạy ra xem tàu
export function createCamel(scene) {
  const tan = new THREE.MeshStandardMaterial({ color: 0xc39463, roughness: 0.95 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x5a3d26, roughness: 0.95 });
  const g = new THREE.Group();
  const add = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const body = new THREE.Group(); body.position.y = 1.75; g.add(body);
  add(new THREE.SphereGeometry(1, 24, 16), tan, body, 0, 0, 0).scale.set(1.25, 0.62, 0.55);
  add(new THREE.SphereGeometry(0.62, 20, 14), tan, body, -0.05, 0.5, 0).scale.set(1.15, 0.95, 0.8);   // bướu
  // cổ + đầu
  const neck = new THREE.Group(); neck.position.set(1.05, 0.15, 0); body.add(neck);
  const nk = add(new THREE.CylinderGeometry(0.17, 0.26, 1.25, 12), tan, neck, 0.35, 0.35, 0); nk.rotation.z = -0.75;
  const head = new THREE.Group(); head.position.set(0.72, 0.85, 0); neck.add(head);
  add(new THREE.SphereGeometry(0.22, 16, 12), tan, head, 0.15, 0, 0).scale.set(1.9, 0.9, 0.85);
  add(new THREE.SphereGeometry(0.05, 8, 6), dark, head, 0.18, 0.1, 0.15);
  add(new THREE.SphereGeometry(0.05, 8, 6), dark, head, 0.18, 0.1, -0.15);
  add(new THREE.ConeGeometry(0.05, 0.14, 6), tan, head, -0.05, 0.2, 0.1);
  add(new THREE.ConeGeometry(0.05, 0.14, 6), tan, head, -0.05, 0.2, -0.1);
  const tail = add(new THREE.CylinderGeometry(0.04, 0.02, 0.6, 6), dark, body, -1.25, -0.1, 0); tail.rotation.z = 0.5;
  // 4 chân: đùi + ống chân có khớp gối
  const legs = [];
  for (const [lx, lz] of [[0.75, 0.28], [0.75, -0.28], [-0.8, 0.28], [-0.8, -0.28]]) {
    const hip = new THREE.Group(); hip.position.set(lx, -0.25, lz); body.add(hip);
    add(new THREE.CylinderGeometry(0.12, 0.09, 0.8, 8), tan, hip, 0, -0.4, 0);
    const knee = new THREE.Group(); knee.position.y = -0.8; hip.add(knee);
    add(new THREE.CylinderGeometry(0.075, 0.06, 0.72, 8), tan, knee, 0, -0.36, 0);
    add(new THREE.SphereGeometry(0.1, 8, 6), dark, knee, 0.03, -0.72, 0).scale.set(1.4, 0.5, 1.1);
    legs.push({ hip, knee, side: lz > 0 ? 0 : Math.PI });
  }
  g.visible = false; g.scale.setScalar(1.15);
  scene.add(g);
  let st = "wait", t = 0, wait = 14 + Math.random() * 10, dir = 1, stopX = 0, speed = 0, phase = 0;
  return {
    update(dt, camX, trainX) {
      t += dt;
      if (st === "wait") { if (t > wait) { st = "enter"; t = 0; dir = Math.random() < 0.5 ? 1 : -1; g.position.set(camX - dir * 34, 0, -16 - Math.random() * 10); stopX = camX + (Math.random() - 0.5) * 16; g.visible = true; speed = 5.5; } return; }
      let moving = true;
      if (st === "enter") { g.position.x += dir * speed * dt; g.rotation.y = dir > 0 ? 0 : Math.PI; if ((stopX - g.position.x) * dir <= 0) { st = "watch"; t = 0; } }
      else if (st === "watch") {
        moving = false;
        // quay mặt về phía đoàn tàu (trục +x của mô hình là hướng mặt)
        const want = Math.atan2(g.position.z, trainX - g.position.x);
        let d = want - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
        g.rotation.y += d * Math.min(1, dt * 2);
        if (t > 5 + Math.random() * 0.02) { st = "leave"; t = 0; dir = Math.random() < 0.5 ? 1 : -1; }
      } else if (st === "leave") {
        g.position.x += dir * 6.5 * dt; g.position.z -= 2.6 * dt;
        g.rotation.y += ((dir > 0 ? 0.35 : Math.PI - 0.35) - g.rotation.y) * Math.min(1, dt * 3);
        if (Math.abs(g.position.x - camX) > 60 || t > 12) { st = "wait"; t = 0; wait = 35 + Math.random() * 30; g.visible = false; }
      }
      // dáng chạy: đùi vung, gối gập, thân nhún; đứng xem thì đầu gật nhẹ
      phase += dt * (moving ? 9 : 0);
      for (const L of legs) {
        const a = moving ? Math.sin(phase + L.side) : 0;
        L.hip.rotation.z = a * 0.55; L.knee.rotation.z = moving ? -Math.max(0, Math.sin(phase + L.side + 1.2)) * 0.9 : 0;
      }
      body.position.y = 1.75 + (moving ? Math.abs(Math.sin(phase)) * 0.1 : 0);
      neck.rotation.z = moving ? Math.sin(phase * 2) * 0.06 : Math.sin(t * 2) * 0.05 + 0.1;
      head.rotation.z = moving ? 0 : Math.sin(t * 1.3) * 0.12;
    },
  };
}

// ============================================================ ĐÀN CHIM đuổi nhau, đôi khi có ĐẠI BÀNG rượt (1e: bay LIỀN MẠCH)
// Mỗi con có vị trí + VẬN TỐC thật; lái mượt về phía điểm đích (con đầu đàn đi theo đường cong êm, các con khác bám
// theo vị trí xoay vòng quanh con đầu ⇒ vượt nhau, tụt lại). Hướng thân quay theo vận tốc đã làm mượt ⇒ không giật, không nháy.
// Đại bàng lái về con mồi, đổi mồi từ từ (không nhảy chỗ).
export function createBirdFlocks(scene) {
  const small = new THREE.MeshStandardMaterial({ color: 0x2c2420, roughness: 1, side: THREE.DoubleSide });
  const eagleMat = new THREE.MeshStandardMaterial({ color: 0x3b2716, roughness: 1, side: THREE.DoubleSide });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 1 });
  const wingGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0.25), new THREE.Vector3(0, 0, -0.35), new THREE.Vector3(0.35, 0.05, -0.1), new THREE.Vector3(1.6, 0.1, -0.35)]);
  wingGeo.setIndex([0, 1, 2, 0, 2, 3]); wingGeo.computeVertexNormals();
  const UP = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3(), des = new THREE.Vector3(), m4 = new THREE.Matrix4(), qT = new THREE.Quaternion();
  function bird(eagle) {
    const g = new THREE.Group(), mat = eagle ? eagleMat : small;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), mat); b.scale.set(1, 0.8, 2.4); g.add(b);
    if (eagle) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), white); h.position.z = 0.55; g.add(h); const t = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 6), white); t.rotation.x = -Math.PI / 2; t.position.z = -0.7; g.add(t); }
    const l = new THREE.Mesh(wingGeo, mat), r = new THREE.Mesh(wingGeo, mat); r.scale.x = -1; g.add(l, r);
    g.userData = { l, r, ph: Math.random() * 6 };
    g.scale.setScalar(eagle ? 2.4 : 1.1);
    scene.add(g); return g;
  }
  // lái: gia tốc về phía đích, giới hạn tốc độ; hướng thân nội suy cầu (slerp) theo vận tốc
  function steer(o, target, maxSpeed, accel, dt) {
    des.subVectors(target, o.pos);
    const dist = des.length(); if (dist > 1e-4) des.multiplyScalar(Math.min(maxSpeed, dist * 1.5) / dist);
    tmp.subVectors(des, o.vel); const a = tmp.length(); if (a > accel * dt) tmp.multiplyScalar(accel * dt / a);
    o.vel.add(tmp);
    o.pos.addScaledVector(o.vel, dt);
    o.m.position.copy(o.pos);
    if (o.vel.lengthSq() > 0.01) {
      m4.lookAt(tmp.set(0, 0, 0), tmp.clone().sub(o.vel), UP);   // trục +z mô hình = hướng bay
      qT.setFromRotationMatrix(m4);
      o.m.quaternion.slerp(qT, Math.min(1, dt * 5));
    }
  }
  let flock = null, wait = 2 + Math.random() * 2, t = 0;   // 1q: đàn chim ra sớm cho màn chờ
  function spawn(camX) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const n = 6 + Math.floor(Math.random() * 6);
    const lead = new THREE.Vector3(camX - dir * 150, 45 + Math.random() * 15, -130 - Math.random() * 60);
    flock = { dir, t: 0, lead, birds: [], eagle: null, prey: 0, preyT: 0 };
    for (let i = 0; i < n; i++) {
      const m = bird(false), pos = lead.clone().add(new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 10));
      m.position.copy(pos);
      flock.birds.push({ m, pos, vel: new THREE.Vector3(dir * 12, 0, 0), off: new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 8), sp: 0.4 + Math.random() * 0.6, k: Math.random() * 6 });
    }
    if (Math.random() < 0.5) { const m = bird(true), pos = lead.clone().add(new THREE.Vector3(-dir * 22, 6, 0)); m.position.copy(pos); flock.eagle = { m, pos, vel: new THREE.Vector3(dir * 14, 0, 0) }; }
  }
  const goal = new THREE.Vector3();
  return {
    update(dt, time, camX) {
      if (!flock) { t += dt; if (t > wait) { t = 0; spawn(camX); } return; }
      const F = flock; F.t += dt;
      const speed = F.eagle ? 15 : 11;
      // con đầu đàn: đường cong êm (vận tốc đổi chậm)
      F.lead.x += F.dir * speed * dt; F.lead.y += Math.sin(F.t * 0.5) * 2.2 * dt; F.lead.z += Math.cos(F.t * 0.37) * 3 * dt;
      for (const b of F.birds) {
        goal.set(Math.sin(F.t * b.sp + b.k) * 6 + b.off.x, Math.cos(F.t * b.sp * 1.2 + b.k) * 2.5 + b.off.y, Math.sin(F.t * b.sp * 0.8 + b.k * 2) * 4 + b.off.z);
        if (F.eagle) goal.multiplyScalar(0.8);
        goal.add(F.lead);
        steer(b, goal, speed * 1.5, 18, dt);
        const f = Math.sin(time * 13 + b.m.userData.ph) * 0.7; b.m.userData.l.rotation.z = f; b.m.userData.r.rotation.z = -f;
      }
      if (F.eagle) {
        F.preyT += dt; if (F.preyT > 4) { F.preyT = 0; F.prey = (F.prey + 1 + Math.floor(Math.random() * 2)) % F.birds.length; }
        const prey = F.birds[F.prey];
        goal.copy(prey.pos).add(tmp.set(-F.dir * 4, 2.5 + Math.sin(F.t * 1.3) * 1.5, 0));
        steer(F.eagle, goal, speed * 1.35, 10, dt);
        const f = Math.sin(time * 6 + 1) * 0.45; F.eagle.m.userData.l.rotation.z = f; F.eagle.m.userData.r.rotation.z = -f;
      }
      if (Math.abs(F.lead.x - camX) > 200 && F.t > 5) {
        [...F.birds.map(b => b.m), F.eagle && F.eagle.m].filter(Boolean).forEach(m => { scene.remove(m); m.traverse(o => { if (o.geometry && o.geometry !== wingGeo) o.geometry.dispose(); }); });
        flock = null; wait = 20 + Math.random() * 22;
      }
    },
  };
}

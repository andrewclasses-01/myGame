# -*- coding: utf-8 -*-
"""
Sinh ĐỊA HÌNH cho MẪU 4d (Rocket Race — thầy 26/9/2026: "bản đồ thiết kế lại để thực sự giống ảnh nhà xưởng SpaceX").
Bố cục theo ảnh (máy quay ở TÂY NAM, nhìn về BẮC):
  tiền cảnh trái = nhà xưởng lớn (3D) · phải = đường + BÃI XE + nhà mái bằng · giữa trái = đồng cỏ rào trắng + đường VÒNG
  xa = rừng bụi xanh thẫm kiểu Florida, ĐẦM NƯỚC xanh dài · xa phải = DỐC bê tông chạy chéo lên GÒ BỆ PHÓNG (gốc toạ độ) · chân trời = biển.
Mọi lớp là hàm theo TOẠ ĐỘ THẾ GIỚI (x → đông, z → nam), tấm toàn cảnh và tấm chi tiết khớp nhau.

Ra (rocket-race/assets/4d/):
  terrain-albedo.jpg  4096²  phủ [-400, 400]²
  terrain-normal.jpg  2048²  phủ [-400, 400]²
  terrain-mask.png    1024²  phủ [-400, 400]²   R nước · G cách bờ (0 → 1 ở 30 đv) · B biển(255)/đầm(0)
  site-albedo.jpg     6144²  phủ x[-150, 40] × z[-50, 140]   (nhà xưởng, bãi xe, dốc, gò bệ, đường vòng, rào)
Chạy:  python tools/tao-dia-hinh-4d.py      (~6–8 phút)
⚠️ Toạ độ công trình ở rocket-race/assets/4d/layout.json — dùng chung với rocket-race/core/launch-aerial-d.js — sửa một bên phải sửa bên kia.
"""
import os, math, json
import numpy as np
from scipy.ndimage import map_coordinates, gaussian_filter, distance_transform_edt
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "rocket-race", "assets", "4d")
DST = os.path.join(OUT, "quick") if os.environ.get("QUICK") else OUT      # QUICK=1: bản nháp nhỏ để soát bố cục
os.makedirs(DST, exist_ok=True)
rng = np.random.default_rng(20260927)
LAT = [rng.random((256, 256)).astype(np.float32) for _ in range(16)]
L = json.load(open(os.path.join(OUT, "layout.json"), encoding="utf-8"))      # bố cục dùng chung với launch-aerial-d.js


def vn(x, z, f, k):
    g = LAT[k % len(LAT)]
    return map_coordinates(g, [(z * f) % 256, (x * f) % 256], order=3, mode="grid-wrap").astype(np.float32)


def fbm(x, z, f, octs, k, gain=0.5):
    s = np.zeros_like(x); a = 1.0; tot = 0.0
    for i in range(octs):
        s += a * vn(x + 13.1 * i, z - 7.7 * i, f * (2.03 ** i), k + i); tot += a; a *= gain
    return s / tot


def smooth(a, b, v):
    t = np.clip((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def mix(c0, c1, t):
    t = np.asarray(t)[..., None]; return c0 * (1 - t) + c1 * t


def C(*rgb):
    return np.array(rgb, dtype=np.float32)


def rbox(x, z, x0, x1, z0, z1):
    """khoảng cách tới hình chữ nhật (âm bên trong)"""
    dx = np.maximum(np.maximum(x0 - x, x - x1), 0); dz = np.maximum(np.maximum(z0 - z, z - z1), 0)
    return np.sqrt(dx * dx + dz * dz) + np.maximum(np.maximum(x0 - x, x - x1), np.maximum(z0 - z, z - z1)).clip(max=0)


def seg_dist(x, z, a, b):
    ax, az = a; bx, bz = b; vx, vz = bx - ax, bz - az; L2 = vx * vx + vz * vz
    t = np.clip(((x - ax) * vx + (z - az) * vz) / L2, 0, 1)
    return np.hypot(x - (ax + vx * t), z - (az + vz * t))


# ----------------------------------------------------------------------------------------------
def fields(x, z):
    F = {}
    w1 = fbm(x, z, 0.006, 3, 0) - 0.5; w2 = fbm(x, z, 0.006, 3, 3) - 0.5
    xw, zw = x + w1 * 22, z + w2 * 22
    F["coast"] = (xw * 0.55 - zw * 0.835) - 95 + (fbm(x, z, 0.02, 2, 6) - 0.5) * 5
    # ĐẦM NƯỚC dài (như ảnh: dải nước xanh giữa rừng bụi, lớn dần về phía tây)
    lake = np.full_like(x, -1e3)
    for cx, cz, rx, rz, ang in L["lakes"]:
        a = math.radians(ang); u = (xw - cx) * math.cos(a) + (zw - cz) * math.sin(a); v = -(xw - cx) * math.sin(a) + (zw - cz) * math.cos(a)
        d = (np.sqrt((u / rx) ** 2 + (v / rz) ** 2) - 1) * min(rx, rz)
        lake = np.maximum(lake, -d)
    F["lake"] = lake + (fbm(x, z, 0.05, 3, 8) - 0.5) * 5
    # ĐỒNG CỎ mở (khu công ty + bãi rào + hành lang dốc + gò bệ) — ngoài là rừng bụi
    d = np.full_like(x, 1e3)
    for x0, x1, z0, z1 in L["fields"]:
        d = np.minimum(d, rbox(x, z, x0, x1, z0, z1))
    d = np.minimum(d, seg_dist(x, z, L["ramp"][0], L["ramp"][1]) - 17)
    F["open"] = 1 - smooth(-2, 5, d + (fbm(x, z, 0.06, 3, 50) - 0.5) * 9)
    F["canopy"] = fbm(x, z, 0.35, 4, 20)          # tán cây (vân lồi lõm)
    F["clump"] = fbm(x, z, 0.09, 4, 22)
    F["dens"] = fbm(x, z, 0.02, 4, 52)
    F["veg2"] = fbm(x, z, 0.5, 3, 36)
    F["big"] = fbm(x, z, 0.012, 4, 40)
    F["grain"] = fbm(x, z, 1.6, 2, 44)
    F["grain2"] = fbm(x, z, 4.0, 2, 46)
    F["trail"] = 1 - np.abs(fbm(x, z, 0.03, 4, 58) * 2 - 1)
    return F


def height(F):
    s = F["coast"]
    veg = (1 - F["open"]) * (1 - smooth(-12, -4, s))
    h = veg * (0.25 + smooth(0.35, 0.8, F["canopy"]) * 0.9 + F["clump"] * 0.5)
    h = np.where((s > 0) | (F["lake"] > 0), 0, h)
    return h


def albedo(x, z, F):
    s = F["coast"]; n = F["grain"]; lake = F["lake"]
    # ---- rừng bụi Florida: xanh thẫm, tán cây lốm đốm, mảng cọ bụi sáng hơn ----
    dark = mix(C(0.075, 0.13, 0.06), C(0.13, 0.20, 0.08), smooth(0.3, 0.7, F["canopy"]))
    mid = mix(C(0.17, 0.25, 0.10), C(0.27, 0.33, 0.15), smooth(0.4, 0.7, F["veg2"]))
    scrub = mix(dark, mid, smooth(0.45, 0.62, F["clump"]) * 0.8)
    scrub = mix(scrub, C(0.33, 0.35, 0.20), smooth(0.7, 0.85, F["dens"]) * 0.5)       # vùng khô
    scrub = scrub * (0.82 + 0.36 * F["grain2"][..., None])
    # ---- đồng cỏ: xanh ngả vàng, loang theo vùng, vệt máy cắt ----
    stripe = (np.sin((x * 0.906 - z * 0.423) * 1.1 + (F["big"] - 0.5) * 3) > 0).astype(np.float32)
    grass = mix(C(0.36, 0.46, 0.18), C(0.46, 0.52, 0.25), smooth(0.3, 0.75, F["dens"]))
    grass = mix(grass, C(0.55, 0.54, 0.34), smooth(0.68, 0.85, F["veg2"]) * 0.45)        # cỏ úa
    grass = grass * (0.93 + 0.07 * stripe[..., None]) * (0.92 + 0.16 * n[..., None])
    col = mix(scrub, grass, F["open"])
    # lối mòn đất xuyên rừng
    col = mix(col, C(0.55, 0.50, 0.40), smooth(0.992, 0.998, F["trail"]) * smooth(0.55, 0.7, F["dens"]) * (1 - F["open"]) * 0.6)
    # ---- bãi biển ----
    dry = smooth(-10, -3, s); wet = smooth(-2.5, -0.5, s)
    col = mix(col, C(0.86, 0.81, 0.69) * (0.95 + 0.1 * n[..., None]), dry)
    col = mix(col, C(0.62, 0.58, 0.50), wet * 0.9)
    # ---- biển: xanh lơ gần bờ → xanh dương thẫm ----
    sea = mix(C(0.30, 0.55, 0.62), C(0.10, 0.32, 0.52), smooth(0, 40, s))
    sea = mix(sea, C(0.07, 0.24, 0.44), smooth(40, 160, s))
    foam = np.zeros_like(s); t = x * 0.835 + z * 0.55
    for d_, w, a in [(0.7, 1.1, 0.9), (4.0, 0.9, 0.6), (9, 1.4, 0.4)]:
        brk = smooth(0.3, 0.55, fbm(t * 0.25 + d_ * 31, s * 1.5, 0.08, 3, 60 + int(d_)))
        foam = np.maximum(foam, a * np.exp(-((s - d_) / w) ** 2) * brk)
    sea = mix(sea, C(0.9, 0.93, 0.92), np.clip(foam, 0, 1))
    col = np.where((s > 0)[..., None], sea, col)
    # ---- đầm: xanh dương phản trời, mép nông, viền bùn cỏ ----
    rim = smooth(-4, 0, lake) * (lake <= 0) * (s <= -3)
    col = mix(col, C(0.34, 0.38, 0.24), rim * 0.8)
    lw = mix(C(0.26, 0.44, 0.52), C(0.16, 0.36, 0.58), smooth(0, 6, lake))
    lw = lw * (0.96 + 0.08 * F["grain"][..., None])
    isLake = (lake > 0) & (s <= 0)
    col = np.where(isLake[..., None], lw, col)
    water = (s > 0) | isLake
    return np.clip(col, 0, 1), water


def shade(h, px_units, sun, k=0.6):
    gz, gx = np.gradient(h, px_units)
    nx, ny, nz = -gx, np.ones_like(h), -gz
    Ln = np.sqrt(nx * nx + ny * ny + nz * nz); nx /= Ln; ny /= Ln; nz /= Ln
    sv = np.array(sun, dtype=np.float32); sv /= np.linalg.norm(sv)
    d = nx * sv[0] + ny * sv[1] + nz * sv[2]
    return 1 + k * (d - sv[1]), (nx, ny, nz)


SUN = L["sun"]


def save_jpg(a, path, q=90):
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(path, quality=q, optimize=True)
    print("  ", os.path.basename(path), os.path.getsize(path) // 1024, "KB", flush=True)


def render_tile(x0, x1, z0, z1, N, strip=768):
    """albedo + nước + độ cao cho một tấm, tính theo DẢI hàng cho đỡ RAM"""
    xs = x0 + (np.arange(N, dtype=np.float32) + 0.5) / N * (x1 - x0)
    zs = z0 + (np.arange(N, dtype=np.float32) + 0.5) / N * (z1 - z0)
    col = np.zeros((N, N, 3), np.float32); water = np.zeros((N, N), bool); h = np.zeros((N, N), np.float32); sea = np.zeros((N, N), bool)
    for r0 in range(0, N, strip):
        r1 = min(N, r0 + strip)
        X, Z = np.meshgrid(xs, zs[r0:r1])
        F = fields(X, Z)
        c, w = albedo(X, Z, F)
        col[r0:r1] = c; water[r0:r1] = w; h[r0:r1] = height(F); sea[r0:r1] = F["coast"] > 0
        print(f"   dải {r1}/{N}", flush=True)
    return col, water, h, sea


# ----------------------------------------------------------------------------------------------
print("toàn cảnh 4096² …", flush=True)
EXT = 400.0; N = 1024 if os.environ.get("QUICK") else 4096; px = 2 * EXT / N
col, water, h, sea = render_tile(-EXT, EXT, -EXT, EXT, N)
sh, _ = shade(gaussian_filter(h, 1.0), px, SUN)
col = col * np.where(water, 1, sh)[..., None]
save_jpg(col, os.path.join(DST, "terrain-albedo.jpg"), 88)
hN = h[::2, ::2]
_, (nx, ny, nz) = shade(gaussian_filter(hN, 0.8), px * 2, SUN)
wN = water[::2, ::2]
nx = np.where(wN, 0, nx); nz = np.where(wN, 0, nz); ny = np.where(wN, 1, ny)
save_jpg(np.stack([nx * 0.5 + 0.5, -nz * 0.5 + 0.5, ny * 0.5 + 0.5], -1), os.path.join(DST, "terrain-normal.jpg"), 90)
wm = water[::4, ::4]
dist = distance_transform_edt(wm) * (px * 4)
mask = np.stack([wm.astype(np.float32), np.clip(dist / 30, 0, 1), sea[::4, ::4].astype(np.float32)], -1)
Image.fromarray((mask * 255).astype(np.uint8)).save(os.path.join(DST, "terrain-mask.png"), optimize=True)
print("   terrain-mask.png", flush=True)
del col, water, h, sea, sh, nx, ny, nz

# ----------------------------------------------------------------------------------------------
X0, X1, Z0, Z1 = L["tile"]
N2 = 1024 if os.environ.get("QUICK") else L["tileN"]
print(f"tấm chi tiết {N2}² …", flush=True)
col, water, h, sea = render_tile(X0, X1, Z0, Z1, N2)
sh, _ = shade(gaussian_filter(h, 2), (X1 - X0) / N2, SUN)
col = col * np.where(water, 1, sh)[..., None]
del h, sea, sh
img = Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8)); del col
PX = N2 / (X1 - X0)
def P(wx, wz): return ((wx - X0) * PX, (wz - Z0) * PX)
d = ImageDraw.Draw(img, "RGBA")

HC = L["hangar"]["c"]; ANG = math.radians(L["hangar"]["ang"])
U = (math.sin(ANG), -math.cos(ANG)); Nn = (math.cos(ANG), math.sin(ANG))    # trục dọc nhà xưởng · pháp tuyến mặt có chữ
def H(u, n): return (HC[0] + U[0] * u + Nn[0] * n, HC[1] + U[1] * u + Nn[1] * n)

def poly(pts, fill): d.polygon([P(*p) for p in pts], fill=fill)
def quad_un(u0, u1, n0, n1): return [H(u0, n0), H(u1, n0), H(u1, n1), H(u0, n1)]

def slab_poly(pts, base, seam=None, dirt=True):
    poly(pts, base + (255,))
    if dirt:
        xs = [p[0] for p in pts]; zs = [p[1] for p in pts]
        for _ in range(int((max(xs) - min(xs)) * (max(zs) - min(zs)) / 5)):
            cx_, cz_ = rng.uniform(min(xs), max(xs)), rng.uniform(min(zs), max(zs)); rr = rng.uniform(0.3, 1.4)
            d.ellipse([P(cx_ - rr, cz_ - rr * 0.6), P(cx_ + rr, cz_ + rr * 0.6)], fill=(60, 58, 55, int(rng.integers(6, 20))))

def road(pts, w=2.6, center=False, edge=True, col=(74, 76, 79)):
    pp = [P(*p) for p in pts]
    d.line(pp, fill=col + (255,), width=int(w * PX), joint="curve")
    for p in pp: d.ellipse([p[0] - w * PX / 2, p[1] - w * PX / 2, p[0] + w * PX / 2, p[1] + w * PX / 2], fill=col + (255,))
    if edge:
        for side in (-1, 1):
            for i in range(len(pts) - 1):
                (ax, az), (bx, bz) = pts[i], pts[i + 1]
                Lg = math.hypot(bx - ax, bz - az) or 1; nx_, nz_ = -(bz - az) / Lg, (bx - ax) / Lg; o = side * (w / 2 - 0.2)
                d.line([P(ax + nx_ * o, az + nz_ * o), P(bx + nx_ * o, bz + nz_ * o)], fill=(228, 228, 220, 210), width=max(2, int(0.11 * PX)))
    if center:
        for i in range(len(pts) - 1):
            (ax, az), (bx, bz) = pts[i], pts[i + 1]; Lg = math.hypot(bx - ax, bz - az); k = 0
            while k < Lg:
                t0, t1 = k / Lg, min(1, (k + 1.2) / Lg)
                d.line([P(ax + (bx - ax) * t0, az + (bz - az) * t0), P(ax + (bx - ax) * t1, az + (bz - az) * t1)], fill=(232, 196, 70, 230), width=max(2, int(0.12 * PX)))
                k += 3

def fence(pts):
    d.line([P(*p) for p in pts], fill=(240, 240, 234, 235), width=max(2, int(0.13 * PX)))
    for i in range(len(pts) - 1):
        (ax, az), (bx, bz) = pts[i], pts[i + 1]; Lg = math.hypot(bx - ax, bz - az); k = 0
        while k < Lg:
            u = k / Lg; c = P(ax + (bx - ax) * u, az + (bz - az) * u); r = 0.14 * PX
            d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=(250, 250, 246, 240)); k += 2.2

def arc(cx, cz, r, a0, a1, n=48):
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cz + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]

def lerp2(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)

hw, hd = L["hangar"]["w"] / 2, L["hangar"]["d"] / 2
# ---- nền bê tông quanh nhà xưởng + sân trước cửa lớn (đầu hồi gần máy quay) ----
slab_poly(quad_un(-hw - 16, hw + 5, -hd - 5, hd + 9), (168, 167, 162))
slab_poly(quad_un(-hw - 16, -hw, -hd - 2, hd + 2), (150, 149, 144))
# ---- đường trước mặt có chữ, chạy dọc nhà xưởng rồi rẽ về phía máy quay ----
for r in L["roads"]:
    road([tuple(p) for p in r["pts"]], r.get("w", 2.6), r.get("center", False))
# ---- DỐC bê tông lên gò bệ: 2 làn sáng + dải cỏ giữa + vệt bánh xích ----
A, B = L["ramp"]
ax_, az_ = A; bx_, bz_ = B; Lr = math.hypot(bx_ - ax_, bz_ - az_); ru = ((bx_ - ax_) / Lr, (bz_ - az_) / Lr); rn = (-ru[1], ru[0])
def R_(t, o): return (ax_ + ru[0] * t + rn[0] * o, az_ + ru[1] * t + rn[1] * o)
for o0, o1, c in [(-9.5, -3.2, (214, 211, 202)), (-1.6, 4.8, (214, 211, 202))]:
    slab_poly([R_(0, o0), R_(Lr, o0), R_(Lr, o1), R_(0, o1)], c)
    for k in np.arange(0, Lr, 3.2): d.line([P(*R_(k, o0)), P(*R_(k, o1))], fill=(170, 168, 160, 90), width=max(2, int(0.06 * PX)))
    for oo in (o0 + 1.2, o1 - 1.2): d.line([P(*R_(0, oo)), P(*R_(Lr, oo))], fill=(150, 146, 136, 70), width=int(0.5 * PX))
road([R_(-4, 9), R_(Lr - 3, 9), (m_x0 := L['mound']['x0'] - 2, B[1] + 14)], 3)              # đường chạy dọc bên dốc
# ---- bãi xe (khung theo trục nhà xưởng) ----
pk = L["parking"]; u0, u1, n0, n1 = pk["u0"], pk["u1"], pk["n0"], pk["n1"]
slab_poly(quad_un(u0, u1, n0, n1), (84, 86, 89))
for row in pk["rows"]:
    nn = row["n"]; up = row["dir"] > 0
    k = u0 + 1.0
    while k < u1 - 1.5:
        d.line([P(*H(k, nn)), P(*H(k, nn + (pk["depth"] if up else -pk["depth"])))], fill=(232, 232, 226, 225), width=max(2, int(0.1 * PX)))
        k += pk["slot"]
    d.line([P(*H(u0 + 1, nn)), P(*H(u1 - 1.5, nn))], fill=(232, 232, 226, 200), width=max(2, int(0.1 * PX)))
# ---- nền các nhà phụ ----
for b in L["buildings"]:
    slab_poly(quad_un(b["u"] - b["w"] / 2 - 1.5, b["u"] + b["w"] / 2 + 1.5, b["n"] - b["d"] / 2 - 1.5, b["n"] + b["d"] / 2 + 1.5), (172, 171, 166))
for b in L["xbuildings"]:
    cx, cz = b["c"]; slab_poly([(cx - b["w"] / 2 - 1.2, cz - b["d"] / 2 - 1.2), (cx + b["w"] / 2 + 1.2, cz - b["d"] / 2 - 1.2), (cx + b["w"] / 2 + 1.2, cz + b["d"] / 2 + 1.2), (cx - b["w"] / 2 - 1.2, cz + b["d"] / 2 + 1.2)], (172, 171, 166))
# ---- đường VÒNG (hình móc câu) + nhà nhỏ cuối vòng ----
lp = L["loop"]; cx, cz, r = lp["c"][0], lp["c"][1], lp["r"]
road(arc(cx, cz, r, math.radians(lp["a0"]), math.radians(lp["a1"])), 2.3, edge=False, col=(168, 164, 152))
road([tuple(p) for p in lp["lead"]], 2.3, edge=False, col=(168, 164, 152))
# ---- hàng rào trắng quanh bãi cỏ ----
for f in L["fences"]: fence([tuple(p) for p in f])
# ---- gò bệ phóng: sân sỏi sáng quanh chân gò (gò 3D đặt lên trên) ----
m = L["mound"]; e = m["slope"] + 5
slab_poly([(m["x0"] - e, m["z0"] - e), (m["x1"] + e, m["z0"] - e), (m["x1"] + e, m["z1"] + e), (m["x0"] - e, m["z1"] + e)], (196, 190, 176))
# ---- khu bồn chứa ----
slab_poly([(-24, -40), (24, -40), (24, -27), (-24, -27)], (170, 168, 162))
img = img.filter(ImageFilter.GaussianBlur(0.5))
save_jpg(np.asarray(img).astype(np.float32) / 255, os.path.join(DST, "site-albedo.jpg"), 87)
print("xong.", flush=True)

# -*- coding: utf-8 -*-
"""
Sinh ĐỊA HÌNH NHÌN TỪ TRÊN CAO cho mẫu 4 (Rocket Race — phóng từ mặt đất, bờ biển kiểu Starbase).
Mọi lớp là HÀM THEO TOẠ ĐỘ THẾ GIỚI (đơn vị cảnh 3D; 1 đv ≈ 23 m), nên tấm toàn cảnh và tấm khu phóng
chi tiết cao khớp nhau liền mạch.

  x → phải (đông), z → xuống ảnh (nam). Biển ở ĐÔNG BẮC, đầm lầy/bãi bồi ở TÂY NAM, khu phóng ở gốc toạ độ.

Ra (rocket-race/assets/):
  terrain-albedo.jpg   4096²  phủ [-240, 240]²   màu (đã đổ bóng đụn nhẹ)
  terrain-normal.jpg   2048²  phủ [-240, 240]²   pháp tuyến (x, z, y lên)
  terrain-mask.png     1024²  phủ [-240, 240]²   R = nước, G = cách bờ (0 ở bờ → 1 ở 30 đv ngoài khơi), B = biển(255)/đầm(0)
  site-albedo.jpg      4096²  phủ [-80, 80]²     khu công ty + khu phóng: bãi cỏ, bê tông, đường, vạch sơn, bãi xe, vết cháy
Chạy:  python tools/tao-dia-hinh.py
"""
import os, math
import numpy as np
from scipy.ndimage import map_coordinates, gaussian_filter, distance_transform_edt
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "rocket-race", "assets")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(20260926)
LAT = [rng.random((256, 256)).astype(np.float32) for _ in range(16)]


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
    t = t[..., None]; return c0 * (1 - t) + c1 * t


def C(*rgb):
    return np.array(rgb, dtype=np.float32)


# ----------------------------------------------------------------------------------------------
# các trường cơ bản
# ----------------------------------------------------------------------------------------------
def fields(x, z):
    F = {}
    w1 = fbm(x, z, 0.006, 3, 0) - 0.5; w2 = fbm(x, z, 0.006, 3, 3) - 0.5
    xw, zw = x + w1 * 40, z + w2 * 40                                   # vặn toạ độ ⇒ đường bờ tự nhiên
    # khoảng cách có dấu tới BỜ BIỂN (dương = ngoài biển), chạy chéo tây bắc – đông nam
    s = (xw * 0.55 - zw * 0.835) - 72 + (fbm(x, z, 0.02, 2, 6) - 0.5) * 5
    F["coast"] = s
    # ĐẦM LẦY tây nam: vùng nước nông + bãi bồi + lạch nước hình nhánh cây
    lg = -(xw * 0.8 + zw * 0.25) - 92 + (fbm(x, z, 0.012, 3, 8) - 0.5) * 30
    F["lag"] = lg
    ridge = 1 - np.abs(fbm(xw * 1.3, zw * 1.3, 0.03, 4, 10) * 2 - 1)     # nhánh lạch
    F["chan"] = ridge
    F["dune"] = fbm(x, z, 0.09, 5, 20)                                  # đụn nhỏ + bụi cây
    F["dune_r"] = 1 - np.abs(np.sin((s * 0.9 + (fbm(x, z, 0.03, 3, 24) - 0.5) * 18)))  # đụn song song bờ
    F["veg"] = fbm(x, z, 0.16, 5, 30)
    F["veg2"] = fbm(x, z, 0.5, 3, 36)
    F["big"] = fbm(x, z, 0.015, 4, 40)
    F["grain"] = fbm(x, z, 1.6, 2, 44)
    F["grain2"] = fbm(x, z, 4.0, 2, 46)
    F["dens"] = fbm(x, z, 0.025, 4, 52)
    F["clump"] = fbm(x, z, 0.7, 3, 56)
    F["trail"] = 1 - np.abs(fbm(x, z, 0.045, 4, 58) * 2 - 1)
    # khu san phẳng quanh bệ phóng (hình chữ nhật bo góc, mép răng cưa nhẹ)
    # Đợt ảnh SpaceX (thầy): khu công ty phủ CỎ XANH cắt tỉa (rộng, tới nhà xưởng phía nam); chỉ quanh 2 bệ + khu bồn là SỎI
    sx = np.maximum(np.abs(x + 4) - 62, 0); sz = np.maximum(np.abs(z - 22) - 52, 0)
    F["site"] = 1 - smooth(0, 8, np.sqrt(sx * sx + sz * sz) + (fbm(x, z, 0.08, 2, 50) - 0.5) * 7)
    px_ = np.maximum(np.abs(x) - 34, 0); pz_ = np.maximum(np.abs(z + 7) - 23, 0)
    F["pad"] = 1 - smooth(0, 5, np.sqrt(px_ * px_ + pz_ * pz_) + (fbm(x, z, 0.1, 2, 51) - 0.5) * 5)
    # ao hồ nội địa (như ảnh: mặt nước xanh giữa đồng cỏ), tránh khu công ty
    F["pond"] = (fbm(x, z, 0.018, 4, 53) - 0.7) * 60 - F["site"] * 40
    return F


def height(F):
    s = F["coast"]
    beach = smooth(-18, 0, s)
    h = (1 - beach) * (0.3 + F["dune"] * 1.4 + F["dune_r"] * 0.9 * smooth(-50, -16, s) * (1 - smooth(-16, -10, s)))
    h = h * (1 - F["site"] * 0.85) + F["site"] * 0.15
    h = np.where(s > 0, -0.4 - s * 0.02, h)
    h = np.where(F["lag"] > 0, np.minimum(h, 0.05 - F["lag"] * 0.01), h)
    return h


def albedo(x, z, F, px_units):
    s = F["coast"]; n = F["grain"]; big = F["big"]
    # ---- đất liền nền: cát khô nhạt, loang theo vùng ----
    sand = mix(C(0.80, 0.73, 0.60), C(0.72, 0.64, 0.50), big)
    sand = mix(sand, C(0.86, 0.80, 0.68), smooth(0.55, 0.8, F["veg2"]) * 0.5)
    col = sand * (0.93 + 0.14 * n[..., None])
    # ĐỒNG CỎ nội địa (xa biển): xanh cỏ loang, chuyển dần sang cát khi gần đụn ven biển
    inland = 1 - smooth(-42, -20, s)
    grass = mix(C(0.27, 0.36, 0.15), C(0.38, 0.43, 0.21), smooth(0.3, 0.7, F["dens"]))
    grass = mix(grass, C(0.44, 0.44, 0.27), smooth(0.65, 0.85, F["veg2"]) * 0.6)      # cỏ úa
    grass = grass * (0.9 + 0.2 * n[..., None])
    col = mix(col, grass, inland)
    # ---- cây bụi trên đụn: mảng xanh thẫm/ô liu rời rạc, lối mòn cát ----
    vegZone = smooth(-70, -15, s) * (1 - smooth(-13, -7, s)) + (1 - smooth(-95, -60, s)) * 0.9
    vegZone = np.clip(vegZone, 0, 1) * (1 - F["site"])
    # mật độ đổi theo VÙNG LỚN (chỗ rậm, chỗ thưa, chỗ trống) · bụi LẤM TẤM thành cụm ở tần số cao
    D = (0.35 + 0.65 * smooth(0.18, 0.6, F["dens"])) * vegZone
    fine = F["clump"] * 0.75 + F["grain"] * 0.25
    cover = smooth(0.98 - D * 0.62, 1.06 - D * 0.62, fine)
    cover *= 1 - smooth(0.955, 0.985, F["trail"]) * 0.95                # lối mòn cát mảnh xuyên qua bụi
    tone = F["veg2"]
    shrub = mix(C(0.11, 0.19, 0.10), C(0.24, 0.30, 0.15), smooth(0.35, 0.65, tone))
    shrub = mix(shrub, C(0.40, 0.36, 0.27), smooth(0.7, 0.85, tone) * 0.7)   # bụi khô nâu
    shrub = shrub * (0.78 + 0.44 * F["grain2"][..., None])
    col = mix(col, shrub, cover)
    col *= (1 - 0.12 * smooth(0.3, 0.8, D))[..., None]                   # vùng rậm tối chung
    # ---- bãi biển: cát khô → cát ướt → mép sóng ----
    dry = smooth(-16, -5, s); wet = smooth(-4.5, -0.8, s)
    col = mix(col, C(0.84, 0.77, 0.64) * (0.95 + 0.1 * n[..., None]), dry)
    col = mix(col, C(0.55, 0.50, 0.42), wet * 0.9)
    # vết sóng rút cong trên cát ướt
    swash = (np.sin(s * 5 + (F["veg"] - 0.5) * 20) * 0.5 + 0.5) * smooth(-3.5, -1, s) * (1 - smooth(-0.6, 0, s))
    col = mix(col, C(0.66, 0.62, 0.55), swash * 0.4)
    # ---- biển: nông ngọc lam → sâu xanh thẫm, dải bọt sóng song song bờ ----
    depth = smooth(0, 60, s)
    sea = mix(C(0.40, 0.55, 0.53), C(0.07, 0.24, 0.30), depth)
    sea = mix(sea, C(0.05, 0.16, 0.22), smooth(60, 140, s))
    foam = np.zeros_like(s)
    t = x * 0.835 + z * 0.55                                               # toạ độ DỌC bờ
    for d, w, a in [(0.7, 1.1, 0.95), (4.0, 0.9, 0.75), (8.5, 1.3, 0.6), (14, 1.6, 0.4), (22, 2.2, 0.22)]:
        brk = smooth(0.3, 0.55, fbm(t * 0.25 + d * 31, s * 1.5, 0.08, 4, 60 + int(d)))   # dài theo bờ, đứt quãng tự nhiên
        wob = (fbm(t, s, 0.05, 2, 80 + int(d)) - 0.5) * 3
        foam = np.maximum(foam, a * np.exp(-((s - d - wob) / w) ** 2) * brk)
        foam = np.maximum(foam, a * 0.35 * np.exp(-((s - d - wob - w * 1.5) / (w * 2.5)) ** 2) * brk)   # bọt tan sau ngọn
    foam = np.maximum(foam, 0.9 * (1 - smooth(0, 0.8, s)) * (s > 0))
    sea = mix(sea, C(0.90, 0.92, 0.90), np.clip(foam, 0, 1))
    col = np.where((s > 0)[..., None], sea, col)
    # ---- đầm lầy: nước nông xám lam, bãi bồi bùn, lạch nước thẫm hình nhánh ----
    lg = F["lag"]
    flat = smooth(-12, 0, lg)                                             # bãi bồi viền đầm
    mud = mix(C(0.55, 0.51, 0.43), C(0.44, 0.42, 0.37), F["veg2"])
    col = mix(col, mud, flat * 0.85)
    lagWater = mix(C(0.36, 0.47, 0.50), C(0.22, 0.34, 0.40), smooth(0, 30, lg))
    chan = smooth(0.9, 0.975, F["chan"]) * smooth(-6, 4, lg)
    lagWater = mix(lagWater, C(0.14, 0.24, 0.30), chan)
    bars = smooth(0.6, 0.7, fbm(x * 0.5 + z * 0.3, z * 1.4, 0.05, 4, 70)) * smooth(0, 5, lg) * (1 - smooth(20, 45, lg))
    lagWater = mix(lagWater, C(0.70, 0.66, 0.56), bars * 0.85)            # doi cát trong đầm
    pond = F["pond"]
    col = mix(col, mud * 0.9, smooth(-4, 0, pond) * (pond <= 0) * (s <= 0) * 0.7)       # bờ ao (chỉ trên đất liền)
    isLag = ((lg > 0) | (pond > 0)) & (s <= 0)
    col = np.where(isLag[..., None], lagWater, col)
    # lạch nước cắt vào bãi bồi
    col = mix(col, C(0.20, 0.30, 0.34), chan * flat * (lg <= 0) * 0.9)
    # ---- khu san phẳng: sỏi đá dăm sáng, vết bánh xe ----
    gravel = mix(C(0.74, 0.70, 0.62), C(0.64, 0.60, 0.53), smooth(0.3, 0.7, F["dens"]))
    gravel = mix(gravel, C(0.58, 0.55, 0.49), smooth(0.62, 0.75, F["clump"]) * 0.5)       # vệt ẩm / đất nén
    gravel = gravel * (0.9 + 0.2 * F["grain2"][..., None])
    # bãi cỏ cắt tỉa của khu công ty: vệt máy cắt cỏ sáng/tối xen kẽ
    stripe = (np.sin(x * 1.25 + (F["big"] - 0.5) * 2) > 0).astype(np.float32)
    lawn = mix(C(0.34, 0.45, 0.20), C(0.38, 0.49, 0.22), stripe * 0.6 + F["grain2"] * 0.4)
    lawn = mix(lawn, C(0.45, 0.46, 0.28), smooth(0.66, 0.8, F["dens"]) * 0.5)         # mảng cỏ úa
    col = mix(col, lawn, F["site"] * (1 - F["pad"]))
    col = mix(col, gravel, F["pad"])
    water = ((s > 0) | isLag)
    return np.clip(col, 0, 1), water


def shade(h, px_units, sun=(-0.55, 0.45, -0.7), k=0.55):
    gz, gx = np.gradient(h, px_units)
    nx, ny, nz = -gx, np.ones_like(h), -gz
    L = np.sqrt(nx * nx + ny * ny + nz * nz); nx /= L; ny /= L; nz /= L
    sv = np.array(sun, dtype=np.float32); sv /= np.linalg.norm(sv)
    d = nx * sv[0] + ny * sv[1] + nz * sv[2]
    flat = sv[1]
    return 1 + k * (d - flat), (nx, ny, nz)


def grid(ext, N):
    u = (np.arange(N, dtype=np.float32) + 0.5) / N
    xs = -ext + u * 2 * ext
    return np.meshgrid(xs, xs)          # x theo cột, z theo hàng (hàng 0 = bắc = z âm)


def save_jpg(a, path, q=90):
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(path, quality=q, optimize=True)
    print("  ", os.path.basename(path), os.path.getsize(path) // 1024, "KB")


# ----------------------------------------------------------------------------------------------
print("toàn cảnh 4096² …")
EXT = 240.0
N = 4096
x, z = grid(EXT, N)
F = fields(x, z)
h = height(F)
col, water = albedo(x, z, F, 2 * EXT / N)
sh, _ = shade(gaussian_filter(h, 1.2), 2 * EXT / N)
col = col * np.where(water, 1, sh)[..., None]
save_jpg(col, os.path.join(OUT, "terrain-albedo.jpg"), 88)
# pháp tuyến 2048
hN = h[::2, ::2]
_, (nx, ny, nz) = shade(gaussian_filter(hN, 0.8), 4 * EXT / N)
nx = np.where(water[::2, ::2], 0, nx); nz = np.where(water[::2, ::2], 0, nz); ny = np.where(water[::2, ::2], 1, ny)
# normal map kiểu tiếp tuyến của mặt phẳng nằm: R = x, G = −z (v ngược), B = y
nm = np.stack([nx * 0.5 + 0.5, -nz * 0.5 + 0.5, ny * 0.5 + 0.5], -1)
save_jpg(nm, os.path.join(OUT, "terrain-normal.jpg"), 90)
# mặt nạ nước 1024
wm = water[::4, ::4]
sea = (F["coast"] > 0)[::4, ::4]
dist = distance_transform_edt(wm) * (2 * EXT / 1024)                     # đv tới bờ gần nhất
mask = np.stack([wm.astype(np.float32), np.clip(dist / 30, 0, 1), sea.astype(np.float32)], -1)
Image.fromarray((mask * 255).astype(np.uint8)).save(os.path.join(OUT, "terrain-mask.png"), optimize=True)
print("   terrain-mask.png")
del x, z, F, h, col, water, sh, nx, ny, nz, nm

# ----------------------------------------------------------------------------------------------
print("khu phóng 4096² …")
SE = 80.0
N2 = 4096
x, z = grid(SE, N2)
F = fields(x, z)
h = height(F)
col, water = albedo(x, z, F, 2 * SE / N2)
sh, _ = shade(gaussian_filter(h, 2), 2 * SE / N2)
col = col * np.where(water, 1, sh)[..., None]
img = Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8))
PX = N2 / (2 * SE)
def P(wx, wz): return ((wx + SE) * PX, (wz + SE) * PX)
def R(x0, z0, x1, z1): return [P(x0, z0), P(x1, z1)]
d = ImageDraw.Draw(img, "RGBA")

def slab(x0, z0, x1, z1, base=(158, 156, 150), seam=3.0):
    d.rectangle(R(x0, z0, x1, z1), fill=base + (255,))
    # vệt màu từng tấm bê tông + đường ron
    xs = np.arange(x0, x1, seam); zs = np.arange(z0, z1, seam)
    for a in xs:
        for b in zs:
            v = int(rng.integers(-5, 5))
            d.rectangle(R(a, b, min(a + seam, x1), min(b + seam, z1)), fill=(base[0] + v, base[1] + v, base[2] + v, 40))
    for a in xs: d.line([P(a, z0), P(a, z1)], fill=(100, 100, 98, 55), width=2)
    for b in zs: d.line([P(x0, b), P(x1, b)], fill=(100, 100, 98, 55), width=2)
    for _ in range(int((x1 - x0) * (z1 - z0) / 6)):                     # vết dầu / nước đọng
        cx_, cz_ = rng.uniform(x0, x1), rng.uniform(z0, z1); rr = rng.uniform(0.2, 1.1)
        d.ellipse(R(cx_ - rr, cz_ - rr * rng.uniform(0.5, 1), cx_ + rr, cz_ + rr), fill=(70, 68, 64, int(rng.integers(12, 34))))

def road(pts, w=2.4, center=True, edge=True):
    pp = [P(*p) for p in pts]
    d.line(pp, fill=(62, 63, 66, 255), width=int(w * PX), joint="curve")
    for p in pp: d.ellipse([p[0] - w * PX / 2, p[1] - w * PX / 2, p[0] + w * PX / 2, p[1] + w * PX / 2], fill=(62, 63, 66, 255))
    if edge:
        for side in (-1, 1):
            for i in range(len(pts) - 1):
                (ax, az), (bx, bz) = pts[i], pts[i + 1]
                L = math.hypot(bx - ax, bz - az) or 1; nx_, nz_ = -(bz - az) / L, (bx - ax) / L
                o = side * (w / 2 - 0.18)
                d.line([P(ax + nx_ * o, az + nz_ * o), P(bx + nx_ * o, bz + nz_ * o)], fill=(225, 225, 215, 200), width=max(2, int(0.1 * PX)))
    if center:
        for i in range(len(pts) - 1):
            (ax, az), (bx, bz) = pts[i], pts[i + 1]
            L = math.hypot(bx - ax, bz - az); k = 0
            while k < L:
                t0, t1 = k / L, min(1, (k + 1.2) / L)
                d.line([P(ax + (bx - ax) * t0, az + (bz - az) * t0), P(ax + (bx - ax) * t1, az + (bz - az) * t1)], fill=(232, 190, 60, 230), width=max(2, int(0.12 * PX)))
                k += 2.6

def fence(pts):
    d.line([P(*p) for p in pts], fill=(236, 236, 230, 200), width=max(2, int(0.12 * PX)))
    for i in range(len(pts) - 1):                                       # cọc rào
        (ax, az), (bx, bz) = pts[i], pts[i + 1]; L = math.hypot(bx - ax, bz - az); k = 0
        while k < L:
            u = k / L; c = P(ax + (bx - ax) * u, az + (bz - az) * u); r = 0.12 * PX
            d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=(245, 245, 240, 230)); k += 2.5

def arc(cx, cz, r, a0, a1, n=40):
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cz + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]

# --- đường: vành đai khu phóng, trục bệ ↔ nhà xưởng, trục đông–tây, cổng vào phía nam, vòng cong phía tây ---
road([(-34, -28), (34, -28), (34, 14), (-34, 14), (-34, -28)], 2.2, center=False)
road([(0, 14), (0, 32)], 3.4)
road([(-66, 32), (52, 32)], 2.8)
road([(14, 80), (14, 32)], 3.0)
road(arc(-58, 14, 13, math.pi * 0.5, math.pi * 2.3), 2.2, center=False)
road([(-58, 27), (-58, 32)], 2.2, center=False)
# sân 2 bệ phóng (bê tông, ron tấm) + móng tháp
for px_ in (-9, 9):
    slab(px_ - 8.5, -8.5, px_ + 8.5, 8.5, (150, 148, 142))
    tx = px_ + (-4.6 if px_ < 0 else 4.6)
    slab(tx - 2.2, -2.2, tx + 2.2, 2.2, (128, 127, 124), 2.2)
# khu bồn chứa
slab(-22, -24, 22, -12, (156, 154, 148), 4)
# nhà xưởng lớn (nền + sân trước cửa đầu hồi phía đông) + 2 nhà phụ + nhà nhỏ giữa vòng cong
slab(-44, 36, -2, 56, (160, 160, 156), 6)
slab(34, 38, 48, 50, (160, 160, 156), 5)
slab(32, 54, 46, 62, (160, 160, 156), 5)
slab(-62, 10, -54, 18, (160, 160, 156), 4)
# bãi xe 3 dãy
slab(4, 38, 30, 56, (72, 73, 76), 60)
for row, zz in enumerate((38.6, 46.0, 47.0, 55.4)):
    up = row % 2 == 0
    for i in range(13):
        xx = 4.8 + i * 1.95
        d.line([P(xx, zz), P(xx, zz + (2.6 if up else -2.6))], fill=(230, 230, 225, 220), width=max(2, int(0.1 * PX)))
        if rng.random() < 0.74:
            cc = [(210, 210, 214), (30, 32, 36), (160, 30, 34), (120, 124, 130), (230, 232, 236), (40, 70, 130), (90, 90, 96)][int(rng.integers(0, 7))]
            cx0 = xx + 0.35; cz0 = zz + (0.3 if up else -2.3)
            d.rounded_rectangle(R(cx0, cz0, cx0 + 1.2, cz0 + 2.0), radius=int(0.25 * PX), fill=cc + (255,))
            d.rectangle(R(cx0 + 0.18, cz0 + (0.45 if up else 1.1), cx0 + 1.02, cz0 + (0.85 if up else 1.5)), fill=(25, 30, 38, 235))
# hàng rào trắng quanh khu phóng + quanh bãi cỏ phía tây
fence([(-40, -34), (40, -34), (40, 20), (-40, 20), (-40, -34)])
fence([(-74, 0), (-74, 40), (-46, 40)])
# vết bánh xe cong trên nền sỏi (chỉ khu phóng)
for _ in range(40):
    x0_, z0_ = rng.uniform(-32, 32), rng.uniform(-28, 12); a = rng.uniform(0, 6.28); pts = []
    for k in range(24):
        a += rng.uniform(-0.08, 0.08); x0_ += math.cos(a) * 0.8; z0_ += math.sin(a) * 0.8; pts.append(P(x0_, z0_))
    for off in (-0.45, 0.45):
        d.line([(p[0] + off * PX * math.sin(a), p[1] - off * PX * math.cos(a)) for p in pts], fill=(120, 112, 100, 40), width=max(2, int(0.2 * PX)))
# vạch dừng + chữ STOP trước bãi
d.line([P(12.4, 34.2), P(15.6, 34.2)], fill=(235, 235, 230, 230), width=int(0.3 * PX))
img = img.filter(ImageFilter.GaussianBlur(0.6))
# vết cháy đen loang quanh 2 bệ (vẽ sau cùng, mềm)
arr = np.asarray(img).astype(np.float32) / 255
for px_ in (-9, 9):
    r = np.sqrt((x - px_) ** 2 + z ** 2)
    burn = np.exp(-(r / 7.5) ** 2) * (0.55 + 0.45 * fbm(x, z, 0.4, 3, 90)) * 0.75
    streak = np.exp(-(np.abs(z) / 2.2) ** 2) * np.exp(-(np.abs(x - px_) / 14) ** 2) * 0.35   # hướng rãnh thoát lửa
    arr *= (1 - np.clip(burn + streak, 0, 0.85))[..., None]
save_jpg(arr, os.path.join(OUT, "site-albedo.jpg"), 88)
print("xong.")

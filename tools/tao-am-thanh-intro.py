# -*- coding: utf-8 -*-
"""
Tổng hợp TIẾNG cho intro "phóng từ mặt đất" (Rocket Race mẫu 4i, thầy 26/9/2026):
  "không cần nhạc nền, chỉ cần tiếng nhà máy, máy móc hoạt động nhỏ trong nhà máy, chim chóc hót, gió thổi như một buổi sáng trong lành.
   Khi khởi động, phóng tàu, tiếng nổ động cơ rú lên thật lớn, tiếng khói, tàu vận hành..."
Mọi tiếng TỰ TỔNG HỢP bằng numpy/scipy (không lấy tiếng có bản quyền), 44,1 kHz stereo → .ogg (Vorbis, lặp liền không khấc) + .mp3 dự phòng.

Nền (LẶP liền — đã trộn đè đuôi vào đầu):  wind · factory · birds · vent (xì hơi khi đếm) · roar (gầm động cơ)
Một lần:  ignite (đánh lửa: nổ đanh + bùng + gầm dâng) · steam (mây khói cuồn cuộn) · flyby (tàu vút qua máy quay) · warp (nhảy tốc độ)
Ra: rocket-race/assets/sound-intro/*.ogg|mp3      Chạy: python -X utf8 tools/tao-am-thanh-intro.py   (~1–2 phút)
"""
import os, subprocess
import numpy as np
import scipy.signal as ss
from scipy.io import wavfile

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "rocket-race", "assets", "sound-intro")
TMP = os.path.join(OUT, "_wav"); os.makedirs(TMP, exist_ok=True)
FFMPEG = r"E:\LAP TRINH APP\MODEL\ffmpeg\ffmpeg.exe"
rng = np.random.default_rng(20260926)


def T(d): return np.arange(int(d * SR)) / SR
def white(n): return rng.standard_normal(n)
def sos(kind, f, o=2): return ss.butter(o, f, kind, fs=SR, output="sos")
def lp(x, f, o=2): return ss.sosfilt(sos("low", f, o), x)
def hp(x, f, o=2): return ss.sosfilt(sos("high", f, o), x)
def bp(x, lo, hi, o=2): return ss.sosfilt(sos("band", [lo, hi], o), x)
def norm(x, peak=1.0): return x / (np.max(np.abs(x)) + 1e-9) * peak
def pink(n):
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]; a = [1, -2.494956002, 2.017265875, -0.522189400]
    return norm(ss.lfilter(b, a, white(n)))
def brown(n):
    b = ss.lfilter([1], [1, -0.997], white(n)); return norm(hp(b, 20))
def smoothrand(n, rate, lo=0.0, hi=1.0):
    """đường cong ngẫu nhiên mượt (rate Hz)"""
    k = max(4, int(n / SR * rate) + 4); pts = rng.random(k)
    x = np.interp(np.linspace(0, k - 3, n), np.arange(k), pts)
    x = lp(np.concatenate([x, x[::-1]]), max(rate * 2, 0.5), 1)[:n]
    x = (x - x.min()) / (x.max() - x.min() + 1e-9); return lo + (hi - lo) * x


def svf(x, fc, q=0.7, mode="lp"):
    fc = np.broadcast_to(np.clip(fc, 10, SR * 0.45), x.shape)
    g = np.tan(np.pi * fc / SR); k = 1.0 / q
    a1 = 1 / (1 + g * (g + k)); a2 = g * a1; a3 = g * a2
    y = np.empty_like(x); ic1 = ic2 = 0.0
    for i in range(len(x)):
        v3 = x[i] - ic2; v1 = a1[i] * ic1 + a2[i] * v3; v2 = ic2 + a2[i] * ic1 + a3[i] * v3
        ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2
        y[i] = v2 if mode == "lp" else v1
    return y


def reverb(st, secs=1.4, wet=0.3, damp=4000):
    n = int(secs * SR); t = np.arange(n) / SR
    out = []
    for ch in range(2):
        ir = white(n) * np.exp(-t / (secs / 5)); ir = lp(ir, damp); ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        ir /= np.sqrt(np.sum(ir ** 2))
        out.append(ss.fftconvolve(st[ch], ir)[: st.shape[1]])
    return st * (1 - wet) + np.array(out) * wet


def loopify(st, fade=1.5):
    """trộn đè đuôi vào đầu ⇒ lặp liền không khấc (đầu ra ngắn đi `fade` giây)"""
    m = int(fade * SR); body = st[:, :-m].copy(); tail = st[:, -m:]
    w = np.sin(np.linspace(0, np.pi / 2, m)) ** 2
    body[:, :m] = body[:, :m] * w + tail * (1 - w)
    return body


def pan(mono, p):  # p -1 trái … +1 phải (luật công suất)
    a = (p + 1) * np.pi / 4; return np.array([mono * np.cos(a), mono * np.sin(a)])


def place(buf, snd, at):
    i = int(at * SR); n = min(snd.shape[-1], buf.shape[-1] - i)
    if n > 0: buf[..., i:i + n] += snd[..., :n]


def loud(st, rms_db):
    """to THẬT: kéo độ to trung bình lên mức rms_db rồi nén đỉnh mềm (tanh) — không để vài xung lách tách quyết định âm lượng"""
    r = np.sqrt(np.mean(st ** 2)) + 1e-9; st = st * (10 ** (rms_db / 20) / r)
    return np.tanh(st * 1.15) / np.tanh(1.15)


def save(name, st, peak=0.9, rms_db=None):
    if rms_db is not None: st = loud(st, rms_db)
    st = np.clip(norm(st, peak), -1, 1)
    w = os.path.join(TMP, name + ".wav"); wavfile.write(w, SR, (st.T * 32767).astype(np.int16))
    for ext, args in (("ogg", ["-c:a", "libvorbis", "-q:a", "5"]), ("mp3", ["-c:a", "libmp3lame", "-b:a", "160k"])):
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", w, *args, os.path.join(OUT, f"{name}.{ext}")], check=True)
    print(f"  {name}: {st.shape[1] / SR:.1f} s", flush=True)


# ============================================================ NỀN BUỔI SÁNG
def make_wind(d=32):
    n = int(d * SR); out = []
    gust = smoothrand(n, 0.12, 0.25, 1.0) ** 1.6
    for ch in range(2):
        g2 = np.clip(gust * smoothrand(n, 0.35, 0.8, 1.1), 0, 1.2)
        x = pink(n)
        body = svf(x, 260 + 1300 * g2, 0.6)                          # gió ù: dày lên, sáng lên khi giật
        whistle = svf(white(n), 520 + 380 * smoothrand(n, 0.2), 7.0, "bp") * 0.05 * g2 ** 2   # huýt nhẹ khi giật mạnh
        leaves = hp(white(n), 2500) * 0.035 * g2 ** 2.5 * smoothrand(n, 3, 0.4, 1)            # lá xào xạc
        out.append((body * (0.25 + 0.75 * g2) + whistle + leaves))
    return loopify(np.array(out))


def make_factory(d=25.6):
    n = int(d * SR); t = np.arange(n) / SR
    hum = (np.sin(2 * np.pi * 50 * t) * 0.5 + np.sin(2 * np.pi * 100 * t) * 0.35 + np.sin(2 * np.pi * 150 * t) * 0.12) * (0.9 + 0.1 * np.sin(2 * np.pi * 0.3 * t))
    vent = lp(brown(n), 380) * 1.4 + bp(white(n), 250, 900) * 0.06                   # quạt thông gió
    m = hum * 0.12 + vent * 0.5
    thump = np.zeros(n)                                                             # máy dập đều nhịp 1,6 s
    k = T(0.35); th = (np.sin(2 * np.pi * 62 * k) * np.exp(-k / 0.08) + lp(white(len(k)), 400) * np.exp(-k / 0.05) * 0.6)
    for i in range(int(d / 1.6)): place(thump, th * rng.uniform(0.8, 1.0), i * 1.6 + 0.2)
    pneu = np.zeros(n); k2 = T(0.45)                                                # xì khí nén mỗi 3,2 s
    ps = bp(white(len(k2)), 1800, 6000) * np.minimum(1, k2 / 0.02) * np.exp(-k2 / 0.12)
    for i in range(int(d / 3.2)): place(pneu, ps * 0.25, i * 3.2 + 1.0)
    clank = np.zeros(n)                                                             # kim loại lách cách ngẫu nhiên
    at = 0.8
    while at < d - 1.5:
        k3 = T(1.2); f0 = rng.uniform(380, 700)
        c = sum(np.sin(2 * np.pi * f0 * r * k3 + rng.uniform(0, 6)) * np.exp(-k3 / tau) * a for r, tau, a in [(1, 0.25, 1), (2.43, 0.15, 0.6), (4.1, 0.08, 0.4), (6.3, 0.05, 0.25)])
        place(clank, c * rng.uniform(0.15, 0.4), at); at += rng.uniform(1.8, 4.5)
    conv = np.zeros(n); tick = bp(white(int(0.012 * SR)), 900, 3000) * np.hanning(int(0.012 * SR))    # băng chuyền tích tắc 7 Hz
    for i in range(int(d * 7)): place(conv, tick * 0.05 * (1 + 0.3 * np.sin(i)), i / 7)
    mono = m + thump * 0.55 + pneu + lp(clank, 3200) + conv
    st = np.array([mono + lp(white(n), 300) * 0.02, mono + lp(white(n), 300) * 0.02])
    st = reverb(st, 1.8, 0.45, 2500)                                               # vọng từ TRONG nhà xưởng
    return loopify(lp(st, 2600), 1.6)


def bird_call(kind):
    if kind == "chirp":                                                             # chíp chíp: vuốt lên ngắn, 2–4 tiếng
        parts = []
        for _ in range(rng.integers(2, 5)):
            k = T(rng.uniform(0.05, 0.08)); f = np.linspace(rng.uniform(2400, 3200), rng.uniform(4200, 5600), len(k))
            parts += [np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(len(k)), np.zeros(int(rng.uniform(0.06, 0.11) * SR))]
        return np.concatenate(parts)
    if kind == "trill":                                                             # láy rộn ràng
        f0 = rng.uniform(4800, 6200); parts = []
        for i in range(rng.integers(10, 20)):
            k = T(0.028); f = f0 * (1 + 0.08 * np.sin(np.linspace(0, np.pi, len(k)))) * (1 - i * 0.004)
            parts += [np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(len(k)), np.zeros(int(0.012 * SR))]
        return np.concatenate(parts)
    if kind == "whistle":                                                           # huýt 3–5 nốt có rung (kiểu chim két/robin)
        parts = []
        for _ in range(rng.integers(3, 6)):
            k = T(rng.uniform(0.12, 0.22)); fb = rng.uniform(2000, 3600)
            f = fb * (1 + rng.uniform(-0.15, 0.15) * np.linspace(0, 1, len(k))) * (1 + 0.012 * np.sin(2 * np.pi * 28 * k))
            y = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.18 * np.sin(4 * np.pi * np.cumsum(f) / SR)
            parts += [y * np.sin(np.linspace(0, np.pi, len(k))) ** 0.6, np.zeros(int(rng.uniform(0.05, 0.14) * SR))]
        return np.concatenate(parts)
    k = T(rng.uniform(0.5, 0.9))                                                    # warble: hót líu lo (FM)
    fm = rng.uniform(18, 34); f = rng.uniform(2600, 3400) + rng.uniform(500, 900) * np.sin(2 * np.pi * fm * k)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, len(k))) * (0.6 + 0.4 * np.sin(2 * np.pi * 5 * k))


def make_birds(d=31.5):
    n = int(d * SR); st = np.zeros((2, n))
    birds = [dict(kind=k, pan=rng.uniform(-0.9, 0.9), dist=rng.uniform(0.25, 1.0)) for k in ["chirp", "trill", "whistle", "warble", "chirp", "whistle", "chirp"]]
    for b in birds:
        at = rng.uniform(0, 3)
        while at < d - 2:
            c = bird_call(b["kind"]); c = lp(c, 9000 - 5000 * (1 - b["dist"]))       # xa thì tối, nhỏ
            place(st, pan(c * b["dist"] * rng.uniform(0.6, 1.0), b["pan"]), at)
            at += len(c) / SR + rng.uniform(1.2, 5.5) * (1.4 if b["kind"] == "warble" else 1)
    return loopify(reverb(hp(st, 1200), 1.2, 0.28, 7000), 1.5)


def make_vent(d=6.5):                                                              # xì hơi lạnh từ thân tàu khi đếm
    n = int(d * SR); out = []
    for ch in range(2):
        fl = smoothrand(n, 2.5, 0.6, 1.0)
        out.append(bp(white(n), 1200, 9000) * fl * 0.5 + lp(brown(n), 200) * 0.35)
    return loopify(np.array(out), 1.0)


# ============================================================ PHÓNG
def crackle(n, rate=260, hpf=700):
    """lách tách đặc trưng của động cơ tên lửa: xung thưa, biên độ đuôi dài (Pareto)"""
    x = np.zeros(n); cnt = rng.poisson(rate * n / SR); idx = rng.integers(0, n - 200, cnt)
    amp = (rng.pareto(2.2, cnt) + 0.3) * rng.choice([-1, 1], cnt)
    for i, a in zip(idx, amp):
        L = rng.integers(20, 120); x[i:i + L] += a * np.exp(-np.arange(L) / (L / 4))
    return hp(x, hpf)


def roar_layer(n, bright=1.0):
    rum = lp(brown(n), 110) * 0.75                                                  # rền sâu
    t = np.arange(n) / SR; rum += np.sin(2 * np.pi * 34 * t + 2 * smoothrand(n, 3)) * 0.35 * smoothrand(n, 4, 0.6, 1)
    mid = bp(pink(n), 150, 2500 * bright) * smoothrand(n, 6, 0.7, 1.0) * 1.7         # gầm (dải trung — loa TV nghe rõ)
    throat = bp(white(n), 280, 750) * (0.75 + 0.25 * np.sin(2 * np.pi * 17 * t + 3 * smoothrand(n, 2))) * 0.5   # "rú" rung phành phạch
    hiss = hp(white(n), 3000) * 0.1 * bright
    return rum + mid + throat + hiss + crackle(n) * 0.3 * bright


def make_roar(d=9.5):
    n = int(d * SR)
    st = np.array([roar_layer(n), roar_layer(n)])
    st = np.tanh(norm(st) * 2.2)                                                    # bão hoà ⇒ dày, "rú"
    return loopify(st, 1.2)


def make_ignite(d=5.0):
    n = int(d * SR); t = np.arange(n) / SR; out = []
    for ch in range(2):
        crack = hp(white(n), 1500) * np.exp(-t / 0.012) * 1.4                        # nổ đanh
        boom = (np.sin(2 * np.pi * (58 * np.exp(-t / 0.9) + 26) * t) * np.exp(-t / 0.9) * 1.3 + lp(brown(n), 220) * np.exp(-t / 1.2) * 1.6)
        rise = np.clip(t / 1.6, 0, 1) ** 1.5
        roar = svf(roar_layer(n), 250 + 4200 * rise, 0.7) * rise * 1.1               # gầm dâng lên, sáng dần
        out.append(crack + boom + roar)
    st = np.tanh(np.array(out) * 1.3)
    st[:, -int(0.6 * SR):] *= np.linspace(1, 0.85, int(0.6 * SR))                   # đuôi nối vào vòng lặp roar
    return st


def make_steam(d=7.0):                                                             # mây khói cuồn cuộn tràn ra
    n = int(d * SR); t = np.arange(n) / SR; out = []
    env = np.minimum(1, t / 0.5) * np.exp(-np.maximum(0, t - 0.5) / 2.6)
    for ch in range(2):
        x = svf(pink(n), 6500 * np.exp(-t / 2.2) + 500, 0.8) * env
        boil = lp(brown(n), 300) * env * smoothrand(n, 5, 0.5, 1) * 0.9               # sôi ùng ục
        out.append(x + boil)
    return reverb(np.array(out), 1.6, 0.3, 5000)


def make_flyby(d=4.0, peak=1.3):                                                   # tàu vút qua máy quay (đổi tần kiểu Doppler + lia trái → phải)
    n = int(d * SR); t = np.arange(n) / SR
    env = np.exp(-((t - peak) / 0.55) ** 2) * 1.0 + np.exp(-np.maximum(0, t - peak) / 1.4) * (t > peak) * 0.45
    fc = 600 + 3200 / (1 + np.exp((t - peak) * 3.5))
    mono = np.tanh(svf(roar_layer(n, 1.3), fc, 1.2, "bp") * 3.0) * env
    pp = np.tanh((t - peak) * 1.6)
    return np.array([mono * np.cos((pp + 1) * np.pi / 4), mono * np.sin((pp + 1) * np.pi / 4)])


def make_warp(d=3.6, hit=1.5):                                                     # nhảy tốc độ: dâng vút → "thoom" → lấp lánh
    n = int(d * SR); t = np.arange(n) / SR; out = []
    f = 70 * (1200 / 70) ** np.clip(t / hit, 0, 1) ** 2.2
    swell = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.clip(t / hit, 0, 1) ** 2 * (t < hit + 0.05)
    for ch in range(2):
        wh = svf(white(n), 300 + 6000 * np.clip(t / hit, 0, 1) ** 2, 1.5, "bp") * np.clip(t / hit, 0, 1) ** 1.5 * (t < hit + 0.08)
        tb = np.maximum(0, t - hit)
        thoom = (np.sin(2 * np.pi * (70 * np.exp(-tb / 0.4) + 32) * tb) * np.exp(-tb / 0.7) * 1.6 + lp(brown(n), 180) * np.exp(-tb / 0.5)) * (t >= hit)
        shim = sum(np.sin(2 * np.pi * fr * tb + rng.uniform(0, 6)) for fr in rng.uniform(3000, 7000, 8)) * 0.05 * np.exp(-tb / 0.9) * (t >= hit)
        out.append(swell * 0.35 + wh * 0.6 + thoom + shim)
    return reverb(np.tanh(np.array(out) * 1.2), 1.5, 0.25, 6000)


print("tổng hợp tiếng intro …", flush=True)
save("wind", make_wind(), 0.8)
save("factory", make_factory(), 0.8)
save("birds", make_birds(), 0.8)
save("vent", make_vent(), 0.8)
save("roar", make_roar(), 0.95, rms_db=-10.5)
save("ignite", make_ignite(), 0.98, rms_db=-9.5)
save("steam", make_steam(), 0.9, rms_db=-16)
save("flyby", make_flyby(), 0.95, rms_db=-12)
save("warp", make_warp(), 0.95, rms_db=-13)
for f in os.listdir(TMP): os.remove(os.path.join(TMP, f))
os.rmdir(TMP)
print("xong.", flush=True)

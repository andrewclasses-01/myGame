# -*- coding: utf-8 -*-
"""
Tiếng MẪU 6 (thầy 26/9/2026) — TÊN LỬA tấn công giữa 2 tàu. Ghi mp3 vào rocket-race/game6/sfx/.
  mcharge  nạp 1 quả (đúng 3 câu liền): năng lượng dâng vút → đập "thoom" + ngân kim loại + tia điện lách tách
  mload    lên nòng: xì hơi mở khoang → mô-tơ bệ nâng rít lên → khớp "cạch" chắc nịch
  mlaunch  phóng: nổ mồi → gầm phụt → vút xa dần (đổi tần kiểu Doppler)
  mwarn    còi khoá mục tiêu (bíp ngắn, lặp dồn dập khi sắp trúng)
  mdodge   né: vút gió nhanh + đốt sau ngắn
Chạy: python -X utf8 tools/tao-am-thanh-6.py   (numpy + scipy; ffmpeg ở E:\\LAP TRINH APP\\MODEL\\ffmpeg)
"""
import os, importlib.util
import numpy as np

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("ti", os.path.join(HERE, "tao-am-thanh-intro.py"))
ti = importlib.util.module_from_spec(spec); spec.loader.exec_module(ti)
SR, white, brown, pink, lp, hp, bp, svf, reverb, crackle, roar_layer = ti.SR, ti.white, ti.brown, ti.pink, ti.lp, ti.hp, ti.bp, ti.svf, ti.reverb, ti.crackle, ti.roar_layer
SRC_TMP = ti.TMP
ti.OUT = os.path.join(HERE, "..", "rocket-race", "game6", "sfx"); ti.TMP = os.path.join(ti.OUT, "_wav"); os.makedirs(ti.TMP, exist_ok=True)


def T(d): return np.arange(int(d * SR)) / SR
def sweep(f0, f1, d, curve=1.0):
    t = T(d); k = (t / d) ** curve; f = f0 * (f1 / f0) ** k
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def env(n, att, tau, hold=0.0):
    t = np.arange(n) / SR
    a = np.clip(t / max(att, 1e-4), 0, 1)
    return a * np.where(t < att + hold, 1.0, np.exp(-(t - att - hold) / tau))
def place(n, snd, at):
    out = np.zeros(n); i = int(at * SR); m = min(len(snd), n - i); out[i:i + m] += snd[:m]; return out
def modal(freqs, taus, amps, d):
    t = T(d); return sum(a * np.sin(2 * np.pi * f * t + np.random.uniform(0, 6.28)) * np.exp(-t / tau) for f, tau, a in zip(freqs, taus, amps))


def make_charge(d=1.8, hit=0.46):
    n = int(d * SR); out = []
    for ch in range(2):
        m = int(hit * SR); t = np.arange(m) / SR; k = t / hit
        rise = sum(sweep(150 * h, 1300 * h, hit, 1.6) / h for h in (1, 2, 3)) * k ** 2 * 0.5         # năng lượng dâng
        hiss = svf(white(m), 500 + 5500 * k ** 2, 2.0, "bp") * k ** 2.5 * 0.6
        pre = np.concatenate([rise + hiss, np.zeros(n - m)])
        tt = np.arange(n - m) / SR
        thoom = np.sin(2 * np.pi * (70 * np.exp(-tt / 0.2) + 42) * tt) * np.exp(-tt / 0.4) * 1.5     # đập trầm
        crack = hp(white(n - m), 1500) * np.exp(-tt / 0.012) * 1.2
        ring = modal([523, 784, 1046, 1568, 2093], [0.7, 0.55, 0.45, 0.3, 0.2], [0.35, 0.3, 0.22, 0.15, 0.1], (n - m) / SR) * 0.8   # ngân kim loại (trưởng)
        zap = crackle(n - m, 160, 1800) * np.exp(-tt / 0.35) * 0.7                                   # tia điện
        post = np.concatenate([np.zeros(m), thoom + crack + ring + zap])
        out.append(pre + post)
    return reverb(np.tanh(np.array(out) * 1.2), 1.6, 0.25, 5000)


def make_load(d=1.6):
    n = int(d * SR); out = []
    for ch in range(2):
        tt = T(0.35)
        hiss = hp(white(len(tt)), 2500) * np.exp(-tt / 0.1) * 0.6                                  # xì hơi mở khoang
        ms = 0.55; t2 = T(ms)
        f = 140 + 260 * (t2 / ms) ** 0.8
        motor = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.18 + np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * 0.15
        motor = lp(motor, 1800) * np.minimum(1, t2 / 0.04) * np.minimum(1, (ms - t2) / 0.05)          # mô-tơ bệ nâng rít lên
        t3 = T(0.9)
        clunk = np.sin(2 * np.pi * (95 * np.exp(-t3 / 0.05) + 55) * t3) * np.exp(-t3 / 0.12) * 1.2 + \
            modal([310, 740, 1190, 1870], [0.35, 0.25, 0.18, 0.1], [0.4, 0.3, 0.2, 0.12], 0.9) * 0.6 + \
            hp(white(len(t3)), 1200) * np.exp(-t3 / 0.008) * 0.8                                    # khớp "cạch"
        out.append(place(n, hiss, 0) + place(n, motor, 0.3) + place(n, clunk, 0.86))
    return reverb(np.array(out), 1.0, 0.18, 5000)


def make_launch(d=3.6):
    n = int(d * SR); t = np.arange(n) / SR; out = []
    for ch in range(2):
        pop = hp(white(n), 900) * np.exp(-t / 0.015) * 1.4 + np.sin(2 * np.pi * (90 * np.exp(-t / 0.08) + 40) * t) * np.exp(-t / 0.25) * 1.2
        e = np.minimum(1, t / 0.05) * np.exp(-np.maximum(0, t - 0.5) / 0.9)
        roar = svf(roar_layer(n, 1.2), 4500 * np.exp(-t / 1.2) + 600, 0.8) * e * 1.3 + crackle(n, 300, 1000) * e * 0.4
        dop = 1800 * np.exp(-t / 0.9) + 250                                                           # vút xa dần
        whoosh = svf(pink(n), dop, 1.4, "bp") * np.exp(-t / 1.1) * 0.8
        pan_ = (0.6 + 0.4 * np.clip(t / 1.5, 0, 1)) if ch else (1 - 0.4 * np.clip(t / 1.5, 0, 1))
        out.append((pop + roar + whoosh) * pan_)
    return reverb(np.tanh(np.array(out) * 1.2), 1.8, 0.25, 4000)


def make_warn(d=0.2):
    t = T(d); tone = np.sin(2 * np.pi * 1760 * t) * 0.8 + np.sin(2 * np.pi * 3520 * t) * 0.15
    e = np.minimum(1, t / 0.004) * np.minimum(1, np.maximum(0, 0.11 - t) / 0.01)
    x = tone * e
    return np.array([x, x])


def make_dodge(d=1.4):
    n = int(d * SR); t = np.arange(n) / SR; out = []
    for ch in range(2):
        fc = np.where(t < 0.18, 300 * (4200 / 300) ** (t / 0.18), 4200 * (500 / 4200) ** np.minimum(1, (t - 0.18) / 0.7))
        sw = svf(white(n), fc, 1.8, "bp") * np.exp(-((t - 0.18) / 0.3) ** 2) * 1.1
        burn = svf(roar_layer(n, 1.0), 3000 * np.exp(-t / 0.4) + 500, 0.8) * np.minimum(1, t / 0.03) * np.exp(-t / 0.45) * 0.8
        p = np.clip(t / 0.5, 0, 1); out.append((sw + burn) * ((1 - 0.5 * p) if ch == 0 else (0.5 + 0.5 * p)))
    return reverb(np.array(out), 1.2, 0.2, 5000)


print("tiếng mẫu 6 …", flush=True)
ti.save("mcharge", make_charge(), 0.95, rms_db=-13)
ti.save("mload", make_load(), 0.9, rms_db=-16)
ti.save("mlaunch", make_launch(), 0.95, rms_db=-12)
ti.save("mwarn", make_warn(), 0.7, rms_db=-16)
ti.save("mdodge", make_dodge(), 0.92, rms_db=-14)
for f in os.listdir(ti.OUT):
    if f.endswith(".ogg") and f[:-4] in ("mcharge", "mload", "mlaunch", "mwarn", "mdodge"): os.remove(os.path.join(ti.OUT, f))
for d_ in (ti.TMP, SRC_TMP):
    if os.path.isdir(d_):
        for f in os.listdir(d_): os.remove(os.path.join(d_, f))
        os.rmdir(d_)
print("xong.", flush=True)

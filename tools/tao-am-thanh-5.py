# -*- coding: utf-8 -*-
"""
Tiếng cho MẪU 5 (Rocket Race game hoàn chỉnh, thầy 26/9/2026) — dùng lại bộ tổng hợp của tools/tao-am-thanh-intro.py.
  MỚI:  startboom (bấm START: "bùm" nhỏ) · tuc (đếm 3-2-1: "túc") · warp (vượt ánh sáng làm lại cho THẬT — thầy: bản cũ "giả tạo")
        game5/sfx/stall.mp3 (trả lời SAI: động cơ nổ khục "giắt giắt" — thay tiếng khựng có kim loại nghe như CHUÔNG)
  GIỮ:  wind · factory · birds · vent · roar · ignite · steam · flyby (chép từ assets/sound-intro)
Ra: rocket-race/assets/sound-5/*.ogg|mp3 + rocket-race/game5/sfx/stall.mp3        Chạy: python -X utf8 tools/tao-am-thanh-5.py
"""
import os, shutil, importlib.util, subprocess
import numpy as np

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("ti", os.path.join(HERE, "tao-am-thanh-intro.py"))
ti = importlib.util.module_from_spec(spec); spec.loader.exec_module(ti)
SR, T, white, brown, pink, lp, hp, bp, norm, svf, reverb, crackle, roar_layer, smoothrand = (ti.SR, ti.T, ti.white, ti.brown, ti.pink, ti.lp, ti.hp, ti.bp,
    ti.norm, ti.svf, ti.reverb, ti.crackle, ti.roar_layer, ti.smoothrand)
rng = np.random.default_rng(55)
SRC = ti.OUT
OUT = os.path.join(HERE, "..", "rocket-race", "assets", "sound-5"); os.makedirs(OUT, exist_ok=True)
ti.OUT = OUT; ti.TMP = os.path.join(OUT, "_wav"); os.makedirs(ti.TMP, exist_ok=True)


def make_startboom(d=1.4):                     # "bùm" nhỏ, tròn, gọn — xác nhận bấm START
    n = int(d * SR); t = np.arange(n) / SR; out = []
    for ch in range(2):
        body = np.sin(2 * np.pi * (95 * np.exp(-t / 0.12) + 48) * t) * np.exp(-t / 0.22)
        thud = lp(brown(n), 260) * np.exp(-t / 0.18) * 0.9
        click = hp(white(n), 2500) * np.exp(-t / 0.006) * 0.35
        knock = bp(white(n), 160, 1100) * np.exp(-t / 0.07) * 1.1 + np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.06) * 0.6   # thân tiếng dải trung — loa TV nghe rõ
        out.append(body + thud + click + knock)
    return reverb(np.array(out), 0.9, 0.18, 3000)


def make_tuc(d=0.45):                          # "túc": gõ gỗ/cơ khí khô, có thân cộng hưởng ngắn
    n = int(d * SR); t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * 620 * t) * np.exp(-t / 0.035) + np.sin(2 * np.pi * 1240 * t + 1) * np.exp(-t / 0.02) * 0.45
         + np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.05) * 0.6 + bp(white(n), 1500, 5000) * np.exp(-t / 0.004) * 0.5)
    return reverb(np.array([y, y]), 0.6, 0.15, 4000)


def make_warp(d=4.2, hit=1.5):
    """vượt ánh sáng THẬT: không khí bị HÚT vào (tiếng vang đảo ngược) + luồng gió gầm dồn nén → NỔ ÁP SUẤT trầm
       (sóng xung kích) + gió quật + dư chấn rền. Không sóng sin quét, không tiếng lấp lánh (nghe giả)."""
    n = int(d * SR); t = np.arange(n) / SR; out = []
    for ch in range(2):
        # 1) hút vào: một cú nổ nhiễu → vang dài → ĐẢO NGƯỢC ⇒ dâng dồn về đúng điểm nổ
        m = int(hit * SR); b = np.zeros(m); b[: int(0.05 * SR)] = white(int(0.05 * SR)) * np.hanning(int(0.05 * SR))
        ir = white(m) * np.exp(-np.arange(m) / SR / 0.45)
        suck = np.convolve(b, ir)[:m][::-1]; suck = hp(lp(suck, 7000), 180); suck = norm(suck) * np.linspace(0.2, 1, m) ** 1.5
        # 2) luồng khí gầm dồn nén: rền + gió sáng dần tới điểm nổ
        rise = np.clip(t / hit, 0, 1) ** 2.2 * (t < hit + 0.03)
        rush = svf(pink(n), 180 + 5200 * rise, 0.8) * rise * 0.8 + lp(brown(n), 90) * rise * 0.9
        # 3) nổ áp suất: xung trầm (đáy 28 Hz) + đập không khí + vỡ tiếng xé gió
        tb = np.maximum(0, t - hit); on = (t >= hit)
        blast = (lp(brown(n), 140) * np.exp(-tb / 0.35) * 2.0 + np.sin(2 * np.pi * (44 * np.exp(-tb / 0.25) + 28) * tb) * np.exp(-tb / 0.45) * 1.6) * on
        crack = hp(white(n), 900) * np.exp(-tb / 0.03) * 0.9 * on
        gust = svf(pink(n), 4200 * np.exp(-tb / 0.35) + 250, 0.7) * np.exp(-tb / 0.7) * 2.2 * on
        body = bp(white(n), 150, 900) * np.exp(-tb / 0.25) * 1.3 * on                    # đập không khí dải trung
        tail = lp(brown(n), 70) * np.exp(-tb / 1.2) * 0.7 * on + crackle(n, 120, 1500) * np.exp(-tb / 0.4) * 0.25 * on
        sk = np.zeros(n); sk[:m] = suck
        out.append(sk * 1.3 + rush + blast * 0.8 + crack + gust + body + tail)
    st = np.array(out)
    return reverb(np.tanh(st * 1.4), 1.8, 0.22, 3500)


def make_sputter(d=1.3):
    """trả lời SAI: động cơ nổ khục "giắt giắt" — 5–6 cú phụt gầm cụt, nhịp lệch, xen tiếng nổ ngược (pốp) + xì khói"""
    n = int(d * SR); t = np.arange(n) / SR; out = []
    hits = [0.0];
    while hits[-1] < d - 0.35: hits.append(hits[-1] + rng.uniform(0.11, 0.2))
    for ch in range(2):
        x = np.zeros(n); base = roar_layer(n, 1.2)
        for k, h in enumerate(hits):
            L = rng.uniform(0.06, 0.1); tt = t - h
            g = np.where((tt >= 0) & (tt < L), np.minimum(1, tt / 0.004) * np.exp(-np.maximum(tt, 0) / (L * 0.6)), 0)
            x += base * g * (1 - k * 0.08)
            pop = lp(brown(n), 300) * np.where(tt >= 0, np.exp(-np.maximum(tt, 0) / 0.03), 0) * (tt < 0.2) * (1.4 if k % 2 == 0 else 0.7)
            x += pop
        x += hp(white(n), 2000) * np.exp(-t / 0.5) * 0.08                       # xì khói
        out.append(x)
    return np.tanh(np.array(out) * 1.2)


print("tiếng mẫu 5 …", flush=True)
ti.save("startboom", make_startboom(), 0.9, rms_db=-15)
ti.save("tuc", make_tuc(), 0.85)
ti.save("warp", make_warp(), 0.97, rms_db=-11)
ti.save("stall", make_sputter(), 0.92, rms_db=-12)
# giữ nguyên các tiếng intro khác
for nm in ["wind", "factory", "birds", "vent", "roar", "ignite", "steam", "flyby"]:
    for ext in ("ogg", "mp3"): shutil.copy2(os.path.join(SRC, f"{nm}.{ext}"), os.path.join(OUT, f"{nm}.{ext}"))
# tiếng SAI của game: thay stall.mp3 trong bản rẽ nhánh game5 (game đọc mp3)
shutil.move(os.path.join(OUT, "stall.mp3"), os.path.join(HERE, "..", "rocket-race", "game5", "sfx", "stall.mp3"))
os.remove(os.path.join(OUT, "stall.ogg"))
for d_ in (ti.TMP, os.path.join(SRC, "_wav")):
    if os.path.isdir(d_):
        for f in os.listdir(d_): os.remove(os.path.join(d_, f))
        os.rmdir(d_)
print("xong.", flush=True)

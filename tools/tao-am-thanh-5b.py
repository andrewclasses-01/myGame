# -*- coding: utf-8 -*-
"""
Tiếng MẪU 5b (thầy 26/9/2026): "bấm START cần phải là tiếng NỔ THẬT như kiểu tàu nổ tăng tốc".
  startboom ⇒ nổ đanh + bùng trầm + luồng gầm động cơ phụt mạnh (lách tách) rồi vút đi — dải trung đủ cho loa TV.
Các tiếng khác giữ như mẫu 5 (đã chép sẵn sang assets/sound-5b).    Chạy: python -X utf8 tools/tao-am-thanh-5b.py
"""
import os, importlib.util
import numpy as np

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("ti", os.path.join(HERE, "tao-am-thanh-intro.py"))
ti = importlib.util.module_from_spec(spec); spec.loader.exec_module(ti)
SR, white, brown, pink, lp, hp, bp, svf, reverb, crackle, roar_layer = ti.SR, ti.white, ti.brown, ti.pink, ti.lp, ti.hp, ti.bp, ti.svf, ti.reverb, ti.crackle, ti.roar_layer
SRC_TMP = ti.TMP
ti.OUT = os.path.join(HERE, "..", "rocket-race", "assets", "sound-5b"); ti.TMP = os.path.join(ti.OUT, "_wav"); os.makedirs(ti.TMP, exist_ok=True)


def make_startblast(d=2.4):
    n = int(d * SR); t = np.arange(n) / SR; out = []
    for ch in range(2):
        crack = hp(white(n), 1200) * np.exp(-t / 0.01) * 1.6                                   # nổ đanh
        boom = (np.sin(2 * np.pi * (80 * np.exp(-t / 0.15) + 34) * t) * np.exp(-t / 0.45) * 1.4
                + lp(brown(n), 200) * np.exp(-t / 0.35) * 1.5)                                   # bùng trầm
        punch = bp(white(n), 180, 1200) * np.exp(-t / 0.09) * 1.3                               # đập không khí dải trung
        env = np.minimum(1, t / 0.03) * np.exp(-np.maximum(0, t - 0.25) / 0.6)                  # gầm phụt mạnh rồi lịm
        thrust = svf(roar_layer(n, 1.3), 5500 * np.exp(-t / 0.9) + 400, 0.8) * env * 1.4 + crackle(n, 420, 900) * env * 0.5
        whoosh = svf(pink(n), 3000 * np.exp(-t / 0.5) + 300, 1.2, "bp") * np.exp(-t / 0.7) * 0.6  # vút đi
        out.append(crack + boom + punch + thrust + whoosh)
    return reverb(np.tanh(np.array(out) * 1.3), 1.4, 0.2, 4000)


print("tiếng mẫu 5b …", flush=True)
ti.save("startboom", make_startblast(), 0.97, rms_db=-11)
for d_ in (ti.TMP, SRC_TMP):
    if os.path.isdir(d_):
        for f in os.listdir(d_): os.remove(os.path.join(d_, f))
        os.rmdir(d_)
print("xong.", flush=True)

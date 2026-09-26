# -*- coding: utf-8 -*-
"""
Tiếng MẪU 6d (thầy 27/9/2026) — CHUÔNG BÁO ĐỘNG khi tên lửa phóng về phía đội mình, thay tiếng bíp "giả như làm bằng code".
Thầy: "tiếng chuông cảnh báo giống thật hơn, giống như chuông khẩn cấp, âm thanh điện ảnh".
3 kiểu để thầy nghe chọn, mỗi kiểu 2 file (nhịp thường lúc tên lửa đang bay + nhịp GẤP 1,5 s cuối):
  a  KLAXON tàu ngầm/tàu chiến — rô-to đập màng loa, cao độ vút lên "AOOO-GA", loa kèn kim loại, vang trong thân tàu
  b  CÒI BÁO ĐỘNG ĐỎ — "whoop" vút lên qua loa phát thanh (dải hẹp, rè nhẹ), 2 loa lệch nhau, vang hội trường lớn
  c  CHUÔNG ĐIỆN khẩn cấp — búa gõ ~20 lần/giây vào chuông thép (các hoạ âm lệch như chuông thật) + tiếng lạch cạch cơ khí
Ghi rocket-race/game6d/sfx/malarm_{a,b,c}.mp3 + malarmf_{a,b,c}.mp3. Chạy: python -X utf8 tools/tao-am-thanh-6d.py
"""
import os, importlib.util
import numpy as np
import scipy.signal as ss

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("ti", os.path.join(HERE, "tao-am-thanh-intro.py"))
ti = importlib.util.module_from_spec(spec); spec.loader.exec_module(ti)
SR, white, lp, hp, bp, reverb = ti.SR, ti.white, ti.lp, ti.hp, ti.bp, ti.reverb
SRC_TMP = ti.TMP
ti.OUT = os.path.join(HERE, "..", "rocket-race", "game6d", "sfx"); ti.TMP = os.path.join(ti.OUT, "_wav"); os.makedirs(ti.TMP, exist_ok=True)
rng = np.random.default_rng(627)


def T(d): return np.arange(int(d * SR)) / SR
def peak(x, f, q):                                   # cộng hưởng (màng loa / loa kèn / vỏ kim loại)
    b, a = ss.iirpeak(f, q, fs=SR); return ss.lfilter(b, a, x)
def jitter(n, amt, rate):                            # rung cao độ ngẫu nhiên mượt (máy thật không bao giờ đều tuyệt đối)
    k = max(2, int(n / SR * rate) + 2); pts = rng.standard_normal(k)
    return 1 + amt * np.interp(np.linspace(0, k - 1, n), np.arange(k), pts)
def early(st, taps):                                 # phản xạ sớm (vách thép gần) — trễ ms, độ lớn
    out = st.copy()
    for ms, g in taps:
        i = int(ms / 1000 * SR); out[:, i:] += st[:, :-i] * g
    return out


# ------------------------------------------------------------ a · KLAXON
def klaxon(d, f0, f1, f2, rise):
    n = int(d * SR); t = np.arange(n) / SR; out = []
    for ch in range(2):
        k = np.clip(t / (d * rise), 0, 1)
        f = np.where(t < d * rise, f0 * (f1 / f0) ** (k ** 0.55), f1 + (f2 - f1) * np.clip((t - d * rise) / (d * (1 - rise)), 0, 1))
        f = f * jitter(n, 0.012, 18)
        ph = np.cumsum(f) / SR
        # rô-to đập màng: chuỗi xung hẹp (giàu hoạ âm) + nửa tần số (lạch xạch cơ khí)
        pulse = (np.mod(ph, 1) < 0.14).astype(float) - 0.14
        rattle = (np.mod(ph * 0.5, 1) < 0.06).astype(float) * 0.35
        x = lp(pulse + rattle, 7000)
        x = peak(x, 620, 3.5) * 1.0 + peak(x, 1250, 5) * 0.8 + peak(x, 2350, 7) * 0.55 + peak(x, 3600, 9) * 0.25 + x * 0.15
        x = np.tanh(x * 2.6)
        env = np.minimum(1, t / 0.035) * np.minimum(1, np.maximum(0, d - t) / 0.07)
        out.append(hp(x * env, 180))
    st = np.array(out)
    st = early(st, [(19, 0.35), (31, 0.25), (47, 0.18)])            # vách thép gần trong thân tàu
    return st


def make_klaxon(fast):
    d = 0.4 if fast else 0.78
    s = klaxon(d, 190 if fast else 150, 460 if fast else 420, 400 if fast else 360, 0.6)
    s = np.concatenate([s, np.zeros((2, int(1.3 * SR)))], axis=1)
    return reverb(s, 1.9, 0.32, 5200)


# ------------------------------------------------------------ b · CÒI BÁO ĐỘNG ĐỎ (whoop)
def make_whoop(fast):
    d = 0.36 if fast else 0.7
    n = int(d * SR); t = np.arange(n) / SR; out = []
    f0, f1 = (520, 1050) if fast else (330, 880)
    for ch in range(2):
        voices = 0
        for dt_, g in ((0.0, 1.0), (0.0065 if ch else 0.0045, 0.8)):          # 2 loa ở xa nhau ⇒ lệch cao độ + trễ
            k = t / d
            f = f0 * (f1 / f0) ** (k ** 0.8) * (1 + dt_) * jitter(n, 0.004, 9)
            ph = np.cumsum(f) / SR
            saw = 2 * np.mod(ph, 1) - 1; sq = np.sign(np.sin(2 * np.pi * ph))
            v = saw * 0.6 + sq * 0.45
            sh = int(0.011 * SR * (1 + ch)); v = np.concatenate([np.zeros(sh), v[:-sh]]) if dt_ else v
            voices = voices + v * g
        x = bp(voices, 320, 5200, 2)                                     # loa phát thanh: dải hẹp
        x = peak(x, 1150, 4) * 0.9 + peak(x, 2400, 6) * 0.5 + x * 0.4
        x = np.tanh(x * 2.2)                                             # rè nhẹ (loa đẩy hết cỡ)
        env = np.minimum(1, t / 0.02) * np.minimum(1, np.maximum(0, d - t) / 0.03)
        out.append(x * env)
    st = early(np.array(out), [(23, 0.3), (41, 0.22), (67, 0.15)])
    st = np.concatenate([st, np.zeros((2, int(1.6 * SR)))], axis=1)
    return reverb(st, 2.4, 0.38, 4800)


# ------------------------------------------------------------ c · CHUÔNG ĐIỆN khẩn cấp
BELL = [(1.0, 0.9, 1.0), (2.76, 0.5, 0.55), (5.40, 0.28, 0.35), (8.93, 0.16, 0.2), (0.5, 1.4, 0.25)]   # tỉ lệ tần, tắt dần (s), độ lớn
def make_bell(fast):
    d = 0.5 if fast else 0.95
    rate = 26 if fast else 21
    tail = 1.3; n = int((d + tail) * SR); t = np.arange(n) / SR; out = []
    for ch in range(2):
        f0 = 1180 * (1.004 if ch else 1.0)
        exc = np.zeros(n)
        tt = 0.0
        while tt < d:                                                     # búa gõ: nhịp hơi lệch, lực hơi khác mỗi cú
            i = int(tt * SR); exc[i] += rng.uniform(0.75, 1.0)
            tt += 1 / rate * rng.uniform(0.94, 1.06)
        click = ss.lfilter([1], [1, -0.6], exc) ; click = hp(click * 1.0, 2500)
        tone = 0
        for r_, tau, a in BELL:
            fr = f0 * r_; w = 2 * np.pi * fr / SR; rr = np.exp(-1 / (tau * SR))
            tone = tone + ss.lfilter([a * np.sin(w)], [1, -2 * rr * np.cos(w), rr * rr], exc)   # mỗi hoạ âm = một bộ cộng hưởng
        hum = np.sin(2 * np.pi * 50 * t) * 0.05 * (t < d)                       # ù điện nhẹ của cuộn hút
        buzz = hp(white(n), 1800) * 0.03 * (t < d) * (0.6 + 0.4 * np.sin(2 * np.pi * rate * t))
        x = tone / (np.max(np.abs(tone)) + 1e-9) + click * 0.35 + hum + buzz
        x = np.tanh(x * 1.6)
        out.append(x)
    st = early(np.array(out), [(17, 0.3), (29, 0.2)])
    return reverb(st, 1.7, 0.3, 6500)


print("tiếng mẫu 6d …", flush=True)
for v, fn in (("a", make_klaxon), ("b", make_whoop), ("c", make_bell)):
    ti.save("malarm_" + v, fn(False), 0.95, rms_db=-15)
    ti.save("malarmf_" + v, fn(True), 0.95, rms_db=-14)
for f in os.listdir(ti.OUT):
    if f.endswith(".ogg") and f.startswith("malarm"): os.remove(os.path.join(ti.OUT, f))
for d_ in (ti.TMP, SRC_TMP):
    if os.path.isdir(d_):
        for f in os.listdir(d_): os.remove(os.path.join(d_, f))
        os.rmdir(d_)
print("xong.", flush=True)

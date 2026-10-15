# RACING WORDS — bộ cắt/ghép lặp/chuẩn độ to tiếng (15/10/2026). Đọc bản gốc ở thư mục sfx_cand (tải lại từ link trong speed-run/sfx/NGUON AM THANH.md), xuất ra speed-run/sfx/. Cần ffmpeg (E:/LAP TRINH APP/MODEL/ffmpeg) + numpy.
# Cắt + làm mượt + chuẩn độ to + xuất mp3 cho RACING WORDS (speed-run/sfx/). Tiếng lặp: ghép đầu-cuối chéo (crossfade) để lặp không lộ mối.
import os, sys, json, subprocess, numpy as np
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__)); C = os.path.join(HERE, "sfx_cand")
OUT = "E:/LAP TRINH APP/myGame/speed-run/sfx/"; os.makedirs(OUT, exist_ok=True)
FF = r"E:\LAP TRINH APP\MODEL\ffmpeg\ffmpeg.exe"; SR = 44100
def load(name, a=0, b=None):
    raw = subprocess.run([FF, "-v", "quiet", "-i", os.path.join(C, name + ".mp3"), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return x[int(a * SR): (int(b * SR) if b else None)]
def fade(x, fi=0.01, fo=0.05):
    n = len(x); i = min(int(fi * SR), n // 2); o = min(int(fo * SR), n // 2)
    if i: x[:i] *= np.linspace(0, 1, i)[:, None]
    if o: x[-o:] *= np.linspace(1, 0, o)[:, None] ** 1.5
    return x
def loopify(x, xf=0.6):
    k = int(xf * SR); body = x[:-k].copy(); tail = x[-k:]
    w = np.linspace(0, 1, k)[:, None]; body[:k] = body[:k] * np.sqrt(w) + tail * np.sqrt(1 - w); return body
def mix(*parts):
    n = max(len(p) + int(off * SR) for p, off, g in parts); y = np.zeros((n, 2), np.float32)
    for p, off, g in parts: o = int(off * SR); y[o:o + len(p)] += p * g
    return y
def lufs_norm(x, target):
    # độ to gần đúng theo RMS có trọng số đơn giản (đủ để cân tương quan), sau đó chặn đỉnh −1 dBFS
    r = np.sqrt((x ** 2).mean() + 1e-12); cur = 20 * np.log10(r) - 0.7
    y = x * 10 ** ((target - cur) / 20); pk = np.abs(y).max()
    if pk > 0.89: y = np.tanh(y / 0.89 * 1.0) * 0.89 if pk > 1.3 else y * (0.89 / pk)
    return y
def save(name, x, target, kbps=112, mono=False):
    y = lufs_norm(x.astype(np.float32), target)
    p = subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-ac", "1" if mono else "2", "-c:a", "libmp3lame", "-b:a", f"{kbps}k", OUT + name + ".mp3"], input=y.tobytes(), capture_output=True)
    if p.returncode: print("ERR", name, p.stderr.decode()[-300:]); return
    print(f"{name:18s} {len(y)/SR:6.2f}s  {os.path.getsize(OUT + name + '.mp3')//1024:4d} KB")

S = {}
# ---- INTRO ----
save("garage_ambience", loopify(load("garage_ambience_1", 10, 40.6), 0.8), -26)
door = np.concatenate([fade(load("roller_door_1", 1.2, 3.9), 0.02, 0.25), fade(load("roller_door_1", 15.85, 16.9), 0.005, 0.4)])
save("roller_door", door, -16)
save("lights_on", fade(load("lights_on_2", 0.0, 0.62), 0.002, 0.15), -14)
save("engine_start", fade(load("engine_start_1", 0.3, 5.6), 0.02, 1.2), -13)
save("rev_idle", loopify(load("rev_idle_1", 10, 20.6), 0.6), -18)
save("exhaust_pops", fade(load("exhaust_pops_1", 0, 1.6), 0.002, 0.4), -12)
save("drive_by", fade(load("drive_by_2", 7.6, 13.6), 0.5, 1.2), -12)
save("cinematic_hit", fade(load("cinematic_hit_1", 0.2, 5.6), 0.005, 1.6), -10)
save("start_lights", fade(load("start_lights_1", 0.0, 0.6), 0.003, 0.05), -17, mono=True)
save("go_stinger", fade(mix((load("go_stinger_1"), 0, 1.0), (fade(load("start_lights_1", 3.0, 3.9), 0.003, 0.2), 0, 0.5)), 0.003, 0.3), -11)
# ---- TRẬN ĐUA ----
save("engine_loop", loopify(load("rev_idle_1", 30, 38.6), 0.6), -18)
save("boost", fade(mix((load("boost_5", 0, 3.2), 0, 0.8), (load("boost_1", 0, 3.0), 0.05, 0.9)), 0.01, 1.0), -12)
save("tire_screech", fade(load("tire_screech_2", 5.0, 7.8), 0.05, 0.6), -14)
save("wind_rush", loopify(load("wind_rush_1", 2, 12.6), 0.6), -22)
save("landing_thud", fade(mix((load("landing_thud_2", 0, 1.8), 0, 1.0), (load("landing_thud_1", 0.15, 2.0), 0, 0.8)), 0.002, 0.6), -11)
save("crash_bump", fade(load("crash_bump_1"), 0.002, 0.15), -12)
save("missile_launch", fade(load("missile_launch_1", 0.05, 4.4), 0.01, 1.2), -12)
save("missile_flyby", fade(load("missile_flyby_4"), 0.01, 0.4), -14)
save("explosion", fade(load("explosion_2", 0, 5.0), 0.002, 1.5), -10)
save("fire_burn", loopify(load("fire_burn_1", 1, 9.6), 0.6), -22)
save("correct_answer", fade(load("correct_answer_1", 1.9, 3.95), 0.06, 0.25), -13)
save("wrong_answer", fade(load("wrong_answer_2", 0, 2.7), 0.005, 0.4), -14)
save("reload_clunk", fade(load("reload_clunk_4"), 0.002, 0.2), -15)
save("ui_click", fade(load("ui_click_2", 0, 0.5), 0.001, 0.15), -20)
save("win_stinger", fade(load("win_stinger_3"), 0.005, 1.5), -12)
save("crowd_cheer", fade(load("crowd_cheer_2", 0.3, 9.6), 0.3, 2.0), -16)
# ---- NHẠC ----
save("intro_music", fade(load("intro_music_1", 0, 15.5), 0.01, 2.2), -15, kbps=160)
save("race_music", fade(load("race_music_1"), 0.05, 0.05), -16, kbps=128)
save("result_music", fade(load("result_music_1"), 0.01, 1.5), -15, kbps=160)

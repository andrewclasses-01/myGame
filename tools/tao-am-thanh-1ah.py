# -*- coding: utf-8 -*-
"""
TIẾNG THU THẬT cho TRAIN RUSH mẫu 1ah (thầy 30/9/2026):
  "Âm thanh hiện tại toàn là âm thanh hoạt hình… Hãy thay toàn bộ âm thanh cũ. Hãy sử dụng âm thanh thật, xịn, chuẩn điện ảnh
   cho mọi hiệu ứng và nhạc nền cho game… toát lên được không gian của miền tây hoang dã. Phong cách hùng tráng, điện ảnh."
Thầy chọn: kho miễn phí bản quyền · Fight: tiếng 2 đội chung ở giữa · nhạc suốt trận, nhỏ dưới hiệu ứng.

Nguồn:  • hiệu ứng: Freesound, CHỈ lấy giấy phép CC0 (đã kiểm từng trang) — bản nghe thử chất lượng cao (-hq.ogg)
        • nhạc: Pixabay (Pixabay Content License — dùng trong game miễn phí, không phải ghi tên), tác giả Sonican
Việc:   tải nguồn (nếu chưa có) → cắt đoạn hay → vòng lặp LIỀN (đúng bội số nhịp, trộn đè đuôi vào đầu) → cân độ to → nén .ogg
Ra:     balloon-pop/assets/sound-1ah/*.ogg + NGUON.md (bảng nguồn từng file)
Chạy:   python -X utf8 tools/tao-am-thanh-1ah.py        (~1 phút; nguồn gốc để ở %LOCALAPPDATA%\\myGame-nguon-am-thanh, KHÔNG vào kho)
"""
import os, subprocess, urllib.request
import numpy as np
from scipy.io import wavfile

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "balloon-pop", "assets", "sound-1ah")
SRC = os.path.join(os.environ.get("LOCALAPPDATA", ROOT), "myGame-nguon-am-thanh")
TMP = os.path.join(SRC, "_wav")
FFMPEG = r"E:\LAP TRINH APP\MODEL\ffmpeg\ffmpeg.exe"
os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)

# ------------------------------------------------------------------ nguồn Freesound (CC0): id → (url bản -hq, tác giả, tên gốc)
FS = {
  17502: ("17/17502_60285", "Jace", "Coin dropping.wav"),
  19830: ("19/19830_24837", "stijn", "Crate1.wav"),
  60013: ("60/60013_71257", "qubodup", "Whoosh"),
  69571: ("69/69571_706955", "Bidone", "Lions two.mp3"),
  71778: ("71/71778_706955", "Bidone", "Steam Whistle.mp3"),
  82121: ("82/82121_303507", "Gniffelbaf", "Balloon-Burst-07.wav"),
  84744: ("84/84744_57789", "cognito perceptu", "passenger train bells.wav"),
  108676: ("108/108676_1882758", "Hotlavaman", "SpadeCoal.wav"),
  156414: ("156/156414_1661766", "felix.blume", "Wind blowing into some cactus spine … desert of Atacama (Chile)"),
  163459: ("163/163459_2965892", "LittleBigSounds", "LBS_FX DOG Small Alert Bark001.wav"),
  163727: ("163/163727_1661766", "felix.blume", "Cow mooing in south of France (Limousin)"),
  169867: ("169/169867_2834921", "Halgrimm", "swoosh"),
  177253: ("177/177253_276010", "JosephSardin", "Cow moos"),
  181868: ("181/181868_57789", "cognito perceptu", "train screech.wav"),
  188033: ("188/188033_3403708", "AntumDeluge", "Ticking Clock"),
  188240: ("188/188240_44431", "gadzooks", "steam-train-whistle.wav"),
  209578: ("209/209578_2558531", "Zott820", "Cash Register Purchase"),
  222517: ("222/222517_71257", "qubodup", "Dramatic Hit"),
  234782: ("234/234782_3501487", "wubitog", "Steam/hiss"),
  257752: ("257/257752_2276808", "Kodack", "Wooden Ship Break"),
  257858: ("257/257858_257367", "tompallant", "Pig_Grunts_Snorts_Breathing_Hackney_City_Farm.wav"),
  264059: ("264/264059_2971294", "Paul368", "Epic Hit Big.wav"),
  316920: ("316/316920_4921277", "Rudmer_Rotteveel", "Chicken Single Alarm Call"),
  347036: ("347/347036_1708499", "Kubuzz", "horse's whinny"),
  353233: ("353/353233_5477651", "Sojan", "Ship Bell Single Ring"),
  369394: ("369/369394_5622625", "Terry93D", "Timpani C2"),
  385912: ("385/385912_7097737", "Pól", "S035_Camels_Mono.wav"),
  386766: ("386/386766_5768130", "ken788", "Dog_Barking.wav"),
  387232: ("387/387232_1474204", "steaq", "Badge Coin Win"),
  397434: ("397/397434_4019029", "FoolBoyMedia", "Crowd Cheer"),
  398430: ("398/398430_3862281", "NaturesTemper", "Wolf howl"),
  427803: ("427/427803_2866779", "DeVern", "Cinematic Hit With Horns.wav"),
  437111: ("437/437111_2524442", "craigsmith", "G38-16-Four Horse Snorts.wav"),
  438331: ("438/438331_2524442", "craigsmith", "G26-12a-Wood Splinters.wav"),
  442907: ("442/442907_71257", "qubodup", "Pig Grunt"),
  449955: ("449/449955_9159316", "Breviceps", "Wooden Thud (Mono)"),
  457294: ("457/457294_300738", "brunoboselli", "Air (or steam) pressure release"),
  458398: ("458/458398_9159316", "Breviceps", "Balloon Pop / Christmas cracker / Confetti Cannon"),
  479549: ("479/479549_2524442", "craigsmith", "R15-63-Yee-Haws and Whooping.wav"),
  479610: ("479/479610_2524442", "craigsmith", "R30-34-Red Tailed Hawk.wav"),
  480820: ("480/480820_2524442", "craigsmith", "R20-40-Constant Steam Train.wav"),
  500902: ("500/500902_6714882", "Bertsz", "Wood Crate Destory 1"),
  507467: ("507/507467_2977885", "Danjocross", "Angry Elephant.aiff"),
  510903: ("510/510903_11157357", "Lydmakeren", "Horse_neighing.wav"),
  527845: ("527/527845_11431915", "D.jones", "Elephant Trumpets Growls.flac"),
  529925: ("529/529925_11751070", "SciFiSounds", "Whip Crack.m4a"),
  536777: ("536/536777_1415754", "egomassive", "Smash.ogg"),
  559600: ("559/559600_11490791", "Podcapocalipsis", "LION ROAR"),
  564626: ("564/564626_887696", "D4XX", "Wild Horses Galopp"),
  564628: ("564/564628_887696", "D4XX", "Single Horse Galopp"),
  575524: ("575/575524_11447152", "1888software", "red-tailed-hawk.wav"),
  648720: ("648/648720_2397507", "itinerantmonk108", "Bi-plane flyby.wav"),
  667654: ("667/667654_3271378", "DeltaCode", "wooden-crate-impact2.wav"),
  667655: ("667/667655_3271378", "DeltaCode", "wooden-crate-impact1.wav"),
  683101: ("683/683101_6253486", "florianreichelt", "quick woosh"),
  715353: ("715/715353_8698658", "AudioPapkin", "Riser Hit sfx 062"),
}
# nhạc Pixabay (Sonican): tên file đích → (đường dẫn tải, tên bài)
PX = {
  "m432161": ("https://cdn.pixabay.com/download/audio/2025/11/06/audio_788831e280.mp3", "Orchestral Western Adventure Cinematic Soundtrack", "https://pixabay.com/music/adventure-orchestral-western-adventure-cinematic-soundtrack-432161/"),
  "m438089": ("https://cdn.pixabay.com/download/audio/2025/11/17/audio_c9a2a7bc24.mp3", "Orchestral Western Adventurous Cinematic Loop", "https://pixabay.com/music/acoustic-group-orchestral-western-adventurous-cinematic-loop-438089/"),
  "m292157": ("https://cdn.pixabay.com/download/audio/2025/01/24/audio_446360c5d5.mp3", "Cinematic Western - Duel Adventure", "https://pixabay.com/music/main-title-cinematic-western-duel-adventure-292157/"),
  "m294750": ("https://cdn.pixabay.com/download/audio/2025/01/30/audio_439c17211f.mp3", "Orchestral Western Loop - Duel Adventure", "https://pixabay.com/music/adventure-orchestral-western-loop-duel-adventure-294750/"),
  "m433972": ("https://cdn.pixabay.com/download/audio/2025/11/10/audio_9346c7ddb8.mp3", "Epic Hybrid Western Trailer Loop - Glorious Victory", "https://pixabay.com/music/build-up-scenes-epic-hybrid-western-trailer-loop-glorious-victory-433972/"),
}

def fetch(name, url):
    p = os.path.join(SRC, name)
    if not os.path.exists(p):
        print("  tải", name)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as r, open(p + ".part", "wb") as f: f.write(r.read())
        os.replace(p + ".part", p)
    return p

def load(fid, mono=True):
    p = fetch(f"{fid}.ogg", f"https://cdn.freesound.org/previews/{FS[fid][0]}-hq.ogg")
    raw = subprocess.run([FFMPEG, "-v", "quiet", "-i", p, "-ac", "1" if mono else "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64)
    return x if mono else x.reshape(-1, 2)

def seg(x, a, b=None): return x[int(a * SR): (int(b * SR) if b is not None else len(x))].copy()

def fade(x, fi=0.005, fo=0.03):
    n = len(x); i = min(n, int(fi * SR)); o = min(n, int(fo * SR))
    if i: x[:i] *= np.linspace(0, 1, i)[:, None] if x.ndim > 1 else np.linspace(0, 1, i)
    if o: x[-o:] *= (np.linspace(1, 0, o) ** 1.5)[:, None] if x.ndim > 1 else np.linspace(1, 0, o) ** 1.5
    return x

def hp(x, f=35):   # bỏ rung trầm vô nghĩa (gió thổi mic)
    import scipy.signal as ss
    b, a = ss.butter(2, f / (SR / 2), "high")
    return ss.filtfilt(b, a, x, axis=0)

def peak(x, db=-1.0): return x * (10 ** (db / 20) / (np.abs(x).max() + 1e-12))
def rms(x, db): return x * (10 ** (db / 20) / (np.sqrt(np.mean(x ** 2)) + 1e-12))

def loop(x, target, period=None, xf=0.25):
    """Vòng lặp LIỀN: độ dài L = bội số nhịp (nếu có) gần `target`, dò quanh đó chỗ khớp nhất; trộn đè xf giây đuôi vào đầu."""
    n = int(target * SR)
    if period:
        k = max(1, round(target / period)); n = int(k * period * SR)
    w, best, bl = int(0.08 * SR), -9, n
    ref = x[:w]
    for L in range(n - int(0.03 * SR), n + int(0.03 * SR), 8):
        if L + int(xf * SR) >= len(x): break
        c = np.dot(ref, x[L:L + w]) / (np.linalg.norm(ref) * np.linalg.norm(x[L:L + w]) + 1e-12)
        if c > best: best, bl = c, L
    L, m = bl, int(xf * SR)
    out = x[:L].copy()
    t = np.linspace(0, 1, m)
    out[:m] = x[:m] * np.sqrt(t) + x[L:L + m] * np.sqrt(1 - t)
    print(f"    vòng lặp {L / SR:.3f} s, khớp {best:.2f}")
    return out

def save(name, x, q=5, rec=None):
    wav = os.path.join(TMP, name + ".wav")
    wavfile.write(wav, SR, np.clip(x, -1, 1).astype(np.float32))
    dst = os.path.join(OUT, name + ".ogg")
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", wav, "-c:a", "libvorbis", "-q:a", str(q), dst], check=True)
    if rec: USED.append((name, rec))
    print(f"  {name:14s} {len(x) / SR:6.2f} s  {os.path.getsize(dst) // 1024:4d} KB")

USED = []
def one(name, fid, a, b, fi=0.004, fo=0.05, db=-1.0, q=5, extra=None):
    x = fade(hp(seg(load(fid), a, b)), fi, fo)
    if extra: x = extra(x)
    save(name, peak(x, db), q, (fid, f"{a}–{b} s"))

print("HIỆU ỨNG")
# đoàn tàu
x = hp(seg(load(480820), 6, 30)); save("train-loop", rms(loop(x, 11.5, period=0.72, xf=0.36), -16), rec=(480820, "6–17,5 s, vòng lặp 16 nhịp"))
one("whistle-1", 71778, 0.25, 3.2, fi=0.05, fo=0.6)
one("whistle-2", 188240, 2.8, 6.8, fi=0.15, fo=1.0)
one("hiss-1", 234782, 0.05, 1.5, fi=0.02, fo=0.4)
one("hiss-2", 457294, 0.0, 4.5, fi=0.01, fo=1.5)
one("bell", 84744, 0.0, 2.4, fi=0.005, fo=0.6)
one("brake", 181868, 0.0, 3.2, fi=0.08, fo=1.2)
# trận đấu
one("pop-1", 82121, 0.0, 0.6, fi=0.001, fo=0.2)
one("pop-2", 458398, 0.0, 0.35, fi=0.001, fo=0.12)
one("pop-3", 82121, 0.0, 0.6, fi=0.001, fo=0.2, extra=lambda x: np.interp(np.arange(0, len(x), 1.12), np.arange(len(x)), x))   # biến thể cao hơn
one("crate-1", 667654, 0.0, 0.4, fi=0.001, fo=0.08)
one("crate-2", 667655, 0.0, 0.4, fi=0.001, fo=0.08)
one("crate-3", 19830, 0.0, 0.6, fi=0.001, fo=0.2)
one("crate-4", 449955, 0.0, 0.45, fi=0.001, fo=0.12)
one("ding", 353233, 0.0, 4.2, fi=0.002, fo=1.2)
one("cash", 209578, 0.03, 2.3, fi=0.003, fo=0.6)
one("coins-1", 17502, 0.2, 2.1, fi=0.003, fo=0.4)
one("coins-2", 387232, 0.0, 3.0, fi=0.003, fo=0.8)
one("smash-1", 500902, 0.0, 1.3, fi=0.001, fo=0.4)
one("smash-2", 536777, 0.0, 1.0, fi=0.001, fo=0.3)
one("coal", 108676, 0.8, 2.6, fi=0.02, fo=0.5)
one("tick", 188033, 0.0, 0.45, fi=0.001, fo=0.1)
one("plane", 648720, 0.0, 12.0, fi=0.8, fo=3.0)
one("cheer", 397434, 0.5, 9.0, fi=0.3, fo=3.0)
one("yeehaw", 479549, 9.4, 10.5, fi=0.02, fo=0.25)
# điện ảnh
one("boom-1", 427803, 0.0, 4.4, fi=0.001, fo=1.2)
one("boom-2", 264059, 0.0, 5.0, fi=0.001, fo=1.5)
one("boom-3", 222517, 0.0, 6.0, fi=0.001, fo=2.0)
one("whoosh-1", 683101, 0.1, 0.9, fi=0.01, fo=0.3)
one("whoosh-2", 60013, 0.0, 0.4, fi=0.005, fo=0.15)
one("whoosh-3", 169867, 0.0, 2.3, fi=0.05, fo=0.6)
one("riser", 715353, 0.4, 8.15, fi=0.3, fo=0.02)      # kết thúc ĐÚNG lúc đập ⇒ riser(dur) phát đoạn cuối dài dur
one("timpani", 369394, 0.0, 3.5, fi=0.001, fo=1.0)
one("whip", 529925, 0.0, 0.5, fi=0.001, fo=0.15)
# thiên nhiên
x = hp(seg(load(156414), 0, 40), 60); save("wind-loop", rms(loop(x, 32, xf=2.0), -22), q=4, rec=(156414, "0–34 s, vòng lặp trộn đè 2 s"))
one("hawk-1", 479610, 0.15, 1.35, fi=0.01, fo=0.3)
one("hawk-2", 479610, 2.55, 4.4, fi=0.01, fo=0.5)
one("hawk-3", 479610, 11.9, 13.7, fi=0.01, fo=0.5)
# con vật
one("neigh-1", 510903, 0.35, 3.4, fi=0.02, fo=0.4)
one("neigh-2", 347036, 0.55, 2.0, fi=0.02, fo=0.4)
one("snort", 437111, 4.3, 5.0, fi=0.01, fo=0.15)
one("moo-1", 163727, 0.2, 2.6, fi=0.03, fo=0.4)
one("moo-2", 177253, 0.6, 2.7, fi=0.03, fo=0.4)
one("pig", 257858, 9.5, 10.6, fi=0.01, fo=0.3)
one("elephant-1", 527845, 0.0, 1.4, fi=0.01, fo=0.3)
one("elephant-2", 507467, 1.3, 6.0, fi=0.02, fo=0.8)
one("roar-1", 559600, 0.25, 2.3, fi=0.01, fo=0.5)
one("roar-2", 559600, 11.2, 13.6, fi=0.01, fo=0.6)
one("camel", 385912, 0.3, 3.3, fi=0.05, fo=0.5)
one("hen", 316920, 0.0, 1.2, fi=0.005, fo=0.2)
one("howl", 398430, 2.3, 8.0, fi=0.1, fo=1.0)
one("bark-1", 386766, 0.0, 1.0, fi=0.003, fo=0.15)
one("bark-2", 163459, 0.25, 1.2, fi=0.003, fo=0.15)
x = hp(seg(load(564628), 0.8, 11.0)); save("hooves-loop", rms(loop(x, 8.1, period=0.813, xf=0.2), -18), rec=(564628, "0,8–9 s, vòng lặp 10 nhịp phi"))
x = hp(seg(load(564626), 0.4, 9.0)); save("herd-loop", rms(loop(x, 7.3, period=0.406, xf=0.2), -18), rec=(564626, "0,4–7,7 s, vòng lặp"))
one("knock-1", 257752, 0.0, 3.0, fi=0.001, fo=1.0)
one("knock-2", 438331, 0.0, 1.2, fi=0.001, fo=0.4)

print("NHẠC")
MUS = []
def music(name, key, a=None, b=None, fi=0.0, fo=0.0, q=4):
    p = fetch(key + ".mp3", PX[key][0] + "?filename=" + key + ".mp3")
    # -ss/-to đặt trước -i ⇒ bản cắt bắt đầu từ 0; mốc afade tính theo bản đã cắt
    af = []
    if fi: af.append(f"afade=t=in:st=0:d={fi}")
    if fo and b: af.append(f"afade=t=out:st={b - (a or 0) - fo}:d={fo}")
    af.append("loudnorm=I=-16:TP=-1.5:LRA=11")
    cmd = [FFMPEG, "-v", "error", "-y"] + (["-ss", str(a)] if a else []) + (["-to", str(b)] if b else []) + ["-i", p]
    dst = os.path.join(OUT, name + ".ogg")
    subprocess.run(cmd + ["-af", ",".join(af), "-ar", str(SR), "-ac", "2", "-c:a", "libvorbis", "-q:a", str(q), dst], check=True)
    MUS.append((name, key, a, b))
    print(f"  {name:14s} {os.path.getsize(dst) // 1024:5d} KB")
music("music-menu", "m438089")                            # màn START: vòng lặp phiêu lưu
music("music-intro", "m292157", 0, 42, fo=4)              # phim mở màn → đếm ngược (cùng chủ đề với nhạc trận)
music("music-play", "m294750")                            # trong trận: vòng lặp "Duel Adventure" (nhỏ dưới hiệu ứng)
music("music-final", "m433972")                           # 30 s cuối: "Glorious Victory" dồn dập
music("music-win", "m432161", 91.5, 106.3, fi=0.3, fo=3)  # kết thúc: đoạn kết hùng tráng

# ------------------------------------------------------------------ bảng nguồn
with open(os.path.join(OUT, "NGUON.md"), "w", encoding="utf-8") as f:
    f.write("# Nguồn âm thanh TRAIN RUSH 1ah\n\nSinh bằng `tools/tao-am-thanh-1ah.py`. Hiệu ứng: Freesound, **CC0** (miễn phí, không cần ghi tên). "
            "Nhạc: Pixabay, **Pixabay Content License** (dùng trong game miễn phí, không cần ghi tên), tác giả Sonican.\n\n| File | Nguồn | Tác giả | Đoạn |\n|---|---|---|---|\n")
    for name, (fid, part) in USED:
        f.write(f"| {name}.ogg | [freesound.org/s/{fid}](https://freesound.org/s/{fid}/) {FS[fid][2]} | {FS[fid][1]} | {part} |\n")
    for name, key, a, b in MUS:
        f.write(f"| {name}.ogg | [{PX[key][1]}]({PX[key][2]}) | Sonican | {'cả bài' if a is None else f'{a}–{b} s'} |\n")
print("xong →", OUT)

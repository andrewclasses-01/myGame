"""Nén tiếng 4 game 3D — mức "Vừa" (thầy chốt 17/10/2026: "nén tiếng cả 4 game 3D").

Quy tắc mỗi file (giữ nguyên tên + định dạng mp3/ogg, 44,1 kHz):
  • tiếng có trái/phải rõ (năng lượng kênh S/M ≥ 0,08: bay ngang, gió, nhạc…) ⇒ 2 kênh 96 kbps
  • còn lại ⇒ 1 kênh 64 kbps (game tự đẩy trái/phải theo đội)
  • bản nén không nhẹ hơn ≥ 10 % ⇒ GIỮ file gốc (file vốn đã nhẹ)
Thay cùng lúc ở AWord (templates/…) và bản chép myGame (chỉ khi file myGame GIỐNG HỆT file AWord gốc).
Chạy:  python -I tools/nen-tieng-3d.py [--thu] [--aw <thư mục kho web AWord, vd worktree>]      (--thu = chỉ tính, không ghi)
"""
import glob, hashlib, os, re, subprocess, sys, tempfile
import numpy as np

FF = r"E:/LAP TRINH APP/MODEL/ffmpeg/ffmpeg.exe"
AW = (sys.argv[sys.argv.index("--aw") + 1] if "--aw" in sys.argv else r"E:/LAP TRINH APP/AWord/web") + "/templates/"
MG = r"E:/LAP TRINH APP/myGame/"
PAIRS = [("balloon-pop/assets/sound-1ah", "balloon-pop/assets/sound-1ah"),
         ("maze-chase/am-thanh", "maze-chase/am-thanh"),
         ("rocket-race/sfx", "rocket-race/game10/sfx"),
         ("rocket-race/sfx-intro", "rocket-race/game10/sfx-intro"),
         ("racing-words/sfx", "speed-run/sfx")]
WIDE, KEEP = 0.08, 0.90
THU = "--thu" in sys.argv


def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


def width(f):
    pcm = subprocess.run([FF, "-v", "error", "-i", f, "-ac", "2", "-ar", "22050", "-f", "f32le", "-"], capture_output=True).stdout
    if not pcm:
        return 0.0
    x = np.frombuffer(pcm, dtype=np.float32)
    x = x[: len(x) // 2 * 2].reshape(-1, 2)
    m, s = (x[:, 0] + x[:, 1]) / 2, (x[:, 0] - x[:, 1]) / 2
    return float((s ** 2).sum() / max(1e-9, (m ** 2).sum()))


def stereo_src(f):
    e = subprocess.run([FF, "-hide_banner", "-i", f], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return bool(re.search(r"Audio: .*stereo", e))


tong0 = tong1 = 0
for a_rel, m_rel in PAIRS:
    d0 = d1 = 0
    for f in sorted(glob.glob(AW + a_rel + "/*")):
        ext = os.path.splitext(f)[1].lower()
        if ext not in (".mp3", ".ogg"):
            continue
        st = stereo_src(f) and width(f) >= WIDE
        codec = ["-codec:a", "libmp3lame"] if ext == ".mp3" else ["-codec:a", "libvorbis"]
        args = ["-ac", "2", "-b:a", "96k"] if st else ["-ac", "1", "-b:a", "64k"]
        fd, tmp = tempfile.mkstemp(suffix=ext); os.close(fd)
        subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", f, *codec, "-ar", "44100", *args, tmp], check=True)
        s0, s1 = os.path.getsize(f), os.path.getsize(tmp)
        thay = s1 <= s0 * KEEP and s1 > 1024
        d0 += s0; d1 += s1 if thay else s0
        if thay and not THU:
            m = MG + m_rel + "/" + os.path.basename(f)
            cung = os.path.exists(m) and sha(m) == sha(f)
            data = open(tmp, "rb").read()
            for dst in [f] + ([m] if cung else []):
                t2 = dst + ".tmp"
                open(t2, "wb").write(data)
                os.replace(t2, dst)
        os.remove(tmp)
    tong0 += d0; tong1 += d1
    print(f"{a_rel:32s} {d0 // 1024:6d} KB -> {d1 // 1024:6d} KB")
print(f"TONG {tong0 // 1024} KB -> {tong1 // 1024} KB" + ("  (chi tinh, chua ghi)" if THU else ""))

# -*- coding: utf-8 -*-
"""
Chép Rocket Race MẪU 12 (tàu + tên lửa 3D có sẵn) từ myGame rocket-race/game11/ sang AWord templates/rocket-race/
(ngược chiều tools/chep-aword-sang-game.py): đổi import "three" / "three/addons/..." ⇒ "./vendor/three/...",
đường phông helvetiker ⇒ ./vendor/three/, thư mục mẫu glb ../tau3d/ ⇒ ./tau3d/ (glb + ảnh mô phỏng chép kèm).
Chạy:  python -X utf8 tools/chep-rr-mau12-sang-aword.py [--thu]      (--thu = chỉ in khác biệt, không ghi)
"""
import os, re, sys, shutil, difflib

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "rocket-race", "game11")
TAU = os.path.join(ROOT, "rocket-race", "tau3d")
AW = r"E:\LAP TRINH APP\AWord\web\templates\rocket-race"
FILES = ["rr3d-view.js", "rr3d-launch.js", "rr3d-missile.js", "rr3d-ships.js"]
THU = "--thu" in sys.argv


def to_aword(s, name):
    s = s.replace('import * as THREE from "three";', 'import * as THREE from "./vendor/three/three.module.min.js";')
    s = re.sub(r'from "three/addons/(?:[\w-]+/)*([\w.]+\.js)";', r'from "./vendor/three/addons/\1";', s)
    s = s.replace('new URL("./helvetiker_bold.typeface.json", import.meta.url)', 'new URL("./vendor/three/helvetiker_bold.typeface.json", import.meta.url)')
    s = s.replace('new URL("../tau3d/", import.meta.url)', 'new URL("./tau3d/", import.meta.url)')
    # dòng ghi chú đầu file do tool chép myGame thêm
    s = re.sub(r'^// ⚠️ CHÉP từ AWord origin/main[^\n]*\n// Bản mẫu myGame:[^\n]*\n', '', s)
    assert not re.search(r'from "three(/addons/[^"]*)?"', s), name + ": còn import three chưa đổi"
    return s


for f in FILES:
    src = open(os.path.join(SRC, f), encoding="utf-8").read()
    out = to_aword(src, f)
    dst = os.path.join(AW, f)
    old = open(dst, encoding="utf-8").read().replace("\r\n", "\n") if os.path.exists(dst) else ""
    d = [l for l in difflib.unified_diff(old.splitlines(), out.splitlines(), lineterm="", n=0) if l[:1] in "+-" and l[:3] not in ("+++", "---")]
    print(f"{f}: {'MỚI' if not old else str(len(d)) + ' dòng khác'}")
    if not THU:
        open(dst, "w", encoding="utf-8", newline="\n").write(out)

# mẫu glb + ảnh mô phỏng
dt = os.path.join(AW, "tau3d")
if not THU:
    os.makedirs(os.path.join(dt, "anh"), exist_ok=True)
    n = 0
    for f in os.listdir(TAU):
        if f.endswith(".glb"): shutil.copy2(os.path.join(TAU, f), os.path.join(dt, f)); n += 1
    for f in os.listdir(os.path.join(TAU, "anh")):
        if f.endswith(".webp"): shutil.copy2(os.path.join(TAU, "anh", f), os.path.join(dt, "anh", f)); n += 1
    print("tau3d:", n, "file")

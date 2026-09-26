# -*- coding: utf-8 -*-
"""
Chép BẢN GAME MỚI NHẤT của Rocket Race Fight 3D từ AWord sang myGame để intro nối vào đúng bản đang chạy thật.
(thầy 26/9/2026: "nối intro với bản mới nhất của game, tránh nối với bản cũ")

Nguồn:  E:\\LAP TRINH APP\\AWord\\web\\templates\\rocket-race\\  (rr3d-view.js, rr3d-sfx.js, sfx/*.mp3, vendor/three/helvetiker_bold.typeface.json)
Đích:   rocket-race/aword/   — import three đổi sang importmap "three" / "three/addons/..." (trang myGame dùng CHUNG một three với intro)
Ghi:    rocket-race/aword/NGUON.json  (mã commit AWord + giờ chép) — trang hiện mã này ở bảng thử.
Chạy lại mỗi khi AWord có Đợt Rocket Race mới:   python -X utf8 tools/chep-game-aword.py
"""
import os, re, json, shutil, subprocess, datetime

SRC = r"E:\LAP TRINH APP\AWord\web\templates\rocket-race"
DST = os.path.join(os.path.dirname(__file__), "..", "rocket-race", "aword")
os.makedirs(os.path.join(DST, "sfx"), exist_ok=True)

ADDON = {
    "EffectComposer": "postprocessing/EffectComposer.js", "RenderPass": "postprocessing/RenderPass.js",
    "UnrealBloomPass": "postprocessing/UnrealBloomPass.js", "ShaderPass": "postprocessing/ShaderPass.js",
    "OutputPass": "postprocessing/OutputPass.js", "RoomEnvironment": "environments/RoomEnvironment.js",
    "RoundedBoxGeometry": "geometries/RoundedBoxGeometry.js", "FontLoader": "loaders/FontLoader.js",
    "TextGeometry": "geometries/TextGeometry.js",
}

s = open(os.path.join(SRC, "rr3d-view.js"), encoding="utf-8").read()
s = s.replace('import * as THREE from "./vendor/three/three.module.min.js";', 'import * as THREE from "three";')
def fix(m):
    name, path = m.group(1), m.group(2)
    base = os.path.splitext(os.path.basename(path))[0]
    assert base in ADDON, base
    return f'import {{ {name} }} from "three/addons/{ADDON[base]}";'
s = re.sub(r'import \{ (\w+) \} from "\./vendor/three/addons/([\w.]+)";', fix, s)
s = s.replace('new URL("./vendor/three/helvetiker_bold.typeface.json", import.meta.url)', 'new URL("./helvetiker_bold.typeface.json", import.meta.url)')
assert s.count("\nfunction makeRocket(") == 1
s = s.replace("\nfunction makeRocket(", "\nexport function makeRocket(")      # intro dựng tàu bằng ĐÚNG mô hình của game (hai cảnh giống hệt)
assert not re.search(r'(from |URL\()"\./vendor/', s), "còn đường vendor chưa đổi"
commit = subprocess.run(["git", "-C", os.path.dirname(os.path.dirname(SRC)), "log", "-1", "--format=%h %s"], capture_output=True, text=True, encoding="utf-8").stdout.strip()
head = f"// ⚠️ BẢN CHÉP TỰ ĐỘNG từ AWord (tools/chep-game-aword.py) — commit AWord: {commit[:80]}\n// Đừng sửa ở đây: sửa ở AWord rồi chạy lại tool.\n"
open(os.path.join(DST, "rr3d-view.js"), "w", encoding="utf-8", newline="\n").write(head + s)
shutil.copy2(os.path.join(SRC, "rr3d-sfx.js"), os.path.join(DST, "rr3d-sfx.js"))
shutil.copy2(os.path.join(SRC, "vendor", "three", "helvetiker_bold.typeface.json"), os.path.join(DST, "helvetiker_bold.typeface.json"))
for f in os.listdir(os.path.join(SRC, "sfx")):
    if f.endswith(".mp3"): shutil.copy2(os.path.join(SRC, "sfx", f), os.path.join(DST, "sfx", f))
# cấu hình cảnh RR3D_CFG của rocket-race.js: chép nguyên hàm ra module để trang myGame dùng ĐÚNG cấu hình AWord
rr = open(os.path.join(SRC, "rocket-race.js"), encoding="utf-8").read()
a = rr.index("function RR3D_CFG(V) {"); b = rr.index("\n}\n", a) + 3
open(os.path.join(DST, "rr3d-cfg.js"), "w", encoding="utf-8", newline="\n").write(head + "export " + rr[a:b])
json.dump({"aword_commit": commit, "copied": datetime.datetime.now().isoformat(timespec="minutes")},
          open(os.path.join(DST, "NGUON.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("xong:", commit)

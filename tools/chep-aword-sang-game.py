# -*- coding: utf-8 -*-
"""
Chép NGUYÊN BỘ game Rocket Race Fight 3D đang chạy trên AWord (origin/main) sang một thư mục game MỚI của myGame,
để làm bản mẫu kế tiếp trên ĐÚNG code đang chạy thật (thầy 27/9/2026: "chuẩn bị 1 bản trong repo để tiếp tục cải tiến").

Khác tools/chep-game-aword.py (chỉ chép view/sfx cho intro nối vào, đích cố định rocket-race/aword/):
  tool này chép CẢ tên lửa, MISS WAIT, tự giữ 60 khung, cấu hình cảnh — ra thư mục mới (bản mới = tên mới).

⭐ 05/10/2026 (thầy: "myGame cũng phải có các bản mới nhất đồng bộ với AWord"): chép thêm CẢNH PHÓNG của AWord
  (rr3d-launch.js + thư mục launch/) và TIẾNG INTRO (rr3d-intro-sound.js + sfx-intro/) ⇒ bản chụp = NGUYÊN BỘ AWord đang chạy
  (trước đó trang mẫu dùng cảnh phóng riêng của myGame core/launch-aerial-*.js). Không truyền cờ gì thêm.
  ⚠️ Mỗi Đợt Rocket Race trên AWord ⇒ chạy lại tool này ra thư mục MỚI (game9, game10…) để myGame luôn có bản khớp AWord.
Nguồn: git show origin/main (KHÔNG đọc thư mục làm việc của AWord — nó có thể đang tụt sau origin).
Chạy:  python -X utf8 tools/chep-aword-sang-game.py game7
       (thư mục đích phải CHƯA có — không ghi đè bản cũ)
"""
import os, re, sys, json, subprocess, datetime

AWORD = r"E:\LAP TRINH APP\AWord\web"
TPL = "templates/rocket-race/"
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "rocket-race")

ADDON = {
    "EffectComposer": "postprocessing/EffectComposer.js", "RenderPass": "postprocessing/RenderPass.js",
    "UnrealBloomPass": "postprocessing/UnrealBloomPass.js", "ShaderPass": "postprocessing/ShaderPass.js",
    "OutputPass": "postprocessing/OutputPass.js", "RoomEnvironment": "environments/RoomEnvironment.js",
    "RoundedBoxGeometry": "geometries/RoundedBoxGeometry.js", "FontLoader": "loaders/FontLoader.js",
    "TextGeometry": "geometries/TextGeometry.js",
}


def git(*a, binary=False):
    r = subprocess.run(["git", "-C", AWORD, *a], capture_output=True)
    if r.returncode:
        sys.exit("git lỗi: " + r.stderr.decode("utf-8", "replace"))
    return r.stdout if binary else r.stdout.decode("utf-8")


def show(path, binary=False):
    return git("show", "origin/main:" + TPL + path, binary=binary)


def write(path, data):
    """Ghi an toàn: file tạm rồi os.replace (lỗi giữa chừng không để lại file cụt)."""
    tmp = path + ".tmp"
    if isinstance(data, str):
        data.encode("utf-8")                         # thử mã hoá trước khi mở file
        with open(tmp, "w", encoding="utf-8", newline="\n") as f:
            f.write(data)
    else:
        with open(tmp, "wb") as f:
            f.write(data)
    os.replace(tmp, path)


def main():
    if len(sys.argv) != 2 or not re.fullmatch(r"[\w-]+", sys.argv[1]):
        sys.exit("cách chạy: python -X utf8 tools/chep-aword-sang-game.py <thư mục mới, vd game7>")
    dst = os.path.join(ROOT, sys.argv[1])
    if os.path.exists(dst):
        sys.exit(f"{dst} đã có — bản mới phải là thư mục mới (không ghi đè)")
    git("fetch", "-q", "origin")
    commit = git("log", "-1", "--format=%h %s", "origin/main").strip()
    head = (f"// ⚠️ CHÉP từ AWord origin/main (tools/chep-aword-sang-game.py) — commit AWord: {commit[:80]}\n"
            f"// Bản mẫu myGame: sửa ở đây, thầy OK rồi mới mang sang AWord.\n")

    # --- đổi import vendor → importmap "three" (trang myGame dùng CHUNG một three với intro) ---
    def fix(m):
        base = os.path.splitext(m.group(2))[0]
        assert base in ADDON, base
        return f'import {{ {m.group(1)} }} from "three/addons/{ADDON[base]}";'

    def three_map(s, name):
        s = s.replace('import * as THREE from "./vendor/three/three.module.min.js";', 'import * as THREE from "three";')
        s = re.sub(r'import \{ (\w+) \} from "\./vendor/three/addons/([\w.]+)";', fix, s)
        s = s.replace('new URL("./vendor/three/helvetiker_bold.typeface.json", import.meta.url)',
                      'new URL("./helvetiker_bold.typeface.json", import.meta.url)')
        assert not re.search(r'(from |URL\()"\./vendor/', s), f"{name}: còn đường vendor chưa đổi"
        return s

    s = three_map(show("rr3d-view.js"), "rr3d-view.js")
    assert "export function makeRocket(" in s, "view AWord phải export makeRocket (cảnh phóng dùng chung)"

    files = {
        "rr3d-view.js": head + s,
        "rr3d-missile.js": head + show("rr3d-missile.js"),
        "rr3d-misswait.js": head + show("rr3d-misswait.js"),
        "rr3d-autores.js": head + show("rr3d-autores.js"),
        "rr3d-sfx.js": head + show("rr3d-sfx.js"),
        # 05/10/2026: cảnh phóng + tiếng intro của AWord (đường ./launch/ và ./sfx-intro/ tương đối theo file ⇒ chép kèm 2 thư mục)
        "rr3d-launch.js": head + three_map(show("rr3d-launch.js"), "rr3d-launch.js"),
        "rr3d-intro-sound.js": head + show("rr3d-intro-sound.js"),
    }
    rr = show("rocket-race.js")
    a = rr.index("function RR3D_CFG(V) {")
    b = rr.index("\n}\n", a) + 3
    # RR3D_CFG dùng hằng RR3D_HULL khai báo NGAY TRÊN hàm (Đợt 398) — chép kèm, export để trang/cảnh phóng dùng chung
    h = rr.rfind("\nconst RR3D_HULL = ", 0, a)
    hull = "export " + rr[h + 1:rr.index("\n", h + 1) + 1] if h >= 0 and "RR3D_HULL" in rr[a:b] else ""
    files["rr3d-cfg.js"] = head + hull + "export " + rr[a:b]

    os.makedirs(os.path.join(dst, "sfx"))
    for name, text in files.items():
        write(os.path.join(dst, name), text)
    write(os.path.join(dst, "helvetiker_bold.typeface.json"), show("vendor/three/helvetiker_bold.typeface.json", binary=True))
    n = 0
    for p in git("ls-tree", "--name-only", "origin/main", TPL + "sfx/").splitlines():
        if p.endswith(".mp3"):
            write(os.path.join(dst, "sfx", os.path.basename(p)), git("show", "origin/main:" + p, binary=True))
            n += 1
    # 05/10/2026: tài nguyên cảnh phóng (launch/) + tiếng intro (sfx-intro/) — giữ nguyên cây thư mục
    nd = 0
    for sub in ("launch/", "sfx-intro/"):
        for p in git("ls-tree", "-r", "--name-only", "origin/main", TPL + sub).splitlines():
            rel = p[len(TPL):]
            os.makedirs(os.path.join(dst, os.path.dirname(rel)), exist_ok=True)
            write(os.path.join(dst, rel), git("show", "origin/main:" + p, binary=True))
            nd += 1
    print(f"launch/ + sfx-intro/: {nd} file")
    write(os.path.join(dst, "NGUON.json"), json.dumps(
        {"aword_commit": commit, "copied": datetime.datetime.now().isoformat(timespec="minutes"),
         "base": f"chép nguyên bộ game Rocket Race 3D từ AWord ({commit[:60]})"}, ensure_ascii=False, indent=1) + "\n")
    print(f"xong: {dst} ← AWord {commit} · {len(files)} file js · {n} tiếng mp3")


if __name__ == "__main__":
    main()

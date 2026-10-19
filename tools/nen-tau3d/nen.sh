#!/usr/bin/env bash
# nén mẫu tàu/tên lửa Rocket Race: Desktop\MAU TAU ROCKET\rr-*.glb → myGame/rocket-race/tau3d/<tên>.glb
# ⚠️ cần thư viện: chạy 1 lần trong thư mục này: npm i @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer@0.22 sharp  (node_modules không lên git)
# cách chạy: bash nen.sh [mã...]   (không mã = tất cả)
cd "$(dirname "$0")"
SRC="$HOME/Desktop/MAU TAU ROCKET"; DST="$(cd ../.. && pwd)/rocket-race/tau3d"; TMP="${TMPDIR:-/tmp}/nen-tau3d"; mkdir -p "$DST" "$TMP"
# mã | file gốc | tên đích | tex | maxTris
LIST="R1|rr-R1-retro-toy-rocket|R1-retro-toy-rocket|1024|12000
R2|rr-R2-toy-rocket-4k|R2-toy-rocket|1024|12000
R8|rr-R8-cartoon-rocket|R8-cartoon-rocket|1024|12000
S5|rr-S5-spaceship|S5-spaceship|1024|14000
S7|rr-S7-spacefighter|S7-space-fighter|1024|14000
S9|rr-S9-northstar|S9-northstar|1024|14000
S10|rr-S10-dvergr|S10-dvergr|1024|14000
M1|rr-M1-scifi-missile|M1-scifi-missile|512|3000
M2|rr-M2-aim9|M2-aim9|512|3000
M3|rr-M3-aim120|M3-aim120|512|3000
M4|rr-M4-ballistic|M4-ballistic|512|3000
M5|rr-M5-missile-rocket|M5-missile-rocket|512|3000"
echo "$LIST" | while IFS='|' read -r id src dst tex mt; do
  if [ $# -gt 0 ] && [[ " $* " != *" $id "* ]]; then continue; fi
  [ -f "$SRC/$src.glb" ] || { echo "$id: chưa có $src.glb"; continue; }
  node tex2.mjs "$SRC/$src.glb" "$TMP/$id-t.glb" "$tex" > /dev/null && node mesh2.mjs "$TMP/$id-t.glb" "$DST/$dst.glb" "$mt" 2>/dev/null | grep tris | sed "s/^/$id: /"
done

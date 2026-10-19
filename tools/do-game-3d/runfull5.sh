#!/bin/bash
# runfull5.sh <root> <out.json> <cài-đặt: off | d1 | d2 | d2tr> [scen5.js]   (5f+, 19/10/2026)
#   off = không drone · d1 = 1 drone · d2 = 2 drone · d2tr = 2 drone + Traffic Both + Sky Auto. Xe mặc định Y2 + H4, xoá độ nét đã học.
cd "$(dirname "$0")"
printf '%s' "$1" > root.txt
case "$3" in
  off)  D='{"on":false,"n":1}'; TR=off; SK=off ;;
  d1)   D='{"on":true,"n":1}';  TR=off; SK=off ;;
  d2)   D='{"on":true,"n":2}';  TR=off; SK=off ;;
  d2tr) D='{"on":true,"n":2}';  TR=both; SK=auto ;;
  *) echo "cài đặt?"; exit 1 ;;
esac
node cdp.mjs localhost:5733 -e "(()=>{const o=JSON.parse(localStorage.getItem('racingwords.drone.v1')||'{}');localStorage.setItem('racingwords.drone.v1',JSON.stringify(Object.assign(o,$D)));localStorage.setItem('racingwords.traffic.v2','$TR');localStorage.setItem('racingwords.sky.v2','$SK');localStorage.setItem('racingwords.padMode.v2','0');localStorage.setItem('speedrun.cars',JSON.stringify(['Y2','H4']));return Object.keys(localStorage).filter(k=>k.startsWith('aw.rr3d.pr.rw-')).map(k=>(localStorage.removeItem(k),k)).join(',')})()" >/dev/null
node cdp.mjs localhost:5733 -e "location.reload(),1" >/dev/null; sleep 3
node cdp.mjs localhost:5733 probe.js >/dev/null
node cdp.mjs localhost:5733 gputime.js >/dev/null
node cdp.mjs localhost:5733 -e "document.visibilityState"
node cdp.mjs localhost:5733 ${4:-scen5.js} 900000
node cdp.mjs localhost:5733 report.js > "$2"
python -c "
import json;r=json.load(open('$2',encoding='utf8'))
print('ERR',r['nerr'],r['errs'][:2])
for s in r['seg']: print({k:s.get(k) for k in ['from','drawn','errs','fps','p99','max','gt20','gt33','gt50','gt100']})
print('PROG',[e for e in r['ev'] if e[1]=='programs'])
print('LOAF',[(l['t'],l['d'],l['scr'][:2]) for l in r['loaf'][:8]])
"

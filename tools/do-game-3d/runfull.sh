#!/bin/bash
# runfull.sh <root> <out.json> [scen.js]
cd "$(dirname "$0")"
printf '%s' "$1" > root.txt
node cdp.mjs localhost:5733 -e "localStorage.setItem('speedrun.cars', JSON.stringify(['Y2','H4'])); Object.keys(localStorage).filter(k=>k.startsWith('aw.rr3d.pr.rw-')).map(k=>(localStorage.removeItem(k),k)).join(',')" >/dev/null
node cdp.mjs localhost:5733 -e "location.reload(),1" >/dev/null; sleep 3
node cdp.mjs localhost:5733 probe.js >/dev/null
node cdp.mjs localhost:5733 -e "document.visibilityState"
node cdp.mjs localhost:5733 ${3:-scen.js} 900000 >/dev/null
node cdp.mjs localhost:5733 report.js > "$2"
python -c "
import json;r=json.load(open('$2',encoding='utf8'))
print('ERR',r['nerr'],r['errs'][:2])
for s in r['seg']: print({k:s.get(k) for k in ['from','to','drawn','errs','fps','p99','max','gt20','gt33','gt50','gt100']})
print('PROG',[e for e in r['ev'] if e[1]=='programs'])
"

import sys,json,datetime as D
rows=[]
for l in open('gpu-base.csv',encoding='utf8',errors='ignore'):
    p=[x.strip() for x in l.split(',')]
    if len(p)<7: continue
    try: t=D.datetime.strptime(p[0],'%Y/%m/%d %H:%M:%S.%f')
    except: continue
    rows.append((t,int(p[1]),int(p[2].split()[0]),int(p[3].split()[0]),float(p[5].split()[0]),p[6]))
res=json.loads(sys.stdin.read())
for r in res:
    a=D.datetime.fromisoformat(r['from'].replace('Z',''))+D.timedelta(hours=7); b=D.datetime.fromisoformat(r['to'].replace('Z',''))+D.timedelta(hours=7)
    w=[x for x in rows if a<=x[0]<=b]
    if w: r['gpu%']=round(sum(x[3] for x in w)/len(w)); r['W']=round(sum(x[4] for x in w)/len(w),1); r['MHz']=round(sum(x[2] for x in w)/len(w)); r['C']=max(x[1] for x in w); r['thr']=sorted(set(x[5][-2:] for x in w))
    for k in ('from','to'): r.pop(k,None)
    print(r)

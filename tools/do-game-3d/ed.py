# python ed.py FILE  (đọc cặp thay thế từ stdin dạng JSON [[old,new],...]; giữ CRLF; old phải xuất hiện đúng 1 lần)
import sys, json
p = sys.argv[1]
raw = open(p, 'rb').read().decode('utf8')
crlf = '\r\n' in raw
s = raw.replace('\r\n', '\n')
for old, new in json.loads(sys.stdin.buffer.read().decode('utf8')):
    n = s.count(old)
    if n != 1: sys.exit(f'DUNG: {n} lan khop: {old[:80]!r}')
    s = s.replace(old, new)
if crlf: s = s.replace('\n', '\r\n')
b = s.encode('utf8'); open(p, 'wb').write(b)
print('ok', p, 'crlf' if crlf else 'lf')

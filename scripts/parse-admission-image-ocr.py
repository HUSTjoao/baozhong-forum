"""Read OCR cell coordinates; retain exact school matches and auditable row origins.

Run Windows OCR first. Only reference facts with an official same-year tied-rank
consistency check are imported by import-public-admission-references.py.
"""
from pathlib import Path
import collections, json, re, hashlib
from html.parser import HTMLParser
D=Path(__file__).resolve().parents[1]/'data/admissions-sources'
C=D/'research-cache';O=C/'ocr-2026'
manifest=json.loads((O/'manifest.json').read_text(encoding='utf-8'))
rows=[]
for tile in manifest:
    words=json.loads((O/(tile['key']+'.json')).read_text(encoding='utf-8-sig'))
    assert words, tile['key']
    cols=[0,110,235,580,721,849,987,1149]if tile['subject']=='science'else[0,100,220,520,670,812,945,1102]
    cells=collections.defaultdict(list)
    for w in words:
        row=int((w['y']+w['height']/2)//93);x=w['x']+w['width']/2
        col=next((i for i in range(7)if cols[i]<=x<cols[i+1]),None)
        if col is not None:cells[(row,col)].append(w)
    for r in range(tile['rows']):
        values=[''.join(w['text']for w in sorted(cells[(r,c)],key=lambda w:(round(w['y']/15),w['x'])))for c in range(7)]
        rows.append({'tile':tile['key'],'row':r,'page':tile['page'],'imageRow':tile['start']+r,'subject':tile['subject'],'cells':values})
(C/'ocr-2026-rows.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
norm=lambda s:re.sub(r'\s','',s).replace('（','(').replace('）',')')
names={norm(s['name']):s['id']for s in json.loads((D/'catalog.json').read_text(encoding='utf-8'))}
out=[];pending=[]
for r in rows:
    seq,code,name,group,count,score,rank=r['cells']
    if norm(name)not in names:continue
    if not score.isdigit()or not rank.isdigit()or not re.fullmatch(r'\d{3}组',group):pending.append(r);continue
    out.append({'name':name,'subject':r['subject'],'group':group,'score':int(score),'publishedRank':int(rank),'imagePage':r['page'],'imageRow':r['imageRow']})
table={'key':'national-2026-ocr','url':'https://www.6617.com/p_1313533553.html','publisher':'圆梦志愿公开图表','year':2026,'title':'2026年陕西省高考本科批次正式投档录取数据（公开转载）','imageHashes':{str(i):hashlib.sha256((C/f'6617-2026-{i}.png').read_bytes()).hexdigest()for i in range(10)},'rows':out}
corrections=json.loads((D/'reviewed-image-corrections.json').read_text(encoding='utf-8'))['rows']
corrected={(r['imagePage'],r['imageRow'])for r in corrections}
table['rows']=[r for r in table['rows']if(r['imagePage'],r['imageRow'])not in corrected]+corrections
p=D/'public-reference-tables.json';tables=json.loads(p.read_text(encoding='utf-8'));tables=[t for t in tables if t.get('key')!=table['key']]+[table]
p.write_text(json.dumps(tables,ensure_ascii=False,indent=2),encoding='utf-8')
(C/'ocr-2026-pending.json').write_text(json.dumps(pending,ensure_ascii=False,indent=2),encoding='utf-8')
print('OCR exact school rows',len(out),'school count',len(set(norm(r['name'])for r in out)),'pending cells',len(pending))

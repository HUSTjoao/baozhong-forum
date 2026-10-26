import sys,json,re
from pathlib import Path
sys.path.insert(0,str(Path('scripts').resolve()))
import importlib.util
spec=importlib.util.spec_from_file_location('discovery',Path('scripts/discover-admission-sources.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
fetch,links=m.fetch,m.links
from concurrent.futures import ThreadPoolExecutor,as_completed
rows=json.loads(Path('data/admissions-sources/discovery.json').read_text(encoding='utf-8'))
tasks=[]
for r in rows:
 seen=set()
 for c in r['candidates']:
  u=c['url'].strip()
  if u in seen or any(x in u for x in ['weixin.qq','.png','.pdf','yjs']):continue
  seen.add(u);tasks.append((r['id'],u))
  if len(seen)>=2:break

def work(t):
 id,u=t;out={'id':id,'url':u,'links':[],'scripts':[]}
 try:
  s=fetch(u)
  out['links']=[{'url':v,'title':n} for v,n in links(u) if any(x in n for x in ['2025','2026','陕西','录取分','历年','分数'])][:100]
  from urllib.parse import urljoin
  out['scripts']=[urljoin(u,x) for x in re.findall(r'<script[^>]+src=[\"\']([^\"\']+)',s)]
  out['snippets']=re.findall(r'.{0,80}(?:ajax|lnfs|score|Score|enroll|录取).{0,120}',s)[:15]
 except Exception as e:out['error']=str(e)[:130]
 return out
out=[]
with ThreadPoolExecutor(max_workers=6)as pool:
 for f in as_completed([pool.submit(work,t) for t in tasks]):
  out.append(f.result())
  Path('data/admissions-sources/score-pages.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
  if len(out)%20==0:print('Score pages',len(out),'/',len(tasks),flush=True)
print('Done',len(out))

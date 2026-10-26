"""Inventory public official admissions links; never imports unverified scores."""
from pathlib import Path
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import urlopen, Request
from urllib.parse import urljoin, urlparse
import json, hashlib, re, time
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'data/admissions-sources/research-cache'; CACHE.mkdir(exist_ok=True)
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.a=None
 def handle_starttag(self,t,a):
  if t=='a':self.a=[dict(a).get('href',''),'']
 def handle_data(self,d):
  if self.a is not None:self.a[1]+=d
 def handle_endtag(self,t):
  if t=='a' and self.a is not None:self.links.append(self.a);self.a=None

def fetch(url):
 name=CACHE/(hashlib.sha256(url.encode()).hexdigest()[:20]+'.html')
 if name.exists():b=name.read_bytes()
 else:
  r=urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0 (admissions source research)'}),timeout=8)
  if 'text/html' not in r.headers.get('Content-Type',''):return ''
  b=r.read(2_500_000);name.write_bytes(b)
 try:return b.decode('utf-8')
 except:return b.decode('gb18030',errors='replace')

def links(url):
 t=Links();t.feed(fetch(url));return [(urljoin(url,u),re.sub(r'\s+',' ',n).strip()) for u,n in t.links if u and not u.startswith(('javascript:','#','mailto:'))]

def work(c):
 result={**c,'pages':[],'candidates':[],'errors':[]}
 try:
  main=links(c['website']);result['pages'].append(c['website'])
  candidates=[]
  for u,n in main:
   if any(x in n for x in ['研究生','留学','继续教育','成人','国际学生']):continue
   if '招生' in n and urlparse(u).hostname:
    score=100 if '本科' in n else 70 if '招生网' in n else 50 if '招生'==n else 20
    candidates.append((score,u,n))
  admissions=[]
  for score,u,n in sorted(candidates,reverse=True):
   if u not in admissions:admissions.append(u)
   if len(admissions)>=2:break
  for u in admissions:
   try:
    child=links(u);result['pages'].append(u)
    for v,n in child:
     if any(x in n for x in ['录取分','历年分','历年录取','录取情况','分数查询','录取统计','招生分数','录取最低']):result['candidates'].append({'url':v,'title':n})
   except Exception as e:result['errors'].append({'url':u,'error':str(e)[:160]})
 except Exception as e:result['errors'].append({'url':c['website'],'error':str(e)[:160]})
 return result
if __name__=='__main__':
 catalog=json.loads((ROOT/'data/admissions-sources/catalog.json').read_text(encoding='utf-8'))
 results=[]
 with ThreadPoolExecutor(max_workers=6) as pool:
  for f in as_completed([pool.submit(work,c) for c in catalog]):
   r=f.result();results.append(r)
   (ROOT/'data/admissions-sources/discovery.json').write_text(json.dumps(sorted(results,key=lambda x:x['id']),ensure_ascii=False,indent=2),encoding='utf-8')
   if len(results)%10==0:print(f"Checked {len(results)}/{len(catalog)}; with admission links {sum(bool(x['candidates']) for x in results)}",flush=True)
 print('Discovery complete',len(results),flush=True)

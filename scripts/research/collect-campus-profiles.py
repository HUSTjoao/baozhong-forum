"""Collect official campus profile pages for editorial review, never import unchecked drafts."""
import csv,json,re,time,concurrent.futures,urllib.parse
from pathlib import Path
import requests
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[2]
CACHE=ROOT/'node_modules/.cache/campus-research';CACHE.mkdir(parents=True,exist_ok=True)
catalog={u['id']:u for u in json.loads((ROOT/'node_modules/.cache/campus-catalog-research.json').read_text(encoding='utf-8'))}
reviewed={u['id'] for u in json.loads((ROOT/'data/campus-profiles-reviewed.json').read_text(encoding='utf-8-sig'))}|{'hust','tsinghua'}
rows=list(csv.DictReader((ROOT/'scripts/research/campus-websites.tsv').read_text(encoding='utf-8-sig').splitlines(),delimiter='\t'))
def get(url):
 try:
  r=requests.get(url,timeout=(6,15),headers={'User-Agent':'Mozilla/5.0'},allow_redirects=True)
  if r.status_code!=200 or 'html' not in r.headers.get('Content-Type','text/html'):return None
  r.encoding=r.apparent_encoding
  s=BeautifulSoup(r.text,'html.parser')
  links=[(a.get_text(' ',strip=True),urllib.parse.urljoin(r.url,a.get('href',''))) for a in s.find_all('a',href=True)]
  for n in s(['script','style','noscript','nav','header','footer']):n.decompose()
  lines=[re.sub(r'\s+',' ',t).strip() for t in s.get_text('\n',strip=True).splitlines()]
  return {'url':r.url,'text':'\n'.join(lines),'links':links,'lines':lines}
 except Exception:return None

def norm(s):return re.sub(r'[^a-z0-9]','',s.lower())
def extract_intro(p,name):
 candidates=[]
 for i,line in enumerate(p['lines']):
  combined=line
  for more in p['lines'][i+1:i+4]:
   if len(combined)>260:break
   combined+=more
  if len(combined)<65 or len(re.findall('[\u4e00-\u9fff]',combined))<45:continue
  pos=combined.find(name)
  if pos<0 or pos>30:continue
  combined=combined[pos:]
  if any(x in combined[:100] for x in ['版权所有','责任编辑','地址：','联系电话','欢迎访问','个人简历']):continue
  score=0
  score+=4 if re.search('创办|创建|始建|前身|成立于|建校',combined[:160]) else 0
  score+=3 if re.search('大学是|大学位于|大学坐落|学院是|学院位于|学院坐落',combined[:80]) else 0
  score+=3 if re.search('直属|重点|综合|学科|理工|师范|高等',combined[:180]) else 0
  score-=6 if re.search('新闻网|招生简章|招聘|通知|公告|入学|新闻',combined[:60]) else 0
  sentences=re.findall(r'[^。！？]+[。！？]?',combined)
  out=''
  for sentence in sentences:
   if len(out+sentence)>230:break
   out+=sentence
   if len(out)>=130:break
  if len(out)>60:candidates.append((score,out))
 return max(candidates,default=(0,''),key=lambda x:x[0])
def extract_motto(text):
 matches=re.findall(r'(?:校训(?:是|为)?[：:，,\s]*[“「"\']([^”」"\'。\n]{2,45})[”」"\']|[“「"\']([^”」"\'。\n]{2,45})[”」"\'](?:的)?校训)',text)
 return next((a or b for a,b in matches if 3<=len(a or b)<=40),'')
def collect(row):
 uid=row['id'];f=CACHE/(uid+'.json')
 if f.exists():return json.loads(f.read_text(encoding='utf-8'))
 name=catalog[uid]['name'];domain=row['domain'];pages=[]
 home=get('https://www.'+domain+'/') or get('https://'+domain+'/') or get('http://www.'+domain+'/')
 if home:
  pages.append(home)
  relevant=[]
  for label,url in home['links']:
   host=urllib.parse.urlsplit(url).hostname or ''
   if not (host==domain or host.endswith('.'+domain)):continue
   if re.search('学校简介|学校介绍|大学简介|学院简介|学校概况|学校章程|校训|校风|文化标识|学校文化',label):relevant.append((0 if '简介' in label else 1 if '章程' in label else 2,url))
  seen=set()
  for _,url in sorted(relevant,key=lambda t:t[0]):
   if url in seen or len(seen)>=4:continue
   seen.add(url);p=get(url)
   if p:pages.append(p)
  if not any(norm(row['englishName']) in norm(p['text']) for p in pages):
   enlinks=[url for label,url in home['links'] if re.search('english|ENGLISH',label)]
   enlinks+=['https://en.'+domain+'/','https://english.'+domain+'/']
   for url in enlinks[:3]:
    p=get(url)
    if p:pages.append(p)
    if p and norm(row['englishName']) in norm(p['text']):break
 results=[(*extract_intro(p,name),p['url']) for p in pages]
 score,intro,source=max(results,default=(0,'',''),key=lambda x:x[0])
 result={'id':uid,'name':name,'website':home['url'] if home else '', 'englishCandidate':row['englishName'],'englishVerified':any(norm(row['englishName']) in norm(p['text']) for p in pages),'motto':next((m for p in pages if (m:=extract_motto(p['text']))),''),'introductionDraft':intro,'introScore':score,'sourceUrl':source,'pages':pages}
 f.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
 print(uid,score,'EN' if result['englishVerified'] else '--','MOTTO' if result['motto'] else '--',flush=True)
 return result
if __name__=='__main__':
 pending=[r for r in rows if r['id'] not in reviewed]
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(collect,pending))
 summary=[{k:v for k,v in r.items() if k!='pages'} for r in results]
 (CACHE/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
 print('TOTAL',len(results),'INTRO',sum(r['introScore']>=6 for r in results),'EN',sum(r['englishVerified'] for r in results),'MOTTO',sum(bool(r['motto']) for r in results),flush=True)

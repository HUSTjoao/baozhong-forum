"""Read only the public score API called by the official admissions page."""
from pathlib import Path
import json,hashlib,urllib.request,urllib.parse,re
from concurrent.futures import ThreadPoolExecutor,as_completed
root=Path(__file__).resolve().parents[1];folder=root/'data/admissions-sources'
pages=json.loads((folder/'score-pages.json').read_text(encoding='utf-8'))
tasks=[];seen=set()
for p in pages:
 if not any('/js/init.js' in x for x in p.get('scripts',[])):continue
 cache=folder/'research-cache'/(hashlib.sha256(p['url'].encode()).hexdigest()[:20]+'.html')
 if not cache.exists() or 'ajax_lnfs' not in cache.read_text(encoding='utf-8',errors='replace'):continue
 host=urllib.parse.urlsplit(p['url']);base=(p['url'].split('/static/')[0]+'/' if '/static/' in p['url'] else host.scheme+'://'+host.netloc+'/')
 for year in [2025,2026]:
  if(p['id'],year)not in seen:seen.add((p['id'],year));tasks.append((p['id'],p['url'],base,year))

def work(t):
 id,page,base,year=t;out={'id':id,'year':year,'page':page,'endpoint':base+'f/ajax_lnfs','query':{'ssmc':'陕西','zsnf':str(year)},'rows':[]}
 try:
  req=urllib.request.Request(out['endpoint'],data=urllib.parse.urlencode(out['query']).encode(),headers={'User-Agent':'Mozilla/5.0','Referer':page})
  try:b=urllib.request.urlopen(req,timeout=12).read()
  except Exception:
   if not base.startswith('http:'):raise
   out['endpoint']=out['endpoint'].replace('http:','https:',1)
   req=urllib.request.Request(out['endpoint'],data=urllib.parse.urlencode(out['query']).encode(),headers={'User-Agent':'Mozilla/5.0','Referer':page});b=urllib.request.urlopen(req,timeout=12).read()
  obj=json.loads(b)
  if obj.get('state')!=1:out['error']=str(obj)[:150]
  else:
   data=obj.get('data',{})
   # Keep original response for provenance and verify year/province after query.
   (folder/'research-cache'/f'{id}-{year}-public-scores.json').write_text(json.dumps(obj,ensure_ascii=False),encoding='utf-8')
   out['keys']=list(data)
   for key in ['zsSsgradeList','sszyzgradeList']:
    for row in data.get(key,[]):
     if str(row.get('nf',''))==str(year) and row.get('ssmc','')in ['陕西','陕西省']:out['rows'].append({**row,'_table':key})
 except Exception as e:out['error']=str(e)[:160]
 return out
import sys
only=sys.argv[1:]
if only:tasks=[t for t in tasks if t[0]in only]
out=[]
with ThreadPoolExecutor(max_workers=5)as pool:
 for f in as_completed([pool.submit(work,t)for t in tasks]):
  r=f.result();out.append(r);(folder/('public-score-api-extra.json'if only else'public-score-api.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
  print(r['id'],r['year'],'rows',len(r['rows']),r.get('error',''),flush=True)
print('Complete',len(out))

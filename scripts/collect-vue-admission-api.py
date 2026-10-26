"""Collect public score statistics from linked Vue admissions query pages."""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,re,hashlib
root=Path(__file__).resolve().parents[1];folder=root/'data/admissions-sources';cache=folder/'research-cache'
pages=json.loads((folder/'score-pages.json').read_text(encoding='utf-8'))
targets={r['id']:r['url'] for r in pages if '/lqxx/' in r['url'] and 'lnfs' in r['url']}
targets.update({'xidian':'https://zsxc.xidian.edu.cn/auth/zsdata/lqxx/#/lnfs','snnu':'https://zsdata.snnu.edu.cn/zscx/lqxx/#/lnfs'})

def get(u):
 return urlopen(Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=10).read().decode('utf-8',errors='replace')
def post(u,obj):
 return json.loads(urlopen(Request(u,data=json.dumps(obj,ensure_ascii=False).encode(),headers={'Content-Type':'application/json','User-Agent':'Mozilla/5.0'}),timeout=10).read())
def work(t):
 id,page=t;result={'id':id,'page':page,'years':{},'errors':[]}
 try:
  html=get(page.split('#')[0]);scripts=re.findall(r'(?:src|href)=[\"\']?([^\"\'\s>]+app\.[^\"\'\s>]+\.js)',html)
  if not scripts:result['errors'].append('No public app bundle');return result
  js=get(urljoin(page,scripts[0]));m=re.search(r'baseURL:[\"\']([^\"\']+)',js)
  if not m:result['errors'].append('No baseURL');return result
  base=m[1];base=urljoin(page,base)if not base.startswith('http')else base
  if '/api/front/lqxx/getList' not in js:result['errors'].append('Different public query schema');return result
  result['endpoint']=base+'/api/front/lqxx/getList'
  for year in [2025,2026]:
   query={'type':'lnfs','sf':'陕西','nf':str(year),'zslb':'全部','klmc':'全部','xqmc':''}
   obj=post(result['endpoint'],query)
   if obj.get('code')!=200:result['errors'].append(f'{year}: '+str(obj)[:120]);continue
   (cache/f'{id}-{year}-vue-scores.json').write_text(json.dumps(obj,ensure_ascii=False),encoding='utf-8')
   result['years'][str(year)]={'query':query,'list':[r for r in obj.get('list',[])if str(r.get('nf',''))==str(year)and r.get('sf')in['陕西','陕西省']],'sumList':[r for r in obj.get('sumList',[])if str(r.get('nf',''))==str(year)and r.get('sf')in['陕西','陕西省']]}
 except Exception as e:result['errors'].append(str(e)[:160])
 return result
import sys
only=sys.argv[1:]
if only:targets={k:v for k,v in targets.items()if k in only}
out=[]
with ThreadPoolExecutor(max_workers=5)as pool:
 for f in as_completed([pool.submit(work,t)for t in targets.items()]):
  r=f.result();out.append(r);(folder/('vue-public-scores-extra.json'if only else'vue-public-scores.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
  print(r['id'],{y:(len(v['list']),len(v['sumList']))for y,v in r['years'].items()},r['errors'],flush=True)
print('Done',len(out))

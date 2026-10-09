"""Resolve alternate official domains, overview submenus and charter evidence."""
import json,concurrent.futures,re,urllib.parse
from pathlib import Path
import importlib.util
spec=importlib.util.spec_from_file_location('collector',Path(__file__).with_name('collect-campus-profiles.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
ROOT,CACHE,catalog,rows,get,norm,extract_intro,extract_motto=m.ROOT,m.CACHE,m.catalog,m.rows,m.get,m.norm,m.extract_intro,m.extract_motto
# Compatibility import uses a separate loader in the entry point.

fix_domains={'bjwlxy':'bjwlxy.edu.cn','njnu':'nnu.edu.cn'}
seeds={
'sdu':['https://www.sdu.edu.cn/sdgk/sdzc.htm','https://www.sdu.edu.cn/sdgk/sdjj.htm'],
'buaa':['https://xxgk.buaa.edu.cn/info/1002/1133.htm'],
'lzu':['https://www.lzu.edu.cn/static/introduce/','https://en.lzu.edu.cn/'],
'bupt':['https://www.bupt.edu.cn/bygk/zjby/xxjj.htm'],
'bjwlxy':['https://www.bjwlxy.edu.cn/dxwh/dxzc.htm','https://yjszs.bjwlxy.edu.cn/xxgk/xxjj.htm'],
'imu':['https://zhaosheng.imu.edu.cn/xxgk.htm'],
'ouc':['https://www.ouc.edu.cn/31000/list.htm'],
'njust':['https://www.njust.edu.cn/xxgk/xxjj.htm'],
'njnu':['https://www.nnu.edu.cn/xxgk/xxjj.htm'],
'sust':['https://www.sust.edu.cn/xxgk/xxjj.htm'],
'nwnu':['https://www.nwnu.edu.cn/xxjj.htm'],
'shu':['https://www.shu.edu.cn/xxgk/xxjj.htm'],
'shutcm':['https://www.shutcm.edu.cn/110/list.htm'],
'ut':['https://www.utibet.edu.cn/xxgk/xxjj.htm'],
'cnu':['https://www.cnu.edu.cn/xxgk/xxjj/'],
'shisu':['https://www.shisu.edu.cn/about/introducing-sisu/'],
'jnu':['https://www.jnu.edu.cn/2560/list.htm'],
}
def resolve(row):
 f=CACHE/(row['id']+'.json')
 if not f.exists():return
 r=json.loads(f.read_text(encoding='utf-8'));domain=fix_domains.get(row['id'],row['domain']);name=r['name'];pages=r['pages'];urls=seeds.get(row['id'],[])[:]
 if row['id'] in fix_domains:urls.insert(0,'https://www.'+domain+'/')
 for p in pages[:3]:
  for label,url in p['links']:
   host=urllib.parse.urlsplit(url).hostname or ''
   if (host==domain or host.endswith('.'+domain)) and re.search('简介|章程|校训|文化标识|校徽校歌|校风校训|概况|overview|About|English|ENGLISH',label):urls.append(url)
 if not r['englishVerified']:urls+=['https://en.'+domain+'/','https://english.'+domain+'/','https://www.'+domain+'/en/']
 if r['introScore']<6:urls+=['https://www.'+domain+'/xxgk/xxjj.htm']
 seen={p['url'] for p in pages};count=0
 for url in dict.fromkeys(urls):
  if url in seen or count>=9:continue
  seen.add(url);count+=1;p=get(url)
  if p:
   pages.append(p)
   if re.search('简介|概况',p['text'][:3000]) and len(pages)<12:
    for label,link in p['links']:
     if re.search('学校简介|大学简介|学校章程|校训',label) and link not in seen and (urllib.parse.urlsplit(link).hostname or '').endswith(domain):urls.append(link)
 results=[(*extract_intro(p,name),p['url']) for p in pages]
 score,intro,source=max(results,default=(0,'',''),key=lambda x:x[0])
 r.update({'website':'https://www.'+domain+'/','englishVerified':any(norm(row['englishName']) in norm(p['text']) for p in pages),'motto':next((v for p in pages if (v:=extract_motto(p['text']))),''),'introductionDraft':intro,'introScore':score,'sourceUrl':source,'pages':pages})
 f.write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8');print(row['id'],score,'EN' if r['englishVerified'] else '--','MOTTO' if r['motto'] else '--',flush=True)
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(resolve,[row for row in rows if (CACHE/(row['id']+'.json')).exists()]))
 rs=[json.loads((CACHE/(row['id']+'.json')).read_text(encoding='utf-8')) for row in rows if (CACHE/(row['id']+'.json')).exists()]
 (CACHE/'summary.json').write_text(json.dumps([{k:v for k,v in r.items() if k!='pages'} for r in rs],ensure_ascii=False,indent=2),encoding='utf-8')
 print('RESOLVED',sum(r['introScore']>=6 for r in rs),sum(r['englishVerified'] for r in rs),sum(bool(r['motto']) for r in rs),flush=True)

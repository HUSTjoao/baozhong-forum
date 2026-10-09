"""Fetch additional official evidence; output remains a review cache, never a publish step."""
import sys,io,json,re,requests,concurrent.futures,importlib.util
from pathlib import Path
sys.path.insert(0,r'C:\Users\17504\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\Lib\site-packages')
from pypdf import PdfReader
spec=importlib.util.spec_from_file_location('collector',Path(__file__).with_name('collect-campus-profiles.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
extra={
'ecnu':['https://www.ecnu.edu.cn/wzcd/xxgk/xqjj.htm'],
'ahau':['https://www.ahu.edu.cn/148/list.htm'],
'zjnu':['https://www.zjnu.edu.cn/3999/list.htm'],
'cnu':['https://www.cnu.edu.cn/xxgk/xxjj/index.htm'],
'ecust':['https://www.ecust.edu.cn/587/list.htm'],
'jnu':['https://www.jnu.edu.cn/2561/list.htm'],
'tmu':['https://www.tmu.edu.cn/6/list.htm'],
'gxnu-edu':['https://www.gxnu.edu.cn/1365/list.htm'],
'shu':['https://www.shu.edu.cn/xxgk/xxjj.htm','https://www.shu.edu.cn/xxgk/sdzc.htm'],
'shupl':['https://www.shupl.edu.cn/1232/list.htm','https://xxgk.shupl.edu.cn/2023/0920/c3987a124640/page.htm'],
'stu':['https://www.stu.edu.cn/info/1003/1001.htm'],
'lzu':['https://ge.lzu.edu.cn/yanyuangaikuang/yanyuanjianjie/2026/0123/327866.html','https://fgc.lzu.edu.cn/fgcnew/upload/files/N20180703090904.pdf'],
'bjwlxy':['https://www.bjwlxy.edu.cn/info/1003/1001.htm','https://shpg.bjwlxy.edu.cn/__local/B/F1/32/F49F63E5B72ECB9085C9A9D64CA_7A63E899_63C03.pdf'],
'njust':['https://zsb.njust.edu.cn/ueditor/jsp/upload/file/20210725/1627207384441006062.pdf'],
'ut':['https://xcb.utibet.edu.cn/info/1040/3573.htm','https://lib.utibet.edu.cn/gybg/bgjj.htm'],
'sust':['https://xxgk.sust.edu.cn/__local/7/DE/AD/1DCA7B40E938BC32373859E113D_80795002_A4756.pdf'],
'bupt':['https://www.bupt.edu.cn/bygk/zjby/xxjj.htm'],
'njnu':['https://www.nnu.edu.cn/xxgk/xxjj.htm'],
'nwnu':['https://www.nwnu.edu.cn/3329/list.htm','https://xxgk.nwnu.edu.cn/_upload/article/files/94/3b/3fa9b24348878a95fe8484df6b49/ea7e7a36-9883-4322-bd5f-2bcd02fd4411.pdf'],
'ouc':['https://www.ouc.edu.cn/31000/list.htm'],
'caa':['https://en.caa.edu.cn/alumni/Overview.htm'],
'ruc':['https://www.ruc.edu.cn/xuexiaojianjie.html'],
}
def fetch(url):
 if '.pdf' not in url.lower():return m.get(url)
 try:
  res=requests.get(url,timeout=(6,20),headers={'User-Agent':'Mozilla/5.0'})
  if res.status_code!=200:return None
  text='\n'.join(p.extract_text() or '' for p in PdfReader(io.BytesIO(res.content)).pages)
  return {'url':url,'text':text,'lines':text.splitlines(),'links':[]}
 except Exception:return None

def run(row):
 f=m.CACHE/(row['id']+'.json')
 if not f.exists():return
 r=json.loads(f.read_text(encoding='utf-8'));pages=r['pages'];seen={p['url'] for p in pages};urls=extra.get(row['id'],[])[:]
 if not r['englishVerified'] or not r['motto']:
  for p in pages:
   for label,url in p['links']:
    if re.search('章程|校训|标识|校情简介|英文|English',label,re.I) and url not in seen:urls.append(url)
 urls=list(dict.fromkeys(urls));limit=5 if row['id'] not in extra else 9
 for url in urls[:limit]:
  if url in seen and row['id'] not in extra:continue
  p=fetch(url)
  if p:pages.append(p)
 r['englishVerified']=any(m.norm(row['englishName']) in m.norm(p['text']) for p in pages)
 r['motto']=next((v for p in pages if (v:=m.extract_motto(p['text']))),r['motto'])
 scores=[(*m.extract_intro(p,r['name']),p['url']) for p in pages]
 score,intro,source=max(scores,default=(0,'',''),key=lambda x:x[0]);r.update(introScore=score,introductionDraft=intro,sourceUrl=source,pages=pages)
 f.write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8');print(row['id'],score,r['englishVerified'],flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(run,m.rows))
rs=[json.loads(f.read_text(encoding='utf-8')) for f in m.CACHE.glob('*.json') if f.name!='summary.json']
(m.CACHE/'summary.json').write_text(json.dumps([{k:v for k,v in r.items() if k!='pages'} for r in rs],ensure_ascii=False,indent=2),encoding='utf-8')
for name,url in [('double-first','https://jtj.kaifeng.gov.cn/kfsjytyjwz/jytyjgsgg/1844974263031091200/7KmKIuY4.pdf')]:
 p=fetch(url)
 if p:(m.CACHE/(name+'.txt')).write_text(p['text'],encoding='utf-8')

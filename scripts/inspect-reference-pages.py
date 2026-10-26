from pathlib import Path
import json, urllib.request, concurrent.futures, hashlib
from bs4 import BeautifulSoup
C=Path(__file__).resolve().parents[1]/'data/admissions-sources/research-cache'
sources=json.loads((C/'target-reference-urls.json').read_text(encoding='utf-8'))+json.loads((C/'extra-reference-urls.json').read_text(encoding='utf-8'))
if(C/'subject25-urls.json').exists():sources+=json.loads((C/'subject25-urls.json').read_text(encoding='utf-8'))
def fetch(item):
    key=hashlib.sha256(item['url'].encode()).hexdigest()[:16]
    path=C/('ref-'+key+'.html')
    try:
        if not path.exists():
            req=urllib.request.Request(item['url'],headers={'User-Agent':'Mozilla/5.0'})
            path.write_bytes(urllib.request.urlopen(req,timeout=25).read())
        raw=path.read_bytes();soup=BeautifulSoup(raw,'html.parser')
        main=soup.select_one('article')or soup.select_one('.content')or soup
        text=main.get_text(' ',strip=True)
        tables=[]
        for t in main.select('table'):
            rows=[[c.get_text(' ',strip=True)for c in tr.select('th,td')]for tr in t.select('tr')]
            matches=[r for r in rows if any('陕西'in c for c in r)]
            if matches or ('陕西'in text[:2000]and any('2025'in c for r in rows[:3]for c in r)):
                tables.append({'heading':t.find_previous(['h1','h2','h3','h4']).get_text(' ',strip=True)if t.find_previous(['h1','h2','h3','h4'])else'', 'header':rows[:3],'matches':matches,'rows':rows})
        excerpts=[]
        start=0
        for i in range(8):
            pos=text.find('陕西',start)
            if pos<0:break
            excerpts.append(text[max(0,pos-100):pos+500]);start=pos+2
        links=[a['href']for a in soup.select('a[href]')if '/daxue/luqu_'in a['href']]
        return {**item,'cache':path.name,'sha256':hashlib.sha256(raw).hexdigest(),'title':soup.title.get_text()if soup.title else'','tables':tables,'excerpts':excerpts,'links':list(dict.fromkeys(links))[:5]}
    except Exception as e:return {**item,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=12)as pool:out=list(pool.map(fetch,sources))
(C/'target-reference-extracted.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print('Fetched',len(out),'public pages;',sum('error'in r for r in out),'errors')

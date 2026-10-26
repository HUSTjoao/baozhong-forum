"""Audit the public Zhangshang Gaokao year/subject selectors for our 149 schools.

Only anonymous published pages are read. No login, paid data or personal data.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,hashlib,time

ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'data/admissions-sources';C=D/'research-cache'
norm=lambda n:n.replace('（','(').replace('）',')').replace(' ','')
names=json.loads((C/'school-names.json').read_bytes())['data']
lookup={norm(s['name']):s for s in names}
aliases={'空军军医大学':'中国人民解放军空军军医大学','国防科技大学':'中国人民解放军国防科技大学'}
schools=json.loads((D/'catalog.json').read_text(encoding='utf-8'))
audit=[]
def work(s):
    found=lookup.get(norm(aliases.get(s['name'],s['name'])))
    if not found:return {**s,'error':'学校名称未能精确匹配，未猜测对应关系'}
    sid=found['school_id'];u=f'https://static-data.gaokao.cn/www/2.0/school/{sid}/dic/provincescore.json'
    result={**s,'gaokaoSchoolId':sid,'matchedName':found['name'],'url':u,'page':f'https://www.gaokao.cn/school/{sid}/provinceline'}
    try:
        path=C/f'gaokao-dic-{sid}.json'
        if not path.exists():
            time.sleep(.15)
            raw=urlopen(Request(u,headers={'User-Agent':'Mozilla/5.0','Referer':'https://www.gaokao.cn/'}),timeout=15).read()
            path.write_bytes(raw)
        raw=path.read_bytes();obj=json.loads(raw)
        assert obj['code']=='0000'
        data=obj['data'];news=data.get('newsdata',{})
        result.update(sha256=hashlib.sha256(raw).hexdigest(),years=news.get('year',{}).get('61',[]),types={str(y):news.get('type',{}).get(f'61_{y}',[])for y in [2024,2025,2026]})
        result['shaanxiSelectors']=[{'year':r['year'],'province':[x for x in r.get('province',[])if str(x.get('pid'))=='61']}for r in data.get('data',[])if any(str(x.get('pid'))=='61'for x in r.get('province',[]))]
    except Exception as e:result['error']=str(e)
    return result
with ThreadPoolExecutor(max_workers=4)as pool:
    for f in as_completed([pool.submit(work,s)for s in schools]):
        r=f.result();audit.append(r)
        if len(audit)%25==0:print('Checked',len(audit),'/',len(schools),flush=True)
audit.sort(key=lambda x:x['id'])
(D/'gaokao-public-catalog-audit-20261025.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Audited',len(audit),'errors',sum('error'in r for r in audit),'2026 available',sum(2026 in r.get('years',[])for r in audit),flush=True)

"""Read the anonymous score endpoint used by Zhangshang Gaokao's university page.

Follow published year/subject selectors and ordinary pagination. Stop at any
login/payment/error response; never use user credentials or private endpoints.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,hashlib,time

ROOT=Path(__file__).resolve().parents[1];D=ROOT/'data/admissions-sources';C=D/'research-cache'
audit=json.loads((D/'gaokao-public-catalog-audit-20261025.json').read_text(encoding='utf-8'))
catalog=json.loads((ROOT/'data/shaanxi-admissions-catalog.json').read_text(encoding='utf-8'))
endpoint='https://api-gaokao.zjzw.cn/apidata/web'
tasks=[]
for s in audit:
    if 'error'in s:continue
    for year in [2026,2025,2024]:
        if year not in s.get('years',[]):continue
        if year==2024 and catalog[s['id']]['records'].get('2024',{}).get('kind')in['submission','admission']:continue
        for subject in s['types'].get(str(year),[]):
            if subject not in [1,2,2073,2074]:continue
            tasks.append((s,year,subject))
def work(task):
    s,year,subject=task
    query={'platform':'2','uri':'v1/school/province_score','local_province_id':'61','year':str(year),'school_id':s['gaokaoSchoolId'],'local_type_id':str(subject),'page':1,'size':5}
    out={'id':s['id'],'name':s['name'],'gaokaoSchoolId':s['gaokaoSchoolId'],'year':year,'subjectCode':subject,'source':s['page'],'endpoint':endpoint,'query':{**query},'rows':[],'pages':[]}
    try:
        while True:
            path=C/f'gaokao-score-{s["gaokaoSchoolId"]}-{year}-{subject}-size5-{query["page"]}.json'
            if not path.exists():
                time.sleep(.25)
                raw=urlopen(Request(endpoint,data=json.dumps(query).encode(),headers={'Content-Type':'application/json','User-Agent':'Mozilla/5.0','Referer':'https://www.gaokao.cn/','Origin':'https://www.gaokao.cn'}),timeout=15).read()
                path.write_bytes(raw)
            raw=path.read_bytes();obj=json.loads(raw)
            if obj.get('code')!=0:
                out['error']={'code':obj.get('code'),'message':obj.get('message')};break
            data=obj.get('data')or{}
            rows=data.get('item',[]);total=int(data.get('numFound')or 0)
            out['pages'].append({'page':query['page'],'sha256':hashlib.sha256(raw).hexdigest(),'numFound':total,'rows':len(rows)})
            for r in rows:
                if str(r.get('year'))!=str(year)or r.get('local_province_name')!='陕西'or str(r.get('school_id'))!=str(s['gaokaoSchoolId']):raise ValueError('返回数据年份、省份或学校不匹配')
                out['rows'].append(r)
            if len(out['rows'])>=total or not rows:break
            query['page']+=1
            if query['page']>20:raise ValueError('Unexpected pagination limit')
    except Exception as e:out['error']=str(e)
    return out
out=[]
with ThreadPoolExecutor(max_workers=4)as pool:
    for f in as_completed([pool.submit(work,t)for t in tasks]):
        out.append(f.result())
        if len(out)%25==0:print('Read',len(out),'/',len(tasks),'queries;',sum(len(r['rows'])for r in out),'rows',flush=True)
out.sort(key=lambda r:(r['id'],r['year'],r['subjectCode']))
(D/'gaokao-public-scores-20261025.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Complete',len(out),'queries',sum(len(r['rows'])for r in out),'rows','errors',sum('error'in r for r in out),flush=True)

"""Transcribe Zhangshang Gaokao anonymous public rows as secondary references.

Partial public pages remain partial. Official school statistics are never
overwritten; the common importer checks every score/rank against its cohort.
"""
from pathlib import Path
import collections,hashlib,json,re

D=Path(__file__).resolve().parents[1]/'data/admissions-sources'
raw=json.loads((D/'gaokao-public-scores-20261025.json').read_text(encoding='utf-8'))
grouped=collections.defaultdict(list);excluded=[]
for result in raw:
    for r in result['rows']:
        sub={'历史类':'arts','文科':'arts','物理类':'science','理科':'science'}.get(r.get('local_type_name'))
        category=r.get('zslx_name')or'类型未列'
        if not sub or any(t in category for t in ['艺术','体育']):
            excluded.append({'id':result['id'],'year':result['year'],'row':r,'reason':'艺术体育综合分或科类不明确'});continue
        try:
            score=float(r['min']);rank=float(r['min_section'])
            if not score.is_integer()or not rank.is_integer()or not 0<score<=750 or rank<=0:raise ValueError()
        except (ValueError,KeyError,TypeError):
            excluded.append({'id':result['id'],'year':result['year'],'row':r,'reason':'分数或位次未公布，不能通过同年位次核对'});continue
        batch=r.get('local_batch_name')or''
        extra=category not in ['普通类','普通本科','统招']or'提前'in batch or'专项'in batch
        group=r.get('sg_name','').strip('（）()')
        row={'name':result['name'],'subject':sub,'score':int(score),'publishedRank':int(rank),'category':category,'batch':batch,'requirement':r.get('sg_info')or'','additional':extra}
        if group:row['group']=group
        grouped[(result['id'],result['year'],result['source'])].append(row)
tables=[]
for (id,year,url),rows in grouped.items():
    source=[r for r in raw if r['id']==id and r['year']==year]
    tables.append({'key':f'gaokao-public-{id}-{year}','url':url,'publisher':'掌上高考（中国教育在线）','year':year,'title':f'{rows[0]["name"]}{year}年陕西公开院校分组分数','sha256':hashlib.sha256(json.dumps(source,ensure_ascii=False,sort_keys=True).encode()).hexdigest(),'hashScope':'本地保存的公开查询响应、筛选及分页证据JSON','partial':any('error'in r for r in source),'rows':rows})
p=D/'public-reference-tables.json'
existing=json.loads(p.read_text(encoding='utf-8'))
existing=[t for t in existing if not str(t.get('key','')).startswith('gaokao-public-')]+tables
p.write_text(json.dumps(existing,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(D/'gaokao-public-excluded-20261025.json').write_text(json.dumps(excluded,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Transcribed',len(tables),'school-years',sum(len(t['rows'])for t in tables),'rows;',len(excluded),'excluded;',sum(t['partial']for t in tables),'partially public school-years')

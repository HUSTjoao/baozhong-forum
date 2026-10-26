"""Import explicitly dated public reference facts, without replacing official data.

Reject a row when its published rank falls outside the official same-year,
same-subject tied-score cohort. This is a consistency check, not certification
of its admission category; the UI keeps the secondary-source warning visible.
"""
from pathlib import Path
import json, collections
from urllib.parse import urlparse
D=Path(__file__).resolve().parents[1]/'data'
S=D/'admissions-sources'
schools=json.loads((S/'catalog.json').read_text(encoding='utf-8'))
norm=lambda s:s.replace('（','(').replace('）',')').replace(' ','')
names={norm(s['name']):s['id']for s in schools}
dist=json.loads((D/'shaanxi-score-distributions.json').read_text(encoding='utf-8'))
groups=collections.defaultdict(list);rejected=[]
for table in json.loads((S/'public-reference-tables.json').read_text(encoding='utf-8')):
    year=table['year']
    for row in table['rows']:
        id=names.get(norm(row['name']))
        if not id:continue
        if urlparse(table['url']).hostname=='gaokaozy.cn':
            rejected.append({'id':id,'year':year,'source':table['url'],'row':row,'reason':'来源隔离：多个年份重复同分，且与已知官方成绩对照不一致；无法确认年份与招生类型，不入库'})
            continue
        band=dist.get(str(year),{}).get(row['subject'],{}).get('scores',{}).get(str(row['score']))
        rank=row.get('publishedRank')
        if not band or not rank or not band['cumulative']-band['count']+1<=rank<=band['cumulative']:
            rejected.append({'id':id,'year':year,'source':table['url'],'row':row,'reason':'分数与官方同年同科类位次区间不一致'});continue
        groups[(id,year,table['url'],table['publisher'])].append(row)
out=[]
for (id,year,url,publisher),rows in groups.items():
    # Preserve explicitly published labels only. Never infer missing conditions,
    # maximum scores, admission categories or unpublished professional groups.
    records=[]
    seen=set()
    for i,r in enumerate(rows):
        key=(r['subject'],r.get('group'),r['score'],r['publishedRank'])
        if key in seen:continue
        seen.add(key)
        label=('专业组 '+r['group'])if r.get('group')else'公开表收录分数 · 未细分专业组'
        if r.get('category'):label+=' · '+r['category']
        elif r.get('group')and not r.get('additional'):label+=' · 类型待核'
        if '提前'in r.get('batch',''):label+=' · '+r['batch']
        record={'code':f'reference-{r["subject"]}-{i}','label':label,'subject':r['subject'],'score':r['score'],'publishedRank':r['publishedRank'],'source':url}
        for field in ['category','batch','requirement']:
            if r.get(field):record[field]=r[field]
        if r.get('additional'):record['additional']=True
        records.append(record)
    note='第三方汇总所列的陕西同年分数与位次，未取得完整专业组及招生条件说明，不能据此认定所有专业或普通类均可报考；以省考试院、学校最终公布为准。'
    if '掌上高考'in publisher:
        note='掌上高考公开资料，招生类型与选科要求保留该平台原表。仅收录本次公开可读取的记录，分组可能不完整；以省考试院、学校最终公布为准。'
    out.append({'id':id,'year':year,'dataset':{'kind':'reference','source':url,'sourceName':publisher+'公开分数表','note':note,'records':records}})
(S/'public-reference-records.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
(S/'public-reference-rejected.json').write_text(json.dumps(rejected,ensure_ascii=False,indent=2),encoding='utf-8')
print('Public reference school-years',len(out),'rows',sum(len(r['dataset']['records'])for r in out),'rejected',len(rejected))

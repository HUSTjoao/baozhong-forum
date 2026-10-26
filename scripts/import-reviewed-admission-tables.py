"""Rebuild reviewed additions from public official tables saved with source hashes.

PDF headers/merged cells and the image-only Henan table were visually checked.
Plan columns in 2026 brochures are never imported as 2025 admission counts.
"""
from pathlib import Path
import collections, json, re

D = Path(__file__).resolve().parents[1] / 'data/admissions-sources'
snapshots = {r['key']: r for r in json.loads((D/'reviewed-table-snapshots.json').read_text(encoding='utf-8'))}
additions = json.loads((D/'reviewed-additions.json').read_text(encoding='utf-8'))
names = {r['id']:r['name'] for r in json.loads((D/'catalog.json').read_text(encoding='utf-8'))}

def save(id, year, source, records, note='校方公开录取统计；普通类与专项类型分开展示。'):
    global additions
    assert records and id in names
    for i,r in enumerate(records):
        r.setdefault('code',str(i)); r.setdefault('source',source)
        assert 0 < r['score'] <= 750 and r.get('highest',750) >= r['score']
    additions = [x for x in additions if (x['id'],x['year']) != (id,year)]
    additions.append({'id':id,'year':year,'dataset':{'kind':'admission','source':source,'sourceName':names[id]+'官方招生信息','note':note,'records':records}})

def rec(sub, label, score, high=None, **kwargs):
    r={'subject':sub,'label':label,'score':int(score),**kwargs}
    if high is not None:r['highest']=int(high)
    return r

def grouped(rows):
    groups=collections.defaultdict(list)
    for r in rows:groups[(r['subject'],r['category'],r.get('requirement',''),r.get('group',''))].append(r)
    out=[]
    for (sub,cat,req,group),rr in groups.items():
        lowest=min(rr,key=lambda r:r['score'])
        r=rec(sub,' · '.join(x for x in [cat,group or '专业汇总']if x),lowest['score'],category=cat,derived=True,majorCount=len(rr))
        if all('highest'in x for x in rr):r['highest']=max(x['highest']for x in rr)
        if req:r['requirement']=req
        if 'publishedRank'in lowest:r['publishedRank']=lowest['publishedRank']
        if cat not in ['普通类','本科普通批']:r['additional']=True
        out.append(r)
    return out

# PKU: the first two year tabs explicitly correspond to 2026 and 2025.
s=snapshots['pku-full']
for year,index,expected in [(2026,0,(669,696)),(2025,1,(668,694))]:
    row=next(r for r in s['tables'][index]if r and r[0]=='陕西')
    assert tuple(map(int,row[2:4]))==expected
    save('pku',year,s['source'],[rec('arts','一批',row[2]),rec('science','一批',row[3])], '校方各年分数线表，批次名称沿用原表“一批”；不含医学部。')

# Tianjin Polytechnic: rowspans change the number of cells; last 10 are stable.
s=snapshots['tiangong'];rr=[]
for row in s['tables'][0][2:]:
    cells=row[-10:]
    if len(cells)!=10:continue
    major,ph,pl,_,ah,al,_,pc,ac,rank=cells
    if pc!='0':rr.append(rec('science',major,pl,ph,category='普通类',publishedRank=int(rank)))
    if ac!='0':rr.append(rec('arts',major,al,ah,category='普通类',publishedRank=int(rank)))
assert len(rr)==36
save('tjpu',2025,s['source'],grouped(rr),'按官网陕西本科批分专业表汇总，最低位次沿用最低分专业原表；不是院校正式投档线。')

s=snapshots['gzu25']
rr=[rec('science'if r['subject']=='物理类'else'arts',r['major'],r['score'],category=r['type'])for r in s['rows']]
save('gzmu',2025,s['source'],grouped(rr),'按官网2025年陕西分专业最低分汇总；原表未公布最高分，不以专业最低分的最大值代替最高分。')

s=snapshots['szu25']
save('szu',2025,s['source'],[rec('science','普通类',605,627,publishedRank=9952),rec('arts','普通类',599,618,publishedRank=2135)],'校方说明：录取分数按第一次投档情况统计；位次沿用原表最低排位。')

s=snapshots['zzu25'];rr=[];sub=None
for row in s['tables'][0][8:47]:
    if row[0]in['历史类','物理类']:sub='arts'if row[0]=='历史类'else'science';row=row[1:]
    major,hi,lo,_,rank=row
    rr.append(rec(sub,major,lo,hi,category='普通类',publishedRank=int(rank.replace(',',''))))
assert len(rr)==39
save('zzu',2025,s['source'],grouped(rr),'按校方陕西本科批专业记录汇总，艺术类表格单独排除；不是院校正式投档线。')

for year,indices in [(2025,[(5,'国家专项'),(6,'高校专项'),(9,'普通类')]),(2026,[(3,'国家专项'),(4,'高校专项'),(7,'普通类')])]:
    s=snapshots[f'uibe{str(year)[-2:]}'];out=[]
    for index,cat in indices:
        row=next(r for r in s['tables'][index]if r[0].strip()=='陕西')
        for i,sub in [(1,'arts'),(2,'science')]:
            lo,hi=map(int,re.findall(r'\d+',row[i]));out.append(rec(sub,cat,lo,hi,category=cat,additional=cat!='普通类'))
        if year==2026 and cat=='普通类':
            lo,hi=map(int,re.findall(r'\d+',row[3]));out.append(rec('arts','保险学 · 中外合作办学',lo,hi,additional=True))
            lo,hi=map(int,re.findall(r'\d+',row[4]));out.append(rec('science','精算学 · 中外合作办学',lo,hi,additional=True))
    save('uibe',year,s['source'],out)

s=snapshots['ecust26'];rr=[]
for page in s['tables']:
    for row in page[0][2:]:
        year,province,cat,sub,req,major,hi,lo,avg,control=row
        if sub not in ['历史类','物理类']:continue
        assert year=='2026'and province=='陕西'
        rr.append(rec('science'if sub=='物理类'else'arts',major.replace('\n',''),lo,hi,category=cat,requirement=req))
assert len(rr)==32
save('ecust',2026,s['source'],grouped(rr),'按官方陕西分专业表汇总；国家专项、高校专项单列，艺术类分数不混入普通类。')

s=snapshots['snnu26'];out=[];province=sub=None
for row in s['tables'][5][0][1:]:
    province=row[0]or province;sub=row[1]or sub
    if province=='陕西':out.append(rec('science'if sub=='物理类'else'arts',row[3],row[4],category=row[3],additional=row[3]!='普通类'))
assert len(out)==14
save('snnu',2026,s['source'],out,'校方2026年普通类录取汇总；国家公费师范生、优师专项等有报考条件，单独展示。')

# HNU brochure: column 2 is 2025 minimum; column 1 is a 2026 plan and is excluded.
s=snapshots['hnu25pdf'];rr=[]
for start,initial in [(0,('arts','专业组1：首选历史，再选不限')),(4,('science','专业组4：首选物理，再选化学'))]:
    sub,group=initial
    for row in s['tables'][0][0][3:]:
        name,plan,score,rank=row[start:start+4]
        if name and ('专业组'in name or '提前批'in name):
            group=name.split('\n')[-1];sub='arts'if '历史'in group else'science'
        if not score or not score.isdigit():continue
        rr.append(rec(sub,name,score,category='提前批'if '提前批'in group else'普通类',group=group,publishedRank=int(rank)))
assert len(rr)==27
extra=rec('science','国家专项 · 建筑学',584,additional=True,publishedRank=15853)
save('hnu',2025,s['source'],grouped(rr)+[extra],'取2026年报考指南中的2025年实际专业最低分列；2026计划数未作录取人数。只汇总有分数的专业，“/”未作零分。')

s=snapshots['bnu25']
save('bnu',2025,s['source'],[rec('arts','北京校区 · 普通类',652,publishedRank=188),rec('science','北京校区 · 普通类',635,publishedRank=4293),rec('arts','珠海校区 · 优师计划',605,additional=True,publishedRank=1767),rec('science','珠海校区 · 优师计划',598,additional=True,publishedRank=11646)],'校方2026报考指南明确列出的2025年校区调档线与位次。普通类为北京校区；珠海校区优师计划另列。优师历史605分的校方位次1767与普通一分一段区间不一致，保留原表并提示向招办核实。')

s=snapshots['lnu25'];rr=[]
for row in s['tables'][0][0][1:]:
    province,cat,sub,major,lo,rank,hi,avg,count,college,campus=row
    assert province=='陕西'
    rr.append(rec('science'if sub=='物理类'else'arts',major,lo,hi,category='普通类'if cat=='普通类'else cat,publishedRank=int(rank)))
assert len(rr)==12
save('lnu',2025,s['source'],grouped(rr),'按校方陕西分专业表汇总；国家专项另列，不与普通类最低分合并。')

s=snapshots['dhu25'];out=[]
for row in s['tables'][6][1:]:
    province,req,name,hi,lo,avg=row
    if name!='科类总计':continue
    assert province=='陕西'
    out.append(rec('arts'if '历史'in req else'science','普通类 · 科类总计',lo,hi,requirement='历史 + 不限'if '历史'in req else'物理 + 化学'))
assert len(out)==2
save('dhu',2025,s['source'],out,'沿用校方2025陕西表中的“科类总计”，不把专业行重复计入。')

s=snapshots['gxnu25'];rr=[]
for row in s['tables'][0]:
    if len(row)!=8:continue
    batch,cat,sub,major,hi,lo,rank,note=row
    if sub not in ['文史/历史','理工/物理']:continue
    rr.append(rec('arts'if sub=='文史/历史'else'science',major,lo,hi,category=cat or '普通类',publishedRank=int(rank)))
assert len(rr)==28
save('gxnu-edu',2025,s['source'],grouped(rr),'按官网普通类专业表汇总；艺体类排除，中高计划及职教师资培养类型单列。')

for year in [2025,2026]:
    s=snapshots[f'bsu{year}'];rr=[]
    for sub,name,req,lo,hi,avg in s['tables'][3][3:]:
        assert sub in ['历史类','物理类']
        rr.append(rec('arts'if sub=='历史类'else'science',name,lo,hi,category='普通类',requirement=req))
    assert len(rr)==12
    save('bsu',year,s['source'],grouped(rr),'按校方普通类专业投档成绩汇总；体育类、艺术类和中外合作办学使用独立查询页，未混入此表。')

# Image-only official Henan table: 11 history + 13 physics ordinary majors,
# two history cooperative majors and one physics cooperative major.
save('henu',2025,'https://zs.henu.edu.cn/info/1035/9293.htm',[
    rec('arts','普通类 · 专业汇总',562,588,derived=True,majorCount=11),
    rec('science','普通类 · 专业汇总',516,581,derived=True,majorCount=13),
    rec('arts','中外合作办学 · 专业汇总',534,556,derived=True,majorCount=2,additional=True),
    rec('science','中外合作办学 · 计算机科学与技术',543,560,additional=True),
], '按校方2025年普通类录取公告中的陕西省图片表核对并汇总，中澳合作专业单列；不是院校正式投档线。')

# Jinan publishes explicit summary rows; no min-of-min derivation is needed.
save('jnu',2025,'https://zsb.jnu.edu.cn/_s145/2026/0331/c3454a852780/page.psp',[
    rec('science','本科批 · 普通类',580,619),rec('arts','本科批 · 普通类',596,608),
    rec('arts','戏剧影视文学 · 单列',577,584,additional=True),
    rec('science','本科批 · 国家专项',530,609,additional=True),
    rec('arts','本科批 · 国家专项',572,602,additional=True),
], '沿用校方表格的本科批汇总行；普通类、戏文单列和国家专项分别展示。')

s=snapshots['caa25']
row=next(r for r in s['tables'][1]if r[0]=='陕西')
assert row[1]=='587'and all(not c.strip()for c in row[2:])
save('caa',2025,s['source'],[rec('arts','普通类 · 艺术学理论类',587)],'校方2025年普通类专业最低投档分数表；只收录艺术学理论类，不与艺术类统考综合分混用。历史科类经同年公开分组信息交叉核对；未抄录第三方有差异的位次，按官方同分区间参考。')

(D/'reviewed-additions.json').write_text(json.dumps(additions,ensure_ascii=False,indent=2),encoding='utf-8')
print('Imported reviewed official tables:',len(additions),'school-years total')

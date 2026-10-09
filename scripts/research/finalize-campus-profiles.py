from pathlib import Path
import json,csv,re
root=Path(__file__).resolve().parents[2]
cache=root/'node_modules/.cache/campus-research'
profiles=json.loads((root/'data/campus-profiles-reviewed.json').read_text(encoding='utf-8-sig'))
seed=(root/'scripts/seed-university-profiles.ts').read_text(encoding='utf-8-sig')
for block in re.findall(r"\{ id: '(?:hust|tsinghua)'.*? \}",seed):
    if re.search(r"id: '([^']*)'",block).group(1) in {p['id'] for p in profiles}: continue
    profiles.append({k:re.search(r"\b"+k+r": '([^']*)'",block).group(1) for k in ['id','englishName','motto','introduction','website','sourceUrl','accent']})
rows=list(csv.DictReader((root/'scripts/research/campus-websites.tsv').open(encoding='utf-8-sig'),delimiter='\t'))
introductions=dict(line.split('\t',1) for line in (root/'scripts/research/campus-introductions-reviewed.tsv').read_text(encoding='utf-8-sig').splitlines() if line)
assert len(introductions)==131
sources={
'ouc':'https://www.ouc.edu.cn/31000/list.htm','ecnu':'https://www.ecnu.edu.cn/wzcd/xxgk/xqjj.htm','caa':'https://en.caa.edu.cn/about/Introduction.htm','nwu':'https://www.nwu.edu.cn/xxgk/xxjj.htm','neu':'https://www.neu.edu.cn/xygk/xxjj.htm','sust':'https://xxgk.sust.edu.cn/__local/7/DE/AD/1DCA7B40E938BC32373859E113D_80795002_A4756.pdf','bjwlxy':'https://yjszs.bjwlxy.edu.cn/xxgk/xxjj.htm','bupt':'https://xwb.bupt.edu.cn/info/1069/2714.htm','ahau':'https://www.ahu.edu.cn/148/list.htm','cnu':'https://www.cnu.edu.cn/xxgk/xxjj/index.htm','tmu':'https://www.tmu.edu.cn/6/list.htm','shu':'https://www.shu.edu.cn/xxgk/xxjj.htm','shutcm':'https://iec.shutcm.edu.cn/en/602/list.htm','ecust':'https://www.ecust.edu.cn/587/list.htm','jnu':'https://www.jnu.edu.cn/2561/list.htm','swupl':'https://www.swupl.edu.cn/xxgk/xxjj/index.htm','ruc':'https://www.ruc.edu.cn/xuexiaojianjie.html','zjnu':'https://www.zjnu.edu.cn/3999/list.htm','gxnu-edu':'https://www.gxnu.edu.cn/1365/list.htm','zzu':'https://www.zzu.edu.cn/xxgk/xxjj.htm','sustech':'https://www.sustech.edu.cn/zh/about.html'}
mottos={'ruc':'实事求是','sust':'至诚至博','bjwlxy':'博文明理 · 厚德尚能','bupt':'厚德博学 · 敬业乐群','njnu':'正德厚生 · 笃学敏行','suda':'养天地正气 · 法古今完人','xjtlu':''}
existing={r['id'] for r in profiles}
for row in rows:
    id=row['id']
    if id in existing: continue
    evidence=json.loads((cache/(id+'.json')).read_text(encoding='utf-8-sig'))
    profiles.append({'id':id,'englishName':row['englishName'],'motto':mottos.get(id,evidence.get('motto','')),'introduction':introductions[id],'website':'https://www.'+row['domain']+'/','sourceUrl':sources.get(id,evidence['sourceUrl']),'accent':evidence.get('accent',''),'reviewedAt':'2026-10-09'})
normalize=lambda s:re.sub(r'\s+','',s).replace('（','(').replace('）',')')
t985=normalize(json.loads((cache/'moe-levels.json').read_text(encoding='utf-8-sig'))['985']['text'])
t211=normalize((root/'node_modules/.cache/211-list.txt').read_text(encoding='utf-8-sig'))
tdf=normalize((cache/'double-first.txt').read_text(encoding='utf-8-sig'))
names={f.stem:json.loads(f.read_text(encoding='utf-8-sig')).get('name','') for f in cache.glob('*.json') if f.stem not in ['summary','moe-levels']}
catalog=(root/'data/universities.ts').read_text(encoding='utf-8-sig')
for match in re.finditer(r"id:\s*'([^']+)'\s*,\s*name:\s*'([^']+)'",catalog): names[match[1]]=match[2]
for p in profiles:
    name=normalize(names.get(p['id'],'')); assert name,p['id']
    aliases={'nudt':'国防科学技术大学','afmu':'第四军医大学','nwafu':'西北农林科大'}
    a=aliases.get(p['id'],name)
    tags=[]
    if name in t985 or (p['id']=='nudt' and a in t985):tags.append('985')
    if name in t211 or a in t211:tags.append('211')
    double_name=name.replace('(武汉)','').replace('(华东)','')
    if double_name in tdf or (p['id']=='nudt' and '国防科技大学' in tdf):tags.append('双一流')
    p['level']='/'.join(tags) or None
    assert len(p['introduction'])>70,p['id']
    assert p['sourceUrl'].startswith('https://'),p['id']
assert len(profiles)==149 and len({p['id'] for p in profiles})==149
(root/'data/campus-profiles-reviewed.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'profiles':len(profiles),'introductions':sum(bool(p['introduction']) for p in profiles),'mottos':sum(bool(p['motto']) for p in profiles),'985':sum('985' in (p['level'] or '') for p in profiles)},ensure_ascii=False))

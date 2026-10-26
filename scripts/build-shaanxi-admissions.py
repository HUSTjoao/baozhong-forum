"""Build reviewed, traceable per-school records from public source snapshots."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,hashlib,collections
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'data/admissions-sources'
class Table(HTMLParser):
 def __init__(self):super().__init__();self.rows=[];self.row=None;self.cell=None
 def handle_starttag(self,t,a):
  if t=='tr':self.row=[]
  if t in ['td','th']:self.cell=''
 def handle_data(self,d):
  if self.cell is not None:self.cell+=d
 def handle_endtag(self,t):
  if t in ['td','th'] and self.cell is not None:
   if self.row is not None:self.row.append(re.sub(r'\s+',' ',self.cell).strip())
   self.cell=None
  if t=='tr' and self.row:self.rows.append(self.row);self.row=None

def load(name):return json.loads((D/name).read_text(encoding='utf-8-sig'))
def norm(s):return s.replace('（','(').replace('）',')').replace(' ','')
def num(s):
 try:
  n=float(str(s));return int(n)if n>0 and n.is_integer()else None
 except:return None

def subject(s):
 if any(x in s for x in ['艺术','体育','不分','综合']):return None
 if '理' in s or '物' in s:return 'science'
 if '文' in s or '史' in s:return 'arts'
 return None
ordinary={'普通类','普通考生','本科普通批','统招','普通类（本科批）'}
manifest=[];schools={x['id']:{'universityId':x['id'],'name':x['name'],'checkedAt':'2026-10-24','years':[2026,2025,2024],'records':{},'officialUrl':x['website']}for x in load('catalog.json')}
for batch in [1,2]:
 for suffix,sub in [('LG','science'),('WS','arts')]:
  path=D/f'2024-{batch}BZS-{suffix}.html';b=path.read_bytes()
  try:s=b.decode('utf-8')
  except:s=b.decode('gb18030')
  url=f'https://www.sneac.com/htm/2024/'+(f'1BZS-{suffix}.html'if batch==1 else f'2024EBZS-{suffix}.html')
  manifest.append({'file':path.name,'url':url,'sha256':hashlib.sha256(b).hexdigest()})
  p=Table();p.feed(s)
  for r in p.rows:
   if len(r)!=8 or not r[0].isdigit():continue
   seq,kl,code,name,planned,submitted,score,rank=r
   for school in schools.values():
    if norm(name)!=norm(school['name']):continue
    if num(score)is None or num(rank)is None:continue
    entry=school['records'].setdefault('2024',{'kind':'submission','source':url,'sourceName':'陕西招生考试信息网','batch':'本科一批 / 二批','records':[]})
    rec={'code':code,'label':name,'subject':sub,'score':num(score),'rank':num(rank),'planned':num(planned),'submitted':num(submitted),'batch':'本科一批'if batch==1 else'本科二批','source':url}
    # First official code in each subject is shown separately; other codes are
    # retained without inventing a category. No code is merged into its score.
    if any(x['subject']==sub for x in entry['records']):rec['additional']=True
    entry['records'].append(rec)

for result in load('public-score-api.json'):
 if not result['rows']:continue
 rows=result['rows'];out=[]
 for sub in ['science','arts']:
  candidates=[r for r in rows if subject(r.get('klmc',''))==sub]
  # Prefer the official group table to a duplicate school-wide summary.
  if any(r['_table']=='sszyzgradeList'for r in candidates):candidates=[r for r in candidates if r['_table']=='sszyzgradeList']
  for index,r in enumerate(candidates):
   score=num(r.get('minScore'));high=num(r.get('maxScore'))
   if not score or score>750:continue
   category=r.get('zslx')or r.get('zylx')or'类型未列'
   group=r.get('zyzname')or''
   label=' · '.join(x for x in [category,group,r.get('campus')]if x)
   record={'code':f'{sub}-{index}','label':label,'subject':sub,'score':score,'category':category,'source':result['page']}
   if high:record['highest']=high
   if num(r.get('minOrder')):record['publishedRank']=num(r['minOrder'])
   if group and re.fullmatch(r'(物理)?\+?(化学|不限)|不限|历史',group):record['requirement']=group
   if category not in ordinary:record['additional']=True
   out.append(record)
 if out:schools[result['id']]['records'][str(result['year'])]={'kind':'admission','source':result['page'],'sourceName':schools[result['id']]['name']+'本科招生网','records':out,'note':'校方公开录取统计；招生分组及类型保留原表名称。'}

for result in load('vue-public-scores.json') + (load('vue-public-scores-extra.json')if(D/'vue-public-scores-extra.json').exists()else[]):
 for year,v in result['years'].items():
  if not v['list'] and not v['sumList']:continue
  out=[];derived=False
  for sub in ['science','arts']:
   summary=[r for r in v['sumList']if subject(r.get('klmc',''))==sub]
   if summary:
    for index,r in enumerate(summary):
     score=num(r.get('zdf'));high=num(r.get('zgf'));cat=r.get('zslb')or'类型未列'
     if not score or score>750:continue
     label=' · '.join(x for x in [cat,r.get('zygroup'),r.get('xqlx')]if x)
     record={'code':f'{sub}-{index}','label':label,'subject':sub,'score':score,'category':cat,'source':result['page']}
     if high:record['highest']=high
     if num(r.get('zdfwc')):record['publishedRank']=num(r['zdfwc'])
     if r.get('xkyq')or r.get('xkkm'):record['requirement']=r.get('xkyq')or r['xkkm']
     if cat not in ordinary:record['additional']=True
     out.append(record)
   else:
    derived=True;groups=collections.defaultdict(list)
    for r in v['list']:
     if subject(r.get('klmc',''))!=sub:continue
     # Exclude arts/sports score scales even if the subject label is generic.
     cat=r.get('zslb')or'类型未列'
     if any(x in cat for x in ['艺术','体育','运动','强基']):continue
     if not num(r.get('zdf'))or num(r['zdf'])>750:continue
     key=(cat,r.get('zygroup')or'',r.get('xkyq')or r.get('xkkm')or'',r.get('xqlx')or'')
     groups[key].append(r)
    for index,((cat,group,req,campus),records)in enumerate(groups.items()):
     score=min(num(r['zdf'])for r in records);high=max([num(r.get('zgf'))or num(r['zdf'])for r in records])
     label=' · '.join(x for x in [cat,('组 '+group)if group else'专业汇总',campus]if x)
     record={'code':f'{sub}-{index}','label':label,'subject':sub,'score':score,'highest':high,'category':cat,'source':result['page'],'derived':True,'majorCount':len(records)}
     if req:record['requirement']=req
     if cat not in ordinary:record['additional']=True
     out.append(record)
  if out:schools[result['id']]['records'][str(year)]={'kind':'admission','source':result['page'],'sourceName':schools[result['id']]['name']+'本科招生网','records':out,'note':('部分记录按官网已收录专业分数汇总，不能当作投档线。'if derived else'校方公开录取统计；分组和招生类型保留原表名称。')}

# Independently transcribed rows from readable official publications.
manual_file=D/'reviewed-additions.json'
if manual_file.exists():
 for r in load('reviewed-additions.json'):
  schools[r['id']]['records'][str(r['year'])]=r['dataset']

# Secondary public tables are fallbacks only. They cannot overwrite school or
# provincial publications, and their separate kind stays visible in the UI.
reference_file=D/'public-reference-records.json'
if reference_file.exists():
 references=collections.defaultdict(list)
 for r in load('public-reference-records.json'):references[(r['id'],str(r['year']))].append(r['dataset'])
 for (id,year),datasets in references.items():
  if year in schools[id]['records']:continue
  selected=[]
  for sub in ['science','arts']:
   # A detailed special-admission source cannot hide a main-table reference.
   # Choose them independently; neither source is promoted to official data.
   for extra in [False,True]:
    candidates=[(d,[r for r in d['records']if r['subject']==sub and bool(r.get('additional'))==extra])for d in datasets]
    candidates=[(d,rs)for d,rs in candidates if rs]
    if not candidates:continue
    dataset,rows=max(candidates,key=lambda pair:(sum('专业组 'in r['label']for r in pair[1]),len(pair[1])))
    selected.append((dataset,rows))
  if selected:
   entry={**selected[0][0],'records':[r for _,rows in selected for r in rows]}
   schools[id]['records'][year]=entry

for id,notes in load('availability-notes.json').items():
 schools[id]['yearNotes']=notes

for school in schools.values():
 for entry in school['records'].values():
  if entry['kind']=='submission':
   entry['batch']=' / '.join(dict.fromkeys(r['batch']for r in entry['records']))

(ROOT/'data/shaanxi-admissions-catalog.json').write_text(json.dumps(schools,ensure_ascii=False,indent=2),encoding='utf-8')
(D/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
report=[]
discovery={r['id']:r for r in load('discovery.json')}
for school in schools.values():
 y=school['records'];d=discovery.get(school['universityId'],{})
 report.append({'id':school['universityId'],'name':school['name'],'years':{str(v):{'records':len(y.get(str(v),{}).get('records',[])),'kind':y.get(str(v),{}).get('kind'),'source':y.get(str(v),{}).get('source')}for v in [2026,2025,2024]},'officialQueries':d.get('candidates',[])[:3],'unresolved':d.get('errors',[])})
(D/'coverage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('Coverage', {str(y):sum(str(y)in s['records']for s in schools.values())for y in [2024,2025,2026]},'any',sum(bool(s['records'])for s in schools.values()),'three years',sum(len(s['records'])==3 for s in schools.values()))

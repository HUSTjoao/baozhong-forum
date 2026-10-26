"""Import checked public university tables; retain source snapshots and filters."""
from pathlib import Path
import hashlib,json,re
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'data/admissions-sources'
C=D/'research-cache'
additions=json.loads((D/'reviewed-additions.json').read_text(encoding='utf-8'))
evidence=[]
def snapshot(name,url,query=None):
    b=(C/name).read_bytes()
    item={'file':name,'source':url,'sha256':hashlib.sha256(b).hexdigest()}
    if query:item['query']=query
    evidence.append(item)
    return b,item
def save(id,year,url,name,rows,note):
    assert rows
    dataset={'kind':'admission','source':url,'sourceName':name,'records':rows,'note':note}
    additions[:]=[a for a in additions if (a['id'],a['year'])!=(id,year)]
    additions.append({'id':id,'year':year,'dataset':dataset})
def table_rows(b):
    soup=BeautifulSoup(b,'html.parser')
    return [[c.get_text(' ',strip=True)for c in tr.find_all(['td','th'],recursive=False)]for tr in soup.select('tr')]

for year in [2025,2026]:
    page='https://zsb.neau.edu.cn/zsw/lnfs.html'
    raw,proof=snapshot(f'neau-{year}-new-query.json','https://zsb.neau.edu.cn/f/ajax_lnfs',{'ssmc':'陕西','zsnf':str(year)})
    obj=json.loads(raw)
    assert obj['state']==1
    source_rows=obj['data']['sszyzgradeList']
    proof['rows']=source_rows
    rows=[]
    for i,r in enumerate(source_rows):
        assert r['ssmc']=='陕西'and str(r['nf'])==str(year)
        sub='science'if r['klmc']=='物理类'else'arts'
        rows.append({'code':f'official-{sub}-{i}','label':r['zyzname'],'subject':sub,'category':r['zslx'],'score':int(r['minScore']),'highest':int(r['maxScore']),'publishedRank':int(r['minOrder']),'source':page})
    save('neau',year,page,'东北农业大学本科招生信息网',rows,'校方公开专业组录取统计；对应省排名保留官网口径，不能当作省考试院精确投档位次。')

for year in [2025,2026]:
    page=f'https://bm.bsu.edu.cn/lscj/index_1_{year}_61.aspx'
    raw,proof=snapshot(f'bsu{year}-20261025.html',page)
    original=[r for r in table_rows(raw)if len(r)==6 and r[0]in['历史类','物理类']]
    assert len(original)==12
    proof['rows']=original
    rows=[]
    for i,r in enumerate(original):
        sub='arts'if r[0]=='历史类'else'science'
        rows.append({'code':f'major-{i}','label':'普通类 · '+r[1],'subject':sub,'category':'普通类','requirement':r[2],'score':int(r[3]),'highest':int(r[4]),'source':page})
    save('bsu',year,page,'北京体育大学本科招生网',rows,'校方普通类分专业录取成绩；逐专业保留，页面最低分按已公布专业比较，不冒充完整专业组投档线。')

for year in [2025,2026]:
    page='http://zsxt.ccnu.edu.cn/apply/index.php?g=apply&m=index&a=index'
    raw,proof=snapshot(f'ccnu{year}-20261025.html',page,{'year':str(year),'pro':'陕西'})
    original=[r for r in table_rows(raw)if len(r)==9 and r[0]==str(year)and r[1]=='陕西']
    assert len(original)==(7 if year==2025 else 11)
    proof['rows']=original
    rows=[]
    for i,r in enumerate(original):
        sub='arts'if r[3]=='历史类'else'science'
        label=re.sub(r'\s+',' ',r[2])
        row={'code':f'special-{i}','label':label+(' · '+r[8]if r[8]else''),'subject':sub,'category':label,'score':int(r[5]),'additional':True,'source':page}
        if r[7].isdigit():row['publishedRank']=int(r[7])
        rows.append(row)
    save('hustc',year,page,'华中师范大学本科招生网',rows,'校方陕西分省录取表；公费师范、优师、国家专项、高校专项分别保留，均不算普通本科批统一门槛。来源需选择陕西和相应年份。')

page='https://zs.lnu.edu.cn/info/14381/71600.htm'
pdf='https://zs.lnu.edu.cn/__local/C/8E/E5/634FEBF1D639EAC31A36F20652E_AF03930E_F831.pdf'
_,proof=snapshot('lnupdf-20261025.pdf',pdf)
# Read using MarkItDown, then verify merged cells against the one-page source.
original=[
 ['普通类','science','制药工程',592,13439,597],
 ['普通类','science','汉语国际教育',552,27204,560],
 ['普通类','science','电子信息科学与技术',598,11885,598],
 ['普通类','science','通信工程',597,12142,597],
 ['普通类','arts','国际政治',576,4184,582],
 ['普通类','arts','国际经济与贸易',575,4298,575],
 ['普通类','arts','朝鲜语',572,4617,574],
 ['普通类','arts','经济学类',577,4062,582],
 ['普通类','arts','考古学',576,4184,583],
 ['国家专项计划','science','化学类',559,24395,562],
 ['国家专项计划','science','数学与应用数学',557,25187,565],
 ['国家专项计划','arts','汉语言文学',585,3310,588],
]
proof['columns']=['category','subject','major','minimum','publishedRank','maximum']
proof['rows']=original
rows=[]
for i,(cat,sub,major,score,rank,high)in enumerate(original):
    r={'code':f'major-{i}','label':cat+' · '+major,'subject':sub,'category':cat,'score':score,'highest':high,'publishedRank':rank,'source':pdf}
    if cat!='普通类':r['additional']=True
    rows.append(r)
save('lnu',2025,page,'辽宁大学本科招生网',rows,'校方陕西分专业录取PDF；普通类和国家专项分别列出。各专业最低分不等于完整专业组投档线。')

for year in [2025,2026]:
    page='https://zb.muc.edu.cn/content/zs/7fd7b6c2-f0de-11ee-a4af-00163e36a0b0.htm'
    query={'vepd_sf':'610000','vepd_year':str(year),'vepd_kldm':'','vepd_xslxdm':''}
    raw,proof=snapshot(f'muc{year}-20261025.json','https://zb.muc.edu.cn/query/findAdmissionScoreTotal.json',query)
    obj=json.loads(raw);assert obj['success']
    proof['rows']=obj['rows'];rows=[]
    for i,r in enumerate(obj['rows']):
        assert r['sfmc']=='陕西'and r['year']==year
        sub='arts'if r['klmc']=='历史类'else'science'
        row={'code':f'summary-{i}','label':r['zslbmc'],'subject':sub,'category':r['zslbmc'],'score':int(r['mincj']),'highest':int(r['maxcj']),'publishedRank':int(r['minwc']),'source':page}
        if r['zslbmc']!='普通本科':row['additional']=True
        rows.append(row)
    save('muc',year,page,'中央民族大学本科招生网',rows,'校方分省录取概况；普通本科与国家专项分开保留，来源需选择陕西和相应年份。')

page='https://zs.cufe.edu.cn/static/front/cufe/basic/html_web/lnfs.html'
raw,proof=snapshot('cufe2025-20261025.json','https://zs.cufe.edu.cn/f/ajax_lnfs',{'ssmc':'陕西','zsnf':'2025'})
obj=json.loads(raw);assert obj['state']==1
proof['rows']=obj['data']['zsSsgradeList'];rows=[]
for i,r in enumerate(proof['rows']):
    assert r['ssmc']=='陕西'and r['nf']=='2025'
    sub='arts'if r['klmc']=='历史类'else'science'
    row={'code':f'summary-{i}','label':r['zslx'],'subject':sub,'category':r['zslx'],'score':int(r['minScore']),'highest':int(r['maxScore']),'publishedRank':int(r['minOrder']),'source':page}
    if r['zslx']!='统招':row['additional']=True
    rows.append(row)
save('cufe',2025,page,'中央财经大学本科招生网',rows,'校方分省录取统计，统招、国家专项、高校专项分别列出。')

page='https://zsdata.tju.edu.cn/zsdata/lqxx/#/lnfs'
raw,proof=snapshot('tju2025-20261025.json','https://zsdata.tju.edu.cn/lqxx/s/api/front/lqxx/getList',{'type':'lnfs','sf':'陕西','nf':'2025','zslb':'全部','klmc':'全部','xqmc':''})
obj=json.loads(raw);assert obj['code']==200
proof['rows']=obj['sumList'];rows=[]
for i,r in enumerate(obj['sumList']):
    assert r['sf']=='陕西'and r['nf']=='2025'
    sub='arts'if r['klmc']=='历史类'else'science'
    row={'code':f'summary-{i}','label':r['zslb']+' · '+r['xqlx'],'subject':sub,'category':r['zslb'],'score':int(r['zdf']),'highest':int(r['zgf']),'source':page}
    if r['zslb']!='普通类':row['additional']=True
    rows.append(row)
save('tju',2025,page,'天津大学本科招生网',rows,'校方陕西分省录取汇总；普通类、国家专项、高校专项分列，未提供精确最低位次。')

page='https://www.xjtlu.edu.cn/zh/admissions/domestic/ug/2023luqushuju'
raw,proof=snapshot('xjtlu2026-20261025.html',page)
soup=BeautifulSoup(raw,'html.parser')
assert '2026年分省录取数据'in soup.get_text()
heading=next(h for h in soup.select('h1,h2,h3,h4,h5')if h.get_text(strip=True)=='陕西省')
source_rows=[r for r in table_rows(str(heading.find_next('table')).encode())if len(r)==7 and r[0]in['历史','物理']]
proof['rows']=source_rows;rows=[]
for i,r in enumerate(source_rows):
    if len(r)!=7 or r[0]not in['历史','物理']:continue
    sub='arts'if r[0]=='历史'else'science'
    rows.append({'code':f'cooperative-{i}','label':'合作办学 · '+r[2],'subject':sub,'category':'合作办学','requirement':r[1],'score':int(r[6]),'highest':int(r[5]),'additional':True,'source':page})
save('xjtlu',2026,page,'西交利物浦大学官网',rows,'校方2026年分省录取数据中的陕西表；院校为合作办学，大类招生条件与费用应单独核对。')

page='https://admissions.bjut.edu.cn/dfiles/2025/2025nianbeijinggongyedaxuejingwaishengfenputongleiluqufenshutongji.pdf'
_,proof=snapshot('bjut2025pdf-20261025.pdf',page)
original=[['普通类','计算机科学与技术',615,619],['普通类','电子信息工程',614,617],['普通类','机械类',613,614],['普通类','土木类',606,612],['国家专项','材料类(实验班)',561,581],['国家专项','土木类',549,560],['国家专项','建筑学',548,557]]
proof['page']=4;proof['columns']=['category','major','minimum','maximum'];proof['rows']=original;rows=[]
for i,(cat,major,score,high)in enumerate(original):
    row={'code':f'major-{i}','label':cat+' · '+major,'subject':'science','category':cat,'score':score,'highest':high,'source':page}
    if cat!='普通类':row['additional']=True
    rows.append(row)
save('bjut',2025,page,'北京工业大学本科招生网',rows,'校方2025年京外分专业录取PDF第4页陕西部分；普通类与国家专项分列，不推算未公布位次。')

(D/'reviewed-additions.json').write_text(json.dumps(additions,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(D/'supplementary-official-evidence-20261025.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Imported',len(evidence),'official school-years;',sum(len(e.get('rows',[]))for e in evidence),'source rows')

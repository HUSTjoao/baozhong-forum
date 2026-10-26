"""Extract only explicitly dated, province-labelled published tables.

Every score/rank pair still goes through the independent cohort validator.
No predicted scores, other-province values or similarly named campuses enter.
"""
from pathlib import Path
import json,re
from bs4 import BeautifulSoup
D=Path(__file__).resolve().parents[1]/'data/admissions-sources';C=D/'research-cache'
sources=json.loads((C/'target-reference-extracted.json').read_text(encoding='utf-8'))
norm=lambda s:re.sub(r'\s','',s).replace('（','(').replace('）',')')
names={norm(s['name']):s['name']for s in json.loads((D/'catalog.json').read_text(encoding='utf-8'))}
new=[];seen_urls=set()
for src in sources:
    if 'error'in src:continue
    if src['url']in seen_urls:continue
    seen_urls.add(src['url'])
    soup=BeautifulSoup((C/src['cache']).read_bytes(),'html.parser')
    out=[]
    is_211='read_2722827315022.'in src['url']
    is_special='read_27286194601.'in src['url']
    local=(norm(src['name'])+'陕西录取分数线2025'in norm(src['title']))
    # A similarly named Beijing campus is not the Wuhan/Xuzhou institution.
    if local and '中国矿业大学(北京)'in src['title']and src['name']=='中国矿业大学':local=False
    for t in soup.select('table'):
        trs=[[c.get_text(' ',strip=True)for c in tr.select('th,td')]for tr in t.select('tr')]
        if not trs:continue
        header=' '.join(trs[0]);heading=t.find_previous(['h2','h3','h4']);heading=heading.get_text(' ',strip=True)if heading else''
        if ('2025'not in header and '/daxue/luqu_2009.'not in src['url'])or '位次'not in header:continue
        if is_211 or is_special:
            if '物理'in heading:sub='science'
            elif '历史'in heading:sub='arts'
            else:continue
            for r in trs[1:]:
                name=names.get(norm(r[0]))
                if name and len(r)>=3 and r[-2].isdigit()and r[-1].isdigit():
                    row={'name':name,'subject':sub,'score':int(r[-2]),'publishedRank':int(r[-1])}
                    if is_special:row.update(group='国家专项计划',additional=True)
                    out.append(row)
        elif local and '批次'in header and '专业组'in header:
            # Subject labels immediately precede each table in these articles.
            sub=None
            for node in t.previous_elements:
                if isinstance(node,str)and node.strip()in ['物理类','历史类']:
                    sub='science'if node.strip()=='物理类'else'arts';break
                if getattr(node,'name',None)in ['h2','h3']:break
            if not sub:continue
            for r in trs[1:]:
                if len(r)==4 and r[-2].isdigit()and r[-1].isdigit():
                    group=norm(r[1]);out.append({'name':src['name'],'subject':sub,'group':group,'score':int(r[-2]),'publishedRank':int(r[-1]),'additional':any(x in group for x in ['专项','合作','预科','定向'])})
        elif 'dakao100.com'in src['url']and '招生'in header and '省份'in header and len(trs[0])==5:
            for r in trs[1:]:
                if len(r)!=5 or r[0]!='陕西'or not r[3].isdigit()or not r[4].isdigit():continue
                if '物理类'in r[1]:sub='science'
                elif '历史类'in r[1]:sub='arts'
                else:continue
                group=norm(r[1]).replace('物理类','').replace('历史类','').strip('()')
                category=norm(r[2]);special='普通类'not in category
                out.append({'name':src['name'],'subject':sub,'group':group+'组 · '+category,'score':int(r[3]),'publishedRank':int(r[4]),'additional':special})
        elif '/daxue/luqu_2009.'in src['url']and '最低分'in header:
            for r in trs[1:]:
                if len(r)==5 and r[0]=='陕西'and r[3].isdigit()and r[4].isdigit():
                    out.append({'name':src['name'],'subject':'science','group':r[2].replace('中国人民解放军','').replace(src['name'],''),'score':int(r[3]),'publishedRank':int(r[4]),'additional':not bool(r[1])})
        elif any(x in header for x in ['省份','省市'])and any(x in header for x in ['科目','科类']):
            # Only unambiguous explicit 2025 national tables of the exact school.
            if norm(src['name'])not in norm(src['title']):continue
            for r in trs[1:]:
                if len(r)==5 and r[1]=='陕西'and r[2]in ['物理','历史']and r[3].isdigit()and r[4].isdigit()and norm(r[0]).startswith(norm(src['name'])):
                    group=norm(r[0]).removeprefix(norm(src['name']))
                    out.append({'name':src['name'],'subject':'science'if r[2]=='物理'else'arts','group':group,'score':int(r[3]),'publishedRank':int(r[4]),'additional':any(x in group for x in ['合作','专项','定向','预科'])})
                if len(r)==4 and r[0]=='陕西'and r[1]in ['物理类','历史类']and r[2].isdigit()and r[3].isdigit():
                    out.append({'name':src['name'],'subject':'science'if r[1]=='物理类'else'arts','score':int(r[2]),'publishedRank':int(r[3])})
    if out:new.append({'key':'target-'+src['cache'],'url':src['url'],'publisher':'高考100','year':2025,'title':src['title'],'sha256':src['sha256'],'rows':out})
p=D/'public-reference-tables.json';existing=json.loads(p.read_text(encoding='utf-8'))
existing=[t for t in existing if not str(t.get('key','')).startswith('target-')]+new
p.write_text(json.dumps(existing,ensure_ascii=False,indent=2),encoding='utf-8')
print('Extracted',len(new),'tables',sum(len(t['rows'])for t in new),'rows')
for t in new:print(t['title'],len(t['rows']))

from urllib.request import urlopen
from pathlib import Path
from bs4 import BeautifulSoup
import json,re,hashlib
sources={2024:{'science':'https://www.sneea.cn/info/1027/14886.htm'},2025:{'science':'https://www.sneac.com/info/1019/18391.htm','arts':'https://www.sneac.com/info/1019/18393.htm'},2026:{'science':'https://www.sneea.cn/info/1027/17658.htm','arts':'https://www.sneea.cn/info/1027/17654.htm'}}
out={}
for year,groups in sources.items():
 out[str(year)]={}
 for sub,u in groups.items():
  b=urlopen(u,timeout=20).read();p=Path(f'data/admissions-sources/{year}-distribution-{sub}.html');p.write_bytes(b)
  try:s=b.decode('utf-8')
  except:s=b.decode('gb18030')
  soup=BeautifulSoup(s,'html.parser');tables=soup.select('table');scores={}
  # The first statistics table is the ordinary-subject cohort; later tables
  # belong to arts/sports and must not be mixed into ordinary-subject ranks.
  for table in tables:
   rows=table.select('tr');candidate={}
   for row in rows:
    cells=[c.get_text('',strip=True).replace(',','')for c in row.select('td,th')]
    if len(cells)==3 and all(re.fullmatch(r'\d+',x)for x in cells):
     score,count,total=map(int,cells)
     if 100<=score<=750 and 0<count<=total:candidate[str(score)]={'count':count,'cumulative':total}
   if len(candidate)>50:scores=candidate;break
  assert len(scores)>50,(u,len(scores))
  out[str(year)][sub]={'source':u,'scores':scores,'sha256':hashlib.sha256(b).hexdigest()}
  print(year,sub,len(scores))
Path('data/shaanxi-score-distributions.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')

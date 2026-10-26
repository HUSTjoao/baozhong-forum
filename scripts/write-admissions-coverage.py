"""Generate a coverage ledger, keeping reference data separate from official data."""
from pathlib import Path
import collections,json
ROOT=Path(__file__).resolve().parents[1]
schools=json.loads((ROOT/'data/shaanxi-admissions-catalog.json').read_text(encoding='utf-8'))
values=list(schools.values());labels={'submission':'正式投档','admission':'校方统计','reference':'公开参考'}
records=sum(len(e['records'])for s in values for e in s['records'].values())
lines=['# 陕西招生数据覆盖清单（2026-10-24）','',f'网站共 {len(values)} 所大学；{sum(bool(s["records"])for s in values)} 所至少有一年分数，{sum(len(s["records"])==3 for s in values)} 所三年均有记录，共 {records} 条展示记录。这里的“有记录”不代表两个科类、所有专业组或所有招生类型都完整。','', '| 年份 | 有分数的学校 | 官方投档 / 校方统计 | 公开参考 | 历史或文史有记录 | 物理或理工有记录 |','| --- | ---: | ---: | ---: | ---: | ---: |']
for year in ['2026','2025','2024']:
    entries=[s['records'][year]for s in values if year in s['records']]
    counts=collections.Counter(e['kind']for e in entries)
    subjects={sub:sum(any(r['subject']==sub for r in e['records'])for e in entries)for sub in ['arts','science']}
    lines.append(f'| {year} | {len(entries)} | {counts["submission"]+counts["admission"]} | {counts["reference"]} | {subjects["arts"]} | {subjects["science"]} |')
lines+=['','## 仍未取得可核验分数的学校','', '上海中医药大学、中央音乐学院、安徽师范大学、首都师范大学：当前尚无可核验的陕西普通类分数。部分学校的公开普通类表未列陕西，另有艺术类、校考等不同口径；不据此断言当年没有招生，也不拿其他省份或艺术综合成绩填补。','', '另外两项已查明的年份说明：','', '- 汕头大学：校方校友会刊载的2026年招生说明明确“今年学校首次增加陕西省招生”，因此不填2024、2025陕西分数。[校方来源](https://xyh.stu.edu.cn/alumni/front/account/detail.jsp?id=53160)。','- 南方科技大学：已收录2025、2026公开参考；2024尚未取得陕西可核验分数。综合评价成绩与高考分数不能互换。','','## 来源与核对方法','','- 2024：陕西省官方本科一、二批正式投档表，逐院校代号保留。','- 2025、2026：学校官方查询、PDF、HTML和图片优先；缺少官方表时收录明确标为“公开参考”的第三方资料，不能视为已经核实的官方投档线。','- 2026全国高校图表先按表格坐标识别，再人工检查识别漏字；保存原图SHA-256、页码和行号。中山大学原图664分/3681位自身矛盾，该行由同年一分一段校验拒绝，没有擅自改成644。','- 每条公开参考的分数与所列位次必须落在陕西官方同年同科类一分一段区间内。此检查只排除明显矛盾，不能证明网页年份和招生类型正确，因此仍保留参考标识及来源，未取得的最高分、选科要求不作推算。','- 2026报考指南中引用的2025成绩归入2025；不把“2026年可参考”当成2026年录取结果。','- 普通类、国家专项、高校专项、合作办学等能够辨认的类型分开展示。未辨认的分组明确标注“类型待核”，不声称是普通类统一门槛。','- 校方资料优先于公开参考，参考资料不能覆盖现有官方学校年度记录。每条分数保留来源链接，不涉及个人录取查询。','- 中国美术学院2025官方网页本地请求返回403，网页读取器可读取；所存快照为相关表头和陕西行，SHA-256范围明确标为提取表JSON，而非原始HTML。','- 官方记录、参考记录与尚缺数据逐校列在下表；缺科类可能属于未收录或当年未安排相应招生，未取得计划依据时不作结论。','','## 逐校覆盖','','| 大学 | 2026 | 2025 | 2024 |','| --- | --- | --- | --- |']
gap_lines=['','## 整年无记录（不含缺科类、仅专项及仅公开参考）','']
for year in ['2026','2025','2024']:
    missing=[s['name']for s in values if year not in s['records']]
    gap_lines.append(f'- {year}：'+('、'.join(missing)if missing else'无')+'。')
gap_lines+=['','另隔离一个公开分省来源的244条候选行：大量不同年份重复同分，与已知官方成绩对照后无法核实年份及类型。这些行不进入任何展示和覆盖数量；原始候选表与对照证据分别保存在 `excluded-reference-tables.json` 和 `excluded-source-audit.json`。','']
at=lines.index('## 逐校覆盖')
lines[at:at]=gap_lines
for s in values:
    cells=[]
    for year in ['2026','2025','2024']:
        e=s['records'].get(year)
        if not e:
            note=s.get('yearNotes',{}).get(year)
            cells.append(f'[招生说明]({note["source"]})'if note else'未收录')
        else:
            subs=' / '.join(('历史'if year!='2024'else'文史')if sub=='arts'else('物理'if year!='2024'else'理工')for sub in ['arts','science']if any(r['subject']==sub for r in e['records']))
            cells.append(f'[{labels[e["kind"]]} · {len(e["records"])}条 · {subs}]({e["source"]})')
    lines.append('| '+s['name']+' | '+' | '.join(cells)+' |')
(ROOT/'docs/shaanxi-admissions-coverage-20261024.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
def subject_state(entry,sub):
    if not entry:return '整年未收录'
    rows=[r for r in entry['records']if r['subject']==sub]
    if not rows:return '本科类未收录'
    main=[r for r in rows if not r.get('additional')]
    if not main:return '仅专项等，缺普通类'
    if entry['kind']=='reference':return '有公开参考，普通类待官方核验'
    return '官方主表有记录'

detail=['# 陕西招生数据：逐年、逐科类核对清单（2026-10-25）','','每个学校每个年份分别列出两类情况。“有公开参考”不等于已有官方普通类投档线；“官方主表有记录”也不承诺所有专业组齐全。未收录不代表没有招生。','','2024使用文史、理工分科；2025和2026使用历史、物理分科。仅有专项的数据不能算普通类已补齐。','','| 学校 | 年份 | 历史 / 文史 | 物理 / 理工 |','| --- | --- | --- | --- | --- |']
for s in values:
    for year in ['2026','2025','2024']:
        e=s['records'].get(year)
        detail.append('| '+s['name']+' | '+year+' | '+subject_state(e,'arts')+' | '+subject_state(e,'science')+' |')
(ROOT/'docs/shaanxi-admissions-subject-gaps-20261025.md').write_text('\n'.join(detail)+'\n',encoding='utf-8')
lines.insert(4,'详细科类状态请见[逐年、逐科类核对清单](shaanxi-admissions-subject-gaps-20261025.md)，不能仅据“年度有记录”判断已补齐普通类。\n')
lines=[line.replace('已收录2025、2026公开参考；2024尚未取得陕西可核验分数','已收录2024提前批C段、2025公开参考；2026尚未取得陕西可核验分数')for line in lines]
lines[0]='# 陕西招生数据覆盖清单（更新于2026-10-25）'
(ROOT/'docs/shaanxi-admissions-coverage-20261024.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('\n'.join(lines[:9]))

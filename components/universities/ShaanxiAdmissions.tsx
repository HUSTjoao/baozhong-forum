'use client'

import { useId, useState } from 'react'
import { ArrowUpRight, ChevronDown, MapPin } from 'lucide-react'
import { admissionScoreRank, type AdmissionRecord, type UniversityAdmissions } from '@/data/shaanxi-admissions'
import './shaanxi-admissions.css'

const number = (value: number | undefined) => value === undefined ? '未公布' : value.toLocaleString('zh-CN')

export default function ShaanxiAdmissions({ data }: { data: UniversityAdmissions }) {
  const initialYear = data.years.find(value => data.records[value]?.records.length) || data.years[0]
  const [year, setYear] = useState(initialYear)
  const [subject, setSubject] = useState<'arts' | 'science'>(data.records[initialYear]?.records.some(row => row.subject === 'science') ? 'science' : 'arts')
  const headingId = useId()
  const panelId = useId()
  const dataset = data.records[year]
  const yearNote = data.yearNotes?.[year]
  const submission = dataset?.kind === 'submission'
  const reference = dataset?.kind === 'reference'
  const oldExam = year === 2024
  const subjectName = subject === 'science' ? (oldExam ? '理工类' : '物理类') : (oldExam ? '文史类' : '历史类')
  const rows = (dataset?.records || []).filter(record => record.subject === subject)
  const main = rows.filter(record => !record.additional)
  const additional = rows.filter(record => record.additional)
  const lowestRecord = main.reduce<AdmissionRecord | undefined>((lowest, row) => !lowest || row.score < lowest.score ? row : lowest, undefined)
  const lowest = lowestRecord?.score
  const lowestRank = lowest === undefined ? undefined : admissionScoreRank(dataset, subject, lowest)
  const source = lowestRecord?.source || (subject === 'arts' ? dataset?.artsSource || dataset?.source : dataset?.source)
  const rankText = (record: AdmissionRecord) => {
    const band = admissionScoreRank(dataset, subject, record.score)
    return band ? `${number(band.start)}—${number(band.end)}` : '未收录'
  }
  const cohort = lowestRecord?.publishedRank ? (reference ? '资料公布' : '校方公布') : '同分区间'

  function table(records: AdmissionRecord[], extra = false) {
    return <div className="ua-table-wrap"><table className="ua-table">
      <caption className="ua-sr">{year} 年{data.name}陕西省{subjectName}{extra ? '其他招生类型' : ''}{submission ? '正式投档' : '录取'}数据</caption>
      <thead><tr><th scope="col">{submission ? '院校代号' : '招生分组 / 类型'}</th><th scope="col">{submission ? '投档批次' : '选科要求'}</th><th scope="col">{submission ? '投档最低分' : reference ? '参考分数' : '录取最低分'}</th><th scope="col">{submission ? '最低位次' : '录取最高分'}</th><th scope="col">{submission ? '计划 / 投档人数' : '最低分对应位次'}</th></tr></thead>
      <tbody>{records.map((record, index) => <tr key={`${record.code}-${index}`}>
        <th scope="row"><span className={`ua-group ua-group-${record.code.startsWith('medical') ? 'medical' : subject}`}>{submission ? record.code : record.label}</span>{submission && <small>{record.label}</small>}{record.derived && <small>按 {record.majorCount} 个已收录专业汇总</small>}</th>
        <td data-label={submission ? '投档批次' : '选科要求'}>{submission ? record.batch || dataset?.batch || '本科一批' : record.requirement || <span className="ua-muted">原表未列</span>}</td>
        <td data-label={submission ? '投档最低分' : reference ? '参考分数' : '录取最低分'} className="ua-score">{record.score}<small>分</small></td>
        <td data-label={submission ? '最低位次' : '录取最高分'}>{number(submission ? record.rank : record.highest)}{(submission ? record.rank : record.highest) !== undefined && <small>{submission ? '位' : '分'}</small>}</td>
        <td data-label={submission ? '计划 / 投档人数' : '最低分对应位次'}>{submission ? <>{number(record.planned)} / {number(record.submitted)}<small>人</small></> : <span className="ua-rank-range">{record.publishedRank ? number(record.publishedRank) : rankText(record)}<small>位</small><span className="ua-rank-kind">{record.publishedRank ? (reference ? '资料公布' : '校方公布') : '同分区间'}</span></span>}</td>
      </tr>)}</tbody>
    </table></div>
  }

  return <section id="shaanxi-admissions" className={`uni-admissions ua-${subject}`} aria-labelledby={headingId}>
    <header className="ua-heading"><div><p className="ua-eyebrow"><MapPin size={14} aria-hidden="true" />陕西考生参考<span>2024—2026</span></p><h2 id={headingId}>近三年招生分数</h2></div><span className="ua-school">{data.name}</span></header>
    <div className="ua-years" role="group" aria-label="招生年份">{data.years.map(value => {
      const entry = data.records[value]
      const filtered = (entry?.records || []).filter(record => record.subject === subject && !record.additional)
      return <button key={value} type="button" aria-pressed={year === value} aria-controls={panelId} onClick={() => setYear(value)}><span className="ua-year-top"><strong>{value}</strong><span>{entry ? entry.kind === 'submission' ? '正式投档' : entry.kind === 'reference' ? '公开参考' : '校方录取' : '尚未收录'}</span></span><span className="ua-year-bottom">{value === 2024 ? (subject === 'science' ? '理工最低' : '文史最低') : (subject === 'science' ? (entry?.kind === 'reference' ? '物理参考' : '物理最低') : (entry?.kind === 'reference' ? '历史参考' : '历史最低'))}<strong>{filtered.length ? Math.min(...filtered.map(record => record.score)) : '—'}{filtered.length > 0 && <small>分</small>}</strong></span></button>
    })}</div>
    <div className="ua-sheet" id={panelId}>
      <div className="ua-toolbar"><div className="ua-subjects" role="group" aria-label="招生科类"><button type="button" aria-pressed={subject === 'arts'} onClick={() => setSubject('arts')}>{oldExam ? '文史类' : '历史类'}</button><button type="button" aria-pressed={subject === 'science'} onClick={() => setSubject('science')}>{oldExam ? '理工类' : '物理类'}</button></div><span className={`ua-batch ${submission ? 'ua-batch-submission' : ''}`}>{year} · {dataset ? submission ? `${dataset.batch || '本科批次'} / 正式投档` : reference ? '公开资料参考' : '校方录取统计' : '尚未收录'}</span></div>

      {reference && <p className="ua-reference-label">公开资料参考 · 尚未取得校方同年完整表，未列出所有专业组或招生条件。</p>}
      {lowestRecord ? <><div className="ua-highlights"><div className="ua-highlight-main"><span>{submission ? '投档最低分' : reference ? '资料所列分数' : '已收录最低分'}</span><p><strong>{lowest}</strong><small>分</small></p></div><div className="ua-rank-highlight"><span>{submission ? '最低投档位次' : '最低分对应省位次'}{!submission && <em>{cohort}</em>}</span><p><strong>{submission ? number(lowestRecord.rank) : lowestRecord.publishedRank ? number(lowestRecord.publishedRank) : rankText(lowestRecord)}</strong><small>位</small></p></div></div>{table(main)}</> : <div className="ua-empty" role="status"><strong>{year} 年{subjectName}{reference ? "普通批分数尚未收录" : "普通类数据尚未收录"}</strong><p>{yearNote ? yearNote.text : additional.length > 0 ? "已收录该科类专项或其他类型，请展开下方查看；不计入普通类最低分。" : "暂时没有可核实的记录，不代表当年没有招生。可切换年份或查看官方招生信息。"}</p><a href={yearNote?.source || data.officialUrl} target="_blank" rel="noreferrer">{yearNote ? "查看招生说明" : "前往学校官网"}<ArrowUpRight size={13} /></a></div>}
      {additional.length > 0 && <details className="ua-additional" key={`${year}-${subject}`}><summary><span>{submission ? '其他院校代号' : '专项及其他招生类型'}<small>{additional.length} 条</small></span><ChevronDown size={16} aria-hidden="true" /></summary><p>{submission ? '其他院校代号单独展示，招生类型仍需核对，不计入上方最低分。' : '按原表保留招生类型，单独查看，不与上方普通类最低分合并。'}</p>{table(additional, true)}</details>}
      {dataset && <div className="ua-note"><span>{submission ? '投档口径' : reference ? '参考口径' : '录取口径'}</span><p>{submission ? '2024 年保留文史、理工分科及原始院校代号，投档线不等于专业录取线。' : reference ? `${dataset.note} 资料公布的位次沿用原数；同分区间来自陕西同年普通类一分一段表。` : `${dataset.note || '本年为校方公布的录取统计，不作投档线使用。'} 位次标注“校方公布”时沿用原表；“同分区间”由陕西普通类一分一段表换算，不是最后一名录取考生的精确位次。`}</p></div>}
    </div>
    <footer className="ua-footer"><p>分数与位次保留来源口径，缺失项不作推算。请结合年份、科类与招生类型查看。</p><div className="ua-sources">{source && <a href={source} target="_blank" rel="noreferrer">分数来源<ArrowUpRight size={13} aria-hidden="true" /></a>}{lowestRank && <a href={lowestRank.source} target="_blank" rel="noreferrer">位次来源 · 一分一段表<ArrowUpRight size={13} aria-hidden="true" /></a>}</div></footer>
  </section>
}

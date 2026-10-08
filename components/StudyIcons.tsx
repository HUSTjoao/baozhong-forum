import type { ReactNode } from 'react'

const subjectSymbols: Record<string, ReactNode> = {
  '语文': <><path d="M16 9c-3.5-2.5-7-3-11-2v17c4-1 7.5-.5 11 2 3.5-2.5 7-3 11-2V7c-4-1-7.5-.5-11 2Z" /><path d="M16 9v17M8.5 12l4 .8M8.5 16l4 .8M19.5 12.8l4-.8M19.5 16.8l4-.8" /></>,
  '数学': <><path d="M6 5v21h21M4 8h4M4 16h4M13 24v4M21 24v4" /><path d="M9 22c4-1 5-6 7-9s5-4 9-4M22 6l3 3-3 3" /></>,
  '英语': <><path d="m9 25 7-19 7 19M12 18h8M6.5 25h5M20.5 25h5" /><path d="M4 7v4m3-4v4M25 5v4m3-4v4" /></>,
  '物理': <><ellipse cx="16" cy="16" rx="13" ry="5" transform="rotate(-35 16 16)" /><ellipse cx="16" cy="16" rx="13" ry="5" transform="rotate(35 16 16)" /><circle cx="16" cy="16" r="2" /><path d="m25 7 1 1" /></>,
  '化学': <><path d="M12 5h8M13 5v8l-7 12c-.6 1.2.2 2 1.5 2h17c1.3 0 2.1-.8 1.5-2l-7-12V5M10 20h12" /><circle cx="14" cy="23" r=".8" /><circle cx="18.5" cy="17" r=".8" /></>,
  '生物': <><path d="M10 4c0 7 12 9 12 16v8M22 4c0 7-12 9-12 16v8M11 7h10M13 11h6M13 21h6M10 26h12" /></>,
  '政治': <><path d="M16 5v22M11 27h10M6 10h20M9 10l-4 9h8l-4-9ZM23 10l-4 9h8l-4-9ZM5 19c1 4 7 4 8 0M19 19c1 4 7 4 8 0" /><circle cx="16" cy="6" r="1.5" /></>,
  '历史': <><path d="M9 6h15v19H10M9 6a3 3 0 1 0 0 6h2V6M10 25a3 3 0 1 0 0-6h14M14 11h6M14 15h6" /><path d="M7 12v11" /></>,
  '地理': <><circle cx="16" cy="16" r="11" /><ellipse cx="16" cy="16" rx="4.5" ry="11" /><path d="M5 16h22M7.5 9.5h17M7.5 22.5h17" /></>,
}

export function SubjectIcon({ subject }: { subject: string }) {
  return <svg className="study-subject-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">{subjectSymbols[subject] ?? subjectSymbols['语文']}</svg>
}

export function YearArrowIcon({ previous = false }: { previous?: boolean }) {
  return <svg className="year-arrow-icon" data-direction={previous ? 'previous' : 'next'} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false"><path d={previous ? 'M26 16H6M13 9l-7 7 7 7' : 'M6 16h20M19 9l7 7-7 7'} /></svg>
}

export function RefreshStudyIcon() {
  return <svg className="study-refresh-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M19 10a7 7 0 1 0-1.5 7M19 5v5h-5" /></svg>
}

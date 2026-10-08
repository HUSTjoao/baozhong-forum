export default function CountdownCampus() {
  return (
    <div className="future-campus-setting" aria-hidden="true">
      <svg className="future-campus-edge future-campus-left" viewBox="0 0 300 420" fill="none">
        <path pathLength="1" d="M18 385H286M38 385V104L154 55L270 104V385M28 104L154 46L280 104M38 116H270M38 351H270M52 385V368H254V385" />
        <path pathLength="1" d="M119 368V292A35 35 0 0 1 189 292V368M154 292V368M109 247H199M50 158H258M50 226H258" />
        {[68, 132, 196].map(x => <g key={x}>{[132, 194].map(y => <g key={y}><rect pathLength="1" x={x} y={y} width="32" height="43" rx="1" /><path pathLength="1" d={`M${x + 16} ${y}V${y + 43}M${x} ${y + 20}H${x + 32}`} /></g>)}</g>)}
        <circle pathLength="1" cx="154" cy="86" r="13" />
        <path pathLength="1" d="M154 78V86L160 90M14 380V246M14 246H36M276 380V246M276 246H298" />
      </svg>
      <svg className="future-campus-edge future-campus-right" viewBox="0 0 330 420" fill="none">
        <path pathLength="1" d="M36 92V316M27 92H73V120H27ZM50 120V145M41 145H59M51 145V156M22 322H92" />
        <path pathLength="1" d="M80 219H233C312 219 312 353 233 353H80C1 353 1 219 80 219ZM84 231H229C294 231 294 341 229 341H84C19 341 19 231 84 231ZM88 243H225C276 243 276 329 225 329H88C37 329 37 243 88 243Z" />
        <path pathLength="1" d="M99 256H215V316H99ZM157 256V316M99 273H115V299H99M215 273H199V299H215" />
        <circle pathLength="1" cx="157" cy="286" r="13" />
        <path pathLength="1" d="M267 189V90M255 90H279M252 89Q250 70 267 69Q284 70 282 89ZM249 195H285M74 373H289M105 387H263" />
      </svg>
    </div>
  )
}

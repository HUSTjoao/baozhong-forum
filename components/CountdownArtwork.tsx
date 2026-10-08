export default function CountdownArtwork({ index }: { index: number }) {
  return (
    <svg className="future-calendar-dawn" data-artwork={index} viewBox="0 0 320 100" fill="none" aria-hidden="true">
      {index === 0 && <>
        <g className="calendar-dawn-orbit"><path d="M115 64A45 45 0 0 1 205 64M99 64A61 61 0 0 1 221 64" /></g>
        <g className="calendar-dawn-rise"><path d="M134 64A26 26 0 0 1 186 64" /><path className="calendar-dawn-disc" d="M134 64A26 26 0 0 1 186 64Z" /></g>
        <path className="calendar-dawn-horizon" d="M44 64H276M92 75H228M124 84H196" />
      </>}
      {index === 1 && <>
        <path className="calendar-dawn-orbit" d="M69 70Q160 1 251 70" />
        <g className="calendar-compass-needle"><circle cx="160" cy="49" r="32" /><path className="calendar-dawn-disc" d="M160 25L170 49L160 73L150 49Z" /><path d="M160 25V73M150 49H170" /></g>
        <path className="calendar-dawn-horizon" d="M160 10V15M160 83V88M121 49H126M194 49H199M57 87H119M201 87H263" />
      </>}
      {index === 2 && <>
        <path className="calendar-dawn-orbit" d="M99 56Q152 6 235 30" />
        <g className="calendar-flight"><path className="calendar-dawn-disc" d="M108 38L230 17L164 77L150 50Z" /><path d="M108 38L230 17L164 77L150 50ZM150 50L230 17M150 50L147 69L164 77" /></g>
        <path className="calendar-dawn-horizon" d="M88 56L107 52M67 67L118 56M85 80L127 64M174 91H257" />
      </>}
    </svg>
  )
}

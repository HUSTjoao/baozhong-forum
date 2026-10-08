'use client'

import { useEffect, useRef } from 'react'

export default function AdmissionSketch({ index, drawn }: { index: number; drawn: boolean }) {
  const sketchRef = useRef<SVGSVGElement>(null)
  useEffect(() => {
    let order = 0
    sketchRef.current?.querySelectorAll<SVGElement>('path, rect, circle').forEach(shape => {
      if (shape.closest('[stroke="none"]')) return
      shape.setAttribute('pathLength', '1')
      shape.classList.add('directory-sketch-stroke')
      shape.style.setProperty('--sketch-delay', `${order++ * .055}s`)
    })
  }, [])
  return (
    <svg ref={sketchRef} className="admission-directory-art" data-drawn={drawn} viewBox="0 0 180 125" fill="none" aria-hidden="true">
      <ellipse className="directory-sketch-shadow" cx="90" cy="113" rx="62" ry="4" />
      {index === 0 && <>
        <path className="directory-sketch-wash" d="M34 54H146V108H34Z" />
        <path d="M30 108H150M34 108V54H146V108M29 54L90 24L151 54Z" />
        <path className="directory-sketch-paper" d="M68 108V61H112V108" />
        <path d="M80 108V85A10 10 0 0 1 100 85V108M90 85V108M67 61H113M65 108H115" />
        {[45, 122].map(x => <g key={x}><rect x={x} y="66" width="13" height="15" rx="1" /><rect x={x} y="88" width="13" height="15" rx="1" /></g>)}
        <circle className="directory-sketch-paper" cx="90" cy="44" r="7" />
        <path d="M90 40V44L93 46M38 59H142" />
      </>}
      {index === 1 && <>
        <path className="directory-sketch-wash" d="M25 47L20 105Q55 100 90 113Q125 100 160 105L155 47" />
        <path className="directory-sketch-paper" d="M30 40Q61 33 90 52Q119 33 150 40V99Q118 93 90 110Q62 93 30 99Z" />
        <path d="M90 52V110M41 54Q60 52 78 61M41 66Q60 64 78 73M41 79Q60 77 78 86M102 61Q120 52 139 54M102 73Q120 64 139 66M102 86Q120 77 139 79" />
        <g className="directory-sketch-accent">
          <circle className="directory-sketch-paper" cx="126" cy="27" r="17" />
          <path className="directory-sketch-wash" d="M126 14L132 28L126 40L120 26Z" />
          <path d="M126 14V40M126 27L132 28M120 26L126 27" />
        </g>
      </>}
      {index === 2 && <>
        <path className="directory-sketch-wash" d="M76 55H147Q155 55 155 63V91Q155 99 147 99H137L139 112L122 99H76Q68 99 68 91V63Q68 55 76 55Z" />
        <path className="directory-sketch-paper" d="M31 22H114Q122 22 122 30V68Q122 76 114 76H58L39 91L41 76H31Q23 76 23 68V30Q23 22 31 22Z" />
        <path d="M62 42A9 9 0 0 1 80 42C80 48 71 49 71 56" />
        <circle cx="71" cy="64" r="1.5" fill="currentColor" stroke="none" />
        <g className="directory-sketch-accent" fill="currentColor" stroke="none"><circle cx="95" cy="88" r="2" /><circle cx="111" cy="88" r="2" /><circle cx="127" cy="88" r="2" /></g>
      </>}
      {index === 3 && <>
        <path className="directory-sketch-wash" d="M29 60L89 30L149 60V109H29Z" />
        <path className="directory-sketch-paper" d="M49 67V23H128V67" />
        <path d="M61 37H108M61 47H116M61 57H97" />
        <path className="directory-sketch-paper" d="M29 60L89 91L149 60V109H29Z" />
        <path d="M29 109L68 80M149 109L110 80" />
        <g className="directory-sketch-accent directory-sketch-pen">
          <rect className="directory-sketch-paper" x="143" y="20" width="8" height="33" rx="2" />
          <path className="directory-sketch-wash" d="M143 53L147 63L151 53Z" />
          <path d="M143 27H151M147 57V63" />
        </g>
      </>}
    </svg>
  )
}

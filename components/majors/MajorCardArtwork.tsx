type Field = 'arts' | 'science' | 'engineering' | 'medicine' | 'other'

// Both strands and every base pair share the same helix geometry.
const helixX = (y: number, side: number) => 126 + side * 12 * Math.cos((y - 29) * Math.PI / 25)
const helixPath = (side: number) => Array.from({ length: 101 }, (_, i) => {
  const y = 29 + i
  return `${i ? 'L' : 'M'}${helixX(y, side).toFixed(2)} ${y}`
}).join(' ')

function MedicalArtwork() {
  return <>
    <g className="medical-registration"><path d="M24 29v-8h8M134 21h8v8M24 132v8h8M134 140h8v-8" /><path d="M106 25v108" strokeDasharray="1 5" /><ellipse cx="63" cy="133" rx="42" ry="5" /></g>
    <g className="medical-microscope topic-core">
      {/* Sculpted arm and stepped base, behind the optical assembly. */}
      <path className="medical-cast-shadow" d="M84 61c23 11 28 31 20 48-5 10-14 17-29 21H44v-7l28-4c16-3 24-12 23-25-1-10-6-16-16-21Z" />
      <path className="medical-cast" d="M80 57c23 11 28 31 20 48-5 10-14 17-29 21H40v-7l28-4c16-3 24-12 23-25-1-10-6-16-16-21Z" />
      <path className="medical-machined-edge" d="M84 64c15 10 20 25 14 39-4 9-12 15-25 19" />
      <path className="medical-cast" d="M35 120h47c9 0 13 5 13 12H25c0-7 3-12 10-12Z" />
      <path className="medical-base-inset" d="M32 125h48c4 0 7 2 8 4H29l3-4Z" />
      <path className="medical-edge" d="M27 132h65M34 135h9M77 135h9" />
      {/* Paired eyepieces feed a tilted binocular head. */}
      <g className="medical-optics">
        <path className="medical-cast" d="m42 28 10-6 13 21-10 6-13-21Zm16-4 10-6 14 22-10 6-14-22Z" />
        <path className="medical-dark" d="m40 26 11-7 4 6-11 7-4-6Zm16-4 11-7 4 6-11 7-4-6Z" />
        <path className="medical-lens" d="m44 24 6-4M60 20l6-4" />
        <path className="medical-cast" d="m54 45 21-13 17 26-22 14-16-27Z" />
        <path className="medical-optical-inset" d="m63 44 10-6 12 19-10 6-12-19Z" />
        <path className="medical-machined-edge" d="m57 47 12 20M79 39l8 13" />
        <path className="medical-dark" d="m67 67 23-14 5 7-23 14-5-7Z" />
        <path className="medical-cast" d="m70 73 6-4 5 9-6 4-5-9Zm11-7 6-4 8 13-6 4-8-13Z" />
        <path className="medical-dark" d="m75 82 6-4 2 3-6 4-2-3Zm14-3 6-4 2 3-6 4-2-3Z" />
        <path className="medical-focus-cone" d="m78 86-8 5h17l-5-7" />
      </g>
      {/* Stage, glass slide, retaining clips and substage illumination. */}
      <path className="medical-stage" d="M31 91h59v5H31z" />
      <path className="medical-slide" d="M51 87h29v4H51z" />
      <path className="medical-stage-clips" d="M39 89h7v3M82 89h5v3" />
      <ellipse className="medical-specimen" cx="72" cy="89" rx="3.5" ry="1" />
      <path className="medical-cast" d="M66 97h15v4H66zM71 101h6v10h-6z" />
      <ellipse className="medical-dark" cx="74" cy="113" rx="9" ry="3" />
      <ellipse className="medical-lamp" cx="74" cy="112" rx="5" ry="1.5" />
      <g className="medical-focus-wheel">
        <circle className="medical-wheel-body" cx="95" cy="88" r="10" />
        {Array.from({ length: 16 }, (_, i) => <path key={i} className="medical-knurl" d="M95 79v2" transform={`rotate(${i * 22.5} 95 88)`} />)}
        <circle className="medical-wheel-inset" cx="95" cy="88" r="5" />
        <path className="medical-wheel-mark" d="M95 84v2M93 89h4" />
        <circle className="medical-wheel-pin" cx="95" cy="88" r="1.3" />
      </g>
    </g>
    <g className="medical-helix">
      <path className="medical-helix-axis" d="M126 21v116" strokeDasharray="1 5" />
      {Array.from({ length: 19 }, (_, i) => {
        const y = 33 + i * 5
        const left = helixX(y, -1), right = helixX(y, 1)
        return <g className="medical-base-pair" key={y} style={{ '--pair-delay': `${i * 55}ms` } as React.CSSProperties}>
          <path className="medical-base-a" d={`M${left} ${y}H126`} />
          <path className="medical-base-b" d={`M126 ${y}H${right}`} />
          <circle className="medical-backbone-node" cx={left} cy={y} r="1.25" /><circle className="medical-backbone-node" cx={right} cy={y} r="1.25" />
        </g>
      })}
      <path className="medical-strand-back" d={helixPath(-1)} />
      <path className="medical-strand-front" d={helixPath(1)} />
      <path className="medical-helix-label" d="M116 19h20M116 139h20M126 16v6M126 136v6" />
    </g>
  </>
}

export default function MajorCardArtwork({ field }: { field: Field }) {
  return <svg className={'major-topic-art major-topic-' + field} viewBox="0 0 160 160" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <circle className="topic-guide" cx="83" cy="78" r="61" strokeDasharray="2 8" />
    <circle className="topic-guide" cx="83" cy="78" r="46" />
    {field === 'engineering' && <>
      <g className="topic-traces"><path d="M60 54V32H35V18M76 54V23M94 54V33h29V18M110 70h26v-22M110 88h34M94 104v29h25M76 104v39M60 104v17H29M44 88H18M44 70H27V47" />{[[35,18],[76,23],[123,18],[136,48],[144,88],[119,133],[76,143],[29,121],[18,88],[27,47]].map(([x,y]) => <circle key={x + '-' + y} cx={x} cy={y} r="2.5" />)}</g>
      <path className="topic-signal" d="M18 88h26m50 16v29h25M76 23v31M110 70h26V48" />
      <g className="topic-core"><rect className="topic-shadow" x="49" y="59" width="66" height="50" rx="9" /><rect className="topic-face" x="44" y="54" width="66" height="50" rx="9" /><rect x="56" y="65" width="42" height="28" rx="4" /><path d="m65 77 6-5 6 5-6 5-6-5Zm17 0h8M82 83h5" />{[61,72,83,94].map(x => <path key={x} d={`M${x} 49v5m0 50v5`} />)}</g>
    </>}
    {field === 'science' && <>
      <g className="topic-traces"><path d="M22 40h15m-7-7v14M125 26h12m-6-6v12M103 130h17M111 126v8" /><circle cx="42" cy="24" r="2" /><circle cx="140" cy="88" r="2" /><path d="m22 87 9-5 9 5v10l-9 5-9-5V87Zm18 0 10-6" /></g>
      <g className="topic-core"><circle className="topic-shadow" cx="83" cy="66" r="31" /><circle className="topic-face" cx="79" cy="61" r="31" /><path className="topic-detail" d="M60 44c9-8 20-9 28-6M58 52c10-5 26-6 39-2M57 62c12-5 29-5 42-1M63 74c9-3 20-2 29 1" /><path className="topic-highlight" d="M57 43a29 29 0 0 1 16-10" /></g>
      <g className="topic-science-ring"><ellipse cx="79" cy="61" rx="52" ry="13" transform="rotate(-28 79 61)" /><path className="topic-signal" d="M34 83c18 2 69-21 90-43" /><circle className="topic-dot" cx="124" cy="38" r="3.5" /></g>

    </>}
    {field === 'arts' && <>
      <g className="topic-core"><path className="topic-shadow" d="M36 62c17-5 33-4 47 5 14-9 30-10 47-5v57c-18-5-32-2-47 6-15-8-29-11-47-6V62Z" /><path className="topic-face" d="M30 54c17-5 33-4 47 5 14-9 30-10 47-5v57c-18-5-32-2-47 6-15-8-29-11-47-6V54Z" /><path d="M77 59v58M40 68c10-2 19 0 28 4M40 78c10-2 19 0 28 4M40 88c10-2 19 0 28 4M87 72c9-4 18-6 27-4M87 82c9-4 18-6 27-4M87 92c9-4 18-6 27-4" /></g>
      <path className="topic-signal" d="M40 100c10-2 19 0 28 4M87 103c9-4 18-6 27-4" /><path className="topic-traces" d="m105 39 17-22 5 4-17 22-7 4 2-8ZM51 28v12m-6-6h12M24 92h-9m5-5v10" />
    </>}
    {field === 'medicine' && <MedicalArtwork />}
    {field === 'other' && <>
      <g className="topic-core">
        <circle className="topic-shadow" cx="86" cy="85" r="47" />
        <circle className="topic-face" cx="81" cy="79" r="47" />
        <circle className="topic-detail" cx="81" cy="79" r="40" />
        <circle className="topic-detail" cx="81" cy="79" r="29" strokeDasharray="1 5" />
        {Array.from({length: 24},(_,i)=><path key={i} className="topic-compass-tick" d={i%6===0 ? 'M81 40v8' : 'M81 40v4'} transform={`rotate(${i*15} 81 79)`} />)}
        <path className="topic-detail" d="M81 62v34M64 79h34" />
        <g className="topic-compass-needle">
          <path className="topic-needle-front" d="m103 57-13 31-31 13 13-31 31-13Z" />
          <path className="topic-needle-back" d="m103 57-22 22-22 22 13-31 31-13Z" />
          <path d="m103 57-22 22-22 22" />
          <circle className="topic-face" cx="81" cy="79" r="5" /><circle className="topic-dot" cx="81" cy="79" r="1.5" />
        </g>
        <path className="topic-highlight" d="M42 64a42 42 0 0 1 28-25" />
      </g>
      <g className="topic-traces"><path d="M81 20v8M132 79h8M81 132v8M22 79h8M42 31l6 6M120 120l6 6" /><circle cx="126" cy="34" r="4" /><circle cx="34" cy="125" r="3" /><path d="M120 34h12M126 28v12" /></g>
      <path className="topic-signal" d="M35 79a46 46 0 0 1 46-46M127 79a46 46 0 0 1-46 46" />
    </>}
  </svg>
}

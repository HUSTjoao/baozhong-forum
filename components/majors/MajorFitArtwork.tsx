export default function MajorFitArtwork({ index }: { index: number }) {
  return <svg viewBox="0 0 88 88" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="44" cy="44" r="37" strokeOpacity=".14" />
    <path d="M44 4v5m0 70v5M4 44h5m70 0h5" strokeOpacity=".4" />
    {index === 0 ? <>
      <circle cx="39" cy="39" r="22" fill="currentColor" fillOpacity=".04" />
      <circle cx="39" cy="39" r="16" strokeOpacity=".3" />
      <path d="M55 55l14 14a4 4 0 0 0 6-6L61 49M23 39s6-9 16-9 16 9 16 9-6 9-16 9-16-9-16-9Z" />
      <circle cx="39" cy="39" r="5" fill="currentColor" fillOpacity=".2" />
      <path d="M65 17v10m-5-5h10M23 17l-4-4M17 25l-5-1" strokeOpacity=".7" />
      <circle cx="39" cy="39" r="1.5" fill="currentColor" stroke="none" />
    </> : index === 1 ? <>
      <path d="M44 28c-8-6-18-8-29-6v39c11-2 21 0 29 6 8-6 18-8 29-6V22c-11-2-21 0-29 6Z" fill="currentColor" fillOpacity=".05" />
      <path d="M44 28v39M11 29v37c12-2 23 0 33 6 10-6 21-8 33-6V29" strokeOpacity=".45" />
      <path d="M23 33c5 0 9 1 14 3m-14 6c5 0 9 1 14 3m-14 6c5 0 9 1 14 3M51 36c5-2 9-3 14-3m-14 12c5-2 9-3 14-3m-14 12c5-2 9-3 14-3" strokeOpacity=".7" />
      <path d="M37 16l7-5 7 5M44 11v9" />
    </> : <>
      <circle cx="44" cy="44" r="26" strokeOpacity=".5" />
      <circle cx="44" cy="44" r="18" strokeDasharray="2 5" strokeOpacity=".4" />
      <path d="m57 29-8 22-19 9 8-22 19-9Z" fill="currentColor" fillOpacity=".12" />
      <path d="m57 29-13 15-14 16M38 38l11 13" />
      <circle cx="44" cy="44" r="3" fill="currentColor" />
      <path d="M44 12v6m0 52v6M12 44h6m52 0h6M68 22l5-5m-5 0h5v5" />
      <circle cx="23" cy="67" r="2" fill="currentColor" stroke="none" />
    </>}
  </svg>
}

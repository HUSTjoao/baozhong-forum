export const campusThemes = {
  cyan: { ink: '#477ca8', wash: '#b9d3e9', card: '#edf5fc' },
  violet: { ink: '#7b6ba0', wash: '#d6cce8', card: '#f4f0fa' },
  sage: { ink: '#567f78', wash: '#c7ded6', card: '#eef7f2' },
  sand: { ink: '#947b56', wash: '#e5d7be', card: '#fbf6ec' },
  rose: { ink: '#986f7b', wash: '#e7cfd6', card: '#fcf1f4' },
  slate: { ink: '#657c8e', wash: '#cad7e1', card: '#eff4f8' },
} as const
export function campusTheme(id: string, preferred?: string) {
  const names = Object.keys(campusThemes) as (keyof typeof campusThemes)[]
  const hash = Array.from(id).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0)
  const key = preferred && preferred in campusThemes ? preferred as keyof typeof campusThemes : names[hash % names.length]
  return { key, ...campusThemes[key] }
}

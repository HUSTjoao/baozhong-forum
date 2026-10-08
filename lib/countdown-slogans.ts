export const countdownSlogans = [
  { lead: '你向往的远方，', end: '始于今天的坚持。' },
  { lead: '今天多懂一点，', end: '明天多一种可能。' },
  { lead: '把向往的大学，', end: '写进努力的每一天。' },
  { lead: '让每一次认真，', end: '都成为出发的底气。' },
  { lead: '未来不是等来的，', end: '是一天天走出来的。' },
  { lead: '再向前一步，', end: '去遇见更大的世界。' },
  { lead: '你的下一站，', end: '值得今天全力以赴。' },
  { lead: '现在的每一份努力，', end: '都在拓宽未来的路。' },
  { lead: '以今天的踏实，', end: '回应明天的期待。' },
  { lead: '把热爱变成方向，', end: '把认真变成力量。' },
] as const

export function pickCountdownSlogan(previous: number) {
  const next = Math.floor(Math.random() * (countdownSlogans.length - 1))
  return next >= previous ? next + 1 : next
}

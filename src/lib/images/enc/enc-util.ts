

export function makeMap(seed: string, length: number): number[] {
  if (length % 2 !== 0) return []
  const map = []
  for (let i = 0; i < length; i++)
    map.push(i)
  const out = []
  let iteration = 0
  while (map.length) {
    const a = map.splice(Math.floor(rand(seed, map.length, iteration += 0.251)), 1)[0]
    const b = map.splice(Math.floor(rand(seed, map.length, iteration += 0.251)), 1)[0]
    out[a] = b
    out[b] = a
  }
  return out
}

export function rand(seed: string, max: number, intOffset = 0) {
  const seedint = seed.split('').map((s, i) => s.charCodeAt(0) * i * i / 3).reduce((a, b) => a + b, 0)
  return ~~((Math.sin(seedint + intOffset) / 2 + 0.5) * max)
}

export function grabbit(input: number, map: number[]) {
  let out = 0
  for (const i of map) {
    out = out | (input & 1) << i
    input = input >> 1
  }
  return out
}



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

export function cyrb128(str: string): [ number, number, number, number ] {
  let h1 = 1779033703; let h2 = 3144134277
  let h3 = 1013904242; let h4 = 2773480762
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  return [ (h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0 ]
}

export function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0
    let t = (a + b) | 0
    a = b ^ b >>> 9
    b = c + (c << 3) | 0
    c = (c << 21 | c >>> 11)
    d = d + 1 | 0
    t = t + d | 0
    c = c + t | 0
    return (t >>> 0) / 4294967296
  }
}

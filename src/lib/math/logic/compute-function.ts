
export function compute2dFunction(compute: (x: number) => number, xAlign = 0, zoom = 1): {
  points: [number, number][],
  lower: number,
  higher: number
} {
  let detail = 0.1
  let lower = -10
  let higher = 10

  if (xAlign < 0) {
    lower = 0
    higher = 20
  }
  if (xAlign > 0) {
    lower = -20
    higher = 0
  }

  detail *= zoom
  lower *= zoom
  higher *= zoom

  const pointCount = ~~((higher - lower) / detail)
  const xAxis = range(lower, higher, pointCount)

  const points = xAxis.map(x => ([ x, compute(x) ] as [ number, number ]))

  return { points, lower, higher }
}

export function range(from: number, to: number, stepCount: number): number[] {
  const delta = to - from
  const out = new Array(stepCount)
  for (let i = 0; i < stepCount; i++)
    out[i] = from + (delta) / stepCount * i
  return out
}

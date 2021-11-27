import { Canvas } from 'skia-canvas'


export async function render3dIsoGraph(width: number, height: number, color: number, vertical: number, fromX: number, toX: number, fromY: number, toY: number, func: (x: number, y: number) => number): Promise<Buffer> {
  const canv = new Canvas(width, height)
  const ctx = canv.getContext('2d')

  // const NUM_LABELS = 7

  ctx.strokeStyle = '#' + color.toString(16).padStart(6, '0') + 'bb'
  ctx.lineWidth = 1
  ctx.font = '10px Arial'

  const padding = 0
  const xDelta = Math.abs(toX - fromX)
  const yDelta = Math.abs(toY - fromY)

  let val = 0
  let max = -99999
  let min = 99999
  for (let x = padding; x < width; x++) {
    for (let y = 0; y < height - padding; y++) {
      val = func(
        fromX + (x - padding) / (width - padding) * xDelta,
        fromY + y / (height - padding) * yDelta
      )

      if (val > max) max = val
      if (val < min) min = val
    }
  }
  const delta = (max - min) || 1

  const maxheight = 20 * vertical
  const xrot = 45
  const yrot = 45
  const sinx = Math.sin(xrot)
  const cosx = Math.cos(xrot)
  const siny = Math.sin(yrot)
  const cosy = Math.cos(yrot)
  const centerX = width / 2
  const centerY = height / 2

  let px: number, py: number

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height - 0; y++) {
      val = func(
        fromX + x / width * xDelta,
        fromY + y / height * yDelta
      )
      if (isNaN(val) || val <= -Infinity || val >= Infinity) continue
      val = (val - min) / delta

      ctx.fillStyle = `hsl(${val * 300}deg, 50%, 50%)`

      ;[ px, py ] = xyzToXy(x - centerX, y - centerY, val * maxheight, sinx, cosx, siny, cosy)
      ctx.fillRect(px + centerX, py + centerY, 1, 1)
    }
  }

  // ctx.fillStyle = '#' + color.toString(16).padStart(6, '0') + '88'

  // ctx.strokeRect(padding, 0, width - padding, height - padding)
  // ctx.strokeRect(padding, 1, width - padding - 1, height - padding - 1)

  // let labelDistance = findFittingLabelDistance(fromX, toX, NUM_LABELS)
  // if (labelDistance) {
  //   const pixelsPerUnit = width / (toX - fromX)

  //   let cursor = (width - padding) - toX * (width - padding) / xDelta + padding
  //   let label = 0
  //   while (cursor <= width) {
  //     ctx.fillText(label + '', cursor - ctx.measureText(label + '').width / 2, height - padding + 14)
  //     ctx.beginPath()
  //     ctx.moveTo(cursor, height - padding)
  //     ctx.lineTo(cursor, height - padding + 4)
  //     ctx.stroke()
  //     cursor += pixelsPerUnit * labelDistance
  //     label += labelDistance
  //   }

  //   cursor = (width - padding) - toX * (width - padding) / xDelta + padding - pixelsPerUnit * labelDistance
  //   label = -labelDistance
  //   while (cursor >= padding) {
  //     ctx.fillText(label + '', cursor - ctx.measureText(label + '').width / 2, height - padding + 14)
  //     ctx.beginPath()
  //     ctx.moveTo(cursor, height - padding)
  //     ctx.lineTo(cursor, height - padding + 4)
  //     ctx.stroke()
  //     cursor -= pixelsPerUnit * labelDistance
  //     label -= labelDistance
  //   }
  // }

  // labelDistance = findFittingLabelDistance(fromY, toY, NUM_LABELS / width * height)
  // if (labelDistance) {
  //   const pixelsPerUnit = height / (toY - fromY)

  //   let cursor = (height - padding) - toY * (height - padding) / yDelta
  //   let label = 0
  //   while (cursor <= height - padding) {
  //     ctx.fillText(label + '', padding - ctx.measureText(label + '').width - 7, cursor + 3)
  //     ctx.beginPath()
  //     ctx.moveTo(padding, cursor)
  //     ctx.lineTo(padding - 4, cursor)
  //     ctx.stroke()
  //     cursor += pixelsPerUnit * labelDistance
  //     label += labelDistance
  //   }

  //   cursor = (height - padding) - toY * (height - padding) / yDelta - pixelsPerUnit * labelDistance
  //   label = -labelDistance
  //   while (cursor >= 0) {
  //     ctx.fillText(label + '', padding - ctx.measureText(label + '').width - 7, cursor + 3)
  //     ctx.beginPath()
  //     ctx.moveTo(padding, cursor)
  //     ctx.lineTo(padding - 4, cursor)
  //     ctx.stroke()
  //     cursor -= pixelsPerUnit * labelDistance
  //     label -= labelDistance
  //   }
  // }

  return Buffer.from(await canv.toBuffer('png'))
}

export function findFittingLabelDistance(from: number, to: number, maxSteps: number): number {
  const possibleDistances = [ 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 3, 4, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000 ]
  const delta = Math.abs(to - from)
  for (const dist of possibleDistances) {
    if (delta / dist <= maxSteps)
      return dist
  }
  return 0
}

function xyzToXy(x: number, y: number, z: number, sinx: number, cosx: number, siny: number, cosy: number) {
  return [
    cosx * x - sinx * y,
    cosy * (cosx * y + sinx * x) + siny * z
  ]
}

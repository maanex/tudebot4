import { Canvas } from 'skia-canvas'
import { draw2dAxis } from './2d-axis'


export async function renderSimple2dGraph(width: number, height: number, color: number, fromX: number, toX: number, fromY: number, toY: number, points: [number, number][]): Promise<Buffer> {
  const canv = new Canvas(width, height)
  const ctx = canv.getContext('2d')

  const PADDING = height / 10
  const INNER_WIDTH = width - 2 * PADDING
  const X_RANGE = toX - fromX
  const SCALE = INNER_WIDTH / X_RANGE
  const BASE_LINE = toY < 0
    ? height - PADDING
    : fromY > 0
      ? PADDING
      : PADDING - fromY * (height - PADDING * 2) / (toY - fromY)

  const val = (num: number, posx: number) => posx === 0
    ? PADDING + (points[num][0] - fromX) * SCALE
    : BASE_LINE - points[num][1] * SCALE

  draw2dAxis(ctx, width, height, PADDING, color, fromX, toX, fromY, toY)

  ctx.beginPath()
  ctx.strokeStyle = '#' + color.toString(16).padStart(6, '0')
  ctx.lineWidth = 2
  let moveFirst = true
  for (let i = 0; i < points.length; i++) {
    if (isNaN(points[i][1]) || points[i][1] >= Infinity || points[i][1] <= -Infinity) {
      moveFirst = true
    } else {
      if (moveFirst) {
        moveFirst = false
        ctx.moveTo(val(i, 0), val(i, 1))
      }
      ctx.lineTo(val(i, 0), val(i, 1))
    }
  }
  ctx.stroke()

  return Buffer.from(await canv.toBuffer('png'))
}

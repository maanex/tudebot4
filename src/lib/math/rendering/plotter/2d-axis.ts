
export function draw2dAxis(ctx: CanvasRenderingContext2D, width: number, height: number, padding: number, color: number, fromX: number, toX: number, fromY: number, toY: number) {
  const Y_AXIS_POS = toX < 0
    ? width - padding
    : fromX > 0
      ? padding
      : padding - fromX * (width - padding * 2) / (toX - fromX)
  const X_AXIS_POS = toY < 0
    ? height - padding
    : fromY > 0
      ? padding
      : padding - fromY * (height - padding * 2) / (toY - fromY)
  const NUM_LABELS = 10

  ctx.strokeStyle = '#' + color.toString(16).padStart(6, '0') + 'bb'
  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0') + '88'
  ctx.lineWidth = 1
  ctx.font = '10px Arial'

  ctx.beginPath()
  ctx.moveTo(Y_AXIS_POS, padding)
  ctx.lineTo(Y_AXIS_POS, height - padding)
  ctx.moveTo(padding, X_AXIS_POS)
  ctx.lineTo(width - padding, X_AXIS_POS)
  ctx.stroke()

  drawArrow(ctx, Y_AXIS_POS, padding, 4, 0)
  drawArrow(ctx, width - padding, X_AXIS_POS, 4, 90)

  let labelDistance = findFittingLabelDistance(fromX, toX, NUM_LABELS)
  if (labelDistance) {
    const pixelsPerUnit = width / (toX - fromX)

    let cursor = Y_AXIS_POS + pixelsPerUnit * labelDistance
    let label = labelDistance
    while (cursor < width - padding) {
      ctx.fillText(label + '', cursor - ctx.measureText(label + '').width / 2, X_AXIS_POS + 13)
      ctx.beginPath()
      ctx.moveTo(cursor, X_AXIS_POS + 2)
      ctx.lineTo(cursor, X_AXIS_POS - 2)
      ctx.stroke()
      cursor += pixelsPerUnit * labelDistance
      label += labelDistance
    }

    cursor = Y_AXIS_POS - pixelsPerUnit * labelDistance
    label = -labelDistance
    while (cursor > padding) {
      ctx.fillText(label + '', cursor - ctx.measureText(label + '').width / 2, X_AXIS_POS + 13)
      ctx.beginPath()
      ctx.moveTo(cursor, X_AXIS_POS + 2)
      ctx.lineTo(cursor, X_AXIS_POS - 2)
      ctx.stroke()
      cursor -= pixelsPerUnit * labelDistance
      label -= labelDistance
    }
  }

  labelDistance = findFittingLabelDistance(fromY, toY, NUM_LABELS / width * height)
  if (labelDistance) {
    const pixelsPerUnit = height / (toY - fromY)

    let cursor = X_AXIS_POS + pixelsPerUnit * labelDistance
    let label = labelDistance
    while (cursor < height - padding) {
      ctx.fillText(label + '', Y_AXIS_POS - ctx.measureText(label + '').width - 4, cursor + 4)
      ctx.beginPath()
      ctx.moveTo(Y_AXIS_POS - 2, cursor)
      ctx.lineTo(Y_AXIS_POS + 2, cursor)
      ctx.stroke()
      cursor += pixelsPerUnit * labelDistance
      label += labelDistance
    }

    cursor = X_AXIS_POS - pixelsPerUnit * labelDistance
    label = -labelDistance
    while (cursor > padding) {
      ctx.fillText(label + '', Y_AXIS_POS - ctx.measureText(label + '').width - 4, cursor + 4)
      ctx.beginPath()
      ctx.moveTo(Y_AXIS_POS - 2, cursor)
      ctx.lineTo(Y_AXIS_POS + 2, cursor)
      ctx.stroke()
      cursor -= pixelsPerUnit * labelDistance
      label -= labelDistance
    }
  }
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

export function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number) {
  ctx.beginPath()
  let point
  point = getPoint([ -1 * size, 0 ], rot)
  ctx.moveTo(point[0] + x, point[1] + y)
  point = getPoint([ 0, -1.6 * size ], rot)
  ctx.lineTo(point[0] + x, point[1] + y)
  point = getPoint([ 1 * size, 0 ], rot)
  ctx.lineTo(point[0] + x, point[1] + y)
  ctx.fill()
}

export function getPoint(p: [ number, number ], rot: number): [ number, number ] {
  const s = Math.sin(rot / 180 * Math.PI)
  const c = Math.cos(rot / 180 * Math.PI)
  return [
    p[0] * c - p[1] * s,
    p[0] * s + p[1] * c
  ]
}

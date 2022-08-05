import * as chrono from 'chrono-node'
import * as ms from 'ms'


export function parseTime(time: string, zoneOffset: number): { parsed: number | undefined, usedTimezone: boolean } {
  if (!time) return undefined

  const simple = ms(time)
  if (simple) {
    return {
      parsed: Date.now() + simple,
      usedTimezone: false
    }
  }

  const out = chrono.parseDate(time, { timezone: zoneOffset })
  if (!out) return undefined

  return {
    parsed: out.getTime(),
    usedTimezone: true
  }
}

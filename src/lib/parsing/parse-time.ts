import * as ms from 'ms'


type DateItem = { day: number, month: number, year?: number }
type TimeItem = { hour: number, minute?: number }

//

const oneDay = 1000 * 60 * 60 * 24

const monthDictionary = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  januar: 1,
  februar: 2,
  märz: 3,
  // april: 4,
  mai: 5,
  juni: 6,
  juli: 7,
  // august: 8,
  // september: 9,
  oktober: 10,
  // november: 11,
  dezember: 12
}

//

export function parseTime(time: string): number | undefined {
  if (!time) return undefined
  let out: number | undefined

  time = cleanInput(time)

  if (/[a-z]/gi.test(time)) {
    out = attemptMsParsing(time)
    if (time && !isNaN(out)) return out + Date.now()
  }

  out = attemptTimeDateParsing(time)
  if (time) return out

  return undefined
}

//

function cleanInput(time: string): string {
  const junkwords = /(?:^| )(at|in|um|am|clock|o)(?: |$)/gi

  let out = time
    .toLowerCase()
    .replace(/(?:^| )(one|a)(?: |$)/gi, '1')
    .replace(junkwords, ' ')
    .replace(/ {2,}/, ' ')
    .trim()
  if (out.endsWith('uhr'))
    out = out.substring(0, out.length - 3) + ':00'
  return out
}

function attemptMsParsing(time: string): number | undefined {
  return ms(time)
}

function attemptTimeDateParsing(input: string): number | undefined {
  const hasEuDate = input.includes('.')
  const hasUsDate = input.includes('/')
  const hasDate = hasEuDate || hasUsDate
  const hasTime = input.includes(':')

  if (hasEuDate && hasUsDate) return

  let time: TimeItem | undefined
  let date: DateItem | undefined

  if (hasDate && hasTime) {
    const formatted = input
      .replace(/ *(\.|-|\/|\||,|;|'|:) */gi, '$1')
      .split(' ')
    const datePart = formatted[0]
    const timePart = formatted.slice(1).join(' ')
    date = attemptDateParsing(datePart, hasUsDate)
    time = attemptTimeParsing(timePart)
  } else if (hasDate) {
    date = attemptDateParsing(input, hasUsDate)
  } else if (hasTime) {
    time = attemptTimeParsing(input)
  } else {
    const num = parseInt(input)
    if (!isNaN(num)) time = { hour: num }
  }

  let justGuesses = (!time && !date)

  if (time) polyfillTimeItem(time)
  if (date) polyfillDateItem(date)

  if (!time) {
    time = interpretTime(input)
    if (time) {
      justGuesses = false
    } else {
      const now = new Date()
      time = { hour: now.getHours(), minute: now.getMinutes() }
    }
  }
  if (!date) date = interpretDate(input, time, justGuesses)

  if (!time || !date) return undefined

  const out = new Date(date.year, date.month - 1, date.day, time.hour, time.minute)

  if (!out) return undefined

  return out.getTime()
}

function attemptDateParsing(date: string, isAmericanFormat: boolean): undefined | DateItem {
  if (!date) return undefined
  // eslint-disable-next-line prefer-const
  let [ day, month, year ] = date.split(/ *(?:\.|\/| ) */gi)
  if (isAmericanFormat)
    [ day, month ] = [ month, day ]

  const monthParsed = parseMonth(month)
  if (monthParsed === undefined) return undefined

  const out = {
    day: parseInt(day),
    month: monthParsed,
    year: year ? parseInt(year) : undefined
  }
  if (isNaN(out.day)) return undefined
  if (out.year && isNaN(out.year)) out.year = undefined
  else if (out.year < 2000) out.year += 2000
  return out
}

function attemptTimeParsing(time: string): undefined | TimeItem {
  if (!time) return undefined
  const [ hour, minute ] = time.split(/:| |,|'|-|\./gi)
  const out = {
    hour: parseInt(hour),
    minute: minute ? parseInt(minute) : undefined
  }
  if (isNaN(out.hour)) return undefined
  if (out.minute && isNaN(out.minute)) out.minute = undefined
  return out
}

function parseMonth(month: string): number {
  const asNumber = parseInt(month)
  if (!isNaN(asNumber)) return asNumber
  return monthDictionary[month]
}

function polyfillTimeItem(time: TimeItem) {
  if (time.minute === undefined) time.minute = 0
}

function polyfillDateItem(date: DateItem) {
  if (date.year !== undefined) return
  const now = new Date()
  const nowDay = now.getDay()
  const nowMonth = now.getMonth() + 1
  const nowYear = now.getFullYear()

  if (date.month > nowMonth)
    return void (date.year = nowYear)

  if (date.month < nowMonth)
    return void (date.year = nowYear + 1)

  if (date.month > nowDay)
    return void (date.year = nowYear)

  if (date.month < nowMonth)
    return void (date.year = nowYear + 1)

  date.year = nowYear
}

function interpretDate(input: string, time: TimeItem, justGuesses: boolean): DateItem {
  const now = new Date()
  const getOut = (time: Date): DateItem => ({
    day: time.getDate(),
    month: time.getMonth() + 1,
    year: time.getFullYear()
  })

  if (/now/gi.test(input))
    return getOut(now)
  if (/today|heute/gi.test(input))
    return getOut(now)
  if (/tomorrow|morgen/gi.test(input))
    return getOut(new Date(Date.now() + oneDay))
  if (/yesterday|gestern/gi.test(input))
    return getOut(new Date(Date.now() - oneDay))

  if (justGuesses)
    return undefined

  if (time.hour > now.getHours())
    return getOut(now)

  if (time.hour < now.getHours())
    return getOut(new Date(Date.now() + oneDay))

  if (time.minute > now.getMinutes())
    return getOut(now)

  return getOut(new Date(Date.now() + oneDay))
}

function interpretTime(input: string): TimeItem | undefined {
  if (/now/gi.test(input))
    return { hour: new Date().getHours(), minute: new Date().getMinutes() + 1 }
  if (/morning|morgen/gi.test(input))
    return { hour: 9, minute: 0 }
  if (/mid|breakfast|mittag|noon/gi.test(input))
    return { hour: 12, minute: 0 }
  if (/früh.*nachmittag|early.*afternoon/gi.test(input))
    return { hour: 13, minute: 30 }
  if (/nachmittag|afternoon/gi.test(input))
    return { hour: 15, minute: 0 }
  if (/früh.*abend|early.*evening/gi.test(input))
    return { hour: 17, minute: 0 }
  if (/abend|evening/gi.test(input))
    return { hour: 19, minute: 0 }
  if (/early|früh/gi.test(input))
    return { hour: 8, minute: 0 }
  if (/late|spät/gi.test(input))
    return { hour: 21, minute: 0 }
  if (/midnight|mitternacht/gi.test(input))
    return { hour: 0, minute: 0 }
  return undefined
}

//

// eslint-disable-next-line camelcase
export function __run_tests__parseTime() {
  const times = [
    '20h',
    ' 5 mins',
    '7 days    ',
    ' in 3 hours ',
    ' at 3:00',
    'tomorrow morning',
    'yesterday',
    'now',
    'at 3. 12. 2024',
    '25.3',
    '6/3/2021',
    '4. 2. ',
    '5.3 20:00',
    '20 uhr',
    'at 0:30',
    '30. oktober 22 uhr',
    '19. 4. 2024 at 14:30'
  ]

  let parsed, pretty
  for (const test of times) {
    parsed = parseTime(test)
    pretty = parsed
      ? new Date(parsed).toLocaleString()
      : 'error'
    console.log(`'${test.padStart(16, ' ')}' -> ${(parsed + '').padStart(16, ' ')} (${pretty})`)
  }
}

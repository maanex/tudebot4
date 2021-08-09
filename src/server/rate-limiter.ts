import * as rateLimit from 'express-rate-limit'


export default class RateLimiter {

  public static limit(max: number, window: number, mes?: any) {
    return rateLimit({
      windowMs: window * 60 * 1000,
      max,
      message: mes ? JSON.stringify(mes) : null
    })
  }

}

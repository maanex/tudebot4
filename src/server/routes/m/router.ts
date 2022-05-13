import { Response, Router } from 'express'
import ReqError from '../../../lib/web/req-error'
import { rateLimiter as limit } from '../../middleware/rate-limits'

import { getCalendarV1 } from './reminders/calendar'


export default class ModulesRouter {

  private static ctx: Router

  public static init(): Router {
    this.ctx = Router()
    this.addRoutes()

    return this.ctx
  }

  private static addRoutes() {
    const r = this.ctx

    /* GATEWAY */

    // r.all('*', apiGateway('v2'))


    /* ENDPOINTS */

    // reminders
    r.get('/reminders/calendar-v1/:token', limit(5, 1), getCalendarV1)


    /* Default 404 handler */

    r.all('*', (_, res: Response) => ReqError.notFound(res, 'Endpoint Not Found'))
  }

}

import { Router, Request, Response } from 'express'
import RateLimiter from '../../rateLimiter'
import { TudeBot } from '../../../index'
import FreestuffAssistantModule from '../../../modules/freestuffassistant'


export const router = Router()

router.post(
  '/freestuff',
  RateLimiter.limit(100, 1),
  (req: Request, res: Response) => {
    const auth = req.headers ? (req.headers.authorization || req.headers['proxy-authorization']) : undefined
    if (!auth || !TudeBot.config.thirdparty.freestuff.webhookauth.includes(auth)) {
      res.status(401).send('401 Unauthorized')
      return
    }

    const module = TudeBot.getModule<FreestuffAssistantModule>('freestuffassistant')
    if (!module) return
    module.on(req.body.event, req.body.data)

    res.status(200).send('Thank you')
  }
)

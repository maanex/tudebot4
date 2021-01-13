import { Router, Request, Response } from 'express'
import RateLimiter from '../../rateLimiter'
import { TudeBot } from '../../../index'
import ExternalRewardsModule from '../../../modules/externalrewards'


export const router = Router()

router.post(
  '/webhooks',
  RateLimiter.limit(100, 1),
  async (req: Request, res: Response) => {
    const auth = req.headers ? (req.headers.authorization || req.headers['proxy-authorization']) : undefined
    if (!auth || !TudeBot.config.thirdparty.topgg.webhookauth.includes(auth)) {
      res.status(401).send('401 Unauthorized')
      return
    }

    if (req.body.bot === '672822334641537041') {
      TudeBot.getModule<ExternalRewardsModule>('externalrewards').reward(
        'freestuffbot.upvote',
        await TudeBot.users.fetch(req.body.user),
        { topgg_url: 'https://top.gg/bot/672822334641537041?source=' + req.body.user }
      )
    }

    res.status(200).send('Thank you')
  }
)

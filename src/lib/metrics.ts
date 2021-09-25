import { Gauge, Registry } from 'prom-client'
import { Request, Response } from 'express'


export default class Metrics {

  private static register = new Registry()

  // public static counterLegacyCommands = new Counter({
  //   name: 'fsb_legacy_commands',
  //   help: 'For deciding when to drop legacy commands entirely',
  //   labelNames: [ 'name' ]
  // })

  public static gaugeSurveillanceUsers = new Gauge({
    name: 'tb_surveillance_users',
    help: 'Keeps track of users. Isn\'t that nice?',
    labelNames: [ 'user', 'guilds' ]
  })

  public static gaugeSurveillanceVoice = new Gauge({
    name: 'tb_surveillance_voice',
    help: 'Keeps track of voice connections. Isn\'t that nice?',
    labelNames: [ 'user', 'guilds' ]
  })

  //

  public static init() {
    Metrics.registerMetrics()
  }

  private static registerMetrics() {
    // collectDefaultMetrics({ register: Metrics.register })

    // Metrics.register.registerMetric(Metrics.counterGatewayEvents)

    Metrics.register.registerMetric(Metrics.gaugeSurveillanceUsers)
    Metrics.register.registerMetric(Metrics.gaugeSurveillanceVoice)
  }

  //

  public static endpoint() {
    return async function (_req: Request, res: Response) {
      res
        .status(200)
        .header({ 'Content-Type': 'text/plain' })
        .send(await Metrics.register.metrics())
    }
  }

}

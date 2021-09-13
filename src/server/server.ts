import * as http from 'http'
import * as express from 'express'
import * as morgan from 'morgan'
import * as helmet from 'helmet'
import * as chalk from 'chalk'


export default class Server {

  public static start(port: number) {
    const app = express()

    if (process.env.NODE_ENV !== 'production') app.use(morgan('tiny'))
    app.use(helmet())
    app.use(express.json())
    app.use(this.nonJsonBodyErrorHandler())

    app.set('trust proxy', 1)

    app.get('/metrics', (_, res) => {
      res.type('text/plain').send(`# HELP tudebot_test_1 It's a test
# TYPE tudebot_test_1 counter
tudebot_test_1 ${~~(Math.random() * 20)}
`)
    })

    app.all('/hello', (_, res) => {
      res.send('world')
    })

    const server = http.createServer(app)

    server.listen(port || 8128, () => {
      console.log(`Server listening on port ${chalk.yellowBright(port || 8128)}`)
    })
  }

  private static nonJsonBodyErrorHandler(): express.ErrorRequestHandler {
    return function (error, _req, res, next) {
      if (error instanceof SyntaxError)
        res.status(400).send('400 Bad Request')
      else
        next()

    }
  }

}

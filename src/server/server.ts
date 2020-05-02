import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as fs from "fs";
import * as morgan from "morgan";
import * as helmet from "helmet";
import * as chalk from "chalk";

import { router as apiWebhooksRouter } from "./routes/api/webhooks";
import { router as apiFreestuffRouter } from "./routes/api/freestuff";



export default class Server {

  private constructor() { }

  //

  public static start(port: number) {
    const app = express();

    if (process.env.NODE_ENV !== 'production') app.use(morgan('tiny'));
    app.use(helmet());
    app.use(express.json());
    app.use(this.nonJsonBodyErrorHandler());

    app.set('trust proxy', 1);

    app.use('/api', apiWebhooksRouter);
    app.use('/api', apiFreestuffRouter);

    const server = http.createServer(app);

    server.listen(port || 8128, () => {
      console.log(`Server listening on port ${chalk.yellowBright(port || 8128)}`);
    });
  }

  private static nonJsonBodyErrorHandler(): express.ErrorRequestHandler {
    return function (error, req, res, next) {
      if (error instanceof SyntaxError) {
        res.status(400).send('400 Bad Request');
      } else {
        next();
      }
    };
  }

}

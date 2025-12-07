import 'dotenv/config';
import express, { type Express } from 'express';
import loadMiddlewares from '../middlewares';
import loadCheckers from '../checkers';
import { registerRoutes } from '../routes';
import { errorHandler } from '../middleware';

export function createServer() {
  const app: Express = express();

  /* app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));
   */

  loadMiddlewares(app);
  registerRoutes(app);
  loadCheckers(app);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  app.use(errorHandler);

  return app;
}

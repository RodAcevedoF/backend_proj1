import type { Express } from 'express';

export const loadCheckers = (app: Express) => {
  app.get('/sagepoint/api/v1/ping', (_req, res) => {
    res.json({ message: 'Server is running!' });
  });

  app.get('/sagepoint/api/v1/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
    });
  });
};

export default loadCheckers;

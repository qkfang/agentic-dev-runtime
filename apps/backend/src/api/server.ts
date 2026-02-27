import express from 'express';
import cors from 'cors';
import router from './routes';

export function createServer(): express.Application {
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json({ type: ['application/json', 'text/plain'] }));
  app.use(express.text({ type: 'text/markdown' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/', router);

  return app;
}

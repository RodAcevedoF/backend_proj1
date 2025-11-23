import 'dotenv/config';
import { createServer } from '@/core/infrastructure/drivers/http/server/server';
import { type Express } from 'express';

export function bootstrap() {
  const app: Express = createServer();

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server is running on ${port}`);
  });
}

bootstrap();

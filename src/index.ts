import 'dotenv/config';
import { createServer } from '@/core/infrastructure/drivers/http/server/server';
import { connectMongo } from '@/core/infrastructure/driven/db/mongoose';
import { type Express } from 'express';

export async function bootstrap() {
  try {
    const app: Express = createServer();
    await connectMongo();
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`Server is running on ${port}`);
    });
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      console.error('Error during bootstrap:', error.stack);
    } else {
      console.error('Unknown error during bootstrap', error);
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

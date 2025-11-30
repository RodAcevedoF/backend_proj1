import 'dotenv/config';
import mongoose from 'mongoose';

export async function connectMongo(): Promise<void> {
  const DB_URL = process.env.DB_URL;

  try {
    await mongoose.connect(DB_URL!);
    console.log('MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.connection.close();
  console.log('✓ MongoDB disconnected');
}

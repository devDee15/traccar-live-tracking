import mongoose from 'mongoose';

import { logger } from '../logger/index.js';
import { config } from '../../config/index.js';

let connected = false;

export async function connectMongo() {
  mongoose.connection.on('disconnected', () => {
    connected = false;
    logger.warn('MongoDB disconnected');
  });
  mongoose.connection.on('error', (error) => logger.error({ err: error }, 'MongoDB error'));

  await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 10_000 });
  connected = true;
  logger.info('MongoDB connected');
}

export async function disconnectMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connected = false;
}

export function isMongoReady() {
  return connected && mongoose.connection.readyState === 1;
}

import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  MONGODB_URI: z.string().default('mongodb://mongo:27017/tracking'),
  REDIS_URL: z.string().default('redis://redis:6379'),
  KAFKA_BROKERS: z.string().default('kafka:9092'),
  KAFKA_CLIENT_ID: z.string().default('tracking-api'),
  KAFKA_RAW_TOPIC: z.string().default('traccar-positions'),
  KAFKA_LOCATION_TOPIC: z.string().default('gps-location-topic'),
  KAFKA_DEAD_LETTER_TOPIC: z.string().default('gps-location-dead-letter'),
  LATEST_LOCATION_TTL_SECONDS: z.coerce.number().int().positive().default(300),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map(({ path, message }) => `${path.join('.')}: ${message}`);
  throw new Error(`Invalid environment configuration: ${details.join('; ')}`);
}

export const config = Object.freeze({
  nodeEnv: parsed.data.NODE_ENV,
  host: parsed.data.HOST,
  port: parsed.data.PORT,
  logLevel: parsed.data.LOG_LEVEL,
  mongodbUri: parsed.data.MONGODB_URI,
  redisUrl: parsed.data.REDIS_URL,
  kafkaBrokers: parsed.data.KAFKA_BROKERS.split(',').map((broker) => broker.trim()),
  kafkaClientId: parsed.data.KAFKA_CLIENT_ID,
  kafkaRawTopic: parsed.data.KAFKA_RAW_TOPIC,
  kafkaLocationTopic: parsed.data.KAFKA_LOCATION_TOPIC,
  kafkaDeadLetterTopic: parsed.data.KAFKA_DEAD_LETTER_TOPIC,
  latestLocationTtlSeconds: parsed.data.LATEST_LOCATION_TTL_SECONDS,
});

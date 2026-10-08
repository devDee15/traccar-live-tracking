import { Kafka, logLevel } from 'kafkajs';

import { logger } from '../common/logger/index.js';
import { config } from '../config/index.js';

function kafkaLogCreator() {
  return ({ level, log }) => {
    const method = level === logLevel.ERROR ? 'error' : level === logLevel.WARN ? 'warn' : 'debug';
    logger[method]({ kafka: log }, log.message);
  };
}

export const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: config.kafkaBrokers,
  logCreator: kafkaLogCreator,
  retry: { initialRetryTime: 300, retries: 8 },
});

export const kafkaAdmin = kafka.admin();

let adminConnected = false;

export async function connectKafkaAdmin() {
  await kafkaAdmin.connect();
  adminConnected = true;
  logger.info({ brokers: config.kafkaBrokers }, 'Kafka admin connected');
}

export async function ensureKafkaTopics() {
  const existingTopics = new Set(await kafkaAdmin.listTopics());
  const topics = [
    { topic: config.kafkaRawTopic, numPartitions: 6 },
    { topic: config.kafkaLocationTopic, numPartitions: 6 },
    { topic: config.kafkaDeadLetterTopic, numPartitions: 3 },
  ].filter(({ topic }) => !existingTopics.has(topic));

  if (topics.length === 0) return;
  await kafkaAdmin.createTopics({
    waitForLeaders: true,
    topics,
  });
  logger.info({ topics: topics.map(({ topic }) => topic) }, 'Kafka topics created');
}

export async function disconnectKafkaAdmin() {
  if (adminConnected) {
    await kafkaAdmin.disconnect();
    adminConnected = false;
  }
}

export function isKafkaReady() {
  return adminConnected;
}

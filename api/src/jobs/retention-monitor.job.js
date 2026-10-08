import { logger } from '../common/logger/index.js';

let timer;

export function startRetentionMonitor() {
  timer = setInterval(() => {
    logger.debug('Location retention monitor heartbeat');
  }, 60 * 60 * 1000);
  timer.unref();
}

export function stopRetentionMonitor() {
  if (timer) clearInterval(timer);
}

import { config } from '../config/index.js';
import { redisClient } from './client.js';

const ACCEPT_LATEST_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if current then
  local decoded = cjson.decode(current)
  if decoded.timestamp >= ARGV[1] then return 0 end
end
redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
return 1
`;

export const latestLocationRepository = {
  async setIfNewer(event) {
    return redisClient.eval(ACCEPT_LATEST_SCRIPT, {
      keys: [`vehicle:${event.imei}`],
      arguments: [event.timestamp, JSON.stringify(event), String(config.latestLocationTtlSeconds)],
    });
  },

  async get(imei) {
    const value = await redisClient.get(`vehicle:${imei}`);
    return value ? JSON.parse(value) : null;
  },
};

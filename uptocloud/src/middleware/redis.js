const Redis = require("ioredis");

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
};

const RedisConnect = () => {
  const redis = new Redis(redisConfig);

  return {
    async getUserJWTBySession(session) {
      const key = `user-jwt/${session}`;
      const jwt = await redis.get(key);
      return jwt;
    },

    async setUserJWTSession(session, jwt) {
      const key = `user-jwt/${session}`;
      return await redis.set(key, jwt);
    },

    async deleteUserJWTSession(session) {
      const key = `user-jwt/${session}`;
      return await redis.del(key);
    },
  };
};

module.exports = {
  RedisConnect,
};

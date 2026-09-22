const mongoose = require('mongoose');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ok } = require('../../utils/apiResponse');
const { getRedis } = require('../../config/redis');
const { env } = require('../../config/env');

const health = asyncHandler(async (_req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  const redisClient = getRedis();
  const redisUp = redisClient ? redisClient.status === 'ready' : false;

  return ok(res, {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dependencies: {
      mongodb: dbUp ? 'up' : 'down',
      redis: redisUp ? 'up' : env.redis.enabled ? 'down' : 'disabled',
    },
  });
});

const ready = asyncHandler(async (_req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  if (!dbUp) {
    return res.status(503).json({
      success: false,
      error: { code: 'NOT_READY', message: 'Database unavailable' },
    });
  }
  return ok(res, { ready: true });
});

const metrics = asyncHandler(async (_req, res) => {
  const mem = process.memoryUsage();
  return ok(res, {
    uptime: process.uptime(),
    memory: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024),
    },
    node: process.version,
    pid: process.pid,
  });
});

module.exports = { health, ready, metrics };
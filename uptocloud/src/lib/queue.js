const Queue = require('bull');
const Redis = require('ioredis');

// Redis configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
};

// Create queues
const videoQueue = new Queue('video-processing', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: false,
        removeOnFail: false
    }
});

// Queue event handlers
videoQueue.on('error', (error) => {
    console.error('Queue error:', error);
});

videoQueue.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed:`, error);
});

videoQueue.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});

module.exports = {
    videoQueue
};
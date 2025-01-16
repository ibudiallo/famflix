const { DbHelper } = require("../src/lib/database");
const { InitQueue } = require("../src/middleware/queuing");
const { InitPool } = require("../src/middleware/mysql");
const { TranscodeVideo } = require("../src/services/transcode");
const { CreateThumbnails } = require("../src/services/thumbnail");

require("dotenv").config();

// MySQL connection pool
const pool = InitPool();
const db = DbHelper(pool);

const videoQueue = InitQueue();

// Process worker
videoQueue.process(async (job) => {
  const { videoId } = job.data;

  try {
    job.progress(0);

    await db.updateVideoStatus(videoId, "processing");
    await Promise.all([
      TranscodeVideo(db, videoId),
      CreateThumbnails(db, videoId),
    ]);
    job.progress(100);

    // Create HLS stream
    //results.hlsPath = await createHLSStream(inputPath, outputDir);

    // Update database with success
    await db.updateVideoStatus(videoId, "processed");
  } catch (error) {
    await db.updateVideoStatus(videoId, "failed");
    throw error;
  }
});

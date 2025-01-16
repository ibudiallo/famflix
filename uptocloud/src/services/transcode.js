const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { ACTION_TYPE } = require("../lib/util/index");

// Video processing configurations
const RESOLUTIONS = [
  { height: 360, bitrate: "800k" },
  { height: 720, bitrate: "2500k" },
  { height: 1080, bitrate: "5000k" },
];

async function processVideoMP4(inputPath, outputDir, resolution) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(
      outputDir,
      `${path.parse(inputPath).name}_${resolution.height}p.mp4`
    );

    ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=-2:${resolution.height}`,
        "-c:v libx264",
        "-crf 28",
        "-preset faster",
        "-movflags +faststart",
      ])
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .run();
  });
}

async function createHLSStream(inputPath, outputDir) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(outputDir, "stream.m3u8");

    ffmpeg(inputPath)
      .outputOptions([
        "-profile:v baseline",
        "-level 3.0",
        "-start_number 0",
        "-hls_time 10",
        "-hls_list_size 0",
        "-f hls",
      ])
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .run();
  });
}

const { DbHelper } = require("../lib/database");

/**
 * Transcode a video
 * @param {DbHelper} db
 * @param {String} videoId
 */
const TranscodeVideo = async (db, videoId) => {
  const results = { versions: [] };
  try {
    await db.updateVideoStatus(videoId, "processing");
    const { metadata, file_path: inputPath } = await db.getVideo(videoId);

    // Create output directory
    const fs = require("fs");
    const videoOutputDir = path.join("processed", videoId, "video");
    if (!fs.existsSync(videoOutputDir)) {
      fs.mkdirSync(videoOutputDir, { recursive: true });
    }

    let processedAtLeastOne = false;

    // Process each resolution
    for (const resolution of RESOLUTIONS) {
      if (metadata.resolution.height >= resolution.height) {
        const outputPath = await processVideoMP4(
          inputPath,
          videoOutputDir,
          resolution
        );
        results.versions.push({
          resolution: `${resolution.height}p`,
          path: outputPath,
        });
        // job.progress((results.versions.length / RESOLUTIONS.length) * 100);
        processedAtLeastOne = true;

        // Save resolution entry to database
        await db.saveVideoResolution(videoId, resolution.height, outputPath);
      }
    }

    // Ensure at least one resolution is processed
    if (!processedAtLeastOne) {
      const outputPath = await processVideoMP4(
        inputPath,
        videoOutputDir,
        metadata.resolution
      );
      results.versions.push({
        resolution: `${metadata.resolution.height}p`,
        path: outputPath,
      });
      // Save resolution entry to database
      await db.saveVideoResolution(
        videoId,
        metadata.resolution.height,
        outputPath
      );
    }

    await db.updateVideoStatus(videoId, "processed", results);
  } catch (error) {
    await db.updateVideoStatus(videoId, "failed");
    throw error;
  }

  try {
    await db.markEventActions(videoId, ACTION_TYPE.TRANSCODED);
  } catch (error) {
    console.log("failed to mark transcoding complete", videoId);
  }
};

module.exports = {
  TranscodeVideo,
};

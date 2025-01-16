const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

const { ACTION_TYPE } = require("../lib/util/index");

async function processVideoThumbnail(inputPath, outputDir, info) {
  return new Promise((resolve, reject) => {
    const totalShots = calculateShots(info.duration);

    ffmpeg(inputPath)
      .on("start", (commandLine) => {
        //console.log("Spawned ffmpeg with command: " + commandLine);
      })
      .on("end", () => {
        console.log("Processing finished successfully");
        const results = new Array(totalShots)
          .fill(null)
          .map((t, i) => `${outputDir}/thumb_${i + 1}.jpg`);
        resolve(results);
      })
      .on("error", (err) => {
        console.error("Error processing video thumbnail:", err.message);
        reject(err);
      })
      .screenshots({
        count: totalShots,
        folder: outputDir,
        size: "?x720",
        filename: "thumb_%i.jpg",
      });
  });
}

const calculateShots = (seconds) => {
  return Math.ceil(seconds/ 60) * 5;
};

const CreateThumbnails = async (db, videoId) => {
  const { file_path: inputPath, metadata } = await db.getVideo(videoId);
  const thumbnailOutputDir = path.join("processed", videoId, "thumbnail");

  const fs = require("fs");
  if (!fs.existsSync(thumbnailOutputDir)) {
    fs.mkdirSync(thumbnailOutputDir, { recursive: true });
  }
  // Save thumbnails
  const thumbs = await processVideoThumbnail(inputPath, thumbnailOutputDir, metadata);

  await db.saveThumbnails(videoId, thumbs);

  try {
    await db.markEventActions(videoId, ACTION_TYPE.THUMBNAILED);
  } catch (error) {
    console.log("failed to mark thumbnail complete", videoId);
    throw error;
  }
};

module.exports = {
  CreateThumbnails,
};

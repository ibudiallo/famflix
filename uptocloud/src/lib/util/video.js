const ffmpeg = require("fluent-ffmpeg");

// Metadata extraction function
const getVideoMetadata = async (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );
      resolve({
        duration: metadata.format.duration,
        size: metadata.format.size,
        codec: videoStream?.codec_name,
        resolution: {
          width: videoStream?.width,
          height: videoStream?.height,
        },
        bitrate: metadata.format.bit_rate,
      });
    });
  });
};

module.exports = {
  getVideoMetadata,
};

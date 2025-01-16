const { v4: uuidv4 } = require("uuid");
const { getVideoMetadata } = require("../lib/util/video");
const { ACTION_TYPE } = require("../lib/util/index");

const UploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const videoId = uuidv4();
    const metadata = await getVideoMetadata(req.file.path);

    const videoData = {
      id: videoId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: "uploaded",
      metadata: metadata,
    };

    await req.db.createVideo(req.user.id, videoData);

    await req.db.markEventActions(videoId, ACTION_TYPE.UPLOADED);

    // Add to processing queue
    await req.videoQueue.add(
      {
        videoId: videoId,
        inputPath: req.file.path,
      },
      {
        priority: 1,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );

    res.status(200).json({
      message: "Upload successful, video queued for processing",
      videoId: videoId,
      metadata: metadata,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: "Upload failed",
      details: error.message,
    });
  }
};

module.exports = {
  UploadFile,
};

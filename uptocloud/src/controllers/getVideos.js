
const GetVideoById = async (req, res, next) => {
    try {
        const video = await req.db.getVideo(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.json(video);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch video information' });
        next(error);
    }
};

const GetAllVideos = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        const videos = await req.db.listVideos(limit, offset);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch videos' });
        next(error);
    }
}

const GetVideoProcessingStatus = async (req, res) => {
    try {
        const video = await req.db.getVideo(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Get queue information if video is processing
        let queueInfo = null;
        if (video.status === 'processing') {
            const jobs = await videoQueue.getJobs(['active', 'waiting']);
            const job = jobs.find(j => j.data.videoId === req.params.id);
            if (job) {
                const progress = await job.progress();
                queueInfo = {
                    jobId: job.id,
                    progress: progress,
                    status: await job.getState()
                };
            }
        }

        res.json({
            ...video,
            queueInfo
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch video status' });
    }
};

const GetProcessedVideos = async (req, res) => {
    try {
      const videos = await req.db.listProcessedVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch processed videos" });
    }
  };

module.exports = {
    GetVideoById,
    GetAllVideos,
    GetVideoProcessingStatus,
    GetProcessedVideos,
};
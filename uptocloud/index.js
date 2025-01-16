const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cookieParser = require('cookie-parser');
require("dotenv").config();

const { InitPool } = require("./src/middleware/mysql");
const { InitQueue } = require("./src/middleware/queuing");

const {
  GetVideoById,
  GetAllVideos,
  GetVideoProcessingStatus,
  GetProcessedVideos,
} = require("./src/controllers/getVideos");

const { register, login, checkSession } = require("./src/controllers/auth");

const { UploadFile } = require("./src/controllers/upload");

const { DbHelper, UserModel } = require("./src/lib/database");
const { authMiddleware } = require("./src/middleware/authentication");
const { RedisConnect } = require("./src/middleware/redis");

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniquePrefix = uuidv4();
    cb(null, `${uniquePrefix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "video/mp4",
      "video/avi",
      "video/quicktime",
      "image/jpeg",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only MP4, AVI, and MOV files are allowed."
        )
      );
    }
  },
});

app.use(cookieParser());

// Routes
app.use(express.static("public"));

app.use(express.json());

app.get("/hello", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "auth.html"));
});

app.use(async (req, res, next) => {
  const pool = InitPool();
  req.db = DbHelper(pool);
  req.userDb = UserModel(pool);
  req.videoQueue = InitQueue();
  req.redis = RedisConnect();
  req.JWT_SECRET = process.env.JWT_SECRET || "MY_BIG_SECRET_12231";
  next();
});

// Authentication
const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/checksession", checkSession);

app.use("/auth", authRouter);

app.use(authMiddleware);

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/preview", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "preview.html"));
});

// Add route to serve the preview page
app.get("/preview/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "video.html"));
});

// Get video status
app.get("/api/video/:id", GetVideoById);

// List videos
app.get("/api/videos", GetAllVideos);

// Add endpoint to check processing status
app.get("/api/video/:id/status", GetVideoProcessingStatus);

// Add route to serve the preview page

// Add endpoint to get processed videos
app.get("/api/processed-videos", GetProcessedVideos);

// Preview Processed videos
app.use("/processed", express.static("processed"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File size too large. Maximum size is 2GB.",
      });
    }
    return res.status(400).json({
      error: "File upload error",
      details: err.message,
    });
  }
  res.status(500).json({
    error: "Something went wrong!",
    details: err.message,
  });
});

// Video  upload endpoint
app.post("/upload/video", upload.single("video"), UploadFile);

// Photos upload endpoint
app.post("/upload/photo", upload.array("photos", 20), UploadFile);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle process termination
process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Performing cleanup...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT. Performing cleanup...");
  process.exit(0);
});

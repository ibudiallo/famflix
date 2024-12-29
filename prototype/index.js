// Prototype: Video Processing Node.js App

/**
 * This Node.js application serves as a prototype for video processing and playback.
 * It allows users to upload a video, processes it into two different formats using FFmpeg,
 * stores metadata in a MySQL database, and plays the video using an HTML5 player.
 */

// Required Modules
const express = require('express');
const fileUpload = require('express-fileupload');
const mysql = require('mysql2');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

// App Configuration
const app = express();
const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PROCESSED_DIR = path.join(__dirname, 'processed');

// Ensure directories exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR);

// Middleware
app.use(fileUpload());
app.use(express.static(PROCESSED_DIR));

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'video_metadata',
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Create metadata table if not exists
db.query(`
  CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_name VARCHAR(255),
    format_480p VARCHAR(255),
    format_720p VARCHAR(255),
    thumbnail VARCHAR(255)
  )
`, err => {
  if (err) throw err;
  console.log('Videos table ready');
});

// Routes

// Upload Video
app.post('/upload', (req, res) => {
  if (!req.files || !req.files.video) {
    return res.status(400).send('No video file uploaded.');
  }

  const video = req.files.video;
  const uploadPath = path.join(UPLOAD_DIR, video.name);

  // Save the uploaded video
  video.mv(uploadPath, err => {
    if (err) return res.status(500).send(err);

    const output480p = path.join(PROCESSED_DIR, `${path.parse(video.name).name}_480p.mp4`);
    const output720p = path.join(PROCESSED_DIR, `${path.parse(video.name).name}_720p.mp4`);
    const thumbnail = path.join(PROCESSED_DIR, `${path.parse(video.name).name}_thumbnail.jpg`);

    // FFmpeg Processing
    const command = `
      ffmpeg -i ${uploadPath} \
      -vf scale=854:480 ${output480p} \
      -vf scale=1280:720 ${output720p} \
      -vf "thumbnail,scale=320:180" -frames:v 1 ${thumbnail}
    `;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error during FFmpeg processing:', stderr);
        return res.status(500).send('Video processing failed.');
      }

      // Save metadata in MySQL
      const sql = 'INSERT INTO videos (original_name, format_480p, format_720p, thumbnail) VALUES (?, ?, ?, ?)';
      db.query(
        sql,
        [video.name, path.basename(output480p), path.basename(output720p), path.basename(thumbnail)],
        (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
          }

          res.send('Video uploaded and processed successfully.');
        }
      );
    });
  });
});

// List Videos
app.get('/videos', (req, res) => {
  const sql = 'SELECT * FROM videos';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Database error.');
    }

    res.json(results);
  });
});

// Video Player
app.get('/player/:id', (req, res) => {
  const videoId = req.params.id;
  const sql = 'SELECT * FROM videos WHERE id = ?';

  db.query(sql, [videoId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Database error.');
    }

    if (results.length === 0) {
      return res.status(404).send('Video not found.');
    }

    const video = results[0];
    res.send(`
      <html>
        <body>
          <h1>${video.original_name}</h1>
          <video controls width="640">
            <source src="/${video.format_480p}" type="video/mp4">
            <source src="/${video.format_720p}" type="video/mp4">
            Your browser does not support HTML5 video.
          </video>
          <img src="/${video.thumbnail}" alt="Thumbnail">
        </body>
      </html>
    `);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

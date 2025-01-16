const bcrypt = require("bcrypt");

const { ACTION_TYPE } = require("./util/index");

const TYPE = {
  [ACTION_TYPE.UPLOADED]: 1,
  [ACTION_TYPE.TRANSCODED]: 2,
  [ACTION_TYPE.THUMBNAILED]: 3,
};

const SALT_ROUNDS = 10;

const DbHelper = (pool) => {
  // Database helper functions

  return {
    async createVideo(userId, videoData) {
      const sql = `
            INSERT INTO uploads (
                id, user_id, original_name, file_name, file_path, 
                file_size, mime_type, status, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
      const values = [
        videoData.id,
        userId,
        videoData.originalName,
        videoData.fileName,
        videoData.filePath,
        videoData.fileSize,
        videoData.mimeType,
        videoData.status,
        JSON.stringify(videoData.metadata),
      ];

      const [result] = await pool.execute(sql, values);
      return result;
    },

    async getVideo(id) {
      const [[video]] = await pool.execute(
        "SELECT * FROM uploads WHERE id = ?",
        [id]
      );
      const [rows] = await pool.execute(
        "SELECT id, resolution, path FROM video_resolutions WHERE video_id = ?",
        [id]
      );
      const thumbnails = await this.getVideoThumbs(id);
      video.resolutions = rows;
      video.thumbnails = thumbnails;
      return video;
    },

    async updateVideoStatus(id, status, errorMessage = null) {
      const sql = `
            UPDATE uploads 
            SET status = ?, 
                error_message = ?,
                ${
                  status === "processing"
                    ? "processing_started_at = CURRENT_TIMESTAMP,"
                    : ""
                }
                ${
                  status === "completed"
                    ? "processing_completed_at = CURRENT_TIMESTAMP,"
                    : ""
                }
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
      const [result] = await pool.execute(sql, [status, errorMessage, id]);
      return result;
    },

    async listVideos(limit = 10, offset = 0) {
      const [rows] = await pool.query(
        "SELECT * FROM uploads ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [limit, offset]
      );
      return rows;
    },

    async listProcessedVideos() {
      const sql = `
        SELECT u.id, u.original_name, file_size, metadata, created_at
        FROM uploads u
        WHERE u.status = 'processed'
        ORDER BY u.created_at DESC
      `;
      const sql2 = `
        SELECT id, resolution, path 
        FROM video_resolutions vr
        WHERE vr.video_id = ?`;
      const [videos] = await pool.query(sql);
      for (let i = 0, l = videos.length; i < l; i++) {
        let v = videos[i];
        const [rows] = await pool.query(sql2, [v.id]);
        v.resolutions = rows;
      }
      return videos;
    },

    async saveVideoResolution(videoId, resolution, outputPath) {
      const sql = `
        INSERT INTO video_resolutions (video_id, resolution, path) 
        VALUES (?, ?, ?)
      `;
      const values = [videoId, `${resolution}p`, outputPath];
      const [result] = await pool.execute(sql, values);
      return result;
    },

    async saveThumbnail(videoId, outputPath) {
      const sql = `
        INSERT INTO thumbnails (video_id, path) 
        VALUES (?, ?)
      `;
      const values = [videoId, outputPath];
      const [result] = await pool.execute(sql, values);
      return result;
    },

    async saveThumbnails(videoId, paths) {
      const groups = paths.map((p) => `(?, ?)`);
      const sql = `
        INSERT INTO thumbnails (video_id, path) 
        VALUES ${groups.join(", ")};
      `;
      const values = [];
      paths.map((p) => {
        values.push(videoId);
        values.push(p);
      });
      const [result] = await pool.execute(sql, values);
      return result;
    },

    async getVideoThumbs(videoId) {
      const sql = `
        SELECT id, path, is_active
        FROM thumbnails t
        WHERE t.video_id = ?
      `;
      const [thumbs] = await pool.execute(sql, [videoId]);
      return thumbs;
    },

    async markEventActions(videoId, type) {
      if (!TYPE[type]) {
        throw `Invalid action type ${type}`;
      }
      const sql = `
        INSERT INTO upload_actions (upload_id, action_type)
        VALUES (?, ?);
      `;
      const [thumbs] = await pool.execute(sql, [videoId, TYPE[type]]);
      return thumbs;
    },
  };
};

// User model functions
const UserModel = (pool) => {
  return {
    async createUser(userData) {
      const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

      const sql = `
          INSERT INTO users (email, password_hash, full_name, role)
          VALUES (?, ?, ?, ?)
      `;

      const [result] = await pool.execute(sql, [
        userData.email.toLowerCase(),
        passwordHash,
        userData.fullName,
        userData.role || "user",
      ]);
      const userId = result.insertId;
      return await this.findById(userId);
    },

    async findByEmail(email) {
      const [rows] = await pool.execute(
        "SELECT * FROM users WHERE email = ? AND is_active = true",
        [email.toLowerCase()]
      );
      return rows[0];
    },

    async findById(id) {
      const [rows] = await pool.execute(
        "SELECT * FROM users WHERE id = ? AND is_active = true",
        [id]
      );
      return rows[0];
    },
  };
};

module.exports = {
  DbHelper,
  UserModel,
};

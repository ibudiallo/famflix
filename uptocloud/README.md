# Video Upload and Processing Service

This prototype provides a service for uploading videos, transcoding them, and creating thumbnails. It also includes basic authentication for user registration and login. In the future, it will support uploading photos as well. This is the first step towards creating a UI in a separate repository.

## Features

- **Video Upload**: Users can upload videos in MP4, AVI, and MOV formats.
- **Video Transcoding**: Uploaded videos are transcoded to multiple resolutions.
- **Thumbnail Creation**: Thumbnails are generated for each video.
- **User Authentication**: Users can register and log in to the service.
- **Video Preview**: Users can preview processed videos and view metadata and thumbnails.

## Endpoints

### Authentication

- **POST /auth/register**: Register a new user.
- **POST /auth/login**: Log in an existing user.
- **POST /auth/checksession**: Check if the user is already logged in.

### Video Upload and Processing

- **POST /upload/video**: Upload a video file.
- **GET /api/video/:id**: Get details of a specific video, including metadata and thumbnails.
- **GET /api/videos**: List all videos.
- **GET /api/video/:id/status**: Check the processing status of a specific video.
- **GET /api/processed-videos**: Get a list of processed videos.

### Static Files

- **GET /upload**: Serve the video upload page.
- **GET /preview**: Serve the video preview page.
- **GET /preview/:id**: Serve the video details page.
- **GET /processed**: Serve processed video files.

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file with the following content:
   ```
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```
   npm start
   ```
4. Start the queue processor:
   ```
   node bin/worker.js
   ```

### Future Enhancements

- **Photo Upload:** Allow users to upload photos.
- **UI Integration:** Create a separate repository for the UI and integrate it with this service.

## License

This project is licensed under the MIT License.


# Business Requirement Document (BRD): Video Processing Service

See the [uptocloud](../uptocloud/) folder for a prototype

## Executive Summary
This document outlines the requirements for a service that enables video uploads, processes them into multiple resolutions and streaming formats, and prepares them for storage and distribution. The scope of this document is limited to video upload and processing. Storage will be addressed in a separate BRD.

The goal is to create a scalable, efficient, and reliable video processing pipeline that can handle diverse video formats and resolutions while ensuring compatibility with modern streaming standards.

---

## Objectives
1. **Upload Functionality:** Allow users to upload videos in various formats and sizes.
2. **Processing Pipeline:** Convert uploaded videos into multiple resolutions and streaming-ready formats.
3. **Output Preparation:** Ensure processed videos are optimized for storage and ready for distribution.

---

## Functional Requirements

### 1. Video Upload
#### Description:
The system must allow users to upload videos in a variety of common formats (e.g., MP4, AVI, MOV). Uploads should be secure and handle file sizes up to a predefined limit (e.g., 2GB).

#### Features:
- Upload interface with drag-and-drop functionality.
- Support for resumable uploads to handle interruptions.
- Validation for supported file formats and size restrictions.
- Metadata extraction (e.g., video resolution, codec, duration).

#### Server Requirements:
- **Web Server:** To handle upload requests and manage user sessions.
  - Recommended: NGINX or Apache.
  - Specs: 2 CPU cores, 4GB RAM (scalable for higher traffic).
- **File Ingestion Server:** Dedicated server for managing file uploads and queuing them for processing.
  - Recommended: Node.js or Python-based service.
  - Specs: 4 CPU cores, 8GB RAM, high-speed SSD for temporary file storage.

#### Considerations:
- Use HTTPS for secure data transfer.
- Implement file integrity checks (e.g., checksums).
- Enforce upload rate limiting to prevent abuse.

---

### 2. Video Processing
#### Description:
Once a video is uploaded, it must be processed into multiple resolutions (e.g., 360p, 720p, 1080p) and streaming-ready formats (e.g., HLS, DASH).

#### Features:
- Transcoding to target resolutions and codecs (e.g., H.264 for compatibility).
- Generation of adaptive bitrate streaming formats (HLS/DASH).
- Thumbnail extraction for catalog presentation.
- Asynchronous processing with status updates.

#### Server Requirements:
- **Processing Server:** High-performance server optimized for video transcoding.
  - Recommended: FFmpeg for transcoding.
  - Specs:
    - 8-16 CPU cores (e.g., Intel Xeon or AMD Ryzen).
    - 32GB RAM.
    - GPU acceleration (e.g., NVIDIA Tesla or AMD Radeon Pro) for faster processing.
    - High-speed SSD for temporary storage of transcoding files.

- **Job Queue Server:** Manage processing tasks and ensure scalability.
  - Recommended: RabbitMQ or AWS SQS.
  - Specs: 2 CPU cores, 4GB RAM (scalable as workload increases).

#### Considerations:
- Optimize FFmpeg settings for balance between quality and speed.
- Use a job queue to handle scaling and prioritize tasks.
- Implement error handling for failed processing tasks.

---

### 3. Output Preparation
#### Description:
Processed videos must be verified for quality and prepared for storage.

#### Features:
- Integrity checks to confirm successful transcoding.
- Metadata updates (e.g., file size, resolution, codec).
- Automated notifications for processing completion.

#### Server Requirements:
- **Output Validation Server:** Handles verification and finalization of processed videos.
  - Recommended: Python or Node.js service.
  - Specs: 4 CPU cores, 8GB RAM, access to processed file storage.

#### Considerations:
- Log all processing activities for troubleshooting.
- Prepare files for seamless integration with the storage system.

---

## Non-Functional Requirements

1. **Scalability:**
   - Ensure the system can handle increased upload and processing demands by scaling horizontally.
   - Use containerization (e.g., Docker) for deployment.

2. **Security:**
   - Use TLS for all communications.
   - Implement access controls to restrict unauthorized uploads and processing.

3. **Performance:**
   - Process videos within an acceptable timeframe (e.g., under 5 minutes for a 1GB file).
   - Ensure uploads do not significantly impact processing server performance.

4. **Reliability:**
   - Ensure high availability with load balancing and failover mechanisms.
   - Implement retry logic for failed uploads or processing tasks.

5. **Monitoring:**
   - Use monitoring tools (e.g., Prometheus, Grafana) to track system health and performance.

---

## Risks and Mitigation

| Risk                         | Mitigation Strategy                          |
|------------------------------|----------------------------------------------|
| High server load during peak usage | Use auto-scaling for processing servers.      |
| Large files causing slow uploads  | Implement resumable uploads and bandwidth throttling. |
| Processing failures            | Use job retries and detailed error logging.   |
| Security vulnerabilities       | Perform regular security audits and updates. |

---

## Timeline
- **Week 1-2:** Develop upload service and integrate file ingestion.
- **Week 3-4:** Implement video processing pipeline with FFmpeg.
- **Week 5:** Finalize output validation and integration with storage.

---

## Approval
This document serves as the initial blueprint for the video upload and processing service. Once approved, the team will proceed with implementation as per the outlined requirements and considerations.


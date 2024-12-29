# FamFlix

FamFlix is a private family streaming service designed to unify and simplify the way families upload, process, store, and consume their cherished videos. This platform allows families to securely share and enjoy their memories through an intuitive, Netflix-like interface.

This project is for educational purpose only.

---

## Project Overview
FamFlix is built with the following key components:

1. **Video Upload and Processing:** Handles video uploads and converts them into multiple resolutions and streaming formats using tools like FFmpeg. This ensures compatibility across all devices and network conditions.
2. **Storage:** Manages video storage with lifecycle policies to optimize cost and ensure availability. Videos are stored in formats suitable for both long-term archiving and high-availability streaming.
3. **Distribution:** Provides a Netflix-like web application for browsing, streaming, and interacting with videos. Includes features such as adaptive streaming, commenting, and secure authentication.

---

## Business Requirement Documents (BRD)
The project is structured around three core BRDs that outline the functional and technical requirements of each component:

1. [**Video Upload and Processing BRD**](BRD/01-processing.md)
   - Describes the process for uploading videos, processing them into multiple formats, and saving metadata.
   - Includes details about the servers, software, and configurations required for efficient video processing.

2. [**Storage BRD**](BRD/02-storage.md)
   - Focuses on storing processed videos with a cost-effective lifecycle policy.
   - Discusses options like AWS S3 and DigitalOcean for managing raw and processed files.

3. [**Distribution BRD**](BRD/03-distribution.md)
   - Covers the creation of a user-friendly interface for streaming videos and interacting with content.
   - Highlights features like adaptive streaming, commenting, and secure access.

---

## Prototype
To get started, a prototype Node.js application has been outlined. The prototype demonstrates the basic functionality of:

- Uploading a video.
- Processing it into two resolutions using FFmpeg.
- Storing metadata and thumbnails in a MySQL database.
- Playing the processed videos in an HTML5 video player.

The detailed instructions for building this prototype can be found in the project’s [Prototype Guide](prototype/README.md).

---

## Future Enhancements
As the platform evolves, several features are planned for implementation:

- **Mobile Apps:** Native iOS and Android applications for enhanced accessibility.
- **AI Recommendations:** Personalized video suggestions based on user preferences.
- **Live Streaming:** Real-time streaming capabilities for family events.
- **Offline Viewing:** Allow users to download videos for offline playback.
- **Photos:** Allow users to upload photos

---

## How to Use
1. Review the linked BRDs to understand the functional and technical requirements for each component.
2. Follow the Prototype Guide to set up the foundational application.
3. Expand upon the prototype by implementing additional features outlined in the BRDs and Future Enhancements section.

---

FamFlix is your family’s solution to preserving and enjoying memories in a secure and centralized platform. Join the journey of building a streaming service tailored to the unique needs of your family!


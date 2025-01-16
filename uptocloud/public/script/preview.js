document.addEventListener("DOMContentLoaded", () => {
    const videoList = document.getElementById("videoList");
    const videoPreview = document.getElementById("videoPreview");
    const videoSource = document.getElementById("videoSource");
    const resolutionSelect = document.getElementById("resolutionSelect");
  
    let currentVideoResolutions = [];
  
    fetch("/api/processed-videos")
      .then((response) => response.json())
      .then((videos) => {
        videos.forEach((video) => {
          const videoItem = document.createElement("div");
          videoItem.className = "video-item";
  
          const videoTitle = document.createElement("h2");
          videoTitle.textContent = video.original_name;
  
          const videoLink = document.createElement("a");
          const url = `/preview/${video.id}`
          console.log(video)
          videoLink.href = url;
          videoLink.textContent = "Watch Video";
          videoItem.appendChild(videoTitle);
          videoItem.appendChild(videoLink);
  
          videoList.appendChild(videoItem);
        });
      })
      .catch((error) => {
        console.error("Error fetching processed videos:", error);
      });
  
  });
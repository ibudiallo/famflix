document.addEventListener("DOMContentLoaded", () => {
    const videoPreview = document.getElementById("videoPreview");
    const videoSource = document.getElementById("videoSource");
    const resolutionSelect = document.getElementById("resolutionSelect");
    const videoSize = document.getElementById("videoSize");
    const videoCodec = document.getElementById("videoCodec");
    const videoBitrate = document.getElementById("videoBitrate");
    const videoDuration = document.getElementById("videoDuration");
    const videoResolution = document.getElementById("videoResolution");
    const thumbnailList = document.getElementById("thumbnailList");

    const videoId = window.location.pathname.split("/")[2];
    fetch(`/api/video/${videoId}`)
        .then((response) => response.json())
        .then((video) => {
            loadVideo(video);
            displayMetadata(video.metadata);
            displayThumbnails(video.thumbnails);
        })
        .catch((error) => {
            console.error("Error fetching video details:", error);
        });

    function loadVideo(video) {
        video.resolutions.forEach((res) => {
            const option = document.createElement("option");
            option.value = `/${res.path}`;
            option.textContent = res.resolution;
            resolutionSelect.appendChild(option);
        });
        videoSource.src = "/" + video.resolutions[0].path;
        videoPreview.load();
        videoPreview.play();
    }

    function displayMetadata(metadata) {
        videoSize.textContent = formatFileSize(metadata.size);
        videoCodec.textContent = metadata.codec;
        videoBitrate.textContent = metadata.bitrate;
        videoDuration.textContent = metadata.duration;
        videoResolution.textContent = `${metadata.resolution.width}x${metadata.resolution.height}`;
    }

    function displayThumbnails(thumbnails) {
        console.log(thumbnails)
        thumbnails.forEach((thumb) => {
            const img = document.createElement("img");
            img.src = `/${thumb.path}`;
            img.alt = "Thumbnail";
            img.className = "thumbnail";
            img.width = 100;
            thumbnailList.appendChild(img);
        });
    }

    resolutionSelect.addEventListener("change", () => {
        videoSource.src = resolutionSelect.value;
        videoPreview.load();
        videoPreview.play();
    });

    function formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
      }

});
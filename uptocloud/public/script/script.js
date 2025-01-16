const App = (() => {
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const progressContainer = document.getElementById("progressContainer");
  const progress = document.getElementById("progress");
  const progressText = document.getElementById("progressText");
  const status = document.getElementById("status");
  const fileInfo = document.getElementById("fileInfo");
  const selectButton = document.getElementById("selectButton");

  // File selection button click
  selectButton.addEventListener("click", () => {
    fileInput.click();
  });

  // Drag and drop events
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
  });

  function handleFiles(files) {
    const file = files[0];
    if (!file) return;

    // Validate file size (2GB max)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      showStatus("File size exceeds 2GB limit", "error");
      return;
    }

    // Validate file type
    if (!["video/mp4", "video/avi", "video/quicktime"].includes(file.type)) {
      showStatus(
        "Invalid file type. Only MP4, AVI, and MOV files are allowed.",
        "error"
      );
      return;
    }

    // Display file info
    document.getElementById("fileName").textContent = file.name;
    document.getElementById("fileSize").textContent = formatFileSize(file.size);
    document.getElementById("fileType").textContent = file.type;
    fileInfo.style.display = "block";

    uploadFile(file);
  }

  function uploadFile(file) {
    const formData = new FormData();
    formData.append("video", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        updateProgress(percentComplete);
      }
    });

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const videoId = response.videoId;
          showStatus(
            "Upload successful! Redirecting to video page...",
            "success"
          );
          setTimeout(() => {
            window.location.href = `/preview/${videoId}`;
          }, 2000);
        } else {
          showStatus("Upload failed. Please try again.", "error");
        }
      }
    };

    xhr.open("POST", "http://localhost:3000/upload/video", true);
    xhr.send(formData);

    progressContainer.style.display = "block";
    updateProgress(0);
  }

  function updateProgress(percent) {
    progress.style.width = percent + "%";
    progressText.textContent = Math.round(percent) + "%";
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = "status " + type;
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
})();
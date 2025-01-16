document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");
  const status = document.getElementById("status");

  loginButton.addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    login(email, password);
  });

  registerButton.addEventListener("click", () => {
    const fullName = document.getElementById("registerFullName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    register(fullName, email, password);
  });

  function login(email, password) {
    fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "/upload";
        } else {
          showStatus(data.error, "error");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        showStatus("Login failed. Please try again.", "error");
      });
  }

  function register(fullName, email, password) {
    fetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullName, email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.userId) {
          showStatus("Registration successful! Please log in.", "success");
        } else {
          showStatus(data.error, "error");
        }
      })
      .catch((error) => {
        console.error("Registration error:", error);
        showStatus("Registration failed. Please try again.", "error");
      });
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = "status " + type;
  }

  // Check session
  fetch("/auth/checksession", { method: "POST" })
    .then((response) => response.json())
    .then((data) => {
      if (data.loggedIn) {
        window.location.href = "/upload";
      }
    })
    .catch((error) => {
      console.error("Session check error:", error);
    });
});

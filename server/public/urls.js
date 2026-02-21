let user = null;

document.addEventListener("DOMContentLoaded", () => {
  // check auth
  checkAuth();

  // hamburger menu
  const hamburger = document.getElementById("hamburger");
  const mobileLink = document.querySelector(".mobile-link");
  hamburger.addEventListener("click", () => {
    mobileLink.classList.toggle("active");
  });

  // animation for existing elements
  const reveal = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.1 },
  );
  reveal.forEach((el) => observer.observe(el));

  // login
  const loginbtn = document.querySelector(".login");
  const loginModal = document.querySelector(".login-modal");
  const closeLoginModal = document.querySelector(".close-login-modal");
  if (loginbtn) {
    loginbtn.addEventListener("click", () => {
      loginModal.classList.add("active");
    });
  }
  if (closeLoginModal) {
    closeLoginModal.addEventListener("click", () => {
      loginModal.classList.remove("active");
    });
  }

  // login form
  const loginForm = document.querySelector(".login-modal-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm.querySelector("#login-email").value;
      const password = loginForm.querySelector("#login-password").value;
      if (email.trim() === "" || password.trim() === "") {
        loginForm.querySelectorAll("#error-message").forEach((el) => {
          el.classList.add("active");
        });
        return;
      } else {
        loginForm.querySelectorAll("#error-message").forEach((el) => {
          el.classList.remove("active");
        });
      }
      loginUser({ email, password });
    });
  }

  // sign up
  const signUpbtn = document.querySelector(".sign-up");
  const signUpModal = document.querySelector(".sign-up-modal");
  const closeSignUpModal = document.querySelector(".close-sign-up-modal");
  if (signUpbtn) {
    signUpbtn.addEventListener("click", () => {
      signUpModal.classList.add("active");
    });
  }
  if (closeSignUpModal) {
    closeSignUpModal.addEventListener("click", () => {
      signUpModal.classList.remove("active");
    });
  }

  // sign up form
  const signUpForm = document.querySelector(".sign-up-modal-form");
  if (signUpForm) {
    signUpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = signUpForm.querySelector("#sign-up-username").value;
      const email = signUpForm.querySelector("#sign-up-email").value;
      const password = signUpForm.querySelector("#sign-up-password").value;
      if (
        username.trim() === "" ||
        email.trim() === "" ||
        password.trim() === ""
      ) {
        signUpForm.querySelectorAll("#error-message").forEach((el) => {
          el.classList.add("active");
        });
        return;
      } else {
        signUpForm.querySelectorAll("#error-message").forEach((el) => {
          el.classList.remove("active");
        });
      }
      signUpUser({ username, email, password });
    });
  }
});

async function checkAuth() {
  try {
    const res = await fetch("/api/user/me", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (data.success) {
      user = data.user;
      updateAuth();
      fetchUserUrls();
    } else {
      const urlsList = document.getElementById("urls-list");
      urlsList.innerHTML =
        '<div class="no-urls">Please login to see your links.</div>';
    }
  } catch (error) {
    console.error("Auth Check Error:", error);
  }
}

function updateAuth() {
  const authBtn = document.querySelector(".desktop-auth");
  const mobileAuth = document.querySelector(".mobile-auth-link");

  if (user) {
    const userDisplay = `<button class="user-account">${user.username}</button>`;
    if (authBtn) authBtn.innerHTML = userDisplay;
    if (mobileAuth) mobileAuth.innerHTML = userDisplay;
  }
}

async function fetchUserUrls() {
  const urlsList = document.getElementById("urls-list");
  if (!user) return;

  try {
    const res = await fetch(`/api/url/user/${user._id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();

    if (data.success) {
      if (data.urls.length === 0) {
        urlsList.innerHTML =
          '<div class="no-urls">You haven\'t shortened any links yet.</div>';
      } else {
        urlsList.innerHTML = "";
        data.urls.forEach((url, index) => {
          const urlItem = document.createElement("div");
          urlItem.classList.add("url-item");

          const shortFullUrl = `${window.location.origin}/${url.shortCode}`;

          urlItem.innerHTML = `
            <div class="url-info">
              <a href="${url.longUrl}" class="long-url" target="_blank" title="${url.longUrl}">${url.longUrl}</a>
            </div>
            <div class="short-url-box">
              <span class="clicks-count">${url.clicks || 0} clicks</span>
              <a href="${shortFullUrl}" class="short-url" target="_blank">${shortFullUrl}</a>
              <div class="action-btns">
                <button class="copy-btn" data-url="${shortFullUrl}">Copy</button>
                <button class="delete-btn" data-id="${url._id}">Delete</button>
              </div>
            </div>
          `;

          urlsList.appendChild(urlItem);

          // trigger animation with delay
          setTimeout(() => {
            urlItem.classList.add("show");
          }, index * 100);

          // copy button logic
          const copyBtn = urlItem.querySelector(".copy-btn");
          copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(copyBtn.getAttribute("data-url"));
            copyBtn.textContent = "Copied!";
            copyBtn.classList.add("copied");
            setTimeout(() => {
              copyBtn.textContent = "Copy";
              copyBtn.classList.remove("copied");
            }, 2000);
          });

          // delete button logic
          const deleteBtn = urlItem.querySelector(".delete-btn");
          deleteBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete this link?")) {
              deleteUrlFromServer(url._id, urlItem);
            }
          });
        });
      }
    } else {
      urlsList.innerHTML = `<div class="no-urls">Error: ${data.message}</div>`;
    }
  } catch (error) {
    console.error("Fetch URLs Error:", error);
    urlsList.innerHTML = '<div class="no-urls">Something went wrong.</div>';
  }
}

async function deleteUrlFromServer(urlId, element) {
  try {
    const res = await fetch(`/api/url/${urlId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (data.success) {
      showMessage(data.message, "success");
      // animated removal
      element.style.opacity = "0";
      element.style.transform = "translateX(50px)";
      setTimeout(() => {
        element.remove();
        // check if list is empty
        const urlsList = document.getElementById("urls-list");
        if (urlsList && urlsList.children.length === 0) {
          urlsList.innerHTML =
            '<div class="no-urls">You haven\'t shortened any links yet.</div>';
        }
      }, 500);
    } else {
      showMessage(data.message, "error");
    }
  } catch (error) {
    console.error("Delete URL Error:", error);
    showMessage("Failed to delete URL", "error");
  }
}

async function loginUser({ email, password }) {
  const res = await fetch("/api/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.success) {
    showMessage(data.message, "success");
    window.location.reload();
  } else {
    showMessage(data.message, "error");
  }
  const loginModal = document.querySelector(".login-modal");
  if (loginModal) loginModal.classList.remove("active");
}

async function signUpUser({ username, email, password }) {
  const res = await fetch("/api/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (data.success) {
    showMessage(data.message, "success");
    // Optionally wait a bit before reload
    setTimeout(() => window.location.reload(), 1500);
  } else {
    showMessage(data.message, "error");
  }
  const signUpModal = document.querySelector(".sign-up-modal");
  if (signUpModal) signUpModal.classList.remove("active");
}

function showMessage(message, type) {
  const customMessage = document.querySelector(".custom-message");
  const customMessageText = document.querySelector("#custom-message-text");
  if (customMessage && customMessageText) {
    customMessage.classList.remove("success", "error");
    customMessage.classList.add(type);
    customMessageText.innerHTML = message;
    customMessage.classList.add("active");
    setTimeout(() => {
      customMessage.classList.remove("active");
    }, 5000);
  }
}

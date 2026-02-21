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

  // form
  const featuresForm = document.querySelector(".features-form");
  featuresForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = featuresForm.querySelector("input").value;
    if (user) {
      if (url === "") {
        featuresForm.querySelector("input").classList.add("error");
      } else {
        createShortUrl(url);
        featuresForm.querySelector("input").value = "";
        featuresForm.querySelector("input").classList.remove("error");
      }
    } else {
      showMessage("Please login to continue", "error");
    }
  });

  // animation
  const reveal = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.5 },
  );
  reveal.forEach((el) => observer.observe(el));

  // login
  const loginbtn = document.querySelector(".login");
  const loginModal = document.querySelector(".login-modal");
  const closeLoginModal = document.querySelector(".close-login-modal");
  loginbtn.addEventListener("click", () => {
    loginModal.classList.add("active");
  });
  closeLoginModal.addEventListener("click", () => {
    loginModal.classList.remove("active");
  });

  // login form
  const loginForm = document.querySelector(".login-modal-form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm.querySelector("#login-email").value;
    const password = loginForm.querySelector("#login-password").value;
    if (email.trim() === "" || password.trim() === "") {
      console.log("error");
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

  // sign up
  const signUpbtn = document.querySelector(".sign-up");
  const signUpModal = document.querySelector(".sign-up-modal");
  const closeSignUpModal = document.querySelector(".close-sign-up-modal");
  signUpbtn.addEventListener("click", () => {
    signUpModal.classList.add("active");
  });
  closeSignUpModal.addEventListener("click", () => {
    signUpModal.classList.remove("active");
  });

  // sign up form
  const signUpForm = document.querySelector(".sign-up-modal-form");
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
      console.log("error");
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
});

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
  } else {
    showMessage(data.message, "error");
  }
  const loginModal = document.querySelector(".login-modal");
  loginModal.classList.remove("active");
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
  } else {
    showMessage(data.message, "error");
  }
  const signUpModal = document.querySelector(".sign-up-modal");
  signUpModal.classList.remove("active");
}

function showMessage(message, type) {
  const customMessage = document.querySelector(".custom-message");
  const customMessageText = document.querySelector("#custom-message-text");
  customMessage.classList.add(type);
  customMessageText.innerHTML = message;
  customMessage.classList.add("active");
  setTimeout(() => {
    customMessage.classList.remove("active");
  }, 9000);
}

async function checkAuth() {
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
  } else {
    showMessage(data.message, "error");
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

async function createShortUrl(longUrl) {
  const userId = user?._id;

  if (!userId) {
    showMessage("Please login to continue", "error");
    return;
  }

  const normalizedUrl = longUrl.endsWith("/") ? longUrl.slice(0, -1) : longUrl;

  const res = await fetch("/api/url/shorten", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ longUrl: normalizedUrl, userId }),
  });
  const data = await res.json();
  if (data.success) {
    showMessage(data.message, "success");
  } else {
    showMessage(data.message, "error");
  }
  console.log(data);
}

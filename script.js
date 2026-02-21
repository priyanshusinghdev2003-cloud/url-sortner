document.addEventListener("DOMContentLoaded", () => {
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

    if (url === "") {
      featuresForm.querySelector("input").classList.add("error");
    } else {
      featuresForm.querySelector("input").classList.remove("error");
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
});

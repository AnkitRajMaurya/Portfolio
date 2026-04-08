// Preload critical resources
function preloadResources() {
  const imagesToPreload = document.querySelectorAll("img[data-src]");
  imagesToPreload.forEach((img) => {
    img.src = img.dataset.src;
  });
}

// Initialize loading screen
function initLoadingScreen() {
  const loader = document.createElement("div");
  loader.className = "page-loader";
  loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-circle"></div>
            <p class="mono">Loading...</p>
        </div>
    `;
  document.body.appendChild(loader);

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.style.opacity = "0";
      document.body.classList.add("loaded");
      setTimeout(() => {
        loader.remove();
      }, 500);
    }, 500);
  });
}

// Initialize particles background
function initParticles() {
  // Skip or lighten on mobile / reduced-motion
  const isMobile = window.innerWidth < 768;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Ensure container exists or create it
  let particlesContainer = document.getElementById("particles-js");
  if (!particlesContainer) {
    particlesContainer = document.createElement("div");
    particlesContainer.id = "particles-js";
    document.body.appendChild(particlesContainer);
  }

  if (typeof particlesJS !== "function") return;

  if (isMobile || prefersReduced) {
    // Disable on mobile/reduced motion for performance
    particlesContainer.remove();
    return;
  }

  particlesJS("particles-js", {
    particles: {
      number: { value: 45, density: { enable: true, value_area: 900 } },
      color: { value: "#00ffd5" },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#00ffd5",
        opacity: 0.2,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.2,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
        resize: true,
      },
    },
    retina_detect: true,
  });
}

// Theme management
const ThemeManager = {
  init() {
    this.themeToggle = document.getElementById("theme-toggle");
    this.currentTheme = localStorage.getItem("theme") || "light";
    this.setTheme(this.currentTheme);
    if (this.themeToggle) {
      this.themeIcon = this.themeToggle.querySelector("i");
      this.themeIcon.className =
        this.currentTheme === "light" ? "fas fa-moon" : "fas fa-sun";
      this.bindEvents();
    }
  },

  bindEvents() {
    this.themeToggle.addEventListener("click", () => {
      this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
      this.setTheme(this.currentTheme);
    });
  },

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (this.themeIcon) {
      this.themeIcon.className =
        theme === "light" ? "fas fa-moon" : "fas fa-sun";
    }

    // Update particles colors based on theme
    if (window.pJSDom && window.pJSDom[0]) {
      const particles = window.pJSDom[0].pJS.particles;
      particles.color.value = theme === "light" ? "#2563eb" : "#60a5fa";
      particles.line_linked.color = theme === "light" ? "#2563eb" : "#60a5fa";
    }
  },
};

// Form validation and submission
const ContactForm = {
  init() {
    this.form = document.querySelector(".contact-form");
    if (this.form) {
      this.submitButton = this.form.querySelector('button[type="submit"]');
      this.defaultButtonHtml = this.submitButton?.innerHTML || "";
      this.bindEvents();
    }
  },

  bindEvents() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (this.validateForm()) {
        await this.submitForm();
      }
    });
  },

  validateForm() {
    const inputs = this.form.querySelectorAll("input, textarea");
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        this.showError(input, "This field is required");
        isValid = false;
      } else if (
        input.type === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
      ) {
        this.showError(input, "Enter a valid email address");
        isValid = false;
      } else {
        this.removeError(input);
      }
    });

    return isValid;
  },

  showError(input, message) {
    const errorDiv =
      input.parentElement.querySelector(".error-message") ||
      document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    if (!input.parentElement.querySelector(".error-message")) {
      input.parentElement.appendChild(errorDiv);
    }
    input.classList.add("error");
  },

  removeError(input) {
    const errorDiv = input.parentElement.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.remove();
    }
    input.classList.remove("error");
  },

  async submitForm() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());

    try {
      if (this.submitButton) {
        this.submitButton.disabled = true;
        this.submitButton.innerHTML =
          'Sending Message <i class="fa-solid fa-spinner fa-spin"></i>';
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        this.showSuccess();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      this.showError(this.form, "Failed to send message. Please try again.");
    } finally {
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.innerHTML = this.defaultButtonHtml;
      }
    }
  },

  showSuccess() {
    this.form.reset();
    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = "Message sent successfully!";
    this.form.appendChild(successMessage);
    setTimeout(() => successMessage.remove(), 5000);
  },
};

// Smooth scrolling with progress indicator
const ScrollManager = {
  init() {
    this.createProgressBar();
    this.bindScrollEvents();
  },

  createProgressBar() {
    if (!document.querySelector(".scroll-progress")) {
      const progressBar = document.createElement("div");
      progressBar.className = "scroll-progress";
      document.body.appendChild(progressBar);
    }
  },

  bindScrollEvents() {
    window.addEventListener(
      "scroll",
      () => {
        const winScroll =
          document.body.scrollTop || document.documentElement.scrollTop;
        const height =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const bar = document.querySelector(".scroll-progress");
        if (bar) bar.style.width = scrolled + "%";
      },
      { passive: true }
    );
  },
};

// Premium animation effects with liquid glass
const PremiumEffects = {
  init() {
    this.initParallax();
    this.initMagneticButtons();
    // Use global smooth scroll with header offset instead of duplicate
    this.initLiquidGlass();
    this.init3DDepth();
  },

  initParallax() {
    document.addEventListener("mousemove", (e) => {
      const blobs = document.querySelectorAll(".blob");
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 0.2;
        const xMove = (x - 0.5) * speed * 100;
        const yMove = (y - 0.5) * speed * 100;
        blob.style.transform = `translate(${xMove}px, ${yMove}px)`;
      });
    });
  },

  initMagneticButtons() {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0, 0)";
      });
    });
  },

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  },

  initLiquidGlass() {
    // Add liquid glass effect to glass cards
    const glassCards = document.querySelectorAll(".glass-card");
    glassCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate rotation based on mouse position
        const rotateX = (y - rect.height / 2) / 10;
        const rotateY = (rect.width / 2 - x) / 10;

        // Apply transform with perspective
        card.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    scale3d(1.05, 1.05, 1.05)
                `;

        // Add gradient highlight
        const gradient = `radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(255, 255, 255, 0.2) 0%,
                    rgba(255, 255, 255, 0.1) 20%,
                    rgba(255, 255, 255, 0) 50%
                )`;

        card.style.background = gradient;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform =
          "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
        card.style.background = "";
      });
    });
  },

  init3DDepth() {
    // Add 3D depth effect to elements with depth-effect class
    const depthElements = document.querySelectorAll(".depth-effect");
    depthElements.forEach((element) => {
      element.addEventListener("mousemove", (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate depth based on mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        element.style.transform = `
                    perspective(1000px)
                    translateZ(20px)
                    rotateX(${deltaY * 10}deg)
                    rotateY(${-deltaX * 10}deg)
                `;
      });

      element.addEventListener("mouseleave", () => {
        element.style.transform =
          "perspective(1000px) translateZ(0) rotateX(0) rotateY(0)";
      });
    });

    // Add smooth transition when elements come into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transform = "translateY(0) rotateX(0)";
            entry.target.style.opacity = "1";
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    document.querySelectorAll(".transform-on-scroll").forEach((el) => {
      observer.observe(el);
    });
  },
};

// Defer heavy effects to idle time wrapper
function runHeavyEffects() {
  PremiumEffects.init();
  ScrollManager.init();

  /* --- Scroll Reveal Animation --- */
  if (window.ScrollReveal) {
    const sr = ScrollReveal({
      distance: "60px",
      duration: 1000,
      delay: 100,
      reset: false,
    });
    sr.reveal(".hero-content", { origin: "left" });
    sr.reveal(".hero-image", { origin: "right", delay: 200 });
    sr.reveal(".about-text", { origin: "left" });
    sr.reveal(".about-image", { origin: "right", delay: 200 });
    sr.reveal(".skill-category", { origin: "bottom", interval: 100 });
    sr.reveal(".featured-project", { origin: "bottom", interval: 200 });
    sr.reveal(".contact-content", { origin: "bottom" });
  }

  /* --- GSAP Animations --- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(".hero-image", {
      yPercent: 50,
      ease: "none",
      scrollTrigger: {
        trigger: ".home",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.utils.toArray("section").forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize theme manager
  ThemeManager.init();
  ContactForm.init();

  // Defer heavy effects
  if ("requestIdleCallback" in window) {
    requestIdleCallback(runHeavyEffects, { timeout: 1500 });
  } else {
    setTimeout(runHeavyEffects, 300);
  }

  // Initialize particles with theme-aware colors
  const theme = localStorage.getItem("theme") || "light";
  initParticles(theme);

  /* --- Header Background on Scroll --- */
  const header = document.getElementById("header");
  let lastScroll = 0;

  window.addEventListener(
    "scroll",
    function () {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 50) {
        header.classList.add("header-scrolled");
        header.style.transform =
          currentScroll > lastScroll ? "translateY(-100%)" : "translateY(0)";
      } else {
        header.classList.remove("header-scrolled");
        header.style.transform = "translateY(0)";
      }
      lastScroll = currentScroll;
    },
    { passive: true }
  );

  /* --- Mobile Navigation --- */
  const navMenu = document.getElementById("nav-menu");
  const navToggle = document.getElementById("nav-toggle");
  const navClose = document.getElementById("nav-close");

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  if (navClose) {
    navClose.addEventListener("click", () => {
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  /* --- Smooth Scrolling --- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 100;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });

  /* --- Scroll Up Button --- */
  const scrollUp = document.getElementById("scroll-up");
  if (scrollUp) {
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 400) scrollUp.classList.add("show-scroll");
        else scrollUp.classList.remove("show-scroll");
      },
      { passive: true }
    );
  }

  /* --- Scroll Reveal Animation --- */
  // Moved into idle-time init

  /* --- Active Navigation Link --- */
  const sections = document.querySelectorAll("section[id]");
  function scrollActive() {
    const scrollY = window.pageYOffset;
    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute("id");
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document
          .querySelector(".nav-link[href*=" + sectionId + "]")
          ?.classList.add("active");
      } else {
        document
          .querySelector(".nav-link[href*=" + sectionId + "]")
          ?.classList.remove("active");
      }
    });
  }
  window.addEventListener("scroll", scrollActive, { passive: true });

  /* --- Custom Cursor --- */
  const cursor = document.querySelector(".custom-cursor");
  if (cursor) {
    document.addEventListener(
      "mousemove",
      (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
      },
      { passive: true }
    );
    document.addEventListener("mousedown", () =>
      cursor.classList.add("active")
    );
    document.addEventListener("mouseup", () =>
      cursor.classList.remove("active")
    );
    const clickables = document.querySelectorAll(
      "a, button, .skill-item, .nav-link"
    );
    clickables.forEach((element) => {
      element.addEventListener("mouseover", () =>
        cursor.classList.add("active")
      );
      element.addEventListener("mouseleave", () =>
        cursor.classList.remove("active")
      );
    });
  }

  /* --- Skill Level Animation --- */
  function animateSkillLevels() {
    const skillLevels = document.querySelectorAll(".skill-level");
    skillLevels.forEach((level) => {
      const percentage = level.getAttribute("data-level");
      level.style.setProperty("--level", percentage + "%");
      level.classList.add("animate");
    });
  }
  const skillsSection = document.querySelector(".skills");
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateSkillLevels();
          skillsObserver.unobserve(skillsSection);
        }
      },
      { threshold: 0.5 }
    );
    skillsObserver.observe(skillsSection);
  }

  /* --- GSAP Animations --- */
  // Moved into idle-time init

  /* --- Initial Load Animation --- */
  const content = document.querySelector("main");
  if (content) {
    content.style.opacity = "0";
    window.addEventListener("load", () => {
      content.style.transition = "opacity 0.5s ease-in-out";
      content.style.opacity = "1";
      if (window.gsap) {
        gsap.from(".hero-content > *", {
          y: 30,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
        });
        gsap.from(".hero-image", {
          x: 100,
          opacity: 0,
          duration: 1,
          delay: 0.5,
        });
      }
    });
  }
});


if (false) {
  /*
   * Disabled duplicate script block below. The page was shipping the same
   * bootstrap code twice, which caused redeclaration errors and stopped all
   * JavaScript, including the theme toggle, from running.
   */
// Initialize loading screen
function initLoadingScreen() {
  const loader = document.createElement("div");
  loader.className = "page-loader";
  loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-circle"></div>
            <p class="mono">Loading...</p>
        </div>
    `;
  document.body.appendChild(loader);

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.style.opacity = "0";
      document.body.classList.add("loaded");
      setTimeout(() => {
        loader.remove();
      }, 500);
    }, 500);
  });
}

// Initialize particles background
function initParticles() {
  // Skip or lighten on mobile / reduced-motion
  const isMobile = window.innerWidth < 768;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Ensure container exists or create it
  let particlesContainer = document.getElementById("particles-js");
  if (!particlesContainer) {
    particlesContainer = document.createElement("div");
    particlesContainer.id = "particles-js";
    document.body.appendChild(particlesContainer);
  }

  if (typeof particlesJS !== "function") return;

  if (isMobile || prefersReduced) {
    // Disable on mobile/reduced motion for performance
    particlesContainer.remove();
    return;
  }

  particlesJS("particles-js", {
    particles: {
      number: { value: 45, density: { enable: true, value_area: 900 } },
      color: { value: "#00ffd5" },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#00ffd5",
        opacity: 0.2,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.2,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
        resize: true,
      },
    },
    retina_detect: true,
  });
}

// Theme management
const ThemeManager = {
  init() {
    this.themeToggle = document.getElementById("theme-toggle");
    this.currentTheme = localStorage.getItem("theme") || "light";
    this.setTheme(this.currentTheme);
    if (this.themeToggle) {
      this.themeIcon = this.themeToggle.querySelector("i");
      this.themeIcon.className =
        this.currentTheme === "light" ? "fas fa-moon" : "fas fa-sun";
      this.bindEvents();
    }
  },

  bindEvents() {
    this.themeToggle.addEventListener("click", () => {
      this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
      this.setTheme(this.currentTheme);
    });
  },

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (this.themeIcon) {
      this.themeIcon.className =
        theme === "light" ? "fas fa-moon" : "fas fa-sun";
    }

    // Update particles colors based on theme
    if (window.pJSDom && window.pJSDom[0]) {
      const particles = window.pJSDom[0].pJS.particles;
      particles.color.value = theme === "light" ? "#2563eb" : "#60a5fa";
      particles.line_linked.color = theme === "light" ? "#2563eb" : "#60a5fa";
    }
  },
};

// Form validation and submission
const ContactForm = {
  init() {
    this.form = document.querySelector(".contact-form");
    if (this.form) {
      this.bindEvents();
    }
  },

  bindEvents() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (this.validateForm()) {
        await this.submitForm();
      }
    });
  },

  validateForm() {
    const inputs = this.form.querySelectorAll("input, textarea");
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        this.showError(input, "This field is required");
        isValid = false;
      } else {
        this.removeError(input);
      }
    });

    return isValid;
  },

  showError(input, message) {
    const errorDiv =
      input.parentElement.querySelector(".error-message") ||
      document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    if (!input.parentElement.querySelector(".error-message")) {
      input.parentElement.appendChild(errorDiv);
    }
    input.classList.add("error");
  },

  removeError(input) {
    const errorDiv = input.parentElement.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.remove();
    }
    input.classList.remove("error");
  },

  async submitForm() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        this.showSuccess();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      this.showError(this.form, "Failed to send message. Please try again.");
    }
  },

  showSuccess() {
    this.form.reset();
    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = "Message sent successfully!";
    this.form.appendChild(successMessage);
    setTimeout(() => successMessage.remove(), 5000);
  },
};

// Smooth scrolling with progress indicator
const ScrollManager = {
  init() {
    this.createProgressBar();
    this.bindScrollEvents();
  },

  createProgressBar() {
    if (!document.querySelector(".scroll-progress")) {
      const progressBar = document.createElement("div");
      progressBar.className = "scroll-progress";
      document.body.appendChild(progressBar);
    }
  },

  bindScrollEvents() {
    window.addEventListener(
      "scroll",
      () => {
        const winScroll =
          document.body.scrollTop || document.documentElement.scrollTop;
        const height =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const bar = document.querySelector(".scroll-progress");
        if (bar) bar.style.width = scrolled + "%";
      },
      { passive: true }
    );
  },
};

// Premium animation effects with liquid glass
const PremiumEffects = {
  init() {
    this.initParallax();
    this.initMagneticButtons();
    // Use global smooth scroll with header offset instead of duplicate
    this.initLiquidGlass();
    this.init3DDepth();
  },

  initParallax() {
    document.addEventListener("mousemove", (e) => {
      const blobs = document.querySelectorAll(".blob");
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 0.2;
        const xMove = (x - 0.5) * speed * 100;
        const yMove = (y - 0.5) * speed * 100;
        blob.style.transform = `translate(${xMove}px, ${yMove}px)`;
      });
    });
  },

  initMagneticButtons() {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0, 0)";
      });
    });
  },

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  },

  initLiquidGlass() {
    // Add liquid glass effect to glass cards
    const glassCards = document.querySelectorAll(".glass-card");
    glassCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate rotation based on mouse position
        const rotateX = (y - rect.height / 2) / 10;
        const rotateY = (rect.width / 2 - x) / 10;

        // Apply transform with perspective
        card.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    scale3d(1.05, 1.05, 1.05)
                `;

        // Add gradient highlight
        const gradient = `radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(255, 255, 255, 0.2) 0%,
                    rgba(255, 255, 255, 0.1) 20%,
                    rgba(255, 255, 255, 0) 50%
                )`;

        card.style.background = gradient;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform =
          "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
        card.style.background = "";
      });
    });
  },

  init3DDepth() {
    // Add 3D depth effect to elements with depth-effect class
    const depthElements = document.querySelectorAll(".depth-effect");
    depthElements.forEach((element) => {
      element.addEventListener("mousemove", (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate depth based on mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        element.style.transform = `
                    perspective(1000px)
                    translateZ(20px)
                    rotateX(${deltaY * 10}deg)
                    rotateY(${-deltaX * 10}deg)
                `;
      });

      element.addEventListener("mouseleave", () => {
        element.style.transform =
          "perspective(1000px) translateZ(0) rotateX(0) rotateY(0)";
      });
    });

    // Add smooth transition when elements come into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transform = "translateY(0) rotateX(0)";
            entry.target.style.opacity = "1";
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    document.querySelectorAll(".transform-on-scroll").forEach((el) => {
      observer.observe(el);
    });
  },
};

// Defer heavy effects to idle time wrapper
function runHeavyEffects() {
  PremiumEffects.init();
  ScrollManager.init();

  /* --- Scroll Reveal Animation --- */
  if (window.ScrollReveal) {
    const sr = ScrollReveal({
      distance: "60px",
      duration: 1000,
      delay: 100,
      reset: false,
    });
    sr.reveal(".hero-content", { origin: "left" });
    sr.reveal(".hero-image", { origin: "right", delay: 200 });
    sr.reveal(".about-text", { origin: "left" });
    sr.reveal(".about-image", { origin: "right", delay: 200 });
    sr.reveal(".skill-category", { origin: "bottom", interval: 100 });
    sr.reveal(".featured-project", { origin: "bottom", interval: 200 });
    sr.reveal(".contact-content", { origin: "bottom" });
  }

  /* --- GSAP Animations --- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(".hero-image", {
      yPercent: 50,
      ease: "none",
      scrollTrigger: {
        trigger: ".home",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.utils.toArray("section").forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize theme manager
  ThemeManager.init();

  // Defer heavy effects
  if ("requestIdleCallback" in window) {
    requestIdleCallback(runHeavyEffects, { timeout: 1500 });
  } else {
    setTimeout(runHeavyEffects, 300);
  }

  // Initialize particles with theme-aware colors
  const theme = localStorage.getItem("theme") || "light";
  initParticles(theme);

  /* --- Header Background on Scroll --- */
  const header = document.getElementById("header");
  let lastScroll = 0;

  window.addEventListener(
    "scroll",
    function () {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 50) {
        header.classList.add("header-scrolled");
        header.style.transform =
          currentScroll > lastScroll ? "translateY(-100%)" : "translateY(0)";
      } else {
        header.classList.remove("header-scrolled");
        header.style.transform = "translateY(0)";
      }
      lastScroll = currentScroll;
    },
    { passive: true }
  );

  /* --- Mobile Navigation --- */
  const navMenu = document.getElementById("nav-menu");
  const navToggle = document.getElementById("nav-toggle");
  const navClose = document.getElementById("nav-close");

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  if (navClose) {
    navClose.addEventListener("click", () => {
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  /* --- Smooth Scrolling --- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 100;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });

  /* --- Scroll Up Button --- */
  const scrollUp = document.getElementById("scroll-up");
  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY > 400) scrollUp.classList.add("show-scroll");
      else scrollUp.classList.remove("show-scroll");
    },
    { passive: true }
  );

  /* --- Scroll Reveal Animation --- */
  // Moved into idle-time init

  /* --- Active Navigation Link --- */
  const sections = document.querySelectorAll("section[id]");
  function scrollActive() {
    const scrollY = window.pageYOffset;
    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute("id");
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document
          .querySelector(".nav-link[href*=" + sectionId + "]")
          ?.classList.add("active");
      } else {
        document
          .querySelector(".nav-link[href*=" + sectionId + "]")
          ?.classList.remove("active");
      }
    });
  }
  window.addEventListener("scroll", scrollActive, { passive: true });

  /* --- Custom Cursor --- */
  const cursor = document.querySelector(".custom-cursor");
  if (cursor) {
    document.addEventListener(
      "mousemove",
      (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
      },
      { passive: true }
    );
    document.addEventListener("mousedown", () =>
      cursor.classList.add("active")
    );
    document.addEventListener("mouseup", () =>
      cursor.classList.remove("active")
    );
    const clickables = document.querySelectorAll(
      "a, button, .skill-item, .nav-link"
    );
    clickables.forEach((element) => {
      element.addEventListener("mouseover", () =>
        cursor.classList.add("active")
      );
      element.addEventListener("mouseleave", () =>
        cursor.classList.remove("active")
      );
    });
  }

  /* --- Skill Level Animation --- */
  function animateSkillLevels() {
    const skillLevels = document.querySelectorAll(".skill-level");
    skillLevels.forEach((level) => {
      const percentage = level.getAttribute("data-level");
      level.style.setProperty("--level", percentage + "%");
      level.classList.add("animate");
    });
  }
  const skillsSection = document.querySelector(".skills");
  const skillsObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animateSkillLevels();
        skillsObserver.unobserve(skillsSection);
      }
    },
    { threshold: 0.5 }
  );
  skillsObserver.observe(skillsSection);

  /* --- GSAP Animations --- */
  // Moved into idle-time init

  /* --- Initial Load Animation --- */
  const content = document.querySelector("main");
  content.style.opacity = "0";
  window.addEventListener("load", () => {
    content.style.transition = "opacity 0.5s ease-in-out";
    content.style.opacity = "1";
    if (window.gsap) {
      gsap.from(".hero-content > *", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
      });
      gsap.from(".hero-image", { x: 100, opacity: 0, duration: 1, delay: 0.5 });
    }
  });
});
}

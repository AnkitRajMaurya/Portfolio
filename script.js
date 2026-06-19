// Utility script loader for dynamic script deferral
function loadScript(url, callback) {
  const script = document.createElement("script");
  script.src = url;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
}

const PHONE_BREAKPOINT = 768;

function isPhoneViewport() {
  return window.innerWidth <= PHONE_BREAKPOINT;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function shouldUseLiteExperience() {
  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection && connection.saveData);
  const slowConnection = Boolean(
    connection && /(^|-)2g$|(^|-)3g$/.test(connection.effectiveType || "")
  );

  return isPhoneViewport() || prefersReducedMotion() || saveData || slowConnection;
}

// Preload critical resources
function preloadResources() {
  const imagesToPreload = document.querySelectorAll("img[data-src]");
  imagesToPreload.forEach((img) => {
    img.src = img.dataset.src;
  });
}

// Initialize loading screen
function initLoadingScreen() {
  if (shouldUseLiteExperience()) {
    document.body.classList.add("loaded");
    return;
  }

  const loader = document.createElement("div");
  loader.className = "page-loader";
  loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-circle"></div>
            <p class="mono">Loading...</p>
        </div>
    `;
  document.body.appendChild(loader);

  const hideLoader = () => {
    if (loader.style.opacity === "0") return;
    loader.style.opacity = "0";
    document.body.classList.add("loaded");
    setTimeout(() => {
      loader.remove();
    }, 500);
  };

  // Dismiss loader on window load OR after a fallback timeout (1.5 seconds)
  // to ensure immediate usability on slow mobile connections.
  if (document.readyState === "complete") {
    setTimeout(hideLoader, 200);
  } else {
    window.addEventListener("load", () => {
      setTimeout(hideLoader, 200);
    });
  }
  
  // Safe fallback to prevent loader getting stuck on slow networks
  setTimeout(hideLoader, 1500);
}

// Initialize particles background
function initParticles() {
  let particlesContainer = document.getElementById("particles-js");

  if (shouldUseLiteExperience()) {
    // Disable on mobile or reduced motion for performance
    if (particlesContainer) particlesContainer.remove();
    return;
  }

  if (!particlesContainer) {
    particlesContainer = document.createElement("div");
    particlesContainer.id = "particles-js";
    document.body.appendChild(particlesContainer);
  }

  // Load particles.js dynamically only on desktop
  loadScript("https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js", () => {
    if (typeof particlesJS === "function") {
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
    if (window.pJSDom && window.pJSDom.length > 0 && window.pJSDom[0].pJS) {
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
    const endpoint = (this.form.dataset.endpoint || "").trim();

    try {
      if (this.submitButton) {
        this.submitButton.disabled = true;
        this.submitButton.innerHTML =
          'Sending Message <i class="fa-solid fa-spinner fa-spin"></i>';
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.error || "Failed to send message");
        }

        this.showSuccess("Message sent successfully! I'll get back to you soon.");
      } else {
        this.openMailClient(data);
        this.showSuccess("Email draft opened. Please click send in your mail app.");
      }
    } catch (error) {
      this.showError(this.form, error.message || "Failed to send message. Please try again.");
    } finally {
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.innerHTML = this.defaultButtonHtml;
      }
    }
  },

  openMailClient(data) {
    const name = (data.name || "").trim();
    const email = (data.email || "").trim();
    const message = (data.message || "").trim();
    const subject = encodeURIComponent(`Portfolio Inquiry from ${name || "Visitor"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:ankit5242raj1@outlook.com?subject=${subject}&body=${body}`;
  },

  showSuccess(messageText = "Message sent successfully!") {
    this.form.reset();
    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = messageText;
    this.form.appendChild(successMessage);
    setTimeout(() => successMessage.remove(), 5000);
  },
};

// Smooth scrolling with progress indicator
const ScrollManager = {
  init() {
    this.progressBar = document.querySelector(".scroll-progress");
    this.header = document.getElementById("header");
    this.scrollUp = document.getElementById("scroll-up");
    this.sections = Array.from(document.querySelectorAll("section[id]"));
    this.isPhone = isPhoneViewport();
    this.lastScroll = window.pageYOffset;
    this.ticking = false;
    this.createProgressBar();
    this.bindScrollEvents();
    this.update();
  },

  createProgressBar() {
    if (!document.querySelector(".scroll-progress")) {
      const progressBar = document.createElement("div");
      progressBar.className = "scroll-progress";
      document.body.appendChild(progressBar);
    }
  },

  bindScrollEvents() {
    window.addEventListener("scroll", () => {
      if (this.ticking) return;

      this.ticking = true;
      requestAnimationFrame(() => {
        this.update();
        this.ticking = false;
      });
    }, { passive: true });
  },

  update() {
    const currentScroll = window.pageYOffset;

    if (this.progressBar && !this.isPhone) {
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = height > 0 ? currentScroll / height : 0;
      this.progressBar.style.transform = `scaleX(${Math.min(Math.max(scrolled, 0), 1)})`;
    }

    if (this.header) {
      if (currentScroll > 50) {
        this.header.classList.add("header-scrolled");
        this.header.style.transform =
          !this.isPhone && currentScroll > this.lastScroll && currentScroll > 200
            ? "translateY(-100%)"
            : "translateY(0)";
      } else {
        this.header.classList.remove("header-scrolled");
        this.header.style.transform = "translateY(0)";
      }
    }

    if (this.scrollUp) {
      this.scrollUp.classList.toggle("show-scroll", currentScroll > 400);
    }

    if (!this.isPhone) {
      this.updateActiveLink(currentScroll);
    }

    this.lastScroll = currentScroll;
  },

  updateActiveLink(currentScroll) {
    this.sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute("id");
      const link = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (!link) return;

      if (currentScroll > sectionTop && currentScroll <= sectionTop + sectionHeight) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  },
};

// Premium animation effects with liquid glass
const PremiumEffects = {
  init() {
    if (window.innerWidth < 768) return; // Disable heavy effects on mobile
    this.initParallax();
    this.initMagneticButtons();
    // Use global smooth scroll with header offset instead of duplicate
  },

  initParallax() {
    const blobs = document.querySelectorAll(".blob");
    if (!blobs.length) return;
    document.addEventListener("mousemove", (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 0.25;
        const xMove = (x - 0.5) * speed * 80;
        const yMove = (y - 0.5) * speed * 80;
        blob.style.transform = `translate3d(${xMove}px, ${yMove}px, 0)`;
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

};

// Defer heavy effects to idle time wrapper
function runHeavyEffects() {
  if (shouldUseLiteExperience()) {
    // On mobile, completely skip loading heavy script animation layers to maximize FCP, TBT and scroll smoothness
    return;
  }

  PremiumEffects.init();

  /* --- Dynamic Script Loading and Animation Initialization --- */
  
  // Load ScrollReveal dynamically
  loadScript("https://unpkg.com/scrollreveal", () => {
    if (window.ScrollReveal) {
      const sr = ScrollReveal({
        distance: "60px",
        duration: 1000,
        delay: 100,
        reset: false,
      });
      sr.reveal(".about-text", { origin: "left" });
      sr.reveal(".about-image", { origin: "right", delay: 200 });
      sr.reveal(".skill-group", { origin: "bottom", interval: 100 });
      sr.reveal(".featured-project", { origin: "bottom", interval: 200 });
      sr.reveal(".contact-content", { origin: "bottom" });
    }
  });

  // Load GSAP & ScrollTrigger dynamically
  loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js", () => {
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js", () => {
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
    });
  });
}

/**
 * Fetch ALL projects from /api/projects and render dynamic cards.
 * Uses Cloudinary image_url when available, otherwise shows a themed placeholder.
 */
async function fetchAndRenderProjects() {
  const showcase = document.getElementById("projects-showcase");
  if (!showcase) return;

  const showError = (msg) => {
    showcase.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-alt); grid-column: 1 / -1; border: 1px dashed var(--surface-outline); border-radius: 12px;">
        <i class="fa-solid fa-triangle-exclamation fa-2x" style="color: var(--primary-color); margin-bottom: 1rem; opacity: 0.7;"></i>
        <p class="mono">${msg}</p>
      </div>
    `;
  };

  try {
    const res = await fetch("/api/projects");
    if (!res.ok) {
      showError("Failed to load projects. Please try again later.");
      return;
    }
    const projects = await res.json();
    if (!projects.length) {
      showError("No projects found in the database.");
      return;
    }

    // Icon set used for placeholder when no image
    const defaultIcons = [
      "fa-solid fa-rocket",
      "fa-solid fa-globe",
      "fa-solid fa-code",
      "fa-solid fa-laptop-code",
      "fa-solid fa-cubes",
      "fa-solid fa-bolt",
    ];

    // Build all cards
    const fragment = document.createDocumentFragment();

    projects.forEach((p, idx) => {
      const article = document.createElement("article");
      article.className = "project-card";

      // — Preview section (image or placeholder) —
      const previewUrl = p.demo_url || p.github_url || "#";
      const previewLink = document.createElement("a");
      previewLink.href = previewUrl;
      if (previewUrl !== "#") {
        previewLink.target = "_blank";
        previewLink.rel = "noopener noreferrer";
      }
      previewLink.className = "project-preview-link";
      previewLink.setAttribute("aria-label", `Open ${p.title} project`);

      const placeholder = document.createElement("div");
      placeholder.className = "project-preview-placeholder";

      if (p.image_url) {
        // Cloudinary image available
        const img = document.createElement("img");
        img.src = p.image_url;
        img.alt = `${p.title} screenshot`;
        img.loading = "lazy";
        img.decoding = "async";
        img.className = "project-preview-img";
        img.onerror = () => {
          // On error, restore placeholder
          placeholder.classList.remove("has-image");
          placeholder.innerHTML = `
            <div class="preview-icon"><i class="${defaultIcons[idx % defaultIcons.length]}"></i></div>
            <p class="mono">${escapeHTML(p.description ? p.description.slice(0, 60) : p.title)}</p>
            ${p.badge ? `<span class="project-card__badge"><i class="fa-solid fa-circle" style="font-size:.45rem;color:#34d399"></i> ${escapeHTML(p.badge)}</span>` : ""}
          `;
        };
        placeholder.appendChild(img);
        placeholder.classList.add("has-image");
      } else {
        // No image — themed placeholder
        placeholder.innerHTML = `
          <div class="preview-icon"><i class="${defaultIcons[idx % defaultIcons.length]}"></i></div>
          <p class="mono">${escapeHTML(p.description ? p.description.slice(0, 60) : p.title)}</p>
          ${p.badge ? `<span class="project-card__badge"><i class="fa-solid fa-circle" style="font-size:.45rem;color:#34d399"></i> ${escapeHTML(p.badge)}</span>` : ""}
        `;
      }

      previewLink.appendChild(placeholder);
      article.appendChild(previewLink);

      // — Body section —
      const body = document.createElement("div");
      body.className = "project-card__body";

      // Title
      const title = document.createElement("h3");
      title.className = "project-card__title";
      title.textContent = p.title;
      body.appendChild(title);

      // Description
      if (p.description) {
        const desc = document.createElement("p");
        desc.className = "project-card__desc";
        desc.textContent = p.description;
        body.appendChild(desc);
      }

      // Tech tags
      const tags = Array.isArray(p.tech_tags) ? p.tech_tags : [];
      if (tags.length) {
        const techDiv = document.createElement("div");
        techDiv.className = "project-card__tech";
        tags.forEach((t) => {
          const span = document.createElement("span");
          span.innerHTML = `<i class="fa-solid fa-code"></i> ${escapeHTML(t)}`;
          techDiv.appendChild(span);
        });
        body.appendChild(techDiv);
      }

      // Actions (GitHub + Demo)
      const actions = document.createElement("div");
      actions.className = "project-card__actions";

      if (p.github_url) {
        const ghBtn = document.createElement("a");
        ghBtn.href = p.github_url;
        ghBtn.target = "_blank";
        ghBtn.rel = "noopener noreferrer";
        ghBtn.className = "project-card__btn project-card__btn--ghost";
        ghBtn.innerHTML = '<i class="fa-brands fa-github"></i> Source';
        actions.appendChild(ghBtn);
      }

      if (p.demo_url) {
        const demoBtn = document.createElement("a");
        demoBtn.href = p.demo_url;
        demoBtn.target = "_blank";
        demoBtn.rel = "noopener noreferrer";
        demoBtn.className = "project-card__btn project-card__btn--primary";
        demoBtn.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Visit Site';
        actions.appendChild(demoBtn);
      }

      body.appendChild(actions);
      article.appendChild(body);
      fragment.appendChild(article);
    });

    // Replace static loading state with dynamic cards
    showcase.innerHTML = "";
    showcase.appendChild(fragment);
  } catch (e) {
    console.error("Error fetching projects:", e);
    const showcase = document.getElementById("projects-showcase");
    if (showcase) {
      showcase.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-alt); grid-column: 1 / -1; border: 1px dashed var(--surface-outline); border-radius: 12px;">
          <i class="fa-solid fa-triangle-exclamation fa-2x" style="color: var(--primary-color); margin-bottom: 1rem; opacity: 0.7;"></i>
          <p class="mono">Failed to load projects. Please try again later.</p>
        </div>
      `;
    }
  }
}

function initDeferredProjects() {
  const showcase = document.getElementById("projects-showcase");
  if (!showcase) return;

  let hasLoadedProjects = false;
  const loadProjects = () => {
    if (hasLoadedProjects) return;
    hasLoadedProjects = true;
    fetchAndRenderProjects();
  };

  if (window.location.hash === "#projects") {
    loadProjects();
    return;
  }

  if (!("IntersectionObserver" in window)) {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadProjects, { timeout: 1500 });
    } else {
      setTimeout(loadProjects, 400);
    }
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        loadProjects();
      }
    },
    {
      rootMargin: isPhoneViewport() ? "220px 0px" : "380px 0px",
    }
  );

  observer.observe(showcase);
}

/** Escape HTML to prevent XSS in dynamic content */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str || ""));
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", function () {
  initLoadingScreen();
  preloadResources();

  ScrollManager.init();
  initDeferredProjects();

  // Initialize theme manager
  ThemeManager.init();
  ContactForm.init();

  // Defer heavy effects
  if ("requestIdleCallback" in window) {
    requestIdleCallback(runHeavyEffects, { timeout: 1500 });
  } else {
    setTimeout(runHeavyEffects, 300);
  }

  initParticles();

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

  /* --- Custom Cursor (Hardware Accelerated via CSS Variables) --- */
  const cursor = document.querySelector(".custom-cursor");
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

  if (cursor && !hasFinePointer) {
    // Touch devices (phones/tablets) don't have mouse cursors, so remove it to save DOM footprint & layout calculation cost
    cursor.remove();
  } else if (cursor) {
    document.addEventListener(
      "mousemove",
      (e) => {
        cursor.style.setProperty("--cursor-x", `${e.clientX - 10}px`);
        cursor.style.setProperty("--cursor-y", `${e.clientY - 10}px`);
      },
      { passive: true }
    );
    document.addEventListener("mousedown", () =>
      cursor.classList.add("active")
    );
    document.addEventListener("mouseup", () =>
      cursor.classList.remove("active")
    );
    
    // Premium Event Delegation for hovers (handles static and dynamically fetched cards)
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, .nav-link, .tech-skill-item, .project-card")) {
        cursor.classList.add("active");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, .nav-link, .tech-skill-item, .project-card")) {
        cursor.classList.remove("active");
      }
    });
  }


  /* --- GSAP Animations --- */
  // Moved into idle-time init

  /* --- Initial Load Fade-in --- */
  const content = document.querySelector("main");
  if (content) {
    if (shouldUseLiteExperience()) {
      content.style.opacity = "1";
    } else {
      content.style.opacity = "0";
    }
    
    const showContent = () => {
      content.style.transition = "opacity 0.5s ease-in-out";
      content.style.opacity = "1";
    };

    if (shouldUseLiteExperience()) {
      showContent();
    } else if (document.readyState === "complete") {
      showContent();
    } else {
      window.addEventListener("load", showContent);
    }
  }

  /* --- Visitor Geotracking Analytics --- */
  async function trackVisit() {
    try {
      const payload = JSON.stringify({
        page_path: window.location.pathname,
        referer: document.referrer || 'Direct'
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/track', blob);
        return;
      }

      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
    } catch (e) {
      console.warn('Analytics ping aborted', e);
    }
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(trackVisit, { timeout: 2500 });
  } else {
    setTimeout(trackVisit, shouldUseLiteExperience() ? 1200 : 300);
  }
});

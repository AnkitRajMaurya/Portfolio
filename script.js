/**
 * ANKIT RAJ MAURYA — PORTFOLIO JAVASCRIPT
 * Full-fidelity interactions, WebGL shader background, 3D tilt, bento spotlight,
 * timeline fill, sticky stacking cards, interactive canvas portrait.
 */

document.addEventListener("DOMContentLoaded", () => {
  initBackgroundShader();
  initPortraitCanvas();
  initNavigation();
  initScrollEffects();
  initStackTabsAndSpotlight();
  initCertTilt();
  initMagneticButton();
  initCopyEmail();
  initContactForm();
  initDynamicContent();
  initAnalyticsTracking();
});

/* ── 1. WebGL Procedural Background Shader (#gl) ───────────────────────── */
function initBackgroundShader() {
  const c = document.getElementById("gl");
  if (!c) return;

  const gl = c.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return;

  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function sh(t, s) {
    const o = gl.createShader(t);
    gl.shaderSource(o, s);
    gl.compileShader(o);
    return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null;
  }

  const vs = sh(
    gl.VERTEX_SHADER,
    "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}"
  );

  const fs = sh(
    gl.FRAGMENT_SHADER,
    "precision mediump float;uniform vec2 r,m;uniform float t;" +
      "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}" +
      "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}" +
      "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}" +
      "void main(){vec2 u=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;vec2 mp=(m-.5)*vec2(r.x/r.y,1.);" +
      "vec2 q=vec2(fbm(p*2.+t*.06),fbm(p*2.+vec2(5.2,1.3)-t*.05));" +
      "float f=fbm(p*2.2+q*2.4+mp*.5+t*.03);float d=length(p-mp);" +
      "vec3 col=mix(vec3(.043,.039,.035),vec3(1.,.36,.12),smoothstep(.5,1.,f)*.5);" +
      "col+=vec3(1.,.42,.15)*.1/(d*2.8+.35);col*=mix(.55,1.,u.y*.6+.4);gl_FragColor=vec4(col,1.);}"
  );

  if (!vs || !fs) return;

  const pr = gl.createProgram();
  gl.attachShader(pr, vs);
  gl.attachShader(pr, fs);
  gl.linkProgram(pr);
  gl.useProgram(pr);

  const bf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );

  const al = gl.getAttribLocation(pr, "a");
  gl.enableVertexAttribArray(al);
  gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);

  const ur = gl.getUniformLocation(pr, "r");
  const um = gl.getUniformLocation(pr, "m");
  const ut = gl.getUniformLocation(pr, "t");

  function size() {
    c.width = Math.max(2, Math.floor(window.innerWidth * 0.5));
    c.height = Math.max(2, Math.floor(window.innerHeight * 0.5));
    gl.viewport(0, 0, c.width, c.height);
  }
  size();
  window.addEventListener("resize", size);

  let mx = 0.5,
    my = 0.5,
    tx = 0.5,
    ty = 0.5;
  const t0 = performance.now();

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX / window.innerWidth;
    ty = 1 - e.clientY / window.innerHeight;
  });

  function draw(now) {
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;
    gl.uniform2f(ur, c.width, c.height);
    gl.uniform2f(um, mx, my);
    gl.uniform1f(ut, (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop(now) {
    if (!document.hidden) draw(now);
    requestAnimationFrame(loop);
  }

  if (still) {
    draw(t0 + 4000);
  } else {
    requestAnimationFrame(loop);
  }
}

/* ── 2. Interactive Portrait Canvas (Hero Halftone / Particle Light) ────── */
function initPortraitCanvas() {
  const canvas = document.getElementById("portrait-canvas");
  const card = document.getElementById("portrait-card");
  if (!canvas || !card) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  let mouseX = 0.5,
    mouseY = 0.3;
  let targetMouseX = 0.5,
    targetMouseY = 0.3;

  function resizeCanvas() {
    const rect = card.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    initParticles();
  }

  function initParticles() {
    particles = [];
    const spacing = 18;
    const cols = Math.floor(width / spacing);
    const rows = Math.floor(height / spacing);

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * spacing + spacing / 2;
        const y = r * spacing + spacing / 2;
        const distFromCenter =
          Math.hypot(x - width / 2, y - height / 2) / (width / 2);
        if (Math.random() > 0.4 || distFromCenter > 0.6) {
          particles.push({
            x,
            y,
            baseX: x,
            baseY: y,
            radius: 1.2 + Math.random() * 1.4,
            alpha: 0.15 + Math.random() * 0.35,
            phase: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.02,
          });
        }
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;

    const focalX = mouseX * width;
    const focalY = mouseY * height;

    particles.forEach((p) => {
      p.phase += p.speed;
      const pulse = Math.sin(p.phase) * 0.4;
      const dx = p.baseX - focalX;
      const dy = p.baseY - focalY;
      const dist = Math.hypot(dx, dy);
      const influenceRadius = 140;

      let offsetX = 0;
      let offsetY = 0;
      let extraAlpha = 0;

      if (dist < influenceRadius) {
        const factor = 1 - dist / influenceRadius;
        offsetX = (dx / dist) * factor * 12;
        offsetY = (dy / dist) * factor * 12;
        extraAlpha = factor * 0.5;
      }

      p.x = p.baseX + offsetX;
      p.y = p.baseY + offsetY;

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.6, p.radius + pulse), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 107, 44, ${Math.min(
        0.9,
        p.alpha + extraAlpha
      )})`;
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    targetMouseX = (e.clientX - rect.left) / rect.width;
    targetMouseY = (e.clientY - rect.top) / rect.height;
  });

  card.addEventListener("mouseleave", () => {
    targetMouseX = 0.5;
    targetMouseY = 0.3;
  });

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  render();
}

/* ── 3. Navigation, Scroll Progress & Section Spy ──────────────────────── */
function initNavigation() {
  const nav = document.getElementById("main-nav");
  const navWrapper = document.querySelector(".floating-nav-wrapper");
  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");

  let lastY = window.scrollY;

  const handleScroll = () => {
    const currentY = window.scrollY;

    if (nav) {
      if (currentY > 40) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }

    if (navWrapper && (!navMenu || !navMenu.classList.contains("open"))) {
      if (currentY > 100 && currentY > lastY + 8) {
        navWrapper.classList.add("is-hidden");
      } else if (currentY < lastY - 8 || currentY <= 50) {
        navWrapper.classList.remove("is-hidden");
      }
    }

    lastY = currentY;
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }
}

function initScrollEffects() {
  const pg = document.getElementById("pg") || document.getElementById("prog");
  const tls = Array.from(document.querySelectorAll(".tl"));
  const reveals = Array.from(document.querySelectorAll(".rv"));
  const navLinks = Array.from(document.querySelectorAll("[data-s], .nav-item"));
  const sections = Array.from(document.querySelectorAll("main section[id], section[id]"));

  // 1. Immediately reveal elements already in view
  reveals.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 1.15) {
      el.classList.add("in");
      el.classList.add("vis");
    }
  });

  // 2. Reveal on scroll
  if ("IntersectionObserver" in window) {
    const ro = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            e.target.classList.add("vis");
            ro.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );
    reveals.forEach((el) => ro.observe(el));

    // 2. Active section spy
    const so = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const secId = e.target.id;
            navLinks.forEach((a) => {
              const matches =
                a.dataset.s === secId || a.getAttribute("href") === "#" + secId;
              if (matches) {
                a.setAttribute("aria-current", "true");
                a.classList.add("active");
              } else {
                a.removeAttribute("aria-current");
                a.classList.remove("active");
              }
            });
          }
        });
      },
      { rootMargin: "-30% 0px -50% 0px" }
    );
    sections.forEach((s) => so.observe(s));
  } else {
    reveals.forEach((el) => {
      el.classList.add("in");
      el.classList.add("vis");
    });
  }

  // 3. Scroll update (top progress bar + timeline line fill)
  let tick = false;
  function upd() {
    tick = false;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const progress = h > 0 ? window.scrollY / h : 0;

    if (pg) {
      pg.style.transform = `scaleX(${progress})`;
      if (pg.id === "prog") {
        pg.style.width = `${progress * 100}%`;
      }
    }

    tls.forEach((t) => {
      const r = t.getBoundingClientRect();
      const p = (window.innerHeight * 0.7 - r.top) / r.height;
      const clamped = Math.max(0, Math.min(1, p));
      t.style.setProperty("--p", clamped);

      // Milestone dots activate
      const items = t.querySelectorAll("li");
      items.forEach((li) => {
        const lr = li.getBoundingClientRect();
        if (lr.top < window.innerHeight * 0.75) {
          li.classList.add("in");
          li.classList.add("vis");
        }
      });
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!tick) {
        tick = true;
        requestAnimationFrame(upd);
      }
    },
    { passive: true }
  );
  upd();
}

/* ── 4. Tech Stack Tabs & Bento Spotlight ──────────────────────────────── */
function initStackTabsAndSpotlight() {
  const tabs = Array.from(document.querySelectorAll("[role=tab]"));
  if (tabs.length === 0) return;

  function sel(i) {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      const targetId = t.getAttribute("aria-controls");
      const panel = document.getElementById(targetId);
      if (panel) {
        panel.hidden = !on;
      }
    });
    if (tabs[i]) tabs[i].focus();
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => sel(i));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") sel((i + 1) % tabs.length);
      if (e.key === "ArrowLeft") sel((i + tabs.length - 1) % tabs.length);
    });
  });

  // Cursor radial spotlight on .tk cards
  const cards = document.querySelectorAll(".tk");
  cards.forEach((t) => {
    t.addEventListener("mousemove", (e) => {
      const r = t.getBoundingClientRect();
      t.style.setProperty("--x", e.clientX - r.left + "px");
      t.style.setProperty("--y", e.clientY - r.top + "px");
    });
  });
}

/* ── 5. Awards 3D Certificate Tilt & Sheen ─────────────────────────────── */
function initCertTilt() {
  const cd = document.getElementById("cd");
  if (!cd) return;

  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) return;

  const parent = cd.parentNode;
  if (!parent) return;

  parent.addEventListener("mousemove", (e) => {
    const r = cd.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cd.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
    cd.style.setProperty("--sx", `${x * 120}%`);
  });

  parent.addEventListener("mouseleave", () => {
    cd.style.transform = "";
    cd.style.setProperty("--sx", "-30%");
  });
}

/* ── 6. Magnetic Contact Button (.mg) ──────────────────────────────────── */
function initMagneticButton() {
  const mg = document.querySelector(".mg");
  if (!mg) return;

  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) return;

  mg.addEventListener("mousemove", (e) => {
    const r = mg.getBoundingClientRect();
    const dx = e.clientX - r.left - r.width / 2;
    const dy = e.clientY - r.top - r.height / 2;
    mg.style.transform = `translate(${dx * 0.2}px, ${dy * 0.3}px)`;
  });

  mg.addEventListener("mouseleave", () => {
    mg.style.transform = "";
  });
}

/* ── 7. Copy Email with Toast Feedback ─────────────────────────────────── */
function initCopyEmail() {
  const cp = document.getElementById("cp");
  if (!cp) return;

  cp.addEventListener("click", function () {
    const b = this;
    const email = "ankit5242raj1@outlook.com";

    function ok() {
      b.textContent = "Copied";
      setTimeout(() => {
        b.textContent = "Copy email";
      }, 1800);
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(ok, () => {
        b.textContent = "Select email to copy";
      });
    } else {
      b.textContent = "Select email to copy";
    }
  });
}

/* ── 8. Contact Form Handling ─────────────────────────────────────────── */
function initContactForm() {
  const f = document.getElementById("f");
  const st = document.getElementById("st");
  if (!f) return;

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const n = (f.n ? f.n.value : "").trim();
    const em = (f.e ? f.e.value : "").trim();
    const m = (f.m ? f.m.value : "").trim();

    if (!n || !/^\S+@\S+\.\S+$/.test(em) || !m) {
      if (st) {
        st.textContent = "Please add your name, a valid email and a message.";
        st.style.color = "#ff4d4d";
      }
      return;
    }

    const btn = f.querySelector("button[type='submit']");
    const originalText = btn ? btn.textContent : "Send message";

    try {
      if (btn) btn.textContent = "Sending...";
      if (st) {
        st.textContent = "Sending message...";
        st.style.color = "var(--mute)";
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, email: em, message: m }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (st) {
          st.textContent = "Thank you! Your message has been sent successfully.";
          st.style.color = "#4ade80";
        }
        f.reset();
      } else {
        if (st) {
          st.textContent = data.error || "Failed to send message. Please try again.";
          st.style.color = "#ff4d4d";
        }
      }
    } catch (err) {
      if (st) {
        st.textContent = "Network error. Please try again or email ankit5242raj1@outlook.com directly.";
        st.style.color = "#ff4d4d";
      }
    } finally {
      if (btn) btn.textContent = originalText;
    }
  });
}

/* ── 9. Dynamic Data Sync with Admin Panel Core ────────────────────────── */
async function initDynamicContent() {
  try {
    // 1. Content & Bio sync
    const contentRes = await fetch("/api/content").then(r => r.json()).catch(() => null);
    if (contentRes) {
      const cvBtn = document.getElementById("cv-btn");
      if (cvBtn && contentRes.resume_url) {
        cvBtn.href = contentRes.resume_url;
      }
    }

    // 2. Certificates & Awards sync
    const certsRes = await fetch("/api/certificates").then(r => r.json()).catch(() => null);
    if (Array.isArray(certsRes) && certsRes.length > 0) {
      const certLink = document.getElementById("cert-link");
      const active = certsRes[0];
      if (certLink && (active.credential_url || active.image_url)) {
        certLink.href = active.credential_url || active.image_url;
      }
    }
  } catch (e) {
    // Graceful fallback to static HTML content
  }
}

/* ── 10. Visitor Analytics Beacon ──────────────────────────────────────── */
function initAnalyticsTracking() {
  try {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_path: window.location.pathname || "/",
        referer: document.referrer || "Direct",
      }),
    }).catch(() => {});
  } catch (e) {}
}

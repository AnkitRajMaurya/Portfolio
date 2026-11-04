/**
 * Production Admin Workspace JavaScript
 * Clean, modern, responsive CMS dashboard for Ankit Raj Maurya Portfolio
 */

let authToken = localStorage.getItem('admin_token') || '';
let currentUsername = localStorage.getItem('admin_user') || 'admin';
let activeSection = 'overview';

// Cached data
let allProjects = [];
let allSkills = [];
let allCertificates = [];
let allMessages = [];
let confirmCallback = null;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
  initNav();
  initModals();
  initForms();

  if (authToken) {
    showDashboard();
  } else {
    showLogin();
  }
});

// ── 1. API HELPER ──────────────────────────────────────────────────────────
async function api(method, url, data = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = { method, headers };
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(url, options);

    if (res.status === 401) {
      // Session expired
      logout();
      showToast('Session expired. Please sign in again.', 'error');
      throw new Error('Unauthorized');
    }

    return res;
  } catch (err) {
    throw err;
  }
}

// ── 2. AUTHENTICATION & LOGIN ──────────────────────────────────────────────
function initAuthUI() {
  const loginForm = document.getElementById('login-form');
  const togglePassBtn = document.getElementById('toggle-password');
  const passInput = document.getElementById('login-password');

  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      togglePassBtn.innerHTML = isPass ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('login-username');
      const errorBox = document.getElementById('login-error');
      const submitBtn = document.getElementById('login-btn');

      const username = usernameInput.value.trim();
      const password = passInput.value;

      errorBox.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Authenticating...</span>';

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok && data.token) {
          authToken = data.token;
          currentUsername = data.username || username;
          localStorage.setItem('admin_token', authToken);
          localStorage.setItem('admin_user', currentUsername);

          showDashboard();
          showToast(`Welcome back, ${currentUsername}!`, 'success');
        } else {
          errorBox.textContent = data.error || 'Invalid credentials.';
          errorBox.classList.remove('hidden');
        }
      } catch (err) {
        errorBox.textContent = 'Server connection failed. Please ensure the backend is running.';
        errorBox.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In to Dashboard</span> <i class="fa-solid fa-arrow-right"></i>';
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      showToast('Signed out successfully.', 'success');
    });
  }
}

function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('admin-user-display').textContent = currentUsername;

  // Load all initial data
  loadOverview();
  loadProjects();
  loadSkills();
  loadCertificates();
  loadMessages();
  loadContent();
}

function logout() {
  authToken = '';
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  showLogin();
}

// ── 3. NAVIGATION ──────────────────────────────────────────────────────────
function initNav() {
  const navBtns = document.querySelectorAll('.nav-item');
  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      switchSection(section);
    });
  });

  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

function switchSection(sectionId) {
  activeSection = sectionId;

  // Update nav buttons
  document.querySelectorAll('.nav-item').forEach((b) => {
    b.classList.toggle('active', b.dataset.section === sectionId);
  });

  // Update views
  document.querySelectorAll('.view-section').forEach((sec) => {
    sec.classList.add('hidden');
  });

  const target = document.getElementById(`section-${sectionId}`);
  if (target) {
    target.classList.remove('hidden');
  }

  // Update topbar title
  const titles = {
    overview: { title: 'Overview', sub: 'Real-time portfolio metrics and platform control.' },
    projects: { title: 'Projects', sub: 'Create, modify, and publish engineering project cards.' },
    skills: { title: 'Technical Stack', sub: 'Organize skills, tools, and categorized tech proficiencies.' },
    certificates: { title: 'Certificates & Awards', sub: 'Manage verifiable credentials, hackathon distinctions & honors.' },
    messages: { title: 'Contact Inquiries', sub: 'Review and respond to client and recruiter messages.' },
    content: { title: 'Content & Profile', sub: 'Customize headline copy, bio text, and downloadable resume link.' },
    security: { title: 'Security & Access', sub: 'Update admin master password and review session status.' },
  };

  const meta = titles[sectionId] || { title: 'Dashboard', sub: '' };
  document.getElementById('topbar-title').textContent = meta.title;
  document.getElementById('topbar-sub').textContent = meta.sub;

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');
}

// ── 4. OVERVIEW DATA ───────────────────────────────────────────────────────
async function loadOverview() {
  try {
    // 1. Analytics
    const analyticsRes = await api('GET', '/api/admin/analytics').then((r) => r.json()).catch(() => ({}));
    document.getElementById('stat-views').textContent = analyticsRes.totalViews || 0;
    document.getElementById('stat-visitors').textContent = analyticsRes.uniqueVisitors || 0;

    // 2. Projects & Messages count
    const projRes = await api('GET', '/api/admin/projects').then((r) => r.json()).catch(() => []);
    if (Array.isArray(projRes)) {
      document.getElementById('stat-projects').textContent = projRes.length;
    }

    const msgRes = await api('GET', '/api/admin/messages').then((r) => r.json()).catch(() => []);
    if (Array.isArray(msgRes)) {
      document.getElementById('stat-messages').textContent = msgRes.length;
      const unreadCount = msgRes.filter((m) => !m.read).length;
      const badge = document.getElementById('unread-badge');
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    // 3. Activity feed
    const activityRes = await api('GET', '/api/admin/recent-activity').then((r) => r.json()).catch(() => []);
    const feed = document.getElementById('recent-activity-list');
    if (Array.isArray(activityRes) && activityRes.length > 0) {
      feed.innerHTML = activityRes
        .map(
          (act) => `
          <div class="activity-item">
            <div class="act-title">${escapeHtml(act.title)}</div>
            <div class="act-desc">${escapeHtml(act.description)}</div>
            <div class="act-time">${act.time ? new Date(act.time).toLocaleString() : 'Recent'}</div>
          </div>
        `
        )
        .join('');
    } else {
      feed.innerHTML = '<div class="empty-state text-muted" style="padding: 20px 0;">No recent system activity recorded yet.</div>';
    }
  } catch (err) {
    console.error('Failed to load overview data:', err);
  }
}

// ── 5. PROJECTS MANAGEMENT ─────────────────────────────────────────────────
async function loadProjects() {
  try {
    const res = await api('GET', '/api/admin/projects');
    const data = await res.json();
    if (Array.isArray(data)) {
      allProjects = data;
      renderProjects(allProjects);
    }
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

function renderProjects(list) {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state text-muted" style="grid-column: 1/-1; padding: 40px; text-align: center;">No projects found. Click "New Project" to create one.</div>';
    return;
  }

  container.innerHTML = list
    .map(
      (p) => `
      <div class="project-card">
        <div class="project-card-header">
          <span class="project-badge">${escapeHtml(p.badge || 'Project')}</span>
          <span style="font-size: 0.75rem; color: ${p.visible ? 'var(--success)' : 'var(--text-muted)'}; font-weight: 600;">
            ${p.visible ? '● Live' : '○ Hidden'}
          </span>
        </div>
        <div class="project-card-body">
          <h4>${escapeHtml(p.title)}</h4>
          <p>${escapeHtml(p.description || 'No description provided.')}</p>
          ${
            Array.isArray(p.tech_tags) && p.tech_tags.length > 0
              ? `<div class="tech-tags">${p.tech_tags.map((t) => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}</div>`
              : ''
          }
        </div>
        <div class="project-card-footer">
          <div class="project-links">
            ${p.demo_url ? `<a href="${p.demo_url}" target="_blank" rel="noopener noreferrer" title="Live Demo"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
            ${p.github_url ? `<a href="${p.github_url}" target="_blank" rel="noopener noreferrer" title="Source Code"><i class="fa-brands fa-github"></i></a>` : ''}
          </div>
          <div class="card-actions">
            <button type="button" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="editProject(${p.id})">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button type="button" class="btn btn-danger" style="padding: 6px 12px; font-size: 0.75rem;" onclick="deleteProject(${p.id}, '${escapeJs(p.title)}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join('');
}

function filterProjects() {
  const query = (document.getElementById('project-search')?.value || '').toLowerCase().trim();
  if (!query) {
    renderProjects(allProjects);
    return;
  }
  const filtered = allProjects.filter((p) => {
    const titleMatch = (p.title || '').toLowerCase().includes(query);
    const descMatch = (p.description || '').toLowerCase().includes(query);
    const tagMatch = Array.isArray(p.tech_tags) && p.tech_tags.some((t) => t.toLowerCase().includes(query));
    return titleMatch || descMatch || tagMatch;
  });
  renderProjects(filtered);
}

function openProjectModal(project = null) {
  document.getElementById('project-modal-title').textContent = project ? 'Edit Project' : 'Add Project';
  document.getElementById('p-id').value = project ? project.id : '';
  document.getElementById('p-title').value = project ? project.title : '';
  document.getElementById('p-badge').value = project ? project.badge || '' : '';
  document.getElementById('p-desc').value = project ? project.description || '' : '';
  document.getElementById('p-demo').value = project ? project.demo_url || '' : '';
  document.getElementById('p-github').value = project ? project.github_url || '' : '';
  document.getElementById('p-image').value = project ? project.image_url || '' : '';
  document.getElementById('p-tags').value = project ? (Array.isArray(project.tech_tags) ? project.tech_tags.join(', ') : project.tech_tags || '') : '';
  document.getElementById('p-order').value = project ? project.sort_order || 0 : 0;
  document.getElementById('p-visible').checked = project ? project.visible !== 0 : true;

  document.getElementById('project-alert').classList.add('hidden');
  document.getElementById('project-modal').classList.remove('hidden');
}

function closeProjectModal() {
  document.getElementById('project-modal').classList.add('hidden');
}

function editProject(id) {
  const proj = allProjects.find((p) => p.id === id);
  if (proj) openProjectModal(proj);
}

function deleteProject(id, title) {
  openConfirm(`Delete project "${title}"? This cannot be undone.`, async () => {
    const res = await api('DELETE', `/api/admin/projects/${id}`);
    if (res.ok) {
      showToast('Project deleted successfully.', 'success');
      loadProjects();
      loadOverview();
    }
  });
}

// ── 6. SKILLS MANAGEMENT ───────────────────────────────────────────────────
async function loadSkills() {
  try {
    const res = await api('GET', '/api/admin/skills');
    const data = await res.json();
    if (Array.isArray(data)) {
      allSkills = data;
      renderSkills(allSkills);
    }
  } catch (err) {
    console.error('Failed to load skills:', err);
  }
}

function renderSkills(list) {
  const container = document.getElementById('skills-grid');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state text-muted" style="grid-column: 1/-1; padding: 40px; text-align: center;">No skills found in this category.</div>';
    return;
  }

  container.innerHTML = list
    .map(
      (s) => `
      <div class="skill-card">
        <div class="skill-info">
          <i class="${escapeHtml(s.icon_class || 'fa-solid fa-code')} skill-icon"></i>
          <div>
            <strong>${escapeHtml(s.name)}</strong>
            <small>${escapeHtml(s.category || 'frontend')}</small>
          </div>
        </div>
        <div class="card-actions">
          <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="editSkill(${s.id})">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem;" onclick="deleteSkill(${s.id}, '${escapeJs(s.name)}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `
    )
    .join('');
}

function filterSkills(category) {
  document.querySelectorAll('#skills-filter-bar .filter-pill').forEach((pill) => {
    pill.classList.remove('active');
  });
  event?.currentTarget?.classList?.add('active');

  if (category === 'all') {
    renderSkills(allSkills);
  } else {
    const filtered = allSkills.filter((s) => (s.category || '').toLowerCase() === category.toLowerCase());
    renderSkills(filtered);
  }
}

function openSkillModal(skill = null) {
  document.getElementById('skill-modal-title').textContent = skill ? 'Edit Skill' : 'Add Skill';
  document.getElementById('s-id').value = skill ? skill.id : '';
  document.getElementById('s-name').value = skill ? skill.name : '';
  document.getElementById('s-category').value = skill ? skill.category || 'frontend' : 'frontend';
  document.getElementById('s-order').value = skill ? skill.sort_order || 0 : 0;
  document.getElementById('s-icon').value = skill ? skill.icon_class || '' : '';

  document.getElementById('skill-alert').classList.add('hidden');
  document.getElementById('skill-modal').classList.remove('hidden');
}

function closeSkillModal() {
  document.getElementById('skill-modal').classList.add('hidden');
}

function editSkill(id) {
  const s = allSkills.find((item) => item.id === id);
  if (s) openSkillModal(s);
}

function deleteSkill(id, name) {
  openConfirm(`Delete skill "${name}"?`, async () => {
    const res = await api('DELETE', `/api/admin/skills/${id}`);
    if (res.ok) {
      showToast('Skill deleted.', 'success');
      loadSkills();
    }
  });
}

// ── 7. CERTIFICATES MANAGEMENT ─────────────────────────────────────────────
async function loadCertificates() {
  try {
    const res = await api('GET', '/api/admin/certificates');
    const data = await res.json();
    if (Array.isArray(data)) {
      allCertificates = data;
      renderCertificates(allCertificates);
    }
  } catch (err) {
    console.error('Failed to load certificates:', err);
  }
}

function renderCertificates(list) {
  const container = document.getElementById('certificates-grid');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state text-muted" style="grid-column: 1/-1; padding: 40px; text-align: center;">No certificates registered yet.</div>';
    return;
  }

  container.innerHTML = list
    .map(
      (c) => `
      <div class="cert-admin-card">
        <div class="cert-thumb">
          ${c.image_url ? `<img src="${c.image_url}" alt="${escapeHtml(c.title)}" loading="lazy" />` : '<span class="no-img">No Image Available</span>'}
        </div>
        <div class="cert-admin-body">
          <h4>${escapeHtml(c.title)}</h4>
          <div class="cert-admin-meta">
            <span>${escapeHtml(c.issuer || 'Issuer')}</span> • <span>${escapeHtml(c.issue_date || 'Date')}</span>
          </div>
        </div>
        <div class="cert-admin-footer">
          ${c.credential_url ? `<a href="${c.credential_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Verify</a>` : '<span></span>'}
          <div class="card-actions">
            <button type="button" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="editCert(${c.id})">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button type="button" class="btn btn-danger" style="padding: 6px 12px; font-size: 0.75rem;" onclick="deleteCert(${c.id}, '${escapeJs(c.title)}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join('');
}

function openCertModal(cert = null) {
  document.getElementById('cert-modal-title').textContent = cert ? 'Edit Certificate' : 'Add Certificate';
  document.getElementById('c-id').value = cert ? cert.id : '';
  document.getElementById('c-title').value = cert ? cert.title : '';
  document.getElementById('c-issuer').value = cert ? cert.issuer || '' : '';
  document.getElementById('c-date').value = cert ? cert.issue_date || '' : '';
  document.getElementById('c-type').value = cert ? cert.type || 'certificate' : 'certificate';
  document.getElementById('c-order').value = cert ? cert.sort_order || 0 : 0;
  document.getElementById('c-url').value = cert ? cert.credential_url || '' : '';
  document.getElementById('c-image').value = cert ? cert.image_url || '' : '';

  document.getElementById('cert-alert').classList.add('hidden');
  document.getElementById('cert-modal').classList.remove('hidden');
}

function closeCertModal() {
  document.getElementById('cert-modal').classList.add('hidden');
}

function editCert(id) {
  const c = allCertificates.find((item) => item.id === id);
  if (c) openCertModal(c);
}

function deleteCert(id, title) {
  openConfirm(`Delete certificate "${title}"?`, async () => {
    const res = await api('DELETE', `/api/admin/certificates/${id}`);
    if (res.ok) {
      showToast('Certificate removed.', 'success');
      loadCertificates();
    }
  });
}

// ── 8. MESSAGES MANAGEMENT ─────────────────────────────────────────────────
async function loadMessages() {
  try {
    const res = await api('GET', '/api/admin/messages');
    const data = await res.json();
    if (Array.isArray(data)) {
      allMessages = data;
      renderMessages(allMessages);
    }
  } catch (err) {
    console.error('Failed to load messages:', err);
  }
}

function renderMessages(list) {
  const container = document.getElementById('messages-list');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state text-muted" style="padding: 40px; text-align: center;">No contact inquiries received yet.</div>';
    return;
  }

  container.innerHTML = list
    .map(
      (m) => `
      <div class="message-card ${m.read ? '' : 'unread'}">
        <div class="msg-header">
          <div class="msg-author">
            <strong>${escapeHtml(m.name)}</strong>
            <a href="mailto:${escapeHtml(m.email)}"><i class="fa-regular fa-envelope"></i> ${escapeHtml(m.email)}</a>
          </div>
          <div class="msg-date">${m.created_at ? new Date(m.created_at).toLocaleString() : ''}</div>
        </div>
        <div class="msg-body">${escapeHtml(m.message)}</div>
        <div class="msg-actions">
          ${
            !m.read
              ? `<button type="button" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="markMessageRead(${m.id})">
                  <i class="fa-solid fa-check"></i> Mark as Read
                </button>`
              : ''
          }
          <a href="mailto:${escapeHtml(m.email)}?subject=Re:%20Portfolio%20Inquiry" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.75rem;">
            <i class="fa-solid fa-reply"></i> Reply via Email
          </a>
          <button type="button" class="btn btn-danger" style="padding: 6px 12px; font-size: 0.75rem;" onclick="deleteMessage(${m.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `
    )
    .join('');
}

async function markMessageRead(id) {
  await api('PUT', `/api/admin/messages/${id}/read`);
  showToast('Marked as read.', 'success');
  loadMessages();
  loadOverview();
}

function deleteMessage(id) {
  openConfirm('Delete this message?', async () => {
    await api('DELETE', `/api/admin/messages/${id}`);
    showToast('Message deleted.', 'success');
    loadMessages();
    loadOverview();
  });
}

// ── 9. CONTENT & PROFILE ───────────────────────────────────────────────────
async function loadContent() {
  try {
    const res = await api('GET', '/api/admin/content');
    const data = await res.json();
    if (data && typeof data === 'object') {
      if (document.getElementById('cnt-hero-greeting')) document.getElementById('cnt-hero-greeting').value = data.hero_greeting || "Hello, I'm";
      if (document.getElementById('cnt-hero-name')) document.getElementById('cnt-hero-name').value = data.hero_name || 'Ankit Raj Maurya';
      if (document.getElementById('cnt-hero-tagline')) document.getElementById('cnt-hero-tagline').value = data.hero_tagline || 'From Problem to Production-Ready.';
      if (document.getElementById('cnt-hero-desc')) document.getElementById('cnt-hero-desc').value = data.hero_description || '';
      if (document.getElementById('cnt-about-desc')) document.getElementById('cnt-about-desc').value = data.about_description || '';
      if (document.getElementById('cnt-email')) document.getElementById('cnt-email').value = data.email || 'ankit5242raj1@outlook.com';
      if (document.getElementById('cnt-location')) document.getElementById('cnt-location').value = data.location || 'Muzaffarpur, Bihar, India';
      if (document.getElementById('cnt-resume')) document.getElementById('cnt-resume').value = data.resume_url || 'https://drive.google.com/file/d/1359Lhc3l75iBDmdHSWJDFBz4O8sG33MJ/view?usp=drivesdk';
    }
  } catch (err) {
    console.error('Failed to load content:', err);
  }
}

// ── 10. MODALS & FORMS HANDLING ────────────────────────────────────────────
function initModals() {
  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
      }
    });
  });
}

function initForms() {
  // Project form
  const projForm = document.getElementById('project-form');
  if (projForm) {
    projForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('p-id').value;
      const alertBox = document.getElementById('project-alert');

      const payload = {
        title: document.getElementById('p-title').value.trim(),
        badge: document.getElementById('p-badge').value.trim(),
        description: document.getElementById('p-desc').value.trim(),
        demo_url: document.getElementById('p-demo').value.trim(),
        github_url: document.getElementById('p-github').value.trim(),
        image_url: document.getElementById('p-image').value.trim(),
        tech_tags: document.getElementById('p-tags').value.trim(),
        sort_order: parseInt(document.getElementById('p-order').value, 10) || 0,
        visible: document.getElementById('p-visible').checked,
      };

      try {
        const res = id
          ? await api('PUT', `/api/admin/projects/${id}`, payload)
          : await api('POST', '/api/admin/projects', payload);

        if (res.ok) {
          closeProjectModal();
          showToast(id ? 'Project updated successfully.' : 'New project added.', 'success');
          loadProjects();
          loadOverview();
        } else {
          const err = await res.json();
          showAlert(alertBox, err.error || 'Failed to save project.', 'error');
        }
      } catch (err) {
        showAlert(alertBox, 'Save request failed.', 'error');
      }
    });
  }

  // Skill form
  const skillForm = document.getElementById('skill-form');
  if (skillForm) {
    skillForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('s-id').value;
      const alertBox = document.getElementById('skill-alert');

      const payload = {
        name: document.getElementById('s-name').value.trim(),
        category: document.getElementById('s-category').value,
        sort_order: parseInt(document.getElementById('s-order').value, 10) || 0,
        icon_class: document.getElementById('s-icon').value.trim(),
      };

      try {
        const res = id
          ? await api('PUT', `/api/admin/skills/${id}`, payload)
          : await api('POST', '/api/admin/skills', payload);

        if (res.ok) {
          closeSkillModal();
          showToast(id ? 'Skill updated.' : 'New skill added.', 'success');
          loadSkills();
        } else {
          const err = await res.json();
          showAlert(alertBox, err.error || 'Save failed.', 'error');
        }
      } catch {
        showAlert(alertBox, 'Request failed.', 'error');
      }
    });
  }

  // Certificate form
  const certForm = document.getElementById('cert-form');
  if (certForm) {
    certForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('c-id').value;
      const alertBox = document.getElementById('cert-alert');

      const payload = {
        title: document.getElementById('c-title').value.trim(),
        issuer: document.getElementById('c-issuer').value.trim(),
        issue_date: document.getElementById('c-date').value.trim(),
        type: document.getElementById('c-type').value,
        sort_order: parseInt(document.getElementById('c-order').value, 10) || 0,
        credential_url: document.getElementById('c-url').value.trim(),
        image_url: document.getElementById('c-image').value.trim(),
      };

      try {
        const res = id
          ? await api('PUT', `/api/admin/certificates/${id}`, payload)
          : await api('POST', '/api/admin/certificates', payload);

        if (res.ok) {
          closeCertModal();
          showToast(id ? 'Certificate updated.' : 'Certificate added.', 'success');
          loadCertificates();
        } else {
          const err = await res.json();
          showAlert(alertBox, err.error || 'Save failed.', 'error');
        }
      } catch {
        showAlert(alertBox, 'Request failed.', 'error');
      }
    });
  }

  // Content form
  const contentForm = document.getElementById('content-form');
  if (contentForm) {
    contentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('content-alert');

      const payload = {
        hero_greeting: document.getElementById('cnt-hero-greeting').value.trim(),
        hero_name: document.getElementById('cnt-hero-name').value.trim(),
        hero_tagline: document.getElementById('cnt-hero-tagline').value.trim(),
        hero_description: document.getElementById('cnt-hero-desc').value.trim(),
        about_description: document.getElementById('cnt-about-desc').value.trim(),
        email: document.getElementById('cnt-email').value.trim(),
        location: document.getElementById('cnt-location').value.trim(),
        resume_url: document.getElementById('cnt-resume').value.trim(),
      };

      try {
        const res = await api('PUT', '/api/admin/content', payload);
        if (res.ok) {
          showAlert(alertBox, 'Portfolio content saved successfully.', 'success');
          showToast('Portfolio content published live.', 'success');
        } else {
          showAlert(alertBox, 'Failed to save changes.', 'error');
        }
      } catch {
        showAlert(alertBox, 'Request failed.', 'error');
      }
    });
  }

  // Password form
  const pwdForm = document.getElementById('password-form');
  if (pwdForm) {
    pwdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('password-alert');
      const cur = document.getElementById('pwd-current').value;
      const nw = document.getElementById('pwd-new').value;
      const conf = document.getElementById('pwd-confirm').value;

      if (nw !== conf) {
        showAlert(alertBox, 'New passwords do not match.', 'error');
        return;
      }

      try {
        const res = await api('POST', '/api/admin/change-password', {
          currentPassword: cur,
          newPassword: nw,
        });

        const data = await res.json();
        if (res.ok) {
          showAlert(alertBox, 'Password updated successfully.', 'success');
          showToast('Admin password changed.', 'success');
          pwdForm.reset();
        } else {
          showAlert(alertBox, data.error || 'Failed to update password.', 'error');
        }
      } catch {
        showAlert(alertBox, 'Request failed.', 'error');
      }
    });
  }
}

// ── 11. CONFIRMATION DIALOG ────────────────────────────────────────────────
function openConfirm(msg, onOk) {
  document.getElementById('confirm-msg').textContent = msg;
  confirmCallback = onOk;
  document.getElementById('confirm-modal').classList.remove('hidden');

  document.getElementById('confirm-ok-btn').onclick = async () => {
    if (confirmCallback) {
      await confirmCallback();
    }
    closeConfirm();
  };
}

function closeConfirm() {
  confirmCallback = null;
  document.getElementById('confirm-modal').classList.add('hidden');
}

// ── 12. UTILITIES & TOAST NOTIFICATIONS ────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function showAlert(el, msg, type = 'error') {
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type}`;
  el.classList.remove('hidden');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(str) {
  return String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

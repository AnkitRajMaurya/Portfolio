let token = localStorage.getItem('admin_token') || '';
let currentSkillCat = 'frontend';
let allSkills = [];
let allProjects = [];
let allCerts = [];
let confirmCallback = null;
let uptimeStartedAt = Date.now();
let uptimeTimer = null;
let matrixContext = null;
let matrixColumns = [];
let matrixChars = '01ABCDEF<>[]{}#$%&*+=?-';
let failedLoginAttempts = 0;
let threatOverlayTimer = null;
let successOverlayTimer = null;

const SECTION_META = {
  overview: {
    title: 'OVERVIEW',
    sub: 'root@system:~$ status --all'
  },
  projects: {
    title: 'PROJECTS',
    sub: 'root@projects:~$ ls --classified'
  },
  skills: {
    title: 'SKILLS',
    sub: 'root@skills:~$ cat exploit-db'
  },
  messages: {
    title: 'INTERCEPTS',
    sub: 'root@signals:~$ read --unread'
  },
  certificates: {
    title: 'CERTS',
    sub: 'root@certs:~$ verify --chain'
  },
  content: {
    title: 'PAYLOAD',
    sub: 'root@content:~$ nano live-copy'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  bindCoreEvents();
  initMatrixRain();
  playBootSequence();
});

function bindCoreEvents() {
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });

  document.querySelectorAll('.skill-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.skill-tab').forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      currentSkillCat = tab.dataset.cat;
      renderSkills();
    });
  });

  document.getElementById('project-form').addEventListener('submit', saveProject);
  document.getElementById('skill-form').addEventListener('submit', saveSkill);
  document.getElementById('cert-form').addEventListener('submit', saveCert);
  document.getElementById('content-form').addEventListener('submit', saveContent);

  document.getElementById('p-image').addEventListener('input', handleProjectImagePreview);

  [
    ['project-modal', closeProjectModal],
    ['skill-modal', closeSkillModal],
    ['cert-modal', closeCertModal],
    ['confirm-modal', closeConfirm]
  ].forEach(([id, closeHandler]) => {
    document.getElementById(id).addEventListener('click', (event) => {
      if (event.target === event.currentTarget) {
        closeHandler();
      }
    });
  });
}

function playBootSequence() {
  const bootLines = document.getElementById('boot-lines');
  const bootScreen = document.getElementById('boot-screen');
  const lines = [
    '[BOOT] Starting secure shell daemon...',
    '[OK] Loading encrypted session modules...',
    '[OK] Establishing dark relay tunnel...',
    '[OK] Syncing project, skill, and message nodes...',
    '[WARN] Motion sensors armed. Silent mode engaged.',
    '[DONE] Root panel online.'
  ];

  bootLines.innerHTML = '';

  lines.forEach((line, index) => {
    window.setTimeout(() => {
      const row = document.createElement('div');
      row.className = 'boot-line';
      row.textContent = line;
      bootLines.appendChild(row);
    }, index * 240);
  });

  window.setTimeout(() => {
    bootScreen.classList.add('fade-out');

    if (token) {
      showDashboard();
      loadOverview();
    } else {
      showLoginScreen();
      document.getElementById('login-username').focus();
    }

    window.setTimeout(() => {
      bootScreen.classList.add('hidden');
    }, 520);
  }, lines.length * 240 + 520);
}

async function handleLogin(event) {
  event.preventDefault();

  const button = document.getElementById('login-btn');
  const errorBox = document.getElementById('login-error');

  setButtonState(button, true, '<i class="fa-solid fa-spinner fa-spin"></i><span>BYPASSING AUTH</span>');
  errorBox.classList.add('hidden');

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      failedLoginAttempts += 1;
      triggerThreatOverlay(data.error || 'Access denied');
      showAlert(errorBox, data.error || 'Access denied. Countermeasures active.', 'error');
      return;
    }

    token = data.token;
    localStorage.setItem('admin_token', token);
    failedLoginAttempts = 0;
    await triggerSuccessOverlay();
    showDashboard();
    loadOverview();
  } catch (error) {
    showAlert(errorBox, 'Connection tunnel failed', 'error');
  } finally {
    setButtonState(
      button,
      false,
      '<i class="fa-solid fa-right-to-bracket"></i><span>INITIATE ACCESS</span><div class="btn-glitch"></div>'
    );
  }
}

function handleLogout() {
  token = '';
  localStorage.removeItem('admin_token');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('login-form').reset();
  document.getElementById('threat-overlay').classList.add('hidden');
  document.getElementById('success-overlay').classList.add('hidden');
  document.body.classList.remove('threat-mode');

  if (uptimeTimer) {
    window.clearInterval(uptimeTimer);
    uptimeTimer = null;
  }

  document.getElementById('login-username').focus();
}

async function api(method, url, body) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (response.status === 401) {
    handleLogout();
    location.reload();
  }

  return response;
}

function showAlert(element, message, type = 'error') {
  element.textContent = message;
  element.className = `alert alert-${type}`;
  element.classList.remove('hidden');
  window.setTimeout(() => element.classList.add('hidden'), 4000);
}

function setButtonState(button, busy, html) {
  button.disabled = busy;
  button.innerHTML = html;
}

async function triggerSuccessOverlay() {
  const overlay = document.getElementById('success-overlay');
  const time = document.getElementById('success-time');
  const operator = document.getElementById('success-operator');
  const node = document.getElementById('success-node');
  const status = document.getElementById('success-status');

  operator.textContent = 'ROOT';
  node.textContent = 'PRIMARY CORE';
  status.textContent = 'ACCESS GRANTED';
  time.textContent = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  overlay.classList.remove('hidden');
  overlay.classList.remove('success-show');
  overlay.setAttribute('aria-hidden', 'false');
  void overlay.offsetWidth;
  overlay.classList.add('success-show');

  if (successOverlayTimer) {
    window.clearTimeout(successOverlayTimer);
  }

  await new Promise((resolve) => {
    successOverlayTimer = window.setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.classList.remove('success-show');
      overlay.setAttribute('aria-hidden', 'true');
      resolve();
    }, 1450);
  });
}

function triggerThreatOverlay(reason) {
  const overlay = document.getElementById('threat-overlay');
  const title = document.getElementById('threat-title');
  const copy = document.getElementById('threat-copy');
  const attempt = document.getElementById('threat-attempt');
  const browser = document.getElementById('threat-browser');
  const device = document.getElementById('threat-device');
  const time = document.getElementById('threat-time');
  const reasonEl = document.getElementById('threat-reason');
  const loginCard = document.querySelector('.login-card');

  const responses = [
    {
      title: 'UNAUTHORIZED ACCESS',
      copy: 'Credential mismatch detected. Device signature mirrored into the countermeasure stack.'
    },
    {
      title: 'TRACE ESCALATED',
      copy: 'Repeated auth failure detected. Session fingerprint locked and route beacon intensified.'
    },
    {
      title: 'LOCKDOWN ACTIVE',
      copy: 'Brute-force profile suspected. Shadow archive armed and operator alert chain primed.'
    }
  ];

  const profile = responses[Math.min(failedLoginAttempts - 1, responses.length - 1)];

  title.textContent = profile.title;
  copy.textContent = profile.copy;
  attempt.textContent = String(failedLoginAttempts).padStart(2, '0');
  browser.textContent = detectBrowserLabel();
  device.textContent = `${navigator.platform || 'UNKNOWN'} | ${navigator.language || 'EN'}`;
  time.textContent = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  reasonEl.textContent = String(reason || 'Credential mismatch detected').toUpperCase();

  overlay.classList.remove('hidden');
  overlay.classList.remove('threat-show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('threat-mode');
  loginCard.classList.remove('shake-alert');
  void overlay.offsetWidth;
  overlay.classList.add('threat-show');
  loginCard.classList.add('shake-alert');

  if (threatOverlayTimer) {
    window.clearTimeout(threatOverlayTimer);
  }

  threatOverlayTimer = window.setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.classList.remove('threat-show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('threat-mode');
    loginCard.classList.remove('shake-alert');
  }, 3600);
}

function detectBrowserLabel() {
  const agent = navigator.userAgent || '';

  if (agent.includes('Edg/')) return 'EDGE';
  if (agent.includes('Chrome/')) return 'CHROME';
  if (agent.includes('Firefox/')) return 'FIREFOX';
  if (agent.includes('Safari/') && !agent.includes('Chrome/')) return 'SAFARI';

  return 'UNKNOWN';
}

function showLoginScreen() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('threat-overlay').classList.add('hidden');
  document.getElementById('success-overlay').classList.add('hidden');
  document.body.classList.remove('threat-mode');
  uptimeStartedAt = Date.now();
  startUptimeClock();
}

function startUptimeClock() {
  if (uptimeTimer) {
    window.clearInterval(uptimeTimer);
  }

  const uptimeElement = document.getElementById('uptime');

  const update = () => {
    const elapsedSeconds = Math.floor((Date.now() - uptimeStartedAt) / 1000);
    const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(elapsedSeconds % 60).padStart(2, '0');
    uptimeElement.textContent = `${hours}:${minutes}:${seconds}`;
  };

  update();
  uptimeTimer = window.setInterval(update, 1000);
}

function switchSection(name) {
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.section === name);
  });

  document.querySelectorAll('.section').forEach((section) => {
    section.classList.add('hidden');
  });

  document.getElementById(`section-${name}`).classList.remove('hidden');

  const meta = SECTION_META[name] || {
    title: name.toUpperCase(),
    sub: 'root@system:~$ idle'
  };

  syncSectionHeading(meta.title, meta.sub);
  document.getElementById('sidebar').classList.remove('open');

  if (name === 'projects') loadProjects();
  if (name === 'skills') loadSkills();
  if (name === 'messages') loadMessages();
  if (name === 'certificates') loadCerts();
  if (name === 'content') loadContent();
}

function syncSectionHeading(title, subtitle) {
  const titleEl = document.getElementById('section-title');
  titleEl.textContent = title;
  titleEl.dataset.text = title;
  titleEl.classList.remove('glitch-pulse');
  void titleEl.offsetWidth;
  titleEl.classList.add('glitch-pulse');
  document.getElementById('section-sub').textContent = subtitle;
}

async function loadOverview() {
  try {
    const [projectResponse, skillResponse, messageResponse, certResponse] = await Promise.all([
      api('GET', '/api/admin/projects'),
      api('GET', '/api/admin/skills'),
      api('GET', '/api/admin/messages'),
      api('GET', '/api/admin/certificates')
    ]);

    allProjects = await projectResponse.json();
    allSkills = await skillResponse.json();
    const messages = await messageResponse.json();
    allCerts = await certResponse.json();

    const unread = messages.filter((message) => !isMessageRead(message)).length;

    document.getElementById('stat-projects').textContent = allProjects.length;
    document.getElementById('stat-skills').textContent = allSkills.length;
    document.getElementById('stat-messages').textContent = messages.length;
    document.getElementById('stat-unread').textContent = unread;
    document.getElementById('stat-certs').textContent = allCerts.length;

    updateUnreadBadge(unread);
    updateThreatLevel(unread, messages.length);
    renderTraceFeed({
      projects: allProjects.length,
      skills: allSkills.length,
      messages: messages.length,
      certs: allCerts.length,
      unread
    });
  } catch (error) {
    updateUnreadBadge(0);
    renderTraceFeed({
      projects: 0,
      skills: 0,
      messages: 0,
      certs: 0,
      unread: 0,
      failed: true
    });
  }
}

function updateUnreadBadge(unread) {
  const badge = document.getElementById('unread-badge');

  if (unread > 0) {
    badge.textContent = unread;
    badge.style.display = 'inline-flex';
  } else {
    badge.textContent = '';
    badge.style.display = 'none';
  }
}

function updateThreatLevel(unread, messageCount) {
  const threat = document.getElementById('threat-level');

  if (unread >= 5) {
    threat.textContent = 'HIGH';
    threat.style.color = '#ffb8c4';
    return;
  }

  if (unread > 0 || messageCount > 12) {
    threat.textContent = 'WATCH';
    threat.style.color = '#fff0b5';
    return;
  }

  threat.textContent = 'LOW';
  threat.style.color = '#c8ffe4';
}

function renderTraceFeed(stats) {
  const feed = document.getElementById('trace-feed');
  const time = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const lines = stats.failed
    ? [
        { severity: 'alert', text: 'Admin endpoints unreachable. Recheck tunnel and auth chain.' },
        { severity: 'watch', text: 'Telemetry stream paused until data sync returns.' },
        { severity: 'stable', text: 'UI shell still active. Local controls remain available.' }
      ]
    : [
        { severity: stats.projects > 0 ? 'stable' : 'watch', text: `${stats.projects} project payloads indexed in secure storage.` },
        { severity: stats.skills > 0 ? 'stable' : 'watch', text: `${stats.skills} exploit entries available in the skill database.` },
        { severity: stats.unread > 0 ? 'alert' : 'stable', text: `${stats.unread} unread intercepts flagged out of ${stats.messages} total signals.` },
        { severity: stats.certs > 0 ? 'stable' : 'watch', text: `${stats.certs} certificates verified through credential chain.` }
      ];

  feed.innerHTML = lines
    .map((line) => {
      return `
        <div class="trace-line">
          <span class="trace-time">${time}</span>
          <span class="trace-text">${escapeHtml(line.text)}</span>
          <span class="trace-severity ${line.severity}">${line.severity}</span>
        </div>
      `;
    })
    .join('');
}

async function loadProjects() {
  const response = await api('GET', '/api/admin/projects');
  allProjects = await response.json();
  renderProjects();
}

function renderProjects() {
  const list = document.getElementById('projects-list');

  if (!allProjects.length) {
    list.innerHTML = buildEmptyState('fa-solid fa-code', 'No deployed project payloads yet.');
    return;
  }

  list.innerHTML = allProjects
    .map((project) => {
      const tags = Array.isArray(project.tech_tags)
        ? project.tech_tags
        : String(project.tech_tags || '')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

      const tagsHtml = tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
      const imageHtml = project.image_url
        ? `<div class="admin-card-img"><img src="${project.image_url}" onerror="this.parentElement.innerHTML='&lt;i class=&quot;fa-solid fa-image&quot;&gt;&lt;/i&gt;'" /></div>`
        : '<div class="admin-card-img"><i class="fa-solid fa-laptop-code"></i></div>';

      return `
        <div class="admin-card">
          ${imageHtml}
          <div class="admin-card-body">
            <div class="admin-card-title">${escapeHtml(project.title)}</div>
            <div class="admin-card-desc">${escapeHtml(project.description || 'No mission notes attached.')}</div>
            <div class="admin-card-tags">
              ${tagsHtml}
              <span class="visibility-badge ${project.visible ? 'vis-yes' : 'vis-no'}">
                ${project.visible ? 'ACTIVE' : 'HIDDEN'}
              </span>
            </div>
          </div>
          <div class="admin-card-actions">
            <button class="btn-icon" onclick="editProject(${project.id})" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-icon danger" onclick="deleteProject(${project.id}, '${escapeJs(project.title)}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

function openProjectModal(project) {
  document.getElementById('project-modal-title').textContent = project ? 'Edit Project Payload' : 'Deploy Project';
  document.getElementById('project-modal-bar-title').textContent = project ? 'root@projects:~/edit' : 'root@projects:~/new';
  document.getElementById('project-submit-btn').innerHTML = project
    ? '<i class="fa-solid fa-floppy-disk"></i> UPDATE'
    : '<i class="fa-solid fa-upload"></i> DEPLOY';

  document.getElementById('project-id').value = project ? project.id : '';
  document.getElementById('p-title').value = project ? project.title : '';
  document.getElementById('p-badge').value = project ? project.badge || 'Live' : 'Live';
  document.getElementById('p-description').value = project ? project.description || '' : '';
  document.getElementById('p-image').value = project ? project.image_url || '' : '';
  document.getElementById('p-demo').value = project ? project.demo_url || '' : '';
  document.getElementById('p-github').value = project ? project.github_url || '' : '';
  document.getElementById('p-tags').value = project
    ? Array.isArray(project.tech_tags)
      ? project.tech_tags.join(', ')
      : project.tech_tags || ''
    : '';
  document.getElementById('p-order').value = project ? project.sort_order || 0 : 0;
  document.getElementById('p-visible').value = project ? (project.visible ? '1' : '0') : '1';
  document.getElementById('project-alert').classList.add('hidden');
  handleProjectImagePreview({ target: document.getElementById('p-image') });
  document.getElementById('project-modal').classList.remove('hidden');
}

function closeProjectModal() {
  document.getElementById('project-modal').classList.add('hidden');
}

function editProject(id) {
  const project = allProjects.find((item) => item.id === id);
  if (project) {
    openProjectModal(project);
  }
}

function deleteProject(id, title) {
  openConfirm(`Terminate project payload "${title}"? This action cannot be reversed.`, async () => {
    await api('DELETE', `/api/admin/projects/${id}`);
    await loadProjects();
    await loadOverview();
  });
}

async function saveProject(event) {
  event.preventDefault();

  const id = document.getElementById('project-id').value;
  const alertBox = document.getElementById('project-alert');
  const payload = {
    title: document.getElementById('p-title').value,
    description: document.getElementById('p-description').value,
    image_url: document.getElementById('p-image').value,
    demo_url: document.getElementById('p-demo').value,
    github_url: document.getElementById('p-github').value,
    tech_tags: document
      .getElementById('p-tags')
      .value.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    badge: document.getElementById('p-badge').value,
    sort_order: Number.parseInt(document.getElementById('p-order').value, 10) || 0,
    visible: document.getElementById('p-visible').value === '1'
  };

  const response = id
    ? await api('PUT', `/api/admin/projects/${id}`, payload)
    : await api('POST', '/api/admin/projects', payload);

  const data = await response.json();

  if (!response.ok) {
    showAlert(alertBox, data.error || 'Project deployment failed', 'error');
    return;
  }

  closeProjectModal();
  await loadProjects();
  await loadOverview();
}

function handleProjectImagePreview(event) {
  const preview = document.getElementById('img-preview');
  const value = event.target.value.trim();

  if (!value) {
    preview.innerHTML = '';
    return;
  }

  preview.innerHTML = `<img src="${value}" alt="Project preview" onerror="this.parentElement.innerHTML=''" />`;
}

async function loadSkills() {
  const response = await api('GET', '/api/admin/skills');
  allSkills = await response.json();
  renderSkills();
}

function renderSkills() {
  const list = document.getElementById('skills-list');
  const filtered = allSkills.filter((skill) => skill.category === currentSkillCat);

  if (!filtered.length) {
    list.innerHTML = `<div style="grid-column:1/-1">${buildEmptyState('fa-solid fa-microchip', 'No exploits indexed in this category.')}</div>`;
    return;
  }

  list.innerHTML = filtered
    .map((skill) => {
      const iconHtml = skill.icon_url
        ? `<img src="${skill.icon_url}" alt="${escapeHtml(skill.name)}" />`
        : `<i class="${skill.icon_class || 'fa-solid fa-star'}"></i>`;

      return `
        <div class="skill-admin-card">
          <div class="skill-admin-icon">${iconHtml}</div>
          <span class="skill-admin-name">${escapeHtml(skill.name)}</span>
          <div class="skill-admin-actions">
            <button class="btn-icon" onclick="editSkill(${skill.id})" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-icon danger" onclick="deleteSkill(${skill.id}, '${escapeJs(skill.name)}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

function openSkillModal(skill) {
  document.getElementById('skill-modal-title').textContent = skill ? 'Edit Exploit' : 'Add Exploit';
  document.getElementById('skill-id').value = skill ? skill.id : '';
  document.getElementById('s-name').value = skill ? skill.name : '';
  document.getElementById('s-icon').value = skill ? skill.icon_class || '' : '';
  document.getElementById('s-icon-url').value = skill ? skill.icon_url || '' : '';
  document.getElementById('s-category').value = skill ? skill.category || 'frontend' : currentSkillCat;
  document.getElementById('s-order').value = skill ? skill.sort_order || 0 : 0;
  document.getElementById('skill-alert').classList.add('hidden');
  document.getElementById('skill-modal').classList.remove('hidden');
}

function closeSkillModal() {
  document.getElementById('skill-modal').classList.add('hidden');
}

function editSkill(id) {
  const skill = allSkills.find((item) => item.id === id);
  if (skill) {
    openSkillModal(skill);
  }
}

function deleteSkill(id, name) {
  openConfirm(`Delete exploit entry "${name}"?`, async () => {
    await api('DELETE', `/api/admin/skills/${id}`);
    await loadSkills();
    await loadOverview();
  });
}

async function saveSkill(event) {
  event.preventDefault();

  const id = document.getElementById('skill-id').value;
  const alertBox = document.getElementById('skill-alert');
  const payload = {
    name: document.getElementById('s-name').value,
    icon_class: document.getElementById('s-icon').value,
    icon_url: document.getElementById('s-icon-url').value,
    category: document.getElementById('s-category').value,
    sort_order: Number.parseInt(document.getElementById('s-order').value, 10) || 0,
    visible: true
  };

  const response = id
    ? await api('PUT', `/api/admin/skills/${id}`, payload)
    : await api('POST', '/api/admin/skills', payload);

  const data = await response.json();

  if (!response.ok) {
    showAlert(alertBox, data.error || 'Exploit injection failed', 'error');
    return;
  }

  closeSkillModal();
  await loadSkills();
  await loadOverview();
}

async function loadMessages() {
  const list = document.getElementById('messages-list');

  try {
    const response = await api('GET', '/api/admin/messages');
    const messages = await response.json();
    const unread = messages.filter((message) => !isMessageRead(message)).length;
    document.getElementById('messages-count').textContent = `${messages.length} total | ${unread} unread`;

    if (!messages.length) {
      list.innerHTML = buildEmptyState('fa-solid fa-satellite-dish', 'No intercepted transmissions yet.');
      return;
    }

    list.innerHTML = messages
      .map((message) => {
        const read = isMessageRead(message);
        const date = message.created_at
          ? new Date(message.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })
          : '';

        return `
          <div class="msg-card ${read ? '' : 'msg-unread'}" id="msg-${message.id}">
            <div class="msg-header">
              <div>
                <div class="msg-sender">${escapeHtml(message.name)}</div>
                <div class="msg-email">${escapeHtml(message.email)}</div>
              </div>
              <div style="display:flex;align-items:center;gap:.55rem;flex-wrap:wrap;justify-content:flex-end">
                <span class="msg-date">${date}</span>
                ${read
                  ? '<span class="msg-badge read">READ</span>'
                  : `<button class="btn-icon" onclick="markRead(${message.id})" title="Mark read"><i class="fa-solid fa-check"></i></button>`}
                <button class="btn-icon danger" onclick="deleteMsg(${message.id})" title="Delete">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="msg-body">${escapeHtml(message.message)}</div>
          </div>
        `;
      })
      .join('');
  } catch (error) {
    list.innerHTML = buildEmptyState('fa-solid fa-triangle-exclamation', 'Signal feed failed to load.');
  }
}

function isMessageRead(message) {
  return message.read === true || message.read === 1 || message.read_flag === true || message.read_flag === 1;
}

async function markRead(id) {
  await api('PUT', `/api/admin/messages/${id}/read`);
  await loadMessages();
  await loadOverview();
}

function deleteMsg(id) {
  openConfirm('Delete this intercepted transmission?', async () => {
    await api('DELETE', `/api/admin/messages/${id}`);
    await loadMessages();
    await loadOverview();
  });
}

async function loadContent() {
  const response = await api('GET', '/api/admin/content');
  const data = await response.json();
  const form = document.getElementById('content-form');

  Object.entries(data).forEach(([key, value]) => {
    if (form.elements[key]) {
      form.elements[key].value = value;
    }
  });
}

async function saveContent(event) {
  event.preventDefault();

  const alertBox = document.getElementById('content-alert');
  const form = event.target;
  const payload = {};

  ['status_pill', 'hero_tagline', 'hero_description', 'about_slogan', 'about_description', 'email', 'location'].forEach((key) => {
    if (form.elements[key]) {
      payload[key] = form.elements[key].value;
    }
  });

  const response = await api('PUT', '/api/admin/content', payload);
  const data = await response.json();

  if (!response.ok) {
    showAlert(alertBox, data.error || 'Payload injection failed', 'error');
    return;
  }

  showAlert(alertBox, 'Payload committed successfully.', 'success');
}

async function loadCerts() {
  const response = await api('GET', '/api/admin/certificates');
  allCerts = await response.json();
  renderCerts();
}

function renderCerts() {
  const list = document.getElementById('certificates-list');

  if (!allCerts.length) {
    list.innerHTML = buildEmptyState('fa-solid fa-fingerprint', 'No credential chains archived yet.');
    return;
  }

  list.innerHTML = allCerts
    .map((cert) => {
      const isAward = cert.type === 'award';
      const typeColor = isAward ? '#ffd35d' : '#57f7ff';
      const typeLabel = isAward ? 'AWARD' : 'CERT';
      const typeIcon = isAward ? 'fa-trophy' : 'fa-certificate';

      return `
        <div class="admin-card">
          <div class="admin-card-img" style="background:linear-gradient(135deg, ${typeColor}22, rgba(4, 13, 10, 0.95));">
            <i class="fa-solid ${typeIcon}" style="color:${typeColor};font-size:1.5rem"></i>
          </div>
          <div class="admin-card-body">
            <div class="admin-card-title">${escapeHtml(cert.title)}</div>
            <div class="admin-card-desc">
              ${escapeHtml(cert.issuer || 'Unknown issuer')}${cert.issue_date ? ` | ${escapeHtml(cert.issue_date)}` : ''}
            </div>
            <div class="admin-card-tags">
              <span class="tag" style="color:${typeColor};border-color:${typeColor}33;background:${typeColor}12">${typeLabel}</span>
              <span class="visibility-badge ${cert.visible ? 'vis-yes' : 'vis-no'}">${cert.visible ? 'ACTIVE' : 'HIDDEN'}</span>
            </div>
          </div>
          <div class="admin-card-actions">
            <button class="btn-icon" onclick="editCert(${cert.id})" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-icon danger" onclick="deleteCert(${cert.id}, '${escapeJs(cert.title)}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

function openCertModal(cert) {
  document.getElementById('cert-modal-title').textContent = cert ? 'Edit Certificate' : 'Add Certificate';
  document.getElementById('cert-id').value = cert ? cert.id : '';
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
  const cert = allCerts.find((item) => item.id === id);
  if (cert) {
    openCertModal(cert);
  }
}

function deleteCert(id, title) {
  openConfirm(`Delete certificate chain "${title}"?`, async () => {
    await api('DELETE', `/api/admin/certificates/${id}`);
    await loadCerts();
    await loadOverview();
  });
}

async function saveCert(event) {
  event.preventDefault();

  const id = document.getElementById('cert-id').value;
  const alertBox = document.getElementById('cert-alert');
  const payload = {
    title: document.getElementById('c-title').value,
    issuer: document.getElementById('c-issuer').value,
    issue_date: document.getElementById('c-date').value,
    type: document.getElementById('c-type').value,
    sort_order: Number.parseInt(document.getElementById('c-order').value, 10) || 0,
    credential_url: document.getElementById('c-url').value,
    image_url: document.getElementById('c-image').value,
    visible: true
  };

  const response = id
    ? await api('PUT', `/api/admin/certificates/${id}`, payload)
    : await api('POST', '/api/admin/certificates', payload);

  const data = await response.json();

  if (!response.ok) {
    showAlert(alertBox, data.error || 'Credential sync failed', 'error');
    return;
  }

  closeCertModal();
  await loadCerts();
  await loadOverview();
}

function openConfirm(message, callback) {
  confirmCallback = callback;
  document.getElementById('confirm-msg').textContent = message;
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

function buildEmptyState(iconClass, message) {
  return `
    <div class="empty-state">
      <i class="${iconClass}"></i>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function initMatrixRain() {
  const canvas = document.getElementById('matrix-rain');
  matrixContext = canvas.getContext('2d');

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const fontSize = window.innerWidth < 768 ? 12 : 14;
    const totalColumns = Math.ceil(canvas.width / fontSize);
    matrixColumns = Array.from({ length: totalColumns }, () => Math.random() * canvas.height / fontSize);
    canvas.dataset.fontSize = String(fontSize);
  };

  const draw = () => {
    if (!matrixContext) {
      return;
    }

    const fontSize = Number(canvas.dataset.fontSize || 14);

    matrixContext.fillStyle = 'rgba(1, 4, 3, 0.08)';
    matrixContext.fillRect(0, 0, canvas.width, canvas.height);
    matrixContext.fillStyle = 'rgba(89, 255, 172, 0.75)';
    matrixContext.font = `${fontSize}px "Share Tech Mono"`;

    matrixColumns.forEach((columnY, index) => {
      const char = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
      const x = index * fontSize;
      const y = columnY * fontSize;

      matrixContext.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        matrixColumns[index] = 0;
      } else {
        matrixColumns[index] += 1;
      }
    });
  };

  resize();
  window.addEventListener('resize', resize);
  window.setInterval(draw, 52);
}

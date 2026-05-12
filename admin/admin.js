// ─── State ──────────────────────────────────────────────────────────────────
let token = localStorage.getItem('admin_token') || '';
let currentSkillCat = 'frontend';
let allSkills = [];
let allProjects = [];
let allCerts = [];
let confirmCallback = null;

// ─── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    showDashboard();
    loadOverview();
  }

  // Login
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const err = document.getElementById('login-error');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
    btn.disabled = true;
    err.classList.add('hidden');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: document.getElementById('login-username').value,
          password: document.getElementById('login-password').value
        })
      });
      const data = await res.json();
      if (res.ok) {
        token = data.token;
        localStorage.setItem('admin_token', token);
        showDashboard();
        loadOverview();
      } else {
        showAlert(err, data.error || 'Invalid credentials', 'error');
      }
    } catch {
      showAlert(err, 'Connection error', 'error');
    }
    btn.innerHTML = '<span>Sign In</span><i class="fa-solid fa-arrow-right-to-bracket"></i>';
    btn.disabled = false;
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    token = '';
    localStorage.removeItem('admin_token');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
  });

  // Sidebar nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });

  // Sidebar toggle (mobile)
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Skill tabs
  document.querySelectorAll('.skill-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSkillCat = tab.dataset.cat;
      renderSkills();
    });
  });

  // Project form
  document.getElementById('project-form').addEventListener('submit', saveProject);
  document.getElementById('skill-form').addEventListener('submit', saveSkill);
  document.getElementById('cert-form').addEventListener('submit', saveCert);
  document.getElementById('content-form').addEventListener('submit', saveContent);

  // Image preview
  document.getElementById('p-image').addEventListener('input', (e) => {
    const preview = document.getElementById('img-preview');
    if (e.target.value) {
      preview.innerHTML = `<img src="${e.target.value}" onerror="this.parentElement.innerHTML=''" />`;
    } else {
      preview.innerHTML = '';
    }
  });

  // Close modals on overlay click
  document.getElementById('project-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeProjectModal();
  });
  document.getElementById('skill-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeSkillModal();
  });
  document.getElementById('confirm-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeConfirm();
  });
  document.getElementById('cert-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCertModal();
  });
});

// ─── Auth helper ─────────────────────────────────────────────────────────────
async function api(method, url, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (res.status === 401) {
    token = '';
    localStorage.removeItem('admin_token');
    location.reload();
  }
  return res;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function showAlert(el, msg, type = 'error') {
  el.textContent = msg;
  el.className = `alert alert-${type}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
}

function switchSection(name) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === name));
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById('section-' + name).classList.remove('hidden');
  const titles = { overview:'Overview', projects:'Projects', skills:'Skills', messages:'Messages', certificates:'Certificates', content:'Content' };
  const subs = { overview:'Dashboard summary', projects:'Manage your projects', skills:'Manage tech skills', messages:'Contact form submissions', certificates:'Manage certificates & awards', content:'Edit portfolio text' };
  document.getElementById('section-title').textContent = titles[name] || name;
  document.getElementById('section-sub').textContent = subs[name] || '';

  if (name === 'projects') loadProjects();
  if (name === 'skills') loadSkills();
  if (name === 'messages') loadMessages();
  if (name === 'certificates') loadCerts();
  if (name === 'content') loadContent();
}

// ─── Overview ────────────────────────────────────────────────────────────────
async function loadOverview() {
  const [pRes, sRes, mRes, cRes] = await Promise.all([
    api('GET', '/api/admin/projects'),
    api('GET', '/api/admin/skills'),
    api('GET', '/api/admin/messages'),
    api('GET', '/api/admin/certificates')
  ]);
  const projects = await pRes.json();
  const skills = await sRes.json();
  const messages = await mRes.json();
  const certs = await cRes.json();
  const unread = messages.filter(m => !m.read).length;

  document.getElementById('stat-projects').textContent = projects.length;
  document.getElementById('stat-skills').textContent = skills.length;
  document.getElementById('stat-messages').textContent = messages.length;
  document.getElementById('stat-unread').textContent = unread;
  document.getElementById('stat-certs').textContent = certs.length;

  if (unread > 0) {
    const badge = document.getElementById('unread-badge');
    badge.textContent = unread;
    badge.style.display = 'inline';
  }
}

// ─── Projects ────────────────────────────────────────────────────────────────
async function loadProjects() {
  const res = await api('GET', '/api/admin/projects');
  allProjects = await res.json();
  renderProjects();
}

function renderProjects() {
  const list = document.getElementById('projects-list');
  if (!allProjects.length) { list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem">No projects yet.</p>'; return; }

  list.innerHTML = allProjects.map(p => {
    const tags = Array.isArray(p.tech_tags) ? p.tech_tags : (p.tech_tags || '').split(',');
    const tagsHtml = tags.filter(Boolean).map(t => `<span class="tag">${t.trim()}</span>`).join('');
    const imgHtml = p.image_url
      ? `<div class="admin-card-img"><img src="${p.image_url}" onerror="this.parentElement.innerHTML='<i class=\\'fa-solid fa-image\\'></i>'" /></div>`
      : `<div class="admin-card-img"><i class="fa-solid fa-laptop-code"></i></div>`;
    return `
    <div class="admin-card">
      ${imgHtml}
      <div class="admin-card-body">
        <div class="admin-card-title">${p.title}</div>
        <div class="admin-card-desc">${p.description || ''}</div>
        <div class="admin-card-tags">${tagsHtml}
          <span class="visibility-badge ${p.visible ? 'vis-yes' : 'vis-no'}">${p.visible ? 'Visible' : 'Hidden'}</span>
        </div>
      </div>
      <div class="admin-card-actions">
        <button class="btn-icon" onclick="editProject(${p.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon danger" onclick="deleteProject(${p.id},'${p.title.replace(/'/g,"\\'")}') " title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

function openProjectModal(data) {
  document.getElementById('project-modal-title').textContent = data ? 'Edit Project' : 'Add Project';
  document.getElementById('project-id').value = data ? data.id : '';
  document.getElementById('p-title').value = data ? data.title : '';
  document.getElementById('p-badge').value = data ? (data.badge || 'Live') : 'Live';
  document.getElementById('p-description').value = data ? (data.description || '') : '';
  document.getElementById('p-image').value = data ? (data.image_url || '') : '';
  document.getElementById('p-demo').value = data ? (data.demo_url || '') : '';
  document.getElementById('p-github').value = data ? (data.github_url || '') : '';
  const tags = data ? (Array.isArray(data.tech_tags) ? data.tech_tags.join(', ') : (data.tech_tags || '')) : '';
  document.getElementById('p-tags').value = tags;
  document.getElementById('p-order').value = data ? (data.sort_order || 0) : 0;
  document.getElementById('p-visible').value = data ? (data.visible ? '1' : '0') : '1';
  const preview = document.getElementById('img-preview');
  preview.innerHTML = (data && data.image_url) ? `<img src="${data.image_url}" />` : '';
  document.getElementById('project-alert').classList.add('hidden');
  document.getElementById('project-modal').classList.remove('hidden');
}

function closeProjectModal() {
  document.getElementById('project-modal').classList.add('hidden');
}

function editProject(id) {
  const p = allProjects.find(x => x.id === id);
  if (p) openProjectModal(p);
}

function deleteProject(id, title) {
  openConfirm(`Delete project "${title}"? This cannot be undone.`, async () => {
    await api('DELETE', `/api/admin/projects/${id}`);
    loadProjects();
    loadOverview();
  });
}

async function saveProject(e) {
  e.preventDefault();
  const id = document.getElementById('project-id').value;
  const alert = document.getElementById('project-alert');
  const tags = document.getElementById('p-tags').value.split(',').map(t => t.trim()).filter(Boolean);

  const payload = {
    title: document.getElementById('p-title').value,
    description: document.getElementById('p-description').value,
    image_url: document.getElementById('p-image').value,
    demo_url: document.getElementById('p-demo').value,
    github_url: document.getElementById('p-github').value,
    tech_tags: tags,
    badge: document.getElementById('p-badge').value,
    sort_order: parseInt(document.getElementById('p-order').value) || 0,
    visible: document.getElementById('p-visible').value === '1'
  };

  const res = id
    ? await api('PUT', `/api/admin/projects/${id}`, payload)
    : await api('POST', '/api/admin/projects', payload);
  const data = await res.json();

  if (res.ok) {
    closeProjectModal();
    loadProjects();
    loadOverview();
  } else {
    showAlert(alert, data.error || 'Save failed', 'error');
  }
}

// ─── Skills ──────────────────────────────────────────────────────────────────
async function loadSkills() {
  const res = await api('GET', '/api/admin/skills');
  allSkills = await res.json();
  renderSkills();
}

function renderSkills() {
  const list = document.getElementById('skills-list');
  const filtered = allSkills.filter(s => s.category === currentSkillCat);
  if (!filtered.length) { list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;grid-column:1/-1">No skills in this category yet.</p>'; return; }

  list.innerHTML = filtered.map(s => {
    const iconHtml = s.icon_url
      ? `<img src="${s.icon_url}" />`
      : `<i class="${s.icon_class || 'fa-solid fa-star'}"></i>`;
    return `
    <div class="skill-admin-card">
      <div class="skill-admin-icon">${iconHtml}</div>
      <span class="skill-admin-name">${s.name}</span>
      <div class="skill-admin-actions">
        <button class="btn-icon" onclick="editSkill(${s.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon danger" onclick="deleteSkill(${s.id},'${s.name.replace(/'/g,"\\'")}')"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

function openSkillModal(data) {
  document.getElementById('skill-modal-title').textContent = data ? 'Edit Skill' : 'Add Skill';
  document.getElementById('skill-id').value = data ? data.id : '';
  document.getElementById('s-name').value = data ? data.name : '';
  document.getElementById('s-icon').value = data ? (data.icon_class || '') : '';
  document.getElementById('s-icon-url').value = data ? (data.icon_url || '') : '';
  document.getElementById('s-category').value = data ? (data.category || 'frontend') : currentSkillCat;
  document.getElementById('s-order').value = data ? (data.sort_order || 0) : 0;
  document.getElementById('skill-alert').classList.add('hidden');
  document.getElementById('skill-modal').classList.remove('hidden');
}

function closeSkillModal() {
  document.getElementById('skill-modal').classList.add('hidden');
}

function editSkill(id) {
  const s = allSkills.find(x => x.id === id);
  if (s) openSkillModal(s);
}

function deleteSkill(id, name) {
  openConfirm(`Delete skill "${name}"?`, async () => {
    await api('DELETE', `/api/admin/skills/${id}`);
    loadSkills();
  });
}

async function saveSkill(e) {
  e.preventDefault();
  const id = document.getElementById('skill-id').value;
  const alert = document.getElementById('skill-alert');
  const payload = {
    name: document.getElementById('s-name').value,
    icon_class: document.getElementById('s-icon').value,
    icon_url: document.getElementById('s-icon-url').value,
    category: document.getElementById('s-category').value,
    sort_order: parseInt(document.getElementById('s-order').value) || 0,
    visible: true
  };
  const res = id
    ? await api('PUT', `/api/admin/skills/${id}`, payload)
    : await api('POST', '/api/admin/skills', payload);
  const data = await res.json();
  if (res.ok) { closeSkillModal(); loadSkills(); }
  else showAlert(alert, data.error || 'Save failed', 'error');
}

// ─── Messages ────────────────────────────────────────────────────────────────
async function loadMessages() {
  try {
    const res = await api('GET', '/api/admin/messages');
    const messages = await res.json();
    const list = document.getElementById('messages-list');
    const unread = messages.filter(m => !m.read_flag && !m.read).length;
    const countEl = document.getElementById('messages-count');
    if (countEl) countEl.textContent = messages.length + ' total · ' + unread + ' unread';

    if (!messages.length) {
      list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-envelope-open"></i><p>No messages yet.</p></div>';
      return;
    }

    list.innerHTML = messages.map(function(m) {
      var isRead = m.read === 1 || m.read === true;
      var date = m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) : '';
      return '<div class="msg-card ' + (isRead ? '' : 'msg-unread') + '" id="msg-' + m.id + '">'
        + '<div class="msg-header">'
        + '<div><div class="msg-sender">' + escHtml(m.name) + '</div><div class="msg-email">' + escHtml(m.email) + '</div></div>'
        + '<div style="display:flex;align-items:center;gap:.5rem">'
        + '<span class="msg-date">' + date + '</span>'
        + (!isRead ? '<button class="btn-icon" onclick="markRead(' + m.id + ')" title="Mark read"><i class="fa-solid fa-check"></i></button>' : '<span class="msg-badge read">Read</span>')
        + '<button class="btn-icon danger" onclick="deleteMsg(' + m.id + ')" title="Delete"><i class="fa-solid fa-trash"></i></button>'
        + '</div></div>'
        + '<div class="msg-body">' + escHtml(m.message) + '</div>'
        + '</div>';
    }).join('');
  } catch(e) {
    document.getElementById('messages-list').innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Failed to load messages.</p></div>';
  }
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function markRead(id) {
  await api('PUT', '/api/admin/messages/' + id + '/read');
  var card = document.getElementById('msg-' + id);
  if (card) {
    card.classList.remove('msg-unread');
    var btn = card.querySelector('.btn-icon:not(.danger)');
    if (btn) btn.outerHTML = '<span class="msg-badge read">Read</span>';
  }
  loadOverview();
}

function deleteMsg(id) {
  openConfirm('Delete this message?', async () => {
    await api('DELETE', `/api/admin/messages/${id}`);
    loadMessages();
    loadOverview();
  });
}

// ─── Content ─────────────────────────────────────────────────────────────────
async function loadContent() {
  const res = await api('GET', '/api/admin/content');
  const data = await res.json();
  const form = document.getElementById('content-form');
  Object.entries(data).forEach(([key, val]) => {
    const el = form.elements[key];
    if (el) el.value = val;
  });
}

async function saveContent(e) {
  e.preventDefault();
  const alert = document.getElementById('content-alert');
  const form = e.target;
  const payload = {};
  ['status_pill','hero_tagline','hero_description','about_slogan','about_description','email','location'].forEach(k => {
    if (form.elements[k]) payload[k] = form.elements[k].value;
  });
  const res = await api('PUT', '/api/admin/content', payload);
  const data = await res.json();
  if (res.ok) showAlert(alert, 'Saved successfully!', 'success');
  else showAlert(alert, data.error || 'Save failed', 'error');
}

// ─── Certificates ────────────────────────────────────────────────────────────
async function loadCerts() {
  const res = await api('GET', '/api/admin/certificates');
  allCerts = await res.json();
  renderCerts();
}

function renderCerts() {
  const list = document.getElementById('certificates-list');
  if (!allCerts.length) { list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem">No certificates yet. Add your first one!</p>'; return; }

  list.innerHTML = allCerts.map(c => {
    const typeIcon = c.type === 'award' ? 'fa-trophy' : 'fa-certificate';
    const typeColor = c.type === 'award' ? '#fbbf24' : '#60a5fa';
    return `
    <div class="admin-card">
      <div class="admin-card-img" style="background:linear-gradient(135deg,${typeColor}22,${typeColor}11)">
        <i class="fa-solid ${typeIcon}" style="color:${typeColor};font-size:1.5rem"></i>
      </div>
      <div class="admin-card-body">
        <div class="admin-card-title">${escHtml(c.title)}</div>
        <div class="admin-card-desc">${c.issuer ? escHtml(c.issuer) : ''}${c.issue_date ? ' · ' + escHtml(c.issue_date) : ''}</div>
        <div class="admin-card-tags">
          <span class="tag" style="color:${typeColor}">${c.type === 'award' ? 'Award' : 'Certificate'}</span>
          <span class="visibility-badge ${c.visible ? 'vis-yes' : 'vis-no'}">${c.visible ? 'Visible' : 'Hidden'}</span>
        </div>
      </div>
      <div class="admin-card-actions">
        <button class="btn-icon" onclick="editCert(${c.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon danger" onclick="deleteCert(${c.id},'${escHtml(c.title).replace(/'/g,"\\'")}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

function openCertModal(data) {
  document.getElementById('cert-modal-title').textContent = data ? 'Edit Certificate' : 'Add Certificate';
  document.getElementById('cert-id').value = data ? data.id : '';
  document.getElementById('c-title').value = data ? data.title : '';
  document.getElementById('c-issuer').value = data ? (data.issuer || '') : '';
  document.getElementById('c-date').value = data ? (data.issue_date || '') : '';
  document.getElementById('c-type').value = data ? (data.type || 'certificate') : 'certificate';
  document.getElementById('c-order').value = data ? (data.sort_order || 0) : 0;
  document.getElementById('c-url').value = data ? (data.credential_url || '') : '';
  document.getElementById('c-image').value = data ? (data.image_url || '') : '';
  document.getElementById('cert-alert').classList.add('hidden');
  document.getElementById('cert-modal').classList.remove('hidden');
}

function closeCertModal() {
  document.getElementById('cert-modal').classList.add('hidden');
}

function editCert(id) {
  const c = allCerts.find(x => x.id === id);
  if (c) openCertModal(c);
}

function deleteCert(id, title) {
  openConfirm(`Delete certificate "${title}"?`, async () => {
    await api('DELETE', `/api/admin/certificates/${id}`);
    loadCerts();
    loadOverview();
  });
}

async function saveCert(e) {
  e.preventDefault();
  const id = document.getElementById('cert-id').value;
  const alert = document.getElementById('cert-alert');
  const payload = {
    title: document.getElementById('c-title').value,
    issuer: document.getElementById('c-issuer').value,
    issue_date: document.getElementById('c-date').value,
    type: document.getElementById('c-type').value,
    sort_order: parseInt(document.getElementById('c-order').value) || 0,
    credential_url: document.getElementById('c-url').value,
    image_url: document.getElementById('c-image').value,
    visible: true
  };
  const res = id
    ? await api('PUT', `/api/admin/certificates/${id}`, payload)
    : await api('POST', '/api/admin/certificates', payload);
  const data = await res.json();
  if (res.ok) { closeCertModal(); loadCerts(); loadOverview(); }
  else showAlert(alert, data.error || 'Save failed', 'error');
}

// ─── Confirm modal ───────────────────────────────────────────────────────────
function openConfirm(msg, cb) {
  document.getElementById('confirm-msg').textContent = msg;
  confirmCallback = cb;
  document.getElementById('confirm-modal').classList.remove('hidden');
  document.getElementById('confirm-ok-btn').onclick = () => { cb(); closeConfirm(); };
}

function closeConfirm() {
  document.getElementById('confirm-modal').classList.add('hidden');
  confirmCallback = null;
}

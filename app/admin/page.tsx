'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';

// --- TYPES ---
interface Project {
  id: number;
  title: string;
  badge?: string;
  description?: string;
  image_url?: string;
  demo_url?: string;
  github_url?: string;
  tech_tags?: string[] | string;
  sort_order?: number;
  visible?: number | boolean;
}

interface Skill {
  id: number;
  name: string;
  category: 'frontend' | 'backend' | 'others';
  icon_class?: string;
  icon_url?: string;
  sort_order?: number;
}

interface Message {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read?: number | boolean;
  created_at?: string;
}

interface Certificate {
  id: number;
  title: string;
  issuer?: string;
  issue_date?: string;
  type?: 'certificate' | 'award';
  credential_url?: string;
  image_url?: string;
  sort_order?: number;
  visible?: number | boolean;
}

interface RecentActivity {
  type: string;
  title: string;
  description: string;
  time: string;
}

interface VisitorLog {
  id: number;
  ip_address?: string;
  city?: string;
  country?: string;
  lat?: number | string;
  lon?: number | string;
  page_path?: string;
  created_at?: string;
}

interface AnalyticsData {
  totalViews?: number;
  uniqueVisitors?: number;
  recentLogs?: VisitorLog[];
}

const SECTION_META: Record<string, { title: string; sub: string }> = {
  overview: { title: 'OVERVIEW', sub: 'root@system:~$ status --all' },
  projects: { title: 'PROJECTS', sub: 'root@projects:~$ ls --classified' },
  skills: { title: 'SKILLS', sub: 'root@skills:~$ cat exploit-db' },
  messages: { title: 'INTERCEPTS', sub: 'root@signals:~$ read --unread' },
  certificates: { title: 'CERTS', sub: 'root@certs:~$ verify --chain' },
  content: { title: 'PAYLOAD', sub: 'root@payload:~$ inject --config' },
  security: { title: 'SECURITY', sub: 'root@security:~$ passwd --root' },
};

const FAKE_COMMANDS = [
  { command: 'scan --ports', output: 'Ports 22, 80, 443, 8080 mapped. Secure relay intact.', state: 'ok' },
  { command: 'decrypt payload.enc', output: 'Payload unpacked. 4 encrypted modules exposed to root memory.', state: 'secure' },
  { command: 'access --secure-channel', output: 'Quantum tunnel accepted. Shadow link routed through node sigma.', state: 'secure' },
  { command: 'status --all', output: 'Firewall active. Telemetry green. Intrusion grid standing by.', state: 'ok' },
  { command: 'trace --ghost-session', output: 'Anomaly signatures mirrored into blackbox archive for review.', state: 'warn' },
];

export default function AdminPage() {
  // --- AUTH & BOOT STATE ---
  const [token, setToken] = useState<string>('');
  const [booting, setBooting] = useState<boolean>(true);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [threatOverlay, setThreatOverlay] = useState<{
    show: boolean;
    title: string;
    copy: string;
    attempt: string;
    browser: string;
    device: string;
    time: string;
    reason: string;
  } | null>(null);
  const [successOverlay, setSuccessOverlay] = useState<boolean>(false);

  // --- AUDIO STATE ---
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- NAVIGATION & UPTIME ---
  const [activeSection, setActiveSection] = useState<
    'overview' | 'projects' | 'skills' | 'messages' | 'content' | 'certificates' | 'security'
  >('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [uptime, setUptime] = useState<string>('00:00:00');
  const startTimeRef = useRef<number>(Date.now());

  // --- DATA ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentSkillTab, setCurrentSkillTab] = useState<'frontend' | 'backend' | 'others'>('frontend');
  const [messages, setMessages] = useState<Message[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState({
    views: '--',
    visitors: '--',
    projects: 0,
    skills: 0,
    messages: 0,
    unread: 0,
    certs: 0,
  });

  // --- CONTENT FORM ---
  const [contentForm, setContentForm] = useState({
    status_pill: '',
    hero_tagline: '',
    hero_description: '',
    about_slogan: '',
    about_description: '',
    email: '',
    location: '',
  });
  const [contentAlert, setContentAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // --- SECURITY FORM ---
  const [securityForm, setSecurityForm] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  });
  const [securityAlert, setSecurityAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // --- CONSOLE & SYSTEM LOG ---
  const [consoleEntries, setConsoleEntries] = useState<Array<{ command: string; output: string; state: string }>>([
    { command: 'status --all', output: 'Firewall active. Telemetry green. Core ready.', state: 'ok' },
    { command: 'scan --ports', output: 'Ports 22, 80, 443, 8080 secure.', state: 'secure' },
  ]);
  const [monitorStats, setMonitorStats] = useState({
    decryption: 72,
    masking: 81,
    shield: 94,
    temp: 41,
  });

  // --- MODALS ---
  const [projectModal, setProjectModal] = useState<{ open: boolean; data: Partial<Project> | null }>({
    open: false,
    data: null,
  });
  const [projectAlert, setProjectAlert] = useState<string>('');

  const [skillModal, setSkillModal] = useState<{ open: boolean; data: Partial<Skill> | null }>({
    open: false,
    data: null,
  });
  const [skillAlert, setSkillAlert] = useState<string>('');

  const [certModal, setCertModal] = useState<{ open: boolean; data: Partial<Certificate> | null }>({
    open: false,
    data: null,
  });
  const [certAlert, setCertAlert] = useState<string>('');

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => Promise<void> | void;
  }>({
    open: false,
    message: '',
    onConfirm: () => {},
  });

  // --- REFS ---
  const matrixCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any>(null);
  const recentLogsRef = useRef<VisitorLog[]>([]);

  // --- WEB AUDIO API SYNTHESIZER ---
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtor) {
        audioCtxRef.current = new AudioCtor();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'square', gainValue = 0.04) => {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx || ctx.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(gainValue, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      } catch {}
    },
    [soundEnabled, getAudioContext]
  );

  const playSuccessSound = useCallback(() => {
    playTone(520, 0.08, 'triangle', 0.05);
    setTimeout(() => playTone(780, 0.1, 'triangle', 0.05), 90);
    setTimeout(() => playTone(1040, 0.16, 'sine', 0.06), 180);
  }, [playTone]);

  const playThreatSound = useCallback(() => {
    playTone(220, 0.18, 'sawtooth', 0.08);
    setTimeout(() => playTone(180, 0.24, 'sawtooth', 0.09), 160);
    setTimeout(() => playTone(140, 0.32, 'sawtooth', 0.1), 340);
  }, [playTone]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('admin_sound_enabled', next ? '1' : '0');
    if (next) {
      getAudioContext();
      playTone(660, 0.06, 'sine', 0.05);
    }
  };

  // --- API HELPER ---
  const api = useCallback(
    async (method: string, url: string, body?: any) => {
      const activeToken = token || localStorage.getItem('admin_token') || '';
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
      };
      if (body) {
        options.body = JSON.stringify(body);
      }
      const response = await fetch(url, options);
      if (response.status === 401) {
        setToken('');
        localStorage.removeItem('admin_token');
      }
      return response;
    },
    [token]
  );

  // --- INITIAL CHECK & BOOT TERMINAL ---
  useEffect(() => {
    const savedSound = localStorage.getItem('admin_sound_enabled') === '1';
    setSoundEnabled(savedSound);

    const savedToken = localStorage.getItem('admin_token') || '';
    if (savedToken) {
      setToken(savedToken);
      setBooting(false);
      return;
    }

    const lines = [
      '[OK] INITIALIZING SECURE KERNEL 6.2.0-DARKNET',
      '[OK] LOADING CRYPTOGRAPHIC MODULES [AES-256-GCM]',
      '[OK] BYPASSING ISP GATEWAYS & ESTABLISHING TOR PROXY',
      '[OK] MOUNTING ENCRYPTED FILE SYSTEM',
      '[OK] FIREWALL RULES APPLIED: BLOCK ALL INCOMING',
      '[OK] CONNECTING TO TURSO NEURAL NODE',
      '[OK] BOOT COMPLETE. ROOT SHELL READY.',
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < lines.length) {
        setBootLines((prev) => [...prev, lines[current]]);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBooting(false), 400);
      }
    }, 180);

    return () => clearInterval(interval);
  }, []);

  // --- MATRIX RAIN ANIMATION ---
  useEffect(() => {
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const chars = '01ABCDEF<>[]{}#$%&*+=?-';
    let columns: number[] = [];
    const fontSize = 14;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.floor(canvas.width / fontSize);
      columns = Array.from({ length: count }, () => Math.floor(Math.random() * -50));
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 4, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < columns.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = columns[i] * fontSize;

        const isLead = Math.random() > 0.85;
        ctx.fillStyle = isLead ? '#ffffff' : i % 2 === 0 ? '#4dff9c' : '#57f7ff';
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          columns[i] = 0;
        } else {
          columns[i]++;
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // --- UPTIME COUNTER ---
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- LIVE CONSOLE & MONITOR TIMERS ---
  useEffect(() => {
    if (!token) return;

    let cmdIdx = 0;
    const cmdInterval = setInterval(() => {
      const nextCmd = FAKE_COMMANDS[cmdIdx % FAKE_COMMANDS.length];
      cmdIdx++;
      setConsoleEntries((prev) => [...prev.slice(-3), nextCmd]);
      playTone(480 + Math.random() * 80, 0.015, 'square', 0.005);
    }, 5000);

    const monInterval = setInterval(() => {
      setMonitorStats({
        decryption: Math.floor(70 + Math.random() * 8),
        masking: Math.floor(78 + Math.random() * 10),
        shield: Math.floor(92 + Math.random() * 5),
        temp: Math.floor(40 + Math.random() * 4),
      });
    }, 3200);

    return () => {
      clearInterval(cmdInterval);
      clearInterval(monInterval);
    };
  }, [token, playTone]);

  // --- LOAD OVERVIEW DATA ---
  const loadOverview = useCallback(async () => {
    try {
      const [projRes, skillRes, msgRes, certRes, anaRes, actRes] = await Promise.all([
        api('GET', '/api/admin/projects'),
        api('GET', '/api/admin/skills'),
        api('GET', '/api/admin/messages'),
        api('GET', '/api/admin/certificates'),
        api('GET', '/api/admin/analytics'),
        api('GET', '/api/admin/recent-activity'),
      ]);

      const [pData, sData, mData, cData, aData, actData]: [
        Project[],
        Skill[],
        Message[],
        Certificate[],
        AnalyticsData,
        RecentActivity[]
      ] = await Promise.all([
        projRes.ok ? projRes.json() : [],
        skillRes.ok ? skillRes.json() : [],
        msgRes.ok ? msgRes.json() : [],
        certRes.ok ? certRes.json() : [],
        anaRes.ok ? anaRes.json() : {},
        actRes.ok ? actRes.json() : [],
      ]);

      setProjects(Array.isArray(pData) ? pData : []);
      setSkills(Array.isArray(sData) ? sData : []);
      setMessages(Array.isArray(mData) ? mData : []);
      setCertificates(Array.isArray(cData) ? cData : []);
      setActivities(Array.isArray(actData) ? actData : []);

      const unreadCount = Array.isArray(mData)
        ? mData.filter((m: Message) => !m.read || m.read === 0).length
        : 0;

      setStats({
        views: String(aData.totalViews ?? 0),
        visitors: String(aData.uniqueVisitors ?? 0),
        projects: Array.isArray(pData) ? pData.length : 0,
        skills: Array.isArray(sData) ? sData.length : 0,
        messages: Array.isArray(mData) ? mData.length : 0,
        unread: unreadCount,
        certs: Array.isArray(cData) ? cData.length : 0,
      });

      if (aData.recentLogs) {
        recentLogsRef.current = aData.recentLogs;
        updateLeafletMap(aData.recentLogs);
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  }, [api]);

  // --- LEAFLET MAP ---
  const updateLeafletMap = (logs: VisitorLog[]) => {
    if (typeof window === 'undefined') return;
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 1,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      leafletMarkersRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
    }

    if (leafletMarkersRef.current) {
      leafletMarkersRef.current.clearLayers();
    }

    if (logs && logs.length > 0) {
      logs.forEach((log) => {
        const lat = Number(log.lat);
        const lon = Number(log.lon);
        if (isNaN(lat) || isNaN(lon)) return;

        const pingIcon = L.divIcon({
          className: 'custom-map-ping',
          html: '<div class="ping-circle"></div><div class="ping-core"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const marker = L.marker([lat, lon], { icon: pingIcon });
        marker.bindPopup(`
          <div style="font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #d8ffe8; background: #040d0a; padding: 6px 8px; border: 1px solid #4dff9c; border-radius: 6px;">
            <strong>IP:</strong> ${log.ip_address || 'Encrypted'}<br/>
            <strong>LOC:</strong> ${log.city || 'Unknown'}, ${log.country || 'Darknet'}<br/>
            <strong>PATH:</strong> ${log.page_path || '/'}
          </div>
        `);
        marker.addTo(leafletMarkersRef.current);
      });
    }
  };

  const handleLeafletLoaded = () => {
    if (recentLogsRef.current.length > 0) {
      updateLeafletMap(recentLogsRef.current);
    }
  };

  // --- SECTION DATA EFFECT ---
  useEffect(() => {
    if (!token) return;
    if (activeSection === 'overview') {
      loadOverview();
      setTimeout(() => {
        if (leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        } else if (recentLogsRef.current.length) {
          updateLeafletMap(recentLogsRef.current);
        }
      }, 150);
    } else if (activeSection === 'content') {
      api('GET', '/api/admin/content')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data === 'object') {
            setContentForm({
              status_pill: data.status_pill || '',
              hero_tagline: data.hero_tagline || '',
              hero_description: data.hero_description || '',
              about_slogan: data.about_slogan || '',
              about_description: data.about_description || '',
              email: data.email || '',
              location: data.location || '',
            });
          }
        })
        .catch(() => {});
    }
  }, [token, activeSection, loadOverview, api]);

  // --- LOGIN HANDLER ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        playThreatSound();

        const platform = typeof navigator !== 'undefined' ? navigator.platform || 'UNKNOWN' : 'UNKNOWN';
        const lang = typeof navigator !== 'undefined' ? navigator.language || 'EN' : 'EN';
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const browserLabel = ua.includes('Chrome')
          ? 'Chrome / Blink'
          : ua.includes('Firefox')
          ? 'Firefox / Gecko'
          : ua.includes('Safari')
          ? 'Safari / WebKit'
          : 'Unknown';

        setThreatOverlay({
          show: true,
          title: 'UNAUTHORIZED ACCESS',
          copy: 'Countermeasures active. Intruder telemetry locked.',
          attempt: String(nextAttempts).padStart(2, '0'),
          browser: browserLabel,
          device: `${platform} | ${lang}`,
          time: new Date().toLocaleTimeString(),
          reason: data.error || 'Credential mismatch detected',
        });

        setLoginError(data.error || 'Access denied. Countermeasures active.');
        setTimeout(() => setThreatOverlay(null), 3600);
        return;
      }

      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
      setFailedAttempts(0);
      playSuccessSound();
      setSuccessOverlay(true);
      setTimeout(() => {
        setSuccessOverlay(false);
      }, 1400);
    } catch {
      setLoginError('Connection tunnel failed. Check neural node status.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('admin_token');
    setUsername('');
    setPassword('');
    setThreatOverlay(null);
    setSuccessOverlay(false);
  };

  // --- PROJECT ACTIONS ---
  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectModal.data) return;
    setProjectAlert('');

    const p = projectModal.data;
    const isEdit = !!p.id;
    const url = isEdit ? `/api/admin/projects/${p.id}` : '/api/admin/projects';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await api(method, url, p);
      if (!res.ok) {
        const err = await res.json();
        setProjectAlert(err.error || 'Failed to save project');
        return;
      }
      playSuccessSound();
      setProjectModal({ open: false, data: null });
      loadOverview();
    } catch {
      setProjectAlert('Transmission failed.');
    }
  };

  const deleteProject = (id: number, title: string) => {
    setConfirmModal({
      open: true,
      message: `Terminate project payload "${title}"? This action cannot be reversed.`,
      onConfirm: async () => {
        await api('DELETE', `/api/admin/projects/${id}`);
        playTone(320, 0.1, 'sawtooth', 0.05);
        loadOverview();
      },
    });
  };

  // --- SKILL ACTIONS ---
  const saveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillModal.data) return;
    setSkillAlert('');

    const s = skillModal.data;
    const isEdit = !!s.id;
    const url = isEdit ? `/api/admin/skills/${s.id}` : '/api/admin/skills';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await api(method, url, s);
      if (!res.ok) {
        const err = await res.json();
        setSkillAlert(err.error || 'Failed to save exploit');
        return;
      }
      playSuccessSound();
      setSkillModal({ open: false, data: null });
      loadOverview();
    } catch {
      setSkillAlert('Transmission failed.');
    }
  };

  const deleteSkill = (id: number, name: string) => {
    setConfirmModal({
      open: true,
      message: `Delete exploit entry "${name}"?`,
      onConfirm: async () => {
        await api('DELETE', `/api/admin/skills/${id}`);
        playTone(320, 0.1, 'sawtooth', 0.05);
        loadOverview();
      },
    });
  };

  // --- MESSAGE ACTIONS ---
  const markMessageRead = async (id: number) => {
    await api('PUT', `/api/admin/messages/${id}/read`);
    playTone(700, 0.05, 'triangle', 0.04);
    loadOverview();
  };

  const deleteMessage = (id: number) => {
    setConfirmModal({
      open: true,
      message: 'Delete this intercepted transmission?',
      onConfirm: async () => {
        await api('DELETE', `/api/admin/messages/${id}`);
        playTone(320, 0.1, 'sawtooth', 0.05);
        loadOverview();
      },
    });
  };

  // --- CERTIFICATE ACTIONS ---
  const saveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certModal.data) return;
    setCertAlert('');

    const c = certModal.data;
    const isEdit = !!c.id;
    const url = isEdit ? `/api/admin/certificates/${c.id}` : '/api/admin/certificates';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await api(method, url, c);
      if (!res.ok) {
        const err = await res.json();
        setCertAlert(err.error || 'Failed to save credential');
        return;
      }
      playSuccessSound();
      setCertModal({ open: false, data: null });
      loadOverview();
    } catch {
      setCertAlert('Transmission failed.');
    }
  };

  const deleteCert = (id: number, title: string) => {
    setConfirmModal({
      open: true,
      message: `Delete certificate chain "${title}"?`,
      onConfirm: async () => {
        await api('DELETE', `/api/admin/certificates/${id}`);
        playTone(320, 0.1, 'sawtooth', 0.05);
        loadOverview();
      },
    });
  };

  // --- CONTENT SUBMIT ---
  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentAlert(null);
    try {
      const res = await api('PUT', '/api/admin/content', contentForm);
      if (res.ok) {
        playSuccessSound();
        setContentAlert({ msg: 'Payload deployed and synced successfully.', type: 'success' });
      } else {
        const err = await res.json();
        setContentAlert({ msg: err.error || 'Injection failed.', type: 'error' });
      }
    } catch {
      setContentAlert({ msg: 'Connection failed.', type: 'error' });
    }
  };

  // --- SECURITY SUBMIT ---
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityAlert(null);

    if (securityForm.new_password !== securityForm.confirm_new_password) {
      setSecurityAlert({ msg: 'New password confirmation mismatch.', type: 'error' });
      return;
    }

    try {
      const res = await api('POST', '/api/admin/change-password', {
        currentPassword: securityForm.current_password,
        newPassword: securityForm.new_password,
      });
      const data = await res.json();
      if (res.ok) {
        playSuccessSound();
        setSecurityAlert({ msg: 'Security access key updated successfully.', type: 'success' });
        setSecurityForm({ current_password: '', new_password: '', confirm_new_password: '' });
      } else {
        setSecurityAlert({ msg: data.error || 'Failed to update credentials.', type: 'error' });
      }
    } catch {
      setSecurityAlert({ msg: 'Network failure.', type: 'error' });
    }
  };

  const currentMeta = SECTION_META[activeSection] || {
    title: activeSection.toUpperCase(),
    sub: 'root@system:~$ idle',
  };

  return (
    <div className={`admin-root-container ${threatOverlay ? 'threat-mode' : ''}`}>
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="afterInteractive"
        onLoad={handleLeafletLoaded}
      />

      {/* MATRIX RAIN CANVAS */}
      <canvas id="matrix-rain" ref={matrixCanvasRef} />

      {/* CRT SCANLINE OVERLAY */}
      <div className="scanlines" />

      {/* BOOT SEQUENCE */}
      {booting && (
        <div id="boot-screen" className="boot-screen">
          <div className="boot-terminal">
            <div className="boot-lines">
              {bootLines.map((line, idx) => (
                <div key={idx} className="boot-line">
                  {line}
                </div>
              ))}
            </div>
            <div className="boot-cursor">[]</div>
          </div>
        </div>
      )}

      {/* THREAT OVERLAY */}
      {threatOverlay && (
        <div id="threat-overlay" className="threat-overlay threat-show">
          <div className="threat-panel">
            <div className="threat-kicker">INTRUSION DETECTED</div>
            <h2>{threatOverlay.title}</h2>
            <p className="threat-copy">{threatOverlay.copy}</p>
            <div className="threat-grid">
              <div className="threat-cell">
                <span>ATTEMPT</span>
                <strong>{threatOverlay.attempt}</strong>
              </div>
              <div className="threat-cell">
                <span>BROWSER</span>
                <strong>{threatOverlay.browser}</strong>
              </div>
              <div className="threat-cell">
                <span>DEVICE</span>
                <strong>{threatOverlay.device}</strong>
              </div>
              <div className="threat-cell">
                <span>TIME MARK</span>
                <strong>{threatOverlay.time}</strong>
              </div>
            </div>
            <div className="threat-footer">
              <span>[!] Session route burned</span>
              <span>{threatOverlay.reason}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS OVERLAY */}
      {successOverlay && (
        <div id="success-overlay" className="success-overlay">
          <div className="success-panel">
            <div className="success-kicker">AUTHENTICATION COMPLETE</div>
            <h2>ACCESS GRANTED</h2>
            <p className="success-copy">Root credentials verified. Secure channel unlocked.</p>
            <div className="success-grid">
              <div className="success-cell">
                <span>OPERATOR</span>
                <strong>ROOT</strong>
              </div>
              <div className="success-cell">
                <span>NODE</span>
                <strong>PRIMARY CORE</strong>
              </div>
              <div className="success-cell">
                <span>STATUS</span>
                <strong>CHANNEL OPEN</strong>
              </div>
              <div className="success-cell">
                <span>TIME MARK</span>
                <strong>{new Date().toLocaleTimeString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN SCREEN */}
      {!token && !booting && (
        <div id="login-screen" className="login-screen">
          <div className={`login-card ${threatOverlay ? 'shake-alert' : ''}`}>
            <div className="terminal-bar">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-title">root@darknet:~/auth</span>
            </div>
            <div className="login-body">
              <div className="login-logo">
                <div className="skull-icon">
                  <i className="fa-solid fa-skull-crossbones" />
                </div>
                <div className="glitch-text" data-text="ACCESS TERMINAL">
                  ACCESS TERMINAL
                </div>
              </div>
              <p className="login-sub">
                [<span className="blink">!</span>] UNAUTHORIZED ACCESS WILL BE TRACED AND PROSECUTED
              </p>

              <form onSubmit={handleLogin} className="login-form">
                <div className="field-group">
                  <label>
                    <i className="fa-solid fa-terminal" /> root@login:~$ username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="enter_username"
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="field-group">
                  <label>
                    <i className="fa-solid fa-key" /> root@login:~$ password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="**********"
                    required
                    autoComplete="current-password"
                  />
                </div>

                {loginError && <div className="alert alert-error">{loginError}</div>}

                <button type="submit" className="btn-login" disabled={loginLoading}>
                  <i className={loginLoading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-right-to-bracket'} />
                  <span>{loginLoading ? 'BYPASSING AUTH...' : 'INITIATE ACCESS'}</span>
                  <div className="btn-glitch" />
                </button>
              </form>

              <div className="login-footer-info">
                <span>
                  <i className="fa-solid fa-shield-halved" /> AES-256 ENCRYPTED
                </span>
                <span>
                  <i className="fa-solid fa-satellite-dish" /> TOR ROUTED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {token && (
        <div id="dashboard" className="dashboard">
          {/* SIDEBAR */}
          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
              <i className="fa-solid fa-skull" />
              <span>ROOT PANEL</span>
            </div>
            <div className="sidebar-status">
              <div className="status-dot" />
              <span>SYSTEM ACTIVE</span>
            </div>

            <nav className="sidebar-nav">
              {(
                [
                  { id: 'overview' as const, icon: 'fa-solid fa-satellite-dish', label: 'OVERVIEW', badge: 0 },
                  { id: 'projects' as const, icon: 'fa-solid fa-code', label: 'PROJECTS', badge: 0 },
                  { id: 'skills' as const, icon: 'fa-solid fa-microchip', label: 'SKILLS', badge: 0 },
                  { id: 'messages' as const, icon: 'fa-solid fa-tower-broadcast', label: 'INTERCEPTS', badge: stats.unread },
                  { id: 'certificates' as const, icon: 'fa-solid fa-fingerprint', label: 'CERTS', badge: 0 },
                  { id: 'content' as const, icon: 'fa-solid fa-file-code', label: 'PAYLOAD', badge: 0 },
                  { id: 'security' as const, icon: 'fa-solid fa-key', label: 'SECURITY', badge: 0 },
                ]
              ).map((item) => (
                <button
                  key={item.id}
                  className={`nav-btn ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <i className={item.icon} />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? <span className="badge">{item.badge}</span> : null}
                  <div className="nav-indicator" />
                </button>
              ))}
            </nav>

            <div className="sidebar-footer">
              <a href="/" target="_blank" rel="noreferrer" className="view-site-btn">
                <i className="fa-solid fa-globe" /> SURFACE WEB
              </a>
              <button className="logout-btn" onClick={handleLogout}>
                <i className="fa-solid fa-power-off" /> KILL SESSION
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="main-content">
            {/* HEADER */}
            <header className="dash-header">
              <div className="dash-header-left">
                <button
                  className="sidebar-toggle"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  aria-label="Toggle Navigation"
                >
                  <i className="fa-solid fa-bars" />
                </button>
                <div>
                  <h2 className="glitch-text-sm" data-text={currentMeta.title}>
                    {currentMeta.title}
                  </h2>
                  <p className="dash-sub">{currentMeta.sub}</p>
                </div>
              </div>

              <div className="dash-header-right">
                <div className="header-stats">
                  <button
                    className={`sound-toggle ${soundEnabled ? 'active' : ''}`}
                    onClick={toggleSound}
                    type="button"
                    aria-label="Toggle Sound"
                  >
                    <i className={soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark'} />
                    <span>{soundEnabled ? 'SOUND ON' : 'MUTED'}</span>
                  </button>

                  <span className="uptime-chip">
                    <i className="fa-solid fa-clock" /> <span>{uptime}</span>
                  </span>

                  <span className="admin-chip">
                    <i className="fa-solid fa-user-secret" /> ROOT
                  </span>
                </div>
              </div>
            </header>

            <div className="sections-wrap">
              {/* SECTION: OVERVIEW */}
              <section id="section-overview" className={`section ${activeSection === 'overview' ? 'active' : 'hidden'}`}>
                {/* METRIC STATS */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-glow" />
                    <i className="fa-solid fa-eye" style={{ color: '#57f7ff' }} />
                    <div>
                      <span className="stat-num">{stats.views}</span>
                      <span className="stat-label">TOTAL VIEWS</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-glow" />
                    <i className="fa-solid fa-users" style={{ color: '#7d57ff' }} />
                    <div>
                      <span className="stat-num">{stats.visitors}</span>
                      <span className="stat-label">VISITORS</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-glow" />
                    <i className="fa-solid fa-code" />
                    <div>
                      <span className="stat-num">{stats.projects}</span>
                      <span className="stat-label">PROJECTS</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-glow" />
                    <i className="fa-solid fa-tower-broadcast" />
                    <div>
                      <span className="stat-num">{stats.messages}</span>
                      <span className="stat-label">INTERCEPTS</span>
                    </div>
                  </div>
                </div>

                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginBottom: '1.5rem' }}>
                  <div className="stat-card">
                    <div className="stat-card-glow" />
                    <i className="fa-solid fa-inbox" style={{ color: '#ff5e7a' }} />
                    <div>
                      <span className="stat-num">{stats.unread}</span>
                      <span className="stat-label">UNREAD</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-glow" />
                    <i className="fa-solid fa-microchip" />
                    <div>
                      <span className="stat-num">{stats.skills}</span>
                      <span className="stat-label">EXPLOITS</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-glow" />
                    <i className="fa-solid fa-fingerprint" />
                    <div>
                      <span className="stat-num">{stats.certs}</span>
                      <span className="stat-label">CERTIFICATES</span>
                    </div>
                  </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="quick-actions">
                  <h3>
                    <i className="fa-solid fa-bolt" /> QUICK DEPLOY
                  </h3>
                  <div className="qa-buttons">
                    <button
                      onClick={() => {
                        setProjectModal({ open: true, data: { badge: 'Team Lead', visible: 1, sort_order: 0 } });
                      }}
                      className="qa-btn"
                    >
                      <i className="fa-solid fa-plus" /> Deploy Project
                    </button>
                    <button
                      onClick={() => {
                        setSkillModal({ open: true, data: { category: 'frontend', sort_order: 0 } });
                      }}
                      className="qa-btn"
                    >
                      <i className="fa-solid fa-plus" /> Add Exploit
                    </button>
                    <button
                      onClick={() => {
                        setCertModal({ open: true, data: { type: 'certificate', sort_order: 0 } });
                      }}
                      className="qa-btn"
                    >
                      <i className="fa-solid fa-plus" /> Add Cert
                    </button>
                    <button onClick={() => setActiveSection('messages')} className="qa-btn">
                      <i className="fa-solid fa-inbox" /> View Intercepts
                    </button>
                    <button onClick={() => setActiveSection('content')} className="qa-btn">
                      <i className="fa-solid fa-file-pen" /> Edit Payload
                    </button>
                  </div>
                </div>

                {/* INTEL GRID */}
                <div className="intel-grid">
                  <article className="intel-panel trace-panel">
                    <div className="panel-header">
                      <h3>
                        <i className="fa-solid fa-terminal" /> LIVE CONSOLE
                      </h3>
                      <span className="panel-chip">EXEC</span>
                    </div>
                    <div className="command-console">
                      <div className="command-console-bar">
                        <span className="terminal-dot red" />
                        <span className="terminal-dot yellow" />
                        <span className="terminal-dot green" />
                        <span className="command-console-title">root@system:~</span>
                      </div>
                      <div id="command-stream" className="command-stream">
                        {consoleEntries.map((entry, idx) => (
                          <div key={idx} className="command-entry">
                            <div className="command-line">
                              <span className="command-prompt">root@system:~$</span>
                              <span className="command-typed">{entry.command}</span>
                            </div>
                            <div className="command-output">
                              <span className={`command-state ${entry.state}`}>{entry.state}</span>
                              <span>{entry.output}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="console-examples">
                      <span className="console-example">scan --ports</span>
                      <span className="console-example">decrypt payload.enc</span>
                      <span className="console-example">access --secure-channel</span>
                      <span className="console-example">status --all</span>
                    </div>
                    <div className="trace-subhead">
                      <span>SYSTEM LOG</span>
                      <span>LIVE</span>
                    </div>
                    <div id="trace-feed" className="trace-feed compact-trace-feed">
                      <div className="trace-line">
                        <span className="trace-time">{new Date().toLocaleTimeString()}</span>
                        <span className="trace-text">{stats.projects} project payloads indexed in secure storage.</span>
                        <span className="trace-severity stable">STABLE</span>
                      </div>
                      <div className="trace-line">
                        <span className="trace-time">{new Date().toLocaleTimeString()}</span>
                        <span className="trace-text">{stats.skills} exploit entries active in skill database.</span>
                        <span className="trace-severity stable">STABLE</span>
                      </div>
                      <div className="trace-line">
                        <span className="trace-time">{new Date().toLocaleTimeString()}</span>
                        <span className="trace-text">{stats.unread} unread transmissions flagged out of {stats.messages} total.</span>
                        <span className={`trace-severity ${stats.unread > 0 ? 'alert' : 'stable'}`}>
                          {stats.unread > 0 ? 'ALERT' : 'STABLE'}
                        </span>
                      </div>
                    </div>
                  </article>

                  <article className="intel-panel network-panel">
                    <div className="panel-header">
                      <h3>
                        <i className="fa-solid fa-diagram-project" /> NETWORK CORE
                      </h3>
                      <span className="panel-chip">ARMED</span>
                    </div>
                    <div className="network-shell">
                      <div className="network-ring ring-outer" />
                      <div className="network-ring ring-middle" />
                      <div className="network-ring ring-inner" />
                      <div className="network-core-node">ROOT</div>
                      <div className="network-node node-api">API</div>
                      <div className="network-node node-db">DB</div>
                      <div className="network-node node-ui">UI</div>
                      <div className="network-node node-msg">MSG</div>
                    </div>
                    <div className="network-meta">
                      <div className="network-meta-card">
                        <span>FIREWALL</span>
                        <strong>ACTIVE</strong>
                      </div>
                      <div className="network-meta-card">
                        <span>ENCRYPTION</span>
                        <strong>AES-256</strong>
                      </div>
                      <div className="network-meta-card">
                        <span>THREAT LVL</span>
                        <strong>LOW</strong>
                      </div>
                    </div>
                  </article>
                </div>

                {/* SYSTEM MONITOR */}
                <div className="system-monitor" style={{ marginTop: '1.5rem' }}>
                  <div className="panel-header">
                    <h3>
                      <i className="fa-solid fa-sliders" /> SYSTEM MONITOR
                    </h3>
                    <span className="panel-chip">LIVE</span>
                  </div>
                  <div className="monitor-grid">
                    <div className="monitor-card">
                      <div className="monitor-head">
                        <span>DECRYPTION</span>
                        <strong>{monitorStats.decryption}%</strong>
                      </div>
                      <div className="monitor-bar">
                        <div className="monitor-fill" style={{ width: `${monitorStats.decryption}%` }} />
                      </div>
                    </div>
                    <div className="monitor-card">
                      <div className="monitor-head">
                        <span>SIGNAL MASKING</span>
                        <strong>{monitorStats.masking}%</strong>
                      </div>
                      <div className="monitor-bar">
                        <div className="monitor-fill cyan" style={{ width: `${monitorStats.masking}%` }} />
                      </div>
                    </div>
                    <div className="monitor-card">
                      <div className="monitor-head">
                        <span>PACKET SHIELD</span>
                        <strong>{monitorStats.shield}%</strong>
                      </div>
                      <div className="monitor-bar">
                        <div className="monitor-fill" style={{ width: `${monitorStats.shield}%` }} />
                      </div>
                    </div>
                    <div className="monitor-card">
                      <div className="monitor-head">
                        <span>CORE TEMP</span>
                        <strong>{monitorStats.temp}°C</strong>
                      </div>
                      <div className="monitor-bar">
                        <div className="monitor-fill warn" style={{ width: `${monitorStats.temp + 15}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RECENT SYSTEM ACTIVITY FEED */}
                <div className="system-monitor" style={{ marginTop: '1.5rem' }}>
                  <div className="panel-header">
                    <h3>
                      <i className="fa-solid fa-clock-rotate-left" /> RECENT SYSTEM ACTIVITY
                    </h3>
                    <span className="panel-chip">REALTIME</span>
                  </div>
                  <div id="recent-activity-feed" className="trace-feed compact-trace-feed" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {activities.length === 0 ? (
                      <div className="empty-state">
                        <p>No recent activity detected on neural bus.</p>
                      </div>
                    ) : (
                      activities.map((act, i) => {
                        let icon = 'fa-solid fa-circle-notch';
                        let sevClass = 'stable';
                        if (act.type === 'project') {
                          icon = 'fa-solid fa-code';
                          sevClass = 'stable';
                        } else if (act.type === 'message') {
                          icon = 'fa-solid fa-tower-broadcast';
                          sevClass = 'alert';
                        } else if (act.type === 'visitor') {
                          icon = 'fa-solid fa-satellite-dish';
                          sevClass = 'watch';
                        }

                        let timeString = '';
                        if (act.time) {
                          const d = new Date(act.time);
                          timeString =
                            d.toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                            }) +
                            ' ' +
                            d.toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            });
                        }

                        return (
                          <div key={i} className="trace-line">
                            <span className="trace-time">{timeString}</span>
                            <div className="trace-text">
                              <span className={`trace-icon-wrapper ${sevClass}`}>
                                <i className={icon} />
                              </span>
                              <strong style={{ color: 'var(--text-strong)', fontWeight: 600, marginRight: '0.35rem' }}>
                                {act.title}:
                              </strong>
                              <span>{act.description}</span>
                            </div>
                            <span className={`trace-severity ${sevClass}`}>{act.type.toUpperCase()}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* REALWORLD SIGNAL TRACKER MAP */}
                <div className="global-map-panel" style={{ marginTop: '1.5rem' }}>
                  <div className="panel-header">
                    <h3>
                      <i className="fa-solid fa-earth-asia" /> REALWORLD SIGNAL TRACKER
                    </h3>
                    <span className="panel-chip">GEOLOCATED</span>
                  </div>
                  <div
                    id="real-world-map"
                    ref={mapContainerRef}
                    style={{
                      height: '400px',
                      width: '100%',
                      borderRadius: '18px',
                      border: '1px solid rgba(77,255,156,0.12)',
                      background: '#030a07',
                      zIndex: 1,
                    }}
                  />
                  <div className="map-legend" style={{ marginTop: '0.95rem' }}>
                    <div className="map-legend-item">
                      <span className="legend-dot active" style={{ background: '#00ffd5' }} /> Visitor Ping
                    </div>
                    <div className="map-legend-item">
                      <span className="legend-dot relay" style={{ background: '#7d57ff' }} /> Surface Access
                    </div>
                    <div className="map-legend-item">
                      <span className="legend-dot ghost" style={{ background: '#57f7ff' }} /> Secure Core Node
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: PROJECTS */}
              <section id="section-projects" className={`section ${activeSection === 'projects' ? 'active' : 'hidden'}`}>
                <div className="section-actions">
                  <h3>
                    <i className="fa-solid fa-code" /> ALL PROJECTS
                  </h3>
                  <button
                    className="btn-primary"
                    onClick={() => setProjectModal({ open: true, data: { badge: 'Team Lead', visible: 1, sort_order: 0 } })}
                  >
                    <i className="fa-solid fa-plus" /> DEPLOY NEW
                  </button>
                </div>

                <div className="card-list" id="projects-list">
                  {projects.length === 0 ? (
                    <div className="empty-state">
                      <i className="fa-solid fa-code" />
                      <p>No deployed project payloads yet.</p>
                    </div>
                  ) : (
                    projects.map((p) => {
                      const tags = Array.isArray(p.tech_tags)
                        ? p.tech_tags
                        : String(p.tech_tags || '')
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean);
                      return (
                        <div key={p.id} className="admin-card">
                          <div className="admin-card-img">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.title}
                                onError={(e) => {
                                  (e.currentTarget.parentElement as HTMLElement).innerHTML =
                                    '<i class="fa-solid fa-laptop-code"></i>';
                                }}
                              />
                            ) : (
                              <i className="fa-solid fa-laptop-code" />
                            )}
                          </div>
                          <div className="admin-card-body">
                            <div className="admin-card-title">{p.title}</div>
                            <div className="admin-card-desc">{p.description || 'No mission notes attached.'}</div>
                            <div className="admin-card-tags">
                              {tags.map((tag, idx) => (
                                <span key={idx} className="tag">
                                  {tag}
                                </span>
                              ))}
                              {p.badge && (
                                <span
                                  className="tag"
                                  style={{
                                    color: '#ffd35d',
                                    borderColor: 'rgba(255, 211, 93, 0.35)',
                                    background: 'rgba(255, 211, 93, 0.1)',
                                  }}
                                >
                                  {p.badge}
                                </span>
                              )}
                              <span className={`visibility-badge ${p.visible ? 'vis-yes' : 'vis-no'}`}>
                                {p.visible ? 'ACTIVE' : 'HIDDEN'}
                              </span>
                              {p.demo_url && (
                                <a
                                  href={p.demo_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="tag"
                                  style={{
                                    color: '#57f7ff',
                                    borderColor: 'rgba(87, 247, 255, 0.3)',
                                    textDecoration: 'none',
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <i className="fa-solid fa-arrow-up-right-from-square" /> Live
                                </a>
                              )}
                              {p.github_url && (
                                <a
                                  href={p.github_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="tag"
                                  style={{
                                    color: 'var(--text-muted)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                    textDecoration: 'none',
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <i className="fa-brands fa-github" /> Repo
                                </a>
                              )}
                              <span
                                className="tag"
                                style={{
                                  color: 'var(--text-dim)',
                                  borderColor: 'rgba(255, 255, 255, 0.08)',
                                }}
                              >
                                #{p.sort_order ?? 0}
                              </span>
                            </div>
                          </div>
                          <div className="admin-card-actions">
                            <button
                              className="btn-icon"
                              onClick={() => setProjectModal({ open: true, data: { ...p } })}
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button
                              className="btn-icon danger"
                              onClick={() => deleteProject(p.id, p.title)}
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* SECTION: SKILLS */}
              <section id="section-skills" className={`section ${activeSection === 'skills' ? 'active' : 'hidden'}`}>
                <div className="section-actions" style={{ marginBottom: '1.2rem' }}>
                  <h3>
                    <i className="fa-solid fa-microchip" /> EXPLOIT DATABASE
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div className="skill-tabs" style={{ marginBottom: 0, padding: '0.25rem' }}>
                      {(['frontend', 'backend', 'others'] as const).map((cat) => (
                        <button
                          key={cat}
                          className={`skill-tab ${currentSkillTab === cat ? 'active' : ''}`}
                          onClick={() => setCurrentSkillTab(cat)}
                          style={{ padding: '0.5rem 0.9rem' }}
                        >
                          {cat.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => setSkillModal({ open: true, data: { category: currentSkillTab, sort_order: 0 } })}
                    >
                      <i className="fa-solid fa-plus" /> ADD EXPLOIT
                    </button>
                  </div>
                </div>

                <div className="skills-admin-grid" id="skills-list">
                  {skills.filter((s) => s.category === currentSkillTab).length === 0 ? (
                    <div style={{ gridColumn: '1 / -1' }} className="empty-state">
                      <i className="fa-solid fa-microchip" />
                      <p>No exploits indexed in this category.</p>
                    </div>
                  ) : (
                    skills
                      .filter((s) => s.category === currentSkillTab)
                      .map((s) => (
                        <div key={s.id} className="skill-admin-card">
                          <div className="skill-admin-icon">
                            {s.icon_url ? (
                              <img src={s.icon_url} alt={s.name} />
                            ) : (
                              <i className={s.icon_class || 'fa-solid fa-star'} />
                            )}
                          </div>
                          <span className="skill-admin-name">{s.name}</span>
                          <span
                            className="tag"
                            style={{
                              color: 'var(--text-dim)',
                              borderColor: 'rgba(255, 255, 255, 0.08)',
                              padding: '0.12rem 0.38rem',
                              fontSize: '0.62rem',
                            }}
                          >
                            #{s.sort_order ?? 0}
                          </span>
                          <div className="skill-admin-actions">
                            <button
                              className="btn-icon"
                              onClick={() => setSkillModal({ open: true, data: { ...s } })}
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button
                              className="btn-icon danger"
                              onClick={() => deleteSkill(s.id, s.name)}
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </section>

              {/* SECTION: MESSAGES */}
              <section id="section-messages" className={`section ${activeSection === 'messages' ? 'active' : 'hidden'}`}>
                <div className="section-actions">
                  <h3>
                    <i className="fa-solid fa-tower-broadcast" /> INTERCEPTED TRANSMISSIONS
                  </h3>
                  <span className="count-chip" id="messages-count">
                    {messages.length} total | {stats.unread} unread
                  </span>
                </div>

                <div className="messages-list" id="messages-list">
                  {messages.length === 0 ? (
                    <div className="empty-state">
                      <i className="fa-solid fa-satellite-dish" />
                      <p>No intercepted transmissions yet.</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const read = m.read === true || m.read === 1;
                      const date = m.created_at
                        ? new Date(m.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '';
                      return (
                        <div key={m.id} className={`msg-card ${read ? '' : 'msg-unread'}`} id={`msg-${m.id}`}>
                          <div className="msg-header">
                            <div>
                              <div className="msg-sender">{m.name}</div>
                              <div className="msg-email">{m.email}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              <span className="msg-date">{date}</span>
                              {read ? (
                                <span className="msg-badge read">READ</span>
                              ) : (
                                <button className="btn-icon" onClick={() => markMessageRead(m.id)} title="Mark read">
                                  <i className="fa-solid fa-check" />
                                </button>
                              )}
                              <button className="btn-icon danger" onClick={() => deleteMessage(m.id)} title="Delete">
                                <i className="fa-solid fa-trash" />
                              </button>
                            </div>
                          </div>
                          <div className="msg-body">{m.message}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* SECTION: CONTENT (PAYLOAD) */}
              <section id="section-content" className={`section ${activeSection === 'content' ? 'active' : 'hidden'}`}>
                <div className="section-actions">
                  <h3>
                    <i className="fa-solid fa-file-code" /> PAYLOAD EDITOR
                  </h3>
                </div>

                <form onSubmit={handleContentSubmit} className="content-form" id="content-form">
                  <div className="content-grid">
                    <div className="field-group">
                      <label>Status Pill Text</label>
                      <input
                        type="text"
                        value={contentForm.status_pill}
                        onChange={(e) => setContentForm({ ...contentForm, status_pill: e.target.value })}
                        placeholder="Available for new opportunities"
                      />
                    </div>
                    <div className="field-group">
                      <label>Hero Tagline</label>
                      <input
                        type="text"
                        value={contentForm.hero_tagline}
                        onChange={(e) => setContentForm({ ...contentForm, hero_tagline: e.target.value })}
                        placeholder="From Problem to Production-Ready."
                      />
                    </div>
                    <div className="field-group full">
                      <label>Hero Description</label>
                      <textarea
                        rows={3}
                        value={contentForm.hero_description}
                        onChange={(e) => setContentForm({ ...contentForm, hero_description: e.target.value })}
                      />
                    </div>
                    <div className="field-group">
                      <label>About Slogan</label>
                      <input
                        type="text"
                        value={contentForm.about_slogan}
                        onChange={(e) => setContentForm({ ...contentForm, about_slogan: e.target.value })}
                        placeholder="Building Digital Ecosystems"
                      />
                    </div>
                    <div className="field-group full">
                      <label>About Description</label>
                      <textarea
                        rows={4}
                        value={contentForm.about_description}
                        onChange={(e) => setContentForm({ ...contentForm, about_description: e.target.value })}
                      />
                    </div>
                    <div className="field-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={contentForm.email}
                        onChange={(e) => setContentForm({ ...contentForm, email: e.target.value })}
                      />
                    </div>
                    <div className="field-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={contentForm.location}
                        onChange={(e) => setContentForm({ ...contentForm, location: e.target.value })}
                      />
                    </div>
                  </div>

                  {contentAlert && (
                    <div className={`alert ${contentAlert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                      {contentAlert.msg}
                    </div>
                  )}

                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                    <i className="fa-solid fa-upload" /> INJECT PAYLOAD
                  </button>
                </form>
              </section>

              {/* SECTION: CERTIFICATES */}
              <section id="section-certificates" className={`section ${activeSection === 'certificates' ? 'active' : 'hidden'}`}>
                <div className="section-actions">
                  <h3>
                    <i className="fa-solid fa-fingerprint" /> CERTIFICATES &amp; CREDENTIALS
                  </h3>
                  <button
                    className="btn-primary"
                    onClick={() => setCertModal({ open: true, data: { type: 'certificate', sort_order: 0 } })}
                  >
                    <i className="fa-solid fa-plus" /> ADD CERT
                  </button>
                </div>

                <div className="card-list" id="certificates-list">
                  {certificates.length === 0 ? (
                    <div className="empty-state">
                      <i className="fa-solid fa-fingerprint" />
                      <p>No credential chains archived yet.</p>
                    </div>
                  ) : (
                    certificates.map((c) => {
                      const isAward = c.type === 'award';
                      const typeColor = isAward ? '#ffd35d' : '#57f7ff';
                      const typeLabel = isAward ? 'AWARD' : 'CERT';
                      const typeIcon = isAward ? 'fa-trophy' : 'fa-certificate';
                      return (
                        <div key={c.id} className="admin-card">
                          <div
                            className="admin-card-img"
                            style={{
                              background: `linear-gradient(135deg, ${typeColor}22, rgba(4, 13, 10, 0.95))`,
                            }}
                          >
                            <i className={`fa-solid ${typeIcon}`} style={{ color: typeColor, fontSize: '1.5rem' }} />
                          </div>
                          <div className="admin-card-body">
                            <div className="admin-card-title">{c.title}</div>
                            <div className="admin-card-desc">
                              {c.issuer || 'Unknown issuer'}
                              {c.issue_date ? ` | ${c.issue_date}` : ''}
                            </div>
                            <div className="admin-card-tags">
                              <span
                                className="tag"
                                style={{
                                  color: typeColor,
                                  borderColor: `${typeColor}33`,
                                  background: `${typeColor}12`,
                                }}
                              >
                                {typeLabel}
                              </span>
                              <span className="visibility-badge vis-yes">ACTIVE</span>
                              {c.credential_url && (
                                <a
                                  href={c.credential_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="tag"
                                  style={{
                                    color: '#57f7ff',
                                    borderColor: 'rgba(87, 247, 255, 0.3)',
                                    textDecoration: 'none',
                                  }}
                                >
                                  <i className="fa-solid fa-arrow-up-right-from-square" /> Verify
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="admin-card-actions">
                            <button
                              className="btn-icon"
                              onClick={() => setCertModal({ open: true, data: { ...c } })}
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button
                              className="btn-icon danger"
                              onClick={() => deleteCert(c.id, c.title)}
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* SECTION: SECURITY */}
              <section id="section-security" className={`section ${activeSection === 'security' ? 'active' : 'hidden'}`}>
                <div className="section-actions">
                  <h3>
                    <i className="fa-solid fa-key" /> SYSTEM SECURITY CREDENTIALS
                  </h3>
                </div>

                <form onSubmit={handleSecuritySubmit} className="content-form" id="password-change-form">
                  <div className="content-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '500px' }}>
                    <div className="field-group">
                      <label>
                        <i className="fa-solid fa-lock" /> CURRENT PASSWORD
                      </label>
                      <input
                        type="password"
                        value={securityForm.current_password}
                        onChange={(e) => setSecurityForm({ ...securityForm, current_password: e.target.value })}
                        required
                        placeholder="Enter current admin password..."
                      />
                    </div>
                    <div className="field-group">
                      <label>
                        <i className="fa-solid fa-unlock-keyhole" /> NEW PASSWORD
                      </label>
                      <input
                        type="password"
                        value={securityForm.new_password}
                        onChange={(e) => setSecurityForm({ ...securityForm, new_password: e.target.value })}
                        required
                        placeholder="Enter new admin password..."
                      />
                    </div>
                    <div className="field-group">
                      <label>
                        <i className="fa-solid fa-check-double" /> CONFIRM NEW PASSWORD
                      </label>
                      <input
                        type="password"
                        value={securityForm.confirm_new_password}
                        onChange={(e) =>
                          setSecurityForm({ ...securityForm, confirm_new_password: e.target.value })
                        }
                        required
                        placeholder="Confirm new admin password..."
                      />
                    </div>
                  </div>

                  {securityAlert && (
                    <div
                      className={`alert ${securityAlert.type === 'success' ? 'alert-success' : 'alert-error'}`}
                      style={{ marginTop: '15px' }}
                    >
                      {securityAlert.msg}
                    </div>
                  )}

                  <button type="submit" className="btn-primary" style={{ marginTop: '15px' }}>
                    <i className="fa-solid fa-shield-halved" /> UPDATE ACCESS KEY
                  </button>
                </form>
              </section>
            </div>
          </main>
        </div>
      )}

      {/* PROJECT MODAL */}
      {projectModal.open && projectModal.data && (
        <div id="project-modal" className="modal-overlay">
          <div className="modal">
            <div className="terminal-bar">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-title">root@projects:~/deploy</span>
            </div>
            <div className="modal-inner">
              <div className="modal-header">
                <h3>{projectModal.data.id ? 'Edit Project' : 'Deploy Project'}</h3>
                <button
                  className="modal-close"
                  onClick={() => setProjectModal({ open: false, data: null })}
                  aria-label="Close modal"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <form onSubmit={saveProject} className="modal-form">
                <div className="form-row">
                  <div className="field-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      required
                      value={projectModal.data.title || ''}
                      onChange={(e) =>
                        setProjectModal({
                          ...projectModal,
                          data: { ...projectModal.data, title: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field-group">
                    <label>Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. Team Lead, Live, System"
                      value={projectModal.data.badge || ''}
                      onChange={(e) =>
                        setProjectModal({
                          ...projectModal,
                          data: { ...projectModal.data, badge: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={projectModal.data.description || ''}
                    onChange={(e) =>
                      setProjectModal({
                        ...projectModal,
                        data: { ...projectModal.data, description: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="field-group">
                  <label>
                    <i className="fa-solid fa-image" /> Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://... or /img/projects/..."
                    value={projectModal.data.image_url || ''}
                    onChange={(e) =>
                      setProjectModal({
                        ...projectModal,
                        data: { ...projectModal.data, image_url: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label>
                      <i className="fa-solid fa-arrow-up-right-from-square" /> Live Demo URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={projectModal.data.demo_url || ''}
                      onChange={(e) =>
                        setProjectModal({
                          ...projectModal,
                          data: { ...projectModal.data, demo_url: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field-group">
                    <label>
                      <i className="fa-brands fa-github" /> GitHub URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={projectModal.data.github_url || ''}
                      onChange={(e) =>
                        setProjectModal({
                          ...projectModal,
                          data: { ...projectModal.data, github_url: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label>Tech Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, Next.js, Three.js"
                    value={
                      Array.isArray(projectModal.data.tech_tags)
                        ? projectModal.data.tech_tags.join(', ')
                        : projectModal.data.tech_tags || ''
                    }
                    onChange={(e) =>
                      setProjectModal({
                        ...projectModal,
                        data: { ...projectModal.data, tech_tags: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      value={projectModal.data.sort_order ?? 0}
                      onChange={(e) =>
                        setProjectModal({
                          ...projectModal,
                          data: { ...projectModal.data, sort_order: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div className="field-group">
                    <label>Visible</label>
                    <select
                      value={projectModal.data.visible ? 1 : 0}
                      onChange={(e) =>
                        setProjectModal({
                          ...projectModal,
                          data: { ...projectModal.data, visible: Number(e.target.value) },
                        })
                      }
                    >
                      <option value={1}>Yes</option>
                      <option value={0}>No (Hidden)</option>
                    </select>
                  </div>
                </div>

                {projectAlert && <div className="alert alert-error">{projectAlert}</div>}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setProjectModal({ open: false, data: null })}
                  >
                    ABORT
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className="fa-solid fa-upload" /> DEPLOY
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SKILL MODAL */}
      {skillModal.open && skillModal.data && (
        <div id="skill-modal" className="modal-overlay">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="terminal-bar">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-title">root@exploits:~/add</span>
            </div>
            <div className="modal-inner">
              <div className="modal-header">
                <h3>{skillModal.data.id ? 'Edit Exploit' : 'Add Exploit'}</h3>
                <button
                  className="modal-close"
                  onClick={() => setSkillModal({ open: false, data: null })}
                  aria-label="Close modal"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <form onSubmit={saveSkill} className="modal-form">
                <div className="field-group">
                  <label>Skill Name *</label>
                  <input
                    type="text"
                    required
                    value={skillModal.data.name || ''}
                    onChange={(e) =>
                      setSkillModal({
                        ...skillModal,
                        data: { ...skillModal.data, name: e.target.value },
                      })
                    }
                    placeholder="e.g. Next.js"
                  />
                </div>

                <div className="field-group">
                  <label>Font Awesome Icon Class</label>
                  <input
                    type="text"
                    value={skillModal.data.icon_class || ''}
                    onChange={(e) =>
                      setSkillModal({
                        ...skillModal,
                        data: { ...skillModal.data, icon_class: e.target.value },
                      })
                    }
                    placeholder="e.g. fa-brands fa-react"
                  />
                </div>

                <div className="field-group">
                  <label>OR Custom Icon Image URL</label>
                  <input
                    type="url"
                    value={skillModal.data.icon_url || ''}
                    onChange={(e) =>
                      setSkillModal({
                        ...skillModal,
                        data: { ...skillModal.data, icon_url: e.target.value },
                      })
                    }
                    placeholder="https://cdn.../icon.svg"
                  />
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label>Category</label>
                    <select
                      value={skillModal.data.category || 'frontend'}
                      onChange={(e) =>
                        setSkillModal({
                          ...skillModal,
                          data: { ...skillModal.data, category: e.target.value as any },
                        })
                      }
                    >
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      value={skillModal.data.sort_order ?? 0}
                      onChange={(e) =>
                        setSkillModal({
                          ...skillModal,
                          data: { ...skillModal.data, sort_order: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>

                {skillAlert && <div className="alert alert-error">{skillAlert}</div>}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setSkillModal({ open: false, data: null })}
                  >
                    ABORT
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className="fa-solid fa-upload" /> INJECT
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {certModal.open && certModal.data && (
        <div id="cert-modal" className="modal-overlay">
          <div className="modal" style={{ maxWidth: '560px' }}>
            <div className="terminal-bar">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-title">root@certs:~/add</span>
            </div>
            <div className="modal-inner">
              <div className="modal-header">
                <h3>{certModal.data.id ? 'Edit Certificate' : 'Add Certificate'}</h3>
                <button
                  className="modal-close"
                  onClick={() => setCertModal({ open: false, data: null })}
                  aria-label="Close modal"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <form onSubmit={saveCert} className="modal-form">
                <div className="field-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    required
                    value={certModal.data.title || ''}
                    onChange={(e) =>
                      setCertModal({
                        ...certModal,
                        data: { ...certModal.data, title: e.target.value },
                      })
                    }
                    placeholder="e.g. Meta Front-End Developer"
                  />
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label>Issuer</label>
                    <input
                      type="text"
                      value={certModal.data.issuer || ''}
                      onChange={(e) =>
                        setCertModal({
                          ...certModal,
                          data: { ...certModal.data, issuer: e.target.value },
                        })
                      }
                      placeholder="e.g. Meta / Coursera"
                    />
                  </div>
                  <div className="field-group">
                    <label>Issue Date</label>
                    <input
                      type="text"
                      value={certModal.data.issue_date || ''}
                      onChange={(e) =>
                        setCertModal({
                          ...certModal,
                          data: { ...certModal.data, issue_date: e.target.value },
                        })
                      }
                      placeholder="e.g. 2025"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label>Type</label>
                    <select
                      value={certModal.data.type || 'certificate'}
                      onChange={(e) =>
                        setCertModal({
                          ...certModal,
                          data: { ...certModal.data, type: e.target.value as any },
                        })
                      }
                    >
                      <option value="certificate">Certificate</option>
                      <option value="award">Award</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      value={certModal.data.sort_order ?? 0}
                      onChange={(e) =>
                        setCertModal({
                          ...certModal,
                          data: { ...certModal.data, sort_order: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label>
                    <i className="fa-solid fa-link" /> Credential URL
                  </label>
                  <input
                    type="url"
                    value={certModal.data.credential_url || ''}
                    onChange={(e) =>
                      setCertModal({
                        ...certModal,
                        data: { ...certModal.data, credential_url: e.target.value },
                      })
                    }
                    placeholder="https://coursera.org/verify/..."
                  />
                </div>

                {certAlert && <div className="alert alert-error">{certAlert}</div>}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setCertModal({ open: false, data: null })}
                  >
                    ABORT
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className="fa-solid fa-upload" /> INJECT
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM TERMINATION MODAL */}
      {confirmModal.open && (
        <div id="confirm-modal" className="modal-overlay">
          <div className="modal" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="terminal-bar">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-title">root@system:~/confirm</span>
            </div>
            <div className="modal-inner">
              <div className="confirm-icon">
                <i className="fa-solid fa-triangle-exclamation" />
              </div>
              <h3 className="confirm-title">[!] CONFIRM TERMINATION</h3>
              <p className="confirm-msg">{confirmModal.message}</p>
              <div className="modal-actions" style={{ justifyContent: 'center' }}>
                <button
                  className="btn-ghost"
                  onClick={() => setConfirmModal({ open: false, message: '', onConfirm: () => {} })}
                >
                  ABORT
                </button>
                <button
                  className="btn-danger"
                  onClick={async () => {
                    await confirmModal.onConfirm();
                    setConfirmModal({ open: false, message: '', onConfirm: () => {} });
                  }}
                >
                  TERMINATE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

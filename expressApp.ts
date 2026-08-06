import express from 'express';
import path from 'path';
import fs from 'fs';
import { Candidate, DPTMember, DeviceRecord, ElectionData } from './src/types';
import { getAdminFirestore } from './src/lib/firebaseAdmin';

function getWritableDataDir() {
  if (process.env.VERCEL || process.env.NOW_BUILDER || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'data');
  }
  try {
    const defaultDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    return defaultDir;
  } catch (err) {
    return path.join('/tmp', 'data');
  }
}

// Default initial data if store file does not exist
const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    noUrut: 1,
    nama: 'Rian Hidayat, S.Kom',
    panggilan: 'Rian',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    visi: 'Mewujudkan Karang Taruna yang Inovatif, Mandiri, dan Bermanfaat Berbasis Teknologi Digital.',
    misi: [
      'Mengembangkan potensi UMKM pemuda desa melalui pelatihan pemasaran digital.',
      'Menyediakan fasilitas pusat belajar dan internet kreatif bagi pemuda.',
      'Mempererat silaturahmi antar pemuda melalui kompetisi olahraga dan seni rutin.'
    ],
    jumlahSuara: 0
  },
  {
    id: 'cand-2',
    noUrut: 2,
    nama: 'Siti Rahmawati, A.Md',
    panggilan: 'Siti',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    visi: 'Karang Taruna Proaktif, Peduli Lingkungan, dan Berdaya Saing Tinggi.',
    misi: [
      'Membuat gerakan bank sampah dan edukasi kelestarian lingkungan desa.',
      'Menyelenggarakan bimbingan belajar dan beasiswa pemuda berprestasi.',
      'Mengaktifkan kembali sanggar seni budaya lokal dan festival tahunan.'
    ],
    jumlahSuara: 0
  },
  {
    id: 'cand-3',
    noUrut: 3,
    nama: 'Ahmad Fauzi',
    panggilan: 'Fauzi',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    visi: 'Pemuda Bersatu, Desa Maju: Karang Taruna Tanggap Sosial dan Gotong Royong.',
    misi: [
      'Membentuk tim relawan pemuda tanggap bencana dan aksi sosial.',
      'Mengadakan pelatihan kepemimpinan dan kewirausahaan pemuda.',
      'Meningkatkan transparansi anggaran dan kegiatan organisasi.'
    ],
    jumlahSuara: 0
  }
];

function normalizePhone(phone: string): string {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, ''); // strip non-digits
  if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

const INITIAL_DPT: DPTMember[] = [
  { id: 'dpt-1', nik: '081234567891', nama: 'Budi Santoso', rtRw: 'RT 01 / RW 02', hasVoted: false },
  { id: 'dpt-2', nik: '081234567892', nama: 'Ani Wijaya', rtRw: 'RT 01 / RW 02', hasVoted: false },
  { id: 'dpt-3', nik: '082198765432', nama: 'Doni Pratama', rtRw: 'RT 02 / RW 02', hasVoted: false },
  { id: 'dpt-4', nik: '085712345678', nama: 'Eka Putri', rtRw: 'RT 02 / RW 02', hasVoted: false },
  { id: 'dpt-5', nik: '081398765431', nama: 'Farhan Malik', rtRw: 'RT 03 / RW 02', hasVoted: false },
  { id: 'dpt-6', nik: '088812345678', nama: 'Gita Gutawa', rtRw: 'RT 03 / RW 02', hasVoted: false },
  { id: 'dpt-7', nik: '089612345678', nama: 'Hendra Setiawan', rtRw: 'RT 04 / RW 02', hasVoted: false },
  { id: 'dpt-8', nik: '087812345678', nama: 'Indah Permata', rtRw: 'RT 04 / RW 02', hasVoted: false },
  { id: 'dpt-9', nik: '083812345678', nama: 'Joko Susilo', rtRw: 'RT 05 / RW 02', hasVoted: false },
  { id: 'dpt-10', nik: '085212345678', nama: 'Kartika Sari', rtRw: 'RT 05 / RW 02', hasVoted: false }
];

interface EventStore {
  orgCode: string;
  orgName: string;
  adminPin: string;
  title: string;
  subtitle: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  candidates: Candidate[];
  dpt: DPTMember[];
  votedDevices: DeviceRecord[];
  createdAt?: string;
}

interface MultiStoreSchema {
  masterPin: string;
  activeOrgCode: string;
  orgs: Record<string, EventStore>;
}

const DEFAULT_EVENT_1: EventStore = {
  orgCode: 'KARTA-01',
  orgName: 'Karang Taruna Unit 05',
  adminPin: '1234',
  title: 'Pemilihan Ketua Karang Taruna Unit 05',
  subtitle: 'Periode 2026 - 2028 | Desa Sukamaju',
  status: 'ACTIVE',
  candidates: INITIAL_CANDIDATES,
  dpt: INITIAL_DPT,
  votedDevices: [],
  createdAt: new Date().toISOString()
};

const DEFAULT_EVENT_2: EventStore = {
  orgCode: 'KARTA-02',
  orgName: 'Karang Taruna Unit 02',
  adminPin: '1234',
  title: 'Pemilihan Ketua Karang Taruna Unit 02',
  subtitle: 'Periode 2026 - 2028 | Desa Harapan',
  status: 'ACTIVE',
  candidates: [
    {
      id: 'cand-201',
      noUrut: 1,
      nama: 'Bagus Setiawan, S.T.',
      panggilan: 'Bagus',
      fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      visi: 'Membangun Karang Taruna Kreatif, Digital, dan Berkelanjutan.',
      misi: ['Pelatihan digital marketing', 'Program peduli lingkungan'],
      jumlahSuara: 0
    },
    {
      id: 'cand-202',
      noUrut: 2,
      nama: 'Dina Mariani, S.Pd',
      panggilan: 'Dina',
      fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      visi: 'Mewujudkan Pemuda Mandiri, Agamis, dan Berdaya Saing.',
      misi: ['Kajian pemuda & bakti sosial', 'Olah raga & Seni Budaya'],
      jumlahSuara: 0
    }
  ],
  dpt: [
    { id: 'dpt-201', nik: '081112223334', nama: 'Andi Saputra', rtRw: 'RT 01 / RW 01', hasVoted: false },
    { id: 'dpt-202', nik: '081112223335', nama: 'Citra Dewi', rtRw: 'RT 01 / RW 01', hasVoted: false }
  ],
  votedDevices: [],
  createdAt: new Date().toISOString()
};

let multiStore: MultiStoreSchema = {
  masterPin: '123456789',
  activeOrgCode: 'KARTA-01',
  orgs: {
    'KARTA-01': DEFAULT_EVENT_1,
    'KARTA-02': DEFAULT_EVENT_2
  }
};

function withTimeout<T>(promise: Promise<T>, ms: number = 1500): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Firestore timeout')), ms);
    promise
      .then(res => { clearTimeout(timer); resolve(res); })
      .catch(err => { clearTimeout(timer); reject(err); });
  });
}

async function loadStoreFromFirestore() {
  try {
    const db = getAdminFirestore();
    if (!db) return;
    const docRef = db.collection('app_store').doc('election_data');
    const snap = await withTimeout(docRef.get(), 1500);
    if (snap.exists) {
      const data = snap.data() as MultiStoreSchema;
      if (data && data.orgs) {
        multiStore = { ...multiStore, ...data };
        console.log('Successfully synchronized election store from Firebase Firestore.');
        saveStoreToDisk();
      }
    } else {
      console.log('Initializing Firestore with initial election store document.');
      withTimeout(docRef.set(multiStore), 1500).catch(err => {
        console.warn('Firestore initial write notice:', err?.message || err);
      });
    }
  } catch (err: any) {
    console.warn('Firestore sync load notice (using local disk fallback):', err?.message || err);
  }
}

function saveStoreToDisk() {
  try {
    const dataDir = getWritableDataDir();
    const dataFile = path.join(dataDir, 'election_store.json');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFile, JSON.stringify(multiStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save election store to disk:', err);
  }
}

function saveStoreToFirestore() {
  try {
    const db = getAdminFirestore();
    if (!db) return;
    const docRef = db.collection('app_store').doc('election_data');
    withTimeout(docRef.set(multiStore), 1500).catch((err: any) => {
      // Gracefully handle permission errors or missing ADC without breaking app execution
      if (err?.code === 7 || (err?.message && String(err.message).includes('PERMISSION_DENIED'))) {
        console.warn('Firestore write notice: Permission denied for cloud sync. Persistent data saved safely to local storage.');
      } else {
        console.warn('Firestore write notice:', err?.message || err);
      }
    });
  } catch (err: any) {
    console.warn('Failed to trigger Firestore save:', err?.message || err);
  }
}

function saveStore() {
  saveStoreToDisk();
  saveStoreToFirestore();
}

function loadStore() {
  try {
    const dataDir = getWritableDataDir();
    const dataFile = path.join(dataDir, 'election_store.json');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, 'utf-8');
      const loaded = JSON.parse(raw);
      
      if (loaded.orgs && typeof loaded.orgs === 'object') {
        multiStore = { ...multiStore, ...loaded };
      } else if (loaded.candidates) {
        multiStore.orgs['KARTA-01'] = {
          orgCode: 'KARTA-01',
          orgName: 'Karang Taruna Unit 05',
          adminPin: loaded.adminPin || '1234',
          title: loaded.title || 'Pemilihan Ketua Karang Taruna Unit 05',
          subtitle: loaded.subtitle || 'Periode 2026 - 2028 | Desa Sukamaju',
          logoUrl: loaded.logoUrl || '',
          status: loaded.status || 'ACTIVE',
          candidates: loaded.candidates || INITIAL_CANDIDATES,
          dpt: loaded.dpt || INITIAL_DPT,
          votedDevices: loaded.votedDevices || []
        };
        saveStore();
      }
      console.log('Loaded election store from local disk cache.');
    } else {
      saveStoreToDisk();
    }
  } catch (err) {
    console.error('Failed to load store from disk:', err);
  }

  // Asynchronously load and sync from Firestore
  loadStoreFromFirestore();
}

loadStore();

export function getOrgCodeFromReq(req: express.Request): string {
  const queryOrg = req?.query ? (req.query.org || req.query.orgCode) : undefined;
  const headerOrg = req?.headers ? req.headers['x-org-code'] : undefined;
  const bodyOrg = req?.body ? (req.body.orgCode || req.body.org) : undefined;

  let code = String(queryOrg || headerOrg || bodyOrg || multiStore?.activeOrgCode || 'KARTA-01').trim().toUpperCase();
  if (!code || code === 'UNDEFINED' || code === 'NULL') code = multiStore?.activeOrgCode || 'KARTA-01';
  return code;
}

export function getOrgStore(orgCode: string): EventStore {
  const cleanCode = (orgCode || 'KARTA-01').trim().toUpperCase();
  if (!multiStore.orgs || typeof multiStore.orgs !== 'object') {
    multiStore.orgs = {};
  }
  if (!multiStore.orgs[cleanCode]) {
    // Auto-create new event store template
    multiStore.orgs[cleanCode] = {
      orgCode: cleanCode,
      orgName: `Organisasi ${cleanCode}`,
      adminPin: '1234',
      title: `Pemilihan Ketua Pemuda (${cleanCode})`,
      subtitle: `Periode 2026 - 2028`,
      status: 'ACTIVE',
      candidates: [...INITIAL_CANDIDATES],
      dpt: [...INITIAL_DPT],
      votedDevices: [],
      createdAt: new Date().toISOString()
    };
    saveStore();
  }
  const org = multiStore.orgs[cleanCode];
  if (!Array.isArray(org.candidates)) org.candidates = [...INITIAL_CANDIDATES];
  if (!Array.isArray(org.dpt)) org.dpt = [...INITIAL_DPT];
  if (!Array.isArray(org.votedDevices)) org.votedDevices = [];
  return org;
}

export function getCalculatedData(reqOrgCode?: string): ElectionData {
  const code = (reqOrgCode || multiStore.activeOrgCode || 'KARTA-01').toUpperCase();
  const event = getOrgStore(code);

  const candidates = Array.isArray(event.candidates) ? event.candidates : [];
  const dpt = Array.isArray(event.dpt) ? event.dpt : [];
  const votedDevices = Array.isArray(event.votedDevices) ? event.votedDevices : [];

  const totalDpt = dpt.length;
  const totalVotes = candidates.reduce((sum, c) => sum + (c?.jumlahSuara || 0), 0);
  const participationRate = totalDpt > 0 ? Math.round((totalVotes / totalDpt) * 100) : 0;

  const allOrgsList = Object.values(multiStore.orgs || {}).map(o => {
    const oCand = Array.isArray(o?.candidates) ? o.candidates : [];
    const oDpt = Array.isArray(o?.dpt) ? o.dpt : [];
    return {
      code: o?.orgCode || 'KARTA-01',
      name: o?.orgName || 'Organisasi',
      title: o?.title || '',
      subtitle: o?.subtitle || '',
      status: o?.status || 'ACTIVE',
      totalDpt: oDpt.length,
      totalVotes: oCand.reduce((s, c) => s + (c?.jumlahSuara || 0), 0),
      createdAt: o?.createdAt
    };
  });

  return {
    orgCode: event.orgCode || code,
    orgName: event.orgName || 'Organisasi',
    title: event.title || 'Pemilihan Ketua',
    subtitle: event.subtitle || '',
    logoUrl: event.logoUrl || '',
    status: event.status || 'ACTIVE',
    candidates: [...candidates].sort((a, b) => (a.noUrut || 0) - (b.noUrut || 0)),
    dpt,
    votedDevices,
    totalDpt,
    totalVotes,
    participationRate,
    lastUpdated: new Date().toISOString(),
    allOrgs: allOrgsList
  };
}

export const app = express();
app.use(express.json({ limit: '10mb' }));

// URL Normalization Middleware for Vercel Serverless & Local Runtime
app.use((req, res, next) => {
  let url = req.url || '/';

  try {
    const parsedUrl = new URL(url, 'http://localhost');
    const pathParam = parsedUrl.searchParams.get('path');

    if (pathParam !== null && pathParam !== undefined) {
      parsedUrl.searchParams.delete('path');
      const cleanPath = pathParam.startsWith('/') ? pathParam : '/' + pathParam;
      const searchStr = parsedUrl.searchParams.toString();
      const prefix = cleanPath.startsWith('/api') ? '' : '/api';
      url = prefix + (cleanPath === '/' ? '' : cleanPath) + (searchStr ? '?' + searchStr : '');
    } else {
      // Strip Vercel file paths if present (e.g. /api/index.ts/election/data -> /api/election/data)
      if (url.startsWith('/api/index.ts')) {
        url = url.substring('/api/index.ts'.length);
      } else if (url.startsWith('/api/index')) {
        url = url.substring('/api/index'.length);
      }

      // Ensure path starts with /api if missing or query string
      if (!url || url === '/' || url.startsWith('?')) {
        url = '/api' + url;
      } else if (!url.startsWith('/api')) {
        url = '/api' + (url.startsWith('/') ? url : '/' + url);
      }
    }

    // Strip double /api/api/ prefix if generated
    if (url.startsWith('/api/api/')) {
      url = '/api/' + url.substring('/api/api/'.length);
    }
  } catch (e) {
    console.error('URL normalization error:', e);
  }

  req.url = url;
  next();
});

// CORS middleware for Vercel and cross-origin calls
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Org-Code');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// API Root welcome endpoint
app.get(['/api', '/api/'], (req, res) => {
  res.json({ status: 'ok', message: 'E-Voting Karang Taruna API is ready', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', server: 'Vercel Express E-Voting API', timestamp: new Date().toISOString() });
});

// List All Organizations API
app.get(['/api/orgs', '/orgs'], (req, res) => {
  try {
    const currentCode = getOrgCodeFromReq(req);
    res.json({
      success: true,
      message: 'OK',
      activeOrgCode: currentCode,
      data: getCalculatedData(currentCode).allOrgs
    });
  } catch (err: any) {
    console.error('Error in /api/orgs:', err);
    res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
});

// 1. Get Election State & Realcount
app.get(['/api/election/data', '/election/data'], (req, res) => {
  try {
    const orgCode = getOrgCodeFromReq(req);
    res.json({
      success: true,
      message: 'OK',
      data: getCalculatedData(orgCode)
    });
  } catch (err: any) {
    console.error('Error in /api/election/data:', err);
    res.status(500).json({ success: false, message: err?.message || 'Gagal memuat data dari server.' });
  }
});

// 2. Check DPT Status
app.post(['/api/election/check-dpt', '/election/check-dpt'], (req, res) => {
  try {
    const { nik } = req.body || {};
    const orgCode = getOrgCodeFromReq(req);
    const event = getOrgStore(orgCode);

    if (!nik) {
      return res.status(400).json({ success: false, message: 'Nomor WhatsApp wajib diisi.' });
    }

    const cleanNik = String(nik).trim();
    const normInput = normalizePhone(cleanNik);

    const member = (event.dpt || []).find(m => {
      if (!m || !m.nik) return false;
      if (m.nik === cleanNik || m.nik.toLowerCase() === cleanNik.toLowerCase()) return true;
      if (normInput && normalizePhone(m.nik) === normInput) return true;
      return false;
    });

    if (!member) {
      return res.json({
        success: false,
        message: `Nomor WhatsApp tidak terdaftar di DPT Pemilihan (${event.orgName}).`
      });
    }

    return res.json({
      success: true,
      message: 'Anggota Terverifikasi',
      data: {
        id: member.id,
        nik: member.nik,
        nama: member.nama,
        rtRw: member.rtRw,
        hasVoted: member.hasVoted,
        votedAt: member.votedAt
      }
    });
  } catch (err: any) {
    console.error('Error in check-dpt:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Gagal memeriksa DPT.' });
  }
});

// 2b. Self-Registration DPT
app.post(['/api/election/register-dpt', '/election/register-dpt'], (req, res) => {
  try {
    const { nik, nama, rtRw } = req.body || {};
    const orgCode = getOrgCodeFromReq(req);
    const event = getOrgStore(orgCode);

    if (!nik || !nama) {
      return res.status(400).json({
        success: false,
        message: 'Nomor WhatsApp dan Nama Lengkap wajib diisi.'
      });
    }

    const cleanNik = String(nik).trim();
    const cleanNama = String(nama).trim();
    const cleanRtRw = String(rtRw || 'RT 01/RW 01').trim();
    const normInput = normalizePhone(cleanNik);

    const existing = (event.dpt || []).find(m => {
      if (!m || !m.nik) return false;
      if (m.nik === cleanNik || m.nik.toLowerCase() === cleanNik.toLowerCase()) return true;
      if (normInput && normalizePhone(m.nik) === normInput) return true;
      return false;
    });

    if (existing) {
      return res.json({
        success: true,
        alreadyRegistered: true,
        message: `Nomor WhatsApp ${cleanNik} sudah terdaftar sebelumnya atas nama "${existing.nama}".`,
        data: {
          id: existing.id,
          nik: existing.nik,
          nama: existing.nama,
          rtRw: existing.rtRw,
          hasVoted: existing.hasVoted,
          votedAt: existing.votedAt
        }
      });
    }

    const newMember: DPTMember = {
      id: 'dpt-' + Date.now(),
      nik: cleanNik,
      nama: cleanNama,
      rtRw: cleanRtRw,
      hasVoted: false
    };

    if (!Array.isArray(event.dpt)) event.dpt = [];
    event.dpt.push(newMember);
    saveStore();

    return res.json({
      success: true,
      alreadyRegistered: false,
      message: `Pendaftaran Mandiri Berhasil! Anda kini terdaftar di ${event.orgName}.`,
      data: newMember
    });
  } catch (err: any) {
    console.error('Error in register-dpt:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Gagal mendaftar DPT.' });
  }
});

// 3. Check Device Status
app.post(['/api/election/check-device', '/election/check-device'], (req, res) => {
  try {
    const { deviceId, fingerprintHash } = req.body || {};
    const orgCode = getOrgCodeFromReq(req);
    const event = getOrgStore(orgCode);

    const existingLock = (event.votedDevices || []).find(
      d => d && ((deviceId && d.deviceId === deviceId) || (fingerprintHash && d.fingerprintHash === fingerprintHash))
    );

    if (existingLock) {
      return res.json({
        success: true,
        hasVoted: true,
        message: 'Perangkat ini telah digunakan untuk memilih di event ini.',
        votedAt: existingLock.votedAt
      });
    }

    return res.json({
      success: true,
      hasVoted: false,
      message: 'Perangkat belum digunakan.'
    });
  } catch (err: any) {
    console.error('Error in check-device:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Gagal mengecek perangkat.' });
  }
});

// 4. Cast Vote
app.post(['/api/election/vote', '/election/vote'], (req, res) => {
  try {
    const { nik, candidateId, deviceId, fingerprintHash } = req.body || {};
    const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
    const orgCode = getOrgCodeFromReq(req);
    const event = getOrgStore(orgCode);

    if (event.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Sesi pemungutan suara sedang ditutup atau belum dibuka oleh Admin.'
      });
    }

    if (!nik || !candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Data pemilih dan pilihan kandidat tidak lengkap.'
      });
    }

    const cleanNik = String(nik).trim();
    const normInput = normalizePhone(cleanNik);

    const member = (event.dpt || []).find(m => {
      if (!m || !m.nik) return false;
      if (m.nik === cleanNik || m.nik.toLowerCase() === cleanNik.toLowerCase()) return true;
      if (normInput && normalizePhone(m.nik) === normInput) return true;
      return false;
    });

    if (!member) {
      return res.status(400).json({
        success: false,
        message: `Nomor WhatsApp tidak terdaftar di ${event.orgName}.`
      });
    }

    if (member.hasVoted) {
      return res.status(400).json({
        success: false,
        message: `Hak pilih untuk "${member.nama}" (${member.nik}) sudah digunakan sebelumnya.`
      });
    }

    const deviceLocked = (event.votedDevices || []).find(
      d => d && ((deviceId && d.deviceId === deviceId) || (fingerprintHash && d.fingerprintHash === fingerprintHash))
    );

    if (deviceLocked) {
      return res.status(400).json({
        success: false,
        message: 'PERINGATAN GANDA: Perangkat ini sudah pernah digunakan untuk memilih di event ini!'
      });
    }

    const candidate = (event.candidates || []).find(c => c && c.id === candidateId);
    if (!candidate) {
      return res.status(400).json({
        success: false,
        message: 'Kandidat pilihan tidak ditemukan.'
      });
    }

    const voteTime = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    
    candidate.jumlahSuara = (candidate.jumlahSuara || 0) + 1;
    member.hasVoted = true;
    member.votedAt = voteTime;

    const deviceRecord: DeviceRecord = {
      deviceId: deviceId || 'unknown_dev',
      fingerprintHash: fingerprintHash || 'unknown_fp',
      ip: String(clientIp),
      nik: member.nik,
      votedAt: voteTime
    };
    if (!Array.isArray(event.votedDevices)) event.votedDevices = [];
    event.votedDevices.push(deviceRecord);

    saveStore();

    return res.json({
      success: true,
      message: 'Suara Anda berhasil dikirim dan dicatat secara sah!',
      data: {
        voterName: member.nama,
        candidateName: candidate.nama,
        noUrut: candidate.noUrut,
        votedAt: voteTime
      }
    });
  } catch (err: any) {
    console.error('Error in vote handler:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Gagal memproses pilihan suara.' });
  }
});

// 5. Admin Login Verification
app.post(['/api/admin/login', '/admin/login'], (req, res) => {
  try {
    const { pin } = req.body || {};
    const orgCode = getOrgCodeFromReq(req);
    const event = getOrgStore(orgCode);

    if (pin === event.adminPin || pin === multiStore.masterPin || pin === '123456789') {
      return res.json({ success: true, message: 'Login Admin Berhasil' });
    }
    return res.status(401).json({ success: false, message: 'PIN Admin salah!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Gagal verifikasi login admin.' });
  }
});

// 6. Admin Candidate Management
app.post(['/api/admin/candidates', '/admin/candidates'], (req, res) => {
  try {
    const { pin, action, candidate } = req.body || {};
    const orgCode = getOrgCodeFromReq(req);
    const event = getOrgStore(orgCode);

    if (pin !== event.adminPin && pin !== multiStore.masterPin && pin !== '123456789') {
      return res.status(401).json({ success: false, message: 'Akses ditolak.' });
    }

    if (!Array.isArray(event.candidates)) event.candidates = [];

    if (action === 'ADD') {
      const newCand: Candidate = {
        id: 'cand-' + Date.now(),
        noUrut: candidate?.noUrut || event.candidates.length + 1,
        nama: candidate?.nama || 'Nama Calon',
        panggilan: candidate?.panggilan || candidate?.nama?.split(' ')[0] || 'Calon',
        fotoUrl: candidate?.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        visi: candidate?.visi || '',
        misi: Array.isArray(candidate?.misi) ? candidate.misi : (candidate?.misi ? String(candidate.misi).split('\n').filter(Boolean) : []),
        jumlahSuara: 0
      };
      event.candidates.push(newCand);
    } else if (action === 'EDIT' && candidate) {
      const idx = event.candidates.findIndex(c => c && c.id === candidate.id);
      if (idx !== -1) {
        event.candidates[idx] = {
          ...event.candidates[idx],
          noUrut: Number(candidate.noUrut) || event.candidates[idx].noUrut,
          nama: candidate.nama || event.candidates[idx].nama,
          panggilan: candidate.panggilan || event.candidates[idx].panggilan,
          fotoUrl: candidate.fotoUrl || event.candidates[idx].fotoUrl,
          visi: candidate.visi !== undefined ? candidate.visi : event.candidates[idx].visi,
          misi: Array.isArray(candidate.misi) ? candidate.misi : String(candidate.misi || '').split('\n').filter(Boolean)
        };
      }
    } else if (action === 'DELETE' && candidate) {
      event.candidates = event.candidates.filter(c => c && c.id !== candidate.id);
    }

    saveStore();
    return res.json({ success: true, message: 'Data kandidat diperbarui', data: getCalculatedData(orgCode) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Gagal memperbarui kandidat.' });
  }
});

// 7. Admin DPT Management
app.post(['/api/admin/dpt', '/admin/dpt'], (req, res) => {
  try {
    const { pin, action, dptMember, dptId } = req.body || {};
    const orgCode = getOrgCodeFromReq(req);
    const event = getOrgStore(orgCode);

    if (pin !== event.adminPin && pin !== multiStore.masterPin && pin !== '123456789') {
      return res.status(401).json({ success: false, message: 'Akses ditolak.' });
    }

    if (!Array.isArray(event.dpt)) event.dpt = [];

    if (action === 'ADD') {
      if (!dptMember?.nik || !dptMember?.nama) {
        return res.status(400).json({ success: false, message: 'NIK dan Nama Pemilih wajib diisi.' });
      }
      const exists = event.dpt.some(d => d && d.nik === dptMember.nik.trim());
      if (exists) {
        return res.status(400).json({ success: false, message: `NIK ${dptMember.nik} sudah terdaftar.` });
      }
      event.dpt.push({
        id: 'dpt-' + Date.now() + Math.random().toString(36).substring(2, 6),
        nik: dptMember.nik.trim(),
        nama: dptMember.nama.trim(),
        rtRw: dptMember.rtRw || 'RT 01 / RW 01',
        hasVoted: false
      });
    } else if (action === 'DELETE') {
      event.dpt = event.dpt.filter(d => d && d.id !== dptId);
    } else if (action === 'RESET_STATUS') {
      const member = event.dpt.find(d => d && d.id === dptId);
      if (member) {
        member.hasVoted = false;
        delete member.votedAt;
      }
    }

    saveStore();
    return res.json({ success: true, message: 'Daftar DPT diperbarui', data: getCalculatedData(orgCode) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Gagal mengelola DPT.' });
  }
});

// 8. Admin Bulk Import DPT
app.post(['/api/admin/import-dpt', '/admin/import-dpt'], (req, res) => {
  try {
    const { pin, rawText } = req.body || {};
    const orgCode = getOrgCodeFromReq(req);
    const event = getOrgStore(orgCode);

    if (pin !== event.adminPin && pin !== multiStore.masterPin && pin !== '123456789') {
      return res.status(401).json({ success: false, message: 'Akses ditolak.' });
    }

    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ success: false, message: 'Teks DPT tidak boleh kosong.' });
    }

    if (!Array.isArray(event.dpt)) event.dpt = [];

    const lines = rawText.split('\n');
    let addedCount = 0;
    let skippedCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let parts = trimmed.split(/[,;\t]/);
      if (parts.length < 2) {
        parts = trimmed.split(' ');
      }

      if (parts.length >= 2) {
        const nik = parts[0].trim();
        const nama = parts.slice(1, parts.length - 1).join(' ').trim() || parts[1].trim();
        const rtRw = parts.length >= 3 ? parts[parts.length - 1].trim() : 'RT Pemuda';

        if (nik && nama) {
          const exists = event.dpt.some(d => d && d.nik === nik);
          if (!exists) {
            event.dpt.push({
              id: 'dpt-' + Date.now() + Math.random().toString(36).substring(2, 6),
              nik,
              nama,
              rtRw: rtRw || 'RT Pemuda',
              hasVoted: false
            });
            addedCount++;
          } else {
            skippedCount++;
          }
        }
      }
    }

    saveStore();
    return res.json({
      success: true,
      message: `Berhasil menambahkan ${addedCount} anggota DPT baru. (${skippedCount} NIK duplikat dilewati).`,
      data: getCalculatedData(orgCode)
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Gagal impor DPT.' });
  }
});

// 9. Admin Settings & Controls
app.post(['/api/admin/settings', '/admin/settings'], (req, res) => {
  try {
    const { pin, status, newPin, title, subtitle, orgName, logoUrl, action, deviceId } = req.body || {};
    const orgCode = getOrgCodeFromReq(req);
    const event = getOrgStore(orgCode);

    if (pin !== event.adminPin && pin !== multiStore.masterPin && pin !== '123456789') {
      return res.status(401).json({ success: false, message: 'Akses ditolak.' });
    }

    if (status) {
      event.status = status;
    }
    if (newPin) {
      event.adminPin = newPin;
    }
    if (title !== undefined) {
      event.title = title;
    }
    if (subtitle !== undefined) {
      event.subtitle = subtitle;
    }
    if (orgName !== undefined) {
      event.orgName = orgName;
    }
    if (logoUrl !== undefined) {
      event.logoUrl = logoUrl;
    }

    if (!Array.isArray(event.candidates)) event.candidates = [];
    if (!Array.isArray(event.dpt)) event.dpt = [];
    if (!Array.isArray(event.votedDevices)) event.votedDevices = [];

    if (action === 'RESET_ELECTION') {
      event.candidates.forEach(c => { if (c) c.jumlahSuara = 0; });
      event.dpt.forEach(d => {
        if (d) {
          d.hasVoted = false;
          delete d.votedAt;
        }
      });
      event.votedDevices = [];
    } else if (action === 'CLEAR_ALL_DATA') {
      event.candidates = [];
      event.dpt = [];
      event.votedDevices = [];
    } else if (action === 'UNLOCK_DEVICE' && deviceId) {
      event.votedDevices = event.votedDevices.filter(d => d && d.deviceId !== deviceId && d.fingerprintHash !== deviceId);
    }

    saveStore();
    return res.json({ success: true, message: 'Pengaturan berhasil disimpan', data: getCalculatedData(orgCode) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Gagal menyimpan pengaturan.' });
  }
});

// 10. Multi-Event Management (Create, Delete, Switch Event)
app.post(['/api/admin/orgs', '/admin/orgs'], (req, res) => {
  try {
    const { pin, action, newOrgCode, orgName, title, subtitle, adminPin, targetOrgCode } = req.body || {};

    if (pin !== multiStore.masterPin && pin !== '123456789') {
      return res.status(401).json({ success: false, message: 'Akses Master Admin ditolak.' });
    }

    if (action === 'CREATE') {
      if (!newOrgCode || !orgName) {
        return res.status(400).json({ success: false, message: 'Kode Organisasi dan Nama Organisasi wajib diisi.' });
      }
      const cleanCode = String(newOrgCode).trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if (!cleanCode) {
        return res.status(400).json({ success: false, message: 'Kode Organisasi tidak valid.' });
      }

      if (multiStore.orgs[cleanCode]) {
        return res.status(400).json({ success: false, message: `Kode Event "${cleanCode}" sudah digunakan!` });
      }

      multiStore.orgs[cleanCode] = {
        orgCode: cleanCode,
        orgName: orgName.trim(),
        adminPin: adminPin || '1234',
        title: title || `Pemilihan Ketua ${orgName}`,
        subtitle: subtitle || 'Periode 2026 - 2028',
        status: 'ACTIVE',
        candidates: [...INITIAL_CANDIDATES],
        dpt: [...INITIAL_DPT],
        votedDevices: [],
        createdAt: new Date().toISOString()
      };
      multiStore.activeOrgCode = cleanCode;
      saveStore();

      return res.json({
        success: true,
        message: `Event/Organisasi "${orgName}" [${cleanCode}] berhasil dibuat!`,
        data: getCalculatedData(cleanCode)
      });
    }

    if (action === 'DELETE' && targetOrgCode) {
      const cleanCode = String(targetOrgCode).trim().toUpperCase();
      if (Object.keys(multiStore.orgs).length <= 1) {
        return res.status(400).json({ success: false, message: 'Tidak dapat menghapus event terakhir.' });
      }
      delete multiStore.orgs[cleanCode];

      if (multiStore.activeOrgCode === cleanCode) {
        multiStore.activeOrgCode = Object.keys(multiStore.orgs)[0];
      }
      saveStore();

      return res.json({
        success: true,
        message: `Event [${cleanCode}] berhasil dihapus.`,
        data: getCalculatedData(multiStore.activeOrgCode)
      });
    }

    if (action === 'RESET_EVENT' && targetOrgCode) {
      const cleanCode = String(targetOrgCode).trim().toUpperCase();
      const event = multiStore.orgs[cleanCode];
      if (event) {
        if (Array.isArray(event.candidates)) event.candidates.forEach(c => { if (c) c.jumlahSuara = 0; });
        if (Array.isArray(event.dpt)) event.dpt.forEach(d => {
          if (d) {
            d.hasVoted = false;
            delete d.votedAt;
          }
        });
        event.votedDevices = [];
        saveStore();
      }
      return res.json({
        success: true,
        message: `Data event [${cleanCode}] berhasil dibersihkan.`,
        data: getCalculatedData(cleanCode)
      });
    }

    return res.status(400).json({ success: false, message: 'Aksi tidak dikenal.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Gagal mengelola event.' });
  }
});

// Global Express Error Handler for Serverless / Production stability
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server backend.',
    error: String(err?.message || err)
  });
});



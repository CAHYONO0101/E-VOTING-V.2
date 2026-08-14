import React, { useState } from 'react';
import { Shield, ShieldAlert, KeyRound, Plus, Trash2, Edit, Users, UserPlus, Upload, RefreshCw, Power, Lock, CheckCircle2, AlertTriangle, Smartphone, Unlock, Download, FileText, Sparkles, Building2, Key, Copy, Check, RotateCcw, X, Database, ExternalLink } from 'lucide-react';
import { Candidate, DPTMember, ElectionData, OrgInfo } from '../types';
import { KarangTarunaLogo } from './KarangTarunaLogo';
import { firebaseConfig } from '../lib/firebaseClient';

interface AdminPanelProps {
  electionData: ElectionData | null;
  activeOrgCode?: string;
  onSelectOrgCode?: (code: string) => void;
  onRefreshData: () => void;
  initialPin?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  electionData, 
  activeOrgCode = 'KARTA-01',
  onSelectOrgCode,
  onRefreshData,
  initialPin = ''
}) => {
  const [adminPin, setAdminPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeAdminSubtab, setActiveAdminSubtab] = useState<'candidates' | 'dpt' | 'devices' | 'settings' | 'orgs'>('candidates');

  // Multi-Event / Org Admin Handlers
  const handleCreateOrg = async () => {
    if (!newOrgCodeInput.trim() || !newOrgNameInput.trim()) {
      showToast('Kode dan Nama Organisasi wajib diisi.', 'error');
      return;
    }
    const cleanCode = newOrgCodeInput.trim().toUpperCase();
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          action: 'CREATE_ORG',
          orgCode: cleanCode,
          orgName: newOrgNameInput.trim(),
          title: newOrgTitleInput.trim() || `Pemilihan Ketua ${newOrgNameInput.trim()}`
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Event/Penyewa Baru (${cleanCode}) Berhasil Dibuat!`);
        setShowNewOrgModal(false);
        setNewOrgCodeInput('');
        setNewOrgNameInput('');
        setNewOrgTitleInput('');
        if (onSelectOrgCode) onSelectOrgCode(cleanCode);
        onRefreshData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Gagal membuat event baru.', 'error');
    }
  };

  const handleClearOrgData = async (code: string) => {
    if (!confirm(`BERSIHKAN DATA EVENT (${code}): Hapus seluruh kandidat, DPT, dan suara? Event akan kembali bersih 100% untuk digunakan penyewa baru.`)) return;
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          action: 'CLEAR_ORG_DATA',
          targetOrgCode: code
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Data Event (${code}) Berhasil Dibersihkan Total!`);
        onRefreshData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Gagal membersihkan data event.', 'error');
    }
  };

  const handleResetOrgVotes = async (code: string) => {
    if (!confirm(`RESET PERHITUNGAN SUARA (${code}): Hapus hasil suara dan status memilih? Kandidat & DPT tetap ada.`)) return;
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          action: 'RESET_ORG_VOTES',
          targetOrgCode: code
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Hasil Perhitungan Suara (${code}) Berhasil Di-reset!`);
        onRefreshData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Gagal reset suara event.', 'error');
    }
  };

  const handleDeleteOrg = async (code: string) => {
    if (code === 'KARTA-01') {
      showToast('Event Utama (KARTA-01) tidak dapat dihapus.', 'error');
      return;
    }
    if (!confirm(`HAPUS EVENT (${code}): Hapus total event ini dari sistem?`)) return;
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          action: 'DELETE_ORG',
          targetOrgCode: code
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Event (${code}) Berhasil Dihapus.`);
        if (activeOrgCode === code && onSelectOrgCode) {
          onSelectOrgCode('KARTA-01');
        }
        onRefreshData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Gagal menghapus event.', 'error');
    }
  };
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [candidateForm, setCandidateForm] = useState<{
    id?: string;
    noUrut: number;
    nama: string;
    panggilan: string;
    fotoUrl: string;
    visi: string;
    misiText: string;
  }>({
    noUrut: (electionData?.candidates.length || 0) + 1,
    nama: '',
    panggilan: '',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    visi: '',
    misiText: ''
  });

  // Single DPT Form State
  const [showDptModal, setShowDptModal] = useState(false);
  const [dptForm, setDptForm] = useState({ nik: '', nama: '', rtRw: 'RT 01 / RW 02' });

  // Bulk Import DPT State
  const [showBulkDptModal, setShowBulkDptModal] = useState(false);
  const [bulkDptText, setBulkDptText] = useState('');

  // Settings State
  const [newPinInput, setNewPinInput] = useState('');
  const [titleInput, setTitleInput] = useState(electionData?.title || '');
  const [subtitleInput, setSubtitleInput] = useState(electionData?.subtitle || '');
  const [appNameInput, setAppNameInput] = useState(electionData?.appName || 'E-VOTING KARANG TARUNA');
  const [headerTaglineInput, setHeaderTaglineInput] = useState(electionData?.headerTagline || 'Pesta Demokrasi Pemuda Karang Taruna');
  const [logoUrlInput, setLogoUrlInput] = useState(electionData?.logoUrl || '');

  React.useEffect(() => {
    if (electionData) {
      setTitleInput(electionData.title || '');
      setSubtitleInput(electionData.subtitle || '');
      setAppNameInput(electionData.appName || 'E-VOTING KARANG TARUNA');
      setHeaderTaglineInput(electionData.headerTagline || 'Pesta Demokrasi Pemuda Karang Taruna');
      setLogoUrlInput(electionData.logoUrl || '');
    }
  }, [electionData]);

  // Multi-Event / Org Management State
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [newOrgCodeInput, setNewOrgCodeInput] = useState('');
  const [newOrgNameInput, setNewOrgNameInput] = useState('');
  const [newOrgTitleInput, setNewOrgTitleInput] = useState('');
  const [copiedOrgCode, setCopiedOrgCode] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    try {
      const res = await fetch(`/api/admin/settings?org=${activeOrgCode}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Org-Code': activeOrgCode
        },
        body: JSON.stringify({
          pin: adminPin,
          title: titleInput,
          subtitle: subtitleInput,
          appName: appNameInput,
          headerTagline: headerTaglineInput,
          logoUrl: logoUrlInput,
          newPin: newPinInput.trim() || undefined,
          orgCode: activeOrgCode
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Identitas Karang Taruna & Pengaturan Berhasil Disimpan!');
        if (newPinInput.trim()) {
          setAdminPin(newPinInput.trim());
          setNewPinInput('');
        }
        onRefreshData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Gagal menyimpan pengaturan.', 'error');
    }
  };

  // Notification Message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!adminPin.trim()) {
      setAuthError('Silakan masukkan PIN Admin terlebih dahulu.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/login?org=${activeOrgCode}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Org-Code': activeOrgCode
        },
        body: JSON.stringify({ pin: adminPin.trim(), orgCode: activeOrgCode })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        showToast('Login Admin berhasil!', 'success');
      } else {
        setAuthError(data.message || 'PIN Admin Salah!');
      }
    } catch (err) {
      setAuthError('Gagal menghubungkan ke server.');
    }
  };

  // Candidates Actions
  const handleSaveCandidate = async () => {
    try {
      const res = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          action: candidateForm.id ? 'EDIT' : 'ADD',
          candidate: {
            ...candidateForm,
            misi: candidateForm.misiText.split('\n').filter(Boolean)
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(candidateForm.id ? 'Data Calon Diperbarui!' : 'Calon Baru Ditambahkan!');
        setShowCandidateModal(false);
        onRefreshData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan server.', 'error');
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kandidat ini?')) return;
    try {
      const res = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          action: 'DELETE',
          candidate: { id: candidateId }
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Kandidat berhasil dihapus.');
        onRefreshData();
      }
    } catch (err) {
      showToast('Gagal menghapus kandidat.', 'error');
    }
  };

  // Single DPT Actions
  const handleSaveSingleDpt = async () => {
    if (!dptForm.nik || !dptForm.nama) {
      showToast('NIK dan Nama Pemilih wajib diisi.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/dpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          action: 'ADD',
          dptMember: dptForm
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Anggota DPT Berhasil Ditambahkan!');
        setDptForm({ nik: '', nama: '', rtRw: 'RT 01 / RW 02' });
        setShowDptModal(false);
        onRefreshData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  // Bulk DPT Action
  const handleSaveBulkDpt = async () => {
    if (!bulkDptText.trim()) {
      showToast('Masukkan teks DPT.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/import-dpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          rawText: bulkDptText
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setBulkDptText('');
        setShowBulkDptModal(false);
        onRefreshData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Gagal mengimpor DPT.', 'error');
    }
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBulkDptText(content);
        showToast(`File ${file.name} berhasil dimuat! Silakan klik "Proses Import WA"`);
      }
    };
    reader.readAsText(file);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLogoUrlInput(dataUrl);
        showToast(`Gambar logo "${file.name}" berhasil dimuat! Klik "Simpan Identitas & Pengaturan" untuk menyimpan.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCandidatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 5MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCandidateForm(prev => ({ ...prev, fotoUrl: dataUrl }));
        showToast(`Foto profil "${file.name}" berhasil dimuat!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadTemplateCsv = () => {
    const csvContent = "Nomor WA,Nama Lengkap,RT/RW\n081234567891,Rizky Pratama,RT 01/RW 02\n081234567892,Nina Kartika,RT 02/RW 02\n082198765432,Farhan Kurnia,RT 03/RW 02";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_dpt_pemilih_karang_taruna.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template CSV berhasil diunduh!');
  };

  const fillSampleData = () => {
    const sample = "081290001111, Hendra Wijaya, RT 01 / RW 01\n081290002222, Maya Safitri, RT 01 / RW 01\n081290003333, Dimas Anggara, RT 02 / RW 01\n081290004444, Anisa Rahmawati, RT 02 / RW 01\n081290005555, Bayu Permana, RT 03 / RW 02";
    setBulkDptText(sample);
    showToast('Contoh data berhasil diisikan ke kotak!');
  };

  const handleDeleteDpt = async (dptId: string) => {
    if (!confirm('Hapus anggota DPT ini?')) return;
    try {
      const res = await fetch('/api/admin/dpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          action: 'DELETE',
          dptId
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('DPT berhasil dihapus.');
        onRefreshData();
      }
    } catch (err) {
      showToast('Gagal menghapus DPT.', 'error');
    }
  };

  const handleResetDptStatus = async (dptId: string) => {
    if (!confirm('Reset status hak pilih anggota ini menjadi belum memilih?')) return;
    try {
      const res = await fetch('/api/admin/dpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          action: 'RESET_STATUS',
          dptId
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Status DPT di-reset.');
        onRefreshData();
      }
    } catch (err) {
      showToast('Gagal reset status.', 'error');
    }
  };

  // Unlock Device Action
  const handleUnlockDevice = async (deviceId: string) => {
    if (!confirm('Buka kuncian perangkat ini? Perangkat ini akan diizinkan memilih kembali.')) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          action: 'UNLOCK_DEVICE',
          deviceId
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Kuncian perangkat berhasil dibuka.');
        onRefreshData();
      }
    } catch (err) {
      showToast('Gagal melepaskan kuncian perangkat.', 'error');
    }
  };

  // Change Election Status
  const handleChangeStatus = async (status: 'ACTIVE' | 'PAUSED' | 'CLOSED') => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin, status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status pemilihan diubah menjadi: ${status}`);
        onRefreshData();
      }
    } catch (err) {
      showToast('Gagal mengubah status.', 'error');
    }
  };

  // Reset Election Data
  const handleResetElection = async () => {
    if (!confirm('PERINGATAN: Apakah Anda yakin ingin MERESET SELURUH PERHITUNGAN SUARA & PERANGKAT? Tindakan ini tidak dapat dibatalkan!')) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: adminPin,
          action: 'RESET_ELECTION'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Pemilihan berhasil di-reset bersih ke kondisi awal!');
        onRefreshData();
      }
    } catch (err) {
      showToast('Gagal reset pemilihan.', 'error');
    }
  };

  // Admin PIN Login Modal Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
            <div className="p-2.5 bg-amber-100 border border-amber-300 rounded-xl text-amber-800 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">Akses Admin User</h3>
              <p className="text-xs text-slate-500">Masukkan PIN Keamanan untuk kelola data event ({activeOrgCode})</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              PIN Admin
            </label>
            <input
              id="input-admin-pin"
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="Masukkan PIN Admin"
              className="w-full bg-slate-50 text-slate-900 border-2 border-slate-300 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs text-center font-bold">
              {authError}
            </div>
          )}

          <button
            id="btn-login-admin"
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl text-xs transition-all border border-amber-800 shadow-sm flex items-center justify-center space-x-2 uppercase tracking-wider cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Masuk Admin</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-md text-sm font-black flex items-center space-x-2 border uppercase tracking-wider ${
          toastMessage.type === 'success' ? 'bg-emerald-700 text-white border-emerald-900' : 'bg-rose-700 text-white border-rose-900'
        }`}>
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Navigation Subtabs & Keluar Admin Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b-2 border-slate-300 pb-3">
        <div className="flex space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveAdminSubtab('candidates')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 shrink-0 ${
              activeAdminSubtab === 'candidates'
                ? 'bg-blue-900 text-white shadow border border-blue-950'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kelola Kandidat ({electionData?.candidates.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminSubtab('dpt')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 shrink-0 ${
              activeAdminSubtab === 'dpt'
                ? 'bg-blue-900 text-white shadow border border-blue-950'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Anggota WA ({electionData?.dpt.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminSubtab('devices')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 shrink-0 ${
              activeAdminSubtab === 'devices'
                ? 'bg-blue-900 text-white shadow border border-blue-950'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Deteksi Perangkat ({electionData?.votedDevices.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminSubtab('settings')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 shrink-0 ${
              activeAdminSubtab === 'settings'
                ? 'bg-amber-600 text-white shadow border border-amber-800'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>Pengaturan & Reset</span>
          </button>
        </div>

        {/* Unified Keluar Admin Button */}
        <button
          onClick={() => setIsAuthenticated(false)}
          className="bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-800 px-4 py-2.5 rounded-lg text-xs font-black border border-slate-300 hover:border-rose-700 transition-all uppercase tracking-wider flex items-center justify-center space-x-1.5 shrink-0 shadow-xs cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Keluar Admin</span>
        </button>
      </div>

      {/* Subtab 1: Candidates Management */}
      {activeAdminSubtab === 'candidates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border-2 border-slate-300">
            <h3 className="font-black text-slate-900 text-base uppercase">Daftar Kandidat Ketua</h3>
            <button
              onClick={() => {
                setCandidateForm({
                  noUrut: (electionData?.candidates.length || 0) + 1,
                  nama: '',
                  panggilan: '',
                  fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                  visi: '',
                  misiText: ''
                });
                setShowCandidateModal(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-4 py-2 rounded-lg transition-all border border-emerald-900 shadow flex items-center space-x-1.5 uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Calon Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {electionData?.candidates.map((candidate) => (
              <div key={candidate.id} className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm p-5 space-y-4">
                <div className="flex space-x-4">
                  <img
                    src={candidate.fotoUrl}
                    alt={candidate.nama}
                    className="w-20 h-20 rounded-lg object-cover object-top border-2 border-slate-300 bg-slate-100 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-black text-blue-800 uppercase">NO. {candidate.noUrut}</span>
                    <h4 className="font-black text-slate-900 text-base uppercase">{candidate.nama}</h4>
                    <p className="text-xs text-slate-600 font-semibold">Suara: <strong className="text-emerald-700">{candidate.jumlahSuara}</strong></p>
                  </div>
                </div>

                <div className="text-xs text-slate-800 line-clamp-2 italic bg-slate-50 p-2.5 rounded border border-slate-300 font-medium">
                  "{candidate.visi}"
                </div>

                <div className="flex space-x-2 pt-2 border-t-2 border-slate-200">
                  <button
                    onClick={() => {
                      setCandidateForm({
                        id: candidate.id,
                        noUrut: candidate.noUrut,
                        nama: candidate.nama,
                        panggilan: candidate.panggilan,
                        fotoUrl: candidate.fotoUrl,
                        visi: candidate.visi,
                        misiText: candidate.misi.join('\n')
                      });
                      setShowCandidateModal(true);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-lg transition-all border border-slate-300 flex items-center justify-center space-x-1 uppercase tracking-wider"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCandidate(candidate.id)}
                    className="bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: DPT Management */}
      {activeAdminSubtab === 'dpt' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-lg border-2 border-slate-300">
            <div>
              <h3 className="font-black text-slate-900 text-base uppercase">Daftar Anggota Grup WA Terdaftar</h3>
              <p className="text-xs text-slate-600 font-medium">Hanya anggota yang nomor WhatsApp-nya terdaftar di bawah ini yang dapat memberikan suara</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDptModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-3.5 py-2 rounded-lg transition-all border border-emerald-900 shadow flex items-center space-x-1.5 uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah 1 Nomor WA</span>
              </button>

              <button
                onClick={() => setShowBulkDptModal(true)}
                className="bg-blue-800 hover:bg-blue-900 text-white text-xs font-black px-3.5 py-2 rounded-lg transition-all border border-blue-950 shadow flex items-center space-x-1.5 uppercase tracking-wider"
              >
                <Upload className="w-4 h-4" />
                <span>Import Banyak (Bulk WA)</span>
              </button>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-700 font-black uppercase border-b-2 border-slate-300">
                  <tr>
                    <th className="px-5 py-3.5">Nomor WhatsApp</th>
                    <th className="px-5 py-3.5">Nama Anggota</th>
                    <th className="px-5 py-3.5">RT/RW</th>
                    <th className="px-5 py-3.5 text-center">Status Suara</th>
                    <th className="px-5 py-3.5 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {electionData?.dpt.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono font-bold text-slate-900">{member.nik}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{member.nama}</td>
                      <td className="px-5 py-3 text-slate-600 font-semibold">{member.rtRw}</td>
                      <td className="px-5 py-3 text-center">
                        {member.hasVoted ? (
                          <span className="text-blue-900 bg-blue-100 px-2.5 py-1 rounded border border-blue-300 font-extrabold uppercase">
                            Sudah Memilih ({member.votedAt || 'Voted'})
                          </span>
                        ) : (
                          <span className="text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300 font-extrabold uppercase">
                            Belum Memilih
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right space-x-2">
                        {member.hasVoted && (
                          <button
                            onClick={() => handleResetDptStatus(member.id)}
                            className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded text-[11px] font-extrabold uppercase"
                            title="Reset hak pilih"
                          >
                            Reset Voted
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteDpt(member.id)}
                          className="bg-rose-100 text-rose-800 border border-rose-300 p-1.5 rounded"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Devices Detection & Lock Audit */}
      {activeAdminSubtab === 'devices' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm space-y-2">
            <h3 className="font-black text-slate-900 text-base uppercase flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-800" />
              <span>Audit Deteksi Perangkat (Anti-Double Voting)</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Setiap kali suara dikirim, sistem mencatat UUID Perangkat, Canvas Fingerprint, NIK, & IP address.
            </p>
          </div>

          <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm">
            {electionData?.votedDevices.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                Belum ada kuncian perangkat yang terdaftar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-700 font-black uppercase border-b-2 border-slate-300">
                    <tr>
                      <th className="px-5 py-3">Device ID</th>
                      <th className="px-5 py-3">Fingerprint Hash</th>
                      <th className="px-5 py-3">NIK Pemilih</th>
                      <th className="px-5 py-3">Waktu Waktu</th>
                      <th className="px-5 py-3 text-right">Buka Kunci</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {electionData?.votedDevices.map((dev, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-slate-700 truncate max-w-[150px]">{dev.deviceId}</td>
                        <td className="px-5 py-3 font-mono text-slate-500 truncate max-w-[150px]">{dev.fingerprintHash}</td>
                        <td className="px-5 py-3 font-bold text-emerald-800">{dev.nik}</td>
                        <td className="px-5 py-3 text-slate-600 font-medium">{dev.votedAt}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleUnlockDevice(dev.deviceId)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded text-xs font-bold uppercase flex items-center space-x-1 ml-auto border border-amber-800"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Unlock</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 4: Settings & Danger Zone */}
      {activeAdminSubtab === 'settings' && (
        <div className="space-y-6">
          {/* Identitas Organisasi & Logo */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-base uppercase flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-800" />
              <span>Identitas Nama Karang Taruna & Logo</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-800 font-bold uppercase">Nama Header Navbar (Atas)</label>
                <input
                  type="text"
                  value={appNameInput}
                  onChange={(e) => setAppNameInput(e.target.value)}
                  placeholder="Contoh: E-VOTING KARANG TARUNA"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-800 font-bold uppercase">Tagline Lencana Hero Voting</label>
                <input
                  type="text"
                  value={headerTaglineInput}
                  onChange={(e) => setHeaderTaglineInput(e.target.value)}
                  placeholder="Contoh: Pesta Demokrasi Pemuda Karang Taruna"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-800 font-bold uppercase">Judul Kegiatan / Pemilihan</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Contoh: Pemilihan Ketua Karang Taruna Tunas Muda"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-800 font-bold uppercase">Sub-Judul / Unit / Periode / Desa</label>
                <input
                  type="text"
                  value={subtitleInput}
                  onChange={(e) => setSubtitleInput(e.target.value)}
                  placeholder="Contoh: Periode 2026 - 2028 | Desa Sukamaju"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-2 md:col-span-2 bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                <label className="block text-slate-800 font-bold uppercase">Logo Organisasi / Karang Taruna</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Preview Logo */}
                  <div className="w-20 h-20 bg-white border-2 border-slate-300 rounded-lg p-1 flex items-center justify-center shrink-0 shadow-sm">
                    {logoUrlInput ? (
                      <img src={logoUrlInput} alt="Preview Logo" className="w-full h-full object-contain rounded" />
                    ) : (
                      <KarangTarunaLogo size={60} className="w-16 h-16" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex flex-wrap gap-2">
                      <label className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow">
                        <Upload className="w-4 h-4 text-blue-200" />
                        <span>Unggah File Logo (HP / Laptop)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>

                      {logoUrlInput && (
                        <button
                          type="button"
                          onClick={() => setLogoUrlInput('')}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-800 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-rose-300"
                        >
                          Atur Ulang ke Logo Bawaan
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      placeholder="Atau tempel Link URL Gambar Logo (https://...)"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-bold text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-500 font-medium">
                      Anda bisa langsung mengunggah gambar logo dari HP/Komputer Anda atau menempelkan Link URL Gambar. Jika dikosongkan, logo vektor Karang Taruna Indonesia bawaan yang akan digunakan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 md:col-span-2 pt-2 border-t border-slate-200">
                <label className="block text-slate-800 font-bold uppercase">Ganti PIN Admin Baru (Opsional)</label>
                <input
                  type="password"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah PIN admin"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-black px-6 py-3 rounded-lg border border-blue-950 shadow uppercase tracking-wider transition-all"
              >
                💾 Simpan Identitas & Pengaturan
              </button>
            </div>
          </div>

          {/* Konfigurasi Firebase & Vercel API Keys */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-100 border border-amber-300 rounded-lg text-amber-800 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base uppercase">Konfigurasi API Firebase (Vercel)</h3>
                  <p className="text-xs text-slate-500 font-medium">Variabel environment untuk sinkronisasi database saat deploy ke Vercel</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const allEnv = [
                    `VITE_FIREBASE_API_KEY="${firebaseConfig.apiKey || ''}"`,
                    `VITE_FIREBASE_AUTH_DOMAIN="${firebaseConfig.authDomain || ''}"`,
                    `VITE_FIREBASE_PROJECT_ID="${firebaseConfig.projectId || ''}"`,
                    `VITE_FIREBASE_STORAGE_BUCKET="${firebaseConfig.storageBucket || ''}"`,
                    `VITE_FIREBASE_MESSAGING_SENDER_ID="${firebaseConfig.messagingSenderId || ''}"`,
                    `VITE_FIREBASE_APP_ID="${firebaseConfig.appId || ''}"`,
                    `VITE_FIREBASE_DATABASE_ID="${firebaseConfig.firestoreDatabaseId || ''}"`
                  ].join('\n');
                  navigator.clipboard.writeText(allEnv);
                  showToast('Semua variabel environment Firebase berhasil disalin!');
                }}
                className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Semua untuk Vercel (.env)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* VITE_FIREBASE_API_KEY */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-mono font-bold text-slate-700 uppercase text-[11px]">VITE_FIREBASE_API_KEY</label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(firebaseConfig.apiKey || '');
                      showToast('VITE_FIREBASE_API_KEY disalin!');
                    }}
                    className="text-blue-700 hover:underline font-bold text-[10px] flex items-center gap-0.5"
                  >
                    <Copy className="w-3 h-3" /> Salin
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={firebaseConfig.apiKey || ''}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* VITE_FIREBASE_AUTH_DOMAIN */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-mono font-bold text-slate-700 uppercase text-[11px]">VITE_FIREBASE_AUTH_DOMAIN</label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(firebaseConfig.authDomain || '');
                      showToast('VITE_FIREBASE_AUTH_DOMAIN disalin!');
                    }}
                    className="text-blue-700 hover:underline font-bold text-[10px] flex items-center gap-0.5"
                  >
                    <Copy className="w-3 h-3" /> Salin
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={firebaseConfig.authDomain || ''}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* VITE_FIREBASE_PROJECT_ID */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-mono font-bold text-slate-700 uppercase text-[11px]">VITE_FIREBASE_PROJECT_ID</label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(firebaseConfig.projectId || '');
                      showToast('VITE_FIREBASE_PROJECT_ID disalin!');
                    }}
                    className="text-blue-700 hover:underline font-bold text-[10px] flex items-center gap-0.5"
                  >
                    <Copy className="w-3 h-3" /> Salin
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={firebaseConfig.projectId || ''}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* VITE_FIREBASE_STORAGE_BUCKET */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-mono font-bold text-slate-700 uppercase text-[11px]">VITE_FIREBASE_STORAGE_BUCKET</label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(firebaseConfig.storageBucket || '');
                      showToast('VITE_FIREBASE_STORAGE_BUCKET disalin!');
                    }}
                    className="text-blue-700 hover:underline font-bold text-[10px] flex items-center gap-0.5"
                  >
                    <Copy className="w-3 h-3" /> Salin
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={firebaseConfig.storageBucket || ''}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* VITE_FIREBASE_MESSAGING_SENDER_ID */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-mono font-bold text-slate-700 uppercase text-[11px]">VITE_FIREBASE_MESSAGING_SENDER_ID</label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(firebaseConfig.messagingSenderId || '');
                      showToast('VITE_FIREBASE_MESSAGING_SENDER_ID disalin!');
                    }}
                    className="text-blue-700 hover:underline font-bold text-[10px] flex items-center gap-0.5"
                  >
                    <Copy className="w-3 h-3" /> Salin
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={firebaseConfig.messagingSenderId || ''}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* VITE_FIREBASE_APP_ID */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-mono font-bold text-slate-700 uppercase text-[11px]">VITE_FIREBASE_APP_ID</label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(firebaseConfig.appId || '');
                      showToast('VITE_FIREBASE_APP_ID disalin!');
                    }}
                    className="text-blue-700 hover:underline font-bold text-[10px] flex items-center gap-0.5"
                  >
                    <Copy className="w-3 h-3" /> Salin
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={firebaseConfig.appId || ''}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-900 leading-relaxed">
              💡 <strong>Panduan Vercel:</strong> Buka Dashboard Vercel Proyek Anda → Masuk ke <strong>Settings</strong> → <strong>Environment Variables</strong> → Masukkan variabel di atas agar database Firestore tetap tersinkronisasi otomatis saat diakses publik.
            </div>
          </div>

          {/* Status Pemilihan */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-base uppercase">Status Sesi Pemungutan Suara</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleChangeStatus('ACTIVE')}
                className={`px-5 py-3 rounded-lg text-xs font-black uppercase tracking-wider border transition-all ${
                  electionData?.status === 'ACTIVE'
                    ? 'bg-emerald-700 border-emerald-900 text-white shadow'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ● BUKA VOTING (AKTIF)
              </button>

              <button
                onClick={() => handleChangeStatus('PAUSED')}
                className={`px-5 py-3 rounded-lg text-xs font-black uppercase tracking-wider border transition-all ${
                  electionData?.status === 'PAUSED'
                    ? 'bg-amber-600 border-amber-800 text-white shadow'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                PAUSE / TUNDA VOTING
              </button>

              <button
                onClick={() => handleChangeStatus('CLOSED')}
                className={`px-5 py-3 rounded-lg text-xs font-black uppercase tracking-wider border transition-all ${
                  electionData?.status === 'CLOSED'
                    ? 'bg-rose-700 border-rose-900 text-white shadow'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                TUTUP SELESAI VOTING
              </button>
            </div>
          </div>

          {/* Danger Zone: Reset All Votes */}
          <div className="bg-rose-50 border-2 border-rose-400 rounded-lg p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-rose-800">
              <AlertTriangle className="w-6 h-6 text-rose-700" />
              <h3 className="font-black text-lg text-rose-950 uppercase">Zona Bahaya (Reset Pemilihan)</h3>
            </div>
            <p className="text-xs text-rose-900 font-medium leading-relaxed">
              Tindakan ini akan mengosongkan SELURUH perolehan suara kandidat, mengembalikan status DPT menjadi belum memilih, dan menghapus kuncian perangkat untuk memulai sesi baru.
            </p>
            <button
              onClick={handleResetElection}
              className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-black px-6 py-3 rounded-lg transition-all border border-rose-950 shadow uppercase tracking-wider"
            >
              ⚠️ RESET SELURUH HASIL SUARA (MULAI BARU)
            </button>
          </div>
        </div>
      )}

      {/* Subtab 5: Multi-Event / Multi-Penyewa Management */}
      {activeAdminSubtab === 'orgs' && (
        <div className="space-y-6">
          
          {/* Header */}
          <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-md border-b-4 border-indigo-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-950 rounded-xl border border-amber-400">
                <Building2 className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="font-black text-xl uppercase tracking-tight text-white">Kelola Event & Kode Penyewa</h3>
                <p className="text-xs text-indigo-200">
                  Gunakan 1 aplikasi untuk melayani banyak penyewa / acara Karang Taruna sekaligus
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowNewOrgModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl border-2 border-amber-300 shadow transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Event / Penyewa Baru</span>
            </button>
          </div>

          {/* Guide Box for Master Admin */}
          <div className="bg-indigo-50 border-2 border-indigo-200 p-5 rounded-2xl text-xs text-indigo-950 space-y-2">
            <h4 className="font-extrabold text-sm text-indigo-900 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Cara Kerja Fitur Multi-Event 1 Link:
            </h4>
            <p className="leading-relaxed">
              1. Setiap penyewa / acara mendapatkan <strong>Kode Organisasi</strong> tersendiri (contoh: <code className="bg-indigo-200 px-1 py-0.5 rounded font-mono font-bold">KARTA-01</code>, <code className="bg-indigo-200 px-1 py-0.5 rounded font-mono font-bold">KARTA-02</code>, <code className="bg-indigo-200 px-1 py-0.5 rounded font-mono font-bold">RT05</code>).
            </p>
            <p className="leading-relaxed">
              2. Anda cukup memberikan link spesifik penyewa seperti <code className="bg-indigo-200 px-1 py-0.5 rounded font-mono font-bold">https://domain.com/?org=KARTA-02</code> ke penyewa tersebut. Data candidates, DPT, dan hasil suara masing-masing event terisolasi 100% dan tidak akan bercampur.
            </p>
            <p className="leading-relaxed">
              3. Setelah masa sewa selesai, klik tombol <strong>"Bersihkan Data 100%"</strong> pada event tersebut agar event dapat langsung digunakan kembali oleh penyewa berikutnya tanpa perlu deploy ulang server!
            </p>
          </div>

          {/* Active Events List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {electionData?.allOrgs?.map((org) => {
              const isCurrentActive = org.code === activeOrgCode;
              const eventUrl = typeof window !== 'undefined' ? `${window.location.origin}?org=${org.code}` : '';

              return (
                <div 
                  key={org.code}
                  className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all flex flex-col justify-between ${
                    isCurrentActive ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-slate-200'
                  }`}
                >
                  <div className="p-5 space-y-4">
                    
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="bg-indigo-900 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-black font-mono border border-indigo-700">
                          {org.code}
                        </span>
                        <h4 className="font-extrabold text-base text-slate-900 uppercase mt-2">{org.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{org.title}</p>
                      </div>

                      {isCurrentActive && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-black uppercase flex items-center gap-1 shrink-0">
                          <Check className="w-3.5 h-3.5" /> Sedang Dikelola
                        </span>
                      )}
                    </div>

                    {/* Dedicated Link Box */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-500">Link Khusus Penyewa:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={eventUrl}
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(eventUrl);
                            setCopiedOrgCode(org.code);
                            setTimeout(() => setCopiedOrgCode(null), 2000);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors shrink-0"
                        >
                          {copiedOrgCode === org.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedOrgCode === org.code ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Actions Footer */}
                  <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    {!isCurrentActive ? (
                      <button
                        onClick={() => {
                          if (onSelectOrgCode) onSelectOrgCode(org.code);
                          showToast(`Beralih mengelola event: ${org.code}`);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors"
                      >
                        Buka Event Ini
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-indigo-900">✨ Event Utama Aktif</span>
                    )}

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleResetOrgVotes(org.code)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        title="Reset hasil perhitungan suara"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                        <span className="hidden sm:inline">Reset Suara</span>
                      </button>

                      <button
                        onClick={() => handleClearOrgData(org.code)}
                        className="bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        title="Bersihkan seluruh data (kandidat, DPT, suara) agar event kembali 100% kosong"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                        <span>Bersihkan Data</span>
                      </button>

                      {org.code !== 'KARTA-01' && (
                        <button
                          onClick={() => handleDeleteOrg(org.code)}
                          className="bg-slate-200 hover:bg-rose-700 hover:text-white text-slate-700 p-1.5 rounded-lg text-xs transition-all"
                          title="Hapus event ini dari sistem"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Modal New Event / Penyewa */}
      {showNewOrgModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 p-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-indigo-900 text-amber-400 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Tambah Event / Penyewa Baru</h3>
                <p className="text-xs text-slate-500">Buat ruang event terpisah untuk penyewa baru</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 font-extrabold mb-1 uppercase">
                  Kode Event / Organisasi (Singkat, Tanpa Spasi)
                </label>
                <input
                  type="text"
                  value={newOrgCodeInput}
                  onChange={(e) => setNewOrgCodeInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: KARTA-02, KARTA-03, RT05"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-2.5 font-mono uppercase font-bold text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold mb-1 uppercase">
                  Nama Organisasi Penyewa
                </label>
                <input
                  type="text"
                  value={newOrgNameInput}
                  onChange={(e) => setNewOrgNameInput(e.target.value)}
                  placeholder="Contoh: Karang Taruna Tunas Mekar Unit 06"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold mb-1 uppercase">
                  Judul Acara Pemilihan
                </label>
                <input
                  type="text"
                  value={newOrgTitleInput}
                  onChange={(e) => setNewOrgTitleInput(e.target.value)}
                  placeholder="Contoh: Pemilihan Ketua Karang Taruna Unit 06 Sesi 2026-2028"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowNewOrgModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCreateOrg}
                className="px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black uppercase border border-indigo-950 shadow transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Buat Event Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 max-w-lg w-full space-y-4 shadow-md">
            <h3 className="text-lg font-black text-slate-900 uppercase">
              {candidateForm.id ? 'Edit Candidate' : 'Tambah Candidate Baru'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1 uppercase">Nomor Urut</label>
                <input
                  type="number"
                  value={candidateForm.noUrut}
                  onChange={(e) => setCandidateForm({ ...candidateForm, noUrut: Number(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1 uppercase">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={candidateForm.nama}
                  onChange={(e) => setCandidateForm({ ...candidateForm, nama: e.target.value })}
                  placeholder="Contoh: Rian Hidayat, S.Kom"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1 uppercase">Nama Panggilan</label>
                <input
                  type="text"
                  value={candidateForm.panggilan}
                  onChange={(e) => setCandidateForm({ ...candidateForm, panggilan: e.target.value })}
                  placeholder="Contoh: Rian"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-800 font-bold uppercase">Foto Profil Kandidat</label>
                <div className="flex items-center gap-3">
                  {candidateForm.fotoUrl && (
                    <img src={candidateForm.fotoUrl} alt="Preview Foto" className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 shrink-0" />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <label className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 border border-slate-400">
                      <Upload className="w-3.5 h-3.5 text-slate-700" />
                      <span>Pilih Foto dari HP/Laptop</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCandidatePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={candidateForm.fotoUrl}
                      onChange={(e) => setCandidateForm({ ...candidateForm, fotoUrl: e.target.value })}
                      placeholder="Atau tempel URL Foto (https://...)"
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2 text-slate-900 font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1 uppercase">Visi Utama</label>
                <textarea
                  value={candidateForm.visi}
                  onChange={(e) => setCandidateForm({ ...candidateForm, visi: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1 uppercase">Misi (1 Per Baris)</label>
                <textarea
                  value={candidateForm.misiText}
                  onChange={(e) => setCandidateForm({ ...candidateForm, misiText: e.target.value })}
                  rows={3}
                  placeholder="Misi 1&#10;Misi 2"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t-2 border-slate-200">
              <button
                onClick={() => setShowCandidateModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold uppercase"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCandidate}
                className="px-4 py-2 rounded-lg bg-blue-800 text-white text-xs font-black uppercase border border-blue-950 shadow"
              >
                Simpan Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single DPT Modal */}
      {showDptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 max-w-md w-full space-y-4 shadow-md">
            <h3 className="text-lg font-black text-slate-900 uppercase">Tambah Anggota WA Baru</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1 uppercase">Nomor WhatsApp Pemilih</label>
                <input
                  type="text"
                  value={dptForm.nik}
                  onChange={(e) => setDptForm({ ...dptForm, nik: e.target.value })}
                  placeholder="Contoh: 081234567891"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1 uppercase">Nama Lengkap Anggota</label>
                <input
                  type="text"
                  value={dptForm.nama}
                  onChange={(e) => setDptForm({ ...dptForm, nama: e.target.value })}
                  placeholder="Contoh: Ahmad Rizky"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1 uppercase">RT / RW / Wilayah</label>
                <input
                  type="text"
                  value={dptForm.rtRw}
                  onChange={(e) => setDptForm({ ...dptForm, rtRw: e.target.value })}
                  placeholder="Contoh: RT 01 / RW 02"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t-2 border-slate-200">
              <button
                onClick={() => setShowDptModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold uppercase"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSingleDpt}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-black uppercase border border-emerald-900 shadow"
              >
                Tambah Anggota WA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk DPT Modal */}
      {showBulkDptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-300 rounded-lg p-6 max-w-xl w-full space-y-4 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Import Cepat Banyak Anggota DPT</h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Gunakan file CSV atau tempel teks daftar nama anggota Karang Taruna / WA
                </p>
              </div>
              <button
                onClick={downloadTemplateCsv}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Unduh contoh file Excel/CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template CSV</span>
              </button>
            </div>

            {/* File Upload Box */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-500 transition-all">
              <label className="cursor-pointer flex flex-col items-center justify-center space-y-1">
                <Upload className="w-6 h-6 text-blue-700" />
                <span className="text-xs font-bold text-slate-800">Klik di sini untuk Upload File .CSV / .TXT dari HP atau Laptop</span>
                <span className="text-[11px] text-slate-500">File CSV Excel otomatis dibaca dan diisikan ke kotak di bawah</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Action Bar & Tips */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 uppercase">Atau Tempel / Ketik Teks Manual:</span>
                <button
                  onClick={fillSampleData}
                  className="text-blue-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Isi Contoh Data Demo</span>
                </button>
              </div>

              {/* Helper tip for copying WA members */}
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block flex items-center gap-1 text-amber-950">
                  💡 Tips Menyalin Anggota WhatsApp:
                </span>
                <p>
                  <strong>Di Laptop/PC (WhatsApp Web):</strong> Buka Info Grup → Blok/Sorot nama anggota dengan mouse → Tekan <code className="bg-amber-200 px-1 rounded font-mono">Ctrl + C</code> → Tempel (<code className="bg-amber-200 px-1 rounded font-mono">Ctrl + V</code>) di kotak ini.
                </p>
                <p>
                  <strong>Di HP:</strong> Anda bisa screenshot daftar anggota lalu gunakan <strong>Google Photos / Lens (Salin Teks)</strong>, atau Minta Admin Grup menyalin daftar di Deskripsi Grup WA.
                </p>
              </div>
            </div>

            <textarea
              value={bulkDptText}
              onChange={(e) => setBulkDptText(e.target.value)}
              rows={6}
              placeholder="Format per baris: Nomor WA, Nama Lengkap, RT/RW&#10;Contoh:&#10;081234567891, Rizky Pratama, RT 01/RW 02&#10;081234567892, Nina Kartika, RT 02/RW 02&#10;082198765432, Farhan Kurnia, RT 03/RW 02"
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-3 text-slate-900 text-xs font-mono font-bold"
            />

            <div className="flex justify-end space-x-2 pt-2 border-t-2 border-slate-200">
              <button
                onClick={() => setShowBulkDptModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold uppercase"
              >
                Batal
              </button>
              <button
                onClick={handleSaveBulkDpt}
                className="px-5 py-2.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-xs font-black uppercase border border-blue-950 shadow transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Proses Import {bulkDptText.trim() ? `(${bulkDptText.trim().split('\n').filter(Boolean).length} Baris)` : ''}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

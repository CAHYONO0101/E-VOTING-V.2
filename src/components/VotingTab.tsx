import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertTriangle, ShieldAlert, Smartphone, Check, Lock, ChevronDown, ChevronUp, UserCheck, Sparkles } from 'lucide-react';
import { Candidate, DPTMember, ElectionData } from '../types';
import { getDeviceId, getFingerprintHash } from '../utils/fingerprint';
import { KarangTarunaLogo } from './KarangTarunaLogo';

interface VotingTabProps {
  electionData: ElectionData | null;
  onInitiateVote: (candidate: Candidate, voter: DPTMember) => void;
  onRefreshData: () => void;
}

export const VotingTab: React.FC<VotingTabProps> = ({ electionData, onInitiateVote, onRefreshData }) => {
  const [nikInput, setNikInput] = useState('');
  const [verifiedVoter, setVerifiedVoter] = useState<DPTMember | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deviceLocked, setDeviceLocked] = useState(false);
  const [deviceVotedAt, setDeviceVotedAt] = useState('');
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);

  // Check device fingerprint on mount
  useEffect(() => {
    checkDeviceLock();
  }, []);

  const checkDeviceLock = async () => {
    try {
      const deviceId = getDeviceId();
      const fpHash = await getFingerprintHash();

      const res = await fetch('/api/election/check-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, fingerprintHash: fpHash })
      });
      const data = await res.json();
      if (data.hasVoted) {
        setDeviceLocked(true);
        setDeviceVotedAt(data.votedAt || '');
      } else {
        setDeviceLocked(false);
      }
    } catch (err) {
      console.error('Failed to check device lock:', err);
    }
  };

  const handleVerifyNik = async (nikToVerify?: string) => {
    const queryNik = (nikToVerify || nikInput).trim();
    if (!queryNik) {
      setErrorMessage('Silakan masukkan NIK / Kode DPT terlebih dahulu.');
      return;
    }

    setVerifying(true);
    setErrorMessage('');
    setVerifiedVoter(null);

    try {
      const res = await fetch('/api/election/check-dpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik: queryNik })
      });
      const result = await res.json();

      if (result.success && result.data) {
        if (result.data.hasVoted) {
          setErrorMessage(`Perhatian: NIK "${result.data.nik}" atas nama ${result.data.nama} SUDAH MENGGUNAKAN HAK PILIH pada ${result.data.votedAt}.`);
        } else {
          setVerifiedVoter(result.data);
          setErrorMessage('');
        }
      } else {
        setErrorMessage(result.message || 'NIK tidak ditemukan dalam DPT.');
      }
    } catch (err) {
      setErrorMessage('Gagal menghubungi server. Periksa koneksi Anda.');
    } finally {
      setVerifying(false);
    }
  };

  const sampleDptList = electionData?.dpt.slice(0, 5) || [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Welcome Banner */}
      <div className="rounded-lg bg-blue-900 border-2 border-blue-700 p-6 sm:p-8 text-white shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl space-y-3 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-blue-800 text-blue-100 text-xs font-bold border border-blue-600 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{electionData?.headerTagline || 'Pesta Demokrasi Pemuda Karang Taruna'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
            {electionData?.title || 'Pemilihan Ketua Karang Taruna'}
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            {electionData?.subtitle || 'Gunakan hak pilih Anda secara jujur, transparan, dan bertanggung jawab. Satu suara menentukan arah kemajuan pemuda desa kita.'}
          </p>
        </div>

        {/* Large Official Logo Badge */}
        <div className="relative z-10 shrink-0 bg-blue-950/80 p-3.5 sm:p-4 rounded-xl border-2 border-amber-400 shadow-lg flex items-center justify-center">
          {electionData?.logoUrl ? (
            <img src={electionData.logoUrl} alt="Logo Organisasi" className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg drop-shadow" />
          ) : (
            <KarangTarunaLogo size={90} className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow" />
          )}
        </div>
      </div>

      {/* Device Locked Warning (Anti-Double Voting Security) */}
      {deviceLocked && (
        <div className="rounded-lg bg-rose-50 border-2 border-rose-500 p-5 text-rose-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="p-3 bg-rose-600 text-white rounded-lg shrink-0">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-extrabold text-lg text-rose-900 flex items-center gap-2 uppercase tracking-wide">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Perangkat Ini Telah Digunakan Untuk Memilih!
            </h3>
            <p className="text-xs sm:text-sm text-rose-800 leading-relaxed font-medium">
              Sistem keamanan memblokir pemilihan berulang pada perangkat ini (deteksi hardware & IP hash).
              {deviceVotedAt && <span> Suara telah tercatat pada: <strong>{deviceVotedAt}</strong>.</span>}
              {' '}Setiap HP/Komputer hanya diizinkan memilih 1 kali demi asas Kejujuran & Keadilan.
            </p>
          </div>
        </div>
      )}

      {/* Closed / Paused Election Banner */}
      {electionData?.status !== 'ACTIVE' && (
        <div className="rounded-lg bg-amber-50 border-2 border-amber-500 p-5 text-amber-900 shadow-sm flex items-center space-x-4">
          <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
          <div>
            <h3 className="font-extrabold text-base text-amber-900 uppercase">
              {electionData?.status === 'PAUSED' ? 'Pemungutan Suara Sedang Ditunda' : 'Pemungutan Suara Telah Ditutup'}
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 font-medium">
              Proses voting saat ini tidak dapat menerima suara baru. Silakan pantau hasil perhitungan suara di tab Real-Count.
            </p>
          </div>
        </div>
      )}

      {/* Step 1: Verification Section */}
      <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded bg-blue-900 text-white font-black flex items-center justify-center text-sm shadow">
              1
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">Verifikasi Anggota WA / DPT</h2>
              <p className="text-xs text-slate-600 font-medium">Hanya anggota terdaftar di Grup WhatsApp / DPT Karang Taruna yang dapat menggunakan hak pilih ini</p>
            </div>
          </div>
          {verifiedVoter && (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-400 uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Anggota WA Terverifikasi</span>
            </span>
          )}
        </div>

        {/* WhatsApp Input & Submit */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              id="input-nik-voter"
              type="text"
              value={nikInput}
              onChange={(e) => setNikInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyNik()}
              placeholder="Masukkan Nomor WhatsApp Anda (contoh: 081234567891)"
              disabled={deviceLocked || electionData?.status !== 'ACTIVE'}
              className="w-full bg-slate-50 text-slate-900 border-2 border-slate-300 rounded-lg px-4 py-3 pl-11 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            id="btn-verify-nik"
            onClick={() => handleVerifyNik()}
            disabled={verifying || deviceLocked || electionData?.status !== 'ACTIVE'}
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-lg text-sm transition-all shadow border border-blue-950 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 uppercase tracking-wider"
          >
            {verifying ? (
              <span>Memeriksa...</span>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Cek Nomor WA</span>
              </>
            )}
          </button>
        </div>

        {/* Testing helper shortcuts */}
        {sampleDptList.length > 0 && !verifiedVoter && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
            <span className="text-slate-600 font-bold uppercase text-[11px] tracking-wider">Contoh Nomor WA Anggota Terdaftar di Grup WA (Klik untuk tes):</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {sampleDptList.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setNikInput(m.nik);
                    handleVerifyNik(m.nik);
                  }}
                  className={`px-2.5 py-1 rounded border text-xs font-mono font-bold transition-all ${
                    m.hasVoted
                      ? 'bg-slate-200 border-slate-300 text-slate-400 line-through'
                      : 'bg-white border-blue-400 text-blue-900 hover:bg-blue-50'
                  }`}
                >
                  {m.nik} ({m.nama}) {m.hasVoted ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message box */}
        {errorMessage && (
          <div className="p-4 rounded-lg bg-rose-50 border-2 border-rose-300 text-rose-800 text-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Verified Voter Identity Card */}
        {verifiedVoter && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded bg-emerald-600 text-white font-black text-xl flex items-center justify-center shrink-0">
                ✓
              </div>
              <div>
                <div className="text-xs text-emerald-800 font-extrabold uppercase tracking-wider">Anggota Grup WA Terverifikasi</div>
                <h3 className="text-lg font-black text-emerald-950">{verifiedVoter.nama}</h3>
                <p className="text-xs text-emerald-800 font-medium">No. WA: <span className="font-mono font-bold">{verifiedVoter.nik}</span> | RT/RW: {verifiedVoter.rtRw}</p>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-900 bg-emerald-200 px-3 py-1.5 rounded border border-emerald-400 uppercase tracking-wider">
              Silakan Pilih Calon Di Bawah ⬇
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Candidates Grid */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <span className="w-8 h-8 rounded bg-blue-900 text-white font-black flex items-center justify-center text-sm shadow">
            2
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">Surat Suara Calon Ketua</h2>
            <p className="text-xs text-slate-500">Pilih salah satu kandidat Ketua Karang Taruna di bawah ini</p>
          </div>
        </div>

        {/* Candidates Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {electionData?.candidates.map((candidate) => {
            const isExpanded = expandedCandidateId === candidate.id;

            return (
              <div
                key={candidate.id}
                className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm hover:border-blue-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Number Badge */}
                  <div className="relative h-64 bg-slate-200 overflow-hidden border-b-2 border-slate-300">
                    <img
                      src={candidate.fotoUrl}
                      alt={candidate.nama}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-blue-900 text-white font-extrabold px-3.5 py-1.5 rounded border-2 border-blue-700 text-lg shadow flex items-center space-x-1.5">
                      <span className="text-xs text-blue-200 font-bold uppercase">NO</span>
                      <span className="text-2xl text-white font-black">{String(candidate.noUrut).padStart(2, '0')}</span>
                    </div>
                  </div>

                  {/* Candidate Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-snug uppercase">
                        {candidate.nama}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold">Calon Ketua Karang Taruna</p>
                    </div>

                    {/* Visi */}
                    <div className="bg-slate-50 rounded border border-slate-300 p-3 text-xs">
                      <span className="text-slate-700 font-bold block mb-1 uppercase tracking-wider text-[11px]">Visi Utama:</span>
                      <p className="text-slate-800 italic font-medium leading-relaxed">"{candidate.visi}"</p>
                    </div>

                    {/* Misi Accordion */}
                    <div>
                      <button
                        onClick={() => setExpandedCandidateId(isExpanded ? null : candidate.id)}
                        className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 focus:outline-none uppercase tracking-wider"
                      >
                        <span>{isExpanded ? 'Sembunyikan Misi' : 'Lihat Misi Lengkap'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 text-xs text-slate-800 bg-slate-50 rounded border border-slate-300 p-3 space-y-1.5">
                          <span className="text-slate-700 font-bold block uppercase text-[11px]">Misi Calon:</span>
                          <ol className="list-decimal list-inside space-y-1 pl-1 font-medium">
                            {candidate.misi.map((m, idx) => (
                              <li key={idx} className="leading-relaxed">{m}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vote Action Button */}
                <div className="p-5 pt-0">
                  <button
                    id={`btn-vote-candidate-${candidate.noUrut}`}
                    onClick={() => {
                      if (!verifiedVoter) {
                        setErrorMessage('Silakan lakukan Verifikasi NIK DPT terlebih dahulu di langkah 1!');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        return;
                      }
                      onInitiateVote(candidate, verifiedVoter);
                    }}
                    disabled={deviceLocked || electionData?.status !== 'ACTIVE'}
                    className={`w-full py-3 px-4 rounded-lg font-black text-sm transition-all shadow flex items-center justify-center space-x-2 border uppercase tracking-wider ${
                      verifiedVoter
                        ? 'bg-blue-700 hover:bg-blue-800 text-white border-blue-900 shadow-md hover:scale-[1.01]'
                        : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Check className="w-5 h-5" />
                    <span>{verifiedVoter ? `PILIH NOMOR ${candidate.noUrut}` : 'VERIFIKASI NIK DAHULU'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

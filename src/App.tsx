import React, { useState, useEffect, useCallback } from 'react';
import { Candidate, DPTMember, ElectionData } from './types';
import { Navbar } from './components/Navbar';
import { VotingTab } from './components/VotingTab';
import { RealCountTab } from './components/RealCountTab';
import { CandidatesTab } from './components/CandidatesTab';
import { DptSearchTab } from './components/DptSearchTab';
import { AdminPanel } from './components/AdminPanel';
import { ConfirmVoteModal } from './components/ConfirmVoteModal';
import { SuccessVoteModal } from './components/SuccessVoteModal';
import { getDeviceId, getFingerprintHash } from './utils/fingerprint';
import { RefreshCw, Vote, ShieldCheck, Heart, Lock, Unlock, KeyRound } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vote' | 'realcount' | 'candidates' | 'dpt' | 'admin'>('vote');
  const [electionData, setElectionData] = useState<ElectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Organization / Event Code state (e.g. KARTA-01, KARTA-02)
  const [activeOrgCode, setActiveOrgCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlOrg = params.get('org') || params.get('orgCode');
      if (urlOrg) {
        const clean = urlOrg.trim().toUpperCase();
        localStorage.setItem('e_voting_org_code', clean);
        return clean;
      }
      const saved = localStorage.getItem('e_voting_org_code');
      if (saved) return saved.trim().toUpperCase();
    }
    return 'KARTA-01';
  });

  const handleSelectOrgCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    setActiveOrgCode(clean);
    localStorage.setItem('e_voting_org_code', clean);
    
    // Update URL query string without page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('org', clean);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Admin / Master visibility & PIN state
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [masterPin, setMasterPin] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('e_voting_master_pin') || '123456789';
    }
    return '123456789';
  });

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);

  const [footerClicks, setFooterClicks] = useState(0);
  const handleFooterSecretClick = () => {
    const next = footerClicks + 1;
    setFooterClicks(next);
    if (next >= 3) {
      setFooterClicks(0);
      setIsMasterModalOpen(true);
    }
    setTimeout(() => setFooterClicks(0), 2000);
  };

  const handleUnlockMaster = (pinEntered?: string) => {
    if (pinEntered) {
      setMasterPin(pinEntered);
      localStorage.setItem('e_voting_master_pin', pinEntered);
    }
    setIsAdminUnlocked(true);
    localStorage.setItem('e_voting_admin_unlocked', 'true');
  };

  const handleLockMaster = () => {
    setIsAdminUnlocked(false);
    localStorage.setItem('e_voting_admin_unlocked', 'false');
    setActiveTab('vote');
  };

  // Voting modals state
  const [pendingCandidate, setPendingCandidate] = useState<Candidate | null>(null);
  const [pendingVoter, setPendingVoter] = useState<DPTMember | null>(null);
  const [receiptData, setReceiptData] = useState<{
    voterName: string;
    candidateName: string;
    noUrut: number;
    votedAt: string;
  } | null>(null);

  const fetchElectionData = useCallback(async (orgToFetch?: string) => {
    const targetCode = (orgToFetch || activeOrgCode).toUpperCase();
    try {
      const res = await fetch(`/api/election/data?org=${targetCode}`, {
        headers: { 'X-Org-Code': targetCode }
      });

      if (!res.ok) {
        console.warn(`API returned HTTP ${res.status}`);
        let serverErrorMsg = '';
        try {
          const errJson = await res.json();
          serverErrorMsg = errJson?.message || errJson?.error || '';
        } catch (_) {}
        setError(serverErrorMsg || `Server memberikan respon HTTP ${res.status}. Silakan coba refresh.`);
        return;
      }

      const json = await res.json();
      if (json.success && json.data) {
        setElectionData(json.data);
        setError('');
      } else {
        setError(json.message || 'Gagal memuat data pemilihan.');
      }
    } catch (err) {
      console.error('Error fetching election data:', err);
      setError('Gagal memuat data dari server. Pastikan server aktif.');
    } finally {
      setLoading(false);
    }
  }, [activeOrgCode]);

  useEffect(() => {
    fetchElectionData(activeOrgCode);
  }, [activeOrgCode, fetchElectionData]);

  // Initiate Vote Modal Handler
  const handleInitiateVote = (candidate: Candidate, voter: DPTMember) => {
    setPendingCandidate(candidate);
    setPendingVoter(voter);
  };

  // Submit Vote Handler
  const handleConfirmVoteSubmit = async () => {
    if (!pendingCandidate || !pendingVoter) return;

    const deviceId = getDeviceId();
    const fpHash = await getFingerprintHash();

    const response = await fetch(`/api/election/vote?org=${activeOrgCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Org-Code': activeOrgCode
      },
      body: JSON.stringify({
        nik: pendingVoter.nik,
        candidateId: pendingCandidate.id,
        deviceId,
        fingerprintHash: fpHash,
        orgCode: activeOrgCode
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Gagal mengirimkan suara.');
    }

    // Success! Save receipt & close confirmation modal
    setReceiptData({
      voterName: result.data?.voterName || pendingVoter.nama,
      candidateName: result.data?.candidateName || pendingCandidate.nama,
      noUrut: result.data?.noUrut || pendingCandidate.noUrut,
      votedAt: result.data?.votedAt || new Date().toLocaleString()
    });

    setPendingCandidate(null);
    setPendingVoter(null);

    // Refresh election data immediately
    await fetchElectionData(activeOrgCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-200 uppercase tracking-wide">Memuat Sistem Pemilihan Karang Taruna...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        electionData={electionData}
        activeOrgCode={activeOrgCode}
        onSelectOrgCode={handleSelectOrgCode}
        isAdminUnlocked={isAdminUnlocked}
        onUnlockMaster={handleUnlockMaster}
        onLockMaster={handleLockMaster}
        onLogoTripleClick={() => handleUnlockMaster()}
        isMasterModalOpen={isMasterModalOpen}
        setIsMasterModalOpen={setIsMasterModalOpen}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border-2 border-rose-300 text-rose-800 text-sm flex items-center justify-between shadow-sm">
            <span className="font-medium">{error}</span>
            <button
              onClick={() => fetchElectionData(activeOrgCode)}
              className="bg-rose-700 text-white hover:bg-rose-800 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {activeTab === 'vote' && (
          <VotingTab
            electionData={electionData}
            onInitiateVote={handleInitiateVote}
            onRefreshData={() => fetchElectionData(activeOrgCode)}
          />
        )}

        {activeTab === 'realcount' && (
          <RealCountTab
            electionData={electionData}
            onRefreshData={() => fetchElectionData(activeOrgCode)}
          />
        )}

        {activeTab === 'candidates' && (
          <CandidatesTab
            electionData={electionData}
            onSelectCandidateToVote={() => setActiveTab('vote')}
          />
        )}

        {activeTab === 'dpt' && (
          <DptSearchTab
            electionData={electionData}
            onGoToVote={() => setActiveTab('vote')}
            onRefreshData={() => fetchElectionData(activeOrgCode)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            electionData={electionData}
            activeOrgCode={activeOrgCode}
            onSelectOrgCode={handleSelectOrgCode}
            onRefreshData={() => fetchElectionData(activeOrgCode)}
          />
        )}
      </main>

      {/* Confirmation Vote Modal */}
      {pendingCandidate && pendingVoter && (
        <ConfirmVoteModal
          candidate={pendingCandidate}
          voter={pendingVoter}
          onConfirm={handleConfirmVoteSubmit}
          onCancel={() => {
            setPendingCandidate(null);
            setPendingVoter(null);
          }}
        />
      )}

      {/* Success Vote Receipt Modal */}
      {receiptData && (
        <SuccessVoteModal
          receiptData={receiptData}
          onClose={() => setReceiptData(null)}
          onViewRealCount={() => {
            setReceiptData(null);
            setActiveTab('realcount');
          }}
        />
      )}

      {/* Footer & Admin Master Toolbar */}
      <footer className="border-t-2 border-slate-300 bg-white py-6 text-xs text-slate-600 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 cursor-pointer select-none" onClick={handleFooterSecretClick} title="Sistem Pemilihan E-Voting">
            <div className="w-6 h-6 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-[10px]">
              KT
            </div>
            <span className="text-slate-800 font-bold uppercase tracking-wide">
              Sistem Pemilihan Ketua Karang Taruna
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-slate-500 font-medium">
            <span className="hidden lg:flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Deteksi Perangkat
            </span>
            <span className="hidden lg:inline">•</span>
            <span className="text-blue-900 font-semibold">Real-Count Transparan</span>
            <span>•</span>
            
            {/* Admin Master Toolbar (Visible only when Master is unlocked or via secret triple-click) */}
            {isAdminUnlocked ? (
              <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-400 p-1.5 rounded-xl shadow-xs">
                <button
                  onClick={() => setIsMasterModalOpen(true)}
                  className="text-[11px] text-amber-900 hover:text-amber-950 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Kelola multi-event & penyewa"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-800" /> Event Master 🔑
                </button>
                <button
                  onClick={handleLockMaster}
                  className="text-[11px] text-white bg-rose-700 hover:bg-rose-800 px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer uppercase tracking-wider"
                  title="Logout Master dan lihat tampilan orang awam"
                >
                  <Lock className="w-3.5 h-3.5 text-white" />
                  <span>Logout Master (Pantau Tampilan Awam)</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </footer>

    </div>
  );
}

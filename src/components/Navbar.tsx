import React, { useState } from 'react';
import { Vote, BarChart3, Users, Search, ShieldCheck, CheckCircle2, PauseCircle, XCircle, Share2, Building2, ChevronDown, Check, Copy, KeyRound, X } from 'lucide-react';
import { ElectionData } from '../types';
import { KarangTarunaLogo } from './KarangTarunaLogo';
import { ShareModal } from './ShareModal';

interface NavbarProps {
  activeTab: 'vote' | 'realcount' | 'candidates' | 'dpt' | 'admin';
  setActiveTab: (tab: 'vote' | 'realcount' | 'candidates' | 'dpt' | 'admin') => void;
  electionData: ElectionData | null;
  activeOrgCode?: string;
  onSelectOrgCode?: (code: string) => void;
  isAdminUnlocked?: boolean;
  onUnlockMaster?: (pin: string) => void;
  onLockMaster?: () => void;
  onLogoTripleClick?: () => void;
  isMasterModalOpen?: boolean;
  setIsMasterModalOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  electionData, 
  activeOrgCode = 'KARTA-01',
  onSelectOrgCode,
  isAdminUnlocked = false,
  onUnlockMaster,
  onLockMaster,
  onLogoTripleClick,
  isMasterModalOpen: isMasterModalOpenProp,
  setIsMasterModalOpen: setIsMasterModalOpenProp
}) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [internalMasterModalOpen, setInternalMasterModalOpen] = useState(false);

  const isMasterAuthModalOpen = isMasterModalOpenProp !== undefined ? isMasterModalOpenProp : internalMasterModalOpen;
  const setIsMasterAuthModalOpen = (val: boolean) => {
    if (setIsMasterModalOpenProp) {
      setIsMasterModalOpenProp(val);
    } else {
      setInternalMasterModalOpen(val);
    }
  };

  const [masterPinInput, setMasterPinInput] = useState('');
  const [masterAuthError, setMasterAuthError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    setActiveTab('vote');
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 3) {
      setLogoClicks(0);
      handleOpenMaster();
    }
    setTimeout(() => setLogoClicks(0), 2000);
  };

  const handleOpenMaster = () => {
    if (isAdminUnlocked) {
      setIsOrgModalOpen(true);
    } else {
      setMasterPinInput('');
      setMasterAuthError('');
      setIsMasterAuthModalOpen(true);
    }
  };

  const handleVerifyMasterPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMasterAuthError('');
    setIsVerifyingPin(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: masterPinInput, orgCode: currentOrgCode })
      });
      const data = await res.json();
      if (data.success) {
        if (onUnlockMaster) {
          onUnlockMaster(masterPinInput);
        }
        setIsMasterAuthModalOpen(false);
        setIsOrgModalOpen(true);
      } else {
        setMasterAuthError(data.message || 'PIN Master Salah!');
      }
    } catch (err) {
      setMasterAuthError('Gagal memverifikasi PIN dengan server.');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleSwitchOrg = (code: string) => {
    if (onSelectOrgCode) {
      onSelectOrgCode(code);
    }
    setIsOrgModalOpen(false);
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim() && onSelectOrgCode) {
      onSelectOrgCode(inputCode.trim());
      setInputCode('');
      setIsOrgModalOpen(false);
    }
  };

  const currentOrgName = electionData?.orgName || 'Karang Taruna';
  const currentOrgCode = electionData?.orgCode || activeOrgCode;

  const copyOrgLink = (code: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('org', code);
      navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <>
      <header className="bg-blue-900 text-white border-b-4 border-blue-700 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-2">
            
            {/* Logo & Title */}
            <div className="flex items-center space-x-3 cursor-pointer select-none shrink-0" onClick={handleLogoClick}>
              <div className="p-1 rounded-lg bg-blue-950/80 border-2 border-amber-400 shadow flex items-center justify-center shrink-0">
                {electionData?.logoUrl ? (
                  <img src={electionData.logoUrl} alt="Logo" className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded" />
                ) : (
                  <KarangTarunaLogo size={38} className="w-9 h-9 sm:w-10 sm:h-10" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="font-extrabold text-sm sm:text-base lg:text-xl tracking-tight uppercase text-white leading-tight">
                    {electionData?.appName || 'E-VOTING KARANG TARUNA'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-blue-200 truncate max-w-[130px] sm:max-w-[200px] lg:max-w-xs">
                  {electionData?.title || 'Pemilihan Ketua Karang Taruna'}
                </p>
              </div>
            </div>



            {/* Right Group: Status Badge & Nav Tabs */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Live Election Status Badge */}
              <div className="hidden xl:flex items-center space-x-2 bg-blue-800/90 px-3 py-1.5 rounded-lg border border-blue-600">
                {electionData?.status === 'ACTIVE' && (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Voting Aktif
                    </span>
                  </>
                )}
                {electionData?.status === 'PAUSED' && (
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1 uppercase tracking-wider">
                    <PauseCircle className="w-3.5 h-3.5 text-amber-400" /> Voting Ditunda
                  </span>
                )}
                {electionData?.status === 'CLOSED' && (
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1 uppercase tracking-wider">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" /> Voting Ditutup
                  </span>
                )}
              </div>

              {/* Desktop Navigation Tabs */}
              <nav className="hidden md:flex space-x-1.5 items-center">
                <button
                  id="nav-tab-vote"
                  onClick={() => setActiveTab('vote')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-bold uppercase tracking-wide transition-all ${
                    activeTab === 'vote'
                      ? 'bg-blue-600 text-white border-2 border-blue-400 shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-blue-800'
                  }`}
                >
                  <Vote className="w-4 h-4" />
                  <span>Pemilihan</span>
                </button>

                <button
                  id="nav-tab-dpt"
                  onClick={() => setActiveTab('dpt')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-bold uppercase tracking-wide transition-all ${
                    activeTab === 'dpt'
                      ? 'bg-blue-600 text-white border-2 border-blue-400 shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-blue-800'
                  }`}
                  title="Daftar Pemilih Tetap (DPT)"
                >
                  <Users className="w-4 h-4" />
                  <span>Pemilih</span>
                </button>

                <button
                  id="nav-tab-realcount"
                  onClick={() => setActiveTab('realcount')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-bold uppercase tracking-wide transition-all ${
                    activeTab === 'realcount'
                      ? 'bg-blue-600 text-white border-2 border-blue-400 shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-blue-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Real-Count</span>
                  {electionData?.totalVotes !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-blue-950 text-blue-200 rounded font-mono">
                      {electionData.totalVotes}
                    </span>
                  )}
                </button>

                {/* Bagikan Link Button */}
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="flex items-center space-x-1 px-2.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-lg border-2 border-amber-300 shadow-sm transition-all shrink-0 cursor-pointer"
                  title="Bagikan atau Salin Link Web E-Voting"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Bagikan</span>
                </button>

                {/* Admin User tab button */}
                <button
                  id="nav-tab-admin"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-bold uppercase tracking-wide transition-all ${
                    activeTab === 'admin'
                      ? 'bg-amber-600 text-white border-2 border-amber-400 shadow-sm'
                      : 'text-amber-300 hover:text-amber-200 hover:bg-blue-800'
                  }`}
                  title="Panel Admin Organisasi"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin User</span>
                </button>
              </nav>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Bar (Bottom Tabs) */}
        <div className="md:hidden bg-blue-950 border-t border-blue-800 flex items-center justify-around py-2 px-1">
          <button
            onClick={() => setActiveTab('vote')}
            className={`flex flex-col items-center py-1 px-1.5 rounded ${
              activeTab === 'vote' ? 'text-amber-400 font-bold' : 'text-blue-200'
            }`}
          >
            <Vote className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold mt-0.5">Pemilihan</span>
          </button>

          <button
            onClick={() => setActiveTab('dpt')}
            className={`flex flex-col items-center py-1 px-1.5 rounded ${
              activeTab === 'dpt' ? 'text-amber-400 font-bold' : 'text-blue-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold mt-0.5">Pemilih</span>
          </button>

          <button
            onClick={() => setActiveTab('realcount')}
            className={`flex flex-col items-center py-1 px-1.5 rounded ${
              activeTab === 'realcount' ? 'text-amber-400 font-bold' : 'text-blue-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold mt-0.5">Real-Count</span>
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className="flex flex-col items-center py-1 px-1.5 rounded text-amber-300 font-bold"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold mt-0.5">Bagikan</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center py-1 px-1.5 rounded ${
              activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-amber-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold mt-0.5">Admin</span>
          </button>
        </div>
      </header>

      {/* Master Authentication PIN Modal */}
      {isMasterAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-amber-600 text-white p-5 flex items-center justify-between border-b-4 border-amber-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-950 rounded-xl border border-amber-300">
                  <KeyRound className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg uppercase tracking-tight">Akses Panitia Master</h3>
                  <p className="text-xs text-amber-100">Masukkan PIN Khusus Master untuk Akses Kode Event</p>
                </div>
              </div>
              <button
                onClick={() => setIsMasterAuthModalOpen(false)}
                className="text-amber-200 hover:text-white p-1 rounded-lg hover:bg-amber-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleVerifyMasterPin} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  PIN Keamanan Master
                </label>
                <input
                  type="password"
                  value={masterPinInput}
                  onChange={(e) => setMasterPinInput(e.target.value)}
                  placeholder="Masukkan PIN Master"
                  className="w-full bg-slate-50 text-slate-900 border-2 border-slate-300 rounded-xl px-4 py-3 text-center text-xl tracking-widest font-mono font-bold focus:outline-none focus:border-amber-600 focus:bg-white"
                  autoFocus
                />
              </div>

              {masterAuthError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs text-center font-bold">
                  {masterAuthError}
                </div>
              )}

              <button
                type="submit"
                disabled={!masterPinInput.trim() || isVerifyingPin}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow transition-all flex items-center justify-center space-x-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isVerifyingPin ? 'Memverifikasi...' : 'Buka Pengelola Event Master'}</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareOpen && (
        <ShareModal 
          isOpen={isShareOpen} 
          onClose={() => setIsShareOpen(false)} 
          electionTitle={electionData?.title || 'Pemilihan Karang Taruna'}
          orgCode={currentOrgCode}
        />
      )}

      {/* Organization / Event Switcher Modal */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between border-b-4 border-blue-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-950 rounded-xl border border-amber-400">
                  <Building2 className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg uppercase tracking-tight">Pilih / Masukkan Kode Event</h3>
                  <p className="text-xs text-blue-200">Sistem Multi-Event / Multi-Penyewa 1 Link</p>
                </div>
              </div>
              <button
                onClick={() => setIsOrgModalOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Active Events List */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 block">
                  Daftar Event / Organisasi Aktif Saat Ini:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {electionData?.allOrgs && electionData.allOrgs.length > 0 ? (
                    electionData.allOrgs.map(org => {
                      const isSelected = org.code === currentOrgCode;
                      return (
                        <div
                          key={org.code}
                          onClick={() => handleSwitchOrg(org.code)}
                          className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-600 shadow-sm'
                              : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded text-xs font-black uppercase font-mono ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {org.code}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{org.name}</p>
                              <p className="text-xs text-slate-500">{org.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSelected ? (
                              <span className="flex items-center text-xs font-extrabold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
                                <Check className="w-4 h-4 mr-1" /> Aktif
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyOrgLink(org.code);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200"
                                title="Salin link khusus event ini"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 italic">Memuat daftar event...</p>
                  )}
                </div>
              </div>

              {/* Manual Input Code Form */}
              <form onSubmit={handleManualCodeSubmit} className="pt-4 border-t border-slate-200">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2 block">
                  Atau Masukkan Kode Organisasi / Event Lain:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="Contoh: KARTA-03 atau RT05"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border-2 border-slate-300 rounded-xl font-mono uppercase font-bold focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputCode.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
                  >
                    Buka Event
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}
    </>
  );
};


import React, { useState, useEffect } from 'react';
import { BarChart3, Users, CheckCircle2, Trophy, Clock, RefreshCw, Flame, ShieldCheck } from 'lucide-react';
import { ElectionData } from '../types';

interface RealCountTabProps {
  electionData: ElectionData | null;
  onRefreshData: () => void;
}

export const RealCountTab: React.FC<RealCountTabProps> = ({ electionData, onRefreshData }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Periodic auto-refresh every 5 seconds for live realcount updates!
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        onRefreshData();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, onRefreshData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const candidates = electionData?.candidates || [];
  const totalVotes = electionData?.totalVotes || 0;
  const totalDpt = electionData?.totalDpt || 0;
  const participationRate = electionData?.participationRate || 0;
  const remainingVotes = Math.max(0, totalDpt - totalVotes);

  // Find leader candidate(s)
  const sortedCandidates = [...candidates].sort((a, b) => b.jumlahSuara - a.jumlahSuara);
  const leaderCandidateId = totalVotes > 0 && sortedCandidates[0] ? sortedCandidates[0].id : null;

  // Filter list of members who have voted for live feed
  const votedMembers = (electionData?.dpt || []).filter(m => m.hasVoted);

  return (
    <div className="space-y-8 pb-12">

      {/* Header Realcount Title & Refresh Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Hasil Langsung & Transparan (Real-Count)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-wide">
            Hasil Perhitungan Suara Real-Count
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Perhitungan suara otomatis & langsung diperbarui secara otomatis dari sistem
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold uppercase border tracking-wider transition-all ${
              autoRefresh
                ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
          >
            {autoRefresh ? '● Auto-Refresh ON (5s)' : '○ Auto-Refresh OFF'}
          </button>

          <button
            onClick={handleManualRefresh}
            className="bg-blue-800 hover:bg-blue-900 text-white p-2.5 rounded-lg border border-blue-950 shadow transition-all"
            title="Refresh Data Sekarang"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Statistics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total DPT */}
        <div className="bg-white border-2 border-slate-300 rounded-lg p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider">Total DPT</span>
            <Users className="w-5 h-5 text-blue-900" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalDpt}</div>
          <p className="text-[11px] text-slate-500 font-semibold uppercase">Pemilih Terdaftar</p>
        </div>

        {/* Total Suara Masuk */}
        <div className="bg-white border-2 border-slate-300 rounded-lg p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider">Suara Masuk</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{totalVotes}</div>
          <p className="text-[11px] text-slate-500 font-semibold uppercase">Suara Sah Masuk</p>
        </div>

        {/* Persentase Partisipasi */}
        <div className="bg-white border-2 border-slate-300 rounded-lg p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider">Partisipasi</span>
            <BarChart3 className="w-5 h-5 text-blue-800" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900">{participationRate}%</div>
          <div className="w-full bg-slate-200 h-2 rounded border border-slate-300 overflow-hidden">
            <div className="bg-blue-700 h-full transition-all duration-1000" style={{ width: `${participationRate}%` }} />
          </div>
        </div>

        {/* Belum Memilih */}
        <div className="bg-white border-2 border-slate-300 rounded-lg p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider">Belum Memilih</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{remainingVotes}</div>
          <p className="text-[11px] text-slate-500 font-semibold uppercase">Sisa Pemilih DPT</p>
        </div>

      </div>

      {/* Candidate Votes Breakdown Leaderboard */}
      <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Perolehan Suara Calon Ketua</span>
          </h2>
          <span className="text-xs text-slate-600 font-bold uppercase">Total Suara Sah: {totalVotes}</span>
        </div>

        <div className="space-y-6">
          {candidates.map((candidate) => {
            const votes = candidate.jumlahSuara;
            const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';
            const isLeader = leaderCandidateId === candidate.id && votes > 0;

            return (
              <div
                key={candidate.id}
                className={`rounded-lg p-5 border-2 transition-all ${
                  isLeader
                    ? 'bg-amber-50/60 border-amber-400 shadow-sm'
                    : 'bg-slate-50 border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Candidate Info */}
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded overflow-hidden bg-slate-200 shrink-0 border-2 border-slate-300">
                      <img
                        src={candidate.fotoUrl}
                        alt={candidate.nama}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute top-0 left-0 bg-blue-900 text-white font-black text-xs px-1.5 py-0.5">
                        {String(candidate.noUrut).padStart(2, '0')}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-slate-900 text-base sm:text-lg uppercase">{candidate.nama}</h3>
                        {isLeader && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-extrabold border border-amber-400 uppercase tracking-wider">
                            <Trophy className="w-3 h-3 text-amber-700" />
                            <span>Unggul Sementara</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">Nomor Urut {candidate.noUrut}</p>
                    </div>
                  </div>

                  {/* Vote Count & Percentage */}
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {votes} <span className="text-sm font-bold text-slate-500 uppercase">Suara</span>
                    </div>
                    <div className="text-xs font-black text-blue-900">{percentage}%</div>
                  </div>

                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1">
                  <div className="w-full bg-slate-200 h-4 rounded border-2 border-slate-300 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isLeader ? 'bg-amber-500' : 'bg-blue-700'
                      }`}
                      style={{ width: `${Math.max(2, parseFloat(percentage))}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Transparency Log (Audit Trail of voters who have voted) */}
      <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-900 text-base uppercase tracking-wide">Log Transparansi Pemilih (Live Feed)</h3>
          </div>
          <span className="text-xs text-slate-600 font-bold uppercase">{votedMembers.length} DPT Telah Memilih</span>
        </div>

        {votedMembers.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm font-medium">
            Belum ada suara masuk. Silakan gunakan tab "Surat Suara" untuk memberikan suara pertama Anda!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            {votedMembers.map((member) => (
              <div
                key={member.id}
                className="bg-slate-50 border border-slate-300 rounded-lg p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <span className="font-bold text-slate-900">{member.nama}</span>
                    <span className="text-slate-500 ml-2 font-mono">({member.nik.slice(0, 4)}****{member.nik.slice(-2)})</span>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold uppercase">{member.votedAt || 'Sudah Memilih'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

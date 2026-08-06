import React, { useState } from 'react';
import { Search, CheckCircle, Clock, XCircle, AlertCircle, Shield } from 'lucide-react';
import { ElectionData } from '../types';

interface DptSearchTabProps {
  electionData: ElectionData | null;
  onGoToVote: () => void;
  onRefreshData?: () => void;
}

export const DptSearchTab: React.FC<DptSearchTabProps> = ({ electionData, onGoToVote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VOTED' | 'NOT_VOTED'>('ALL');

  const dptList = electionData?.dpt || [];

  const filteredDpt = dptList.filter((m) => {
    const matchesSearch =
      m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rtRw.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'VOTED') return matchesSearch && m.hasVoted;
    if (filterStatus === 'NOT_VOTED') return matchesSearch && !m.hasVoted;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm space-y-2">
        <div className="inline-flex items-center space-x-2 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>Daftar Pemilih Tetap (DPT)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-wide">Pencarian & Data DPT Karang Taruna</h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          Cari nama atau NIK Anda untuk memastikan hak pilih Anda sudah terdaftar secara resmi oleh Panitia Admin.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan Nama Lengkap, NIK, atau RT/RW..."
              className="w-full bg-slate-50 text-slate-900 border-2 border-slate-300 rounded-lg px-4 py-3 pl-11 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3.5 py-2.5 rounded-lg text-xs font-extrabold uppercase border tracking-wider transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-blue-900 border-blue-950 text-white shadow'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua ({dptList.length})
            </button>
            <button
              onClick={() => setFilterStatus('NOT_VOTED')}
              className={`px-3.5 py-2.5 rounded-lg text-xs font-extrabold uppercase border tracking-wider transition-all ${
                filterStatus === 'NOT_VOTED'
                  ? 'bg-emerald-700 border-emerald-900 text-white shadow'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Belum Memilih ({dptList.filter(d => !d.hasVoted).length})
            </button>
            <button
              onClick={() => setFilterStatus('VOTED')}
              className={`px-3.5 py-2.5 rounded-lg text-xs font-extrabold uppercase border tracking-wider transition-all ${
                filterStatus === 'VOTED'
                  ? 'bg-blue-800 border-blue-950 text-white shadow'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sudah Memilih ({dptList.filter(d => d.hasVoted).length})
            </button>
          </div>

        </div>

        {/* Results Info */}
        <div className="text-xs text-slate-600 font-bold flex justify-between items-center pt-2 border-t border-slate-200">
          <span>Menampilkan {filteredDpt.length} dari {dptList.length} pemilih terdaftar</span>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-blue-700 hover:underline font-extrabold uppercase">
              Bersihkan Pencarian
            </button>
          )}
        </div>
      </div>

      {/* DPT Table List */}
      <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm">
        {filteredDpt.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <XCircle className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-lg uppercase">Data DPT Tidak Ditemukan</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
              Nama atau NIK "{searchQuery}" belum terdaftar dalam DPT. Silakan hubungi Panitia Admin Karang Taruna untuk pendaftaran ulang.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-100 text-xs font-black uppercase tracking-wider text-slate-700 border-b-2 border-slate-300">
                <tr>
                  <th className="px-6 py-4">No.</th>
                  <th className="px-6 py-4">NIK / Kode Pemilih</th>
                  <th className="px-6 py-4">Nama Lengkap Pemilih</th>
                  <th className="px-6 py-4">Wilayah / RT RW</th>
                  <th className="px-6 py-4 text-center">Status Pemilihan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDpt.map((member, index) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {member.nik}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      {member.nama}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {member.rtRw}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {member.hasVoted ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-100 text-blue-900 text-xs font-extrabold border border-blue-300 uppercase tracking-wider">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-700" />
                          <span>Sudah Memilih</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-300 uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Belum Memilih</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!member.hasVoted && (
                        <button
                          onClick={onGoToVote}
                          className="bg-blue-800 hover:bg-blue-900 text-white text-xs font-extrabold px-3 py-1.5 rounded transition-all shadow uppercase tracking-wider"
                        >
                          Pilih Sekarang 🗳️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

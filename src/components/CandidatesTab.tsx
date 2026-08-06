import React from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import { ElectionData } from '../types';

interface CandidatesTabProps {
  electionData: ElectionData | null;
  onSelectCandidateToVote: () => void;
}

export const CandidatesTab: React.FC<CandidatesTabProps> = ({ electionData, onSelectCandidateToVote }) => {
  const candidates = electionData?.candidates || [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm space-y-2">
        <div className="inline-flex items-center space-x-2 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Profil & Program Kerja</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-wide">Daftar Calon Ketua Karang Taruna</h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          Pelajari visi, misi, serta latar belakang setiap calon sebelum menggunakan hak pilih Anda di Surat Suara.
        </p>
      </div>

      {/* Candidates List */}
      <div className="space-y-8">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm flex flex-col md:flex-row hover:border-blue-700 transition-all"
          >
            {/* Left Photo Column */}
            <div className="relative md:w-80 h-80 md:h-auto bg-slate-200 shrink-0 overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-slate-300">
              <img
                src={candidate.fotoUrl}
                alt={candidate.nama}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute top-4 left-4 bg-blue-900 text-white font-black px-4 py-2 rounded border-2 border-blue-700 text-xl shadow flex items-center space-x-2">
                <span className="text-xs text-blue-200 uppercase tracking-widest font-bold">NOMOR URUT</span>
                <span className="text-3xl text-white font-black">{String(candidate.noUrut).padStart(2, '0')}</span>
              </div>
            </div>

            {/* Right Info Column */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">Calon Ketua #{candidate.noUrut}</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 uppercase">{candidate.nama}</h2>
                  <p className="text-sm text-slate-600 font-semibold">Panggilan: <span className="text-slate-900 font-bold">{candidate.panggilan}</span></p>
                </div>

                {/* Visi */}
                <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-1">
                  <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">Visi Calon</h4>
                  <p className="text-sm text-slate-800 italic leading-relaxed font-medium">
                    "{candidate.visi}"
                  </p>
                </div>

                {/* Misi */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Misi & Program Kerja:</h4>
                  <ul className="space-y-2">
                    {candidate.misi.map((m, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-200">
                <button
                  onClick={onSelectCandidateToVote}
                  className="bg-blue-800 hover:bg-blue-900 text-white font-extrabold px-6 py-3 rounded-lg text-sm transition-all border border-blue-950 shadow uppercase tracking-wider"
                >
                  Pilih Calon Ini di Surat Suara 🗳️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

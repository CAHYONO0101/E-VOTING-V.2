import React from 'react';
import { CheckCircle2, BarChart3, ShieldCheck, Share2 } from 'lucide-react';

interface SuccessVoteModalProps {
  receiptData: {
    voterName: string;
    candidateName: string;
    noUrut: number;
    votedAt: string;
  };
  onClose: () => void;
  onViewRealCount: () => void;
}

export const SuccessVoteModal: React.FC<SuccessVoteModalProps> = ({
  receiptData,
  onClose,
  onViewRealCount
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border-2 border-slate-300 rounded-lg p-6 sm:p-8 max-w-md w-full space-y-6 shadow-md relative text-slate-900 text-center">
        
        {/* Top Success Badge */}
        <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-500 text-emerald-800 rounded-lg mx-auto flex items-center justify-center shadow">
          <CheckCircle2 className="w-10 h-10 text-emerald-700" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Suara Anda Sah Terbilang</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase">Terima Kasih!</h2>
          <p className="text-xs text-slate-600 font-medium">
            Hak pilih Anda dalam Pemilihan Ketua Karang Taruna telah berhasil dicatat secara resmi oleh sistem.
          </p>
        </div>

        {/* Digital Voting Receipt Ticket */}
        <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-5 text-left space-y-3 relative overflow-hidden">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200 pb-2 flex justify-between items-center">
            <span>BUKTI BUKTI DIGITAL VOTING</span>
            <span className="text-emerald-700 font-mono font-black">STATUS: SAH</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Identitas Suara Pemilih:</span>
              <strong className="text-slate-900 text-sm font-black uppercase">{receiptData.voterName}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Pilihan Calon Ketua:</span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="bg-blue-900 text-white font-black px-2 py-0.5 rounded text-xs border border-blue-950">
                  NO. {String(receiptData.noUrut).padStart(2, '0')}
                </span>
                <span className="font-black text-slate-900 text-sm uppercase">{receiptData.candidateName}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Waktu Pencatatan:</span>
              <span className="font-mono text-slate-700 font-bold">{receiptData.votedAt}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={onViewRealCount}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-extrabold py-3.5 rounded-lg text-sm transition-all border border-blue-950 shadow flex items-center justify-center space-x-2 uppercase tracking-wider"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Lihat Hasil Real-Count Langsung</span>
          </button>

          <button
            onClick={onClose}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-lg text-xs transition-all border border-slate-300 uppercase tracking-wider"
          >
            Tutup Halaman
          </button>
        </div>

      </div>
    </div>
  );
};

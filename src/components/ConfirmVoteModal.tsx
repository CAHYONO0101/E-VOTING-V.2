import React, { useState } from 'react';
import { Candidate, DPTMember } from '../types';
import { Vote, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

interface ConfirmVoteModalProps {
  candidate: Candidate;
  voter: DPTMember;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const ConfirmVoteModal: React.FC<ConfirmVoteModalProps> = ({
  candidate,
  voter,
  onConfirm,
  onCancel
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirmClick = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await onConfirm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirimkan suara. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border-2 border-slate-300 rounded-lg p-6 sm:p-8 max-w-md w-full space-y-6 shadow-md relative overflow-hidden text-slate-900">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-lg bg-blue-900 border-2 border-blue-700 text-white mx-auto flex items-center justify-center shadow">
            <Vote className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">Konfirmasi Surat Suara</h2>
          <p className="text-xs text-slate-600 font-medium">
            Periksa kembali pilihan Anda sebelum suara dikirimkan secara resmi ke kotak suara digital.
          </p>
        </div>

        {/* Voter Details */}
        <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-300 text-xs text-slate-800 space-y-1">
          <div className="text-blue-900 font-black uppercase text-[10px]">Metode Pemilihan & Verifikasi</div>
          <div className="font-extrabold text-slate-900 text-sm uppercase">{voter.nama || 'Pemilih Terverifikasi'}</div>
          <div className="text-slate-600 font-medium">Sistem 1 Perangkat 1 Suara (Perangkat Aktif Terdeteksi)</div>
        </div>

        {/* Selected Candidate Card Preview */}
        <div className="bg-slate-50 rounded-lg p-4 border-2 border-blue-800 flex items-center space-x-4">
          <img
            src={candidate.fotoUrl}
            alt={candidate.nama}
            className="w-16 h-16 rounded-lg object-cover object-top border-2 border-slate-300 bg-slate-200 shrink-0"
          />
          <div>
            <div className="text-xs font-black text-blue-900 uppercase">NOMOR URUT {String(candidate.noUrut).padStart(2, '0')}</div>
            <h3 className="font-black text-slate-900 text-base uppercase">{candidate.nama}</h3>
            <p className="text-xs text-slate-600 font-semibold">Calon Ketua Karang Taruna</p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border-2 border-amber-400 rounded-lg text-amber-900 text-xs font-semibold flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            Pilihan tidak dapat diubah setelah tombol kirim ditekan dan perangkat ini akan terkunci otomatis.
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs rounded-lg flex items-center space-x-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            id="btn-cancel-vote"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold py-3 rounded-lg text-sm transition-all border border-slate-300 uppercase tracking-wider"
          >
            Batal
          </button>
          <button
            id="btn-confirm-vote-submit"
            onClick={handleConfirmClick}
            disabled={submitting}
            className="flex-1 bg-blue-900 hover:bg-blue-950 text-white font-extrabold py-3 rounded-lg text-sm transition-all border border-blue-950 shadow flex items-center justify-center space-x-1.5 disabled:opacity-50 uppercase tracking-wider"
          >
            {submitting ? (
              <span>Mengirim Suara...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>KIRIM SUARA SAH</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

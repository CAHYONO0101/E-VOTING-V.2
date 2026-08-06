import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, MessageCircle, X, Globe, Link2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  electionTitle?: string;
  orgCode?: string;
  title?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  electionTitle,
  orgCode,
  title = 'E-Voting Karang Taruna' 
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayTitle = electionTitle || title;

  // Compute clean URL with org code parameter
  const getAppUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.origin + window.location.pathname);
    if (orgCode) {
      url.searchParams.set('org', orgCode);
    }
    return url.toString();
  };

  const appUrl = getAppUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareText = `*${title}*\n\nAyo gunakan hak pilihmu dalam Pemilihan Ketua Karang Taruna! Klik link di bawah ini untuk melihat kandidat dan memberikan suara:\n\n👉 ${appUrl}`;
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600 w-full max-w-md overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-blue-700">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-800 rounded-lg border border-blue-600">
              <Share2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base uppercase tracking-wider text-white">Bagikan Link Web E-Voting</h3>
              <p className="text-xs text-blue-200">Akses langsung tanpa instalasi aplikasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* URL Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600" /> Link Aplikasi E-Voting:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-slate-100 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white border-2 border-emerald-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-500'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Disalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Salin
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Link berhasil disalin ke clipboard!
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl border-2 border-emerald-500 shadow-sm transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Bagikan ke Grup WhatsApp</span>
            </a>

            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm uppercase tracking-wider rounded-xl border-2 border-slate-700 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Buka di Tab Baru / Browser</span>
            </a>
          </div>

          {/* Info note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <Link2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Link ini dapat dibuka oleh seluruh pemilih di smartphone maupun PC tanpa perlu install aplikasi.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 text-right border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

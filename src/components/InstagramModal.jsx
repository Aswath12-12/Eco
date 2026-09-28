import React from 'react';
import { X, ExternalLink, Download, Check, Copy } from 'lucide-react';

export default function InstagramModal({ isOpen, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const instaUrl = 'https://www.instagram.com/ecoclub_sxcce?utm_source=qr&stkn=YnUwMnV2MTAzeGUy';
  const handle = '@ecoclub_sxcce';

  const copyHandle = () => {
    navigator.clipboard.writeText(handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 rounded-full blur-2xl opacity-20 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full blur-2xl opacity-20 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Instagram Header Badge */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-md shadow-rose-500/20 mb-3">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <svg
              className="w-6 h-6 text-rose-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-black text-slate-900 tracking-tight">Eco Club on Instagram</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Scan the QR code with your phone camera or Instagram app to visit our official page.
        </p>

        {/* QR Code Poster Image */}
        <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md max-w-[240px] bg-gradient-to-br from-amber-400 to-rose-500">
          <img
            src="/ecoclub-instagram-qr.jpg"
            alt="Eco Club SXCCE Instagram QR Code"
            className="w-full h-auto object-cover block"
          />
        </div>

        {/* Handle Badge with Copy */}
        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
          <span>{handle}</span>
          <button
            onClick={copyHandle}
            className="text-slate-500 hover:text-slate-800 transition cursor-pointer p-0.5"
            title="Copy username"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="mt-5 w-full flex flex-col gap-2">
          <a
            href={instaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-2"
          >
            <span>Open in Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="/ecoclub-instagram-qr.jpg"
            download="ecoclub-instagram-qr.jpg"
            className="w-full py-2 px-4 rounded-xl text-slate-700 hover:text-slate-900 font-semibold text-xs bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download QR Code</span>
          </a>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ExternalLink, QrCode, Sparkles, Check, Copy } from 'lucide-react';
import InstagramModal from './InstagramModal';

export default function InstagramCommunityCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const instaUrl = 'https://www.instagram.com/ecoclub_sxcce?utm_source=qr&stkn=YnUwMnV2MTAzeGUy';
  const handle = '@ecoclub_sxcce';

  const copyHandle = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-rose-50/30 to-amber-50/40 border border-rose-200/60 p-6 sm:p-7 shadow-xs">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-gradient-to-br from-amber-400/20 via-rose-500/20 to-purple-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left / Info Side */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                OFFICIAL INSTAGRAM
              </span>
              <button
                onClick={copyHandle}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white text-slate-700 border border-slate-200 hover:border-slate-300 transition cursor-pointer shadow-2xs"
                title="Click to copy handle"
              >
                <span>{handle}</span>
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Connect with SXCCE Eco Club
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                Catch real-time campus drive highlights, photo stories, green initiatives, and inter-house competition updates directly on our official Instagram feed.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              <a
                href={instaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 shadow-md shadow-rose-500/20 transition transform active:scale-95"
              >
                <svg
                  className="w-4 h-4 text-white"
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
                <span>Follow @ecoclub_sxcce</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-slate-600" />
                <span>Scan QR Code</span>
              </button>
            </div>
          </div>

          {/* Right / QR Code Preview Box */}
          <div
            onClick={() => setModalOpen(true)}
            className="group relative cursor-pointer rounded-2xl bg-white p-3 border border-rose-200/70 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 shrink-0 w-36 sm:w-40 flex flex-col items-center"
          >
            <div className="w-full aspect-[9/14] rounded-xl overflow-hidden relative bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
              <img
                src="/ecoclub-instagram-qr.jpg"
                alt="Eco Club Instagram QR Code"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                <div className="px-2.5 py-1 rounded-lg bg-white/90 text-[11px] font-bold text-slate-900 shadow-sm flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-rose-500" />
                  <span>Enlarge</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <span>Scan to follow</span>
            </div>
          </div>
        </div>
      </div>

      <InstagramModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ExternalLink, Copy, Check, Smartphone, X, Globe } from 'lucide-react';

export const LiveVercelQR: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Canonical Production Domain (strictly avoids locked preview/deployment hashes)
  const configuredUrl = import.meta.env.VITE_VERCEL_URL;
  const isHashUrl =
    configuredUrl &&
    (configuredUrl.includes('temporary-') ||
      configuredUrl.includes('-git-') ||
      configuredUrl.includes('preview'));
  const liveUrl =
    configuredUrl && !isHashUrl
      ? configuredUrl
      : 'https://client-chi-gilt-57.vercel.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="relative">
      {/* Clean paper trigger button */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EDF3EE] border border-[#E6E1D8] text-xs font-medium text-[#373C38] hover:text-[#242725] transition cursor-pointer shadow-2xs group"
          title="Scan QR to open live Vercel deployment on mobile"
        >
          <span className="w-2 h-2 rounded-full bg-[#5B8266] animate-pulse" />
          <QrCode className="w-3.5 h-3.5 text-[#5B8266]" />
          <span>Live Vercel QR</span>
        </button>
      ) : (
        /* Flat Zen Nature paper card */
        <div className="absolute right-0 top-full mt-2 w-80 p-4 rounded-2xl bg-[#FFFFFF] border-2 border-[#5B8266]/30 shadow-xl z-50">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#EFEBE3]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#EDF3EE] text-[#43634D]">
                <Globe className="w-4 h-4 text-[#5B8266]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#242725] tracking-wide">Live Vercel Deployment</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-[#5B8266] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B8266]" />
                  <span>Online & Publicly Accessible</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#6D736E] hover:text-[#242725] p-1 rounded hover:bg-[#FAF8F5] transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* QR Code Container on clean white card */}
          <div className="my-3 flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8]">
            <div className="p-2.5 bg-white rounded-lg border border-[#E6E1D8] shadow-2xs">
              <QRCodeSVG
                value={liveUrl}
                size={144}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="mt-2.5 text-center">
              <p className="text-[11px] font-semibold text-[#242725]">
                Scan to Open on Any Device
              </p>
              <p className="text-[10px] text-[#6D736E]">
                Deployed to live Vercel edge network
              </p>
            </div>
          </div>

          {/* URL & Action */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] border border-[#E6E1D8] text-[11px] font-mono text-[#373C38]">
              <span className="truncate pr-2">{liveUrl.replace('https://', '')}</span>
              <button
                onClick={handleCopy}
                className="text-[#5B8266] hover:text-[#43634D] flex items-center gap-1 shrink-0 font-medium cursor-pointer"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Live Vercel Site</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

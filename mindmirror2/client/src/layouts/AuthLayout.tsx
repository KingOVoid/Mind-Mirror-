import '../styles/globals.css';
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import StationeryBackground from '../components/StationeryBackground';
import { LiveVercelQR } from '../components/LiveVercelQR';
import { Feather } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-transparent text-[#242725] overflow-x-hidden">
      <StationeryBackground />
      {/* Top Header */}
      <header className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EDF3EE] flex items-center justify-center border border-[#C8D7CB] text-[#5B8266]">
            <Feather className="w-4 h-4" />
          </div>
          <span className="font-display text-base font-bold tracking-tight text-[#242725]">
            Mind Mirror
          </span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB] font-mono">
            Zen Study
          </span>
        </Link>

        {/* Local Network QR */}
        <div className="flex items-center gap-3">
          <LiveVercelQR />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-50 flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-50 py-6 text-center text-xs text-[#8E948F]">
        Mind Mirror &copy; 2026 &bull; First-Principles Zen Study Workspace
      </footer>
    </div>
  );
};

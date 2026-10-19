import React from 'react';
import { Link } from 'react-router-dom';
import { LevitatingCard } from '../components/LevitatingCard';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050711]">
      <LevitatingCard className="max-w-md w-full p-8 border border-white/10 text-center space-y-4">
        <Compass className="w-12 h-12 text-cyan-400 mx-auto animate-spin-slow" />
        <h2 className="text-2xl font-bold text-white font-display">Trajectory Lost (404)</h2>
        <p className="text-xs text-slate-400 font-mono">
          The requested orbital trajectory does not exist in this sector.
        </p>
        <Link
          to="/dashboard"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-cyan-600/80 text-white text-xs font-mono"
        >
          Return to Dashboard
        </Link>
      </LevitatingCard>
    </div>
  );
}

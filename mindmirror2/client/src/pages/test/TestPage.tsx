import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LevitatingCard } from '../../components/LevitatingCard';
import { ArrowLeft } from 'lucide-react';

export default function TestPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto flex flex-col justify-center">
      <LevitatingCard className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-white font-display">Engineering Examination Arena</h2>
        <p className="text-xs text-slate-400 font-mono">Timed examination conditions with full analytics tracking.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-mono flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
      </LevitatingCard>
    </div>
  );
}

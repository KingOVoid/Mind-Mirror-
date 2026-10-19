import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LevitatingCard } from '../../components/LevitatingCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050711]">
      <LevitatingCard className="max-w-xl w-full p-8 border border-white/10 text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white font-display">Engineering Onboarding Calibration</h2>
        <p className="text-xs text-slate-400 font-mono">
          Your cognitive twin model adapts automatically as you complete problem sets and review high-yield concepts.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-semibold flex items-center gap-2 mx-auto cursor-pointer"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </LevitatingCard>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { LevitatingCard } from '../../components/LevitatingCard';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <LevitatingCard className="p-8 border border-white/10 text-center">
        <h2 className="text-xl font-bold font-display text-white mb-2">Reset Password</h2>
        <p className="text-xs text-slate-400 font-mono mb-6">Enter your registered email to receive recovery instructions.</p>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="student@engineering.edu"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-sm text-white outline-none"
          />
          <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-semibold cursor-pointer">
            Send Reset Link
          </button>
        </div>
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 mt-6 font-mono">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>
      </LevitatingCard>
    </div>
  );
}

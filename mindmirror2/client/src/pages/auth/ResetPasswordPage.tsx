import React from 'react';
import { Link } from 'react-router-dom';
import { LevitatingCard } from '../../components/LevitatingCard';

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <LevitatingCard className="p-8 border border-white/10 text-center">
        <h2 className="text-xl font-bold font-display text-white mb-2">Create New Password</h2>
        <div className="space-y-4 my-6">
          <input
            type="password"
            placeholder="New password"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-sm text-white outline-none"
          />
          <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold cursor-pointer">
            Update Password
          </button>
        </div>
        <Link to="/login" className="text-xs text-purple-400 hover:underline font-mono">
          Return to Login
        </Link>
      </LevitatingCard>
    </div>
  );
}

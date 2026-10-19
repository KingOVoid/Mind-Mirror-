import React from 'react';
import { LevitatingCard } from '../../components/LevitatingCard';

export default function AdminOverviewPage() {
  return (
    <LevitatingCard className="p-6">
      <h2 className="text-xl font-bold text-white font-display">System Overview</h2>
      <p className="text-xs text-slate-400 font-mono mt-1">Platform analytics and cohort telemetry.</p>
    </LevitatingCard>
  );
}

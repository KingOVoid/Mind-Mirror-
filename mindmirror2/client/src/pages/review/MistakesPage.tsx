import React from 'react';
import { LevitatingCard } from '../../components/LevitatingCard';

export default function MistakesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-white">Mistakes Notebook</h2>
      <LevitatingCard className="p-6">
        <p className="text-xs text-slate-300 font-mono">
          Catalog of misunderstood concepts and automated remediation practice drills.
        </p>
      </LevitatingCard>
    </div>
  );
}

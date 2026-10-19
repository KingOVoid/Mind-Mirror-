import React from 'react';
import { LevitatingCard } from '../../components/LevitatingCard';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-white">Cognitive Analytics</h2>
      <LevitatingCard className="p-6">
        <p className="text-xs text-slate-300 font-mono">
          Longitudinal learning curves, accuracy calibration, and response time metrics.
        </p>
      </LevitatingCard>
    </div>
  );
}

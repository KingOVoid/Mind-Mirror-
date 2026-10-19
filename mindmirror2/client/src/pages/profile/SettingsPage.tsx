import React from 'react';
import { LevitatingCard } from '../../components/LevitatingCard';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-white">Platform Settings</h2>
      <LevitatingCard className="p-6">
        <p className="text-xs text-slate-300 font-mono">
          Anti-gravity display preferences, model endpoint configurations, and telemetry options.
        </p>
      </LevitatingCard>
    </div>
  );
}

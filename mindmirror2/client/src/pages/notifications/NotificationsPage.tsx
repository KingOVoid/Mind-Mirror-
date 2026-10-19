import React from 'react';
import { LevitatingCard } from '../../components/LevitatingCard';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-white">Notifications & Alerts</h2>
      <LevitatingCard className="p-6">
        <p className="text-xs text-slate-300 font-mono">
          System telemetry notifications and spaced review reminders.
        </p>
      </LevitatingCard>
    </div>
  );
}

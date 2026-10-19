import React from 'react';
import { LevitatingCard } from '../../components/LevitatingCard';

export default function AdminStudentsPage() {
  return (
    <LevitatingCard className="p-6">
      <h2 className="text-xl font-bold text-white font-display">Enrolled Students</h2>
      <p className="text-xs text-slate-400 font-mono mt-1">Student roster and retention health.</p>
    </LevitatingCard>
  );
}

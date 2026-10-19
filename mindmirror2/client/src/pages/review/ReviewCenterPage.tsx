import React from 'react';
import { LevitatingCard } from '../../components/LevitatingCard';
import { RotateCcw } from 'lucide-react';

export default function ReviewCenterPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-white">Spaced Repetition Review Center</h2>
      <LevitatingCard className="p-6">
        <p className="text-xs text-slate-300 font-mono">
          Review queues generated via adaptive forgetting curve decay intervals.
        </p>
      </LevitatingCard>
    </div>
  );
}

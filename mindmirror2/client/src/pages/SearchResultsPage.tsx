import React from 'react';
import { LevitatingCard } from '../components/LevitatingCard';

export default function SearchResultsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-white">Search Results</h2>
      <LevitatingCard className="p-6">
        <p className="text-xs text-slate-300 font-mono">
          Search across engineering topics, questions, and formula sheets.
        </p>
      </LevitatingCard>
    </div>
  );
}

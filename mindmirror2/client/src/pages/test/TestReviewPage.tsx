import React from 'react';
import { Link } from 'react-router-dom';
import { LevitatingCard } from '../../components/LevitatingCard';

export default function TestReviewPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <LevitatingCard className="p-6">
        <h2 className="text-xl font-bold text-white font-display">Test Performance Analysis</h2>
        <Link to="/dashboard" className="text-xs text-cyan-400 font-mono mt-4 inline-block">
          &larr; Back to Dashboard
        </Link>
      </LevitatingCard>
    </div>
  );
}

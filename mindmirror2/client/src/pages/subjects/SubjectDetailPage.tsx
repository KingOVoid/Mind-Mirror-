import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { LevitatingCard } from '../../components/LevitatingCard';
import { ArrowLeft } from 'lucide-react';

export default function SubjectDetailPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <Link to="/subjects" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Subjects
      </Link>
      <LevitatingCard className="p-6">
        <h2 className="text-xl font-bold text-white font-display">Subject Detail: {id}</h2>
        <p className="text-xs text-slate-400 font-mono mt-2">Module syllabus and active recall metrics.</p>
      </LevitatingCard>
    </div>
  );
}

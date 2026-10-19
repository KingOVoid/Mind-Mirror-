import React from 'react';
import { LevitatingCard } from '../../components/LevitatingCard';
import { BookOpen, Layers } from 'lucide-react';

export default function SubjectsPage() {
  const subjects = [
    { name: 'Control Systems Engineering', topics: 14, icon: 'Cpu' },
    { name: 'Finite Element Analysis (FEA)', topics: 12, icon: 'Layers' },
    { name: 'Digital Signal Processing', topics: 16, icon: 'Activity' },
    { name: 'Applied Thermodynamics', topics: 11, icon: 'Flame' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Coursework & Subjects</h2>
        <p className="text-xs text-slate-400 font-mono mt-1">Enrolled engineering domains and active module progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((sub, i) => (
          <LevitatingCard key={i} amplitude={4} duration={4000 + i * 500} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{sub.name}</h3>
                <span className="text-xs text-slate-400 font-mono">{sub.topics} Modules Active</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
          </LevitatingCard>
        ))}
      </div>
    </div>
  );
}

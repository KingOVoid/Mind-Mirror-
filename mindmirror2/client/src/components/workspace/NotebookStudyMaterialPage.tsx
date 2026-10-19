import React from 'react';
import type { StudySubject } from '../../data/subjectsData';
import { PomodoroWidget } from './PomodoroWidget';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  ListTree,
  Calendar,
  Clock,
  Compass,
  Edit3,
} from 'lucide-react';

interface NotebookStudyMaterialPageProps {
  subjects: StudySubject[];
  activeSubject: StudySubject;
  onSelectSubject: (id: string) => void;
  onTurnPage: (page: 1 | 2 | 3 | 4) => void;
  appendedNotes?: string;
}

export const NotebookStudyMaterialPage: React.FC<NotebookStudyMaterialPageProps> = ({
  subjects,
  activeSubject,
  onSelectSubject,
  onTurnPage,
  appendedNotes,
}) => {
  return (
    <div className="space-y-6">
      {/* ── Page Header: Subject Switcher & Chapter Title ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E6E1D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB] font-semibold">
              CHAPTER I • STUDY MATERIAL
            </span>
            <span className="text-xs font-mono text-[#6D736E]">{activeSubject.code}</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-[#242725] mt-1">
            {activeSubject.title}
          </h1>
        </div>

        {/* Quick Subject Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {subjects.map((s) => {
            const isSelected = s.id === activeSubject.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSubject(s.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[#5B8266] text-white border-[#4A6D54] shadow-xs'
                    : 'bg-white hover:bg-[#F2ECE4] text-[#4F5450] border-[#E6E1D8]'
                }`}
              >
                {s.code}: {s.tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Top Dual Panel: Course Overview + Built-in Pomodoro Timer ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 cols: Synopsis & Learning Objectives */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E1D8] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5B8266] uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Core Subject Synopsis</span>
            </div>
            <p className="text-sm leading-relaxed text-[#373C38]">
              {activeSubject.overview}
            </p>

            <div className="pt-2 border-t border-[#F2ECE4] flex items-center justify-between text-xs text-[#6D736E]">
              <span>Subject Progress:</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 rounded-full bg-[#EFEBE3] overflow-hidden">
                  <div
                    className="h-full bg-[#5B8266] rounded-full transition-all"
                    style={{ width: `${activeSubject.progress}%` }}
                  />
                </div>
                <span className="font-semibold text-[#242725] font-mono">
                  {activeSubject.progress}%
                </span>
              </div>
            </div>
          </div>

          {/* Theoretical Foundations Notebook Card */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E1D8] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5B8266] uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Fundamental Theoretical Axioms</span>
            </div>
            <div className="text-xs leading-relaxed text-[#373C38] whitespace-pre-wrap font-sans">
              {activeSubject.readingNotes}
            </div>
          </div>

          {/* Real-time Appended Student Notes from Page 4 Note-Taking */}
          {appendedNotes && appendedNotes.trim() && (
            <div className="p-5 rounded-2xl bg-[#FEF9C3]/70 border-2 border-[#FDE047] shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#854D0E] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
                  <span>Live Appended Notes (from Page 4: Note Taking)</span>
                </div>
                <button
                  type="button"
                  onClick={() => onTurnPage(4)}
                  className="text-[11px] font-mono font-semibold text-[#854D0E] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Edit in Note Taking (p. 4)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="text-xs leading-relaxed text-[#422006] whitespace-pre-wrap font-mono p-3 rounded-xl bg-white/80 border border-[#FEF08A] shadow-inner">
                {appendedNotes}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 cols: Built-In Physical Pomodoro Timer Widget */}
        <div className="lg:col-span-5 space-y-4">
          <PomodoroWidget />

          {/* Quick Study Navigation Callout */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E1D8] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#242725]">
              <Layers className="w-4 h-4 text-[#5B8266]" />
              <span>Physical Notebook Sections</span>
            </div>
            <p className="text-xs text-[#6D736E] leading-relaxed">
              Study the concepts above, flip to Page 2 for derivations, Page 3 for Nexus AI, or Page 4 to record active notes.
            </p>

            <div className="pt-1 flex flex-col gap-1.5">
              <button
                onClick={() => onTurnPage(2)}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#E6E1D8] text-xs font-medium text-[#242725] flex items-center justify-between transition cursor-pointer shadow-2xs"
              >
                <span>Turn to Page 2: Explanations</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5B8266]" />
              </button>
              <button
                onClick={() => onTurnPage(3)}
                className="w-full py-2 px-3 rounded-xl bg-[#EDF3EE] hover:bg-[#DCE7DD] border border-[#C8D7CB] text-xs font-medium text-[#43634D] flex items-center justify-between transition cursor-pointer shadow-2xs"
              >
                <span>Turn to Page 3: Nexus AI Assistance</span>
                <Sparkles className="w-3.5 h-3.5 text-[#5B8266]" />
              </button>
              <button
                onClick={() => onTurnPage(4)}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#E6E1D8] text-xs font-medium text-[#242725] flex items-center justify-between transition cursor-pointer shadow-2xs"
              >
                <span>Turn to Page 4: Note Taking</span>
                <Edit3 className="w-3.5 h-3.5 text-[#5B8266]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4-Week Applied Mastery Roadmap ── */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E6E1D8] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#242725] uppercase tracking-wider">
            <ListTree className="w-4 h-4 text-[#5B8266]" />
            <span>4-Week Coursework Syllabus & Active Milestones</span>
          </div>
          <span className="text-xs text-[#6D736E]">8-10 Hours / Week Recommended</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              week: 'Week 1',
              title: 'Axioms & Coordinate Frames',
              concepts: ['System state definition', 'Energy balance', 'Boundary invariance'],
            },
            {
              week: 'Week 2',
              title: 'Governing Formulations',
              concepts: ['State-space evolution', 'Transfer functions', 'Pole placement'],
            },
            {
              week: 'Week 3',
              title: 'Numerical Discretization',
              concepts: ['Mesh convergence', 'Finite precision stability', 'Euler/RK4 methods'],
            },
            {
              week: 'Week 4',
              title: 'Applied Synthesis & Verification',
              concepts: ['Luenberger observer', 'Closed-loop margins', 'Design problem'],
            },
          ].map((w, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] space-y-2 hover:border-[#5B8266] transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#EDF3EE] text-[#43634D] font-bold">
                  {w.week}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5B8266]" />
              </div>
              <h4 className="text-xs font-bold text-[#242725]">{w.title}</h4>
              <ul className="space-y-1">
                {w.concepts.map((c, cidx) => (
                  <li key={cidx} className="text-[11px] text-[#6D736E] flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#5B8266]" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Page Footer: Next Page Flip Button ── */}
      <div className="pt-2 flex items-center justify-end">
        <button
          onClick={() => onTurnPage(2)}
          className="py-2.5 px-5 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
        >
          <span>Turn to Page 2: Explanations & Formulas</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

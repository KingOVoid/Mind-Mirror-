import React, { useState } from 'react';
import ReactMarkdown from '../SafeMarkdown';
import type { StudySubject, GoverningFormula } from '../../data/subjectsData';

import type { DocumentAnalysisResult } from '../../api/ai';
import {
  Sigma,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Save,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  Lightbulb,
  FileText,
  X,
} from 'lucide-react';

interface NotebookExplanationsPageProps {
  activeSubject: StudySubject;
  onTurnPage: (page: 1 | 2 | 3 | 4) => void;
  onTriggerNexus: (prompt: string) => void;
  savedNotes: string;
  onUpdateNotes: (text: string) => void;
  documentSummary?: DocumentAnalysisResult | null;
}


export const NotebookExplanationsPage: React.FC<NotebookExplanationsPageProps> = ({
  activeSubject,
  onTurnPage,
  onTriggerNexus,
  savedNotes,
  onUpdateNotes,
  documentSummary: propSummary,
}) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Read from prop or fallback to localStorage
  const documentSummary = propSummary || (() => {
    try {
      const saved = localStorage.getItem('mm_document_summary');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  })();


  const handleCopy = (latex: string, idx: number) => {
    navigator.clipboard.writeText(latex);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSaveNotes = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2200);
  };

  const wordCount = savedNotes.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E1D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB] font-semibold">
              CHAPTER II • EXPLANATIONS & DERIVATIONS
            </span>
            <span className="text-xs font-mono text-[#6D736E]">{activeSubject.code}</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-[#242725] mt-1">
            Governing Formulations & Analytical Proofs
          </h1>
        </div>

        {/* Top Page Flip Shortcut */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTurnPage(1)}
            className="py-1.5 px-3 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#E6E1D8] text-xs font-medium text-[#242725] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#6D736E]" />
            <span>Page 1: Material</span>
          </button>
          <button
            onClick={() => onTurnPage(3)}
            className="py-1.5 px-3 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <span>Page 3: Nexus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Auto-Populated Document Study Summary from Nexus ── */}
      {documentSummary ? (
        <div className="p-4 rounded-2xl bg-white border-2 border-[#5B8266]/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D8]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#5B8266]" />
                <span>NEXUS AI SYNTHESIS</span>
              </span>
              <span className="text-xs font-mono font-medium text-[#242725]">{documentSummary.fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/5 text-[#6D736E]">
                {documentSummary.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Curriculum Engine'}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(documentSummary.summary);
                }}
                className="p-1 rounded bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E6E1D8] text-[#6D736E] text-xs cursor-pointer transition"
                title="Copy Summary"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto pr-1">
            <ReactMarkdown
              className="prose prose-slate max-w-none text-xs leading-relaxed text-[#373C38]"
              content={documentSummary?.summary || ''}
            >
              {documentSummary?.summary || ''}
            </ReactMarkdown>
          </div>


          {documentSummary.keyTakeaways && documentSummary.keyTakeaways.length > 0 && (
            <div className="pt-2 border-t border-[#E6E1D8] space-y-1.5">
              <span className="text-[11px] font-bold font-mono text-[#43634D] uppercase tracking-wider">
                Core High-Yield Takeaways
              </span>
              <ul className="space-y-1">
                {documentSummary.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="text-[11px] text-[#525853] flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5B8266] shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      {/* ── Governing Mathematical Formulations ── */}
      <div className="space-y-4">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#242725]">
            <Sigma className="w-4 h-4 text-[#5B8266]" />
            <span>Mathematical Axioms & Invariant Formulations</span>
          </div>
          <span className="text-xs text-[#6D736E]">
            {activeSubject.governingFormulas.length} primary formulations
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {activeSubject.governingFormulas.map((formula, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E1D8] shadow-xs space-y-3 hover:border-[#5B8266] transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#242725]">{formula.name}</h3>
                  <span className="text-[11px] text-[#6D736E] font-medium">
                    First-Principles System Equilibrium
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(formula.latex, idx)}
                    className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E6E1D8] text-[#6D736E] transition cursor-pointer"
                    title="Copy LaTeX string"
                  >
                    {copiedIdx === idx ? (
                      <Check className="w-3.5 h-3.5 text-[#5B8266]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onTriggerNexus(
                        `Explain and derive "${formula.name}" (${formula.latex}) from first principles. State every physical assumption and boundary condition.`
                      );
                      onTurnPage(3);
                    }}
                    className="py-1 px-3 rounded-lg bg-[#EDF3EE] hover:bg-[#DCE7DD] text-[#43634D] border border-[#C8D7CB] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#5B8266]" />
                    <span>Derive in Nexus</span>
                  </button>
                </div>
              </div>

              {/* Mathematical Equation Display Box */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] font-mono text-xs sm:text-sm text-[#242725] overflow-x-auto shadow-inner">
                <code>{formula.latex}</code>
              </div>

              <p className="text-xs leading-relaxed text-[#525853]">
                {formula.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Student Personal Scratchpad & Derivations Notebook ── */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E6E1D8] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE3]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#242725] uppercase tracking-wider">
            <Edit3 className="w-4 h-4 text-[#5B8266]" />
            <span>Student Derivations & Analytical Notes</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6D736E] font-mono">{wordCount} words</span>
            <button
              onClick={handleSaveNotes}
              className="py-1.5 px-3.5 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved to Notebook' : 'Save Derivations'}</span>
            </button>
          </div>
        </div>

        <textarea
          value={savedNotes}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="Write down your first-principles steps, proof attempts, boundary checks, or questions..."
          className="w-full min-h-[220px] p-4 text-xs font-mono leading-relaxed rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-[#242725] placeholder-[#8F9690] outline-none focus:border-[#5B8266] focus:bg-white transition resize-none shadow-inner"
        />

        <div className="p-3.5 rounded-xl bg-[#EDF3EE] border border-[#C8D7CB] flex items-center justify-between gap-3 text-xs text-[#43634D]">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 shrink-0 text-[#5B8266]" />
            <span>Stuck on a tricky proof or equation? Let Nexus AI break it down step-by-step.</span>
          </div>
          <button
            onClick={() => {
              onTriggerNexus(
                `Here are my current student derivation notes for ${activeSubject.title}:\n\n"${savedNotes.slice(0, 600)}"\n\nPlease review my steps, verify the mathematical consistency, and suggest first-principles refinements.`
              );
              onTurnPage(3);
            }}
            className="py-1.5 px-3 rounded-lg bg-white hover:bg-[#FAF8F5] text-[#242725] font-semibold text-xs border border-[#C8D7CB] transition cursor-pointer whitespace-nowrap shadow-2xs"
          >
            Review Notes with Nexus →
          </button>
        </div>
      </div>

      {/* ── Page Footer: Dual Navigation Buttons ── */}
      <div className="pt-2 flex items-center justify-between">
        <button
          onClick={() => onTurnPage(1)}
          className="py-2.5 px-5 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#E6E1D8] text-[#242725] text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Turn to Page 1: Study Material</span>
        </button>

        <button
          onClick={() => onTurnPage(3)}
          className="py-2.5 px-5 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
        >
          <span>Turn to Page 3: Nexus AI Assistance</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

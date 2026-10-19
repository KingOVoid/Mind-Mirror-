import React from 'react';
import type { StudySubject } from '../../data/subjectsData';
import {
  FileText,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Clock,
  Send,
  Layers,
} from 'lucide-react';

interface NotebookNoteTakingPageProps {
  activeSubject: StudySubject;
  studyTopic: string;
  notesText: string;
  onNotesChange: (text: string) => void;
  onTurnPage: (page: 1 | 2 | 3 | 4) => void;
  onSendToNexus: (prompt: string) => void;
}

export const NotebookNoteTakingPage: React.FC<NotebookNoteTakingPageProps> = ({
  activeSubject,
  studyTopic,
  notesText,
  onNotesChange,
  onTurnPage,
  onSendToNexus,
}) => {
  const wordCount = notesText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = notesText.length;

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB] font-bold">
              CHAPTER IV • NOTE TAKING & LIVE SYNC
            </span>
            <span className="text-xs font-mono text-[#6D736E]">{activeSubject.code}</span>
          </div>
          <h2 className="text-xl font-bold font-display text-[#242725] mt-0.5 flex items-center gap-2">
            <span>Freeform Field Journal</span>
            <span className="w-2 h-2 rounded-full bg-[#5B8266] animate-pulse" title="Live Synced" />
          </h2>
        </div>

        {/* Quick Flip Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTurnPage(1)}
            className="py-1 px-2.5 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#E6E1D8] text-xs font-medium text-[#242725] flex items-center gap-1 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#6D736E]" />
            <span>p. 1 Material</span>
          </button>
          <button
            onClick={() => onTurnPage(3)}
            className="py-1 px-2.5 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs"
          >
            <span>p. 3 Nexus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Real-Time Sync Status Notice ── */}
      <div className="p-3 rounded-xl bg-[#EDF3EE] border border-[#C8D7CB] flex flex-wrap items-center justify-between gap-2 text-xs text-[#43634D]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5B8266] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5B8266]" />
          </span>
          <span className="font-semibold text-[#242725]">Dynamic State Sync Active:</span>
          <span className="text-[#525853]">
            Anything typed here instantly appends into <span className="font-bold text-[#43634D]">Page 1 (Study Material)</span> for Nexus analysis.
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-[#6D736E]">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* ── Skeuomorphic Ruled Paper Textarea ── */}
      <div className="flex-1 relative rounded-2xl border-2 border-[#D9D2C5] bg-[#FAF8F5] overflow-hidden shadow-inner flex flex-col">
        {/* Red Margin Line on the left */}
        <div className="absolute top-0 bottom-0 left-10 w-[2px] bg-[#F87171]/40 pointer-events-none z-10" />

        <textarea
          value={notesText}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={`Begin recording your observations, derivations, or synthesis for "${studyTopic}"...\n\nEvery paragraph here dynamically updates the Study Material page and informs Nexus AI during conceptual reviews.`}
          className="w-full flex-1 p-4 pl-14 text-xs font-mono text-[#242725] placeholder-[#9CA3AF] bg-transparent outline-none resize-none leading-[28px]"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #E5E7EB 27px, #E5E7EB 28px)',
            backgroundAttachment: 'local',
            minHeight: '360px',
          }}
        />

        {/* Editor Bottom Status Bar */}
        <div className="p-3 border-t border-[#E6E1D8] bg-[#F7F4EC] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#6D736E] text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#5B8266]" />
            <span>Auto-saved to active session • Topic: <span className="font-semibold text-[#242725]">{studyTopic}</span></span>
          </div>

          <div className="flex items-center gap-2">
            {notesText.trim() && (
              <button
                type="button"
                onClick={() => onNotesChange('')}
                className="py-1 px-2 rounded-lg hover:bg-[#F2ECE4] text-[#991B1B] text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                title="Clear current notes"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onSendToNexus(
                  `Here are my live student notes taken for "${studyTopic}":\n\n"${notesText.slice(0, 800)}"\n\nPlease review these notes, verify physical consistency, and provide 2 constructive analytical extensions.`
                );
                onTurnPage(3);
              }}
              disabled={!notesText.trim()}
              className="py-1.5 px-3 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review with Nexus (p. 3)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

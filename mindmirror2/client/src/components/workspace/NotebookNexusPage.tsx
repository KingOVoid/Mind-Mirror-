import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from '../SafeMarkdown';
import type { StudySubject } from '../../data/subjectsData';

import { apiClient } from '../../api/client';
import { aiApi } from '../../api/ai';
import {
  Send,
  BookOpen,
  HelpCircle,
  Sigma,
  RefreshCw,
  Copy,
  Check,
  Feather,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface NotebookNexusPageProps {
  activeSubject: StudySubject;
  savedNotes: string;
  onTurnPage: (page: 1 | 2 | 3 | 4) => void;
  externalTriggerPrompt?: string | null;
  onClearTriggerPrompt?: () => void;
  appendedNotes?: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  tag?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'ai',
    text: "Welcome to Chapter III: Nexus AI Assistance. I am your first-principles engineering mentor. You can ask me to summarize your active study material, test your conceptual comprehension with an active-recall quiz, or derive complex governing equations step-by-step.",
    timestamp: 'Just now',
    tag: 'Greeting',
  },
];

export const NotebookNexusPage: React.FC<NotebookNexusPageProps> = ({
  activeSubject,
  savedNotes,
  onTurnPage,
  externalTriggerPrompt,
  onClearTriggerPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle external trigger prompts arriving from Page 1 or Page 2
  useEffect(() => {
    if (externalTriggerPrompt) {
      handleSend(externalTriggerPrompt);
      if (onClearTriggerPrompt) {
        onClearTriggerPrompt();
      }
    }
  }, [externalTriggerPrompt]);

  const handleSend = async (textToSend?: string, tag?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tag,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const enrichedContext = `Subject: ${activeSubject.title} (${activeSubject.code})\nOverview: ${activeSubject.overview}\nCurriculum Notes: ${activeSubject.readingNotes.slice(0, 1000)}\nStudent Notes: ${(savedNotes || '').slice(0, 500)}`;

      const res = await aiApi.copilotChat({
        message: query.trim(),
        context: enrichedContext,
      });

      const replyText =
        res.reply ||
        res.explanation ||
        res.overview ||
        `**Analysis on "${query}"**:\n\n1. Foundational principle: Focus on the core objective within ${activeSubject.title}.\n2. Formal logic: Deconstruct requirements and verify edge conditions.\n3. Takeaway: Synthesize takeaways for engineering mastery.`;

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tag: 'Nexus AI',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Nexus AI invocation error:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `### Nexus AI Analysis (${activeSubject.code}): ${query}\n\n- **Topic Focus**: ${activeSubject.title}\n- **Core Foundation**: In accordance with the ${activeSubject.code} baseline syllabus, review the fundamental definitions, task environment constraints, and formal representations.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tag: 'Curriculum Engine',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 flex flex-col h-full min-h-[720px]">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E1D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB] font-semibold">
              CHAPTER III • NEXUS AI ASSISTANCE
            </span>
            <span className="text-xs font-mono text-[#6D736E]">{activeSubject.code}</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-[#242725] mt-1 flex items-center gap-2">
            <span>Conversational Engineering Tutor</span>
            <span className="w-2 h-2 rounded-full bg-[#5B8266] animate-pulse" />
          </h1>
        </div>

        {/* Quick Flip Back Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTurnPage(1)}
            className="py-1.5 px-3 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#E6E1D8] text-xs font-medium text-[#242725] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#6D736E]" />
            <span>Page 1: Material</span>
          </button>
          <button
            onClick={() => onTurnPage(2)}
            className="py-1.5 px-3 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#E6E1D8] text-xs font-medium text-[#242725] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#6D736E]" />
            <span>Page 2: Explanations</span>
          </button>
          <button
            onClick={() => onTurnPage(4)}
            className="py-1.5 px-3 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#E6E1D8] text-xs font-medium text-[#242725] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <span>Page 4: Note Taking</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#6D736E]" />
          </button>
        </div>
      </div>

      {/* ── Instant Action Triggers Bar ── */}
      <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E6E1D8] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#525853]">
          <Feather className="w-4 h-4 text-[#5B8266]" />
          <span className="font-semibold text-[#242725]">Active Context:</span>
          <span className="font-mono text-[#5B8266]">{activeSubject.title}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() =>
              handleSend(
                `Synthesize the study notes for ${activeSubject.title} into 3 first-principles axioms and 2 high-yield exam takeaways:\n\n${activeSubject.readingNotes.slice(0, 600)}`,
                'Summarize'
              )
            }
            disabled={loading}
            className="py-1.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EDF3EE] border border-[#E6E1D8] text-xs font-medium text-[#242725] flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#5B8266]" />
            <span>Summarize Material</span>
          </button>

          <button
            onClick={() =>
              handleSend(
                `Generate 3 active-recall conceptual quiz questions for "${activeSubject.title}". Ask each question clearly and prompt me to explain the physical intuition before revealing the solution.`,
                'Quiz'
              )
            }
            disabled={loading}
            className="py-1.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EDF3EE] border border-[#E6E1D8] text-xs font-medium text-[#242725] flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#B86B43]" />
            <span>Active-Recall Quiz</span>
          </button>

          <button
            onClick={() => {
              const primaryFormula = activeSubject.governingFormulas[0];
              handleSend(
                `Derive the governing formulation "${primaryFormula?.name || activeSubject.title}" (${primaryFormula?.latex || ''}) from first principles. Explain the boundary constraints.`,
                'Derivation'
              )
            }}
            disabled={loading}
            className="py-1.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EDF3EE] border border-[#E6E1D8] text-xs font-medium text-[#242725] flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Sigma className="w-3.5 h-3.5 text-[#5B8266]" />
            <span>Derive Formula</span>
          </button>

          <button
            onClick={() => setMessages(INITIAL_MESSAGES)}
            className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E6E1D8] text-[#6D736E] transition cursor-pointer"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Conversational Notebook Stream (Scrollable) ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[380px] p-4 rounded-2xl bg-[#FFFFFF] border border-[#E6E1D8] shadow-xs select-text"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-[#6D736E] mb-1 px-1">
              <span className="font-semibold text-[#242725]">
                {m.sender === 'user' ? 'You' : 'Nexus AI Tutor'}
              </span>
              <span>•</span>
              <span>{m.timestamp}</span>
              {m.tag && (
                <span className="px-1.5 py-0.2 rounded bg-[#EDF3EE] text-[#43634D] font-mono text-[9px]">
                  {m.tag}
                </span>
              )}
            </div>

            <div
              className={`relative group rounded-2xl p-4 text-xs sm:text-sm leading-relaxed max-w-[90%] transition shadow-xs ${
                m.sender === 'user'
                  ? 'bg-[#5B8266] text-white font-medium'
                  : 'bg-[#FAF8F5] border border-[#E6E1D8] text-[#242725]'
              }`}
            >
              {m.sender === 'user' ? (
                <div className="whitespace-pre-wrap font-sans">{m.text}</div>
              ) : (
                <ReactMarkdown
                  className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-[#242725]"
                  content={m?.text || ''}
                >
                  {m?.text || ''}
                </ReactMarkdown>
              )}


              {m.sender === 'ai' && (
                <button
                  onClick={() => copyToClipboard(m.text, m.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#6D736E] hover:text-[#242725] transition cursor-pointer shadow-2xs"
                  title="Copy explanation"
                >
                  {copiedId === m.id ? (
                    <Check className="w-3.5 h-3.5 text-[#5B8266]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E1D8] text-xs text-[#5B8266] flex items-center gap-2.5 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5B8266] animate-pulse" />
              <span>Nexus is contemplating first-principles derivation...</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Chat Prompt Form ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Nexus about ${activeSubject.title}, derivations, or request a custom breakdown...`}
          className="flex-1 py-3 px-4 text-xs rounded-xl bg-white border border-[#E6E1D8] text-[#242725] placeholder-[#8F9690] outline-none focus:border-[#5B8266] transition shadow-xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="py-3 px-5 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask Nexus</span>
        </button>
      </form>
    </div>
  );
};

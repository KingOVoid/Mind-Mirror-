import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Square,
  Plus,
  Pin,
  ChevronDown,
  ChevronUp,
  Trash2,
  GripHorizontal,
  X,
  ListTodo,
} from 'lucide-react';

interface StickyTask {
  id: string;
  text: string;
  done: boolean;
}

const DEFAULT_TASKS: StickyTask[] = [
  { id: 't1', text: 'Derive Ackermann pole formula', done: true },
  { id: 't2', text: 'Review Page 2 FEA weak form', done: false },
  { id: 't3', text: 'Quiz with Nexus on state-space', done: false },
];

export const StickyNoteTasks: React.FC = () => {
  const [tasks, setTasks] = useState<StickyTask[]>(() => {
    try {
      const stored = localStorage.getItem('mm_sticky_tasks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_TASKS;
  });
  const [newText, setNewText] = useState<string>('');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isMobileOverlayOpen, setIsMobileOverlayOpen] = useState<boolean>(false);

  // Persist tasks to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('mm_sticky_tasks', JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, done: !t.done };
        }
        return t;
      })
    );
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const item: StickyTask = {
      id: `task_${Date.now()}`,
      text: newText.trim(),
      done: false,
    };
    setTasks((prev) => [...prev, item]);
    setNewText('');
  };

  const removeTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <>
      {/* ── MOBILE: FLOATING ACTION BUTTON (FAB) & OVERLAY (HIDDEN ON DESKTOP) ── */}
      <div className="block md:hidden">
        {/* Floating Action Button (FAB) in bottom-right corner */}
        <button
          type="button"
          onClick={() => setIsMobileOverlayOpen(true)}
          className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-2xl bg-[#FEF08A] hover:bg-[#FDE047] active:scale-95 border-2 border-[#EAB308] text-[#713F12] shadow-xl flex items-center justify-center transition-all cursor-pointer group"
          title="Open Study Tasks"
          aria-label="Open Study Tasks"
        >
          <Pin className="w-5 h-5 text-[#B45309] -rotate-45" />
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-[#CA8A04] text-white text-[9px] font-mono font-bold shadow-xs border border-white">
            {completedCount}/{tasks.length}
          </span>
        </button>

        {/* Mobile Full-Screen Task Overlay */}
        {isMobileOverlayOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsMobileOverlayOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[#FEF08A] text-[#422006] p-5 font-sans relative shadow-2xl border-2 border-[#EAB308] max-h-[85vh] flex flex-col overflow-hidden"
              style={{
                backgroundImage: `
                  linear-gradient(to bottom, rgba(253, 224, 71, 0.45) 0px, rgba(253, 224, 71, 0.45) 28px, transparent 28px),
                  radial-gradient(#EAB308 0.5px, transparent 0.5px)
                `,
                backgroundSize: '100% 100%, 16px 16px',
              }}
            >
              {/* Overlay Header with Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EAB308]/40 mb-3">
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-[#B45309] -rotate-45" />
                  <h3 className="text-sm font-bold tracking-tight text-[#713F12]">
                    DAILY STUDY TASKS
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FDE047] border border-[#EAB308] text-[#854D0E] font-bold">
                    {completedCount}/{tasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOverlayOpen(false)}
                  className="p-1 rounded-lg bg-[#FDE047] hover:bg-[#EAB308]/60 text-[#713F12] transition cursor-pointer"
                  title="Close Tasks Overlay"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Task Items Scrollable Container */}
              <div className="flex-1 space-y-2 overflow-y-auto pr-1 min-h-[160px]">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-white/40 hover:bg-white/70 text-xs transition cursor-pointer"
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-[#854D0E] hover:text-[#713F12] transition shrink-0"
                    >
                      {t.done ? (
                        <CheckSquare className="w-4 h-4 text-[#15803D]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <span
                      className={`flex-1 leading-snug break-words font-medium ${
                        t.done
                          ? 'line-through text-[#854D0E]/60 italic'
                          : 'text-[#422006]'
                      }`}
                    >
                      {t.text}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => removeTask(t.id, e)}
                      className="p-1 hover:text-[#B91C1C] text-[#854D0E] transition shrink-0"
                      title="Remove task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <p className="text-xs text-[#854D0E] italic py-6 text-center">
                    No active study tasks. Add a task below!
                  </p>
                )}
              </div>

              {/* Add Task Input Form */}
              <form onSubmit={addTask} className="pt-3 border-t border-[#EAB308]/40 flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Add study task..."
                  className="flex-1 py-2 px-3 text-xs rounded-xl bg-[#FEF9C3] border border-[#EAB308]/60 text-[#422006] placeholder-[#A16207]/60 outline-none focus:border-[#854D0E] font-medium"
                />
                <button
                  type="submit"
                  disabled={!newText.trim()}
                  className="py-2 px-3.5 rounded-xl bg-[#CA8A04] hover:bg-[#A16207] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP: FREELY DRAGGABLE STICKY NOTE (ONLY ON md:) ── */}
      <div className="hidden md:block">
        <motion.div
          key="persistent-floating-sticky-notes"
          drag
          dragMomentum={false}
          dragElastic={0.08}
          whileDrag={{ scale: 1.03, rotate: -1, zIndex: 60 }}
          initial={{ x: 0, y: 0 }}
          style={{
            position: 'fixed',
            top: '90px',
            right: '28px',
            zIndex: 50,
          }}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          {/* ── THE PHYSICAL YELLOW POST-IT NOTE ── */}
          <div
            className="w-72 rounded-sm bg-[#FEF08A] text-[#422006] p-4 font-sans relative overflow-hidden transition-all"
            style={{
              transform: 'rotate(-2deg)',
              boxShadow:
                '0 16px 36px -6px rgba(45, 30, 5, 0.28), 0 6px 14px -3px rgba(45, 30, 5, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -3px 6px rgba(0, 0, 0, 0.04)',
              backgroundImage: `
                linear-gradient(to bottom, rgba(253, 224, 71, 0.45) 0px, rgba(253, 224, 71, 0.45) 28px, transparent 28px),
                radial-gradient(#EAB308 0.5px, transparent 0.5px)
              `,
              backgroundSize: '100% 100%, 16px 16px',
            }}
          >
            {/* Top Adhesive Strip & Realistic Pin */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-[#FDE047]/80 border-b border-[#EAB308]/30 flex items-center justify-between px-3">
              <div className="flex items-center gap-1 opacity-70">
                <GripHorizontal className="w-3.5 h-3.5 text-[#854D0E]" />
                <span className="text-[9px] font-mono tracking-wider uppercase text-[#854D0E] font-bold">
                  Post-it® • Drag Anywhere
                </span>
              </div>

              {/* Red Plastic Pushpin */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#EF4444] border-2 border-[#B91C1C] shadow-[0_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white/80" />
              </div>
            </div>

            {/* Sticky Note Header */}
            <div className="flex items-center justify-between pt-4 pb-2 border-b border-[#EAB308]/30 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-[#713F12]">
                <Pin className="w-3.5 h-3.5 text-[#B45309] -rotate-45" />
                <span>DAILY STUDY TASKS</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#FDE047] border border-[#EAB308] text-[#854D0E] ml-1">
                  {completedCount}/{tasks.length}
                </span>
              </div>

              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded hover:bg-[#FDE047] text-[#854D0E] transition cursor-pointer"
                title={isMinimized ? 'Expand Sticky Note' : 'Minimize Sticky Note'}
              >
                {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Task List (When expanded) */}
            {!isMinimized && (
              <div className="space-y-3" onPointerDown={(e) => e.stopPropagation()}>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className="group flex items-start gap-2 p-1.5 rounded hover:bg-[#FDE047]/40 text-xs transition cursor-pointer"
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-[#854D0E] hover:text-[#713F12] transition shrink-0"
                      >
                        {t.done ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#15803D]" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <span
                        className={`flex-1 leading-snug break-words font-medium ${
                          t.done
                            ? 'line-through text-[#854D0E]/60 italic'
                            : 'text-[#422006]'
                        }`}
                      >
                        {t.text}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => removeTask(t.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-[#B91C1C] text-[#854D0E] transition shrink-0"
                        title="Remove task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {tasks.length === 0 && (
                    <p className="text-[11px] text-[#854D0E] italic py-2 text-center">
                      No active study tasks. Add one below!
                    </p>
                  )}
                </div>

                {/* Add Task Input Form */}
                <form onSubmit={addTask} className="pt-2 border-t border-[#EAB308]/30 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Add study goal..."
                    className="flex-1 py-1 px-2 text-xs rounded bg-[#FEF9C3] border border-[#EAB308]/50 text-[#422006] placeholder-[#A16207]/60 outline-none focus:border-[#854D0E] font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!newText.trim()}
                    className="p-1.5 rounded bg-[#CA8A04] hover:bg-[#A16207] disabled:opacity-40 text-white transition cursor-pointer shadow-2xs"
                    title="Add task"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Subtle curled corner fold on the bottom-right */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.18) 100%)',
              }}
            />
          </div>
        </motion.div>
      </div>
    </>
  );
};

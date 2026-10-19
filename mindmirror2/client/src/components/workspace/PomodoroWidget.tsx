import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

const MODE_DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroWidget: React.FC = () => {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.work);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 harmonic
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch {}

      if (mode === 'work') {
        setSessionsCompleted((c) => c + 1);
        setMode('shortBreak');
        setTimeLeft(MODE_DURATIONS.shortBreak);
      } else {
        setMode('work');
        setTimeLeft(MODE_DURATIONS.work);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const switchMode = (newMode: PomodoroMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalDuration = MODE_DURATIONS[mode];
  const progressPct = Math.min(100, Math.round(((totalDuration - timeLeft) / totalDuration) * 100));

  return (
    <div className="zen-glass rounded-2xl p-4 space-y-3 border border-white/50 shadow-sm text-[#242725]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#242725]">
          <Clock className="w-3.5 h-3.5 text-[#5B8266]" />
          <span>Zen Focus Timer</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/60 text-[#43634D] border border-white/70">
          {sessionsCompleted} completed
        </span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/40 border border-white/50">
        <button
          onClick={() => switchMode('work')}
          className={`py-1 text-[11px] font-medium rounded-lg transition cursor-pointer ${
            mode === 'work'
              ? 'bg-white text-[#242725] shadow-xs font-semibold'
              : 'text-[#6D736E] hover:text-[#242725]'
          }`}
        >
          25m Focus
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`py-1 text-[11px] font-medium rounded-lg transition cursor-pointer ${
            mode === 'shortBreak'
              ? 'bg-white text-[#242725] shadow-xs font-semibold'
              : 'text-[#6D736E] hover:text-[#242725]'
          }`}
        >
          5m Rest
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`py-1 text-[11px] font-medium rounded-lg transition cursor-pointer ${
            mode === 'longBreak'
              ? 'bg-white text-[#242725] shadow-xs font-semibold'
              : 'text-[#6D736E] hover:text-[#242725]'
          }`}
        >
          15m Rest
        </button>
      </div>

      {/* Clock Display & Progress */}
      <div className="py-1 text-center space-y-2">
        <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-[#242725]">
          {timeFormatted}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-white/50 overflow-hidden border border-white/40">
          <div
            className="h-full bg-[#5B8266] transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={toggleTimer}
          className={`flex-1 py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
            isActive
              ? 'bg-white/70 hover:bg-white text-[#373C38] border border-white/80'
              : 'bg-[#5B8266] hover:bg-[#4A6D54] text-white'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Start Focus Block</span>
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-2 rounded-xl bg-white/50 hover:bg-white text-[#6D736E] hover:text-[#242725] border border-white/60 transition cursor-pointer"
          title="Reset Timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

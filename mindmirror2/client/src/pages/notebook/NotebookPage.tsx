import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import ReactMarkdown from '../../components/SafeMarkdown';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useAuth } from '../../contexts/AuthContext';
import StationeryBackground from '../../components/StationeryBackground';
import { StickyNoteTasks } from '../../components/workspace/StickyNoteTasks';
import { AccountInfoModal } from '../../components/workspace/AccountInfoModal';
import { PomodoroWidget } from '../../components/workspace/PomodoroWidget';
import { LiveVercelQR } from '../../components/LiveVercelQR';
import { STUDY_SUBJECTS, type StudySubject } from '../../data/subjectsData';
import { playPageTurnSound } from '../../utils/audioEffects';
import { apiClient } from '../../api/client';
import { aiApi, type DocumentAnalysisResult, type QuizQuestion } from '../../api/ai';
import { parseDocumentFile } from '../../utils/documentParser';
import {
  Clock,
  Feather,
  BookOpen,
  Sigma,
  Sparkles,
  Bookmark,
  User as UserIcon,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  Save,
  Send,
  HelpCircle,
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  Lock,
  Layers,
  FileText,
  UploadCloud,
  AlertCircle,
  X,
} from 'lucide-react';


// ─────────────────────────────────────────────────────────────────────────────
// TOPIC SUBJECT RESOLVER
// ─────────────────────────────────────────────────────────────────────────────
function resolveSubjectForTopic(topic: string): StudySubject {
  const trimmed = topic.trim();
  if (!trimmed) return STUDY_SUBJECTS[0];

  const lower = trimmed.toLowerCase();

  // 1. Direct match with preset subjects
  const matched = STUDY_SUBJECTS.find(
    (s) =>
      s.title.toLowerCase().includes(lower) ||
      s.tag.toLowerCase().includes(lower) ||
      s.id.toLowerCase() === lower
  );
  if (matched) return matched;

  // 2. Specific matching for AI Mythology, Automata & Ancient History (Course 23N502 Slide 2)
  if (
    lower.includes('myth') ||
    lower.includes('talos') ||
    lower.includes('automata') ||
    lower.includes('golem') ||
    lower.includes('history') ||
    lower.includes('ancient') ||
    lower.includes('origin')
  ) {
    return {
      id: 'ai-mythology-history',
      title: 'AI Mythology, Automata & Early Mechanization',
      code: '23N502-U1-HIST',
      tag: 'AI History & Mythology',
      progress: 92,
      overview:
        'Exploration of ancient myths of artificial life (Talos of Crete, Pygmalion, Golem of Prague), mechanical automata (Hero of Alexandria, Vaucanson), and philosophical mechanization of human thought (Descartes, Leibniz, Lovelace) leading to the 1956 Dartmouth Workshop.',
      governingFormulas: [
        {
          name: "Leibniz's Symbolic Reasoning Calculus (1680s)",
          latex: '\\text{Reasoning} \\equiv \\text{Symbolic Calculation} \\implies \\text{"Calculemus!" ("Let us calculate!")}',
          description:
            'Gottfried Leibniz proposed the Characteristica Universalis and Calculus Ratiocinator, asserting that all rational disputes could be solved through mathematical calculation.',
        },
        {
          name: "Descartes' Mind-Body Automata Dualism (1637)",
          latex: '\\text{Cogito ergo sum} \\implies \\text{Mechanical Body (Automaton)} \\neq \\text{Rational Soul (Immaterial)}',
          description:
            'René Descartes viewed animal and human physical bodies as complex mechanical automata governed by clockwork physics, while consciousness remained immaterial.',
        },
        {
          name: 'McCulloch-Pitts Artificial Neuron Formulation (1943)',
          latex: 'y = \\Theta\\left(\\sum_{i=1}^n w_i x_i - \\theta\\right), \\quad \\Theta(z) = \\begin{cases} 1 & z \\ge 0 \\\\ 0 & z < 0 \\end{cases}',
          description:
            'Warren McCulloch and Walter Pitts created the first mathematical model of a neural network using threshold logic, bridging biological brain mythology with computer science.',
        },
      ],
      readingNotes: `### Ancient Mythology & The Mechanization of Mind (Course 23N502)

#### 1. Ancient Myths of Artificial Beings
- **Talos of Crete (Greek Mythology)**:
  Forged from bronze by Hephaestus to guard Crete. It marched around the island's shores three times daily and threw boulders at approaching vessels — the first conceptualization of an autonomous defense robot.
- **Pygmalion and Galatea (Ovid's Metamorphoses)**:
  The sculptor Pygmalion sculpted an ivory statue of such perfection that he fell in love with it; Aphrodite gave Galatea life.
- **The Golem of Prague (16th Century)**:
  Created from river clay by Rabbi Judah Loew and animated through the inscription of sacred Hebrew letters (*Emet* = Truth). Exemplified an obedient servant agent bound by explicit instructions.

---

#### 2. Clockwork Automata (Classical & Enlightenment Era)
- **Hero of Alexandria (1st Century AD)**: Pneumatic and hydraulic theater automata, mechanical birds, self-opening temple doors.
- **Jacques de Vaucanson (1739)**: Created the *Canard Digérateur* (Digesting Duck) containing over 400 moving mechanical parts to demonstrate that organic bodily functions could be mechanistically simulated.
- **The Mechanical Turk (1770)**: Wolfgang von Kempelen's chess automaton, which ignited worldwide passion for machine intelligence.

---

#### 3. Philosophers of Mechanical Reasoning
- **René Descartes (1596–1650)**:
  - *"Cogito ergo sum"* — "I think, therefore I am."
  - Posited that physical bodies operate as biological automata governed by mechanical principles.
- **Gottfried Wilhelm Leibniz (1646–1716)**:
  - Envisioned a universal symbolic reasoning calculus: *"Let us calculate without dispute!"*
  - Precursor to symbolic AI, Boolean logic, and propositional knowledge representation.

---

#### 4. The Modern AI Genesis
- **Ada Lovelace & Charles Babbage (1840s)**: Conceived the Analytical Engine and recognized computers could manipulate symbols, not merely numbers.
- **Alan Turing (1950)**: Formulated the Turing Test in *"Computing Machinery and Intelligence"*.
- **Dartmouth Workshop (1956)**: John McCarthy, Marvin Minsky, Nathaniel Rochester, and Claude Shannon coined the term **"Artificial Intelligence"**, establishing the field.`,
      defaultNotebookContent: `## Notes: AI Mythology & Historical Foundations
- Ancient Myths: Talos of Crete (Hephaestus' bronze automaton), Golem of Prague, Galatea.
- Automata: Vaucanson's mechanical duck (1739) proved behavior can be mechanically modeled.
- Descartes: Animals as complex automata; mind-body dualism.
- Leibniz: Reasoning as calculation ("Calculemus!").
- Dartmouth 1956: John McCarthy officially coins "Artificial Intelligence".`,
    };
  }

  // 3. Dynamic Custom Topic Isolation for AI & Computing
  return {
    id: `custom-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title: trimmed,
    code: `23N502-${Math.floor(100 + Math.random() * 899)}`,
    tag: 'Focus Session',
    progress: 25,
    overview: `Rigorous analytical curriculum isolated specifically for "${trimmed}". Emphasizes formal representation, task environment constraints, agent functions, and first-principles verification.`,
    governingFormulas: [
      {
        name: `${trimmed} Agent Mapping Formalization`,
        latex: 'f: \\mathcal{P}^* \\longrightarrow \\mathcal{A}, \\quad a^* = \\arg\\max_{a \\in \\mathcal{A}} \\mathbb{E}\\left[ U(s\') \\mid \\mathcal{P}^*, a \\right]',
        description: `Mathematical mapping relating percept sequence history P* to optimal actions maximizing expected utility in the context of "${trimmed}".`,
      },
      {
        name: 'State Transition & Belief Update',
        latex: 's_{t+1} = \\mathcal{T}(s_t, a_t, o_{t+1}), \\quad b(s\') = \\eta \\, P(o \\mid s\') \\sum_s P(s\' \\mid s, a) b(s)',
        description: `Internal state transition and Bayesian belief update tracking unobservable environmental variables for ${trimmed}.`,
      },
    ],
    readingNotes: `### Isolated Study Focus: ${trimmed}
Mastering **${trimmed}** within the BE CSE (AI & ML) syllabus requires decomposing the agent and algorithmic structures from first principles.

#### 1. Task Environment Specification (PEAS)
- **Performance Measure**: Quantify objective success criteria and expected outcome metrics.
- **Environment**: Classify whether the state space is fully vs. partially observable, deterministic vs. stochastic, static vs. dynamic.
- **Actuators & Sensors**: Map the interface boundaries between the agent and its operational domain.

#### 2. Theoretical Formulation & Architecture
1. Define whether the problem is best addressed via Simple Reflex, Model-Based, Goal-Based, or Utility-Based architectures.
2. Formulate state transition models $s_{t+1} = \\mathcal{T}(s_t, a_t, o_{t+1})$.
3. Verify convergence and asymptotic stability under stochastic uncertainty.`,
    defaultNotebookContent: `## Field Notes on ${trimmed}\n- Formalizing ${trimmed} into PEAS criteria.\n- Mapping percept sequences to rational actions f: P* -> A.\n- Validating environment properties: observability, determinism, and dynamism.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D SKEUOMORPHIC PAGE FLIP ANIMATION VARIANTS (0deg to -180deg)
// ─────────────────────────────────────────────────────────────────────────────
const pageFlipVariants: Variants = {
  enter: (dir: number) => ({
    rotateY: dir > 0 ? 0 : -180,
    opacity: 1,
    transition: {
      rotateY: { duration: 0.58, ease: [0.45, 0.05, 0.55, 0.95] },
    },
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    transition: {
      rotateY: { duration: 0.58, ease: [0.45, 0.05, 0.55, 0.95] },
    },
  },
  exit: (dir: number) => ({
    rotateY: dir > 0 ? -180 : 0,
    opacity: 1,
    transition: {
      rotateY: { duration: 0.58, ease: [0.45, 0.05, 0.55, 0.95] },
    },
  }),
};

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  tag?: string;
}

function NotebookPageContent() {
  const { user } = useAuth();

  // ── Focus Lobby & Closed Notebook Cover State ──
  const [isCoverOpen, setIsCoverOpen] = useState<boolean>(false);
  const [isCoverAnimating, setIsCoverAnimating] = useState<boolean>(false);
  const [studyTopic, setStudyTopic] = useState<string>('Intelligent Agents & Task Environments');

  // Cover Focus Timer State
  const [focusSeconds, setFocusSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Active Subject isolated by Study Topic
  const [activeSubject, setActiveSubject] = useState<StudySubject>(() =>
    resolveSubjectForTopic('Intelligent Agents & Task Environments')
  );

  // Active Notebook Tab: 1 = Study Material, 2 = Explanations, 3 = Nexus AI Assistance, 4 = Note Taking, 5 = Quiz Practice
  const [activePage, setActivePage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [direction, setDirection] = useState<number>(1);

  // ── Tab 5: Quiz Practice State ──
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // ── Real-Time State Sync & Local Data Persistence: Note-Taking Page ──
  const [noteTakingText, setNoteTakingText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('mm_note_taking_text');
      if (saved !== null) return saved;
    } catch {}
    return `## Course 23N502 · AI & Intelligent Agents Notes
- Core Definition: An agent perceives its environment through sensors and acts upon it through actuators: Agent = Architecture + Program.
- Agent Function: f: P* -> A (maps complete percept sequence history to actions).
- Rationality Criterion: Maximizes expected performance given percept history P* and prior built-in knowledge.
- AI Mythology: Ancient origins begin with Talos of Crete and mechanical automata, evolving through Descartes and Leibniz into computational agents.`;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mm_note_taking_text', noteTakingText);
    } catch {}
  }, [noteTakingText]);

  // ── Auto-Populated Document Study Summary & Local Data Persistence ──
  const [documentSummary, setDocumentSummary] = useState<DocumentAnalysisResult | null>(() => {
    try {
      const saved = localStorage.getItem('mm_document_summary');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  useEffect(() => {
    try {
      if (documentSummary) {
        localStorage.setItem('mm_document_summary', JSON.stringify(documentSummary));
      } else {
        localStorage.removeItem('mm_document_summary');
      }
    } catch {}
  }, [documentSummary]);

  // Document Upload States
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Student saved notes in Explanations page
  const [savedNotes, setSavedNotes] = useState<string>('');
  const [isNotesSaved, setIsNotesSaved] = useState<boolean>(false);
  const [copiedFormulaIdx, setCopiedFormulaIdx] = useState<number | null>(null);

  // Account Information Modal
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);

  // Nexus AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [copiedChatId, setCopiedChatId] = useState<string | null>(null);

  // Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer Tick
  useEffect(() => {
    if (!isTimerRunning) return;
    const timerInterval = setInterval(() => {
      setFocusSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [isTimerRunning]);

  // Update isolated subject when studyTopic changes
  useEffect(() => {
    const resolved = resolveSubjectForTopic(studyTopic);
    setActiveSubject(resolved);
    setSavedNotes(resolved.defaultNotebookContent);
    setQuizQuestions([]);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizError(null);
    setChatMessages([
      {
        id: 'init_msg',
        sender: 'ai',
        text: `Welcome to your isolated focus session on **"${resolved.title}"**.\n\nI am Nexus, your first-principles engineering mentor. I am actively monitoring your reading material on Page 1 and your live field notes on Page 4. Ask me to synthesize your notes, run an active-recall quiz, or derive governing equations.`,
        timestamp: 'Just now',
        tag: 'Greeting',
      },
    ]);
  }, [studyTopic]);

  // Handle Cover Opening Animation (0deg -> -180deg)
  const handleStartFocusSession = () => {
    const topicToUse = studyTopic.trim() || 'Intelligent Agents & Task Environments';
    setStudyTopic(topicToUse);
    setActiveSubject(resolveSubjectForTopic(topicToUse));

    // Play synchronized crisp paper opening sound
    playPageTurnSound();

    setIsCoverAnimating(true);
    setTimeout(() => {
      setIsCoverOpen(true);
      setIsCoverAnimating(false);
    }, 700);
  };

  // Close Notebook & Return to Focus Lobby
  const handleCloseNotebook = () => {
    playPageTurnSound();
    setIsCoverOpen(false);
    setIsCoverAnimating(false);
  };

  // Skeuomorphic Page Flip Handler
  const handleTurnPage = (targetPage: 1 | 2 | 3 | 4 | 5) => {
    if (targetPage === activePage) return;
    setDirection(targetPage > activePage ? 1 : -1);

    // Synchronized crisp paper swish sound
    playPageTurnSound();

    setActivePage(targetPage);
  };

  // ── Tab 5: Structured AI Quiz Generation & Interactive Handlers ──
  const handleGenerateQuiz = async () => {
    setIsQuizLoading(true);
    setQuizError(null);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setQuizScore(null);

    try {
      const res = await aiApi.generateQuiz({
        topic: studyTopic,
        studyMaterialText: activeSubject?.readingNotes || '',
      });
      setQuizQuestions(res.questions || []);

      // Inform Nexus AI chat
      const aiNotice: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `🧠 **Conceptual Quiz Generated for "${studyTopic}"**\n\nI have generated 5 rigorous multiple-choice questions on Page 5 (Quiz Practice). Test your first-principles understanding and submit when ready!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tag: 'Quiz Practice',
      };
      setChatMessages((prev) => [...prev, aiNotice]);
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setQuizError(err.message || 'Failed to generate practice quiz');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, option: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmitQuiz = () => {
    if (quizQuestions.length === 0) return;
    let correctCount = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });
    setQuizScore({ score: correctCount, total: quizQuestions.length });
    setQuizSubmitted(true);
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // Timer Formatting
  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Formula copy
  const handleCopyFormula = (latex: string, idx: number) => {
    navigator.clipboard.writeText(latex);
    setCopiedFormulaIdx(idx);
    setTimeout(() => setCopiedFormulaIdx(null), 2000);
  };

  // Notes Save
  const handleSaveNotes = () => {
    setIsNotesSaved(true);
    setTimeout(() => setIsNotesSaved(false), 2200);
  };

  // Document Upload & Nexus Analysis Handler
  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setUploadLoading(true);
    setUploadProgressMsg(`Extracting text from ${file.name}...`);

    try {
      const parsed = await parseDocumentFile(file);
      if (!parsed.text || !parsed.text.trim()) {
        throw new Error(`Could not extract readable text from "${file.name}". Please ensure the file contains valid text.`);
      }

      setUploadProgressMsg(`Nexus analyzing ${parsed.wordCount} words via Gemini...`);

      const analysis = await aiApi.analyzeDocument({
        documentText: parsed.text,
        fileName: file.name,
        topic: studyTopic,
      });

      setDocumentSummary(analysis);

      // Post notice into Nexus AI Chat stream
      const aiNotice: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `📄 **Document Analysis Complete for "${file.name}"** (${parsed.wordCount} words parsed)\n\nI have synthesized a comprehensive first-principles study breakdown and automatically populated it onto **Page 2: Explanations**.\n\n**High-Yield Takeaways:**\n${(analysis.keyTakeaways || []).map((t) => `• ${t}`).join('\n')}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tag: 'Document Analysis',
      };
      setChatMessages((prev) => [...prev, aiNotice]);

      // Automatically flip to Page 2 (Explanations) so user immediately sees the generated summary!
      setTimeout(() => {
        handleTurnPage(2);
      }, 1000);
    } catch (err: any) {
      console.error('Document analysis error:', err);
      setUploadError(err.message || 'Failed to analyze document');
    } finally {
      setUploadLoading(false);
      setUploadProgressMsg('');
    }
  };

  // Nexus AI Send Message (incorporates active subject reading notes AND live appended notes from Page 4)
  const handleSendNexus = async (queryText?: string, tag?: string) => {

    const textToSend = queryText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tag,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Build enriched context prompt combining curriculum notes + student notes from Page 4 + uploaded document
      let enrichedContext = `Subject: ${activeSubject.title} (${activeSubject.code})\nTopic Focus: ${studyTopic}\nLive Student Notes from Page 4: "${noteTakingText.slice(0, 500)}"\nCurriculum Notes: ${activeSubject.readingNotes.slice(0, 1000)}`;
      if (documentSummary) {
        enrichedContext += `\n\n[Active Uploaded Document: "${documentSummary.fileName}"]\nSummary: ${documentSummary.summary.slice(0, 1200)}\nKey Takeaways: ${(documentSummary.keyTakeaways || []).join('; ')}`;
      }

      const res = await aiApi.copilotChat({
        message: textToSend.trim(),
        context: enrichedContext,
      });

      const replyText =
        res.reply ||
        res.explanation ||
        res.overview ||
        `**Analysis for "${studyTopic}"**:\n\n1. Foundational principle: Focus on the core objective within ${activeSubject.title}.\n2. Formal logic: Deconstruct requirements and verify edge conditions.\n3. Takeaway: Synthesize takeaways for engineering mastery.`;

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tag: 'Nexus AI',
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('NotebookPage copilot error:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `Analysis for **${studyTopic}** (${activeSubject.code}):\n1. Verify system governing equations and task environment properties.\n2. In accordance with your field notes: check requirements.\n3. Test formal boundary conditions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tag: 'Curriculum Engine',
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const copyChatToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChatId(id);
    setTimeout(() => setCopiedChatId(null), 2000);
  };

  const wordCount = savedNotes.trim().split(/\s+/).filter(Boolean).length;
  const noteTakingWordCount = noteTakingText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="relative min-h-screen text-[#242725] font-sans flex flex-col overflow-x-hidden">
      {/* ── 1. 3D FLOATING STATIONERY BACKGROUND (FOUNTAIN PENS, PENCILS, STAPLER, PAPER CLIPS) ── */}
      <StationeryBackground />

      {/* ── 2. FREE-FLOATING DRAGGABLE YELLOW POST-IT NOTE TASK LIST ── */}
      <StickyNoteTasks />

      {/* ── 3. ACCOUNT INFORMATION MODAL ── */}
      <AccountInfoModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      {/* ── 4. MINIMALIST DESK TOP BAR ── */}
      {/* ── 4. MINIMALIST DESK TOP BAR ── */}
      <header className="h-14 px-3 sm:px-6 lg:px-8 border-b border-[#E6E1D8]/80 bg-white/85 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-2xs">
        {/* Left: Branding & Perspective Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-7 h-7 rounded-xl bg-[#5B8266]/15 border border-[#5B8266]/30 flex items-center justify-center text-[#43634D]">
            <Feather className="w-4 h-4 text-[#5B8266]" />
          </div>
          <div>
            <span className="font-display font-semibold text-xs sm:text-sm text-[#242725] tracking-tight">
              Mind Mirror
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB]">
              {isCoverOpen ? 'Open Study Folio' : 'Closed Cover Lobby'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-[#6D736E] font-mono pl-3 border-l border-[#E6E1D8]">
            <Clock className="w-3.5 h-3.5 text-[#5B8266]" />
            <span>{currentDate}</span>
            <span className="text-[#A4AAA5]">•</span>
            <span className="text-[#242725] font-medium">{currentTime}</span>
          </div>
        </div>

        {/* Center: Active Topic Status or Return to Lobby */}
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-[140px] sm:max-w-none">
          {isCoverOpen ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-mono text-[#6D736E] hidden md:inline">Topic:</span>
              <span className="py-1 px-2 sm:px-3 text-[11px] sm:text-xs rounded-xl bg-white/90 border border-[#E6E1D8] text-[#242725] font-semibold shadow-2xs truncate max-w-[110px] sm:max-w-none">
                {studyTopic}
              </span>
              <button
                onClick={handleCloseNotebook}
                className="py-1 px-2 sm:px-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E6E1D8] text-[10px] sm:text-[11px] font-medium text-[#43634D] flex items-center gap-1 transition cursor-pointer shrink-0"
                title="Close Notebook and return to Focus Lobby"
              >
                <Bookmark className="w-3 h-3 text-[#5B8266]" />
                <span className="hidden sm:inline">Lobby</span>
              </button>
            </div>
          ) : (
            <span className="text-[10px] sm:text-xs font-mono text-[#5B8266] bg-[#EDF3EE] px-2.5 py-0.5 sm:py-1 rounded-full border border-[#C8D7CB] truncate">
              ● Focus Ready
            </span>
          )}
        </div>

        {/* Right: Clean Account Information & Live Vercel QR */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <LiveVercelQR />

          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 py-1 sm:py-1.5 px-2 sm:px-3 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#E6E1D8] text-xs transition cursor-pointer shadow-2xs group"
            title="View Account Information"
          >
            <div className="w-5 h-5 rounded-full bg-[#5B8266]/15 text-[#43634D] flex items-center justify-center font-bold text-[10px]">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-semibold text-[#242725] leading-none group-hover:text-[#5B8266] transition">
                {user?.fullName?.split(' ')[0] || 'Admin'}
              </span>
              <span className="text-[9px] font-mono text-[#6D736E] leading-none mt-0.5">
                {user?.role === 'ADMIN' ? 'Admin Access' : 'Scholar'}
              </span>
            </div>
            {user?.role === 'ADMIN' && (
              <ShieldCheck className="w-3.5 h-3.5 text-[#84CC16]" />
            )}
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────
          VIEW A: CLOSED COVER FOCUS LOBBY (PERSPECTIVE: 1500px)
         ───────────────────────────────────────────────────────────────── */}
      {!isCoverOpen && (
        <main
          className="flex-1 w-full max-w-4xl mx-auto p-2 sm:p-6 lg:p-10 flex flex-col justify-center items-center select-none"
          style={{ perspective: 1500 }}
        >
          <motion.div
            key="notebook-closed-cover"
            animate={{
              rotateY: isCoverAnimating ? -180 : 0,
              opacity: isCoverAnimating ? 0.2 : 1,
            }}
            transition={{ duration: 0.68, ease: [0.45, 0.05, 0.55, 0.95] }}
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
            }}
            className="w-full max-w-xl rounded-2xl sm:rounded-3xl bg-[#1C2820] text-[#FAF8F5] p-4 sm:p-8 md:p-10 shadow-[0_35px_80px_rgba(0,0,0,0.45),0_15px_30px_rgba(0,0,0,0.25)] border-2 sm:border-4 border-[#2E4234] relative overflow-hidden"
          >
            {/* Skeuomorphic Leather Spine Crease on Left */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />

            {/* Debossed Gold Foil Framing & Emblems */}
            <div className="border border-[#85A38C]/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 bg-gradient-to-br from-[#243328] to-[#17221A] relative shadow-inner">
              {/* Header Emboss */}
              <div className="text-center space-y-1.5 sm:space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#5B8266]/25 border border-[#85A38C]/50 text-[#84CC16] shadow-sm mb-1">
                  <Feather className="w-5 h-5 sm:w-6 sm:h-6 text-[#85A38C]" />
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] sm:tracking-[0.25em] text-[#A3B8A8] uppercase">
                  Mind Mirror • Master Folio
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display tracking-tight text-[#FAF8F5]">
                  Focus Session Lobby
                </h1>
                <p className="text-xs text-[#A3B8A8] max-w-md mx-auto leading-relaxed">
                  Calibrate your target engineering topic and Pomodoro timer before opening the notebook.
                </p>
              </div>

              {/* ── 1. Focus Timer (Pomodoro Style) on Cover ── */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-[#121A14]/90 border border-[#2E4234] space-y-3 shadow-md">
                <div className="flex items-center justify-between text-xs font-mono text-[#85A38C]">
                  <span className="flex items-center gap-1.5 font-bold tracking-wider">
                    <Clock className="w-4 h-4 text-[#84CC16]" />
                    <span>FOCUS TIMER (POMODORO)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#243328] text-[#84CC16] border border-[#2E4234]">
                    {isTimerRunning ? 'Running' : 'Ready'}
                  </span>
                </div>

                {/* Clock Digital Display & +/- Controls */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 py-1">
                  <button
                    type="button"
                    onClick={() => setFocusSeconds((prev) => Math.max(60, prev - 300))}
                    disabled={isTimerRunning}
                    className="p-1.5 sm:p-2 rounded-xl bg-[#243328] hover:bg-[#2E4234] disabled:opacity-40 text-[#FAF8F5] transition cursor-pointer"
                    title="-5 minutes"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-widest text-[#FAF8F5] drop-shadow-[0_2px_10px_rgba(132,204,22,0.2)]">
                    {formatTimer(focusSeconds)}
                  </div>

                  <button
                    type="button"
                    onClick={() => setFocusSeconds((prev) => prev + 300)}
                    disabled={isTimerRunning}
                    className="p-2 rounded-xl bg-[#243328] hover:bg-[#2E4234] disabled:opacity-40 text-[#FAF8F5] transition cursor-pointer"
                    title="+5 minutes"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Timer Preset Buttons & Play/Pause */}
                <div className="flex items-center justify-between pt-1 border-t border-[#243328] gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: '25m Focus', sec: 25 * 60 },
                      { label: '45m Deep', sec: 45 * 60 },
                      { label: '15m Sprint', sec: 15 * 60 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setIsTimerRunning(false);
                          setFocusSeconds(preset.sec);
                        }}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          focusSeconds === preset.sec
                            ? 'bg-[#5B8266] text-white border-[#85A38C]'
                            : 'bg-[#1C2820] text-[#A3B8A8] border-[#2E4234] hover:bg-[#243328]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="py-1 px-3 rounded-lg bg-[#2E4234] hover:bg-[#3B5442] text-xs font-semibold text-[#84CC16] flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setFocusSeconds(25 * 60);
                      }}
                      className="p-1 rounded-lg hover:bg-[#243328] text-[#A3B8A8] transition cursor-pointer"
                      title="Reset timer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── 2. Study Topic Input Field ── */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-[#85A38C] font-semibold uppercase tracking-wider">
                  Target Study Topic (Governs Active Session)
                </label>
                <input
                  type="text"
                  value={studyTopic}
                  onChange={(e) => {
                    setStudyTopic(e.target.value);
                    if (e.target.value.trim()) {
                      setActiveSubject(resolveSubjectForTopic(e.target.value));
                    }
                  }}
                  placeholder="e.g. AI Mythology, Intelligent Agents, PEAS Framework, 4 Views of AI, Open Source..."
                  className="w-full py-3 px-4 text-xs font-medium rounded-xl bg-[#121A14] border border-[#2E4234] text-[#FAF8F5] placeholder-[#6D7D72] outline-none focus:border-[#85A38C] transition shadow-inner"
                />

                {/* Quick Topic Selector Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-mono text-[#6D7D72]">Suggestions:</span>
                  {[
                    'Intelligent Agents & Task Environments',
                    'AI Foundations & Philosophy',
                    'AI Mythology & Historical Origins',
                    'Open Source Principles & Methodology',
                  ].map((presetTopic) => (
                    <button
                      key={presetTopic}
                      type="button"
                      onClick={() => {
                        setStudyTopic(presetTopic);
                        setActiveSubject(resolveSubjectForTopic(presetTopic));
                      }}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1C2820] hover:bg-[#243328] text-[#A3B8A8] border border-[#2E4234] transition cursor-pointer"
                    >
                      {presetTopic.split('&')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── 3. Start Focus Session Button (Opens Cover) ── */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartFocusSession}
                  className="w-full py-4 px-6 rounded-2xl bg-[#5B8266] hover:bg-[#4A6D54] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition cursor-pointer shadow-lg hover:shadow-xl group"
                >
                  <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Start Focus Session • Open Notebook</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          VIEW B: OPEN TWO-PAGE PHYSICAL NOTEBOOK (PERSPECTIVE: 1500px)
         ───────────────────────────────────────────────────────────────── */}
      {isCoverOpen && (
        <main className="flex-1 w-full max-w-[1340px] mx-auto p-2 sm:p-4 md:p-6 lg:p-8 pb-24 md:pb-8 flex flex-col justify-center">
          {/* Physical Top Index Tabs (Desktop Only: hidden md:flex) */}
          <div className="hidden md:flex items-end justify-between px-6 pb-0 select-none">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Tab 1: Study Material */}
              <button
                onClick={() => handleTurnPage(1)}
                className={`py-2 px-3 sm:px-5 rounded-t-2xl font-mono text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-t-2 border-x-2 ${
                  activePage === 1
                    ? 'bg-[#FAF7F0] text-[#242725] border-[#D9D2C5] border-b-transparent shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-20 translate-y-[2px]'
                    : 'bg-[#EFEBE3]/90 text-[#6D736E] border-transparent hover:bg-[#EAE4D9] hover:text-[#242725] z-10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#5B8266]" />
                <span>Study Material</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/5">p. 1</span>
              </button>

              {/* Tab 2: Explanations */}
              <button
                onClick={() => handleTurnPage(2)}
                className={`py-2 px-3 sm:px-5 rounded-t-2xl font-mono text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-t-2 border-x-2 ${
                  activePage === 2
                    ? 'bg-[#FAF7F0] text-[#242725] border-[#D9D2C5] border-b-transparent shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-20 translate-y-[2px]'
                    : 'bg-[#EFEBE3]/90 text-[#6D736E] border-transparent hover:bg-[#EAE4D9] hover:text-[#242725] z-10'
                }`}
              >
                <Sigma className="w-3.5 h-3.5 text-[#B86B43]" />
                <span>Explanations</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/5">p. 2</span>
              </button>

              {/* Tab 3: Nexus AI Assistance */}
              <button
                onClick={() => handleTurnPage(3)}
                className={`py-2 px-3 sm:px-5 rounded-t-2xl font-mono text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-t-2 border-x-2 ${
                  activePage === 3
                    ? 'bg-[#FAF7F0] text-[#242725] border-[#D9D2C5] border-b-transparent shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-20 translate-y-[2px]'
                    : 'bg-[#EFEBE3]/90 text-[#6D736E] border-transparent hover:bg-[#EAE4D9] hover:text-[#242725] z-10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5B8266]" />
                <span>Nexus AI Assistance</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/5">p. 3</span>
              </button>

              {/* Tab 4: Note Taking (Live State Sync) */}
              <button
                onClick={() => handleTurnPage(4)}
                className={`py-2 px-3 sm:px-5 rounded-t-2xl font-mono text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-t-2 border-x-2 ${
                  activePage === 4
                    ? 'bg-[#FAF7F0] text-[#242725] border-[#D9D2C5] border-b-transparent shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-20 translate-y-[2px]'
                    : 'bg-[#EFEBE3]/90 text-[#6D736E] border-transparent hover:bg-[#EAE4D9] hover:text-[#242725] z-10'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-[#43634D]" />
                <span>Note Taking</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#15803D] text-white">p. 4</span>
              </button>

              {/* Tab 5: Quiz Practice (Structured AI Generation & Assessment) */}
              <button
                onClick={() => handleTurnPage(5)}
                className={`py-2 px-3 sm:px-5 rounded-t-2xl font-mono text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-t-2 border-x-2 ${
                  activePage === 5
                    ? 'bg-[#FAF7F0] text-[#242725] border-[#D9D2C5] border-b-transparent shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-20 translate-y-[2px]'
                    : 'bg-[#EFEBE3]/90 text-[#6D736E] border-transparent hover:bg-[#EAE4D9] hover:text-[#242725] z-10'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#5B8266]" />
                <span>Quiz Practice</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#5B8266] text-white">p. 5</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 pb-2 text-[11px] font-mono text-[#7D837E]">
              <Bookmark className="w-3.5 h-3.5 text-[#5B8266]" />
              <span>Session Governed: {studyTopic}</span>
            </div>
          </div>

          {/* ── THE OPEN NOTEBOOK CONTAINER (PERSPECTIVE: 1500px) ── */}
          <div
            className="relative w-full rounded-2xl md:rounded-3xl bg-[#282521] p-1.5 sm:p-2.5 md:p-3 shadow-[0_30px_70px_rgba(0,0,0,0.28),0_10px_25px_rgba(0,0,0,0.12)] border border-[#3E3A33]"
            style={{ perspective: 1500 }}
          >
            <div className="relative w-full min-h-[520px] md:min-h-[760px] flex flex-col md:flex-row rounded-xl md:rounded-2xl overflow-hidden bg-[#FAF7F0] border md:border-2 border-[#D9D2C5]">
              
              {/* ─────────────────────────────────────────────────────────────
                  LEFT-HAND PAGE (DESKTOP ONLY: hidden md:flex)
                 ───────────────────────────────────────────────────────────── */}
              <div
                className="hidden md:flex md:w-1/2 p-4 sm:p-6 lg:p-8 flex-col justify-between border-b md:border-b-0 md:border-r border-[#D9D2C5] relative"
                style={{
                  backgroundImage: `
                    radial-gradient(#D3CBBF 0.75px, transparent 0.75px),
                    linear-gradient(to right, rgba(0,0,0,0.02) 0px, transparent 20px)
                  `,
                  backgroundSize: '24px 24px, 100% 100%',
                }}
              >
                <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-8 pointer-events-none bg-gradient-to-l from-black/10 to-transparent z-10" />

                <div className="space-y-6">
                  {/* Left Page Top Header */}
                  <div className="pb-4 border-b border-[#E6E1D8] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB] font-bold">
                          FOLIO A • {activeSubject.code}
                        </span>
                        <span className="text-xs text-[#6D736E] font-medium">{studyTopic}</span>
                      </div>
                      <h2 className="text-xl font-bold font-display text-[#242725] mt-1">
                        {activePage === 1 && 'Coursework Syllabus & Core Milestones'}
                        {activePage === 2 && 'Mathematical Axioms & Invariant Formulations'}
                        {activePage === 3 && 'Nexus Mentorship Context & First Principles'}
                        {activePage === 4 && 'Field Notes Summary & Synthesis Guidelines'}
                        {activePage === 5 && 'Quiz Practice & Conceptual Assessment'}
                      </h2>
                    </div>

                    <span className="text-[11px] font-mono text-[#8E948F]">
                      Tab {activePage}/5
                    </span>
                  </div>

                  {/* Left Page Content per Tab */}
                  {activePage === 1 && (
                    <div className="space-y-4">
                      <p className="text-xs text-[#525853] leading-relaxed">
                        Isolated focus curriculum for <span className="font-semibold text-[#242725]">{studyTopic}</span>. Follow the 4-week structured milestones below:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className="p-3.5 rounded-xl bg-white border border-[#E6E1D8] space-y-1.5 shadow-2xs hover:border-[#5B8266] transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EDF3EE] text-[#43634D] font-bold">
                                {w.week}
                              </span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#5B8266]" />
                            </div>
                            <h4 className="text-xs font-bold text-[#242725]">{w.title}</h4>
                            <ul className="space-y-1 pt-1">
                              {w.concepts.map((c, cidx) => (
                                <li key={cidx} className="text-[10px] text-[#6D736E] flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-[#5B8266]" />
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-[#EDF3EE] border border-[#C8D7CB] flex items-center gap-2 text-xs text-[#43634D]">
                        <Bookmark className="w-4 h-4 shrink-0 text-[#5B8266]" />
                        <span>The right leaf displays active reading notes & live field notes synced from Page 4.</span>
                      </div>
                    </div>
                  )}

                  {activePage === 2 && (
                    <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                      <p className="text-xs text-[#525853] leading-relaxed">
                        Fundamental mathematical theorems governing <span className="font-semibold text-[#242725]">{studyTopic}</span>:
                      </p>

                      {activeSubject.governingFormulas.map((formula, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-white border border-[#E6E1D8] space-y-2 shadow-2xs hover:border-[#5B8266] transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-[#242725]">{formula.name}</h4>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleCopyFormula(formula.latex, idx)}
                                className="p-1 rounded bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E6E1D8] text-[#6D736E] text-xs transition cursor-pointer"
                                title="Copy LaTeX"
                              >
                                {copiedFormulaIdx === idx ? (
                                  <Check className="w-3 h-3 text-[#5B8266]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  handleSendNexus(
                                    `Derive "${formula.name}" (${formula.latex}) from first principles for topic "${studyTopic}". State all boundary assumptions.`
                                  );
                                  handleTurnPage(3);
                                }}
                                className="py-0.5 px-2 rounded bg-[#EDF3EE] hover:bg-[#DCE7DD] text-[#43634D] border border-[#C8D7CB] text-[10px] font-medium flex items-center gap-1 transition cursor-pointer"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-[#5B8266]" />
                                <span>Derive</span>
                              </button>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1D8] font-mono text-xs text-[#242725] overflow-x-auto">
                            <code>{formula.latex}</code>
                          </div>

                          <p className="text-[11px] text-[#6D736E] leading-relaxed">
                            {formula.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activePage === 3 && (
                    <div className="space-y-4">
                      <p className="text-xs text-[#525853] leading-relaxed">
                        Nexus is isolated to <span className="font-semibold text-[#242725]">{studyTopic}</span>. Choose an analytical prompt trigger below:
                      </p>

                      <div className="space-y-2.5">
                        <button
                          onClick={() =>
                            handleSendNexus(
                              `Synthesize the study notes and student notes for ${studyTopic} into 3 first-principles axioms and 2 high-yield exam takeaways:\n\n${activeSubject.readingNotes.slice(0, 500)}\n\nStudent notes: ${noteTakingText.slice(0, 400)}`,
                              'Summarize'
                            )
                          }
                          className="w-full p-3 rounded-xl bg-white hover:bg-[#EDF3EE] border border-[#E6E1D8] hover:border-[#5B8266] text-xs font-semibold text-[#242725] flex items-center justify-between transition cursor-pointer shadow-2xs group text-left"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#5B8266]" />
                            <span>1. Summarize Combined Material & Notes</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#5B8266] group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                          onClick={() =>
                            handleSendNexus(
                              `Generate 3 active-recall conceptual quiz questions for "${studyTopic}". Include physical intuition questions based on my live notes.`,
                              'Quiz'
                            )
                          }
                          className="w-full p-3 rounded-xl bg-white hover:bg-[#EDF3EE] border border-[#E6E1D8] hover:border-[#5B8266] text-xs font-semibold text-[#242725] flex items-center justify-between transition cursor-pointer shadow-2xs group text-left"
                        >
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-[#B86B43]" />
                            <span>2. Active-Recall Conceptual Quiz</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#5B8266] group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                          onClick={() => {
                            const primary = activeSubject.governingFormulas[0];
                            handleSendNexus(
                              `Derive the primary formulation "${primary?.name || studyTopic}" (${primary?.latex || ''}) from first principles. Include asymptotic limits.`,
                              'Derivation'
                            );
                          }}
                          className="w-full p-3 rounded-xl bg-white hover:bg-[#EDF3EE] border border-[#E6E1D8] hover:border-[#5B8266] text-xs font-semibold text-[#242725] flex items-center justify-between transition cursor-pointer shadow-2xs group text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Sigma className="w-4 h-4 text-[#5B8266]" />
                            <span>3. Derive Governing Formulations</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#5B8266] group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#EDF3EE] border border-[#C8D7CB] space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#43634D]">
                          <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
                          <span>Dynamic Note Sync Active</span>
                        </div>
                        <p className="text-[11px] text-[#525853] leading-relaxed">
                          Nexus automatically incorporates all {noteTakingWordCount} words typed on Page 4 (Note Taking) into its conceptual reasoning.
                        </p>
                      </div>
                    </div>
                  )}

                  {activePage === 4 && (
                    <div className="space-y-4">
                      <p className="text-xs text-[#525853] leading-relaxed">
                        Guidelines for effective first-principles note-taking on <span className="font-semibold text-[#242725]">{studyTopic}</span>:
                      </p>

                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-white border border-[#E6E1D8] space-y-1 shadow-2xs">
                          <h4 className="text-xs font-bold text-[#242725]">1. State Primitive Axioms First</h4>
                          <p className="text-[11px] text-[#6D736E] leading-relaxed">
                            Do not write derived approximations without explicitly recording the governing conservation balance.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-[#E6E1D8] space-y-1 shadow-2xs">
                          <h4 className="text-xs font-bold text-[#242725]">2. State-Sync Mechanism</h4>
                          <p className="text-[11px] text-[#6D736E] leading-relaxed">
                            Any notes typed on the right-hand leaf append directly to Page 1 and become immediate context for Nexus AI.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-[#E6E1D8] space-y-1 shadow-2xs">
                          <h4 className="text-xs font-bold text-[#242725]">3. Verify Boundary Limits</h4>
                          <p className="text-[11px] text-[#6D736E] leading-relaxed">
                            Check dimensions at boundary extremes ($t \\to 0$, $t \\to \\infty$) directly in your notes.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleSendNexus(
                              `Here are my live student field notes for "${studyTopic}":\n\n"${noteTakingText.slice(0, 800)}"\n\nPlease review these notes, verify physical consistency, and provide 2 constructive analytical extensions.`
                            );
                            handleTurnPage(3);
                          }}
                          disabled={!noteTakingText.trim()}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Review Live Notes with Nexus AI (p. 3)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activePage === 5 && (
                    <div className="space-y-4">
                      <p className="text-xs text-[#525853] leading-relaxed">
                        Active recall and conceptual synthesis assessment for <span className="font-semibold text-[#242725]">{studyTopic}</span>.
                      </p>

                      <div className="p-4 rounded-xl bg-white border border-[#E6E1D8] space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D8]">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-[#5B8266]" />
                            <h4 className="text-xs font-bold text-[#242725]">Assessment Specifications</h4>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB] font-bold">
                            5 Questions
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-[#525853]">
                          <div className="flex justify-between items-center py-1 border-b border-[#F2ECE4]">
                            <span className="text-[#6D736E]">Target Subject:</span>
                            <span className="font-semibold text-[#242725] text-right truncate max-w-[180px]">{studyTopic}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-[#F2ECE4]">
                            <span className="text-[#6D736E]">Source Material:</span>
                            <span className="font-mono text-[11px] text-[#43634D]">Reading Notes & Axioms</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-[#F2ECE4]">
                            <span className="text-[#6D736E]">Passing Benchmark:</span>
                            <span className="font-semibold text-[#242725]">80% (4 / 5 Correct)</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-[#6D736E]">Format:</span>
                            <span className="font-medium text-[#242725]">Multiple Choice (4 Options)</span>
                          </div>
                        </div>
                      </div>

                      {/* Generate Quiz Action Button */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleGenerateQuiz}
                          disabled={isQuizLoading}
                          className="w-full py-3 px-4 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] disabled:opacity-50 text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition cursor-pointer shadow-md hover:shadow-lg"
                        >
                          {isQuizLoading ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Nexus Synthesizing Questions...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>{quizQuestions.length > 0 ? 'Regenerate Practice Quiz' : 'Generate Quiz via Nexus AI'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Score / Performance Card if submitted */}
                      {quizSubmitted && quizScore && (
                        <div className="p-4 rounded-xl bg-[#EDF3EE] border-2 border-[#5B8266] space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#43634D] uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-[#5B8266]" />
                              <span>Assessment Results</span>
                            </span>
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-[#242725] border border-[#C8D7CB]">
                              {Math.round((quizScore.score / quizScore.total) * 100)}%
                            </span>
                          </div>

                          <div className="text-center py-2 bg-white rounded-lg border border-[#C8D7CB]">
                            <div className="text-2xl font-bold font-display text-[#242725]">
                              {quizScore.score} / {quizScore.total}
                            </div>
                            <div className="text-[11px] text-[#6D736E] mt-0.5">
                              {quizScore.score >= 4
                                ? '🌟 Concept Mastery Demonstrated'
                                : '📖 Further Review Recommended'}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleRetakeQuiz}
                              className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-[#FAF8F5] border border-[#C8D7CB] text-[#242725] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#6D736E]" />
                              <span>Retake</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleGenerateQuiz}
                              disabled={isQuizLoading}
                              className="flex-1 py-2 px-3 rounded-lg bg-[#5B8266] hover:bg-[#4A6D54] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>New Quiz</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Note about Nexus AI Integration */}
                      <div className="p-3 rounded-xl bg-white border border-[#E6E1D8] text-[11px] text-[#6D736E] space-y-1">
                        <div className="font-semibold text-[#242725] flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-[#B86B43]" />
                          <span>Gemini @google/genai Reasoning</span>
                        </div>
                        <p>
                          Questions test deep physical intuition and invariant relationships rather than superficial rote memorization.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Left Page Bottom Footer */}
                <div className="pt-4 mt-6 border-t border-[#E6E1D8] flex items-center justify-between text-[11px] font-mono text-[#8E948F]">
                  <span>Mind Mirror • Folio A</span>
                  <span>Page {activePage} (Left Leaf)</span>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  VISUAL CENTRAL SPINE & REALISTIC SPIRAL BINDING (DESKTOP: hidden md:flex)
                 ───────────────────────────────────────────────────────────── */}
              <div className="hidden md:flex absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 z-30 pointer-events-none flex-col justify-between py-6">
                <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-r from-black/20 via-black/5 to-transparent" />
                <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-l from-black/20 via-black/5 to-transparent" />

                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="relative w-full h-4 flex items-center justify-between px-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3D372E] shadow-inner -ml-1 border border-black/30" />
                    <div
                      className="absolute left-1 right-1 h-3 rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 25%, #94A3B8 50%, #475569 80%, #0F172A 100%)',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.8)',
                        transform: 'rotate(-4deg)',
                      }}
                    />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3D372E] shadow-inner -ml-1 border border-black/30" />
                  </div>
                ))}
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  RIGHT-HAND PAGE (FULL WIDTH ON MOBILE, HALF ON DESKTOP)
                 ───────────────────────────────────────────────────────────── */}
              <div className="w-full md:w-1/2 relative bg-[#FAF7F0] flex flex-col justify-between">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={`notebook-page-${activePage}`}
                    custom={direction}
                    variants={pageFlipVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{
                      transformOrigin: 'left center',
                      transformStyle: 'preserve-3d',
                    }}
                    className="w-full h-full p-3.5 sm:p-5 md:p-8 flex flex-col justify-between bg-[#FAF7F0] relative z-20 select-text"
                  >
                    <div className="hidden md:block absolute top-0 bottom-0 left-0 w-8 pointer-events-none bg-gradient-to-r from-black/10 to-transparent z-10" />

                    <div className="space-y-4 sm:space-y-6">
                      {/* Right Page Header */}
                      <div className="pb-3 sm:pb-4 border-b border-[#E6E1D8] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB] font-bold">
                            FOLIO B • {activeSubject.code}
                          </span>
                          <h2 className="text-base sm:text-lg md:text-xl font-bold font-display text-[#242725] mt-1">
                            {activePage === 1 && 'Deep Reading Notes & Focus Desk'}
                            {activePage === 2 && 'Student Derivations & Analytical Notes'}
                            {activePage === 3 && 'Nexus AI Conversational Tutor'}
                            {activePage === 4 && 'Field Notes Ruled Journal'}
                            {activePage === 5 && 'Interactive Concept Assessment'}
                          </h2>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {activePage > 1 && (
                            <button
                              onClick={() => handleTurnPage((activePage - 1) as 1 | 2 | 3 | 4)}
                              className="p-1.5 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#E6E1D8] text-xs font-medium text-[#242725] flex items-center gap-1 transition cursor-pointer shadow-2xs"
                              title="Flip to previous page"
                            >
                              <ArrowLeft className="w-3.5 h-3.5 text-[#6D736E]" />
                              <span className="hidden sm:inline">p. {activePage - 1}</span>
                            </button>
                          )}
                          {activePage < 5 && (
                            <button
                              onClick={() => handleTurnPage((activePage + 1) as 2 | 3 | 4 | 5)}
                              className="p-1.5 px-2.5 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs"
                              title="Flip to next page"
                            >
                              <span>Flip to p. {activePage + 1}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right Page Content per Tab */}
                      {activePage === 1 && (
                        <div className="space-y-5">
                          {/* Reading Notes Box */}
                          <div className="p-4 rounded-2xl bg-white border border-[#E6E1D8] shadow-xs space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#242725] uppercase tracking-wider">
                              <BookOpen className="w-4 h-4 text-[#5B8266]" />
                              <span>Isolated Reading Notes: {studyTopic}</span>
                            </div>
                            <div className="max-h-56 overflow-y-auto pr-1">
                              <ReactMarkdown
                                className="prose prose-slate max-w-none text-xs leading-relaxed text-[#373C38]"
                                content={activeSubject?.readingNotes || ''}
                              >
                                {activeSubject?.readingNotes || ''}
                              </ReactMarkdown>
                            </div>

                          </div>

                          {/* ── State Sync: Appended Notes from Page 4 ── */}
                          {noteTakingText.trim() && (
                            <div className="p-4 rounded-2xl bg-[#FEF9C3]/70 border-2 border-[#FDE047] shadow-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#854D0E] uppercase tracking-wider">
                                  <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
                                  <span>Live Appended Field Notes (from Page 4)</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleTurnPage(4)}
                                  className="text-[11px] font-mono font-semibold text-[#854D0E] hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <span>Edit in Note Taking (p. 4)</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="text-xs leading-relaxed text-[#422006] whitespace-pre-wrap font-mono p-3 rounded-xl bg-white/80 border border-[#FEF08A] max-h-36 overflow-y-auto shadow-inner">
                                {noteTakingText}
                              </div>
                            </div>
                          )}

                          {/* Physical Pomodoro Timer Widget */}
                          <PomodoroWidget />
                        </div>
                      )}

                      {activePage === 2 && (
                        <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
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
                                    {documentSummary.source === 'gemini' ? 'Gemini AI Synthesis' : 'Curriculum Engine'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(documentSummary.summary);
                                      setIsNotesSaved(true);
                                      setTimeout(() => setIsNotesSaved(false), 2000);
                                    }}
                                    className="p-1 rounded bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E6E1D8] text-[#6D736E] text-xs cursor-pointer transition"
                                    title="Copy Summary"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setDocumentSummary(null)}
                                    className="p-1 rounded bg-[#FAF8F5] hover:bg-[#F7EFEA] border border-[#E6E1D8] text-[#9CA3AF] hover:text-[#B86B43] text-xs cursor-pointer transition"
                                    title="Clear Summary"
                                  >
                                    <X className="w-3 h-3" />
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

                              {documentSummary.governingFormulas && documentSummary.governingFormulas.length > 0 && (
                                <div className="pt-2 border-t border-[#E6E1D8] space-y-1.5">
                                  <span className="text-[11px] font-bold font-mono text-[#43634D] uppercase tracking-wider">
                                    Governing Equations & Formulas
                                  </span>
                                  <div className="space-y-1.5">
                                    {documentSummary.governingFormulas.map((f, fIdx) => (
                                      <div key={fIdx} className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E6E1D8] text-xs">
                                        <div className="font-semibold text-[#242725]">{f.name}</div>
                                        <div className="font-mono text-[#5B8266] my-0.5">{f.latex}</div>
                                        <div className="text-[11px] text-[#6D736E]">{f.description}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-xl border border-dashed border-[#C8D7CB] bg-[#FAF8F5] flex items-center justify-between gap-3 text-xs text-[#6D736E]">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#5B8266] shrink-0" />
                                <span>Upload a lecture or coursework file (PDF, DOCX, PPTX) on Page 3 to have Nexus populate a concise first-principles summary here.</span>
                              </div>
                              <button
                                onClick={() => handleTurnPage(3)}
                                className="py-1 px-2.5 rounded-lg bg-white hover:bg-[#EDF3EE] text-[#43634D] font-semibold text-xs border border-[#C8D7CB] shrink-0 transition cursor-pointer"
                              >
                                Go to Upload →
                              </button>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#242725] uppercase tracking-wider">
                              <Edit3 className="w-4 h-4 text-[#5B8266]" />
                              <span>Student Derivations Scratchpad</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="text-xs text-[#6D736E] font-mono">{wordCount} words</span>
                              <button
                                onClick={handleSaveNotes}
                                className="py-1 px-3 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                              >
                                {isNotesSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                                <span>{isNotesSaved ? 'Saved' : 'Save Notes'}</span>
                              </button>
                            </div>
                          </div>

                          <textarea
                            value={savedNotes}
                            onChange={(e) => setSavedNotes(e.target.value)}
                            placeholder="Write your derivation steps, boundary checks, or mathematical questions here..."
                            className="w-full min-h-[220px] p-4 text-xs font-mono leading-relaxed rounded-xl bg-white border border-[#E6E1D8] text-[#242725] placeholder-[#8F9690] outline-none focus:border-[#5B8266] transition resize-none shadow-xs"
                          />

                          <div className="p-3 rounded-xl bg-[#EDF3EE] border border-[#C8D7CB] flex items-center justify-between gap-3 text-xs text-[#43634D]">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 shrink-0 text-[#5B8266]" />
                              <span>Want a step-by-step verification of your derivations?</span>
                            </div>
                            <button
                              onClick={() => {
                                handleSendNexus(
                                  `Here are my student derivation notes for ${studyTopic}:\n\n"${savedNotes.slice(0, 600)}"\n\nPlease review my steps and verify mathematical rigor.`
                                );
                                handleTurnPage(3);
                              }}
                              className="py-1 px-2.5 rounded-lg bg-white hover:bg-[#FAF8F5] text-[#242725] font-semibold text-xs border border-[#C8D7CB] transition cursor-pointer whitespace-nowrap shadow-2xs"
                            >
                              Review with Nexus →
                            </button>
                          </div>
                        </div>
                      )}

                      {activePage === 3 && (
                        <div className="space-y-4 flex flex-col h-full">
                          {/* ── Drag-and-Drop Document Upload Zone ── */}
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(false);
                              const files = e.dataTransfer.files;
                              if (files && files.length > 0) {
                                handleFileUpload(files[0]);
                              }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                              isDragging
                                ? 'border-[#5B8266] bg-[#EDF3EE]/90 scale-[1.01]'
                                : 'border-[#D9D2C5] hover:border-[#5B8266] bg-white'
                            }`}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.docx,.pptx,.txt,.md"
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                  handleFileUpload(files[0]);
                                }
                              }}
                            />

                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-[#EDF3EE] text-[#43634D]">
                                  {uploadLoading ? (
                                    <span className="w-5 h-5 border-2 border-[#5B8266] border-t-transparent rounded-full animate-spin inline-block" />
                                  ) : (
                                    <UploadCloud className="w-5 h-5 text-[#5B8266]" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-[#242725] flex items-center gap-2">
                                    <span>{uploadLoading ? uploadProgressMsg : 'Drop Lecture Material for Nexus Analysis'}</span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FAF8F5] border border-[#E6E1D8] text-[#6D736E]">
                                      PDF • DOCX • PPTX
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#6D736E] mt-0.5">
                                    {uploadLoading
                                      ? 'Extracting text and generating summary via Gemini for Page 2...'
                                      : 'Click or drop PDF, DOCX, or PPTX — Nexus extracts text and auto-populates Page 2 (Explanations)'}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={uploadLoading}
                                className="py-1.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EDF3EE] border border-[#E6E1D8] text-xs font-semibold text-[#242725] shrink-0 transition"
                              >
                                Browse
                              </button>
                            </div>

                            {uploadError && (
                              <div className="mt-2.5 p-2.5 rounded-xl bg-[#F7EFEA] border border-[#E5C9BA] text-[#B86B43] text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{uploadError}</span>
                              </div>
                            )}
                          </div>

                          {/* Nexus AI Chat Stream */}
                          <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1 p-3.5 rounded-2xl bg-white border border-[#E6E1D8] shadow-xs select-text">

                            {chatMessages.map((m) => (
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
                                  className={`relative group rounded-2xl p-3.5 text-xs leading-relaxed max-w-[90%] transition shadow-xs ${
                                    m.sender === 'user'
                                      ? 'bg-[#5B8266] text-white font-medium'
                                      : 'bg-[#FAF8F5] border border-[#E6E1D8] text-[#242725]'
                                  }`}
                                >
                                  {m.sender === 'user' ? (
                                    <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                                  ) : (
                                    <ReactMarkdown
                                      className="prose prose-slate max-w-none text-xs leading-relaxed text-[#242725]"
                                      content={m?.text || ''}
                                    >
                                      {m?.text || ''}
                                    </ReactMarkdown>
                                  )}


                                  {m.sender === 'ai' && (
                                    <button
                                      onClick={() => copyChatToClipboard(m.text, m.id)}
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-white text-[#6D736E] hover:text-[#242725] transition cursor-pointer shadow-2xs"
                                      title="Copy explanation"
                                    >
                                      {copiedChatId === m.id ? (
                                        <Check className="w-3 h-3 text-[#5B8266]" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            {chatLoading && (
                              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-xs text-[#5B8266] flex items-center gap-2 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-[#5B8266] animate-pulse" />
                                <span>Nexus is analyzing {studyTopic} and your live notes...</span>
                              </div>
                            )}
                          </div>

                          {/* Chat Prompt Form */}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendNexus();
                            }}
                            className="flex items-center gap-2 pt-1"
                          >
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder={`Ask Nexus about ${studyTopic}...`}
                              className="flex-1 py-2.5 px-3.5 text-xs rounded-xl bg-white border border-[#E6E1D8] text-[#242725] placeholder-[#8F9690] outline-none focus:border-[#5B8266] transition shadow-xs"
                            />
                            <button
                              type="submit"
                              disabled={!chatInput.trim() || chatLoading}
                              className="py-2.5 px-4 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                              <Send className="w-3 h-3" />
                              <span>Ask Nexus</span>
                            </button>
                          </form>
                        </div>
                      )}

                      {/* ── Tab 4: Note-Taking Page Text Editor ── */}
                      {activePage === 4 && (
                        <div className="space-y-4 flex flex-col h-full">
                          <div className="p-3 rounded-xl bg-[#EDF3EE] border border-[#C8D7CB] flex items-center justify-between gap-2 text-xs text-[#43634D]">
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5B8266] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5B8266]" />
                              </span>
                              <span className="font-semibold">Live State Sync Active:</span>
                              <span className="text-[#525853] text-[11px]">
                                Bound to Study Material (p. 1) & Nexus AI (p. 3)
                              </span>
                            </div>
                            <span className="font-mono text-[11px] text-[#6D736E]">{noteTakingWordCount} words</span>
                          </div>

                          {/* Ruled Paper Textarea with red margin */}
                          <div className="flex-1 relative rounded-2xl border border-[#D9D2C5] bg-white overflow-hidden shadow-inner flex flex-col min-h-[340px]">
                            <div className="absolute top-0 bottom-0 left-9 w-[2px] bg-[#F87171]/40 pointer-events-none z-10" />

                            <textarea
                              value={noteTakingText}
                              onChange={(e) => setNoteTakingText(e.target.value)}
                              placeholder={`Type your live thoughts, derivations, or synthesis for "${studyTopic}"...\n\nEvery character typed here instantly syncs to Page 1 so Nexus AI can analyze it.`}
                              className="w-full flex-1 p-4 pl-12 text-xs font-mono text-[#242725] placeholder-[#9CA3AF] bg-transparent outline-none resize-none leading-[28px]"
                              style={{
                                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #F1F5F9 27px, #F1F5F9 28px)',
                                backgroundAttachment: 'local',
                                minHeight: '320px',
                              }}
                            />

                            <div className="p-2.5 border-t border-[#E6E1D8] bg-[#FAF8F5] flex items-center justify-between text-xs">
                              <span className="text-[11px] text-[#6D736E] flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#5B8266]" />
                                <span>Real-time sync to Study Material active</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  handleSendNexus(
                                    `Here are my live student notes taken for "${studyTopic}":\n\n"${noteTakingText.slice(0, 800)}"\n\nPlease review these notes, verify physical consistency, and provide 2 constructive analytical extensions.`
                                  );
                                  handleTurnPage(3);
                                }}
                                disabled={!noteTakingText.trim()}
                                className="py-1 px-3 rounded-lg bg-[#5B8266] hover:bg-[#4A6D54] disabled:opacity-40 text-white text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Review with Nexus (p. 3)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Tab 5: Interactive Quiz Practice ── */}
                      {activePage === 5 && (
                        <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1 pb-28 md:pb-6 select-text">
                          {/* Top Assessment Status Bar */}
                          <div className="p-3 rounded-xl bg-white border border-[#E6E1D8] flex items-center justify-between text-xs shadow-2xs">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#43634D] border border-[#C8D7CB] font-bold">
                                {quizQuestions.length > 0 ? `${quizQuestions.length} Questions` : 'Ready'}
                              </span>
                              <span className="text-[#6D736E] text-xs">
                                {quizSubmitted
                                  ? 'Assessment Complete'
                                  : quizQuestions.length > 0
                                  ? `${Object.keys(selectedAnswers).length} of ${quizQuestions.length} answered`
                                  : 'Active-Recall Testing'}
                              </span>
                            </div>

                            {quizSubmitted && quizScore ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#242725]">Score:</span>
                                <span
                                  className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                                    quizScore.score >= 4
                                      ? 'bg-[#EDF3EE] text-[#15803D] border border-[#C8D7CB]'
                                      : 'bg-[#FDF2F2] text-[#991B1B] border border-[#F87171]'
                                  }`}
                                >
                                  {quizScore.score} / {quizScore.total} (
                                  {Math.round((quizScore.score / quizScore.total) * 100)}%)
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] font-mono text-[#8E948F]">
                                {quizQuestions.length > 0 ? 'Select 1 option per question' : 'Topic: ' + studyTopic}
                              </span>
                            )}
                          </div>

                          {/* Loading state */}
                          {isQuizLoading && (
                            <div className="p-8 rounded-2xl bg-white border border-[#E6E1D8] shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                              <div className="p-3 rounded-full bg-[#EDF3EE] text-[#43634D]">
                                <span className="w-6 h-6 border-2 border-[#5B8266] border-t-transparent rounded-full animate-spin inline-block" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-[#242725]">Generating 5 Structured Questions</h4>
                                <p className="text-xs text-[#6D736E] max-w-sm">
                                  Nexus AI is querying Gemini to analyze <span className="font-semibold text-[#242725]">"{studyTopic}"</span> and formulate 5 rigorous multiple-choice questions...
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Empty state when no questions generated yet */}
                          {!isQuizLoading && quizQuestions.length === 0 && (
                            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1D8] shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                              <div className="w-12 h-12 rounded-2xl bg-[#EDF3EE] border border-[#C8D7CB] flex items-center justify-center text-[#43634D]">
                                <HelpCircle className="w-6 h-6 text-[#5B8266]" />
                              </div>
                              <div className="space-y-1.5 max-w-md">
                                <h3 className="text-sm sm:text-base font-bold font-display text-[#242725]">
                                  Interactive Practice Assessment
                                </h3>
                                <p className="text-xs text-[#6D736E] leading-relaxed">
                                  Challenge your mastery of <span className="font-semibold text-[#242725]">{studyTopic}</span>. Nexus AI will analyze your reading material and formulate 5 concept-testing multiple-choice questions.
                                </p>
                              </div>

                              {quizError && (
                                <div className="p-2.5 rounded-xl bg-[#FDF2F2] border border-[#F87171] text-[#991B1B] text-xs flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  <span>{quizError}</span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={handleGenerateQuiz}
                                className="py-3 px-6 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-md hover:shadow-lg"
                              >
                                <Sparkles className="w-4 h-4" />
                                <span>Generate Quiz with Nexus AI</span>
                              </button>
                            </div>
                          )}

                          {/* Render Questions List */}
                          {!isQuizLoading && quizQuestions.length > 0 && (
                            <div className="space-y-4">
                              {quizQuestions.map((q, qIdx) => {
                                const userSelected = selectedAnswers[q.id];
                                const isCorrect = userSelected === q.correctAnswer;
                                return (
                                  <div
                                    key={q.id || `quiz-q-${qIdx}`}
                                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E1D8] shadow-xs space-y-3"
                                  >
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-[#FAF8F5] border border-[#E6E1D8] font-mono text-xs font-bold text-[#242725] flex items-center justify-center shrink-0">
                                          {qIdx + 1}
                                        </span>
                                        <span className="text-xs font-mono text-[#6D736E] uppercase tracking-wider">
                                          Question {qIdx + 1} of {quizQuestions.length}
                                        </span>
                                      </div>
                                      {quizSubmitted && (
                                        <span
                                          className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                            isCorrect
                                              ? 'bg-[#EDF3EE] text-[#15803D] border border-[#C8D7CB]'
                                              : 'bg-[#FDF2F2] text-[#991B1B] border border-[#F87171]'
                                          }`}
                                        >
                                          {isCorrect ? (
                                            <>
                                              <Check className="w-3 h-3 text-[#15803D]" />
                                              <span>Correct (+1)</span>
                                            </>
                                          ) : (
                                            <>
                                              <X className="w-3 h-3 text-[#991B1B]" />
                                              <span>Incorrect (0)</span>
                                            </>
                                          )}
                                        </span>
                                      )}
                                    </div>

                                    {/* Question Text */}
                                    <p className="text-xs sm:text-sm font-semibold text-[#242725] leading-relaxed">
                                      {q.question}
                                    </p>

                                    {/* 4 Multiple-Choice Options */}
                                    <div className="space-y-2 pt-1">
                                      {q.options.map((option, optIdx) => {
                                        const letter = String.fromCharCode(65 + optIdx);
                                        const isThisSelected = userSelected === option;
                                        const isThisCorrect = option === q.correctAnswer;

                                        let optionStyle = 'bg-white hover:bg-[#FAF8F5] border-[#E6E1D8] text-[#242725]';
                                        let letterBadgeStyle = 'bg-[#FAF8F5] text-[#6D736E] border-[#E6E1D8]';

                                        if (quizSubmitted) {
                                          if (isThisCorrect) {
                                            // Highlight correct answer in sage green
                                            optionStyle = 'bg-[#EDF3EE] border-2 border-[#5B8266] text-[#242725] font-medium shadow-2xs';
                                            letterBadgeStyle = 'bg-[#5B8266] text-white border-[#5B8266]';
                                          } else if (isThisSelected && !isThisCorrect) {
                                            // Highlight incorrect user choice in muted red
                                            optionStyle = 'bg-[#FDF2F2] border-2 border-[#F87171] text-[#991B1B] font-medium shadow-2xs';
                                            letterBadgeStyle = 'bg-[#F87171] text-white border-[#F87171]';
                                          } else {
                                            optionStyle = 'bg-white/50 border-[#E6E1D8] text-[#8E948F] opacity-70';
                                            letterBadgeStyle = 'bg-gray-100 text-[#8E948F] border-transparent';
                                          }
                                        } else if (isThisSelected) {
                                          optionStyle = 'bg-[#EDF3EE] border-2 border-[#5B8266] text-[#242725] font-semibold shadow-2xs';
                                          letterBadgeStyle = 'bg-[#5B8266] text-white border-[#5B8266]';
                                        }

                                        return (
                                          <button
                                            key={optIdx}
                                            type="button"
                                            disabled={quizSubmitted}
                                            onClick={() => handleSelectAnswer(q.id, option)}
                                            className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer ${optionStyle} ${
                                              quizSubmitted ? 'cursor-default' : ''
                                            }`}
                                          >
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                              <span
                                                className={`w-5 h-5 rounded-md border font-mono text-[11px] font-bold flex items-center justify-center shrink-0 transition ${letterBadgeStyle}`}
                                              >
                                                {letter}
                                              </span>
                                              <span className="leading-snug break-words">{option}</span>
                                            </div>

                                            {quizSubmitted && isThisCorrect && (
                                              <span className="text-[11px] font-bold text-[#15803D] shrink-0 flex items-center gap-1 font-mono">
                                                <Check className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Correct</span>
                                              </span>
                                            )}
                                            {quizSubmitted && isThisSelected && !isThisCorrect && (
                                              <span className="text-[11px] font-bold text-[#991B1B] shrink-0 flex items-center gap-1 font-mono">
                                                <X className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Incorrect</span>
                                              </span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {/* Explanation if submitted */}
                                    {quizSubmitted && q.explanation && (
                                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-xs text-[#525853] space-y-1">
                                        <div className="font-bold text-[#242725] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                          <Lightbulb className="w-3.5 h-3.5 text-[#5B8266]" />
                                          <span>First-Principles Explanation</span>
                                        </div>
                                        <p className="leading-relaxed text-[#373C38]">{q.explanation}</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Quiz Actions (Submit / Retake) */}
                              {!quizSubmitted ? (
                                <div className="pt-2">
                                  <button
                                    type="button"
                                    onClick={handleSubmitQuiz}
                                    disabled={Object.keys(selectedAnswers).length === 0}
                                    className="w-full py-3.5 px-6 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] disabled:opacity-40 text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition cursor-pointer shadow-lg hover:shadow-xl"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>
                                      Submit Quiz ({Object.keys(selectedAnswers).length} of {quizQuestions.length} answered)
                                    </span>
                                  </button>
                                </div>
                              ) : (
                                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                  <button
                                    type="button"
                                    onClick={handleRetakeQuiz}
                                    className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#D9D2C5] text-[#242725] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                                  >
                                    <RotateCcw className="w-4 h-4 text-[#6D736E]" />
                                    <span>Retake Current Quiz</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleGenerateQuiz}
                                    disabled={isQuizLoading}
                                    className="flex-1 py-3 px-4 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                                  >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Generate New 5-Question Quiz</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Page Bottom Footer */}
                    <div className="pt-4 mt-6 border-t border-[#E6E1D8] flex items-center justify-between text-[11px] font-mono text-[#8E948F]">
                      <span>Mind Mirror • Folio B</span>
                      <span>Page {activePage} of 5 (Right Leaf)</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          MOBILE BOTTOM NAVIGATION BAR (FIXED ON MOBILE SCREENS < md:)
         ───────────────────────────────────────────────────────────────── */}
      {isCoverOpen && (
        <nav
          aria-label="Mobile notebook navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E6E1D8] px-2 py-1.5 flex items-center justify-around md:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.08)] select-none"
        >
          <button
            type="button"
            onClick={() => handleTurnPage(1)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-xl transition-all cursor-pointer ${
              activePage === 1
                ? 'bg-[#EDF3EE] text-[#43634D] font-bold shadow-2xs border border-[#C8D7CB]'
                : 'text-[#6D736E] hover:text-[#242725]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 tracking-tight">Material</span>
          </button>

          <button
            type="button"
            onClick={() => handleTurnPage(2)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-xl transition-all cursor-pointer ${
              activePage === 2
                ? 'bg-[#EDF3EE] text-[#43634D] font-bold shadow-2xs border border-[#C8D7CB]'
                : 'text-[#6D736E] hover:text-[#242725]'
            }`}
          >
            <Sigma className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 tracking-tight">Theory</span>
          </button>

          <button
            type="button"
            onClick={() => handleTurnPage(3)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-xl transition-all cursor-pointer ${
              activePage === 3
                ? 'bg-[#EDF3EE] text-[#43634D] font-bold shadow-2xs border border-[#C8D7CB]'
                : 'text-[#6D736E] hover:text-[#242725]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 tracking-tight">Nexus AI</span>
          </button>

          <button
            type="button"
            onClick={() => handleTurnPage(4)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-xl transition-all cursor-pointer ${
              activePage === 4
                ? 'bg-[#EDF3EE] text-[#43634D] font-bold shadow-2xs border border-[#C8D7CB]'
                : 'text-[#6D736E] hover:text-[#242725]'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 tracking-tight">Notes</span>
          </button>

          <button
            type="button"
            onClick={() => handleTurnPage(5)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-xl transition-all cursor-pointer ${
              activePage === 5
                ? 'bg-[#EDF3EE] text-[#43634D] font-bold shadow-2xs border border-[#C8D7CB]'
                : 'text-[#6D736E] hover:text-[#242725]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 tracking-tight">Quiz</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default function NotebookPage() {
  return (
    <ErrorBoundary fallbackTitle="Notebook Study Folio Error">
      <NotebookPageContent />
    </ErrorBoundary>
  );
}

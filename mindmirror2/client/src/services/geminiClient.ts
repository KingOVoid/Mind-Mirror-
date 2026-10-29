import { GoogleGenAI } from '@google/genai';
import type { QuizQuestion, DocumentAnalysisResult } from '../api/ai';

const API_KEY =
  (import.meta.env.VITE_GEMINI_API_KEY as string) ||
  (import.meta.env.GEMINI_API_KEY as string) ||
  '';

const MODEL_NAME = 'gemini-3.8-flash';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
}

const NEXUS_SYSTEM_INSTRUCTION = `You are Nexus, an elite engineering professor, AI researcher, and open-source methodology expert serving as the Zen Nature Study Copilot for Mind Mirror.
Your baseline curriculum consists of:
1. Course 23N502 Artificial Intelligence — Unit 1: Introduction & Philosophical Foundations (Descartes, 4 views of AI: Thinking/Acting Humanly/Rationally, Turing Test & Total Turing Test, flying-machine analogy, cognitive science vs neuroscience, Aristotle's syllogisms and laws of thought, 7 interdisciplinary roots, state of the art).
2. Course 23N502 Artificial Intelligence — Unit 1-2: Intelligent Agents & Task Environments (Agent function f: P* -> A, percept sequences, Vacuum Cleaner World toy problem, Rational Agent definition, PEAS framework for Taxi driver, Medical diagnosis, Satellite, Robot, Refinery, English teacher; 6 environment dimensions: Observability, Determinism, Episodic/Sequential, Static/Dynamic, Discrete/Continuous, Single/Multi-agent; 4 agent architectures: Simple reflex, Model-based, Goal-based, Utility-based).
3. Course 23N503: Open Source Principles & Methodology (OSS definition, 10 OSD principles, FSF & 4 Freedoms of Free Software, Permissive vs Copyleft licenses, MIT, Apache 2.0, BSD, GPL 2.0/3.0, BSD history 1977-present, GNU project 1983 & Linux 1991, OSI 1998 & 5-step license approval, Open Standards & 5 principles, 6-stage OSS development lifecycle).

Style Guidelines:
- Authoritative, serene, clear, and mathematically precise.
- Format equations using standard LaTeX ($...$ and $$...$$).
- Always ground answers in first principles, referencing the student's study material and lecture concepts directly.`;

export async function askNexusCopilot(query: string, context?: string): Promise<string> {
  try {
    const ai = getAI();
    const prompt = context
      ? `[Study Material Context]:\n${context.slice(0, 3000)}\n\n[Student Question]:\n${query}`
      : query;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: NEXUS_SYSTEM_INSTRUCTION,
      },
    });

    const reply = response.text?.trim();
    if (reply) return reply;
  } catch (err: any) {
    console.warn('[Gemini Client] Direct call failed:', err?.message || err);
  }

  return `### First-Principles Synthesis: "${query}"\n\n1. **Boundary & Definition**: Identify state variables, environment properties, and governing constraints.\n2. **Theoretical Formulation**: Map percepts to rational actions or apply open-source licensing principles.\n3. **Evaluation**: Test against performance measures (PEAS) or license compliance standards.`;
}

export async function generateNexusQuiz(
  topic: string,
  studyMaterialText?: string
): Promise<{ questions: QuizQuestion[]; topic: string; source: 'gemini' | 'curriculum-engine' }> {
  try {
    const ai = getAI();
    const context = (studyMaterialText || '').slice(0, 4000);

    const systemInstruction = `${NEXUS_SYSTEM_INSTRUCTION}
Generate a rigorous multiple-choice practice quiz with exactly 5 conceptual questions on the topic "${topic}".
Return ONLY valid JSON with this exact schema:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Clear explanation of why this answer is correct."
    }
  ]
}
Requirements:
1. Exactly 5 questions.
2. Exactly 4 options per question.
3. "correctAnswer" must match one of the items in "options" exactly.
4. Do not wrap in markdown code blocks.`;

    const prompt = `Topic: "${topic}"\n\nReference Material:\n${context || 'Intelligent Agents, Task Environments, and Open Source Methodology.'}\n\nGenerate the 5-question JSON quiz.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { systemInstruction },
    });

    const text = response.text?.trim() || '';
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
      const validated: QuizQuestion[] = parsed.questions.slice(0, 5).map((q: any, i: number) => ({
        id: q.id || `q${i + 1}`,
        question: q.question || `Question ${i + 1} regarding ${topic}`,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer || (Array.isArray(q.options) ? q.options[0] : 'Option A'),
        explanation: q.explanation || `Governed by core principles in ${topic}.`,
      }));

      return {
        questions: validated,
        topic,
        source: 'gemini',
      };
    }
  } catch (err: any) {
    console.warn('[Gemini Client] Quiz generation error:', err?.message || err);
  }

  // Baseline fallback quizzes tailored to the new course units
  if (topic.toLowerCase().includes('open source') || topic.toLowerCase().includes('license') || topic.toLowerCase().includes('gnu')) {
    return {
      topic,
      source: 'curriculum-engine',
      questions: [
        {
          id: 'q1',
          question: 'According to the Free Software Foundation (FSF), which freedom represents "Freedom 0"?',
          options: [
            'The freedom to run the program for any purpose',
            'The freedom to study how the program works and modify it',
            'The freedom to redistribute copies to help others',
            'The freedom to distribute copies of modified versions',
          ],
          correctAnswer: 'The freedom to run the program for any purpose',
          explanation: 'Freedom 0 is the freedom to run the program as you wish, for any purpose, without restriction.',
        },
        {
          id: 'q2',
          question: 'What distinguishes Copyleft licenses (such as GNU GPL) from Permissive licenses (such as MIT or BSD)?',
          options: [
            'Copyleft requires derivative works and modifications to be licensed under the same terms',
            'Copyleft permits proprietary closed-source distribution of modified binaries',
            'Permissive licenses forbid the commercial sale of copies',
            'Permissive licenses require source code modifications to be kept strictly confidential',
          ],
          correctAnswer: 'Copyleft requires derivative works and modifications to be licensed under the same terms',
          explanation: 'Copyleft enforces reciprocity: any derived code must be released under the same open-source license.',
        },
        {
          id: 'q3',
          question: 'Which historical release in 1983 made BSD particularly popular for internet development?',
          options: [
            '4.2BSD which introduced the TCP/IP networking stack',
            'The first release of GCC by Richard Stallman',
            'The release of the Linux kernel by Linus Torvalds',
            'Netscape releasing the Mozilla browser source code',
          ],
          correctAnswer: '4.2BSD which introduced the TCP/IP networking stack',
          explanation: 'In 1983, 4.2BSD implemented the standard TCP/IP networking stack, forming the backbone of early Internet infrastructure.',
        },
        {
          id: 'q4',
          question: 'In the Open Source Initiative (OSI) license approval process, how long is the mandatory public community discussion period?',
          options: ['At least 30 days', '7 days', '6 months', '90 days'],
          correctAnswer: 'At least 30 days',
          explanation: 'The OSI requires that a submitted license proposal be discussed publicly by the open-source community for at least 30 days before the Board makes a decision.',
        },
        {
          id: 'q5',
          question: 'Which of the following is NOT one of the 10 Principles of the Open Source Definition (OSD)?',
          options: [
            'The license must require payments for commercial deployment',
            'Free Redistribution without royalties',
            'Integrity of the Author’s Source Code',
            'The license must be technology-neutral',
          ],
          correctAnswer: 'The license must require payments for commercial deployment',
          explanation: 'Principle 1 of OSD mandates Free Redistribution — licenses cannot charge fees or royalties for distribution.',
        },
      ],
    };
  }

  // AI & Intelligent Agents default fallback quiz
  return {
    topic,
    source: 'curriculum-engine',
    questions: [
      {
        id: 'q1',
        question: 'In the mathematical formalization of an intelligent agent, how is the agent function formally defined?',
        options: [
          'A mapping from percept sequences to actions: f: P* -> A',
          'A fixed lookup table mapping single instantaneous percepts to utility states: f: P -> U',
          'A mapping from internal sensors directly to actuators without environment feedback',
          'An unconstrained stochastic process independent of prior history',
        ],
        correctAnswer: 'A mapping from percept sequences to actions: f: P* -> A',
        explanation: 'An agent function maps any given percept sequence P* (complete history of everything perceived to date) to an action A.',
      },
      {
        id: 'q2',
        question: 'Under the PEAS framework for an automated taxi driver, which of the following represents an ACTUATOR?',
        options: [
          'Steering wheel, accelerator, brake, and display',
          'Cameras, sonar, speedometer, and GPS',
          'Safe, fast, legal, and comfortable trip',
          'Roads, traffic, pedestrians, and passengers',
        ],
        correctAnswer: 'Steering wheel, accelerator, brake, and display',
        explanation: 'Actuators are the mechanisms by which an agent affects the world — steering, braking, accelerator, and screen displays.',
      },
      {
        id: 'q3',
        question: 'Why is the task environment of Chess with a clock classified as "Semi-dynamic"?',
        options: [
          'The board state does not change while thinking, but the available time (score) diminishes continuously',
          'The pieces randomly change locations during deliberation',
          'Opponent pieces are partially hidden behind fog-of-war',
          'Moves have continuous infinite angle coordinates',
        ],
        correctAnswer: 'The board state does not change while thinking, but the available time (score) diminishes continuously',
        explanation: 'In semi-dynamic environments, the environment itself does not change while the agent deliberates, but the agent’s performance score decreases with time.',
      },
      {
        id: 'q4',
        question: 'What is the primary difference between a Goal-Based Agent and a Utility-Based Agent?',
        options: [
          'A Utility-Based agent evaluates how desirable different goal states are using a real-valued utility function',
          'A Goal-Based agent only uses condition-action reflex rules without memory',
          'A Utility-Based agent can only operate in deterministic, fully observable environments',
          'A Goal-Based agent ignores future consequences of its current action',
        ],
        correctAnswer: 'A Utility-Based agent evaluates how desirable different goal states are using a real-valued utility function',
        explanation: 'Utility-based agents measure trade-offs between competing goals and degrees of happiness/performance using a utility function U(s).',
      },
      {
        id: 'q5',
        question: 'In the "Four Views of AI" framework by Russell & Norvig, which quadrant represents the modern dominant approach in AI engineering?',
        options: [
          'Acting Rationally (Rational Agents that achieve best expected outcomes)',
          'Thinking Humanly (Cognitive Science modeling brain circuits)',
          'Thinking Rationally (Pure Aristotelian Syllogistic Logic)',
          'Acting Humanly (Passing the classical Turing Test)',
        ],
        correctAnswer: 'Acting Rationally (Rational Agents that achieve best expected outcomes)',
        explanation: 'Modern AI primarily focuses on Acting Rationally: designing agents that maximize expected performance measures under uncertainty.',
      },
    ],
  };
}

export async function analyzeStudyDocument(
  documentText: string,
  fileName?: string,
  topic?: string
): Promise<DocumentAnalysisResult> {
  const name = fileName || 'Course Material';
  const subject = topic || 'Artificial Intelligence & Open Source';

  try {
    const ai = getAI();
    const prompt = `Please analyze this course study document "${name}" on topic "${subject}":\n\n${documentText.slice(0, 8000)}\n\nProvide an authoritative first-principles executive summary, 4-5 high-yield bullet takeaways, and any governing formulas or licensing principles.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { systemInstruction: NEXUS_SYSTEM_INSTRUCTION },
    });

    const reply = response.text?.trim();
    if (reply) {
      const lines = reply.split('\n');
      const takeaways: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if ((trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) && trimmed.length > 15) {
          takeaways.push(trimmed.replace(/^[-*\d.]+\s*/, ''));
        }
      }
      return {
        summary: reply,
        keyTakeaways: takeaways.slice(0, 5),
        fileName: name,
        source: 'gemini',
      };
    }
  } catch (err: any) {
    console.warn('[Gemini Client] Document analysis error:', err?.message || err);
  }

  return {
    summary: `### Executive Study Analysis: ${name}\n\nThis material covers foundational principles in **${subject}**.\n\n- **Formal Definitions**: Mathematical models mapping percept sequences to actions and the 10 principles of open source.\n- **Framework Analysis**: Task environment dimensions (PEAS) and licensing reciprocity (Copyleft vs Permissive).\n- **Architectural Paradigms**: From simple reflex to utility-based rational agents and community-governed software development.`,
    keyTakeaways: [
      `Formal formulation and boundaries of ${subject}`,
      'PEAS specification and task environment classifications',
      'Distinction between Permissive (MIT/BSD/Apache) and Copyleft (GPL) licensing',
      'Rational agent performance maximization vs omniscience',
    ],
    fileName: name,
    source: 'curriculum-engine',
  };
}

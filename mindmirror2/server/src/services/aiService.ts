/**
 * Mind Mirror — Zen Study Copilot & Engineering Curriculum Engine
 * ---------------------------------------------------------------
 * Powered by the official @google/genai SDK (Google Gemini API).
 * Generates tailored study plans, provides conversational study copilot guidance,
 * breaks down complex engineering coursework, and explains questions from first principles.
 *
 * Includes an extensive offline curriculum engine fallback so the platform remains
 * 100% operational even when offline or before GEMINI_API_KEY is configured.
 */
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

export interface EngineeringPlanItem {
  phase: string;
  duration: string;
  title: string;
  coreConcepts: string[];
  governingFormulas: string[];
  appliedProblems: string[];
  activeRecallPrompt: string;
}

export interface EngineeringStudyPlanResult {
  courseworkTitle: string;
  studentLevel: string;
  hoursPerWeek: number;
  totalWeeks: number;
  overview: string;
  modules: EngineeringPlanItem[];
  highYieldCheckpoints: string[];
  source: 'gemini' | 'curriculum-engine';
}

// Initialize Gemini Client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err: any) {
    console.warn('[AI Engine] Failed to initialize GoogleGenAI client:', err.message);
    return null;
  }
}

/** Call official Google GenAI Gemini API */
async function callGemini(prompt: string, systemInstruction?: string): Promise<string | null> {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.info('[AI Engine] No GEMINI_API_KEY configured — using Zen Nature curriculum engine fallback.');
    return null;
  }

  try {
    const ai = getGeminiClient() || new GoogleGenAI({ apiKey });
    const model = env.GEMINI_MODEL || 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: systemInstruction
        ? {
            systemInstruction,
          }
        : undefined,
    });

    const text = response.text;
    return text ? text.trim() : null;
  } catch (err: any) {
    console.warn(`[AI Engine] Gemini API error (${err.message}) — using curriculum fallback.`);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// APPLIED ENGINEERING CURRICULUM FALLBACK DATABASE
// ────────────────────────────────────────────────────────────────────────────

const ENGINEERING_PRESETS: Record<string, Omit<EngineeringStudyPlanResult, 'source'>> = {
  'control-systems': {
    courseworkTitle: 'Applied Control Systems & State-Space Engineering',
    studentLevel: 'Undergraduate / Graduate Core',
    hoursPerWeek: 8,
    totalWeeks: 5,
    overview:
      'Rigorous engineering breakdown of dynamic system modeling, root locus synthesis, frequency-domain stability margins, and modern state-space observer design.',
    modules: [
      {
        phase: 'Week 1',
        duration: '8 Hours',
        title: 'Mathematical Modeling & Transfer Function Formulation',
        coreConcepts: [
          'Laplace transforms of electromechanical systems',
          'Block diagram algebra and Mason’s Gain Formula',
          'Poles, zeros, and transient response metrics (overshoot, rise time, settling time)',
        ],
        governingFormulas: [
          'G(s) = \\frac{C(s)}{R(s)} = \\frac{\\sum P_k \\Delta_k}{\\Delta}',
          '\\omega_d = \\omega_n \\sqrt{1 - \\zeta^2}, \\quad M_p = e^{-\\frac{\\pi\\zeta}{\\sqrt{1-\\zeta^2}}}',
        ],
        appliedProblems: [
          'Derive governing equations of motion for a quarter-car active suspension model and find its transfer function.',
          'Calculate damping ratio and natural frequency required for < 5% overshoot and < 1.2s settling time.',
        ],
        activeRecallPrompt: 'How does moving an open-loop pole to the left affect transient peak time and settling time?',
      },
      {
        phase: 'Week 2',
        duration: '8 Hours',
        title: 'Root Locus Technique & Transient Compensation',
        coreConcepts: [
          'Evans root locus rules, asymptotes, breakaway points, and jw-axis crossings',
          'Lead and lag compensator design based on transient specifications',
          'Steady-state error constants (Kp, Kv, Ka) and system type classification',
        ],
        governingFormulas: [
          '1 + K G(s)H(s) = 0 \\implies |G(s)H(s)| = \\frac{1}{K}, \\quad \\angle G(s)H(s) = (2k+1)180^\\circ',
          'G_c(s) = \\frac{s + 1/T}{s + 1/(\\alpha T)}, \\quad \\alpha < 1 \\text{ (Lead)}, \\alpha > 1 \\text{ (Lag)}',
        ],
        appliedProblems: [
          'Synthesize a lead-lag compensator for an inverted pendulum cart to achieve 45 degrees phase margin.',
          'Compute breakaway points and gain bounds for stability via Routh-Hurwitz array.',
        ],
        activeRecallPrompt: 'Why does adding a zero pull root locus branches toward the left half-plane?',
      },
      {
        phase: 'Week 3',
        duration: '8 Hours',
        title: 'Frequency-Domain Stability (Bode & Nyquist Criterion)',
        coreConcepts: [
          'Bode plot construction, asymptotic approximations, and corner frequencies',
          'Nyquist stability criterion, encirclements of (-1, j0), and Cauchy argument principle',
          'Gain margin (GM) and phase margin (PM) robustness analysis',
        ],
        governingFormulas: [
          'GM = -20\\log_{10}|G(j\\omega_{180})|, \\quad PM = 180^\\circ + \\angle G(j\\omega_c)',
          'Z = N + P \\quad (Z = \\text{closed-loop RHP poles}, N = \\text{encirclements of } -1)',
        ],
        appliedProblems: [
          'Assess stability of a non-minimum phase system with a right-half-plane zero using the Nyquist diagram.',
          'Tune a PID controller using Ziegler-Nichols frequency response oscillation frequency.',
        ],
        activeRecallPrompt: 'What is the physical significance of gain crossover frequency in terms of system bandwidth?',
      },
      {
        phase: 'Week 4',
        duration: '8 Hours',
        title: 'Modern State-Space Representation & Controllability',
        coreConcepts: [
          'State equation formulation: dx/dt = Ax + Bu, y = Cx + Du',
          'State transition matrix, matrix exponential e^(At), and Jordan canonical form',
          'Kalman controllability and observability matrices',
        ],
        governingFormulas: [
          '\\dot{\\mathbf{x}} = \\mathbf{A}\\mathbf{x} + \\mathbf{B}\\mathbf{u}, \\quad \\mathbf{y} = \\mathbf{C}\\mathbf{x} + \\mathbf{D}\\mathbf{u}',
          '\\mathcal{C} = [\\mathbf{B} \\quad \\mathbf{A}\\mathbf{B} \\quad \\dots \\quad \\mathbf{A}^{n-1}\\mathbf{B}], \\quad \\text{rank}(\\mathcal{C}) = n',
        ],
        appliedProblems: [
          'Convert a third-order differential equation into controllable and observable canonical forms.',
          'Verify if an aircraft pitch-attitude model is fully controllable from rudder deflection input.',
        ],
        activeRecallPrompt: 'If rank(C) < n, what does that mean regarding our ability to steer states from x(0) to x(t)?',
      },
      {
        phase: 'Week 5',
        duration: '8 Hours',
        title: 'Full-State Feedback & Luenberger Observer Synthesis',
        coreConcepts: [
          'Ackermann’s formula for pole placement regulator design (u = -Kx)',
          'Luenberger state observer design and estimation error dynamics',
          'Separation Principle: designing controller and observer independently',
        ],
        governingFormulas: [
          '\\mathbf{K} = [0 \\dots 1] \\mathcal{C}^{-1} \\phi_d(\\mathbf{A}) \\quad (\\text{Ackermann})',
          '\\dot{\\hat{\\mathbf{x}}} = \\mathbf{A}\\hat{\\mathbf{x}} + \\mathbf{B}\\mathbf{u} + \\mathbf{L}(\\mathbf{y} - \\mathbf{C}\\hat{\\mathbf{x}})',
        ],
        appliedProblems: [
          'Design an observer with poles placed 4x faster than closed-loop regulator poles for an industrial robotic arm.',
          'Simulate closed-loop disturbance rejection under measurement noise.',
        ],
        activeRecallPrompt: 'Why are observer poles chosen to be faster than controller poles?',
      },
    ],
    highYieldCheckpoints: [
      'Master Routh-Hurwitz row generation including all-zero and zero-first-element special cases.',
      'Remember: Phase Margin is measured at Gain Crossover (0 dB), Gain Margin at Phase Crossover (-180°).',
      'Always verify det(sI - A) = 0 matches your system characteristic equation in state-space.',
    ],
  },
  'finite-element-analysis': {
    courseworkTitle: 'Finite Element Analysis (FEA) for Structural & Thermal Engineering',
    studentLevel: 'Upper Undergraduate / Professional',
    hoursPerWeek: 10,
    totalWeeks: 4,
    overview:
      'First-principles matrix formulation of 1D, 2D, and 3D continuum elements, isoparametric transformations, Gaussian numerical quadrature, and von Mises failure criteria.',
    modules: [
      {
        phase: 'Week 1',
        duration: '10 Hours',
        title: 'Direct Stiffness Method & 1D Bar/Truss Elements',
        coreConcepts: [
          'Potential energy minimization and Rayleigh-Ritz variational formulation',
          'Element stiffness matrix [k] for axially loaded bar elements',
          'Coordinate rotation transformation matrices [T] and global assembly [K]{U} = {F}',
        ],
        governingFormulas: [
          '\\mathbf{k}^e = \\frac{A E}{L} \\begin{bmatrix} 1 & -1 \\\\ -1 & 1 \\end{bmatrix}, \\quad \\mathbf{K} = \\sum \\mathbf{T}^T \\mathbf{k}^e \\mathbf{T}',
          '\\Pi = U - W = \\frac{1}{2}\\int_V \\boldsymbol{\\sigma}^T \\boldsymbol{\\varepsilon} dV - \\int_V \\mathbf{u}^T \\mathbf{b} dV - \\int_S \\mathbf{u}^T \\mathbf{t} dS',
        ],
        appliedProblems: [
          'Assemble global stiffness matrix and compute nodal deflections for a 5-member bridge truss.',
          'Incorporate homogeneous and non-homogeneous Dirichlet boundary conditions via penalty and elimination methods.',
        ],
        activeRecallPrompt: 'What causes the global stiffness matrix [K] to be singular before boundary conditions are enforced?',
      },
      {
        phase: 'Week 2',
        duration: '10 Hours',
        title: 'Beam Elements, Flexural Rigidity & Frame Structures',
        coreConcepts: [
          'Euler-Bernoulli vs Timoshenko beam theory (shear deformation effects)',
          'Hermite cubic shape functions ensuring C1 continuity',
          '4-DOF and 6-DOF planar beam element formulation',
        ],
        governingFormulas: [
          'N_1(\\xi) = \\frac{1}{4}(1-\\xi)^2(2+\\xi), \\quad N_2(\\xi) = \\frac{L}{8}(1-\\xi)^2(1+\\xi)',
          '\\mathbf{k}_{\\text{beam}} = \\frac{EI}{L^3} \\begin{bmatrix} 12 & 6L & -12 & 6L \\\\ 6L & 4L^2 & -6L & 2L^2 \\\\ -12 & -6L & 12 & -6L \\\\ 6L & 2L^2 & -6L & 4L^2 \\end{bmatrix}',
        ],
        appliedProblems: [
          'Calculate mid-span deflection and reaction moments of a propped cantilever beam with uniform distributed load.',
          'Model combined axial and bending interaction in an industrial portal crane frame.',
        ],
        activeRecallPrompt: 'Why can linear Lagrange shape functions NOT be used for Euler-Bernoulli beam elements?',
      },
      {
        phase: 'Week 3',
        duration: '10 Hours',
        title: '2D Continuum Elements & Isoparametric Formulations',
        coreConcepts: [
          'Constant Strain Triangle (CST) and Linear Strain Triangle (LST)',
          '4-node and 8-node quadrilateral isoparametric elements (Q4 and Q8)',
          'Jacobian transformation matrix [J] and Gauss-Legendre numerical quadrature',
        ],
        governingFormulas: [
          '\\mathbf{J} = \\begin{bmatrix} \\frac{\\partial x}{\\partial \\xi} & \\frac{\\partial y}{\\partial \\xi} \\\\ \\frac{\\partial x}{\\partial \\eta} & \\frac{\\partial y}{\\partial \\eta} \\end{bmatrix}, \\quad \\mathbf{B} = \\mathbf{L} \\mathbf{N}',
          '\\mathbf{k}^e = \\int_{-1}^1 \\int_{-1}^1 \\mathbf{B}^T \\mathbf{D} \\mathbf{B} \\det(\\mathbf{J}) d\\xi d\\eta \\approx \\sum_{i=1}^n \\sum_{j=1}^n w_i w_j \\mathbf{B}^T \\mathbf{D} \\mathbf{B} \\det(\\mathbf{J})',
        ],
        appliedProblems: [
          'Derive the Jacobian for a distorted Q4 element and check for negative jacobian determinant errors.',
          'Perform a 2x2 Gauss quadrature integration to compute stiffness of a plane-stress plate with a hole.',
        ],
        activeRecallPrompt: 'What phenomenon occurs when using full integration with Q4 elements in incompressible bending (shear locking)?',
      },
      {
        phase: 'Week 4',
        duration: '10 Hours',
        title: 'Stress Recovery, Convergence & Structural Failure Metrics',
        coreConcepts: [
          'Stress calculation at Gauss integration points vs nodal extrapolation (Superconvergent Patch Recovery)',
          'von Mises equivalent stress and Tresca maximum shear yield criteria',
          'Mesh refinement strategies (h-refinement vs p-refinement) and Richardson extrapolation',
        ],
        governingFormulas: [
          '\\sigma_v = \\sqrt{\\frac{1}{2}[(\\sigma_1-\\sigma_2)^2 + (\\sigma_2-\\sigma_3)^2 + (\\sigma_3-\\sigma_1)^2]}',
          '\\text{Error Estimate: } \\|e\\| = \\left( \\int_V (\\boldsymbol{\\sigma}^* - \\boldsymbol{\\sigma}_h)^T \\mathbf{D}^{-1} (\\boldsymbol{\\sigma}^* - \\boldsymbol{\\sigma}_h) dV \\right)^{1/2}',
        ],
        appliedProblems: [
          'Determine the stress concentration factor Kt near a circular notch and evaluate fatigue safety margins.',
          'Perform mesh convergence study plotting peak von Mises stress vs element count to prove asymptotic leveling.',
        ],
        activeRecallPrompt: 'Why are stresses calculated most accurately at Gauss points rather than at element boundaries?',
      },
    ],
    highYieldCheckpoints: [
      'Plane stress assumes sigma_z = 0 (thin plates); plane strain assumes epsilon_z = 0 (thick dams/pipes).',
      'Always check the determinant of Jacobian: det(J) <= 0 indicates badly inverted/folded mesh elements.',
      'Energy norm convergence guarantees bounding of strain energy from below for displacement-based FEA.',
    ],
  },
};

export const aiService = {
  isEnabled: true,

  /** Returns list of available engineering presets for the frontend */
  getEngineeringPresets(): Array<{ id: string; title: string; weeks: number }> {
    return Object.entries(ENGINEERING_PRESETS).map(([id, p]) => ({
      id,
      title: p.courseworkTitle,
      weeks: p.totalWeeks,
    }));
  },

  /** Zen Study Copilot conversational assistant using Gemini */
  async copilotChat(input: {
    message: string;
    history?: Array<{ role: 'user' | 'model'; text: string }>;
  }): Promise<{ reply: string; source: 'gemini' | 'curriculum-engine' }> {
    const zenSystemPrompt = `You are the Zen Nature Study Copilot for Mind Mirror.
Your role: A patient, supportive engineering mentor and focus companion.
Style: Clear, calming, insightful, and mathematically grounded.
Guidelines:
1. Explain engineering and technical concepts from first principles with gentle clarity.
2. Provide governing equations in standard markdown/LaTeX where appropriate.
3. Keep the tone grounded, focused, and free of hype.
4. Structure complex explanations into clean, numbered conceptual steps.`;

    const prompt = input.message;
    const geminiText = await callGemini(prompt, zenSystemPrompt);

    if (geminiText) {
      return { reply: geminiText, source: 'gemini' };
    }

    // Grounded Zen Nature fallback response
    return {
      reply: `### First-Principles Synthesis: "${input.message}"\n\nTo master this concept with calm clarity, let us break it down into core steps:\n\n1. **Define the Physical Boundaries**: Establish coordinate frames, identify invariant conserved quantities (mass, momentum, energy), and state boundary constraints.\n2. **Formulate Governing Equations**: Express the system behavior mathematically and verify dimensional consistency.\n3. **Test Asymptotic Limits**: Evaluate the behavior as parameters approach zero or infinity to confirm physical validity.\n\nTake a slow breath, sketch the system diagram, and test your understanding with active recall.`,
      source: 'curriculum-engine',
    };
  },

  /** Explains why an answer was wrong or breaks down a question from first principles */
  async explainAnswer(input: {
    questionText: string;
    correctAnswer: any;
    selectedAnswer: any;
    storedExplanation?: string | null;
  }): Promise<{ explanation: string; source: 'gemini' | 'curriculum-engine' | 'stored' }> {
    const prompt = `You are a calm, expert engineering tutor. Explain in 2-3 clear, insightful sentences why this question is solved this way and where the reasoning diverges:
Question: ${input.questionText}
Correct Answer: ${JSON.stringify(input.correctAnswer)}
Student's Response: ${JSON.stringify(input.selectedAnswer)}
Explain the physical/mathematical intuition directly and succinctly.`;

    const geminiText = await callGemini(prompt);
    if (geminiText) {
      return { explanation: geminiText, source: 'gemini' };
    }

    if (input.storedExplanation) {
      return { explanation: input.storedExplanation, source: 'stored' };
    }

    return {
      explanation: `The principle governing this question is centered on ${JSON.stringify(
        input.correctAnswer
      )}. Review the fundamental conservation laws and boundary condition assumptions for this concept.`,
      source: 'curriculum-engine',
    };
  },

  /** Generates a tailored engineering coursework breakdown study plan */
  async generateEngineeringStudyPlan(input: {
    courseworkTitle: string;
    studentLevel?: string;
    hoursPerWeek?: number;
    presetId?: string;
  }): Promise<EngineeringStudyPlanResult> {
    const titleLower = input.courseworkTitle.toLowerCase().trim();
    const presetKey =
      input.presetId ||
      Object.keys(ENGINEERING_PRESETS).find(
        (key) =>
          titleLower.includes(key.replace('-', ' ')) ||
          titleLower.includes(key.split('-')[0]) ||
          ENGINEERING_PRESETS[key].courseworkTitle.toLowerCase().includes(titleLower)
      );

    const prompt = `You are an engineering curriculum architect. Create a tailored 4-week Zen Nature study plan for the engineering coursework: "${input.courseworkTitle}".
Target Student Level: ${input.studentLevel || 'Undergraduate Engineering'}.
Dedicated study time: ${input.hoursPerWeek || 8} hours/week.

Structure with:
1. Executive Course Overview
2. 4-Week Breakdown with Module Titles, Core Concepts, Governing Formulas, and Applied Practice Problems
3. High-Yield Checkpoints for deep retention.`;

    const geminiText = await callGemini(prompt);
    if (geminiText) {
      return {
        courseworkTitle: input.courseworkTitle,
        studentLevel: input.studentLevel || 'Undergraduate Core',
        hoursPerWeek: input.hoursPerWeek || 8,
        totalWeeks: 4,
        overview: `Zen Nature Curriculum generated via Google Gemini for ${input.courseworkTitle}.`,
        modules: [
          {
            phase: 'Gemini AI Study Syllabus',
            duration: `${input.hoursPerWeek || 8} Hours/Week`,
            title: `${input.courseworkTitle} — Structured Roadmap`,
            coreConcepts: [geminiText.slice(0, 500)],
            governingFormulas: ['Refer to the synthesized module checkpoints above'],
            appliedProblems: ['Work through step-by-step problem derivations with pencil and paper'],
            activeRecallPrompt: 'Practice deriving the central equations without looking at reference sheets.',
          },
        ],
        highYieldCheckpoints: [
          'Verify boundary conditions and dimensional consistency before solving.',
          'Always validate analytical solutions against physical limits.',
          'Practice calm, spaced repetition drills weekly.',
        ],
        source: 'gemini',
      };
    }

    // Use curriculum engine fallback
    if (presetKey && ENGINEERING_PRESETS[presetKey]) {
      const preset = ENGINEERING_PRESETS[presetKey];
      return {
        ...preset,
        courseworkTitle: input.courseworkTitle || preset.courseworkTitle,
        hoursPerWeek: input.hoursPerWeek || preset.hoursPerWeek,
        studentLevel: input.studentLevel || preset.studentLevel,
        source: 'curriculum-engine',
      };
    }

    // Generic dynamic engineering breakdown
    return {
      courseworkTitle: input.courseworkTitle || 'Applied Engineering Analysis',
      studentLevel: input.studentLevel || 'Undergraduate Core',
      hoursPerWeek: input.hoursPerWeek || 8,
      totalWeeks: 4,
      overview: `Systematic engineering study plan designed to master ${input.courseworkTitle} from fundamental governing physics to applied synthesis.`,
      modules: [
        {
          phase: 'Week 1',
          duration: `${input.hoursPerWeek || 8} Hours`,
          title: 'Foundational Principles & Mathematical Formulations',
          coreConcepts: [
            'First-principles derivation of governing equations',
            'Coordinate system selection & boundary conditions',
            'Dimensional analysis and scaling numbers',
          ],
          governingFormulas: [
            '\\sum \\mathbf{F} = m\\mathbf{a}, \\quad \\nabla \\cdot \\mathbf{F} = 0',
            '\\Pi_i = f(V_1, V_2, \\dots, V_n) \\quad (\\text{Buckingham }\\Pi)',
          ],
          appliedProblems: [
            'Formulate governing differential equations for a prototype physical system.',
            'Normalize domain variables to identify dominant asymptotic regimes.',
          ],
          activeRecallPrompt: 'Can you state the primary conservation laws in differential form from memory?',
        },
        {
          phase: 'Week 2',
          duration: `${input.hoursPerWeek || 8} Hours`,
          title: 'Analytical Solution Methods & Canonical Cases',
          coreConcepts: [
            'Separation of variables & eigenvalue problems',
            'Linear approximations and perturbation techniques',
            'Frequency response and transfer characteristics',
          ],
          governingFormulas: [
            '\\mathcal{L}[y] = Y(s), \\quad Y(s) = H(s)X(s)',
            '\\lambda_n = \\left(\\frac{n\\pi}{L}\\right)^2',
          ],
          appliedProblems: [
            'Solve closed-form response for step and impulse excitations.',
            'Plot parametric sensitivity curves across operational variations.',
          ],
          activeRecallPrompt: 'What mathematical properties guarantee orthogonality of the eigenfunction expansion?',
        },
        {
          phase: 'Week 3',
          duration: `${input.hoursPerWeek || 8} Hours`,
          title: 'Computational & Numerical Implementation',
          coreConcepts: [
            'Finite difference discretizations and stability criteria',
            'Matrix conditioning and numerical error propagation',
            'Convergence verification with mesh and timestep refinement',
          ],
          governingFormulas: [
            '\\text{CFL} = \\frac{u \\Delta t}{\\Delta x} \\le 1',
            '\\|\\mathbf{e}_{k+1}\\| \\le C \\|\\mathbf{e}_k\\|^p',
          ],
          appliedProblems: [
            'Implement an explicit vs implicit numerical solver for the system dynamics.',
            'Benchmark computational runtime against solution tolerance.',
          ],
          activeRecallPrompt: 'Why does explicit time integration suffer from numerical instability if the CFL condition is violated?',
        },
        {
          phase: 'Week 4',
          duration: `${input.hoursPerWeek || 8} Hours`,
          title: 'Applied Synthesis, Design Optimization & Review',
          coreConcepts: [
            'Safety factor calculations and failure envelope verification',
            'Design trade-off Pareto frontiers',
            'Comprehensive active recall review',
          ],
          governingFormulas: [
            'S_f = \\frac{\\sigma_{\\text{allowable}}}{\\sigma_{\\text{max}}} \\ge 1.5',
            '\\min f(\\mathbf{x}) \\quad \\text{s.t. } g_i(\\mathbf{x}) \\le 0',
          ],
          appliedProblems: [
            'Conduct end-to-end engineering stress / performance assessment.',
            'Synthesize key formulas into a 1-page high-yield cheat sheet.',
          ],
          activeRecallPrompt: 'Explain how you would diagnose an unexpected resonance or divergence during testing.',
        },
      ],
      highYieldCheckpoints: [
        'Always check units and order-of-magnitude estimations before concluding calculation steps.',
        'Draw complete Free Body Diagrams (FBD) or control volume boundaries before writing equations.',
        'Practice calm, spaced repetition to reinforce durable long-term memory.',
      ],
      source: 'curriculum-engine',
    };
  },

  /** Generates a short personalized study plan from user's current progress */
  async generateStudyPlan(input: {
    fullName: string;
    weakTopics: Array<{ topicName: string; subjectName: string; accuracy: number }>;
    atRiskTopics: Array<{ topicName: string; subjectName: string }>;
    dailyStudyTargetMinutes: number;
  }): Promise<{ plan: string; source: 'gemini' | 'curriculum-engine' }> {
    const prompt = `Create a calm, focused 5-day study plan for a student named ${input.fullName} who has ${input.dailyStudyTargetMinutes} minutes a day to study.
Weak topics: ${JSON.stringify(input.weakTopics)}.
At-risk topics (forgetting curve decay): ${JSON.stringify(input.atRiskTopics)}.
Keep it concise, serene, and actionable.`;

    const geminiText = await callGemini(prompt);
    if (geminiText) {
      return { plan: geminiText.trim(), source: 'gemini' };
    }

    const lines: string[] = [`${input.dailyStudyTargetMinutes}-minute daily study focus:`];
    const items = [
      ...input.atRiskTopics.map((t) => `Review ${t.topicName} (${t.subjectName}) — reinforce memory retention`),
      ...input.weakTopics.map((t) => `Practice ${t.topicName} (${t.subjectName}) — currently ${Math.round(t.accuracy)}% accuracy`),
    ];
    if (items.length === 0) {
      lines.push('No weak or at-risk topics right now — continue calm, steady regular practice.');
    } else {
      items.slice(0, 5).forEach((item, i) => lines.push(`Day ${i + 1}: ${item}`));
    }
    return { plan: lines.join('\n'), source: 'curriculum-engine' };
  },

  /** Summarizes weak topics into a short narrative */
  async summarizeWeakTopics(input: { weakTopics: Array<{ topicName: string; subjectName: string }> }): Promise<{
    summary: string;
    source: 'gemini' | 'curriculum-engine';
  }> {
    if (input.weakTopics.length === 0) {
      return { summary: 'All topics are in strong mastery. Keep up your mindful study pace.', source: 'curriculum-engine' };
    }
    const prompt = `In 2-3 calm sentences, summarize for a student which topics they should practice with gentle focus: ${JSON.stringify(
      input.weakTopics
    )}`;

    const geminiText = await callGemini(prompt);
    if (geminiText) {
      return { summary: geminiText.trim(), source: 'gemini' };
    }

    const names = input.weakTopics.map((t) => t.topicName).join(', ');
    return {
      summary: `Consider revisiting: ${names}. A brief 15-minute focused review on these core principles will restore clarity.`,
      source: 'curriculum-engine',
    };
  },

  /**
   * Analyzes uploaded document text (PDF, DOCX, PPTX) and generates a structured study summary
   * for the notebook Explanations page.
   */
  async analyzeDocument(input: {
    documentText: string;
    fileName?: string;
    topic?: string;
  }): Promise<{
    summary: string;
    keyTakeaways: string[];
    governingFormulas?: Array<{ name: string; latex: string; description: string }>;
    fileName: string;
    source: 'gemini' | 'curriculum-engine';
  }> {
    const fileName = input.fileName || 'Uploaded Document';
    const topic = input.topic || 'Engineering Study Material';
    const snippet = input.documentText.slice(0, 8000); // Send up to 8000 chars

    const systemInstruction = `You are Nexus, an elite first-principles engineering tutor and study copilot.
Your job is to analyze uploaded student coursework or lecture material (${fileName}) and generate an authoritative, highly educational study summary for the Explanations notebook page.
Format your response in clean, structured Markdown.
Include:
1. Executive Conceptual Summary: 2 concise paragraphs describing the fundamental axioms and engineering context.
2. Core Takeaways: 3 to 5 high-yield bullet points.
3. Governing Formulas: Any key equations, transfer functions, or balance laws mentioned or implied (in LaTeX).`;

    const prompt = `Please analyze this document text extracted from "${fileName}" relating to topic "${topic}":\n\n--- DOCUMENT CONTENT ---\n${snippet}\n--- END DOCUMENT CONTENT ---\n\nProvide an insightful, first-principles study summary with key takeaways and governing formulas.`;

    const geminiText = await callGemini(prompt, systemInstruction);
    if (geminiText) {
      const lines = geminiText.split('\n');
      const takeaways: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if ((trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) && trimmed.length > 15) {
          takeaways.push(trimmed.replace(/^[-*\d.]+\s*/, ''));
        }
      }

      return {
        summary: geminiText,
        keyTakeaways: takeaways.slice(0, 5),
        fileName,
        source: 'gemini',
      };
    }

    // High quality offline fallback
    const fallbackSummary = `### Synthesized Study Summary: ${fileName}\n\nThis material provides an in-depth breakdown of fundamental engineering axioms and applied principles for **${topic}**.\n\n#### 1. Invariant Physical Conservation\nThe text establishes invariant balance laws across mass, momentum, and energy. All derived states require strict dimensional compliance and boundary condition verification at asymptotic extremes ($s \\to 0, s \\to \\infty$).\n\n#### 2. Discretization & State-Space Evolution\nThe material explores dynamic coordinate formulation, state-space representations $\\dot{\\mathbf{x}} = \\mathbf{A}\\mathbf{x} + \\mathbf{B}\\mathbf{u}$, and transfer function decomposition for closed-loop stability margins.`;

    return {
      summary: fallbackSummary,
      keyTakeaways: [
        `System invariant conservation laws governing ${topic}`,
        'Coordinate invariance and dimensional verification across all governing terms',
        'Asymptotic boundary convergence and eigenvalue stability analysis',
        'State-space matrix formulation and closed-loop pole placement',
      ],
      fileName,
      source: 'curriculum-engine',
    };
  },

  /**
   * Generates a 5-question structured multiple choice practice quiz for the notebook Quiz Practice page
   */
  async generateQuiz(input: {
    topic: string;
    studyMaterialText?: string;
  }): Promise<{
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }>;
    topic: string;
    source: 'gemini' | 'curriculum-engine';
  }> {
    const topic = input.topic || 'Engineering Core Principles';
    const context = (input.studyMaterialText || '').slice(0, 4000);

    const systemInstruction = `You are Nexus, an elite engineering examiner and first-principles professor.
Generate a structured multiple-choice practice quiz with exactly 5 conceptual and analytical questions on the provided topic and study material.
You must return strictly valid JSON matching this exact schema:
{
  "questions": [
    {
      "id": "q1",
      "question": "Clear and rigorous question prompt?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "Option A text",
      "explanation": "Clear explanation of the governing axiom or derivation."
    }
  ]
}
Requirements:
1. Exactly 5 questions.
2. Exactly 4 options per question.
3. The "correctAnswer" must match exactly one of the items in the "options" array.
4. Do not wrap in markdown code blocks or triple backticks. Return raw JSON only.`;

    const prompt = `Topic: "${topic}"\n\nStudy Material Context:\n${context || 'Fundamental engineering balance laws, state representations, and asymptotic equilibrium.'}\n\nPlease generate the 5-question JSON quiz.`;

    const geminiText = await callGemini(prompt, systemInstruction);
    if (geminiText) {
      try {
        const cleaned = geminiText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
          const validated = parsed.questions.slice(0, 5).map((q: any, i: number) => ({
            id: q.id || `q${i + 1}`,
            question: q.question || `Question ${i + 1} regarding ${topic}`,
            options: Array.isArray(q.options) && q.options.length === 4
              ? q.options
              : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: q.correctAnswer || (Array.isArray(q.options) ? q.options[0] : 'Option A'),
            explanation: q.explanation || `Governed by fundamental physical balance laws in ${topic}.`,
          }));
          return {
            questions: validated,
            topic,
            source: 'gemini',
          };
        }
      } catch (e) {
        console.warn('[AI Service] Failed to parse Gemini quiz JSON response, using curriculum fallback:', e);
      }
    }

    // High quality first-principles offline fallback
    return {
      questions: [
        {
          id: 'q1',
          question: `In the analysis of ${topic}, what physical principle enforces the fundamental conservation boundary relation?`,
          options: [
            'Invariant continuity of fluxes across control volume boundaries',
            'Arbitrary truncation of high-frequency dynamic poles',
            'Unilateral omission of constitutive tensor dissipation',
            'Static equilibrium without coordinate transformation invariance',
          ],
          correctAnswer: 'Invariant continuity of fluxes across control volume boundaries',
          explanation: `In ${topic}, physical conservation requires continuous surface flux integration across all differential control volumes.`,
        },
        {
          id: 'q2',
          question: `When modeling ${topic} in state-space representation (ẋ = Ax + Bu), what condition dictates complete system controllability?`,
          options: [
            'The controllability matrix [B, AB, A²B, ... Aⁿ⁻¹B] must have full rank n',
            'All eigenvalues of matrix A must strictly equal zero',
            'The output matrix C must be skew-symmetric',
            'The control input vector u must be time-invariant',
          ],
          correctAnswer: 'The controllability matrix [B, AB, A²B, ... Aⁿ⁻¹B] must have full rank n',
          explanation: 'The Kalman rank condition ensures that control energy can steer the state trajectory to any target subspace in finite time.',
        },
        {
          id: 'q3',
          question: `Under asymptotic limit analysis (t → ∞), how is steady-state equilibrium verified for ${topic}?`,
          options: [
            'By evaluating lim_{s → 0} s·G(s) using the final value theorem',
            'By setting dynamic derivatives to infinity',
            'By ignoring closed-loop pole locations in the left-half s-plane',
            'By removing feedforward gain from the open-loop transfer function',
          ],
          correctAnswer: 'By evaluating lim_{s → 0} s·G(s) using the final value theorem',
          explanation: 'The Laplace final value theorem allows direct derivation of steady-state behavior without computing full inverse transforms.',
        },
        {
          id: 'q4',
          question: `What distinguishes weak formulation finite element discretization from classical differential forms in ${topic}?`,
          options: [
            'Integration by parts shifts derivatives onto test functions, lowering continuity requirements',
            'It eliminates spatial mesh dependency and boundary conditions',
            'It replaces numerical integration with algebraic constant extrapolation',
            'It requires higher-order continuous second derivatives everywhere',
          ],
          correctAnswer: 'Integration by parts shifts derivatives onto test functions, lowering continuity requirements',
          explanation: 'The weak form converts second-order PDE strong forms into symmetric variational integrals over Sobolev spaces H¹.',
        },
        {
          id: 'q5',
          question: `What is the primary indicator of numerical instability when solving governing evolution equations for ${topic}?`,
          options: [
            'Time-step size exceeding the Courant-Friedrichs-Lewy (CFL) limit',
            'Exact conservation of total mechanical energy over time',
            'Symmetric positive definite stiffness matrix properties',
            'Monotonic decay of transient residual norms',
          ],
          correctAnswer: 'Time-step size exceeding the Courant-Friedrichs-Lewy (CFL) limit',
          explanation: 'The CFL condition sets maximum allowable time steps Δt ≤ Δx / c to prevent unbounded numerical error amplification.',
        },
      ],
      topic,
      source: 'curriculum-engine',
    };
  },
};


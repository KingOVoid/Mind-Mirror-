import { apiClient } from './client';
import type { EngineeringStudyPlanResult } from '../types';
import {
  askNexusCopilot,
  generateNexusQuiz,
  analyzeStudyDocument,
} from '../services/geminiClient';

export interface EngineeringPreset {
  id: string;
  title: string;
  weeks: number;
}

export interface DocumentAnalysisResult {
  summary: string;
  keyTakeaways: string[];
  governingFormulas?: Array<{ name: string; latex: string; description: string }>;
  fileName: string;
  source: 'gemini' | 'curriculum-engine';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
  topic: string;
  source: 'gemini' | 'curriculum-engine';
}

export const aiApi = {
  async copilotChat(params: {
    message: string;
    context?: string;
  }): Promise<{ reply: string; source: 'gemini' | 'curriculum-engine' }> {
    try {
      const res = await apiClient.post<{ reply?: string; explanation?: string; overview?: string }>('/ai/copilot', params);
      const text = res.data?.reply || res.data?.explanation || res.data?.overview;
      if (text) {
        return { reply: text, source: 'gemini' };
      }
    } catch {
      // Backend unavailable or static deployment - fallback directly to client Gemini
    }

    const reply = await askNexusCopilot(params.message, params.context);
    return { reply, source: 'gemini' };
  },

  async getPresets(): Promise<EngineeringPreset[]> {
    try {
      const res = await apiClient.get<{ presets: EngineeringPreset[] }>('/ai/presets');
      return res.data.presets;
    } catch {
      return [
        { id: 'ai-intelligent-agents', title: 'Intelligent Agents & Task Environments', weeks: 5 },
        { id: 'ai-foundations', title: 'Artificial Intelligence: Foundations & Philosophy', weeks: 4 },
        { id: 'open-source-methodology', title: 'Open Source Principles and Methodology', weeks: 4 },
      ];
    }
  },

  async generateEngineeringStudyPlan(params: {
    courseworkTitle: string;
    studentLevel?: string;
    hoursPerWeek?: number;
    presetId?: string;
  }): Promise<EngineeringStudyPlanResult> {
    try {
      const res = await apiClient.post<EngineeringStudyPlanResult>('/ai/engineering-study-plan', params);
      return res.data;
    } catch {
      return {
        courseworkTitle: params.courseworkTitle,
        studentLevel: params.studentLevel || 'Undergraduate Core',
        hoursPerWeek: params.hoursPerWeek || 8,
        totalWeeks: 4,
        overview: `Comprehensive first-principles engineering roadmap for ${params.courseworkTitle}, covering theoretical formulations, PEAS modeling, and practical implementations.`,
        modules: [
          {
            phase: 'Week 1',
            duration: '8 Hours',
            title: 'Foundations, Percept Sequences & Mathematical Formulations',
            coreConcepts: [
              'Agent functions f: P* -> A and the Rational Agent criterion',
              'Vacuum cleaner world state space and percept-action mapping',
              'PEAS task environment specifications',
            ],
            governingFormulas: [
              'f: \\mathcal{P}^* \\to \\mathcal{A}',
              'a^* = \\arg\\max_{a} \\mathbb{E}[P(e) \\mid \\mathcal{P}^*, K]',
            ],
            appliedProblems: [
              'Formulate PEAS table for an automated taxi driver and medical diagnosis system',
              'Classify observability, determinism, and episodic properties of backgammon vs chess',
            ],
            activeRecallPrompt: 'Explain why rationality is not omniscience using a concrete sensor constraint example.',
          },
          {
            phase: 'Week 2',
            duration: '8 Hours',
            title: 'Task Environment Dimensions & Agent Architectures',
            coreConcepts: [
              'Simple reflex vs Model-based reflex with internal state',
              'Goal-based vs Utility-based agents with expected utility maximization',
              'Static vs Dynamic and Discrete vs Continuous environments',
            ],
            governingFormulas: [
              '\\mathbb{E}[U(a)] = \\sum_{s\'} P(s\' \\mid s, a) U(s\')',
            ],
            appliedProblems: [
              'Design condition-action rules for a robotic arm vs an internet shopping agent',
              'Evaluate semi-dynamic clock constraints in competitive games',
            ],
            activeRecallPrompt: 'How does an agent function differ from an agent program?',
          },
        ],
        highYieldCheckpoints: [
          'Always specify the PEAS table completely before proposing an agent program.',
          'Verify environment properties to select the simplest adequate agent architecture.',
          'Ensure reproducible, measurable performance metrics.',
        ],
        source: 'curriculum-engine',
      };
    }
  },

  async generatePersonalizedPlan(): Promise<{ plan: string; source: string }> {
    try {
      const res = await apiClient.post<{ plan: string; source: string }>('/ai/study-plan');
      return res.data;
    } catch {
      return {
        plan: `5-Day Focused Study Plan:\nDay 1: Intelligent Agents & PEAS Framework (45 mins)\nDay 2: Task Environment Dimensions: Observability & Determinism (45 mins)\nDay 3: Russell & Norvig 4 Views of AI & The Turing Test (30 mins)\nDay 4: Open Source Definition: 10 Principles & 4 Freedoms (45 mins)\nDay 5: Permissive (MIT/BSD/Apache) vs Copyleft (GPL) Licensing (30 mins)`,
        source: 'curriculum-engine',
      };
    }
  },

  async analyzeDocument(params: {
    documentText: string;
    fileName?: string;
    topic?: string;
  }): Promise<DocumentAnalysisResult> {
    try {
      const res = await apiClient.post<DocumentAnalysisResult>('/ai/analyze-document', params);
      return res.data;
    } catch {
      return await analyzeStudyDocument(params.documentText, params.fileName, params.topic);
    }
  },

  async generateQuiz(params: {
    topic: string;
    studyMaterialText?: string;
  }): Promise<QuizResponse> {
    try {
      const res = await apiClient.post<QuizResponse>('/ai/generate-quiz', params);
      if (res.data?.questions && res.data.questions.length >= 3) {
        return res.data;
      }
    } catch {
      // Fallback directly to client Gemini
    }

    return await generateNexusQuiz(params.topic, params.studyMaterialText);
  },
};

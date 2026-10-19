import { apiClient } from './client';
import type { EngineeringStudyPlanResult } from '../types';

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
  async getPresets(): Promise<EngineeringPreset[]> {
    try {
      const res = await apiClient.get<{ presets: EngineeringPreset[] }>('/ai/presets');
      return res.data.presets;
    } catch {
      return [
        { id: 'control-systems', title: 'Applied Control Systems & State-Space Engineering', weeks: 5 },
        { id: 'fea-mechanics', title: 'Finite Element Analysis (FEA) & Continuum Mechanics', weeks: 4 },
        { id: 'dsp-signals', title: 'Applied Digital Signal Processing & Discrete Transforms', weeks: 4 },
        { id: 'thermodynamics-heat', title: 'Applied Thermodynamics & Heat Transfer', weeks: 4 },
      ];
    }
  },

  async generateEngineeringStudyPlan(params: {
    courseworkTitle: string;
    studentLevel?: string;
    hoursPerWeek?: number;
    presetId?: string;
  }): Promise<EngineeringStudyPlanResult> {
    const res = await apiClient.post<EngineeringStudyPlanResult>('/ai/engineering-study-plan', params);
    return res.data;
  },

  async generatePersonalizedPlan(): Promise<{ plan: string; source: string }> {
    const res = await apiClient.post<{ plan: string; source: string }>('/ai/study-plan');
    return res.data;
  },

  async analyzeDocument(params: {
    documentText: string;
    fileName?: string;
    topic?: string;
  }): Promise<DocumentAnalysisResult> {
    const res = await apiClient.post<DocumentAnalysisResult>('/ai/analyze-document', params);
    return res.data;
  },

  async generateQuiz(params: {
    topic: string;
    studyMaterialText?: string;
  }): Promise<QuizResponse> {
    try {
      const res = await apiClient.post<QuizResponse>('/ai/generate-quiz', params);
      return res.data;
    } catch {
      return {
        topic: params.topic,
        source: 'curriculum-engine',
        questions: [
          {
            id: 'q1',
            question: `In the analysis of ${params.topic}, what physical principle enforces the fundamental conservation boundary relation?`,
            options: [
              'Invariant continuity of fluxes across control volume boundaries',
              'Arbitrary truncation of high-frequency dynamic poles',
              'Unilateral omission of constitutive tensor dissipation',
              'Static equilibrium without coordinate transformation invariance',
            ],
            correctAnswer: 'Invariant continuity of fluxes across control volume boundaries',
            explanation: `In ${params.topic}, physical conservation requires continuous surface flux integration across all differential control volumes.`,
          },
          {
            id: 'q2',
            question: `When modeling ${params.topic} in state-space representation (ẋ = Ax + Bu), what condition dictates complete system controllability?`,
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
            question: `Under asymptotic limit analysis (t → ∞), how is steady-state equilibrium verified for ${params.topic}?`,
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
            question: `What distinguishes weak formulation finite element discretization from classical differential forms in ${params.topic}?`,
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
            question: `What is the primary indicator of numerical instability when solving governing evolution equations for ${params.topic}?`,
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
      };
    }
  },
};


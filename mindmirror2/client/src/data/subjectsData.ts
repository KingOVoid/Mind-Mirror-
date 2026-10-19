export interface GoverningFormula {
  name: string;
  latex: string;
  description: string;
}

export interface StudySubject {
  id: string;
  title: string;
  code: string;
  tag: string;
  progress: number;
  overview: string;
  governingFormulas: GoverningFormula[];
  readingNotes: string;
  defaultNotebookContent: string;
}

export const STUDY_SUBJECTS: StudySubject[] = [
  {
    id: 'control-systems',
    title: 'Applied Control Systems & State-Space',
    code: 'ENG-401',
    tag: 'Control Theory',
    progress: 72,
    overview:
      'Continuous and discrete dynamical systems modeled in modern state-space coordinates. Emphasizes eigenvalue placement, controllability Gramians, and observer synthesis.',
    governingFormulas: [
      {
        name: 'Continuous Linear State-Space Model',
        latex: '\\dot{x}(t) = A x(t) + B u(t), \\quad y(t) = C x(t) + D u(t)',
        description:
          'Fundamental representation of MIMO dynamical systems where x is the n-dimensional state vector, u is input, and y is output.',
      },
      {
        name: "Ackermann's Pole Placement Formula",
        latex: 'K = [0 \\ 0 \\ \\dots \\ 1] \\ \\mathcal{C}^{-1} \\ \\alpha_c(A)',
        description:
          'Calculates feedback gain matrix K to reposition closed-loop poles to desired locations defined by characteristic polynomial alpha_c.',
      },
      {
        name: 'Kalman Controllability Matrix Criterion',
        latex: '\\mathcal{C} = [B \\quad AB \\quad A^2 B \\quad \\dots \\quad A^{n-1}B], \\quad \\text{rank}(\\mathcal{C}) = n',
        description:
          'A system is completely controllable iff the controllability matrix has full row rank equal to system order n.',
      },
    ],
    readingNotes: `### Core Axiom: Invariance of State Coordinates
In classical frequency-domain control, transfer functions $G(s) = C(sI - A)^{-1}B$ conceal internal system trajectories. State-space formulations expose internal states $x(t) \\in \\mathbb{R}^n$, enabling optimal trajectory tracking.

#### 1. Controllability & Reachability
A system $(A, B)$ is controllable if and only if any initial state $x(0)$ can be steered to the origin $x(t_1) = 0$ in finite time $t_1 < \\infty$ via an admissible control trajectory $u(t)$.

#### 2. Full-State Feedback Architecture
By selecting state feedback control law $u(t) = -K x(t) + r(t)$, the closed-loop autonomous system evolves according to:
$$\\dot{x}(t) = (A - BK)x(t) + Br(t)$$
Stability requires all eigenvalues of $(A - BK)$ to reside strictly in the open left half of the complex plane $\\text{Re}(\\lambda_i) < 0$.`,
    defaultNotebookContent: `## Personal State-Space Derivation Notes
- Reviewing pole placement via Ackermann's formula today.
- Key intuition: If determinant of controllability matrix is near zero, control effort ||u(t)|| explodes.
- Next step: compute Luenberger observer gain L such that (A - LC) has observer poles 3x-5x faster than controller poles.`,
  },
  {
    id: 'fea-mechanics',
    title: 'Finite Element Analysis & Continuum Mechanics',
    code: 'ENG-402',
    tag: 'Mechanics',
    progress: 58,
    overview:
      'Weak-form formulations of boundary value problems in linear elasticity, isoparametric element stiffness formulations, and numerical quadrature.',
    governingFormulas: [
      {
        name: 'Global Stiffness Equilibrium Equation',
        latex: 'K U = F, \\quad K = \\sum_{e} \\int_{\\Omega_e} B^T D B \\, d\\Omega',
        description:
          'Relates assembled structural stiffness matrix K to nodal displacement vector U and external nodal load vector F.',
      },
      {
        name: 'Strain-Displacement Tensor Relationship',
        latex: '\\varepsilon = B d = \\frac{1}{2}\\left(\\nabla u + (\\nabla u)^T\\right)',
        description:
          'Connects continuous infinitesimal strain tensor to discrete nodal displacements through strain-displacement matrix B.',
      },
    ],
    readingNotes: `### Principle of Minimum Potential Energy
The exact displacement field $u(x)$ minimizes the total potential energy $\\Pi = U_{int} - W_{ext}$ over all kinematically admissible fields satisfying essential boundary conditions.

#### 1. Weak Form (Galerkin Method)
Multiply Cauchy's momentum equation by arbitrary virtual displacement field $\\delta u$, integrate by parts over domain $\\Omega$, and apply traction boundary conditions on $\\Gamma_t$.

#### 2. Shear Locking in Linear Elements
First-order triangular/quadrilateral elements experience artificial parasitic shear under pure bending loads, causing severe overestimation of bending stiffness.`,
    defaultNotebookContent: `## FEA Notes & Mesh Discretization
- Remember to use reduced integration (1 Gauss point) with hourglass control or higher-order serendipity quadratic elements to suppress shear locking.
- Verify strain energy convergence when refining mesh sizes (h-refinement).`,
  },
  {
    id: 'dsp-signals',
    title: 'Digital Signal Processing & Transforms',
    code: 'ENG-403',
    tag: 'Signal Processing',
    progress: 84,
    overview:
      'Discrete-time Fourier Transform (DTFT), Z-transforms, FIR/IIR filter design, and fast convolution algorithms for embedded processing.',
    governingFormulas: [
      {
        name: 'Discrete-Time Fourier Transform (DTFT)',
        latex: 'X(e^{j\\omega}) = \\sum_{n=-\\infty}^{\\infty} x[n] e^{-j\\omega n}',
        description:
          'Transforms a discrete-time sequence into a continuous, periodic spectrum with period 2pi.',
      },
      {
        name: 'Bilateral Z-Transform & Region of Convergence',
        latex: 'X(z) = \\sum_{n=-\\infty}^{\\infty} x[n] z^{-n}, \\quad z = r e^{j\\omega}',
        description:
          'Generalization of DTFT mapping discrete signals to the complex z-plane. System stability requires the ROC to include the unit circle |z| = 1.',
      },
    ],
    readingNotes: `### Sampling & Reconstruction Axioms
The Nyquist-Shannon criterion guarantees that a bandlimited signal with $f_{max}$ can be perfectly reconstructed if sampled at $f_s \\ge 2f_{max}$.

#### Linear Time-Invariant (LTI) Convolution
Output sequence $y[n]$ is the discrete convolution of input $x[n]$ with system impulse response $h[n]$:
$$y[n] = x[n] * h[n] = \\sum_{k=-\\infty}^{\\infty} x[k] h[n - k]$$`,
    defaultNotebookContent: `## DSP Filter Synthesis Notes
- For linear-phase FIR filters, impulse response h[n] must possess even or odd symmetry around midpoint (N-1)/2.
- IIR Butterworth filters provide maximally flat passbands with no ripples at cost of non-linear phase distortion.`,
  },
  {
    id: 'thermodynamics-heat',
    title: 'Applied Thermodynamics & Heat Transfer',
    code: 'ENG-404',
    tag: 'Thermal Physics',
    progress: 46,
    overview:
      'First and second laws applied to open control volumes, exergy analysis, multidimensional conduction, and convective boundary layer phenomena.',
    governingFormulas: [
      {
        name: 'Fourier Law of Heat Conduction',
        latex: 'q\" = -k \\nabla T = -k \\left( \\frac{\\partial T}{\\partial x}\\hat{i} + \\frac{\\partial T}{\\partial y}\\hat{j} + \\frac{\\partial T}{\\partial z}\\hat{k} \\right)',
        description:
          'States that local conductive heat flux is directly proportional to negative temperature gradient.',
      },
      {
        name: 'Lumped Capacitance Biot Criterion',
        latex: 'Bi = \\frac{h L_c}{k} < 0.1, \\quad \\frac{T(t) - T_\\infty}{T_i - T_\\infty} = \\exp\\left(-\\frac{h A_s}{\\rho V c_p} t\\right)',
        description:
          'When internal conductive resistance is negligible compared to surface convective resistance (Bi < 0.1), temperature within solid is spatially uniform.',
      },
    ],
    readingNotes: `### Governing Heat Diffusion Equation
For an isotropic medium with uniform thermal conductivity $k$, density $\\rho$, and specific heat $c_p$:
$$\\nabla^2 T + \\frac{\\dot{q}}{k} = \\frac{1}{\\alpha} \\frac{\\partial T}{\\partial t}, \\quad \\alpha = \\frac{k}{\\rho c_p}$$
where $\\alpha$ is the thermal diffusivity denoting rate of thermal energy propagation.`,
    defaultNotebookContent: `## Heat Exchanger & Conduction Notes
- Bi < 0.1 validates lumped capacitance approximation.
- If Bi > 0.1, must solve transient 1D partial differential equation via separation of variables and Fourier series.`,
  },
];

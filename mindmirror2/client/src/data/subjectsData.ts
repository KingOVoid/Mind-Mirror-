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
    id: 'ai-intelligent-agents',
    title: 'Intelligent Agents & Task Environments',
    code: '23N502-U2',
    tag: 'Intelligent Agents',
    progress: 88,
    overview:
      'Formal mathematical modeling of intelligent agents, percept sequences, the agent function f: P* -> A, PEAS task environment specifications, vacuum cleaner world, 6 environmental dimensions, and the 4 agent architectures.',
    governingFormulas: [
      {
        name: 'Agent Function Mathematical Mapping',
        latex: 'f: \\mathcal{P}^* \\longrightarrow \\mathcal{A}',
        description:
          'Maps any given percept sequence history P* (complete sequence of all perceptions to date) to an action A. Implemented internally by an agent program running on an architecture.',
      },
      {
        name: 'Rational Action Selection Criterion',
        latex: 'a^* = \\arg\\max_{a \\in \\mathcal{A}} \\sum_{s\'} P(s\' \\mid \\mathcal{P}^*, a) \\, U(s\')',
        description:
          'A rational agent selects an action expected to maximize its performance measure given evidence from the percept sequence history and built-in prior knowledge.',
      },
      {
        name: 'Internal World State Transition (Model-Based Agent)',
        latex: 's_{t+1} = \\mathcal{T}(s_t, a_t, o_{t+1})',
        description:
          'Updates the agent\'s internal model of how the world evolves based on the previous state s_t, action executed a_t, and incoming percept o_{t+1}.',
      },
      {
        name: 'PEAS Task Environment Formalization',
        latex: '\\text{PEAS} = \\langle \\mathcal{P}_{erf}, \\mathcal{E}_{nv}, \\mathcal{A}_{ct}, \\mathcal{S}_{ens} \\rangle',
        description:
          'Four-part specification required before designing an agent: Performance measure, Environment, Actuators, and Sensors.',
      },
    ],
    readingNotes: `### 1. Intelligent Agents: Perception, Reasoning, and Action
Every modern AI system — from ChatGPT and recommendation engines to Tesla Optimus and autonomous rovers — is an **Intelligent Agent**: an entity that perceives its environment through sensors, processes information, and acts upon that environment via actuators.

| Agent Category | Sensors | Actuators | Concrete Example |
| :--- | :--- | :--- | :--- |
| **Human Agent** | Eyes, ears, nose, tactile sensors | Hands, legs, vocal cords | Medical doctor diagnosing a patient |
| **Robotic Agent** | Cameras, LiDAR, infrared, force/torque sensors | Electric motors, hydraulic grippers, wheels | Tesla Optimus, Boston Dynamics Atlas |
| **Software Agent** | User prompt, network packets, file streams | Generated response, API payloads, display outputs | ChatGPT, web crawler, trading agent |

---

### 2. Percepts, Percept Sequences, and the Agent Function
- **Percept**: The agent's perceptual inputs at any single instant (e.g. camera frame detecting a red traffic light).
- **Percept Sequence**: The complete chronological history of everything the agent has ever perceived: $\\mathcal{P}^* = [p_0, p_1, p_2, \\dots, p_t]$.
- **Agent Function ($f$)**: An abstract mathematical mapping $f: \\mathcal{P}^* \\to \\mathcal{A}$ that maps any percept sequence to an action.
- **Agent Program**: The concrete algorithm running on physical hardware (computing architecture) that computes $f$.
$$\\text{Agent} = \\text{Architecture} + \\text{Program}$$

---

### 3. The Vacuum Cleaner World (Benchmark Problem)
Consider an environment with two locations: square $A$ and square $B$.
- **Percepts**: $[\\text{Location}, \\text{Status}]$ where Status $\\in \\{\\text{Clean}, \\text{Dirty}\\}$.
- **Actions**: $\\{\\text{Left}, \\text{Right}, \\text{Suck}, \\text{NoOp}\\}$.
- **Agent Function Table**:
  - $[A, \\text{Clean}] \\longrightarrow \\text{Right}$
  - $[A, \\text{Dirty}] \\longrightarrow \\text{Suck}$
  - $[B, \\text{Clean}] \\longrightarrow \\text{Left}$
  - $[B, \\text{Dirty}] \\longrightarrow \\text{Suck}$

---

### 4. Rationality vs. Omniscience
A rational agent is **not** omniscient. Omniscience means knowing the actual outcome of its actions and possessing complete knowledge of the universe. Rationality means selecting an action that **maximizes expected performance**, given:
1. The **Performance Measure** defining criteria of success.
2. The agent's **Prior Knowledge** of the environment.
3. The set of **Actions** the agent can perform.
4. The agent's **Percept Sequence** to date.

> **General Design Rule**: Design performance measures according to what you actually want in the environment, not according to how you think the agent should behave.

---

### 5. PEAS Framework for Task Environments
Before synthesizing an agent architecture, its task environment must be fully specified via PEAS:
- **P — Performance Measure**: How success is objectively evaluated.
- **E — Environment**: The external world where the agent operates.
- **A — Actuators**: Mechanisms through which the agent acts on the world.
- **S — Sensors**: Devices through which the agent receives percepts.

#### Benchmark PEAS Specifications:
1. **Medical Diagnosis System**:
   - **P**: Healthy patient, minimized treatment costs, zero misdiagnoses.
   - **E**: Patient, clinic, medical staff, diagnostic laboratory.
   - **A**: Display of diagnostic tests, prescriptions, therapy recommendations, referral orders.
   - **S**: Keyboard/touchscreen entry of symptoms, laboratory test values, patient history.
2. **Satellite Image Analysis System**:
   - **P**: Correct categorization of land use, cloud cover, and terrain features.
   - **E**: Downlink orbit data stream from spaceborne satellites.
   - **A**: Categorized imagery display, geological classification alerts.
   - **S**: High-resolution multispectral and color pixel arrays.
3. **Part-Picking Robot**:
   - **P**: Percentage of mechanical parts sorted into correct bins without structural damage.
   - **E**: Conveyor belt moving randomly oriented parts, collection bins.
   - **A**: Multi-jointed robotic arm, vacuum/pneumatic gripper.
   - **S**: Monocular/stereo camera, joint angle encoders, tactile grip sensors.
4. **Petrochemical Refinery Controller**:
   - **P**: Product purity, yield optimization, operator and environmental safety.
   - **E**: Hydrocarbon cracking columns, catalytic valves, pipelines, operators.
   - **A**: Flow control valves, heating elements, pump switches, status consoles.
   - **S**: Temperature probes, pressure transducers, spectral chemical analyzers.
5. **Interactive English Teacher**:
   - **P**: Maximized student comprehension scores, engagement rate.
   - **E**: Cohort of students, curriculum testing benchmarks.
   - **A**: Display of grammar exercises, interactive suggestions, phonetic corrections.
   - **S**: Student keyboard input, spoken microphone audio input.

---

### 6. Six Dimensions of Task Environments
The nature of the task environment determines the complexity of the agent program:
1. **Fully Observable vs. Partially Observable**: Sensors access complete environment state at all times (e.g. Chess) vs. hidden variables (e.g. Poker, autonomous car in heavy fog).
2. **Deterministic vs. Stochastic**: Next state is completely determined by current state and action (e.g. calculator, chess) vs. randomness/probabilities involved (e.g. backgammon dice, stock market, weather).
3. **Episodic vs. Sequential**: Current decision does not affect future episodes (e.g. spam detection, image classification) vs. current action influences all future states (e.g. driving, chess).
4. **Static vs. Dynamic**: Environment remains unchanged while agent deliberates (e.g. crossword puzzle) vs. continuously evolving in real-time (e.g. city traffic, high-frequency stock trading).
5. **Discrete vs. Continuous**: Finite, countable states and distinct actions (e.g. 64-square chessboard) vs. continuous real-valued space and time (e.g. robotic arm kinematics, steering angles).
6. **Single-Agent vs. Multi-Agent**: One agent acting alone (e.g. crossword solver) vs. multiple interacting entities (e.g. soccer, trading, chess).

---

### 7. Four Fundamental Agent Architectures
1. **Simple Reflex Agent**: Selects actions based exclusively on the current percept using Condition-Action rules (e.g. \`if car-in-front-is-braking then initiate-braking\`). Fails completely when environment is partially observable.
2. **Model-Based Reflex Agent**: Maintains internal state reflecting hidden aspects of the world and tracks how the world evolves independently of the agent.
3. **Goal-Based Agent**: Combines internal state tracking with explicit goal descriptions to plan and search sequences of actions that achieve desired future states.
4. **Utility-Based Agent**: Employs an explicit utility function $U(s)$ mapping states to real numbers, enabling trade-offs between competing goals and reasoning under probabilistic risk.`,
    defaultNotebookContent: `## Unit 1-2: Intelligent Agents Class Notes
- Course: 23N502 Artificial Intelligence (PSG Tech)
- Core Definition: An agent perceives its environment through sensors and acts upon it through actuators: Agent = Architecture + Program.
- Agent Function: f: P* -> A (maps entire percept sequence to an action).
- PEAS Analysis for Internet Shopping Agent:
  - Performance: Price savings, item quality, delivery speed, customer rating.
  - Environment: E-commerce APIs, vendor sites, payment gateways, product catalogs.
  - Actuators: Add-to-cart API, automated checkout, order confirmation email.
  - Sensors: HTML web pages, JSON price feeds, user search criteria.
- Task Environment Classification for Autonomous Driving:
  - Partially Observable, Stochastic, Sequential, Dynamic, Continuous, Multi-Agent.`,
  },
  {
    id: 'ai-foundations',
    title: 'Artificial Intelligence: Foundations & Philosophy',
    code: '23N502-U1',
    tag: 'AI Foundations',
    progress: 78,
    overview:
      'Foundations of artificial intelligence, Russell & Norvig\'s 4 Views of AI (Thinking/Acting x Humanly/Rationally), Alan Turing\'s Test and Total Turing Test, flying-machine analogy, cognitive science vs neuroscience, Aristotle\'s syllogisms, and interdisciplinary roots.',
    governingFormulas: [
      {
        name: 'Categorical Syllogism (Aristotle\'s Laws of Thought)',
        latex: '\\forall x \\, (P(x) \\implies Q(x)) \\;\\land\\; P(a) \\implies Q(a)',
        description:
          'Precise formal deductive inference pattern where correct premises guarantee a sound conclusion. Forms the bedrock of logicist AI, expert systems, and automated theorem provers.',
      },
      {
        name: 'Turing Operational Indistinguishability Criterion',
        latex: '\\mathbb{P}\\left(\\text{Interrogator identifies Machine} = \\text{Human}\\right) \\approx 0.5',
        description:
          'Alan Turing\'s 1950 operational definition of intelligence: if a human interrogator cannot reliably distinguish machine from human in natural text conversation, the machine has achieved conversational intelligence.',
      },
      {
        name: 'Expected Utility Optimization Principle',
        latex: 'a^* = \\arg\\max_a \\mathbb{E}[U(s\')] = \\arg\\max_a \\sum_{s\'} P(s\' \\mid s, a) U(s\')',
        description:
          'Mathematical cornerstone of the rational agent approach: selects actions that maximize expected outcome when the world is stochastic or partially observable.',
      },
    ],
    readingNotes: `### 1. Motivation: Why Artificial Intelligence?
- **René Descartes**: *"Cogito ergo sum"* — "I think, therefore I am."
- Humanity calls itself *Homo sapiens* ("wise man") because intelligence defines our identity.
- **AI\'s Double Mission**:
  1. **Scientific Goal**: Understand intelligence — how the human brain perceives, learns, predicts, and navigates a world far more complex than itself.
  2. **Engineering Goal**: Build intelligent entities — machines that perceive, reason, learn, adapt, and act effectively.

---

### 2. Russell & Norvig\'s Framework: Four Views of AI
Historically, AI research has split along two orthogonal axes: **Thought vs. Action** and **Human-like vs. Rational/Ideal**:

| | **Human-Centered** | **Rationalist (Ideal)** |
| :--- | :--- | :--- |
| **Thinking** | **Thinking Humanly**<br>Cognitive modeling; replicate human thought processes | **Thinking Rationally**<br>Laws of Thought; formal logic & deductive inference |
| **Acting** | **Acting Humanly**<br>Turing Test; behave in indistinguishable ways | **Acting Rationally**<br>Rational Agents; maximize expected performance |

Modern AI primarily embraces **Acting Rationally**: designing agents that achieve the best expected outcome under uncertainty.

---

### 3. Quadrant 1 · Acting Humanly (The Turing Test)
In 1950, Alan Turing published *"Computing Machinery and Intelligence"*, proposing the **Imitation Game**:
- A human interrogator communicates via text with two hidden entities: a human and a computer.
- If the interrogator cannot reliably tell which is the computer, the machine passes.
- **Required Capabilities**: Natural Language Processing (NLP), Knowledge Representation, Automated Reasoning, Machine Learning.

#### Total Turing Test
Adds physical interaction via a video screen and a physical pass-through hatch:
- Requires **Computer Vision** (perceiving objects) and **Robotics** (manipulating objects).

#### The Flying-Machine Analogy
- Early aeronautical pioneers tried to imitate birds by building flapping wings (ornithopters); all failed.
- True flight was achieved through **aerodynamics and wind-tunnel science** — understanding the invariant physics of lift and drag, not imitating feathers.
- **Core Lesson for AI**: Building intelligent systems by copying human biological quirks may be inefficient; uncovering the mathematical and computational principles of reasoning and learning matters more.

---

### 4. Quadrant 2 · Thinking Humanly (Cognitive Science)
Requires empirical validation of how the human brain actually thinks:
- **Top-Down (Cognitive Science)**: Formulate computational models of human psychology, memory stages, and problem-solving (e.g. Newell & Simon\'s General Problem Solver, SOAR, ACT-R).
- **Bottom-Up (Cognitive Neuroscience)**: Study biological neurons, brain scans (fMRI), and synaptic plasticity to discover how intelligence emerges from physical neurobiology.

---

### 5. Quadrant 3 · Thinking Rationally (The Laws of Thought)
Aristotle pioneered **syllogistic logic** — patterns of argument that always generate correct conclusions from true premises:
- *Major Premise*: Every virtue is praiseworthy.
- *Minor Premise*: Kindness is a virtue.
- *Conclusion*: $\\therefore$ Kindness is praiseworthy.

#### Limitations of Pure Logicist AI:
1. Translating messy, real-world informal knowledge into formal first-order logic is exceedingly difficult.
2. Computational intractability: searching through logical inference trees often leads to combinatorial explosion without speed guarantees.
3. Inability to handle uncertainty, noisy sensor data, and probabilistic environments.

---

### 6. Quadrant 4 · Acting Rationally (The Modern Dominant View)
A **Rational Agent** acts so as to achieve the best outcome, or the best expected outcome under uncertainty.
Key capabilities of a rational agent:
1. **Operates Autonomously**: Makes decisions without continuous human micromanagement.
2. **Perceives Environment**: Continuously senses the state of the world.
3. **Persists Over Time**: Pursues long-horizon goals over extended durations.
4. **Adapts to Change**: Updates strategies when environment parameters shift.
5. **Pursues Goals**: Proactively plans sequences of actions rather than merely reacting.
6. **Reasons Under Uncertainty**: Uses probabilistic models and utility functions when complete information is unavailable.

---

### 7. Interdisciplinary Roots of AI
- **Philosophy**: Logic, theories of mind, epistemology, rationality.
- **Mathematics**: Formal proof, Boolean logic, probability theory, optimization.
- **Economics**: Utility theory, game theory, decision under risk.
- **Neuroscience**: Brain circuits, biological neural structures, synaptic plasticity.
- **Computer Engineering**: Silicon architectures, GPU clusters, high-speed networking.
- **Linguistics**: Syntax, semantics, computational natural language processing.
- **Psychology**: Perception, human motor control, cognitive behavior.

---

### 8. State of the Art & Real-World Case Studies
- **Autonomous Vehicles**: DARPA Grand Challenge $\\to$ Waymo, Cruise, Tesla FSD.
- **Speech Recognition**: Whisper, Siri, Alexa (end-to-end transformer acoustic models).
- **Autonomous Planning**: NASA Mars Rover (Curiosity/Perseverance autonomous pathing).
- **Game Playing**: Deep Blue (1997 chess), AlphaGo (2016 Go), AlphaFold (biomolecular folding).
- **Logistics**: DART (Dynamic Analysis and Replanning Tool) saving hundreds of millions in military deployment.
- **Local Application Challenges**: Autonomous navigation in Coimbatore traffic; real-time spoken English $\\to$ spoken Tamil translation.`,
    defaultNotebookContent: `## Unit 1: Introduction to AI Class Notes
- Course: 23N502 Artificial Intelligence (PSG College of Technology)
- Key Takeaway: Russell & Norvig's 4 quadrants define the historical landscape. Acting Rationally is the modern standard.
- The Flying-Machine Analogy: Flight succeeded via aerodynamics, not flapping wings. AI succeeds via computational learning principles, not biological mimicry.
- Turing Test Objections: Does passing the Turing Test prove consciousness or merely syntactic manipulation (Searle's Chinese Room)?
- Homework Question: Autonomous driving in Coimbatore requires handling stochastic, multi-agent, dynamic, and partially observable conditions.`,
  },
  {
    id: 'open-source-methodology',
    title: 'Open Source Principles and Methodology',
    code: '23N503-OS',
    tag: 'Open Source',
    progress: 72,
    overview:
      'Open Source Software (OSS) vs closed source, 10 Open Source Definition (OSD) principles, software licensing taxonomy (Permissive vs Copyleft), Free Software Foundation Four Freedoms, BSD history, GNU/Linux synergy, OSI 5-step approval process, and the 6-stage development lifecycle.',
    governingFormulas: [
      {
        name: 'The Four Essential Software Freedoms (Richard Stallman)',
        latex: '\\mathcal{F} = \\{F_0: \\text{Run}, \\; F_1: \\text{Study/Modify}, \\; F_2: \\text{Redistribute}, \\; F_3: \\text{Distribute Modified}\\}',
        description:
          'Formulated by the Free Software Foundation (FSF). A program is free software if users possess all four essential freedoms. Freedoms 1 and 3 strictly necessitate access to human-readable source code.',
      },
      {
        name: 'Strong Copyleft Reciprocal Condition (GPL)',
        latex: '\\forall D \\in \\text{Derivatives}(S), \\quad \\text{License}(D) \\equiv \\text{License}(S) \\quad (\\text{GNU GPL})',
        description:
          'Reciprocal copyleft requirement: any derivative or combined work incorporating GPL source code must also be licensed in its entirety under the identical GPL terms.',
      },
      {
        name: 'OSI 5-Stage License Certification Pipeline',
        latex: '\\text{Submission} \\longrightarrow \\text{Proposal Review} \\longrightarrow \\text{30-Day Community Review} \\longrightarrow \\text{Board Vote} \\longrightarrow \\text{OSD Certification}',
        description:
          'Open Source Initiative\'s formal vetting process ensuring new licenses comply with all 10 Open Source Definition criteria before inclusion in the official approved list.',
      },
    ],
    readingNotes: `### 1. What is Open Source Software (OSS)?
Open Source Software (OSS) is software whose source code is publicly inspectable, modifiable, and redistributable according to the terms of an approved open source license.
- **Source code is public**: Anyone can examine the implementation.
- **Free to use & run**: No artificial runtime or operational restrictions.
- **Anyone can modify**: Bugs can be resolved and features added without vendor permission.
- **Anyone can redistribute**: Freely shared with colleagues and the public.

---

### 2. Open Source vs. Proprietary (Closed Source) Software

| Feature | Open Source Software (OSS) | Proprietary / Closed Source |
| :--- | :--- | :--- |
| **Source Code Access** | Publicly available under legal open license | Confidential trade secret; accessible only to vendor |
| **Development Model** | Distributed global community & foundations | Centralized inside a single corporate organization |
| **User Rights** | Right to study, modify, adapt, and fork | Limited strictly to running the compiled binary |
| **Licensing** | MIT, Apache 2.0, BSD, GNU GPL | Proprietary EULA, seat/subscription licenses |
| **Direct Cost** | Free to acquire, modify, and redistribute | Upfront purchase, recurring seat license fees |
| **Customization** | Unlimited; customized for specific embedded/cloud needs | Minimal; depends exclusively on vendor roadmap |
| **Vulnerability Fixes**| Rapidly audited and patched by global developers | Patched solely on vendor release schedule |
| **Real Examples** | Linux, PostgreSQL, VLC, Blender, Firefox, Python | Windows, macOS, Oracle DB, Photoshop, MS Word |

---

### 3. The 10 Principles of the Open Source Definition (OSD)
Maintained by the **Open Source Initiative (OSI)**:
1. **Free Redistribution**: The license shall not restrict any party from selling or giving away the software.
2. **Access to Source Code**: The program must include source code and allow distribution in source as well as compiled form.
3. **Derived Works**: The license must allow modifications and derived works under the same terms.
4. **Integrity of the Author\'s Code**: The license may restrict source-code from being distributed in modified form only if patch files are permitted with the version.
5. **No Discrimination Against Persons or Groups**: Must not discriminate against any person or group.
6. **No Discrimination Against Fields of Endeavor**: Cannot restrict anyone from using the program in a specific field (e.g. genetic research or commercial banking).
7. **Distribution of License**: The rights attached to the program must apply to all to whom the program is redistributed.
8. **License Must Not Be Specific to a Product**: Rights must not depend on the software being part of a specific distribution.
9. **License Must Not Restrict Other Software**: Cannot require that other software distributed on the same medium must be open source.
10. **License Must Be Technology-Neutral**: No provision may be predicated on any individual technology or interface style (e.g. click-wrap requirement).

---

### 4. Software Licensing Taxonomy: Permissive vs. Copyleft

#### A. Permissive Licenses (Academic / Minimalist)
Grant the broadest possible freedoms to users, allowing proprietary closed-source redistribution with minimal requirements (typically retaining original copyright and disclaimer notices):
- **MIT License**: Extremely concise, allows commercial reuse, modification, and relicensing.
- **Apache License 2.0**: Permissive license that includes an explicit grant of patent rights and trademark protections.
- **BSD Licenses (2-Clause / 3-Clause)**: Berkeley Software Distribution license family allowing commercial integration without requiring derived code to remain open.

#### B. Copyleft Licenses (Reciprocal / Protective)
Use copyright law to ensure that software and all its derivatives remain permanently open and accessible:
- **Strong Copyleft (GNU GPLv2 / GPLv3)**: Mandates that any derivative work or statically/dynamically linked application must distribute its full source code under the GPL.
- **Weak Copyleft (LGPL, Mozilla Public License - MPL)**: Requires modifications to the library itself to remain open, but permits linking with proprietary applications.

---

### 5. The Free Software Foundation (FSF) & The 4 Freedoms
Founded in 1985 by **Richard Stallman** in Boston to protect user freedom:
- **Freedom 0**: The freedom to run the program as you wish, for any purpose.
- **Freedom 1**: The freedom to study how the program works and adapt it to your needs (requires source code access).
- **Freedom 2**: The freedom to redistribute copies so you can help your neighbor.
- **Freedom 3**: The freedom to distribute copies of your modified versions to others (requires source code access).

---

### 6. Historical Milestones of Open Source
- **1977**: BSD developed at UC Berkeley by Bill Joy as an enhancement to AT&T UNIX.
- **1983**: 4.2BSD introduces the TCP/IP stack, providing the networking architecture for the modern Internet.
- **1983**: Richard Stallman announces the **GNU Project** (*GNU\'s Not Unix*) to build a complete, free operating system.
- **1985**: Free Software Foundation established; GNU General Public License (GPL) created.
- **1987**: GCC (GNU Compiler Collection), Emacs, Bash, and GNU Coreutils published.
- **1991**: **Linus Torvalds** writes the Linux kernel and combines it with GNU tools $\\to$ the modern **GNU/Linux** operating system.
- **1998**: Netscape open-sources Communicator browser; **Open Source Initiative (OSI)** founded by Bruce Perens and Eric Raymond to promote open-source in commercial enterprise.

---

### 7. Open Standards & Principles
An **Open Standard** is a publicly available specification that can be implemented by anyone without patent barriers:
1. **Due Process**: Decisions made with equity and transparent review processes.
2. **Broad Consensus**: Agreement forged across diverse commercial and community stakeholders.
3. **Transparency**: Standards discussions and RFCs open for public audit.
4. **Balance**: Not dominated by a single monopolistic corporate interest.
5. **Openness**: Open to all informed participants; specs available royalty-free or under Fair, Reasonable, and Non-Discriminatory (FRAND) terms.

---

### 8. The 6-Stage Open Source Development Lifecycle
1. **Identify a Need**: Define the problem, architectural scope, and project governance.
2. **Fork / Clone**: Replicate the upstream repository into personal development workspace.
3. **Develop & Commit**: Write clean code, adhere to coding guidelines, and record discrete atomic commits.
4. **Submit a Pull Request (PR)**: Issue upstream pull request explaining bug fixes, benchmarks, and test coverage.
5. **Code Review & Continuous Integration (CI)**: Maintainers review changes, automated test suites run across target operating systems.
6. **Merge, Release & Maintain**: Merge approved commits, cut semantic releases, and patch discovered vulnerabilities.`,
    defaultNotebookContent: `## Open Source Principles & Methodology Class Notes
- Course: 23N503 Open Source Methodology
- Permissive vs Copyleft Decision Matrix:
  - MIT / Apache 2.0: Use when maximizing ecosystem adoption and commercial enterprise integration.
  - GPLv3: Use when protecting software freedom and guaranteeing modifications remain public.
- The 4 Freedoms of FSF:
  - Freedom 0 (Run), Freedom 1 (Study/Modify), Freedom 2 (Share), Freedom 3 (Distribute Modified).
- The OSI 5-Step Approval Process: Submission -> Proposal Review -> 30-Day Discussion -> Board Vote -> Certified.
- GitHub Flow: Fork -> Branch -> Commit -> Pull Request -> Code Review -> Merge.`,
  },
];

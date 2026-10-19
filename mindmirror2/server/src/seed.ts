/**
 * Mind Mirror — seed data.
 * Run with: npm run seed
 * Safe to re-run: skips creating accounts/subjects that already exist by name/email.
 */
import { pool } from './db/pool';
import { userRepo } from './db/repositories/userRepo';
import { studentProfileRepo } from './db/repositories/studentProfileRepo';
import { learningProfileRepo } from './db/repositories/learningProfileRepo';
import { subjectRepo } from './db/repositories/subjectRepo';
import { topicRepo } from './db/repositories/topicRepo';
import { questionRepo } from './db/repositories/questionRepo';
import { hashPassword } from './utils/auth';

const ADMIN_EMAIL = 'admin@mindmirror.dev';
const ADMIN_PASSWORD = 'Admin1234';
const STUDENT_EMAIL = 'student@mindmirror.dev';
const STUDENT_PASSWORD = 'Student1234';

type QSeed = {
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MULTIPLE_SELECT' | 'FILL_IN_BLANK';
  text: string;
  options?: { id: string; text: string }[];
  correctAnswer: any;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  concept: string;
};

const SUBJECTS: Array<{
  name: string;
  description: string;
  icon: string;
  topics: Array<{ name: string; description: string; questions: QSeed[] }>;
}> = [
  {
    name: 'Computer Networks',
    description: 'How data travels across networks — from physical cabling to application protocols.',
    icon: 'Network',
    topics: [
      {
        name: 'OSI Model',
        description: 'The 7-layer conceptual model for network communication.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'How many layers does the OSI model have?',
            options: [{ id: 'a', text: '5' }, { id: 'b', text: '7' }, { id: 'c', text: '6' }, { id: 'd', text: '4' }],
            correctAnswer: 'b',
            explanation: 'The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.',
            difficulty: 'EASY',
            concept: 'OSI layering',
          },
          {
            type: 'MULTIPLE_CHOICE',
            text: 'Which OSI layer is responsible for routing packets between networks?',
            options: [{ id: 'a', text: 'Data Link' }, { id: 'b', text: 'Network' }, { id: 'c', text: 'Transport' }, { id: 'd', text: 'Session' }],
            correctAnswer: 'b',
            explanation: 'The Network layer (Layer 3) handles logical addressing and routing.',
            difficulty: 'MEDIUM',
            concept: 'OSI layering',
          },
          {
            type: 'TRUE_FALSE',
            text: 'The Presentation layer handles data encryption and compression.',
            correctAnswer: true,
            explanation: 'The Presentation layer (Layer 6) deals with data translation, encryption, and compression.',
            difficulty: 'EASY',
            concept: 'OSI layering',
          },
          {
            type: 'MULTIPLE_SELECT',
            text: 'Which of the following are part of the OSI model? (Select all that apply)',
            options: [{ id: 'a', text: 'Session' }, { id: 'b', text: 'Internet' }, { id: 'c', text: 'Presentation' }, { id: 'd', text: 'Physical' }],
            correctAnswer: ['a', 'c', 'd'],
            explanation: '"Internet" is a layer in the TCP/IP model, not the OSI model.',
            difficulty: 'HARD',
            concept: 'OSI vs TCP/IP',
          },
        ],
      },
      {
        name: 'TCP/IP',
        description: 'The practical 4-layer protocol suite the internet actually runs on.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'Which protocol guarantees reliable, ordered delivery of data?',
            options: [{ id: 'a', text: 'UDP' }, { id: 'b', text: 'TCP' }, { id: 'c', text: 'IP' }, { id: 'd', text: 'ICMP' }],
            correctAnswer: 'b',
            explanation: 'TCP (Transmission Control Protocol) provides reliable, ordered, error-checked delivery.',
            difficulty: 'EASY',
            concept: 'TCP vs UDP',
          },
          {
            type: 'TRUE_FALSE',
            text: 'UDP establishes a connection before sending data, just like TCP.',
            correctAnswer: false,
            explanation: 'UDP is connectionless — it sends datagrams without establishing a connection first.',
            difficulty: 'MEDIUM',
            concept: 'TCP vs UDP',
          },
          {
            type: 'FILL_IN_BLANK',
            text: 'The three-step process TCP uses to establish a connection is called the _____ handshake.',
            correctAnswer: 'three-way',
            explanation: 'TCP uses a three-way handshake: SYN, SYN-ACK, ACK.',
            difficulty: 'MEDIUM',
            concept: 'TCP connection setup',
          },
        ],
      },
      {
        name: 'Ethernet',
        description: 'The dominant wired LAN technology and its framing/addressing scheme.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'What type of address does Ethernet use to identify devices on a local network?',
            options: [{ id: 'a', text: 'IP address' }, { id: 'b', text: 'MAC address' }, { id: 'c', text: 'Port number' }, { id: 'd', text: 'Subnet mask' }],
            correctAnswer: 'b',
            explanation: 'Ethernet uses MAC (Media Access Control) addresses, which are burned into network hardware.',
            difficulty: 'EASY',
            concept: 'MAC addressing',
          },
          {
            type: 'TRUE_FALSE',
            text: 'A MAC address is typically 48 bits long.',
            correctAnswer: true,
            explanation: 'MAC addresses are 48 bits, usually written as six groups of two hex digits.',
            difficulty: 'EASY',
            concept: 'MAC addressing',
          },
        ],
      },
      {
        name: 'Routing',
        description: 'How packets find their way across interconnected networks.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'Which of these is a distance-vector routing protocol?',
            options: [{ id: 'a', text: 'OSPF' }, { id: 'b', text: 'RIP' }, { id: 'c', text: 'BGP' }, { id: 'd', text: 'IS-IS' }],
            correctAnswer: 'b',
            explanation: 'RIP (Routing Information Protocol) is a classic distance-vector protocol using hop count as its metric.',
            difficulty: 'HARD',
            concept: 'Routing protocols',
          },
          {
            type: 'TRUE_FALSE',
            text: 'A router operates primarily at the OSI Network layer.',
            correctAnswer: true,
            explanation: 'Routers make forwarding decisions based on Layer 3 (Network layer) addressing.',
            difficulty: 'MEDIUM',
            concept: 'Routing basics',
          },
        ],
      },
      {
        name: 'Transport Layer',
        description: 'End-to-end communication, ports, and flow control.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'What identifies a specific application/service on a host for transport-layer communication?',
            options: [{ id: 'a', text: 'IP address' }, { id: 'b', text: 'Port number' }, { id: 'c', text: 'MAC address' }, { id: 'd', text: 'Subnet mask' }],
            correctAnswer: 'b',
            explanation: 'Port numbers, combined with the IP address, identify a specific process on a host.',
            difficulty: 'EASY',
            concept: 'Ports and sockets',
          },
        ],
      },
      {
        name: 'Application Layer',
        description: 'The protocols end-user software actually speaks: HTTP, DNS, SMTP, and friends.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'Which protocol translates domain names into IP addresses?',
            options: [{ id: 'a', text: 'DNS' }, { id: 'b', text: 'HTTP' }, { id: 'c', text: 'FTP' }, { id: 'd', text: 'SMTP' }],
            correctAnswer: 'a',
            explanation: 'DNS (Domain Name System) resolves human-readable domain names to IP addresses.',
            difficulty: 'EASY',
            concept: 'Application protocols',
          },
          {
            type: 'TRUE_FALSE',
            text: 'HTTP is inherently a stateful protocol.',
            correctAnswer: false,
            explanation: 'HTTP is stateless by design; state is managed externally (e.g. via cookies, sessions).',
            difficulty: 'MEDIUM',
            concept: 'HTTP',
          },
        ],
      },
    ],
  },
  {
    name: 'Data Structures',
    description: 'The fundamental ways to organize and access data efficiently.',
    icon: 'Boxes',
    topics: [
      {
        name: 'Arrays',
        description: 'Fixed-size, contiguous, index-addressable collections.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'What is the time complexity of accessing an element by index in an array?',
            options: [{ id: 'a', text: 'O(1)' }, { id: 'b', text: 'O(n)' }, { id: 'c', text: 'O(log n)' }, { id: 'd', text: 'O(n^2)' }],
            correctAnswer: 'a',
            explanation: 'Arrays support constant-time random access because elements are contiguous in memory.',
            difficulty: 'EASY',
            concept: 'Array access',
          },
          {
            type: 'MULTIPLE_CHOICE',
            text: 'What is the worst-case time complexity of inserting an element at the beginning of an array?',
            options: [{ id: 'a', text: 'O(1)' }, { id: 'b', text: 'O(n)' }, { id: 'c', text: 'O(log n)' }, { id: 'd', text: 'O(1) amortized' }],
            correctAnswer: 'b',
            explanation: 'Inserting at the front requires shifting every existing element — O(n).',
            difficulty: 'MEDIUM',
            concept: 'Array insertion',
          },
        ],
      },
      {
        name: 'Linked Lists',
        description: 'Node-based sequences linked by pointers/references.',
        questions: [
          {
            type: 'TRUE_FALSE',
            text: 'A singly linked list allows O(1) access to the previous node from any given node.',
            correctAnswer: false,
            explanation: 'Singly linked lists only store a reference to the next node, so going backward requires traversal from the head.',
            difficulty: 'MEDIUM',
            concept: 'Linked list structure',
          },
          {
            type: 'MULTIPLE_CHOICE',
            text: 'What is the time complexity of inserting a node at the head of a singly linked list?',
            options: [{ id: 'a', text: 'O(1)' }, { id: 'b', text: 'O(n)' }, { id: 'c', text: 'O(log n)' }, { id: 'd', text: 'O(n^2)' }],
            correctAnswer: 'a',
            explanation: 'Inserting at the head just means creating a new node and pointing it at the old head — O(1).',
            difficulty: 'EASY',
            concept: 'Linked list insertion',
          },
        ],
      },
      {
        name: 'Stacks & Queues',
        description: 'LIFO and FIFO access patterns built on simpler structures.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'Which data structure follows the Last-In-First-Out (LIFO) principle?',
            options: [{ id: 'a', text: 'Queue' }, { id: 'b', text: 'Stack' }, { id: 'c', text: 'Array' }, { id: 'd', text: 'Linked List' }],
            correctAnswer: 'b',
            explanation: 'A stack removes the most recently added element first — LIFO.',
            difficulty: 'EASY',
            concept: 'Stack semantics',
          },
          {
            type: 'TRUE_FALSE',
            text: 'A queue removes elements in the same order they were added.',
            correctAnswer: true,
            explanation: 'Queues are First-In-First-Out (FIFO).',
            difficulty: 'EASY',
            concept: 'Queue semantics',
          },
        ],
      },
      {
        name: 'Trees',
        description: 'Hierarchical structures: binary trees, BSTs, and traversals.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'In a binary search tree, where are values smaller than the root stored?',
            options: [{ id: 'a', text: 'Right subtree' }, { id: 'b', text: 'Left subtree' }, { id: 'c', text: 'Root only' }, { id: 'd', text: 'Anywhere' }],
            correctAnswer: 'b',
            explanation: 'By BST convention, smaller values go to the left subtree, larger to the right.',
            difficulty: 'EASY',
            concept: 'Binary search trees',
          },
          {
            type: 'MULTIPLE_CHOICE',
            text: 'What is the average-case time complexity of searching in a balanced binary search tree?',
            options: [{ id: 'a', text: 'O(1)' }, { id: 'b', text: 'O(n)' }, { id: 'c', text: 'O(log n)' }, { id: 'd', text: 'O(n log n)' }],
            correctAnswer: 'c',
            explanation: 'A balanced BST has height O(log n), so search takes O(log n) on average.',
            difficulty: 'MEDIUM',
            concept: 'BST complexity',
          },
        ],
      },
      {
        name: 'Graphs',
        description: 'Nodes and edges — modeling networks, dependencies, and relationships.',
        questions: [
          {
            type: 'TRUE_FALSE',
            text: 'In a directed graph, an edge from A to B implies an edge from B to A.',
            correctAnswer: false,
            explanation: 'Directed edges are one-way unless explicitly reciprocated.',
            difficulty: 'EASY',
            concept: 'Graph direction',
          },
          {
            type: 'MULTIPLE_CHOICE',
            text: 'Which traversal algorithm uses a queue and explores neighbors level by level?',
            options: [{ id: 'a', text: 'DFS' }, { id: 'b', text: 'BFS' }, { id: 'c', text: 'Dijkstra' }, { id: 'd', text: 'A*' }],
            correctAnswer: 'b',
            explanation: 'Breadth-First Search uses a queue and explores all neighbors at the current depth before going deeper.',
            difficulty: 'MEDIUM',
            concept: 'Graph traversal',
          },
        ],
      },
      {
        name: 'Hashing',
        description: 'Hash tables, collisions, and average O(1) lookups.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'What is the average-case time complexity of a lookup in a well-implemented hash table?',
            options: [{ id: 'a', text: 'O(1)' }, { id: 'b', text: 'O(n)' }, { id: 'c', text: 'O(log n)' }, { id: 'd', text: 'O(n^2)' }],
            correctAnswer: 'a',
            explanation: 'With a good hash function and load factor, lookups are O(1) on average.',
            difficulty: 'EASY',
            concept: 'Hash table complexity',
          },
          {
            type: 'FILL_IN_BLANK',
            text: 'When two keys hash to the same bucket, this is called a hash _____.',
            correctAnswer: 'collision',
            explanation: 'A hash collision occurs when two distinct keys map to the same bucket.',
            difficulty: 'MEDIUM',
            concept: 'Hash collisions',
          },
        ],
      },
    ],
  },
  {
    name: 'Operating Systems',
    description: 'How the OS manages processes, memory, and hardware resources.',
    icon: 'Cpu',
    topics: [
      {
        name: 'Processes & Threads',
        description: 'Units of execution and how they differ.',
        questions: [
          {
            type: 'TRUE_FALSE',
            text: 'Threads within the same process share the same memory address space.',
            correctAnswer: true,
            explanation: 'Threads of the same process share heap and global memory but have their own stack.',
            difficulty: 'EASY',
            concept: 'Processes vs threads',
          },
          {
            type: 'MULTIPLE_CHOICE',
            text: 'What is the main overhead advantage of threads over processes?',
            options: [{ id: 'a', text: 'Threads have separate memory' }, { id: 'b', text: 'Threads are cheaper to create and switch between' }, { id: 'c', text: 'Threads cannot share data' }, { id: 'd', text: 'Threads require their own OS' }],
            correctAnswer: 'b',
            explanation: 'Threads avoid the overhead of a full address-space switch, making context switches faster.',
            difficulty: 'MEDIUM',
            concept: 'Thread overhead',
          },
        ],
      },
      {
        name: 'Scheduling',
        description: 'How the OS decides which process/thread runs next.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'Which scheduling algorithm can cause starvation of long processes?',
            options: [{ id: 'a', text: 'Round Robin' }, { id: 'b', text: 'Shortest Job First' }, { id: 'c', text: 'FCFS' }, { id: 'd', text: 'Priority (static)' }],
            correctAnswer: 'b',
            explanation: 'Shortest Job First can starve longer jobs if shorter ones keep arriving.',
            difficulty: 'HARD',
            concept: 'Scheduling algorithms',
          },
          {
            type: 'TRUE_FALSE',
            text: 'Round Robin scheduling gives each process a fixed time slice (quantum).',
            correctAnswer: true,
            explanation: 'Round Robin cycles through processes, giving each a fixed quantum before moving to the next.',
            difficulty: 'EASY',
            concept: 'Round robin',
          },
        ],
      },
      {
        name: 'Memory Management',
        description: 'Paging, segmentation, and virtual memory.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'What technique allows a process to use more memory than physically available?',
            options: [{ id: 'a', text: 'Paging' }, { id: 'b', text: 'Virtual memory' }, { id: 'c', text: 'Caching' }, { id: 'd', text: 'Threading' }],
            correctAnswer: 'b',
            explanation: 'Virtual memory lets the OS use disk storage to extend apparent RAM capacity.',
            difficulty: 'MEDIUM',
            concept: 'Virtual memory',
          },
          {
            type: 'FILL_IN_BLANK',
            text: 'When a requested page is not in memory and must be fetched from disk, this is called a page _____.',
            correctAnswer: 'fault',
            explanation: 'A page fault occurs when a program accesses a page not currently mapped into physical memory.',
            difficulty: 'MEDIUM',
            concept: 'Paging',
          },
        ],
      },
      {
        name: 'Deadlocks',
        description: 'When processes wait on each other forever.',
        questions: [
          {
            type: 'MULTIPLE_SELECT',
            text: 'Which of the following are necessary conditions for deadlock? (Select all that apply)',
            options: [{ id: 'a', text: 'Mutual exclusion' }, { id: 'b', text: 'Starvation' }, { id: 'c', text: 'Circular wait' }, { id: 'd', text: 'Hold and wait' }],
            correctAnswer: ['a', 'c', 'd'],
            explanation: 'The four Coffman conditions are: mutual exclusion, hold and wait, no preemption, and circular wait. Starvation is a separate concept.',
            difficulty: 'HARD',
            concept: 'Deadlock conditions',
          },
        ],
      },
      {
        name: 'File Systems',
        description: 'How data is organized and retrieved on persistent storage.',
        questions: [
          {
            type: 'TRUE_FALSE',
            text: 'An inode stores the actual file data, not just metadata.',
            correctAnswer: false,
            explanation: 'An inode stores metadata (permissions, size, pointers to data blocks) — not the file content itself.',
            difficulty: 'MEDIUM',
            concept: 'File system structures',
          },
        ],
      },
    ],
  },
  {
    name: 'Artificial Intelligence',
    description: 'Search, learning, and representation — the building blocks of AI systems.',
    icon: 'BrainCircuit',
    topics: [
      {
        name: 'Search Algorithms',
        description: 'Uninformed and informed search over problem spaces.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'Which search algorithm uses a heuristic to estimate distance to the goal?',
            options: [{ id: 'a', text: 'BFS' }, { id: 'b', text: 'DFS' }, { id: 'c', text: 'A*' }, { id: 'd', text: 'Uniform Cost Search' }],
            correctAnswer: 'c',
            explanation: 'A* combines path cost and a heuristic estimate to the goal for efficient informed search.',
            difficulty: 'MEDIUM',
            concept: 'Informed search',
          },
          {
            type: 'TRUE_FALSE',
            text: 'Breadth-First Search is guaranteed to find the shortest path in an unweighted graph.',
            correctAnswer: true,
            explanation: 'BFS explores level by level, guaranteeing the shortest path in terms of edge count for unweighted graphs.',
            difficulty: 'EASY',
            concept: 'Uninformed search',
          },
        ],
      },
      {
        name: 'Machine Learning Basics',
        description: 'Supervised, unsupervised learning, and core terminology.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'Which type of learning uses labeled training data?',
            options: [{ id: 'a', text: 'Unsupervised learning' }, { id: 'b', text: 'Supervised learning' }, { id: 'c', text: 'Reinforcement learning' }, { id: 'd', text: 'Semi-random learning' }],
            correctAnswer: 'b',
            explanation: 'Supervised learning trains on input-output pairs where the correct output is known.',
            difficulty: 'EASY',
            concept: 'Learning paradigms',
          },
          {
            type: 'TRUE_FALSE',
            text: 'Overfitting means a model performs well on training data but poorly on unseen data.',
            correctAnswer: true,
            explanation: 'Overfitting occurs when a model memorizes training data noise rather than learning generalizable patterns.',
            difficulty: 'MEDIUM',
            concept: 'Overfitting',
          },
        ],
      },
      {
        name: 'Neural Networks',
        description: 'Layers, weights, and backpropagation.',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            text: 'What algorithm is primarily used to train neural networks by propagating error backward?',
            options: [{ id: 'a', text: 'Gradient boosting' }, { id: 'b', text: 'Backpropagation' }, { id: 'c', text: 'K-means' }, { id: 'd', text: 'Random forest' }],
            correctAnswer: 'b',
            explanation: 'Backpropagation computes gradients of the loss with respect to weights, propagating error backward through the network.',
            difficulty: 'MEDIUM',
            concept: 'Neural network training',
          },
        ],
      },
      {
        name: 'Knowledge Representation',
        description: 'How AI systems encode facts and relationships.',
        questions: [
          {
            type: 'TRUE_FALSE',
            text: 'A knowledge graph represents facts as nodes and relationships as edges.',
            correctAnswer: true,
            explanation: 'Knowledge graphs model entities as nodes and the relationships between them as labeled edges.',
            difficulty: 'EASY',
            concept: 'Knowledge graphs',
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log('Seeding Mind Mirror data...');

  // ── Admin account ───────────────────────────────────────────────────
  let admin = await userRepo.findByEmail(ADMIN_EMAIL);
  if (!admin) {
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    admin = await userRepo.create({ email: ADMIN_EMAIL, passwordHash, fullName: 'Mind Mirror Admin', role: 'ADMIN' });
    console.log(`Created admin account: ${ADMIN_EMAIL}`);
  } else {
    console.log('Admin account already exists, skipping.');
  }

  // ── Demo student account ────────────────────────────────────────────
  let student = await userRepo.findByEmail(STUDENT_EMAIL);
  if (!student) {
    const passwordHash = await hashPassword(STUDENT_PASSWORD);
    student = await userRepo.create({ email: STUDENT_EMAIL, passwordHash, fullName: 'Demo Student', role: 'STUDENT' });
    await studentProfileRepo.create(student.id, { college: 'Mind Mirror University', course: 'B.Tech CSE', semester: '5' });
    await studentProfileRepo.completeOnboarding(student.id, {
      learningGoals: 'Prepare for semester exams and build strong CS fundamentals',
      preferredStudyTime: 'evening',
      preferredLearningStyle: 'PRACTICE',
      dailyStudyTargetMinutes: 45,
      strongSubjectTags: ['Data Structures'],
      weakSubjectTags: ['Operating Systems'],
    });
    await learningProfileRepo.create(student.id);
    console.log(`Created demo student account: ${STUDENT_EMAIL}`);
  } else {
    console.log('Demo student account already exists, skipping.');
  }

  // ── Subjects, topics, questions ─────────────────────────────────────
  for (const subjectSeed of SUBJECTS) {
    const { rows: existingSubjectRows } = await pool.query(
      `SELECT * FROM "Subject" WHERE name = $1 AND "isGlobal" = true`,
      [subjectSeed.name]
    );
    let subject = existingSubjectRows[0];
    if (!subject) {
      subject = await subjectRepo.create({
        name: subjectSeed.name,
        description: subjectSeed.description,
        icon: subjectSeed.icon,
        ownerId: null,
        isGlobal: true,
      });
      console.log(`Created subject: ${subject.name}`);
    }

    for (const topicSeed of subjectSeed.topics) {
      const { rows: existingTopicRows } = await pool.query(
        `SELECT * FROM "Topic" WHERE "subjectId" = $1 AND name = $2`,
        [subject.id, topicSeed.name]
      );
      let topic = existingTopicRows[0];
      if (!topic) {
        topic = await topicRepo.create({ subjectId: subject.id, name: topicSeed.name, description: topicSeed.description });
        console.log(`  Created topic: ${topic.name}`);
      }

      const { rows: existingQuestionRows } = await pool.query(`SELECT COUNT(*)::int AS count FROM "Question" WHERE "topicId" = $1`, [
        topic.id,
      ]);
      if (existingQuestionRows[0].count > 0) continue; // already seeded

      for (const q of topicSeed.questions) {
        await questionRepo.create({
          subjectId: subject.id,
          topicId: topic.id,
          type: q.type,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          concept: q.concept,
          authorId: admin.id,
        });
      }
      console.log(`    Seeded ${topicSeed.questions.length} questions for ${topic.name}`);
    }
  }

  console.log('\nSeed complete.');
  console.log(`Admin login:   ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Student login: ${STUDENT_EMAIL} / ${STUDENT_PASSWORD}`);
  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

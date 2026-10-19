import { spawn } from 'child_process';
import process from 'process';

// Map Next.js flags (-H -> --host, -p -> --port) so npm run dev -- -H 0.0.0.0 runs seamlessly with Vite
const rawArgs = process.argv.slice(2);
const mappedArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '-H' || arg === '--hostname') {
    mappedArgs.push('--host');
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
      mappedArgs.push(rawArgs[++i]);
    }
  } else if (arg.startsWith('-H=')) {
    mappedArgs.push(`--host=${arg.slice(3)}`);
  } else if (arg === '-p') {
    mappedArgs.push('--port');
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
      mappedArgs.push(rawArgs[++i]);
    }
  } else {
    mappedArgs.push(arg);
  }
}

// Ensure --host and --port default to 0.0.0.0:3000 if not specified
if (!mappedArgs.includes('--host') && !mappedArgs.some((a) => a.startsWith('--host='))) {
  mappedArgs.push('--host', '0.0.0.0');
}
if (!mappedArgs.includes('--port') && !mappedArgs.some((a) => a.startsWith('--port='))) {
  mappedArgs.push('--port', '3000');
}

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(npx, ['vite', ...mappedArgs], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});

const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing Health Check ---');
  const health = await get('/api/health');
  console.log('Health:', health);

  console.log('\n--- 2. Testing Student Login ---');
  const loginRes = await post('/api/auth/login', {
    email: 'student@mindmirror.dev',
    password: 'Student1234'
  });
  console.log('Login Status:', loginRes.status);
  console.log('User ID:', loginRes.body?.user?.id);
  console.log('User Email:', loginRes.body?.user?.email);
  const token = loginRes.body?.token;

  console.log('\n--- 3. Testing Get Subjects ---');
  const subjectsRes = await get('/api/subjects', token);
  console.log('Subjects Status:', subjectsRes.status);
  console.log('Subjects Count:', subjectsRes.body?.length);
  if (Array.isArray(subjectsRes.body)) {
    subjectsRes.body.forEach(s => {
      console.log(` - Subject: ${s.name} (ID: ${s.id})`);
    });
  } else {
    console.log('Subjects response:', subjectsRes.body);
  }

  console.log('\n--- 4. Testing Registering a New User in Neon ---');
  const rand = Math.floor(Math.random() * 10000);
  const regEmail = `test.neon.${rand}@mindmirror.dev`;
  const regRes = await post('/api/auth/register', {
    email: regEmail,
    password: 'SecurePass123!',
    fullName: `Neon Tester ${rand}`
  });
  console.log('Register Status:', regRes.status);
  console.log('Registered User ID:', regRes.body?.user?.id);
  console.log('Registered User Email:', regRes.body?.user?.email);

  console.log('\n--- Verification Completed Successfully! ---');
}

run().catch(console.error);

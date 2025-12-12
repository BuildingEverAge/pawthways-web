const http = require('http');

// Test function to check API endpoints
function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\n=== ${description} ===`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content-Type: ${res.headers['content-type'] || 'Not specified'}`);
        console.log(`Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        resolve({ path, status: res.statusCode, success: res.statusCode === 200 });
      });
    });

    req.on('error', (err) => {
      console.log(`\n=== ${description} ===`);
      console.log(`Error: ${err.message}`);
      resolve({ path, status: 'ERROR', success: false, error: err.message });
    });

    req.end();
  });
}

// Start server in background and test
const { spawn } = require('child_process');

console.log('Starting server...');
const server = spawn('node', ['server.js'], { stdio: 'pipe' });

server.stdout.on('data', (data) => {
  console.log(`Server: ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
  console.log(`Server Error: ${data.toString().trim()}`);
});

// Wait for server to start, then test endpoints
setTimeout(async () => {
  console.log('\n🧪 Testing API endpoints...\n');
  
  const tests = [
    { path: '/api/admin-stats', desc: 'Static JSON - Admin Stats' },
    { path: '/api/transparency-csv', desc: 'Static CSV - Transparency Data' },
    { path: '/api/transparency-proofs', desc: 'Static JSON - Transparency Proofs' },
    { path: '/api/admin-stats.js', desc: 'Dynamic Handler - Admin Stats' },
    { path: '/api/transparency-proofs.js', desc: 'Dynamic Handler - Transparency Proofs' }
  ];

  const results = await Promise.all(tests.map(test => 
    testEndpoint(test.path, test.desc)
  ));

  console.log('\n📊 SUMMARY:');
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${results.length - successful}/${results.length}`);

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.path} - ${result.status}`);
  });

  // Cleanup
  server.kill();
  setTimeout(() => process.exit(0), 1000);
}, 3000);

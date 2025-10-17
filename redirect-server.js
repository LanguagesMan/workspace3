// Simple redirect server for port 3001 → 3002
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(301, {
    'Location': `http://localhost:3002${req.url}`
  });
  res.end();
});

server.listen(3001, () => {
  console.log('🔀 Redirect server running on port 3001 → 3002');
});

// Zero-dependency mock of the MiniShop API.
// It serves the Examples saved in ../api-tests.postman_collection.json, so the collection file is
// the single source of truth for the contract payloads. Matching mirrors a Postman mock server:
//   1. x-mock-response-name header -> the example with that name
//   2. otherwise method + path (and x-mock-response-code, if sent)
const http = require('http');
const fs = require('fs');
const path = require('path');

const COLLECTION = path.resolve(__dirname, '../api-tests.postman_collection.json');

function loadExamples() {
  const collection = JSON.parse(fs.readFileSync(COLLECTION, 'utf8'));
  const examples = [];
  (function walk(items) {
    for (const item of items) {
      if (item.item) walk(item.item);
      for (const ex of item.response || []) {
        examples.push({
          name: ex.name,
          method: ex.originalRequest.method,
          path: '/' + ex.originalRequest.url.path.join('/'),
          code: ex.code,
          headers: ex.header || [],
          body: ex.body || '',
        });
      }
    }
  })(collection.item);
  return examples;
}

function findExample(examples, req) {
  const method = req.method;
  const urlPath = new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '');
  const byName = req.headers['x-mock-response-name'];
  if (byName) return examples.find((e) => e.name === byName && e.method === method);
  const candidates = examples.filter((e) => e.method === method && e.path === urlPath);
  const byCode = Number(req.headers['x-mock-response-code']);
  if (byCode) return candidates.find((e) => e.code === byCode);
  return candidates.find((e) => e.code < 300) || candidates[0];
}

function createServer() {
  const examples = loadExamples();
  return http.createServer((req, res) => {
    req.resume(); // body is not needed for matching
    req.on('end', () => {
      const ex = findExample(examples, req);
      if (!ex) {
        res.writeHead(501, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `No saved example matches ${req.method} ${req.url}` }));
        return;
      }
      const headers = Object.fromEntries(ex.headers.map((h) => [h.key, h.value]));
      res.writeHead(ex.code, headers);
      res.end(ex.body);
    });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => console.log(`MiniShop mock API on http://localhost:${port} (serving examples from ${path.basename(COLLECTION)})`));
}

module.exports = { createServer };

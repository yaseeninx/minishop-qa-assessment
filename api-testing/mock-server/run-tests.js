// Starts the mock, runs the Postman collection with Newman against it, then stops the mock.
const path = require('path');
const newman = require('newman');
const { createServer } = require('./server');

const port = Number(process.env.PORT) || 3000;
const server = createServer().listen(port, () => {
  newman.run(
    {
      collection: require(path.resolve(__dirname, '../api-tests.postman_collection.json')),
      envVar: [{ key: 'baseUrl', value: `http://localhost:${port}` }],
      reporters: ['cli'],
    },
    (err, summary) => {
      server.close();
      if (err) throw err;
      process.exitCode = summary.run.failures.length ? 1 : 0;
    }
  );
});

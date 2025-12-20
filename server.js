// server.js — cPanel production server for Next.js
const http = require('http');
const { parse } = require('url');
const next = require('next');

// Production environment
process.env.NODE_ENV = 'production';

const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOSTNAME || '0.0.0.0';

// Initialize Next.js
const app = next({
  dev: false,
  dir: __dirname,
});

const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    server.listen(port, hostname, (err) => {
      if (err) {
        console.error('Server failed to start:', err);
        process.exit(1);
      }
      console.log(`> Next.js server running on http://${hostname}:${port}`);
      console.log(`> NODE_ENV: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error('Error preparing Next.js app:', err);
    process.exit(1);
  });

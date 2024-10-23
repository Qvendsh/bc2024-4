const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { program } = require('commander');
const superagent = require('superagent');

program
  .requiredOption('-h, --host <type>', 'server address')
  .requiredOption('-p, --port <number>', 'server port')
  .requiredOption('-c, --cache <path>', 'cache directory');

program.parse(process.argv);

const { host, port, cache } = program.opts();

fs.mkdir(cache, { recursive: true }).catch(console.error);

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('/');
  const code = urlParts[1];

  if (req.method === 'GET') {
    try {
      const filePath = path.join(cache, `${code}.jpg`);

      const data = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    } catch (error) {
      try {
        const response = await superagent.get(`https://http.cat/${code}`);
        const imageData = response.body;
        const filePath = path.join(cache, `${code}.jpg`);
        await fs.writeFile(filePath, imageData);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(imageData);
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    }
  } else if (req.method === 'PUT') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      const filePath = path.join(cache, `${code}.jpg`);
      const buffer = Buffer.concat(chunks);
      await fs.writeFile(filePath, buffer);
      res.writeHead(201, { 'Content-Type': 'text/plain' });
      res.end('Created');
    });
  } else if (req.method === 'DELETE') {
    try {
      const filePath = path.join(cache, `${code}.jpg`);
      await fs.unlink(filePath);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Deleted');
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});


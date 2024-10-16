
const http = require('http');
const { program } = require('commander');


program
    .version('1.0.0')
    .description('A simple command-line application for a web server')
    .requiredOption('-h, --host <type>', 'Server address')
    .requiredOption('-p, --port <number>', 'Server port')
    .requiredOption('-c, --cache <path>', 'Path to cache directory')
    .parse(process.argv);


const { host, port, cache } = program.opts();

console.log(`Server will run at http://${host}:${port}`);
console.log(`Cache directory: ${cache}`);

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');
});

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});

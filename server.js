const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    res.end(`
        <h1>Welcome to DevOps Project!</h1>
        <h2>Node.js Application Running Successfully</h2>
        <p>Deployed on AWS Ubuntu EC2</p>
        <p>Managed using PM2</p>
    `);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Application running on port ${PORT}`);
});

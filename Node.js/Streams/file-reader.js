
const http = require('http');
const map = require('through2-map');

if (process.argv.length !== 3) {
    process.exit(1);
}

const port = process.argv[2];

const server = http.createServer((req, resp) => {
        if (req.method !== 'POST') {
            return resp.end('must be POST \n');
        }

        req.pipe(map(chunk => {
            let text = chunk.toString();
            text = text.replace(/happy/gi, ':)');
            text = text.replace(/sad/gi, ':(');
            text = text.replace(/super/gi, 'awesome');

            return text;
        })).pipe(resp)

        req.on('error', resp.end);
    })
    .listen(port);
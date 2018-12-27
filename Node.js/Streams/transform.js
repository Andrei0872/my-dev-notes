
// node app.js file.txt
// Will modify the content and print the result 

const fs = require('fs');
// Create a Stream that is both readable and writable
const through = require('through2');

const usageError = () => {
    process.exit(1);
}

if(process.argv.length !== 4) {
    usageError();
}

const filepath = process.argv[2];
const readFile = fs.createReadStream(filepath);

const stream = through(write, end);

function write(buffer, encoding, next) {
    let text = buffer.toString();
    text = text.replace(/happy/gi, ':)');
    text = text.replace(/super/gi, 'awesome');
    this.push(text)
    next();
}

function end(done) {
    process.exit(0);
    done();
}

output = process.argv[3];

if(output === 'stdout') {
    readFile
        .pipe(stream)
        .pipe(process.stdout)
}




/**
 ** Streams
 * 
 * handle reading/writing files, network communications, any end-to-end information exchange
 * 
 * traditional way(of reading files): tell the program to read a file, the file is read into memory(from start to finish)
 * and you process it
 * 
 * using streams - you read it piece by piece,//* processing its content without keeping it all in memory
 * 
 */


//* Advantages
// Memory efficiency - don't need to load large amounts of data in memory before you are able to process it
// Time efficiency - less time to start processing data as soon as you have it, rather than waiting till 
//                   the whole data payload is available to start


// ===============================================================

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, resp) => {
    // fs.readFile(__dirname + '/file.txt', (err, data) => {
        // resp.end(data);
    // });

    // If the file is big, the operation will take quite a bit of time
    // fs.createReadStream() - create a readable stream toa file
    const stream = fs.createReadStream(__dirname + '/file.txt');
    // Take the source and pipe it to the destination(source)
    stream.pipe(resp);
});

// server.listen(3000);


// ===============================================================

// Types of streams
// Readable - stream you can pipe data from, but not pipe into; when pushing data into a readable stream, it is buffered
//          - until a consumer stats to read the data
// Writable - stream you can pipe into, but not pipe from
// Duplex - both pipe into and pipe from
// Transform - similar to a Duplex, but the output is transform of its input

// * Getting data from a readable stream
const Stream = require('stream');
const readableStream = new Stream.Readable();
const writableStream = new Stream.Writable();

readableStream.on('readable', () => {
    console.log(readableStream.read())
    // console.log(Buffer.concat([readableStream.read()]).toString()) // ​​​​​hi!hi!ho!​​​​​
})

writableStream._write = (chunk, encoding, next) => {
    console.log(chunk.toString())
    next();
}

readableStream.pipe(writableStream); 

readableStream.push('hi!');
readableStream.push('hi!');
readableStream.push('ho!');


// writableStream.write('hey!\n');

// When this disabled: console.log(chunk.toString()).
// writableStream.end()

// =============================================

const Stream = require('stream');
const readable = new Stream.Readable();

readable.on('data', (chunk, enc, err) => {
    console.log(Buffer.concat([chunk]).toString()) // 31231 312312
})

readable.on('close', (msg, data) => {
    console.log(msg)
    console.log(data)
});

readable._read = (data, enc, next) => {}

readable.push('31231')
readable.push('312312')

// =====================================================

const Stream = require('stream');
const fs = require('fs');

if (process.argv.length !== 3) {
    console.log('file path required!')
    process.exit(1);
}

const filepath = process.argv[2];

const readStream = fs.createReadStream(filepath);

readStream.on('data', chunk => {
    console.log('.......')
    console.log('reading chunk..')
    console.log('.......')
    // console.log(chunk.toString().length)
})

const writableStream = new Stream.Writable();

// let res = 'not defined';
let chunks = [];
writableStream._write = (chunk, encoding, next) => {
    // console.log(chunk.toString().length)
    res = chunk.toString();
    chunks.push(chunk.toString().length)
    next();
}

readStream.pipe(writableStream)

// This would also work 
setTimeout(() => {
    // console.log(res)
    console.log(chunks)
}, 100);

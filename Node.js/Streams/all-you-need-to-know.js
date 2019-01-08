/* 
streams - collections of data -
    might not be available all at once -
    don 't have to fit in memory -
    useful when working with large amount of data

readable - from which data can be consumed
writable - destination to which data can be written
transform - input(writable): output(readable)

pipe() - returns the destination stream(chaining)

a.pipe(b).pipe(c).pipe(d)
a - writable
b, c - duplex
d - writable

readable - by
default - in paused mode;
can be switched to flowing and back to paused when desired


when stream is paused - use read() to read from the stream
when the stream is in flowing mode - the data is continuously flowing and we have to listen to events to consume it

    in flowing mode - data can be lost
if there are no handlers

readableStream.on('data', () => {}) -
    switch to paused into flowing mode
removing data event handler -
    switch to flowing into paused mode
*/

// Implementing a writable stream 

const {
    Writable
} = require('stream')

// class MyWritableStream extends Writable {}

const outStream = new Writable({
    /**
     * 
     * @param chunk - buffer
     * @param encoding 
     * @param cb - call it after we're done processing the data chunk;
     *           - it signals whether the write was successful or not 
     */
    write(chunk, encoding, cb) {
        console.log(chunk.toString())
        cb();
    }
})

// process.stdin.pipe(outStream)

// =================================================

// Implementing a readable stream

const {
    Readable
} = require('stream')

const inStream = new Readable({
    // Push data on demand
    read() {
        this.push(String.fromCharCode(this.currentCharCode++))

        if (this.currentCharCode > 70)
            this.push(null)
    }
})

inStream.currentCharCode = 65 // A

//! Not very efficient - we're pushing all the data in the stream before piping it into process.stdout
// inStream.push('123')
// inStream.push('andrei')
// inStream.push(null) // No more data


// inStream.pipe(process.stdout)

// =================================================

// Implementing Duplex Streams

const {
    Duplex
} = require('stream')

const duplex = new Duplex({
    write(chunk, encoding, cb) {
        console.log(chunk.toString())
        cb();
    },
    read() {
        this.push(String.fromCharCode(this.currentCharCode++))

        if (this.currentCharCode > 90)
            this.push(null)
    }
});

duplex.currentCharCode = 65

// process.stdin - use the `echo` feature
// process.stdin.pipe(duplex).pipe(process.stdout)

// =================================================

// Implementing Transform Streams

const {
    Transform
} = require('stream')

const upperCaseTr = new Transform({
    transform(chunk, encoding, cb) {
        this.push(chunk.toString().toUpperCase())
        cb();
    }
})

// process.stdin.pipe(upperCaseTr).pipe(process.stdout)

// =================================================

// Streams Object Mode

/* 
objectMode - stream can accept any JavaScript object
*/

const commaSplitter = new Transform({
    readableObjectMode: true, // We are pushing an object, not a string!!!

    transform(chunk, encoding, cb) {
        this.push(chunk.toString().trim().split(','))
        cb();
    }
});

const arrayToObject = new Transform({
    readableObjectMode: true, // We're also pushing the object
    writableObjectMode: true, // Accept the object!!

    transform(chunk, encoding, cb) {
        const obj = {}
        for (let i = 0; i < chunk.length; i += 2) {
            obj[chunk[i]] = chunk[i + 1]
        }
        this.push(obj)
        cb()
    }
})


const ObjectToString = new Transform({
    writableObjectMode: true,

    transform(chunk, encoding, cb) {
        this.push(JSON.stringify(chunk) + '\n')
        cb()
    }
})

// process.stdin
//     .pipe(commaSplitter)
//     .pipe(arrayToObject)
//     .pipe(ObjectToString)
//     .pipe(process.stdout)

// =================================================

// Using built-in streams

const fs = require('fs')
const zlib = require('zlib')
const file = process.argv[2]

// Pass-through stream
const reportProgress = new Transform({
    transform(chunk, encoding, cb) {
        process.stdout.write('.');
        cb(null, chunk.toString()); // Alternative to this.push()
    }
})

fs
    .createReadStream(file)
    .pipe(zlib.createGzip())
    .pipe(reportProgress)
    .pipe(fs.createWriteStream('file3.tar.gz'))
    .on('finish', () => console.log('Done!'))

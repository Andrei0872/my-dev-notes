

// Zip files

const fs = require('fs')
const zlib = require('zlib')
const gzip = zlib.createGzip();

const readStream = fs.createReadStream(__dirname + '/big-file.txt', 'utf8');
const writeStream = fs.createWriteStream(__dirname + '/BIGfile.txt.gz');

readStream
    .pipe(gzip)
    .pipe(writeStream)


// Unzip files

const fs = require('fs')
const zlib = require('zlib')
const gunzip = zlib.createGunzip();

const readStream = fs.createReadStream(__dirname + '/BIGfile.txt.gz');
const writeStream = fs.createWriteStream(__dirname + '/uncompressed.txt');

readStream
    .pipe(gunzip)
    .pipe(writeStream)




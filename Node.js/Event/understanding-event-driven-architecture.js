
/* 
nodejs - designed for building distributed applications with many nodes(that 's why is named Node)

EVENTS:
    HTTP req, reps, and streams - implement EventEmitter module so they can provide a way to emit and listen to events
*/

const fs = require('fs')


const readFilesAsArray = function (name, cb = () => {}) {
    return new Promise((resolve, reject) => {
        if (typeof name !== 'string') {
            reject('Name must be a string!')
            return;
        }

        fs.readFile(__dirname + `/${name}`, (err, content) => {
            if (err) {
                reject(err);
                return cb(err);
            }

            const lines = content.toString().trim().split `\n`;
            resolve(lines);
            cb(null, lines)
        })
    })
}

readFilesAsArray('numbers.txt', (err, data) => {
        if(err) {
            throw err;
        }
        console.log('data: ', data) // ​​​​​data:  [ '10', '11', '12', '13', '14', '15', '16', '17', '18' ]​​​​​
    })
    .then(console.log)
    .catch(console.error)


// =======================================================

/*
EventEmitter - a module the facilitates communication between objects in Node
             - is at the core of Node async event-driven architecture

emitter obj - emits named events that cause prev registered listeners to be called

emitter obj - emitting name events
            - registering and unregistering listener functions


Events - allow multiple external plugins to build functionality on top of the app's core
*/

const EventEmitter = require('events')

// class MyEmitter extends EventEmitter {}
// const myEmitter = new MyEmitter();
// myEmitter.emit('something-happened')
// myEmitter.on() - add listener functions

class WithLog extends EventEmitter {
    execute(taskFunc) {
        console.log('Before executing')
        this.emit('begin')
        taskFunc()
        this.emit('end')
        console.log('After executing')
    }
}

const log = new WithLog()

// Adding listener functions
log.on('begin', () => console.log('about to execute!!!'))
log.on('end', () => console.log('done with execute!!!'))


// log.execute(() => console.log('during execution'))

/* 
* Synchronous behavior

​​​Before executing​​​​​ 
​​​​about to execute!!!​​​​​
​​​​​during execution​​​​​
​​done with execute!!!​​​​​
After executing​​​​​ 
*/

// ----

// log.execute(() => {
//     setImmediate(() => {
//         console.log('during execution')
//     }) 
// })

/* 
* Asynchronous behavior

​​​Before executing​​​​​ 
​​​​about to execute!!!​​​​​
​​done with execute!!!​​​​​
After executing​​​​​ 
​​​​during execution​​​​​
*/


// =========================================================

// Asynchronous events

class WithTime extends EventEmitter {
    // Callback solution
    // execute(asyncFn, ...args) {
    //     this.emit('begin')
    //     console.time('exec')
    //     asyncFn(...args, (err, data) => {
    //         if(err)
    //             return this.emit('error', err)

    //         this.emit('data', data)
    //         console.timeEnd('exec')
    //         this.emit('end')
    //     })
    // }   

    // Promise solution
    async execute(asyncFn, ...args) {
        this.emit('begin')

        try {
            console.time('exec')

            const data = await new Promise((res, rej) => asyncFn(...args, (err, data) => {
                if (err) return rej(err)
                res(data)
            }))
            this.emit('data', data);

            console.timeEnd('exec')
            this.emit('end')
        } catch (err) {
            this.emit('error', err)
        }
    }
}


const withTime = new WithTime()

withTime.on('begin', () => console.log('about to execute!!!'))
withTime.on('end', () => console.log('done with execute!!!'))
// The invocation is in order
withTime.on('data', (data) => {
    console.log(data.toString())
})
withTime.on('data', (data) => {
    console.log(data.toString().trim().split `\n`)
})
// This will be invoked first
withTime.prependListener('data', (data) => {
    console.log('data!!!', data.toString().trim().split `\n`)
})
withTime.on('error', (err) => console.log('an error has occurred!!!', err))

withTime.execute(fs.readFile, __dirname + '/numbers.txt')
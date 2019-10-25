# Node.js Notebook

- [Event loop](#event-loop)
- [Concepts](#concepts)
- [Event Emitter](#event-emitter)
- [Streams](#streams)
- [package.json](#package-json)
    - [Accessing fields inside `package.json`](#accessing-fields-inside-`package.json`)
    - [Restrict to a certain version of `npm` / `yarn`](#restrict-to-a-certain-version-of-npm-/-yarn)

## Event Loop

[Resource](https://dev.to/kapantzak/js-illustrated-the-event-loop-4mco) :sparkles:

* its job is to look into the call stack and **determine** if the **call stack** is **empty or not**
    * if **empty**, it looks into the **message queue** to see if there's **any pending call back waiting to be executed**

* in case of DOM events - the event listener **sits in the web APIs environment waiting** for a certain event to happen; when that event happens, the **cb function** is **placed in the message queue**, waiting to be executed

* under the hood it uses `libuv`, which abstracts api/syscalls for async non-blocking I/O actions; it also has a **thread pool**(of size 4 by default)

### Introduction

* the event loop, web APIs and the message queue(here goes stuff like: **callbacks**, **DOM events** etc..) are part of browser's JS runtime environment **or** Node.js JS runtime environment

* in Node.js - **web APIs are replaced by C/C++ APIs**

### Call Stack

* a place in memory

* **keeps track** of the **function executing** at that time and the **functions** that are going to be **executed later**

* follows the **LIFO** principle

### Heap

* where the memory allocation happens for the variables that you define

### Message/Event/Event loop queue

* is a **list of messages** to be processed(executed)

* each **message** has an **associated function** which gets called in order to handle the message

* a **message** is **added** when an **event**(watched by an *event listener*) **occurs**

* when the message is handled, it is **removed from the queue** and its corresponding function is called with the message as an input parameter

* designed for callbacks

### Job Queue

* designed for promises

* has **higher priority** **than** the **event loop queue**; as a result, **promise jobs** inside the job queue will be **executed before** the **callbacks** inside the **message queue**

<details>
<summary>Example</summary>
<br>


```typescript
const bar2 = () => {
    console.log('bar');
};

const baz2 = () => {
    console.log('baz');
};

const foo2 = () => {
    setTimeout(bar2, 0);
    
    new Promise((resolve, reject) => {
            resolve('Promise resolved');
        })
        .then(res => console.log(res))
        .catch(err => console.log(err));

    baz2();
};

foo2();
/*
--->
baz
Promise Solved
bar
*/
```
</details>



### Macrotask

* one macrotask should be processed in one cycle of the event loop

* after a macrotask has finished, all the available microtask should be processed within the same cycle

### Microtask

* microtasks can queue more microtasks which will be run one by one, until the microtask is exhausted

* when the stack is empty: microtasks are run

* when the microtask queue is empty: a pending macrotask handler can be run

### `setImmediate()`

* puts the callback function **ahead** of the **job queue**

<details>
<summary>Example</summary>
<br>


```typescript


const p = (time = 1000) => new Promise(r => setTimeout(r, time, 'result from promise ' + time));

p()
    .then(console.log)

p(0)
    .then(console.log)

setTimeout(() => {
    console.log('timeout 1')
    setImmediate(() => {
        console.log('immediate 1')
    });
}, 0);

setTimeout(() => {
    console.log('timeout 2')
    setImmediate(() => {
        console.log('immediate 2')
    });
}, 0);

setTimeout(() => {
    console.log('timeout 3')
}, 0);

setImmediate(() => {
    console.log('immediate first!');
});
/*
--->
immediate first!
result from promise 0
timeout 1
timeout 2
timeout 3
immediate 1
immediate 2
result from promise 1000
*/
```
</details>


### `process.nextTick()`

* puts its callback at the **front** of the job queue

<details>
<summary>Example</summary>
<br>


```typescript
const p = (time = 1000) => new Promise(r => setTimeout(r, time, 'result from promise ' + time));

p(0)
    .then(console.log)

setTimeout(() => console.log('setTimeout'), 0);

setImmediate(() => console.log('setImmediate'));

process.nextTick(() => console.log('nextTick!'))


/* 
--> 
nextTick! ​​​​​
setImmediate ​​​​​
result from promise 0 
setTimeout ​​​​​
*/
```
</details>

### The Web API

* offers methods such as `setTimeout()`, `alert()` etc...

---

## Concepts

### thread

* a unit of operations that the CPU has to perform

### OS Scheduler

* decides **which thread** to be used by a process

---

## Event Emitter

* `events` module - facilitates communication between objects in Node

* is at the core of Node async event-driven architecture

<details>
<summary>Synchronous Behavior</summary>
<br>


```typescript
const EventEmitter = require('events')

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


log.execute(() => console.log('during execution'))

/* 
-->
Before executing​​​​​ 
​​​​about to execute!!!​​​​​
​​​​​during execution​​​​​
​​done with execute!!!​​​​​
After executing​​​​​ 
*/
```
</details>

---

## Streams

:sparkles:[Resouce](https://stackoverflow.com/questions/18335499/nodejs-whats-the-difference-between-a-duplex-stream-and-a-transform-stream)

✨[Resouce](https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93/)

* **stream** - a collection of data; might not be available all at once
    * **readable** - from which data can be consumed
    * **writable** - destination to which data can be written
    * **duplex** 
        * both readable and writable
        * the reads and writes happen **independently**
    * **transform** 
        * a duplex stream that can modify/transform the data as it is written and read
        * can be read from and written to
        * the output is the transformation of its input

* does not have to fit in memory

* useful when working with large amount of data
    * reading/writing to files
    * network communication

* `pipe()` - returns the destination stream(chaining)

### Writable Stream

<details>
<summary>Example</summary>
<br>


```typescript
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

process.stdin.pipe(outStream)
```
</details>

### Readable Stream

<details>
<summary>Example</summary>
<br>


```typescript
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

inStream.pipe(process.stdout)
```
</details>

### Duplex Stream

<details>
<summary>Example</summary>
<br>


```typescript
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

process.stdin.pipe(duplex).pipe(process.stdout)
```
</details>

### Transform Stream

<details>
<summary>Example</summary>
<br>


```typescript
const {
    Transform
} = require('stream')

const upperCaseTr = new Transform({
    transform(chunk, encoding, cb) {
        this.push(chunk.toString().toUpperCase())
        cb();
    }
})

process.stdin.pipe(upperCaseTr).pipe(process.stdout)
```
</details>

### Stream Object Mode

<details>
<summary>Example</summary>
<br>


```typescript

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

process.stdin
    .pipe(commaSplitter)
    .pipe(arrayToObject)
    .pipe(ObjectToString)
    .pipe(process.stdout)
```
</details>

### Send file and receive file modified

<details>
<summary>Example</summary>
<br>


```typescript
const http = require('http');
const map = require('through2-map');

const port = 3000;

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
```
</details>

---

## package json

### Accessing fields inside `package.json`

```json
{
"config": {
    "me": "andrei"
    },
"scripts": {
    "test": "echo $npm_package_config_me"
    },
} // npm run test: `andrei`
```

### Restrict to a certain version of `npm` / `yarn`

```json
{
    "engines": {
        "yarn": ">=1.17<=1.18"
    }
}
```

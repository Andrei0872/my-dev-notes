# Node.js Notebook

- [Event loop](#event-loop)
- [Event Emitter](#event-emitter)

## Event Loop

* its job is to look into the call stack and **determine** if the **call stack** is **empty or not**
    * if **empty**, it looks into the **message queue** to see if there's **any pending call back waiting to be executed**

* in case of DOM events - the event listener **sits in the web APIs environment waiting** for a certain event to happen; when that event happens, the **cb function** is **placed in the message queue**, waiting to be executed

### Introduction

* the event loop, web APIs and the message queue(here goes stuff like: **callbacks**, **DOM events** etc..) are part of browser's JS runtime environment **or** Node.js JS runtime environment

* in Node.js - **web APIs are replaced by C/C++ APIs**

### Concepts

#### Message/Event/Event loop queue

* is a **list of messages** to be processed(executed)

* each **message** has an **associated function** which gets called in order to handle the message

* when the message is handled, it is **removed from the queue** and its corresponding function is called with the message as an input parameter

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

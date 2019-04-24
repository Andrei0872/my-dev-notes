# Node.js Notebook

## Contents

- [Event Loop](#event-loop)

---

### Event Loop

**Knowledge**

* one macrotask should be processed in one cycle of the event loop

* after a macrotask has finished, all the available microtask should be processed within the same cycle

* microtasks can queue more microtasks which will be run one by one, until the microtask is exhaused

* when the stack is empty: microtasks are run

* when the microtask queue is empty: a pending macrotaks handler can be run

**`process.nextTick()`**

[Resource](https://dev.to/logicmason/settimeout-vs-setimmediate-vs-process-nexttick-3lj2) :sparkles:

* `process.nextTick()` - puts its callback at the front of the event queue; it will execute after the current loop, but before any I/O events or timers.
```javascript
const racer = function () {
    Promise.resolve().then(() => console.log('just a promise'))
    setTimeout(() => console.log('setTimeout'), 0);
    setImmediate(() => console.log('setImmediate'));
    process.nextTick(() => console.log('nextTick!'))

    console.log('current event loop')
}

racer();
/* 
--> 
current event loop
nextTick!
just a promise
setTimeout
setImmediate
*/
```

// https://blog.bitsrc.io/understanding-asynchronous-javascript-the-event-loop-74cd408419ff

//* Understanding event loop in JS

/**
 * 
 * JS - single threaded - only one thing can happen at a time
 * JS engine can only process one statement at a time in a single thread
 * 
 */


// How synchronous JS code executes inside the JS engine
const second = () => {
    console.log('Hello there!');
}
const first = () => {
    console.log('Hi there!');
    second();
    console.log('The End');
}
first();


/**
 ** Execution Context
 * 
 * abstract concept of an environment where the JS code is evaluated and executed
 * the function code executes inside the function execution context
 * each function has its own execution context
 * 
 */

/**
 *
 ** Call Stack
 * LIFO structure, which is used to store all the execution context created during the code execution
 * JS has a single call stack
 * items can be added/removed from the top of the stack only
 * 
 */


/**
 *  event loop, web APIs and the message queue(for example: callbacks, onClick..)
 * are part of browser's JS runtime environment or Nodejs JS runtime environment
 * 
 * In Nodejs - web APIs are replaced by C/C++ APIs
 */

/**
 ** Message queue
 * is a list of messages to be processed(executed)
 * each message has an associated function which gets called in order to handle the message
 * 
 * when the message is handled, it is removed from the queue and its corresp function is called with the message as an input param
 */


const networkRequest = () => {
    setTimeout(() => {
        console.log('Async Code');
    }, 2000);
};
console.log('Hello World');
networkRequest();
console.log('The End');

/**
 ** Event Loop
 * its job is to look into the call stack and determine if the call stack is empty or not
 ** if empty, it looks into the message queue to see if there's any pending call back waiting to be executed 
 * 
 *   in case of DOM events - the ev listener sits in the web APIs environment
 * waiting for a certain event to happen, and 
 ** when that event happens, the cb func is placed in the message queue, waiting to be executed
 *
 * Again, the ev loop checks if the call stack is empty...
 * 
 */

console.log('==================================')

//* Deferring Function Execution
// We can use setTimeout to defer the function execution until the stack is clear


const bar = () => {
    console.log('bar');
}
const baz = () => {
    console.log('baz');
}
const foo = () => {
    console.log('foo');
    setTimeout(bar, 0);
    baz();
}
foo();
/*
Output:
foo
baz
bar 
*/

console.log('===============================================')

/**
 ** ES6 Job Queue
 * used by Promises in JS
 * job queue has a higher priority than the message queue
 *
 *  promise jobs inside the job queue will be executed before the callbacks inside the message queue
 * 
 */


const bar2 = () => {
    console.log('bar');
};
const baz2 = () => {
    console.log('baz');
};
const foo2 = () => {
    console.log('foo');
    setTimeout(bar2, 0);
    new Promise((resolve, reject) => {
            resolve('Promise resolved');
        }).then(res => console.log(res))
        .catch(err => console.log(err));
    baz2();
};
foo2();
/*
Output :
foo
baz
Promise Solved
bar
*/


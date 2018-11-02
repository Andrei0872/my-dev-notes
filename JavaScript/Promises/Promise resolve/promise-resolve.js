
//* Promise.resolve()

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve

/*
- returns a PROMISE obj that is resolved with the given value
if{
    - the value == Promise; return that promise
    - the value == thenable(has a "then" method); the returned promise will follow that thenable
    - otherwise; the returned promise will be fulfilled with the value
}   
*/

//* Returns a Promise that is resolved

var promise1 = Promise.resolve([1,2,3]);

promise1.then((val) => {
    console.log(val) // [1,2,3]
});


//* Resolving another promise
var original = Promise.resolve(33); // The promise is fulfilled with the value

// Same here
var cast = Promise.resolve(original);

cast.then((val) => {
    // This will be printed afterwards 
    console.log(val) // 3
});

// This will pe printed first
console.log(original === cast) // true
// The order of logs : "then" handlers are called asynchronously


//* Resolving thenables and throwing Errors
// Resolving a thenable object
var p1 = Promise.resolve({
    then : function(onFulfill,onReject) {onFulfill("Fulfilled!");}
});

console.log(p1 instanceof Promise); // true ==> obj casted to a promise

p1.then(val => {
    console.log(val) // Fulfilled!
});


// Thenable throws before callback
var thenable = {
    then : function (resolve) {
        throw new TypeError("Throwing");
        resolve("Fulfilled!");
    }
}

// Return the a promise that will follow the thenable
var p2 = Promise.resolve(thenable);
p2.then(v => {
    // Not called
}, err => {
    console.log(err) //  [TypeError: Throwing]
});

// Thenable throws after callback
var thenable2 = {
    then : function (resolve) {
        resolve("Fulfilled!!");
        throw new TypeError("Throwing");
    }
}

var p3 = Promise.resolve(thenable2);
p3.then(v => {
    console.log(v)
}, err => {
    // Not called
});



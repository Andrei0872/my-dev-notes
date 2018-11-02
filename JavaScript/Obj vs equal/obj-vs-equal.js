

// https://medium.com/quick-code/why-object-is-is-better-than-and-e6c82deb12cc


console.log('' == 0) // true
console.log(null == undefined) // true
console.log([1] == true) // true

// Using === - we're getting more precision, but it is not enough
console.log(NaN === NaN) // false

// Object.is() - more precise than '==='
console.log(Object.is('',0)) // false
console.log(Object.is(null,undefined)) // false
console.log(Object.is(true,true)) // true
console.log(Object.is([1],true)) // false
console.log(Object.is(NaN,NaN)) // true


//* Polyfill

if(typeof Object.is_v2 !== "function") {
    Object.is_v2 = function (x,y) {
        if(x === y) {
            return x !== 0 || 1 / x === 1 / y;
        } else {
            // NaN === NaN
            return x !== x && y !== y;
        }
    };
}

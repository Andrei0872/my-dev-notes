
// https://itnext.io/writing-lighter-faster-functions-c631739af349

//* Strategies for improvenement
// Do less
// Do it less often
// Do it faster

function isStooge(name) {
    const STOOGES = ['Larry', 'Curly', 'Moe'];
    return STOOGES.includes(name);
}

console.log(isStooge('Moe')); 
console.log(isStooge('Joe'));
console.log(isStooge('Larry'));
//! The "STOOGES" array is createt every time the function runs
/**
 * That means with every call, the function reallocates memory for an array of 3 items,
 * uses it once, and then leaves it for garbage collection
 * Not a mem leak, but still an unnecessary expense
 * Static values - woudl be best if they were delcared once and merely referenced
 * each time they were needed
 */

//* In a closure
// The variable will only be instantiated once and the reference will be used inside the function
const isStooge2 = (() => {
    const STOOGES = ['Larry', 'Curly', 'Moe'];
    return  (name) => STOOGES.includes(name);
})();

console.log(isStooge2('Moe')); 
console.log(isStooge2('Andrei')); 
console.log(isStooge2('Curly')); 



//* In a module
// It will create a closure for all the stuff in them
// that are not exported

// import  { isStooge3 } from './stooge';
// console.log(isStooge3('Moe'))



//* In a Property of a function
// You can attach the variable to the function and reference
// that property; that's because functions are still objects in JS

function isStooge4 (name) {
    return isStooge4.STOOGES.includes(name);
}

isStooge4.STOOGES = ['Larry', 'Curly', 'Moe'];
console.log(isStooge4('Moe'))
console.log(isStooge4('Andrei'))
console.log(isStooge4('Curly'))
// If the function itself will be instantiated multiple times,
// you can attach the variable to the function's prototype to prevent the reinstantiation



//* In a Class Static Property
// Static props - props which can be refernced within the class's functions by "this" 


class StoogeChecker {
    static STOOGES = ['Larry', 'Curly', 'Moe']
    static isStooge(name) {
      return this.STOOGES.includes(name);
    }
  }

StoogeChecker.isStooge('Moe');
StoogeChecker.isStooge('Joe');
StoogeChecker.isStooge('Larry');
StoogeChecker.isStooge('Barry');
StoogeChecker.isStooge('Curly');
StoogeChecker.isStooge('Burly');


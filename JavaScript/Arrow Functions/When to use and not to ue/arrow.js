
// https://codeburst.io/javascript-arrow-functions-how-why-when-and-when-not-to-use-them-fb8c2de9dbdc

//* JS Arrow functions : How, Why, When AND WHEN NOT to use them

// * What are js anonymous functions ? 
/*
- anonymous function with their own special syntax that accept a fixed
  number of args and operate in the CONTEXT of their ENCLOSING SCOPE 
  (the function or other code where are defined)
*/

//! Arrow functions don't have their own execution context

// "this", "arguments" : inherited from their parent function


const test = {
    name : "test obj",
    createAnonFunc : function () {
        return function (){
            console.log(this.name) // undefined
            console.log(arguments) // {}
        }
    },
    createArrowFunc : function () {
        return  () => {
            console.log(this.name) // test obj
            console.log(arguments) // object { '0': 'hello', '1': 'world' }
        }
    },
    justAfunc : function (...args) {
        console.log(this.name) // test obj
        console.log(arguments) //  { [Iterator]  '0': 'andrei', '1': 'are', '2': 'mere' }
        console.log(args) //  [ 'andrei', 'are', 'mere' ]
    }
};

const anon = test.createAnonFunc("hello","world");
const arrow = test.createArrowFunc("hello","wolrd");
test.justAfunc("andrei","are","mere");

/**
 * Has its own function context
 * There is no reference to "this.name" of the test object, nor to the arguments called when creating it
 */
anon();

/**
 * Has the exact same function context as the function that created it, giving it access to 
 * both the arguments and the test object
 */
arrow();

//* Where Arrow Functions Improve Your code
/*
- for lambda functions
- for functions that get applied over and over again to items in a list
*/
const words = ['hello', 'WORLD', 'Whatever']; 
const downCaseWords = words.map(word => word.toLowerCase());
console.log(downCaseWords)


//* Promises and Promise Chains
/*
Promises - make it far easier to manage async code
Using promises still require defining functions that run after your async code or call completes
*/

//!
// this.doSomethingAsynC().then(result => {
//     this.storeResult(result);
// });


//! Where You Should Not Use Arrow Functions

//! In methods on an object
class Counter {
    counter = 0;
    handleClick = () => {
        this.counter++;
    }
}

/**
 * If "handleClick" was called with by ann EVENT HANDLER rather
 * than in the context of an instance of "Counter", it would still
 * have access to the instance's data
 * 
 *! That function behaves in a number of ways that are not intuitive
 */

 //* Use a regular function and if necessary bind it the instance in the constructor

class CounterGood {
    counter = 0;

    handleClick () {
        this.counter++;
    }

    constructor() {
        this.handleClick = this.handleClick.bind(this);
    }

}


//! Deep Callchains
/**
 * This isn't too bad if your function only goes one level down(inside of an iterator)
 * but if you're defining all of your functions as AF and calling back and forth between them,
 * you'll be pretty stuck when you hit a bug annd just get error messages like this
{anonymous}() 
{anonymous}() 
{anonymous}() 
{anonymous}() 
{anonymous}()
 */

//! Functions With Dynamic Context - where "this" is bound dynamically
/*
- event handlers - "this" is set to the event's "currentTarget" value
- jQuery methods set "this" to the DOM element that has been selected 
- Vue.js - "this" is set to be the Vue Component
*/









//* Bind function

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind

/**
 * Creates a new function that, when called, has its "this" keyword set
 * to the provided value, with a given sequence of arguments preceding any 
 * provided when the new function is called
 */

//* Syntax
/*
function.bind(thisArg[,arg1[,arg2[,]]])
-thisArg - the value to be passed as the "this" when the bound function is called
*/

//* Return value : a copy of the given function with the specified "this" value and initial arguments

/**
 * * Description
 * bind() - creates a bound function(BF)
 * BF - exotic function object that wraps the original function obj
 * Calling BF - results in the execution of its wrapped function
 * 
 */


// * Creating a bound function
var module = {
    x: 81,
    getX: function() { return this.x; }
  };
  
console.log(module.getX()) // 81

var retrieveX = module.getX;
console.log(retrieveX()) // undefined - global scope

// Create a new function with "this" bound to module
var boundGetX = retrieveX.bind(module);
console.log(boundGetX()) // 81
//--------------------------------------------


//* Partially applied function
/*
The arguments follow the provided "THIS" and are then inserted at the start
of the arguments passed to the target function, followed by the arguments
passed to the bound function, whenever the BOUND FUNCTION IS CALLED
*/
function list () { // This is the target function
    console.log(arguments)
    return Array.prototype.slice.call(arguments)
}

var list1 = list(1,2,3)
console.log(list1) // [1,2,3]

var leadingFunc = list.bind(null,36); // Inserted at the start of the arguments passed to the target function
var list2 = leadingFunc() // This is the bound function
console.log(list2) // [36]

var list3 = leadingFunc(1,2,3)
console.log(list3) // [36,1,2,3]
//--------------------------------------------


//* With setTimeout() - try this in your browser
/*
Within  window.setTimeout(), by default, the "this" keyword will be set to
the "window" object
When working with class methods that require "this" to refer to class instance
you might //* explicitly bind "this" to the callback function, in order to maintain the instance
*/

function LateBloomer() {
    this.petalCount = Math.floor(Math.random() * 12) + 1;
}

// Declare bloom after a delay of 1 second
LateBloomer.prototype.bloom = function () {
    window.setTimeout(this.declare.bind(this),1000)
}

LateBloomer.prototype.declare = function () {
    console.log("I'm a flower with " + this.petalCount + " petals !")
}

var flower = new LateBloomer();
// flower.bloom();
//--------------------------------------------



//*  Bound functions used as constructors

function Point(x, y) {
    this.x = x;
    this.y = y;
  }
  
Point.prototype.toString = function() { 
return this.x + ',' + this.y; 
};
  
var p = new Point(1,2);
console.log(p.toString()) // 1,2

// When a bound function is used to construct a value, the provided "this" is ignored

var YAxisPoint = Point.bind(null,0)

var axisPoint = new YAxisPoint(5);
console.log(axisPoint.toString()) // 0,5
console.log(axisPoint instanceof Point) // true
console.log(axisPoint instanceof YAxisPoint) // true
//--------------------------------------------

//* Creating shortcuts
var unboundSlice = Array.prototype.slice;
// slice - a bound function of Function.prototype
//         with the "this" value set to the "slice" method of Array.prototype
var slice = Function.prototype.apply.bind(unboundSlice)
let arr = [1,2,3]
let copy = slice(arr)
// let copy = slice("andrei") ['a','n'..etc]
console.log(copy) // [1,2,3]
//--------------------------------------------

var sl2 = Function.prototype.apply.bind(Array.prototype.slice)([1,2,3])
console.log(sl2) // [1,2,3]

var test = Function.prototype.call.bind(Array.prototype.slice)("andrei")
console.log(test) // [ 'a', 'n', 'd', 'r', 'e', 'i' ]

var str = "andrei"
let arr2 = String.prototype.split.call(str,'')
console.log(arr2)

let arr3 = Array.prototype.map.call(str,function(e) {
    console.log(e)
})




// https://medium.com/@charpeni/arrow-functions-in-class-properties-might-not-be-as-great-as-we-think-3b3551c440b1

//* Arrow Functions in Class Properties Might Not Be As Great As We Think


// class A {
//     static color = "red";
    
//     counter = 0;
  
//     handleClick = () => {
//       this.counter++;
//     }
    
//     handleLongClick() {
//       this.counter++;
//     }

// }

// GETS TRANSPILED TO

class A {

    constructor() {
      this.counter = 0;
  
      this.handleClick = () => {
        this.counter++;
      };
    }
    
    handleLongClick() {
      this.counter++;
    }

  }
  A.color = "red";

/**
 * handleClick - moved in the constructor - such as an instance property
 * For our usual function method handleLongClick, nothing change.
 */

// Some tests
console.log(A.prototype.handleLongClick) // Defined
console.log(A.prototype.handleClick) // undefined

// handleClick - defined on the initializationn by the constructor, nnot in the prototype

// Inheritance
class A {
    handleClick = () => {
      console.log("A.handleClick");
    }
  
    handleLongClick() {
      console.log("A.handleLongClick");
    }
  }
  
  console.log(A.prototype);
  // {constructor: ƒ, handleLongClick: ƒ}
  
  new A().handleClick();
  // A.handleClick
  
  new A().handleLongClick();
  // A.handleLongClick
  
//! If class B inherits from class A, handleClick won't be in the property and we can't call super.handleClick form our AF handleClick

class B extends A {
    handleClick = () => {
      super.handleClick();
  
      console.log("B.handleClick");
    }
  
    handleLongClick() {
      super.handleLongClick();
  
      console.log("B.handleLongClick");
    }
  }
  
  console.log(B.prototype);
  // A {constructor: ƒ, handleLongClick: ƒ}
  
  console.log(B.prototype.__proto__);
  // {constructor: ƒ, handleLongClick: ƒ}
  
  new B().handleClick();
  // Uncaught TypeError: (intermediate value).handleClick is not a function
  
  new B().handleLongClick();
  // A.handleLongClick - from the parent Class
  // B.handleLongClick

//! If C inherits from A, but implements handleClick as a function instead of ann Arrow Function
//! handleClick will only execute super.handleClick()
//* It's because the instantiation of handleClick in the constructor of our parent class overrides it

// C.prototype.handleClick() will call our implementation but will fail with the previous error: Uncaught TypeError: (intermediate value).handleClick is not a function .

class C extends A {
    // Written as a function
    handleClick() {
      super.handleClick();
  
      console.log("C.handleClick");
    }
  }
  
  console.log(C.prototype);
  // A {constructor: ƒ, handleClick: ƒ}
  
  console.log(C.prototype.__proto__);
  // {constructor: ƒ, handleLongClick: ƒ}
  
  new C().handleClick();
  // A.handleClick


//* Performance

// Usual functions - defied in the property and will be shared across all instances

// N components share the same method ; if all comp get clicked, the method is called N times
// but it will call the same prototype
// Calling the same method multiple times across the prototype => the Js engine can optimize it


// For the arrow function in class properties, if we're creating N components, these
//! N components will also create N functions
// Class properties are initialized in the constructor

//* Conclusions
/*
- arrow functions are transpiled into the constructor
- arrow functions in class props won't be iin the protortpe and we can't call them with "super"
- arrow funtions are slower than bound function, and both are much slower than usual function
*/

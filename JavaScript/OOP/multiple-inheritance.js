// https://stackoverflow.com/questions/29879267/es6-class-multiple-inheritance

class A {
    foo() {
        console.log(`from A -> inside instance of A: ${this instanceof A}`);
    }
    funcA() {
        console.log('hello from a')
    }
}

const B = (B) => class extends B {
    foo() {
        if (super.foo) super.foo();
        console.log(`from B -> inside instance of B: ${this instanceof B}`);
    }
    funcB() {
        console.log('hello from B')
    }
};


// C extends A, B
class C extends B(A) {
    constructor() {
        super();
    }
}

new C().funcB(); // hello from B
new C().funcA(); // hello from a

// =========================================================

class Test {
    func() {
        console.log('hello from test');
    }
}

class Temp extends Test {}

// const mix = (cls) => class extends cls {} 
function mix(cls) {
    return class extends cls {
        // Content..
    }
}

class FinalTest extends mix(Temp) {
    constructor() {
        super();
        super.func(); // hello from test
        this.func(); // hello from test
    }
}

new FinalTest()

// =================================================

class Person {
    constructor(n) {
        this.name = n;
    }
}
let mySym = Symbol('passion');
class Male {
    constructor(s = 'male') {
        this.sex = s;
        this[mySym] = 'webdev';
    }

    // static [Symbol.hasInstance] (lho) {
    //     return Array.isArray(lho);
    // }

    getPrivateData() {
        return this[mySym];
    }
}
class Child {
    constructor(a = 12) {
        this.age = a;
    }
    tellAge() {
        console.log(this.name + ' is ' + this.age + ' years old.');
    }
}




// Had some more fun here a little bit
console.log(Object.getOwnPropertyNames(new Male)) // ['sex']
console.log(Object.getOwnPropertyNames(Male)) //  [ 'length', 'prototype', 'name' ]
console.log(Object.getOwnPropertySymbols(Male)) // []
console.log(Object.getOwnPropertySymbols(new Male)) // [Symbol(passion)]
// console.log([] instanceof Male) // true

let obj = new Male()
console.log(Object.getOwnPropertySymbols(obj))  // [Symbol(passion)]
console.log(obj.getPrivateData()) // webdev


console.log(Object.getOwnPropertyDescriptor(Male,'name'))
// { value: 'Male',
// writable: false,
// enumerable: false,
// configurable: true }


Object.defineProperty(Person, 'name', Object.getOwnPropertyDescriptor(Male,'name'));
console.log(Object.getOwnPropertyNames(Person))
let obj2 = new Male();
console.log(obj2 instanceof Person)
console.log(Person.prototype) // Male - because of what happens at line 113
console.log(Male.prototype) // Male


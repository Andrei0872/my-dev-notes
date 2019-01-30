
// Store private properties on classes 
// It prevents their use, but it won't stop people inspecting the source

class MyCls {
    constructor () {
        this[Symbol('name')] = 'andrei'
        return new Proxy(this, this);
    }

    get (target, prop, receiver) {
        if (prop.startsWith("_")) return;
        return Reflect.get(target, prop, receiver)
    }

    _privateMethod () {
        return 'this is private';
    }

    publicMethod () {
        return 'this is public';
    }

    [Symbol('prop')] () {
        return 'from symbol'
    }
}

const myObj = new MyCls();

console.log(myObj.publicMethod())
// console.log(myObj.privateMethod()) // Won't work

// Getting methods (won't work for symbols)
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(myObj))) // [ 'constructor', 'get', '_privateMethod', 'publicMethod' ]​​​​​

// Getting symbol methods
console.log(Object.getOwnPropertySymbols(Object.getPrototypeOf(myObj))) // ​​​​​[ Symbol(prop) ]​​​​​

// Getting symbol properties
console.log(Reflect.ownKeys(myObj)) // ​​​​​[ Symbol(name) ]​​​​​
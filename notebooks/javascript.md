# JavaScript Notebook

- [Concepts](#concepts)
    * [Debouncing and Throttling](#debouncing-and-throttling)
    * [thunk functions](#thunk-functions)
- [Objects and Classes](#objects-and-classes)
    * [Extending Objects](#extending-objects)
- [Functions](#functions)
- [Asynchronous Programming](#asynchronous-programming)
- [Iterables and Generators](#iterables-and-generators)
- [Proxy](#proxy)
- [Symbol](#symbol)
- [Typed Arrays](#typed-arrays)
- [:sparkles:Cool Stuff :sparkles:](#cool-stuff)
    - [Replacing Strings](#replacing-strings)
- [DOM](#dom)
    - [Script tags](#script-tags)
- [Closures](#closures)
- [Scope](#scope)

## Concepts

### Execution Context

* where the JS code is evaluated and executed

* the function code executes inside the function execution context

* each function has its own execution context

### Call Stack

* **LIFO** structure, which is used to store all the execution context created during the code execution

* JS has a single call stack

### Debouncing and Throttling

* techniques to control how many times we allow a function to be executed over time

#### Debounce

* execute this function only if X ms have passed without it being executed

#### Throttle

* execute this function at most once every X ms 

* don't allow our function to execute more than once every X ms

* ensures the execution of the function regularly, at least every X ms

### compiled vs interpreted

* **compiled**: other program converts the code into machine code

* **interpreted**: an interpreter reads the code line by line

### thunk functions

- **delay** the **evaluation** of a value

<details>
<summary>Example</summary>
<br>


```typescript
const config = {
    // foo: Foo //! Error: Class 'Foo' used before its declaration
    foo: () => Foo // Thunk functions to the rescue!
};

// Classes are not hoisted
class Foo { }

console.log(config.foo().prototype)
```
</details>

---

## Objects and Classes

### Knowledge

**new**  
* creates an empty {}
* assigns the property `prototype` of this empty object to the `myFunc` prototype property

**__proto__**
* points to the prototype object of a function that created this object
* exposed to the object instance

**prototype**
* accessed by `<function-name>.prototype`
* has an inherent property called `constructor` which is a pointer to the function itself
* a home where are stored methods and props that are available across all child objects

**constructor**
* returns the function that created the instance


### Deep Copy vs Shallow Copy

**Shallow Copy(bit-wise copy)**

* a new object is created and that object has an exact copy of the values in the original obj; 
if any references are other objects just the reference addresses are copied

* copy just the 'immediate' members, but keeping the same reference

**Shallow Copy(member-wise copy)**

* visit each member and explicitly copy it

* occurs when an object is copied along with the objects to which it refers

* allocates different memory location

* recursively perform shallow copies until everything is a new copy of the original

### `Object.valueOf()`
* called when a **numeric operator** is applied to the object

<details>
<summary>Example</summary>
<br>


```typescript
const fibonacci = () => {
    let prev = 0, curr = 1;

    const compute = () => {
        [prev, curr] = [curr, prev + curr]
        return compute
    }

    compute.valueOf = () => curr

    return compute
}

// 0 1 1 2 3 5 8 13 21
const fibGen = fibonacci()
// n-th fibonacci number
let n = 7, res
while(n-- > 1) {
    res = fibGen()
}
console.log(+res) // 13
```
</details>

### Objects are passed by reference

<details>
<summary>Example</summary>
<br>


```typescript

let range = [[-6],[-3,-2,-1,0,1,2]]
console.log(range); // [ [ -6 ], [ -3, -2, -1, 0, 1, 2 ] ]

let currentRange = range[0]
console.log(currentRange) // [ -6 ]

currentRange.push(1,2,3)
console.log(range) // [ [ -6, 1, 2, 3 ], [ -3, -2, -1, 0, 1, 2 ] ]

function changeArr(arr) {
    arr.push(100,100,100);
} 

changeArr(range[1]);
console.log(range) // [ [ -6, 1, 2, 3 ], [ -3, -2, -1, 0, 1, 2, 100, 100, 100 ] ]

let test = range[0]

// test = [1,2,3,4,5,]; //! This will not affect the original array, as it points to a new reference
test.push(200) // This will affect the original array
```
</details>

### `Object.getOwnPropertyDescriptors()`

* returns an object in which for each __non-inherited__ property of the input object, it adds that property with its value being the property's descriptor

<details>
<summary>Example</summary>
<br>


```typescript
const obj = {
    [Symbol('foo')]: 123,
    get bar () { return 'abc'; }
}

console.log(Object.getOwnPropertyDescriptors(obj))
/* 
​​​​​{ bar:
​​​​​   { get: [λ: get bar],
​​​​​     set: undefined,
​​​​​     enumerable: true,
​​​​​     configurable: true },
​​​​​  [Symbol(foo)]:
​​​​​   { value: 123,
​​​​​     writable: true,
​​​​​     enumerable: true,
​​​​​     configurable: true } }
*/

```
</details>

#### Copying properties into an object

* `Object.assign()` - does **not** copy properties with non-default attributes(getters, setters)

<details>
<summary>Example</summary>
<br>


```typescript
const src = {
    set foo (val) { console.log(val) }
}

console.log(Object.getOwnPropertyDescriptors(src, 'foo'))
/* 
​​​​​{ foo:
​​​​​   { get: undefined,
​​​​​     set: [λ: set foo],
​​​​​     enumerable: true,
​​​​​     configurable: true } }
*/

const target1 = {}
Object.assign(target1, src)

// No setters here
console.log(Object.getOwnPropertyDescriptors(target1, 'foo'))
/* 
​​​​​{ foo:
​​​​​   { value: undefined,
​​​​​     writable: true,
​​​​​     enumerable: true,
​​​​​     configurable: true } }
*/

// Object.defineProperties() is here to help !!!
const target2 = {};
Object.defineProperties(target2, Object.getOwnPropertyDescriptors(src))
console.log(Object.getOwnPropertyDescriptors(target2, 'foo'))
/* 
​​​​​{ foo:
​​​​​   { get: undefined,
​​​​​     set: [λ: set foo],
​​​​​     enumerable: true,
​​​​​     configurable: true } }
*/
```
</details>

### this

* it is about **where** a **function** is **invoked**

#### Implicit binding

* when **dot notation** is used to invoke the function

* **whatever is to the left of the dot** - the context for `this` in the function

#### Explicit binding

* when `call()`, `apply()` or `bind()` are used

* **explicit**: we are **explictly** passing in a `this` context

#### Default binding

* `this` refers to the **global context** wherever the functions is invoked

#### `bind()`

* you can only **bind** to a function **once**; once the value is bound, **subsequent** calls to bind **won't change** the `this` context

<details>
<summary>Example</summary>
<br>


```typescript
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
function list () {
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
```
</details>

### Spread operator

* only the enumerable props will be added

* inherited properties are ignored

<details>
<summary>Example</summary>
<br>


```typescript
const car = {
    color: 'blue'
};

// Object.defineProperty(car, 'type', {
//     value: 'BMW',
//     enumerable: false
// });

// 'type' is not enumerable
// console.log({ ...car }) // { color: 'blue' }

// ==========================

const car2 = Object.create(car, {
    type: {
        value: 'Seat Leon',
        enumerable: true
    }
})

console.log(car2.color) // blue
console.log(car2.hasOwnProperty('type')) // true
console.log(car2.hasOwnProperty('color')) // false

// color not included - spread properties only copy the own properties of an object
console.log({ ...car2 }) // { type: 'Seat Leon' }​​​​​
```
</details>

### Extending Objects

* `Object.isExtensible(o)`: verify whether you can add more properties to the object or not

* `Object.preventExtensions(o)`
    * **cannot add** new properties to the object
    * **can remove** properties
    * **can modify** properties

    <details>
    <summary>Example</summary>
    <br>
    
    
    ```typescript
    const o = { name: 'andrei', age: 18 }
    Object.preventExtensions(o)
    
    o.name = "ANDREI"
    console.log(o) // {name: "ANDREI", age: 18}
    
    delete o.age
    console.log(o) // {name: "ANDREI"}
    
    o.city = "targoviste"
    console.log(o) // {name: "ANDREI"}
    ```
    </details>

* `Object.freeze(o)`
    * **cannot add** properties
    * **cannot remove** properties
    * **cannot modify** properties

    <details>
    <summary>Example</summary>
    <br>
    
    
    ```typescript
    const o = { name: 'andrei', age: 18 }
    Object.freeze(o)
    Object.isFrozen(o) // true
    
    o.name = "ANDREI"
    o // {name: "andrei", age: 18}
    
    delete o.age 
    o // {name: "andrei", age: 18}
    
    o.city = 'targoviste'
    o // {name: "andrei", age: 18}
    ```
    </details>

* `Object.seal(o)`
    * **cannot add** properties
    * **cannot delete** properties
    * **can modify** existing properties

    <details>
    <summary>Example</summary>
    <br>
    
    
    ```typescript
    const o = { name: 'andrei', age: 18 }
    Object.seal(o)
    Object.isSealed(o) // true

    o.name = "ANDREI"
    o // {name: "ANDREI", age: 18}
    
    delete o.age
    o // {name: "ANDREI", age: 18}
    
    o.city = 'targoviste'
    o // {name: "ANDREI", age: 18}
    ```
    </details>
--- 

## Functions

### Arrow Functions

* don't have their own this

* can't be called as a constructor

* don't have the `arguments` special variable

* can't change the `this` binding. however, you can still use `bind()`, `apply()`, `call()` for passing parameters

* "this", "arguments" : inherited from their parent function

* **In classes**
    * defined in the **constructor** on the initialization
    * undefined in the **prototype**
    * cannot be called with `super`

---

## Asynchronous Programming

### Handling asynchronous operations in parallel
❇️[Source](https://itnext.io/node-js-handling-asynchronous-operations-in-parallel-69679dfae3fc)

<details>
<summary>Example</summary>
<br>


```typescript
// Restrict the amount of requests executed in parallel

async function solution () {
  const concurrencyLimit = 5;
  const argsCopy = [...listOfArguments.map((val, ind) => ({ val, ind }))];
  const result = [...Array(listOfArguments.length)];
  const promises = [...Array(concurrencyLimit)].fill(Promise.resolve())

  // Chain the next Promise to the currently executed Promise as soon as it is completed
  function chainNext (promise) {
    if (argsCopy.length) {
      const arg = argsCopy.shift();
      console.log(arg)
      return promise.then((temp) => {
        console.log('temp', temp)
        const newPromise = asyncOperation(arg.val).then(resp => ( result[arg.ind] = resp ));
        return chainNext(newPromise)
      });
    }

    return promise;
  }

  await Promise.all(promises.map(chainNext));

  return result;
}

```
</details>


### Promises

#### `.then()` vs `async/await`

<details>
<summary>Example</summary>
<br>


```typescript
function* taskQueue() {
    for (let i = 0; i < 10; i++) {
        yield new Promise((resolve) => {
            setTimeout(resolve, (11 - i) * 1000, i)
        })
    }
}

// ====================================================

// 11 seconds
const q = taskQueue();
for (const val of q) {
    // `then()` - runs only when the promise is completed
    val.then(console.log)
}

// ====================================================

// `async` - the function block will wait for every Promise specified 
//           with the `await` keyword
// So, it will wait for ever Promise to resolve before continuing execution ==> the function block is synchronous
(async () => {
    const q = taskQueue();
    console.log('q', q)
    for (const val of q) {
        const solvedVal = await val;
        console.log(solvedVal)
    }
})();

// ====================================================

// Workaround #1
(async () => {
    // [... taskQueue()] - the promises are fired all at the same times ==> solved in parallel ==> it takes max(times)  
    [... taskQueue()].forEach(async promise => {
        const solved = await promise;
        console.log(solved)
    })
})();

// ====================================================

// Workaround #2
// All the promises' values will be available when max(times) is solved
(async () => {
    const responses = await Promise.all([... taskQueue()])
    
    responses.forEach(console.log)
})();

```
</details>

#### Understanding Promises

<details>
<summary>Example 1</summary>
<br>


```typescript
Promise
    .resolve()
    .then(() => Promise.reject('error1'))
    .then(() => console.log('test')) // Won't get executed
    .catch(console.log)
    .then(() => console.log('continue1'))

Promise
    .resolve()
    .then(() => Promise.reject('error2'))
    .then(() => console.log('continue2'), console.log) // error2
    .then(() => console.log('continue3'))

Promise
    .resolve()
    .then(() => Promise.resolve('nice!!'))
    .then(res => {
        console.log(res);
        return Promise.reject('error3')
    })
    .catch(console.log)
    .then(() => console.log('continue4'))

/* 
Output:

error2
nice!!!
error1
continue3
continue1 // Here basically the promise is already resolved
error3 // .then() vs a fresh returned Promise 
continue4
*/
```
</details>

<details>
<summary>Example 2</summary>
<br>


```typescript
// Useful when the desire is to handle errors separately

Promise
    .resolve(2)
    .then(num => {
        if (num === 2) {
            // Break the chain
            return Promise.reject('number 2 is not allowed!')
            // throw new Error('number 2 is not allowed!'); // Either this
        }
        return Promise.resolve('ok')
    })
    .catch(err => (console.log('error!', err), Promise.reject('no access!'))) // This will `break` the chain
    .then(resp => (console.log(resp), Promise.resolve('still ok')))
    .then(console.log)
    .then(resp => (console.log(resp), Promise.resolve('still ok2'))) // Not executed
    .then(console.log)
    .then(resp => (console.log(resp), Promise.resolve('still ok'))) // Not executed
    .then(console.log)
    .catch(err => console.log('err!', err)) // no access!

// Output: ​​​​​error! number 2 is not allowed! -> ​​​​​err! no access!​​​​​

// ================================================================================

Promise
    .resolve(2)
    .then(num => {
        if (num === 2) {
            // Break the chain
            return Promise.reject('number 2 is not allowed!')
        }
        return Promise.resolve('ok')
    })
    .catch(err => console.log('error!', err))  
    .then(resp => Promise.resolve('still ok'))
    .then(console.log) 
    .then(resp => Promise.resolve('still ok2'))  
    .then(console.log)
    .then(resp => Promise.resolve('still ok3'))  
    .then(console.log)
    .catch(err => console.log('err!', err)) 

// Output: ​​​​​error! number 2 is not allowed!​​​​​ -> ​​​​​still ok -> ​​​​​still ok2​​​​​ ->​​​​​ still ok3​​​​​
```
</details>

---

## Iterables and Generators

* will run the function unlti the **yield** keyword is met; the rest of the function will be run at the next `.next()` call

### Recursive Generators
<details>
<summary>Example</summary>
<br>


```typescript
function * range(start, end) {
    yield start;
    if(start === end) return;
    yield * range(start + 1, end);
}

for(let o of range(1,3)) {
    console.log(o);
}
console.log([... range(1,3)]) // [1, 2, 3]
```
</details>

### Async Generators

* the object must implement `Symbol.asyncIterator`
* can be consumed with `for-await-of`
* each iterator returns a promise that fulfills to `{ value, done }`

<details>
<summary>Example</summary>
<br>


```typescript
(async () => {
    let orders = ['order1', 'order2', 'order3', 'order4'];
    const fetch = (name, time) => new Promise(resolve => setTimeout(resolve, time, name))

    orders[Symbol.asyncIterator] = async function * () {
        yield * [... this].map(async(order, i) => {
            return await fetch(`resolved ${order}`, i * 1000);
        })
    }

    for await (const resolvedOrder of orders) {
        console.log(resolvedOrder)
    }

    console.log('finished !')
    /* 
    --> 
    resolved order1
    resolved order2
    resolved order3
    resolved order4
    finished!
    */
})()

```
</details>

#### Dealing with a collection of requests

* all the requests start being processed at the same time

* `for-await-of` processes the promises sequentially; this means that if we have `[p1(500), p2(300)]`, `p1` will be resolved first, and `p2` immediately after, because it sort of waited for `p1` to be ready.

<details>
<summary>Example</summary>
<br>


```typescript
function fetch(name, time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(name)
        }, time);
    });
}

(async () => {
const reqs = [fetch('andrei', 1000), fetch('dan', 3000), fetch('john', 500)]

// In the above example, 'john' will be returned after 3 seconds
// Because for await of processes the promises sequentially and so
// when 'dan' ready, `john` will be instantly ready, because it was basically waiting for `dan` to finish
reqs[Symbol.asyncIterator] = async function * () {
    yield * [... this]
}

for await (const res of reqs) {
    console.log(res)
}

const results = (await Promise.all(reqs))
results.forEach(name => console.log(name));
})();


// =============================================================

/* 
All the requests responses will be printed at the same time, after 2 seconds.
Because all the requests are fired at the same time and even though 'jane' is ready before 'john',
they both must wait for the first request, which takes 2 seconds.
BUT notice that the order can change that.
If the time sequence was: [1000, 2000, 3000], the requests would be solved in the same order.
*/
(async () => {
    const fetch = (time, name) => new Promise((resolve, reject) => setTimeout(resolve, time, name))

    const reqs = [fetch(2000, 'andrei'), fetch(1000, 'jane'), fetch(2000, 'john')]

    reqs[Symbol.asyncIterator] = async function* () {
        yield* [...this];
    }

    for await (const resp of reqs) {
        console.log(resp)
        /* 
        andrei
        jane
        john
        */
    }
})();


```
</details>

---

## Proxy

* drastically clean up and abstract access to objects

* let you control access to an object(instead of calling obj props directly, you call something else that calls it)

* you can use Proxies for caching

* **handler** - obj that declares a number of traps(which are triggered by making calls to the obj that's being proxied)

* **receiver** - the object in which the property lookup happens

### Get safe object properties

<details>
<summary>Example</summary>
<br>


```typescript
function isObject(obj) {
    return obj && typeof obj === 'object'
}

function hasKey(obj, key) {
    return key in obj;
}

function safe (obj) {
    return new Proxy(obj, {
        get (target, key) {
            if (!hasKey(target, key)) 
                return 'undefined';
            if (!isObject(target))
                return target[key]
            
            return safe(target[key])
        }
    })
}

const obj = { a: { b: 1 } }

console.log(obj.a.b) // 1
// console.log(obj.c.d) // Cannot read property 'd' of undefined
console.log(safe(obj).c.d) // 'undefined'
```
</details>

### Using a Proxy as an object's prototype

<details>
<summary>Example</summary>
<br>


```typescript
const handlers = {
    get(target, key, context) {
        console.log(greeter === context)
        return function() {
            context.speak(key + "!")
        }
    }
};

const catchall = new Proxy({}, handlers);

const greeter = {
    speak(who = "someone") {
        console.log('hello', who);
    }
};

// Setup `greeter` to fall back to `catchall`
Object.setPrototypeOf(greeter, catchall);

greeter.speak() // hello someone

greeter.speak("world") // hello world

greeter.everyone() // hello everyone
```
</details>

### Private class properties

<details>
<summary>Example</summary>
<br>


```typescript
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
```
</details>

---

## Symbol

* a **primitive data type** that is **immutable** and **globally-unique**

### Symbol.description

* its goal is to avoid getting the provided description from `Symbol.prototype.toString()`

<details>
<summary>Example</summary>
<br>


```typescript
const mySymbol = Symbol('coolDescription')

console.log(mySymbol) // ​​​​​Symbol(coolDescription)​​​​​
console.log(mySymbol.toString()) // ​​​​​Symbol(coolDescription)​​​​​
console.log(mySymbol.description) // ​​​​​coolDescription​​​​​
```
</details>

### Symbol.for()

* return existing symbols; if a symbol does not exist, it will create one in the symbol registry

<details>
<summary>Example</summary>
<br>


```typescript
const s1 = Symbol('foo')
const s2 = Symbol('foo')

console.log(s1 === s2) // false

// ==================

const s1 = Symbol.for('bar')
const s2 = Symbol.for('bar')

console.log(s1 === s2) // true

const o = { [s1]: 'andrei' } // {Symbol(bar): "andrei"}

o[s1] = 'ANDREI' // {Symbol(bar): "ANDREI"}

o[s2] = 'andrei !' // {Symbol(bar): "andrei !"}
```
</details>

<details>
<summary>Retrieving a shared symbol key</summary>
<br>


```typescript
// The equivalent of `Symbol.description`
const s = Symbol.for('foo')

console.log(Symbol.keyFor(s)) // "foo"
```
</details>

---

## Typed Arrays

* provide a mechanism for accessing raw binary data

* the container for all typed arrays: **ArrayBuffer**

* interacting with **ArrayBuffer**: **DataView**

<details>
<summary>Example</summary>
<br>


```typescript
// Create a 16 bytes buffer
const buffer = new ArrayBuffer(16);

// Access the whole buffer
const dv1 = new DataView(buffer);
// Start at slot 10, get only 3 bytes
const dv2 = new DataView(buffer, 10, 3);

// Put "42" in slot "11" through view1
dv1.setInt8(11, 42);
// Get the second slot(starting from 10)
const num = dv2.getInt8(1);
console.log(num) // 42
```
</details>

---

## Cool Stuff

### Dynamically exclude properties

<details>
<summary>Example</summary>
<br>


```typescript
const user1 = {
    id: 1,
    name: 'Andrei Gatej',
    password: 'password',
}

const removeProp = prop => ({ [prop]: _, ...rest }) => (console.log(_),rest)

const removePassword = removeProp('password');
console.log(removePassword(user1)) // ​​​​​{ id: 1, name: 'Andrei Gatej' }​​​​​

const removeId = removeProp('id')
console.log(removeId(user1)) // ​​​​​{ name: 'Andrei Gatej', password: 'password' }​​​​​
```
</details>

### Organize Object Properties

<details>
<summary>Example</summary>
<br>


```typescript
const user1 = {
    id: 1,
    name: 'Andrei Gatej',
    password: 'password',
}

const organizeFirst = (object, prop = 'id') => ({ [prop]: undefined, ...object })
console.log(organizeFirst(user1, 'password')) // ​​​​​{ password: 'password', id: 1, name: 'Andrei Gatej' }​​​​​

const organizeLast = (prop, { [prop]: _, ...object }) => ({ ...object, [prop]: _ })
console.log(organizeLast('id', user1)) // ​​​​​​​​​​{ name: 'Andrei Gatej', password: 'password', id: 1 }​​​​​ 
```
</details>

### Flat Array

<details>
<summary>Example</summary>
<br>


```typescript
// `apply` effect: console.log([].concat(['a', 'b'], ['c', 'd'])) [ 'a', 'b', 'c', 'd' ]
function flat (arr) {
    // return [].concat.apply(Array(), arr)
    // return [].concat.call([], ...arr)
    return [].concat.apply([], arr)
}

const arr = [["a", "b"], ["c", "d"]];

console.log(flat(arr)) // [ 'a', 'b', 'c', 'd' ]
```
</details>

### Fetch API

* **The promise does not reject on HTTP error statuses**. The promise gets rejected only on **network error** (connection refused || name not solved)

* Requesting a URL from a server that will return a 404 **will not fail**

<details>
<summary>Example</summary>
<br>


```typescript
  fetch('https://jsonplaceholder.typicode.com/404')
  .then(res => {
    // To reject a promise, check the staus
    if(res.ok) {
      return res;
    } else {
      throw Error(`Request rejected with status ${res.status}`);
    }
  })
  .catch(console.error)
```
</details>

### Multiple Class Inheritance
[:sparkles:Resouce](https://stackoverflow.com/questions/29879267/es6-class-multiple-inheritance)

<details>
<summary>Example</summary>
<br>


```typescript
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
new C().foo();
```
</details>

### `Promise.all()` vs `for-await-of`

<details>
<summary>Example</summary>
<br>


```typescript

(async () => {
    function fetch(name, time) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(name)
            }, time);
        });
    }


    const arrList = ['andrei', 'dan', 'john', 'jane', 'bill']

    arrList[Symbol.asyncIterator] = async function * () {
        yield* arrList.map((name, i) => name !== 'dan' ? fetch(name, i * 800) : fetch(name, 3000))
    };

    console.log('results ready!')
    
    /* 
    'andrei' after 800ms,
    the rest after 3 second
    */
    // for await (const name of arrList) {
    //     console.log(name)
    // }
    
    // Will return all the results after 3 seconds.
    const results = await Promise.all(
        arrList.map((name, i) => name !== 'dan' ? fetch(name, i * 800) : fetch(name, 3000))
    )
    results.forEach(name => console.log(name))
})();
```
</details>

### Simple Reactive System

<details>
<summary>Example</summary>
<br>


```typescript
// Reactive system using Proxy

let data = {
    price: 5,
    quantity: 2
};
let target, total, salePrice;


// Proxy traps - intercept data

class Dep {
    constructor() {
        this.subscribers = [];
    }

    depend () {
        if (target && !this.subscribers.includes(target)) {
            this.subscribers.push(target)
        }
    }

    notify () {
        this.subscribers.forEach(sub => sub())
    }
}

// Store all the Dep instances
let deps = new Map();

Object.keys(data).forEach(key => {
    deps.set(key, new Dep());
});

data = new Proxy(data, {
    get (obj, key) {
        // Call `depend()` on that particular key
        deps.get(key).depend();
        return obj[key]
    },

    set (obj, key, newVal) {
        obj[key] = newVal;
        deps.get(key).notify();
    }
});

function watcher(myFunc) {
    target = myFunc
    target();
    target = null;
}

watcher(() => {
    total = data.price * data.quantity;
})

watcher(() => {
    salePrice = data.price * 0.9;
})

console.log('total = ', total);
data.price = 20;
console.log('total = ', total);
data.quantity = 10
console.log('total = ', total);

deps.set('discount', new Dep());
data['discount'] = 5;

salePrice = 0;

watcher(() => {
    salePrice = data.price - data.discount
})

console.log('salePrice = ', salePrice)
data.discount = 7.5;
console.log('salePrice = ', salePrice)
```
</details>

### Replacing strings

`String.prototype.replace`

* `$&` - the **current** matched string

```typescript
const s = 'my name is andrei';

s.replace('name', '$& [$&]'); // "my name [name] is andrei"
```

* ` $` ` - the string that **precedes** the current match

```typescript
const s = 'my name is andrei';

s.replace('name', '$`[$`]'); // "my my [my ] is andrei"
```

* `$'` - the string that **follows** the current match

```typescript
const s = 'my name is andrei';

s.replace('name', "$' *$'*"); // "my  is andrei * is andrei* is andrei"
```

---

## DOM

* it is a tree-like representation of the HTML document

* every time it encounters an element(ex: `div`, `p` etc...), it creates a **DOM node** from its respective class(ex: `HTMLDivElement`)

### Element.closest(_selectorString_)

* search through element's ancestors until it finds a node that matches the provided _selectorString_

### Incremental DOM

* only **allocate** memory when a **node** gets **removed or added**

* the size of the allocation is proportional to the size of the DOM change

* the framework does **not** interpret the component 

* the component **references intructions**; as a result, if some instructions are not referenced, they will not be included in the bundle, since we would know this at **compile time**

### Virtual DOM

* creates a **new tree** from scratch on **re-render**

* requires an **interpreter**; as a result, we **can't know** what is needed and is not **at compile time**, so we have to **ship the whole thing** to the browser

### Properties

* defined by DOM

* **can change**

### Attributes

* **initialize** DOM properties and then they are **done**

* defined by HTML

### Script tags

#### `defer`

* **delay** the **execution** until the **document** has **finished loading**

#### `async`

* **download** the script **without blocking**, but **execute as soon as possible**

---

## Closures

* when a value is **captured inside a closure**, the function **captures** the **variable reference**, **not the value**

    <details>
    <summary>Example</summary>
    <br>


    ```typescript
    function foo () {
        return name;
    }

    let name = 'andrei';

    console.log(foo()) // 'andrei'
    ```
    </details>

--- 

### Scope

[Resource](https://codeburst.io/js-scope-static-dynamic-and-runtime-augmented-5abfee6223fe)

* JS has **all three** types of scope: **static**, **dynamic**, **runtime-augmented**

* defines the area in which a `variable/function` can be accessed

#### Static Scope

* cares **where** the `variable/function` was defined

* determined at **write-time**(the code you see **before compilation**)

* you can **look** at the **source code** and **determine** the **environment** in which a **binding is resolved**

* is it implemented by [*closures*](#Closures)

#### Dynamic Scope

* a **caller** defines an **activation environment** for a **callee**

* determined at **runtime**

* provides the right value for the `variable/function` depending on **who called** it 

* the value of `this` is **dynamically scoped**, **unless** used in an **arrow function**

* [*arrow functions*](#arrow-functions) use **lexical scope**

<details>
<summary>Example</summary>
<br>


```typescript
x = 'global!!!';

const obj = {
    // Provide `own` value for `x`
    x: 10,
    foo () {
        console.log(this.x) // 10

        /**
         * Even if the function is declared within a method call,
         * the `this` value will still be `dynamically scoped`
         */
        function dynamicallyScopedThis () {
            console.log(this.x); // 'global!!!'
        }
        dynamicallyScopedThis();
        
        /**
         * The `this` value will be the one from the `lexical environment`
         */
        const capturedThis = () => {
            console.log(this.x)
        }
        capturedThis(); // 10
    }
}

/**
 * The value of `this` is **determined** and **provided** by the **caller**
 * In this case, it's `obj`.
 */
obj.foo();
```
</details>

#### Runtime-augmented scope

* an **activation frame** is **not statically** determined and can be **mutated** by the **callee** itself

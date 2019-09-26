# JavaScript Notebook

- [Objects and Classes](#objects-and-classes)
- [Functions](#functions)
- [Asynchronous Programming](#asynchronous-programming)
- [Iterables and Generators](#iterables-and-generators)
- [Proxy](#proxy)
- [:sparkles:Cool Stuff :sparkles:](#cool-stuff)

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

---

## Functions

### Arrow Functions

* don't have their own this

* can't be called as a constructor

* don't have the `arguments` special variable

* can't change the `this` binding. however, you can still use `bind()`, `apply()`, `call()` for passing parameters

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

# JavaScript Notebook

## Contents

- [Knowledge](#knowledge)
- [Good to know](#good-to-know)  
- [Objects](#objects)
- [Asynchronous Programming](#asynchronous-programming)
- [This](#this)

---

### Knowledge

**new**  
* creates an empty {}
* assigns the property `prototype` of this empty object to the `myFunc` prototype property

**__proto__**
* points to the prototype object of a function that created this object
* exposed to the object instance

**prototype**
* accessed by <function-name>.prototype
* has an inherent property called `constructor` which is a pointer to the function itself

**constructor**
* returns the function that created the instance

<details>
    <summary>
        <b>Shallow Copy vs Deep Copy</b>
    </summary>
<div>
<p>
    <b>TL;DR: </b>
    Shallow copy will not create a new reference, but deep copy will create the new reference.
</p>
<p>
    <i>Shallow copy (bit-wise copy)</i><br>
    <ul>
        <li>a new object is created and that has an exact copy of the values in the original obj; 
if any references are other objects just the reference addresses are copied</li>
        <li>copy just the 'immediate' members, but keeping the same reference</li>
    </ul>
</p>
    <i>Deep Copy (member-wise copy)</i><br>
    <ul>
        <li>visit each member and explicitly copy it</li>
        <li>occurs when an object is copied along with the objects to which it refers</li>
        <li>allocates different memory location </li>
        <li>recursively perform shallow copies until everything is a new copy of the original</li>
    </ul>
<code>
<pre>
// Examples

const me = {
    name: 'Andrei',
    age: 17,
    country: 'RO'
};

// ================================

// Shallow copy
const meCopy = me;
// meCopy.name = "ANDREI";
// console.log(meCopy) 
// console.log(me)
// -> { name: 'ANDREI', age: 17, country: 'RO' } (both)

// ================================

// Deep Copy 
const deepCopyMe = JSON.parse(JSON.stringify(me));
deepCopyMe.name = 'ANDREI'
console.log(deepCopyMe) // { name: 'ANDREI', age: 17, country: 'RO' } 
console.log(me) // { name: 'Andrei', age: 17, country: 'RO' } 

</pre>
</code>
</div>
</details>

**Arrow functions**

* don't have their own this

* can't be called as a constructor

* don't have the `arguments` special variable

* can't change the `this` binding. however, you can still use `bind()`, `apply()`, `call()` for passing parameters

* can't be used as generator functions

**Fetch API**

* **The promise does not reject on HTTP error statuses**. The promise gets rejected only on **network error** (connection refused || name not solved)

* Requesting a URL from a server that will return a 404 **will not fail**

```javascript
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

---

### Good to know

**Get safe object properties**

```javascript
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

**Flat Array**

```javascript
// `apply` effect: console.log([].concat(['a', 'b'], ['c', 'd'])) [ 'a', 'b', 'c', 'd' ]
function flat (arr) {
    // return [].concat.apply(Array(), arr)
    // return [].concat.call([], ...arr)
    return [].concat.apply([], arr)
}

const arr = [["a", "b"], ["c", "d"]];

console.log(flat(arr)) // [ 'a', 'b', 'c', 'd' ]
```

---

### Objects

**Dynamically exclude properties**
```javascript
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

**Organize Properties**
```javascript
const user1 = {
    id: 1,
    name: 'Andrei Gatej',
    password: 'password',
}

// const organizeFirst = (object, prop = 'id') => ({ [prop]: null, ...object })
const organizeFirst = (object, prop = 'id') => ({ [prop]: undefined, ...object })
console.log(organizeFirst(user1, 'password')) // ​​​​​{ password: 'password', id: 1, name: 'Andrei Gatej' }​​​​​

const organizeLast = (prop, { [prop]: _, ...object }) => ({ ...object, [prop]: _ })
console.log(organizeLast('id', user1)) // ​​​​​​​​​​{ name: 'Andrei Gatej', password: 'password', id: 1 }​​​​​ 
```

---

### Asynchronous Programming

**Handling asynchronous operations in parallel**  
[Source](https://itnext.io/node-js-handling-asynchronous-operations-in-parallel-69679dfae3fc)

```javascript
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

**Promises**

```javascript
// then() vs async/await

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

---

### This

**_arguments_ keyword**
```javascript
function test() {
    let s = [].slice.call(arguments);
    console.log(s)
}

function wrapper(func) {
    console.log(arguments)
    return func.apply(null, [].slice.call(arguments, 1));
}

wrapper(test, 20, 30);
```
# JavaScript Notebook

## Contents

- [Good to know](#good-to-know)  
- [Objects](#objects)
- [Asynchronous Programming](#asynchronous-programming)

## Good to know

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

## Objects

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

## Asynchronous Programming

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
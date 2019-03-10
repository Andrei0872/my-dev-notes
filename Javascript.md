## Contents

- [Good to know](#good-to-know)

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
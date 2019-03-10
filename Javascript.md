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
## Contents

- [Good to know](#good-to-know)
- [Objects](#objects)

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
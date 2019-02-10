// http://2ality.com/2016/02/object-getownpropertydescriptors.html

/* 
Returns an object in which for each (non-inherited) prop of the input obj,
id adds that property with its value being the property's descriptor

Property descriptors - describe the attributes of a value
*/

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

// =====================================================

// Copying properties into an object
// Object.assign() - uses get and set operations to copy a property whose key is key
// Which means it does not copy properties with non-default attributes(getters, setters)

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
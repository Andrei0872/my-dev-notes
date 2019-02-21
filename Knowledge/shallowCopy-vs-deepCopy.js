
/* 
* TL;DR
- Shallow copy will not create a new reference, but deep copy will create the new reference
*/

// ============================================================

/* 
* Shallow copy (bit-wise copy)
- a new object is created and that has an exact copy of the values in the original obj; 
if any references are other objects just the reference addresses are copied
- copy just the 'immediate' members, but keeping the same reference
*/

// ============================================================

/* 
* Deep Copy (member-wise copy)
- visit each member and explicitly copy it
- occurs when an object is copied along with the objects to which it refers
- allocates different memory location 
- recursively perform shallow copies until everything is a new copy of the original
*/

// ============================================================

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


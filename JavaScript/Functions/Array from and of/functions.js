// https://www.codementor.io/robertwozniak/javascript-dives-two-array-methods-o1cudonk0

//* Array.from() - create a new, shallow-copy instance of an array
// from a set of data that is array-like or iterable

// Generate arrays
console.log(Array.from({ length : 5 })) // [undefined x 5]
console.log(Array.from({ length : 5}, (v,i) => i)) // [0, 1, 2, 3, 4]


//* Array.of() - creates an Array based on the parameters

console.log(Array.of(7)); // [7]
console.log(Array.of(1,2,3)) // [1,2,3]

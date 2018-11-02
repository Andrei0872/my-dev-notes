
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

// test = [1,2,3,4,5,]; //! This will not affect the original array
test.push(200) // This will affect the original array
console.log(range)

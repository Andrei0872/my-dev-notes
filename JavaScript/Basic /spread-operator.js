
// Spread Operator (...) -  expand in pieces an array or a string - for function calls
                        //  - splits to multiple elements - array literals []


let str = "andrei"
Array.prototype.map.call(str, (val)=>{console.log(val)})

function doSmth (a,b,c) {
    console.log(a,b,c)
}

// First alternative
doSmth(...[1,2,3]) // 1 2 3 
// Second alternative
doSmth.apply(null,[1,2,3]) // 1 2 3


// Combine Arrays
let arr1 = [3,4]
let arr2 = [1,2,...arr1,5,6]
console.log(arr2) // [1,2,3,4,5,6]


// Copying arrays
let arr3 = [1,2,4]
// First alternative
let copyArr = [...arr3]
console.log(copyArr)
// Second alternative
let copyArr_2 = arr3.slice()
console.log(copyArr_2)


// Using Math Functions
let numbers = [1,2,3,4,5,6]
console.log(Math.min(...numbers))
console.log(Math.max(...numbers))


// Using with functions
function sum (...args) { // Basically takes an array as a parameter
    console.log(args) // [1,2,3,4] , [1,2,3,4]
    return args.reduce((x,y)=>x+y)
}
console.log(sum(1,2,3,4)) // 10
console.log(sum.apply(null,[1,2,3,4])) // 10


function sum_2 (args) { // Here takes an arrays as well
    console.log(args) // [1,2,3,4] , [1,2,3]
    console.log(...args) // 1 2 3 4 , 1 2 3
    return args.reduce((a,b) => a+b)

    // This could also work
    // return  [...args].reduce((a,b) => a+b)

}
console.log(sum_2([1,2,3,4]))
console.log(sum_2.call(null,[1,2,3]))


// A better understanding of what "...args" does
// It splits into multiple elements

function func(...args) {
    console.log(args) //  [{"firstName":"Gatej","lastName":"Andrei"},{"firstName":"Gatej","lastName":"Marius"}]
}
func({"firstName":"Gatej","lastName":"Andrei"},{"firstName":"Gatej","lastName":"Marius"})



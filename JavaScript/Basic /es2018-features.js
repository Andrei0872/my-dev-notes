
// Rest/ Spread 

Object.defineProperty(Object.prototype, 'specialProp', {
    set(value) {
        console.log('set called!')
    }
})

const obj = { specialProp: 10 }

console.log({ ...obj }) // setter ignored

console.log(Object.assign({}, obj)) 
// -> set called !
// -> {} - setter NOT ignored

// ============================================================

// Spread operator - only enumerable props
//                 - inherited props are ignored

const car = {
    color: 'blue'
};

// Object.defineProperty(car, 'type', {
//     value: 'BMW',
//     enumerable: false
// });

// 'type' is not enumerable
// console.log({ ...car }) // { color: 'blue' }

// ==========

const car2 = Object.create(car, {
    type: {
        value: 'Seat Leon',
        enumerable: true
    }
})

console.log(car2.color) // blue
console.log(car2.hasOwnProperty('type')) // true
console.log(car2.hasOwnProperty('color')) // false

// color not included - spread properties only copy the own properties of an object
console.log({ ...car2 }) // { type: 'Seat Leon' }​​​​​

// ============================================================

// Asynchronous Iteration

// Making an object Iterable

const collection = {
    a: 1,
    b: 2, 
    c: 3,
    // [Symbol.iterator] () {
    //     const values = Object.values(collection)
    //     let i = 0
    //     return {
    //         next () {
    //             return {
    //                 value: values[i++],
    //                 done: i > values.length
    //             }
    //         }
    //     }
    // },

    // Using generator function
    [Symbol.iterator] : function * () {
        for(let key  in this) {
            yield this[key]
        }
    }  
}

const iterator = collection[Symbol.iterator]()

console.log(iterator.next()) // ​​​​​{ value: 1, done: false }​​​​​
console.log(iterator.next()) // ​​​​​{ value: 2, done: false }​​​​​
console.log(iterator.next()) // ​​​​​{ value: 3, done: false }​​​​​
console.log(iterator.next()) // ​​​​​{ value: undefined, done: true }​​​​​

// ==========

//! Iterators - not suitable for representing asynchronous data sources

// Async Iterator
// - returns a promise that fulfills to { value, done }
// - defines a Symbol.asyncIterator(instead of Symbol.iterator) that returns an async iterator


const collection2 = {
    a: 10,
    b: 20,
    c: 30,
    [Symbol.asyncIterator]: async function * () {
        for(let key in this) {
            yield this[key]
        }
    }
}
// const asyncIterator = collectionAsync[Symbol.asyncIterator]()

// asyncIterator.next().then(console.log) // { value: 1, done: false }​​​​​
// asyncIterator.next().then(console.log) // { value: 2, done: false }​​​​​
/* ... */

(async function () {
    for await (const val of collection2) {
        console.log(val)
    }
})

// ============================================================

// Named Capture Groups

let re = /(\d{4})-(\d{2})-(\d{2})/;
let match = re.exec('2019-04-19')
console.log(match) // ['2019-04-19', '2019', '04', '19', index: 0, input: '2019-04-19', groups: undefined ]​​​​​

re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
match = re.exec('2019-04-19')

console.log(match.groups) // { year: '2019', month: '04', day: '19' }

// ==========

// Find consecutive duplicate words in a sentence

re = /\b(?<dup>\w+)\s+\k<dup>\b/
match = re.exec('Get that that cat off the table!');
console.log(match[0]) // ​​​​​that that

// ==========

// Insert a named capture group into the replacement string of the replace() func

const str = 'red & blue';
console.log(str.replace(/(red) & (blue)/, "$2 $1")) // blue red
console.log(str.replace(/(?<red>red) & (?<blue>blue)/, "$<blue>, $<red>")) // blue red

// ==========

// Lookbehind

re = /(?<=\$|£|€)\d+(\.\d*)?/
console.log(re.exec('199')) // null
console.log(re.exec('$199')) // ​​​​​[ '199', undefined, index: 1, input: '$199', groups: undefined ]​​​​​
console.log(re.exec('€199.30')) // ​​​​​​​​​​[ '199.30', '.30', index: 1, input: '€199.30', groups: undefined ]​​​​​

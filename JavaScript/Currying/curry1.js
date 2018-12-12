// https://itnext.io/variable-length-currying-in-javascript-509a02d4f30b

const myObj = {
    // When treated as a number
    valueOf() {
        return 100;
    }
}

console.log(myObj + 20) // 20
// ========================================


const addSubstractReducer = (total, current, index) => 
    (index % 2) === 0 ?
        total + current:
        total - current;

const addSubstract = x => {
    const nums = [];

    // Recursive func to accumulate numbers for the operation
    const f = y => {
        console.log('called f', y)
        nums.push(y)
        return f
    }

    
    f.valueOf = () => {
        console.log(nums)
        return nums.reduce(addSubstractReducer, x)
    };

    return f;
}


const addTo1 = addSubstract(1)
console.log(+addTo1(2)) // 3
console.log(+addTo1(2)) // 1
console.log(+addTo1(2)) // 3
console.log(+addTo1(4)) // -1 


const addTo2 = addSubstract(2)
console.log(+addTo2(2)(2)(2))


// =======================================

const infiniteSum = () => {
    let acc = 0

    const add = x => {
        acc += x
        // Make it recursive
        return add
    }

    add.valueOf = () => acc;

    return add
}

const infinite = infiniteSum();
let current = infinite(1)(2)(3)(4) // 10
console.log(+ current(2)(2)) // 14


const fibonacci = () => {
    let prev = 0, curr = 1;

    const compute = () => {
        [prev, curr] = [curr, prev + curr]
        return compute
    }

    compute.valueOf = () => curr

    return compute
}

// 0 1 1 2 3 5 8 13 21
const fibGen = fibonacci()
// n-th fibonacci number
let n = 7, res
while(n-- > 1) {
    res = fibGen()
}
console.log(+res) // 13


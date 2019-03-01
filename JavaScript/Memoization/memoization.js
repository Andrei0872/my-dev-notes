
const memoize = fn => {
    const cache = {};

    return num => {
        !(num in cache) && (cache[num] = fn.call({ cache }, num))
        
        return cache[num];
    }
}

// We can't use arrow fn because we need to make use of `this`
const factorial = function (num) {
    return (num in this.cache) 
        ? this.cache[num]
        : num === 0 || num === 1
            ? 1
            : (this.cache[num] = num * factorial.call(this, num - 1));
}

const memoizedFactorial = memoize(factorial);

console.log(memoizedFactorial(4))
console.log(memoizedFactorial(6))
console.log(memoizedFactorial(5))
console.log(memoizedFactorial(8))
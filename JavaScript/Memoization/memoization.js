

// Memoization -  caching function results

// This is a pure function - meaning that it will return the same result if we give the same parameters 
const factorial = n => {
    if(n === 1 ) 
        return 1
    return n * factorial(n - 1)
}


// console.log(factorial(4)) // 24

// We will use closures
// Closure -  an inner function that has acces to the outer functions variables

// Memoized function 
const memFactorial = () => { 
    
    // This object is defined inside the memFactorial() function, thus the variable scope is the function scope
    const cache = {}

    // Return a function
    return (value) => {
        
        // If the value is already registered
        if(value in cache) {
            console.log("cache in function",cache)
            console.log("value already registered",value)
            return cache[value]
        } else {
            // Get the result
            const result = factorial(value);
            
            // Register the value and its result
            cache[value] = result;

            return result;
        }
    
    }
}

// Here we basically define the scope of the function that has a closure in its block of code
memoized_func = memFactorial()

// Calling the closure, maintaining the same scope !
console.log(memoized_func(4))
console.log(memoized_func(4)) // Here will show a message - value already registered
console.log(memoized_func(5)) // Here will show a message -  value already registered
console.log(memoized_func(5))

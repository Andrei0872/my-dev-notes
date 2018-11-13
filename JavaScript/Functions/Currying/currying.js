
// https://medium.com/@erhess0011/javascript-currying-8e907e9de713


/**
 * Curried function - takes multiple params one at a time
 * Currying can be integrated with callbacks to create high-order 'factory' function(useful in event handling)
 */


// We can postpone invoking the read function's cb until the result is needed
const currier = function (fn) {
    // Get the "start" param if supplied
    // Arguments[0] - the name of the function
    let args = [].slice.call(arguments,1);

    return function () {
        // Call the supplied function "fn" with all the given args
        return fn.apply(null,args.concat([].slice.call(arguments)));
    } 
}


const sequence = function(start, end) {
    const result = [];
    
    for(let i = start; i <= end; i++)
        result.push(i);
    
    return result;
}


const seq5 = currier(sequence, 1);
// Postponing until we supply the "end" argument
console.log(seq5(5)) // [ 1, 2, 3, 4, 5 ]​​​​​ 

// ===========================================

const conc = (str1, ...str2) => {
    return `${str1} ${str2.join(' ')}`;
}

const func = currier(conc,'Hello');
console.log(func('world')) // ​​​​​Hello world​​​​​

console.log(currier(conc)('Hello','World,','Andrei!')) // ​​​​​​​​​​Hello World, Andrei!​​​​​


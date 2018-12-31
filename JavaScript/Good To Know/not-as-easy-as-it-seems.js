
// https: //dev.to/joelnet/the-easiest-problem-you-cannot-solve-2d3m

const cat = "cat";
const dog = "dog";
let res;

const K = a => b => a;
res = K(dog)(cat)
console.log(res) // dog

// Objective: call K to output "cat" without swapping the order of "cat" and "dog"

// ========================================

const rev = fn => a => b => fn(b)(a)
res = rev(K)(dog)(cat)
console.log(res) // cat

// ========================================

res = K.bind(null, cat)(dog)()
console.log(res)

// ========================================

res = K(cat)()
console.log(res) // cat

// ========================================

// K(K)(dog) - at this point we have the "K" function returned
// (cat)() - calling "K" with these args ==> "cat"
res = K(K)(dog)(cat)()
console.log(res) // cat

// ========================================

// K(cat)(dog) ==> "cat" 
// K(K(cat)(dog)) - waiting for the second param..(first is already "cat")
// K(K(K(cat)(dog))) ==> "K" function with first param being a function that expects the second param
res = K(K(K(cat)(dog)))()()
console.log(res)

// ========================================

// I'll stop here! :)
res = K(K(K(K(cat)(dog))))()()()
console.log(res) // cat

// ========================================

res = K(x => x)(dog)(cat)
console.log(res) // cat 

// ========================================

console.log(K.toString())
res = eval(K.toString())
console.log(res)

// ========================================

res = K(...[dog, cat].reverse())()
console.log(res) // cat

// ========================================

res = eval(K.toString().replace('b', 'a'))()(cat)
console.log(res) // cat

// ========================================

res = K.call(null, [...dog, cat].reverse()[0])()
console.log(res) // cat

// ========================================

res = K([...dog, ...cat].slice(3).join(''))()
console.log(res) // cat

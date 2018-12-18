

console.log(hello())
console.log(hello2()) // hello2 is not defined
// This is hoisted
function hello() {
    return "hello";
}

//! This is not hoisted
const hello2 = function() {
    return "hello from second func";
}
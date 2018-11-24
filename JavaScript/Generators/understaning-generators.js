

function *fibonacci() {
    let [prev, current] = [0,1];
    for(;;) {
        [prev,current] = [current, current + prev]
        yield prev;
    } 
}

let fib = fibonacci();
console.log(fib.next().value) // 1
console.log(fib.next().value) // 1
console.log(fib.next().value) // 2
console.log(fib.next().value) // 3 
console.log(fib.next().value) // 5
console.log(fib.next().value) // 8
console.log(fib.next().value) // 13
console.log(fib.next().value) // 21
console.log(fib.next().value) // 34
console.log(fib.next().value) // 55


// ==================================

let fibonacci2 = {
    [Symbol.iterator]() {
        let prev = 0, cur = 1
        return {
            next() {
                [prev, cur] = [cur, prev + cur]
                return { done:false, value: cur }
            }
        }
    }
}

for(let n of fibonacci2) {
    if(n > 1000) break;
    console.log(n) //  1 2 3 5 8 13 21 34 55 89 144 233 377 610 987
}

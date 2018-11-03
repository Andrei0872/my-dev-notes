

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
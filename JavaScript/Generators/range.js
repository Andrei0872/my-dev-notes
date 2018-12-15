

function * range(start, end) {
    yield start;
    if(start === end) return;
    yield * range(start + 1, end);
}

for(let o of range(1,3)) console.log(o)
console.log([... range(1,3)]) // [1, 2, 3]

// ===========================

const range2 = (a,b) => [... (function* f(x,y) {
    while(x <= y) yield x++;
})(a,b) ]
console.log(range2(1,3)) // [1, 2, 3]



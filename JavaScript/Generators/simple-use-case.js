
function test2(cnt) {
    return function () {
        let temp = cnt;
        cnt++;
        return temp;
    }
}

let fun = generator(test2, 1);
console.log(fun.next()) // 1
console.log(fun.next()) // 2
console.log(fun.next()) // 3
console.log(fun.next()) // 4
console.log(fun.next()) // 5
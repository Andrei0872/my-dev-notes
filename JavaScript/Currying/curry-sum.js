
function adder() {
    return [].slice.call(arguments).reduce((a,b) => a + b);
    // return [...arguments].reduce((a,b) => a + b)
}


function curryIt(func) {
    let fn = func
    let that

    return function temp(...args) {
        if (!that) that = this

        if (args.length === 0) {
            const result = fn()
            fn = func
            return result
        }

        fn = fn.bind(that, ...args)
        return temp
    }
}

const curryAdder = curryIt(adder);
curryAdder(1);
curryAdder(1, 2, 3);
curryAdder(2)(2, 5)

const ex1 = curryAdder();
console.log(ex1) // 16

curryAdder(2, 2, 2, 2)(2, 100)
const ex2 = curryAdder()
console.log(ex2) // 110



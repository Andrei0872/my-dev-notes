
// Currying - the technique of translating the evaluation of a function that takes multiple args
// into evaluating a sequence of functions, each with a single arg

function add(x, y, z) {
  return x + y + z;
}

const yack = (fn, ...args) =>
    args.length >= fn.length ? fn(...args) : (...args2) => {
        // console.log(fn)
        // console.log(args)
        // console.log(args2)
        return  yack(fn, ...args, ...args2)
    }

var curriedAdd = yack(add)
console.log(curriedAdd(1)(2)(3)) // 6

curriedAdd = yack(add)
console.log(curriedAdd(1,2)(3)) // 6

curriedAdd = yack(add)
console.log(curriedAdd()(1,2,3)) // 6

curriedAdd = yack(add)
console.log(curriedAdd(1)(2)()(3,4,5)) // 6

curriedAdd = yack(add)
console.log(curriedAdd(1)()()()(2)()(3)) // 6

curriedAdd = yack(add);
console.log(yack(yack(yack(curriedAdd)(1)))(2)(3)) // 6

curriedAdd = yack(add)(1)
console.log(curriedAdd(2)(3)) // 6
console.log(curriedAdd(2)(4)) // 7



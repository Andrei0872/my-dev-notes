function test() {
    let s = [].slice.call(arguments);
    console.log(s)
}

function wrapper(func) {
    console.log(arguments)
    return func.apply(null, [].slice.call(arguments, 1));
}

wrapper(test, 20, 30);


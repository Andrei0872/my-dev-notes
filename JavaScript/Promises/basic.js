
Promise
    .resolve()
    .then(() => Promise.reject('error1'))
    .then(() => console.log('test')) // Won't get executed
    .catch(console.log)
    .then(() => console.log('continue1'))

Promise
    .resolve()
    .then(() => Promise.reject('error2'))
    .then(() => console.log('continue2'), console.log) // error2
    .then(() => console.log('continue3'))

Promise
    .resolve()
    .then(() => Promise.resolve('nice!!'))
    .then(res => {
        console.log(res);
        return Promise.reject('error3')
    })
    .catch(console.log)
    .then(() => console.log('continue4'))

/* 
Output:

error2
nice!!!
error1
continue3
continue1 // Here basically the promise is already resolved
error3 // .then() vs a fresh returned Promise 
continue4

*/
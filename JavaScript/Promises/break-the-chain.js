
// Useful when the desire is to handle errors separately

Promise
    .resolve(2)
    .then(num => {
        if (num === 2) {
            // Break the chain
            return Promise.reject('number 2 is not allowed!')
            // throw new Error('number 2 is not allowed!'); // Either this
        }
        return Promise.resolve('ok')
    })
    .catch(err => (console.log('error!', err), Promise.reject('no access!'))) // This will `break` the chain
    .then(resp => (console.log(resp), Promise.resolve('still ok')))
    .then(console.log)
    .then(resp => (console.log(resp), Promise.resolve('still ok2'))) // Not executed
    .then(console.log)
    .then(resp => (console.log(resp), Promise.resolve('still ok'))) // Not executed
    .then(console.log)
    .catch(err => console.log('err!', err)) // no access!

// Output: ​​​​​error! number 2 is not allowed! -> ​​​​​err! no access!​​​​​

// ================================================================================

Promise
    .resolve(2)
    .then(num => {
        if (num === 2) {
            // Break the chain
            return Promise.reject('number 2 is not allowed!')
        }
        return Promise.resolve('ok')
    })
    .catch(err => console.log('error!', err))  
    .then(resp => Promise.resolve('still ok'))
    .then(console.log) 
    .then(resp => Promise.resolve('still ok2'))  
    .then(console.log)
    .then(resp => Promise.resolve('still ok3'))  
    .then(console.log)
    .catch(err => console.log('err!', err)) 

// Output: ​​​​​error! number 2 is not allowed!​​​​​ -> ​​​​​still ok -> ​​​​​still ok2​​​​​ ->​​​​​ still ok3​​​​​
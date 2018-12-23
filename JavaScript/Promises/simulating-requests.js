

function funWithPromise(arg) {
    return new Promise((res, rej) => {
        // Simulating an ajax request 
        return Promise.resolve(arg)
            .then(resp => {
                resp % 2 === 0 && res(resp); 
                throw new Error('not ok')
        }).catch(err => {
            rej("odd number!" + err);
        })
    });
}


funWithPromise(3)
    .then(cb) // num * 2
    .catch(err => {
        console.log(err) // ​​​​​odd number!Error: not ok​​​​​
    })

function cb (num) {
    console.log(num * 2)
}

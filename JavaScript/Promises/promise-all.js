
// Handling multiple promises even if some fail

function dummyPromise(param) {
    return param !== 5 ? Promise.resolve(param) : Promise.reject('no!!!')
}

const requests = [{
        trello: dummyPromise(1),
        medium: dummyPromise(2)
    },
    {
        trello: dummyPromise(3),
        medium: dummyPromise(4)
    },
    {
        trello: dummyPromise(5).catch(() => 'no!'),
        medium: dummyPromise(6)
    },
]

const promises = []

requests.forEach(req => promises.push(...Object.values(req)))

Promise.all(promises)
    .then(console.log)
    .catch(console.error)
// => [ 1, 2, 3, 4, 'no!', 6 ]​​​​​
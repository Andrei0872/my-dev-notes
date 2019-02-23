const fetchRes = (rejectPromise = false) => new Promise((resolve, reject) => setTimeout(!rejectPromise ? resolve : reject, 1000, 'andrei'));

const solvedPromise = () => {
    // Make sure the promise is returned so you can used its returned value after
    return fetchRes()
        .then(val => val)
        .catch(err => console.error(err))
};

const rejectedPromise = () => {
    return fetchRes(true)
        .then(val => val)
        .catch(err => new Error(err))
}

// ===================================================

const asyncSolvedPromise = async () => {
    return await fetchRes();
}

solvedPromise()
    .then(val => console.log('name:', val)) // name: andrei

asyncSolvedPromise()
    .then(val => console.log('name from asyncSolvedPromise:', val)) // name from asyncSolvedPromise: andrei 

rejectedPromise()
    .then(val => console.log('another value:', val))
    .catch(err => console.log('err value:', err))
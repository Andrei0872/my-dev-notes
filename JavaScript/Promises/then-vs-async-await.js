function* taskQueue() {
    for (let i = 0; i < 10; i++) {
        yield new Promise((resolve) => {
            setTimeout(resolve, (11 - i) * 1000, i)
        })
    }
}

// ====================================================

// 11 seconds
// const q = taskQueue();
// for (const val of q) {
//     // `then()` - runs only when the promise is completed
//     val.then(console.log)
// }

// ====================================================

// `async` - the function block will wait for every Promise specified 
//           with the `await` keyword
// So, it will wait for ever Promise to resolve before continuing execution ==> the function block is synchronous
// (async () => {
//     const q = taskQueue();
//     console.log('q', q)
//     for (const val of q) {
//         const solvedVal = await val;
//         console.log(solvedVal)
//     }
// })();

// ====================================================

// Workaround #1
// (async () => {
//     // [... taskQueue()] - the promises are fired all at the same times ==> solved in parallel ==> it takes max(times)  
//     [... taskQueue()].forEach(async promise => {
//         const solved = await promise;
//         console.log(solved)
//     })
// })();

// ====================================================

// Workaround #2
// All the promises' values will be available when max(times) is solved
// (async () => {
//     const responses = await Promise.all([... taskQueue()])
    
//     responses.forEach(console.log)
// })();

// ====================================================
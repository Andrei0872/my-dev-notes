
(async () => {
    
    function fetch(name, time) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(name)
            }, time);
        });
    }


    const arrList = ['andrei', 'dan', 'john', 'jane', 'bill']

    arrList[Symbol.asyncIterator] = async function * () {
        yield* arrList.map((name, i) => name !== 'dan' ? fetch(name, i * 800) : fetch(name, 3000))
    };

    console.log('results ready!')
    
    /* 
    'andrei' after 800ms,
    the rest after 3 second
    */
    // for await (const name of arrList) {
    //     console.log(name)
    // }
    
    // Will return all the results after 3 seconds.
    const results = await Promise.all(
        arrList.map((name, i) => name !== 'dan' ? fetch(name, i * 800) : fetch(name, 3000))
    )
    results.forEach(name => console.log(name))
    
    
    // =============================================================
    
    
    const reqs = [fetch('andrei', 1000), fetch('dan', 3000), fetch('john', 500)]

    // The idea is that all the request start being processed at the same time
    // In the above example, 'john' will be returned after 3 seconds
    // Because for await of processes the promises sequentially and so
    // when 'dan' ready, `john` will be instantly ready, because it was basically waiting for `dan` to finish
    reqs[Symbol.asyncIterator] = async function * () {
        yield * [... this]
    }

    for await (const res of reqs) {
        console.log(res)
    }

    // All requests start at the same time, but all will be available when the longer one finishes
    const results = (await Promise.all(reqs))
    results.forEach(name => console.log(name)
    
})();


// =============================================================

/* 
All the requests responses will be printed at the same time, after 2 seconds.
Because all the requests are fired at the same time and even though 'jane' is ready before 'john',
they both must wait for the first request, which takes 2 seconds.
So for-await-of processes requests sequentially. As soon as one is ready, it will be solved, 
BUT notice that the order can change that.
If the time sequence was: [1000, 2000, 3000], the requests would be solved in the same order.
*/
(async () => {
    const fetch = (time, name) => new Promise((resolve, reject) => setTimeout(resolve, time, name))

    const reqs = [fetch(2000, 'andrei'), fetch(1000, 'jane'), fetch(2000, 'john')]

    reqs[Symbol.asyncIterator] = async function* () {
        yield* this.map(async req => await req)
    }

    for await (const resp of reqs) {
        console.log(resp)
        /* 
        andrei
        jane
        john
        */
    }
})();



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


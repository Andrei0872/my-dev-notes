
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
})();



const wait = time => new Promise(resolve => setTimeout(() => resolve(), time))

const asyncIt = (limit = 10, delay = 100) => {
    let iter = 1
    let exhausted = false

    return {
        async next() {
            if(iter > limit || exhausted) {
                return { done: true }
            }
            await wait(delay);
            return {
                value: iter++,
                done: false
            }
        },
        async throw(e) {
            console.log('something went wrong!')
            throw e
        },
        async return() {
            exhausted = true
            console.log('I\'ve been released')
            return { done: true }
        }
    }
}

const asyncIterable = (limit = 10, delay = 100) => ({
    [Symbol.asyncIterator] () {
        return asyncIt(limit, delay)
    }
})

const consume = async asyncIterable => {
    // const iterator = asyncIterable[Symbol.asyncIterator]()

    // while(true) {
    //     const { value, done } = await iterator.next();

    //     if(done)
    //         break;

    //     console.log(value) // 1, 2... 10
    // }

    const overtwriteLimit = 5;

    for await (const val of asyncIterable) {

        // Will invoke the `return()` method
        if(val > overtwriteLimit)
            break;
        
        console.log(val)
    }
}

consume(asyncIterable())

// ==========================================================

(async () => {
    let orders = ['order1', 'order2', 'order3', 'order4'];
    const fetch = (name, time) => new Promise(resolve => setTimeout(resolve, time, name))

    orders[Symbol.asyncIterator] = async function * () {
        yield * [... this].map(async(order, i) => {
            return await fetch(`resolved ${order}`, i * 1000);
        })
    }

    for await (const resolvedOrder of orders) {
        console.log(resolvedOrder)
    }

    console.log('finished !')
    /* 
    --> 
    resolved order1
    resolved order2
    resolved order3
    resolved order4
    finished!
    */
})()

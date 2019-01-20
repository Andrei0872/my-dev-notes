
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

// Random Example

const names = ['andrei', 'gatej', 'john', 'jane'];
const objNames = {
    [Symbol.asyncIterator]: async function * () {
        // for(let name of names) {
        //     yield name
        // }
        yield * names
    }
}

!(async function () {
    for await (const name of objNames) {
        console.log(name)
    }
})();

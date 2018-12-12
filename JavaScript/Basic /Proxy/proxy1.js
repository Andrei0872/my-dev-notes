
//* Proxy

/**
 * Proxies make it possible to drastically clean up and abstract access to objects
 * 
 * 
 * let you control access to an object(instead of calling obj props directly, you call something else that calls it)
 * 
 * 
 * another usage: caching layer, so you request smth from an obj(API call) and the proxy can store these values
 * then, when you make another request for the same res, it can come from the proxy storage.. rathar than having to make another slow request
 * 
 */


// ================================================

const user = {
    firstName: 'Andrei',
    lastName: 'Gatej',
    email: 'andreigtj01@gmail.com'
}

// In order to have an easy access to obj props(assuming this would get much more complex),
// we'll use a proxy object
// For that, we'll need a `target`(our object) and a `handler`


//* handler - object obj that declares a number of `traps`
// which are triggered by making calls to the object that's been proxied

const handler = {
    // Access any property on our proxy
    get: function (target, prop) {
        // console.log(context)

        if(prop === 'fullName') {
            return `${target.firstName} ${target.lastName}`;
        } else {
            return target[prop]
        }
        // You might as well implement some sort of validation..
    }
}

let proxiedUser = new Proxy(user, handler);

console.log(proxiedUser.fullName) // Andrei Gatej

// ======================================


let bears = {grizzly: true}

let grizzlyCnt = 0;

let proxyBears = new Proxy(bears, {
    get: function (target, prop) {
        if(prop === 'grizzly') grizzlyCnt++
        return target[prop]
    },
    set: function (target, prop, value) {
        if(['grizzly','polar','brown'].indexOf(prop)  === -1) {
            throw new Error('Thats not a bear');
        }
        target[prop] = value
    },
    deleteProperty: function (target, prop) {
        console.log(`deleted ${prop}`)
        delete target[prop]
    }
});

proxyBears.polar = true
// proxyBears.adada= true // Error
console.log(proxyBears.polar) // true

delete proxyBears.polar // deleted polar
console.log(proxyBears.polar) // undefined


// ======================================

function growl() {
    return 'grrr'
}

const loudGrowl = new Proxy(growl, {
    apply: function(target, thisArg, args) {
        return target().toUpperCase() + "!!!"
    }
})

console.log(loudGrowl()) // GRRR!!!


// =======================================

const person = {
    first: 'bear',
    last: 'mcBearison'
}

const cleverPers = new Proxy(person, {
    get: function (target, prop) {
        console.log(prop)
        if(!target.hasOwnProperty(prop)) {
            return prop.split('_').map(part => target[part]).join(' ')
        }
        return target[prop]
    }

});

console.log(cleverPers.first) // bear
console.log(cleverPers.first_last) // ​​​​​bear mcBearison​​​​​

// ==============================================

const indexedArray = new Proxy(Array, {
    construct: function (target, [originalArray]) {
        const index = {};
        originalArray.forEach(item => index[item.id] = item)

        const newArray  = new target(...originalArray)
        return new Proxy(newArray, {
            get: function (target, prop) {
                if(prop === 'push') {
                    return function (item) {
                        index[item.id] = item;
                        // Array.push()
                        console.log(target)
                        return target[prop].call(target, item);
                    }
                }
                if(prop === 'getAll') {
                    return function () {
                        return newArray
                    }
                }
                if(prop === 'findById') {
                    return function (id) {
                        return target.find(item => item.id === id)
                    }
                }
            }
        })
    }
})

// let temp = [1,2,3]
// temp['push'].call(temp,44)
// console.log(temp)

const bears2 = new indexedArray([
    {id : 2, name: 'grizzly'},
    {id : 4, name: 'black'},
    {id : 3, name: 'polar'},
])

bears2.push({
    id:55,
    name: 'brown2'
})

console.log(bears2.getAll())
/*
​​​​​[ { id: 2, name: 'grizzly' },​​​​​
​​​​​  { id: 4, name: 'black' },​​​​​
​​​​​  { id: 3, name: 'brown' },​​​​​
​​​​​  { id: 55, name: 'brown2' } ]​​​​​
*/

const brown = bears2.findById(55);
console.log(brown) // ​​​​​{ id: 55, name: 'brown2' }​​​​​
console.log(bears2.findById(3)) // ​​​​​{ id: 3, name: 'polar' }​​​​​

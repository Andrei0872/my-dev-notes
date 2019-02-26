// Reactive system using Proxy

let data = {
    price: 5,
    quantity: 2
};
let target, total, salePrice;


// Proxy traps - intercept data

class Dep {
    constructor() {
        this.subscribers = [];
    }

    depend () {
        if (target && !this.subscribers.includes(target)) {
            this.subscribers.push(target)
        }
    }

    notify () {
        this.subscribers.forEach(sub => sub())
    }
}

// Store all the Dep instances
let deps = new Map();

Object.keys(data).forEach(key => {
    deps.set(key, new Dep());
});

data = new Proxy(data, {
    get (obj, key) {
        // Call `depend()` on that particular key
        deps.get(key).depend();
        return obj[key]
    },

    set (obj, key, newVal) {
        obj[key] = newVal;
        deps.get(key).notify();
    }
});

function watcher(myFunc) {
    target = myFunc
    target();
    target = null;
}

watcher(() => {
    total = data.price * data.quantity;
})

watcher(() => {
    salePrice = data.price * 0.9;
})

console.log('total = ', total);
data.price = 20;
console.log('total = ', total);
data.quantity = 10
console.log('total = ', total);

deps.set('discount', new Dep());
data['discount'] = 5;

salePrice = 0;

watcher(() => {
    salePrice = data.price - data.discount
})

console.log('salePrice = ', salePrice)
data.discount = 7.5;
console.log('salePrice = ', salePrice)
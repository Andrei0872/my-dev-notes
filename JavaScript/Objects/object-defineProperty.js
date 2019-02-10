

// https://stackoverflow.com/questions/18524652/how-to-use-javascript-object-defineproperty

//* Object.defineProperty()


//* Property - OOP feature designed for clean separation of client code

// get - accessor
// set - mutator


function Product(name , price) {
    this.name = name
    this.price = price
    var _discount
    Object.defineProperty(this, "discount", {
        get: function () { return _discount; },
        set: function (value) { _discount = value; if(_discount > 80) _discount = 80; }
    })
}

// Client code
var sneakers = new Product("Sneakers", 20)
sneakers.discount = 50 // Setter called
sneakers.discount += 20 // Settter called
console.log(sneakers.discount)

// ==============================================


/**
 ** accessor descriptor = get + set (above)
 * 
 * get() - fn, its return value is used in reading the prop
 * 
 * set() - fn, assigning a value to a property
 * 
 * 
 ** data descriptor = value + writable
 * 
 * value - if writable, configurable, enumerable are true ===> behaves like an ordinary data field
 * 
 * enumerable - default: false(still accessible as public), if true - will be iterated
 * 
 * configurable - may be changed and if the prop may be deleted from the corresponding obj and whether its attributes may be changed
 * 
 * writable - the prop may be changed with an assignment operator
 * 
 */


var o = {}

Object.defineProperty(o,'test', {
    value: "test value",
    configurable: true
});

console.log(Object.getOwnPropertyNames(o)) // ['test']
console.log(Object.getOwnPropertyDescriptor(o,'test'))


// ===============================================

//* Object.defineProperty() - defines a new property directly on an object, or modifies an existing property on an obj (property with descriptors)


o.nume = "andrei"
console.log(o)
console.log(Object.getOwnPropertyDescriptor(o,'nume'))

Object.defineProperty(o, 'nume', {
    writable: false
});

console.log(Object.getOwnPropertyDescriptor(o,'nume'))


// ================================================

//! Inherited props will be considered as well

var obj ={}
var descriptor = Object.create(null); // No inherited props, not configurable, enumerable or writable
descriptor.value = 'static';
Object.defineProperty(obj, 'key', descriptor);


// ================================================


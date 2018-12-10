

let person = {
	name: 'andrei',
	age: 17,
	city: 'targoviste'
}

function f(...args) {
	console.log(`hello ${this.name}, you're ${this.age} years old; args: ${JSON.stringify(args)}`)
}

Function.prototype.apply.call(f, person, ['arg1', 'arg2']) // hello andrei, you're 17 years old; args: ["arg1","arg2"]​​​​​

f.apply(person, ['arg1', 'arg2']) // ​​​​​hello andrei, you're 17 years old; args: ["arg1","arg2"]​​​​​

// ==============================================================

// Where does the Reflect object come handy ? 

let o =  {
	apply: function (...args)  {
		console.log(`args : ${JSON.stringify(args)}; ${this.name}`)
    }
}

o.apply(1,2,3) // ​​​​​args : [1,2,3]; undefined​​​​​

// Hmm. undefined!
// We can still use the 'apply' function, but it doesn't look very nice
o.apply.apply(person, ['arg1', 'arg2']) // ​​​​​args : ["arg1","arg2"]; andrei​​​​​

// This also works
Function.prototype.apply.call(o.apply, person, ['arg1', 'arg2']) // args : ["arg1","arg2"]; andrei

// Here come the `Reflect` Object
Reflect.apply(o.apply, person, ['arg1','arg2']) // args : ["arg1","arg2"]; andrei​​​​​

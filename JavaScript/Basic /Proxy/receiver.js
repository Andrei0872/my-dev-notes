

// What's the receiver

var handlers = {
    get(target, key, context) {
        console.log(greeter === context)
        return function() {
            context.speak(key + "!")
        }
    }
}

var catchall = new Proxy({}, handlers);

var greeter = {
    speak(who = "someone") {
        console.log('hello', who)
    }
}

// Setup `greeter` to fall back to `catchall`
Object.setPrototypeOf(greeter, catchall);

greeter.speak() // hello someone

greeter.speak("world") // hello world

greeter.everyone() // hello everyone


// Receiver - the object in which the property lookup happens
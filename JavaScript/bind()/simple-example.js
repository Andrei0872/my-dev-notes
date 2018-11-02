

function show() {
    console.log(this)
}

const obj = {
    name : "andrei",
    age : 17
};

show(); // Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
show.bind(obj)(); // {name: "andrei", age: 17}

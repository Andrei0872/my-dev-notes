
// https://medium.freecodecamp.org/my-favourite-line-of-code-53627668aab4


let unimportantPromiseTask = () => {
    return Math.random() > 0.5 ? 
        Promise.reject('random fail') : 
        Promise.resolve('random pass');
};



const solve = async () => {
    // let data = await unimportantPromiseTask();  
    // console.log(data) // random pass      
    let {err, res} = handle(await unimportantPromiseTask())
    console.log(err) // 0
    console.log(res) // valid
}

solve()
 
function handle(result) {
    console.log(result)
    let err, res;

    result !== "random pass" ? (err="errors", res="invalid") : (err="0", res="valid");
    return {err,res};
}

//* You can either use .catch() or a handler

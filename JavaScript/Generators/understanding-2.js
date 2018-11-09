// https://www.youtube.com/watch?v=Zk_rX2n3Ml8

//* Generators

function* bears() {
    // If added "yield", when calling the funciton, the func will run, 
    // but will stop the the word "yield"
    // And will run the rest of the func at the next call 
    yield 'grizzly';
    yield 'polar';
    console.log('You should not see me')
    return 'done';
}

// console.log(bears());
// Iterator returned
var bear = bears();
console.log(bear.next()); // { value: 'grizzly', done: false }
console.log(bear.next()); // { value: 'polar', done: false }

// If commented, it will not run the console.log() from func body
//console.log(bear.next()); // { value: 'done', done: true }


//* Adding values to generators

function* bears2() {
    // When we stop here, we expect a value and we can use the variable later on
    var kind = yield 'grizzly';
    yield kind + ' polar ';
    console.log('You should not see me')
    return 'done';
}

var bear2 = bears2();
console.log(bear2.next()) //  { value: 'grizzly', done: false }
// Between the var kind =  && kind +  ' polar ';
console.log(bear2.next('ferocious')) //  { value: 'ferocious polar ', done: false }


//* __dirname - name of the current dir that the exec script resided in
//* process.cwd() - the current working directory of the process

const fs = require('fs');


/**
 *@function resume callback func 
 */
run(function* (resume) {
    console.log('getting content') // # 3
    var contents = yield fs.readFile(`${__dirname}/date1.txt`, 'utf8', resume);
    console.log('got content') // # 7
    var uppercase = contents.toUpperCase();
    console.log('writing content') // # 8
    yield fs.writeFile(`${__dirname}/date2.txt`, uppercase, resume);
    console.log('All done');
});

/**  
 * @param {function *} generator returns a generator 
*/
function run(generator) {
    let data = null,
        yielded = false;
    // The param of {generator} is the callback function from fs.readFile()
    console.log('getting iterator') // # 1
    // Something Asynchronous happening here
    let iterator = generator(function () {
        data = arguments;
        console.log('calling check() function'); // # 6, # 11 - at second call
        check();
    });
    console.log('iterator here') // # 2
    let it = iterator.next()
    console.log('it', it) // # 4
    yielded = !!(it)
    console.log('yielded #1', yielded); // # 5
    function check() {
        // console.log('running check()') - this gets called after # 6
        while (data && yielded) {
            let [err,item] = data;
            data = null;
            yielded = false
            if (err) return iterator.throw(err);
            yielded = !!(iterator.next(item))
            console.log("yielded", yielded) // # 9..
            console.log("data", data) // # 10 .. 
        }
    }
    // Without this, it will directly run the parameter of {geneartor} from above.
    console.log('should be 6th') // YES! Finally understood how it works
}
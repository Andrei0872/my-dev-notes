
// https://stackoverflow.com/questions/53002477/convert-arrays-of-arrays-to-object-with-key

/*
Example
var values = [[1, 2, 3], [3, 2, 1]]

Output : 
values = [
    {'up': 1, 'middle': 2, 'down': 3},
    {'up': 3, 'middle': 2, 'down': 1}
]
*/


let values = [[1, 2, 3], [3, 2, 1]];

let result = values.map(([up,middle,down]) => ({up,middle,down})); ;
console.log(result); // [ { up: 1, middle: 2, down: 3 }, { up: 3, middle: 2, down: 1 } ]

let result2 = values.map(elem => ({"up" : elem[0], "middle" : elem[1], "down" : elem[2]}));
console.log(result2); //  [ { up: 1, middle: 2, down: 3 }, { up: 3, middle: 2, down: 1 } ]


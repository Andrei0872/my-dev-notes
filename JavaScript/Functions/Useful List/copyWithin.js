
// https://www.codementor.io/robertwozniak/javascript-dives-copy-it-with-copywithin-pf354hn7a

//* copyWithin - mutable

// Syntax
// array.copyWithin(targetIndex, startPos, endPos)

const array = [6,7,9,15,[56,57,58]];
let res = array.copyWithin(4,0,1);
console.log(res) //  [ 6, 7, 9, 15, 6 ]
console.log(array) // Modified :  [ 6, 7, 9, 15, 6 ]


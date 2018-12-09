
let str = "andr3eeee1"
console.log(str.replace(/((?!\d))/g, '*')) // "*a*n*d*r3*e*e*e*e1*"
console.log(str.replace(/((?=\d))/g, '*')) // "andr*3eeee*1"

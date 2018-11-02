

let date1 = new Date();
console.log(date1) //  Thu Oct 30 2018 23:34:29 GMT+0300 (Eastern European Summer Time)
date1.setDate(date1.getDate() - 5);

console.log(date1) // Thu Oct 25 2018 23:34:29 GMT+0300 (Eastern European Summer Time)
console.log(date1.getFullYear()) // 2018


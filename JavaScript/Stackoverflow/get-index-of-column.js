
// https://stackoverflow.com/questions/53052717/how-to-get-index-of-column-based-on-continuous-sequence-of-values

// 0   1   2
// 3   4   5
// 6   7   8
// 9   10  11
// 12  13  14
// 15  16  17
// 18  19  20
// 21  22  23
// 24  25  26
// 27  28  29

function componentInfo(offset) {
    return {
        page : Math.floor(offset / 3),
        component : offset % 3
    }
}
let n  = 29;
const rows = Math.floor(n/3) + 1;
// let matrix = [...Array(rows)].map(item => [...Array(3).fill(0)]);
// let matrix = [...Array(rows)].map(item => []);
let matrix=  Array.from({length : rows}, (item=> []));

for(let i = 0; i <=n; i++) {
    let item = componentInfo(i);
    matrix[item.page][item.component] = i;
}


console.log(matrix)

class RangeGenerator {
    constructor ({ start, end, step }) {
        this.start = start;
        this.end = end;
        this.step = step;
    }

    *[Symbol.iterator] () {
        let start = this.start;

        while (start <= this.end) {
            yield start;
            start += this.step;
        }
    }
}

const range = new RangeGenerator({ start: 0, end: 20, step: 5 })

for (const num of range) {
    console.log(num) // 0 5 10 15 20
}


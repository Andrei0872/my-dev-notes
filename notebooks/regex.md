# Regex Notebook

- [Knowledge](#knowledge)
- [Named Capture Groups](#named-capture-group)
- [Lookbehind](#lookbehind)
- [Lookahead](#lookahead)

## Knowledge

* `.*?` - match **as little as possible**
* `.*` - any symbol **any number of times**

---

## Named Capture Groups

* **capture phase**: `(?<name-of-group>)`

* **using phase**: `$<name-of-group>`

<details>
<summary>Example</summary>
<br>


```typescript
let re = /(\d{4})-(\d{2})-(\d{2})/;
let match = re.exec('2019-04-19')
console.log(match) // ['2019-04-19', '2019', '04', '19', index: 0, input: '2019-04-19', groups: undefined ]​​​​​

re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
match = re.exec('2019-04-19')

console.log(match.groups) // { year: '2019', month: '04', day: '19' }

// ===================================

re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
match = re.exec('2019-04-19')

console.log(match.groups) // { year: '2019', month: '04', day: '19' }
```
</details>

<details>
<summary>Find consecutive duplicate words in a sentence</summary>
<br>


```typescript
re = /\b(?<dup>\w+)\s+\k<dup>\b/
match = re.exec('Get that that cat off the table!');
console.log(match[0]) // ​​​​​that that

// ==================================

const sameWords = /(?<word>\w+)\s*===\s*(\k<word>)/
console.log(sameWords.test("andrei === andrei")) // true
console.log(sameWords.test("orange === apple")) // false

// ==================================

const switchNames = /(?<firstName>\w+)\s+(?<lastName>\w+)/;
console.log("Andrei Gatej".replace(switchNames, "$<lastName> $<firstName>")) // Gatej Andrei

// ==================================
// ==================================
```
</details>

---

## Lookbehind

<details>
<summary>Example</summary>
<br>


```typescript
re = /(?<=\$|£|€)\d+(\.\d*)?/
console.log(re.exec('199')) // null
console.log(re.exec('$199')) // ​​​​​[ '199', undefined, index: 1, input: '$199', groups: undefined ]​​​​​
console.log(re.exec('€199.30')) // ​​​​​​​​​​[ '199.30', '.30', index: 1, input: '€199.30', groups: undefined ]
```
</details>

---

## Lookahead

<details>
<summary>Example</summary>
<br>


```typescript
let str = "andr3eeee1"
console.log(str.replace(/((?!\d))/g, '*')) // "*a*n*d*r3*e*e*e*e1*"
console.log(str.replace(/((?=\d))/g, '*')) // "andr*3eeee*1"
```
</details>
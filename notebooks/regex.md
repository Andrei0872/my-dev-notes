# Regex Notebook

- [Regex Notebook](#regex-notebook)
  - [Knowledge](#knowledge)
    - [Shorthands](#shorthands)
      - [`+`](#)
      - [`*`](#-1)
      - [`?`](#-2)
  - [Named Capture Groups](#named-capture-groups)
  - [Lookbehind](#lookbehind)
  - [Lookahead](#lookahead)
  - [Quantifiers](#quantifiers)
  - [The `s` flag](#the-s-flag)
  - [Backreferences](#backreferences)
  - [`RegExp.exec` vs `String.match` vs `String.matchAll`](#regexpexec-vs-stringmatch-vs-stringmatchall)
  - [The `m` flag](#the-m-flag)

## Knowledge

* `.*?` - match **as little as possible**
* `.*` - any symbol **any number of times**

### Shorthands

[Resource](https://javascript.info/regexp-quantifiers) :sparkles:

#### `+`

* **one or more**

* same as `{1, }`

<details>
<summary>Example</summary>
<br>


```typescript
("100 10 1").match(/\d0+/g) // ["100", "10"]
```
</details>

#### `*`

* **zero or more**

* same as `{0, }`

<details>
<summary>Example</summary>
<br>


```typescript
("100 10 1").match(/\d0*/g) // ["100", "10", "1"]
```
</details>

#### `?`

* **zero ore one**

* same as `{0, 1}`

---

## Named Capture Groups

* **capture phase**: `(?<name-of-group>)`

* **using phase**: `$<name-of-group>`

* reference a Named Captured Group: `\k<name>`

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

* step backwards and make the check; something (not) preceded by something else

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

* match something (not) followed by something else

<details>
<summary>Example</summary>
<br>


```typescript
let str = "andr3eeee1"
console.log(str.replace(/((?!\d))/g, '*')) // "*a*n*d*r3*e*e*e*e1*"
console.log(str.replace(/((?=\d))/g, '*')) // "andr*3eeee*1"
```
</details>

<details>
<summary>Negative lookahead</summary>
<br>

```typescript
const re = /\((?!(.*[?]))/;

re.test('(abcd)') // true
re.test('(ab?cd)') // false
```

```typescript
// without `.*`, it would only be `false` if `?` comes first after `(`
const re = /\((?!(.*[?]))/;

re.test('(abcd)') // true
re.test('(?abcd)') // false
re.test('(ab?cd)') // true
```
</details>

---

## Quantifiers

* **possesive**(`+`) - all or nothing

* **greedy**(`*`) - longest possible string
    ```javascript
    /s.*o/.exec('stackoverflow')
    // stackoverflo
    ```

* **lazy**(`?`) - shortest possible string
    ```javascript
    /s.+?o/.exec('stackoverflow')
    // stacko
    ```
---

## The `s` flag

* `.` does not match line terminators

```js
/^.$/.test('\n') // false

// `[^]` - matches any character, including newline
/^[^]$/.test('\n') // true

// `/s` - match newline characters as well
/^.$/s.test('\n') // true

// this flag can be verified with the `dotAll` read-only property
/^.$/s.dotAll // true
/^.$/.dotAll // false
```

---

## Backreferences

```js
const re = /(\w+)\.(\w+).\1/
const s = "abcd.xyz.abcd"

s.match(re) // [ "abcd.xyz.abcd", "abcd", "xyz" ]
```

---

## `RegExp.exec` vs `String.match` vs `String.matchAll`

* `RegExp.exec` can be used when capturing - gives the match, followed by the captures(named or unnamed)

* with `RegExp.exec`, you can get access to `regexpObject.lastIndex`

* `String.match` will ignore **capture groups** (if the `g` modifier is used)

```js
re = /(\w+)\-\w+-(?<foo>\w+)/g
s = "abc-xyz-www"

s.match(re) // [ "abc-xyz-www" ]
re.exec(s) // [ "abc-xyz-www", "abc", "www" ]

// when the global modifier is not used
re = /(\w+)\-\w+-(?<foo>\w+)/
s.match(re)
/* 
// the same is returned with `re.exec(s)`
{
  0: "abc-xyz-www",
  1: "abc",
  2: "www",
  groups: Object { foo: "www" },
  index: 0,
  input: "abc-xyz-www",
  length: 3,
}
*/
```

* when the global modifier is used, `String.match` will return all the matches(without capture groups), whereas `Regexp.exec` will return all the matches if using `while(re.exec(s))`, on each iteration is returned the match along with its captured groups; in this case `String.matchAll()` returns the same values as `while(re.exec(s))`, but all of them at once

```js
re = /(\w+)\-\w+\-(?<foo>\w+)/g
s = "a-b-c x-y-z"

s.match(re) // [ "a-b-c", "x-y-z" ]

console.log(re.exec(s))
/* 
0: "a-b-c"
1: "a"
2: "c"
groups: {foo: "c"}
index: 0
input: "a-b-c x-y-z"
length: 3
*/

console.log(re.exec(s))
/* 
0: "x-y-z"
1: "x"
2: "z"
groups: {foo: "z"}
index: 6
input: "a-b-c x-y-z"
length: 3
*/

console.log(re.exec(s)) // null

[...s.matchAll(re)]
/* 
0: Array(3)
  0: "a-b-c"
  1: "a"
  2: "c"
  groups: {foo: "c"}
  index: 0
  input: "a-b-c x-y-z"
  length: 3
1: Array(3)
  0: "x-y-z"
  1: "x"
  2: "z"
  groups: {foo: "z"}
  index: 6
  input: "a-b-c x-y-z"
  length: 3
*/
```

---

## The `m` flag

* a multiline string should be treated as multiple lines; as a result, the `^` and `$` anchors will match the start or the end of **each** line in the string, instead of the start or the end of the **entire string**

```js
re = /(\w+)\s*$/g

s.match(re) // ["eeee"]

re = /(\w+)\s*$/gm
s = `aaaa bbbb
cccc
dddd eeee`

s.match(re) // ["bbbb", "cccc", "eeee"]
```
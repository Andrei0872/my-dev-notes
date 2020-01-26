# TypeScript Notebook

- [TypeScript Notebook](#typescript-notebook)
  - [Knowledge](#knowledge)
    - [types[] &amp; typeRoots[]](#types-amp-typeroots)
    - [typeRoots[]](#typeroots)
    - [types[]](#types)
    - [files](#files)
    - [declare](#declare)
    - [naked parameters](#naked-parameters)
    - [mapped types](#mapped-types)
    - [Discriminated Unions](#discriminated-unions)
    - [Singleton Types](#singleton-types)
    - [index signature](#index-signature)
    - [Predicate functions](#predicate-functions)
    - [Union and Intersection types](#union-and-intersection-types)
      - [Union Types](#union-types)
    - [Generic type inference](#generic-type-inference)
      - [Generic Class](#generic-class)
  - [Types](#types)
    - [Create a condition-based subset of types](#create-a-condition-based-subset-of-types)
    - [Type Assignments](#type-assignments)
    - [infer](#infer)
    - [as const](#as-const)
    - [never](#never)
    - [Merge Types](#merge-types)

## Knowledge

### types[] & typeRoots[]

- not general-purpose ways to load declarations (*.d.ts) files
- load typing declarations from NPM packages

### typeRoots[]

- add additional locations from where type packages will be loaded from automatically

### types[]

- disable automatic loading behavior 

### files

- specify a list of ts files that will be included by the compiler(url absolute/relative)
- not affected by **exclude** property

### declare

- define a variable/function/class that may not originate from typescript(i.e using a library that does not use ts); 

### naked parameters

- not wrapped in another type(i.e: _array_, _tuple_, _function_, _promise_)

- a naked parameter is** distributed over a union**
  the **conditional type** is **applied** for each **member** of the **union**
    <details>
    <summary>Example</summary>
    <br>


    ```typescript
    type Exclude<T, U> = T extends U ? never : T:

    type Foo = Exclude<'a' | 'b' | 'c', 'c'> // "a" | "b"
    ```
    </details>

### mapped types

* types created based on old types

### Discriminated Unions

* **discriminant**: a **singleton type** that is **common** for each of the types of the union([Example here](#never))

* to **discriminate a union** means to choose to **narrow on a specific one**

### Singleton Types

[Resource](#https://medium.com/@tar.viturawong/using-typescripts-singleton-types-in-practice-f8b20b1ec3a6)

* allow TS to see a **specific primitive type exactly as that type**
```typescript
type Foo = 'foo';
const foo: Foo = 'foo';
```

* singleton types are seen in **primitive literals** that are **directly returned**, **directly passed to a function** or **asssigned to a constant**, but **NOT** in those **nested in object or arrays**;  
in order to mitigate that, delcare types explictly
```typescript
const v = 'andrei'; // Type: 'andrei'

const o = { name: 'andrei' };
const v2 = o.name; // Type: string
const v3 = o.name as 'andrei'; // Type: 'andrei'
```

### index signature

* defines how an type can be extended

### Predicate functions

* get the **right type** at **runtime**

<details>
<summary>Example</summary>
<br>


```typescript
type Dog = {
  breed: string;
  wof: VoidFunction;
}

type Cat = {
  lives: number;
  meow: VoidFunction;
}

type Animal = Dog | Cat;

function isDog(p: Animal): p is Dog {
  // Leveraging the power of type guards!
  return 'breed' in p;
}

let animal: Animal;

if (isDog(animal)) {
  console.log(animal.wof)
  console.log(animal.breed)
} else {
  console.log(animal.meow)
  console.log(animal.lives)
}
```
</details>

### Union and Intersection types

#### Union Types

<details>
  <summary>Example</summary>

  ```typescript
  type AType = 'a' extends 'a' | 'b' ? number :  string; // number

  type BType = 'a' | 'b' extends 'a' ? number : string; // string

  type CType = 'a' | 'b' | 'c' extends 'a' | 'b' ? number : string; // string

  type DType = 'a' | 'b' extends 'a' | 'b' | 'c' ? number : string; // number
  ```
</details>

### Generic type inference

#### Generic Class

* the type `T` of the class will be **inferred** by the compiler if the `T` is **required in the constructor**

  <details>
  <summary>Example</summary>
  <br>


  ```typescript
  class Bar<T> {
    randomVar: T;

    constructor (public name: T) { }
  }

  const b = new Bar(true);

  b.name // boolean
  b.randomVar // boolean
  ```
  </details>

* if the type `T` is **neither manually specified or inferred** as above, each class variable which is of type `T` will have the `unknown` type

  <details>
  <summary>Example</summary>
  <br>


  ```typescript
  class Bar<T> {
    randomVar: T;

    constructor (public name: boolean) { }
  }

  const b = new Bar(true);

  b.name // boolean
  b.randomVar // unknown

  ```
  </details>

---

## Types

### Create a condition-based subset of types

[:sparkles: Resouce](https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c).

<details>
<summary>Example</summary>
<br>


```typescript
interface Person {
    id: number,
    name: string,
    lastName: string,
    load: () => Promise<Person>
}

/**
 * @returns
 * Conditional types
 * 
 * { prop: type | never }
 */
type FilterFlags<Base, Condition> = {
    [K in keyof Base]: Base[K] extends Condition ? K : never
}

/**
 * Grabbing the names of keys
 * 
 * `keyof` - ignores `never`
 */
type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base]

/**
 * `Pick` - iterates over provided key names and extracts the associated type to the new object
 */
type SubType<Base, Condition> = Pick<Base, AllowedNames<Base, Condition>>;

/**
 * One expression
 * 
 * type SubType<Base, Condition> = Pick<Base, { [K in keyof Base]: Base[K] extends Condition ? K : never }[keyof Base]>;
 */

const p: SubType<Person, string | number> = { name: 'n', lastName: 'a', id: 123 }

// Usage

interface PersonLoader {
    // loadAmountOfPeople (): number;
    loadAmountOfPeople: () => number;
    loadPeople: (city: string) => Person[],
    url: string
}

/**
 * Filter out everything except functions
 */
// type Callable = SubType<PersonLoader, (_: any) => any>
type Callable = SubType<Person, (_: any) => any>

// const person1: Person = <Person>{}
// person1.name = 'name'
// person1.lastName = 'lastName'
// person1.id = 1233
// person1.load = () => { return new Promise() }

const callable: Callable = { load: (): Promise<Person> => { return new Promise(resolve => resolve()) } }
```
</details>

---

### Type Assignments

```typescript
type X = { name: string; };
type Y = { name: string; age: number; }

let x: X = { name: 'andrei' };
let y: Y = { name: 'gatej', age: 123 };

// Are `x's` returned types included in `y` ?
x = y;

// `x` - does not have the `age` property, so we'll have an error
y = x;
```

### infer

* allows to `infer` the type from a **conditional**; it's like saying: 'Hey TS, give whatever type you infer to be at this position and assign it to `R`(if using `infer R`)'

* it can also **accumulate** the **inferred types** by **inferring** the **same variable multiple times** in a condition

<details>
<summary>Example</summary>
<br>


```typescript
type Arr = string[];

type GetArrType<T> = T extends (infer R)[] ? R : T

type ArrType = GetArrType<Arr>; // string

interface Person {
  name: string;
  age: number;
}

// ====================================

type APromise = Promise<Person>;

type GetPromiseType<T> = T extends Promise<infer R> ? R : T;

type PromiseT = GetPromiseType<APromise>; // Person

// ====================================

type GetAccumulatedTypes<T> = T extends {
  a: (...args: infer U) => infer R;
  b: (...args: infer U) => infer R;
} ? R : T;

type ObjType = {
  a: (name: string) => boolean;
  b: (age: number) => string;
};

type AccType = GetAccumulatedTypes<ObjType>; // boolean | string

// ====================================

interface Person {
    name: string;
    age: number;
}

function foo(): Person {
    return {
        name: 'andrei',
        age: 18,
    };
}

type RetType<F> = F extends (...args: any[]) => infer R ? R : never;

type R = ReturnType<typeof foo> // Person

type R2 = RetType<typeof foo> // // Person
```
</details>

---

### `as const`

[Resource](#https://dev.to/aexol/typescript-tutorial-use-as-const-to-export-colors-39fl) :sparkles:

* prevent widened literal types (from `"andrei"` to `string`)

* **array** literals become **readonly tuples**

* **object literals** get **readonly properties**

<details>
<summary>Example</summary>
<br>


```typescript
const Colors = {
  cherry: "#F9193F",
  mars: "#F19037",
  meteor: "#FFE3C8"
};

type ColorsTypeWithoutAsConst = typeof Colors;
/* 
const Colors: {
    cherry: string;
    mars: string;
    meteor: string;
}
*/

const Colors = {
  cherry: "#F9193F",
  mars: "#F19037",
  meteor: "#FFE3C8"
} as const;

type ColorsTypeWithAsConst = typeof Colors;

/* 
const Colors: {
    readonly cherry: "#F9193F";
    readonly mars: "#F19037";
    readonly meteor: "#FFE3C8";
}
*/

// ========================================


const people = [
  { name: 'foo', age: 123 },
  { name: 'bar', age: 200 },
] as const;

for (const person of people) {
  console.log(person.name === 'bar')
}

```
</details>

### `never` 

* used to **enforce checking exhaustiveness**: making sure you're covering all variants of a union type

<details>
<summary>Example</summary>
<br>


```typescript
interface IFoo {
  type: 'foo';
  name: string;
}

interface IBar {
  type: 'bar';
  age: number;
}

interface IBaz {
  type: 'baz';
  city: string;
}

type Union = IFoo | IBar | IBaz;

function func (u: Union) {
  switch (u.type) {
    case "foo": {
      console.log(u.name);
      break;
    }
    
    default: {
      // The compiled makes sure you're not leaving something unchecked!

      // Type '"bar" | "baz"' is not assignable to type 'never'
      const x: never = u.type;
    }
  }
}
```
</details>

### Merge Types

<details>
  <summary>Example</summary>

  ```typescript
type Omit<T, U extends keyof T> = Pick<T, Exclude<keyof T, U>>;

type Merge<M, N> = Pick<M, Exclude<keyof M, keyof N>> & N;

type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;

interface Person {
  name: string;
  age: number;
}

interface Random {
  a: string;
  b: number;
  c: boolean;
  p: Person;
}

type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N

type Random2 = Merge<Random, { b: boolean, p: Merge<Person, { age: string }> }>;
const r2: Random2 = {
  a: 'str',
  b: true,
  c: true,
  p: { name: 'name', age: '123' }
}


```
</details>

---

### Generics

* a **concrete type parameter** cannot be assigned to a **generic type parameter**, as the generic one can defined differently than the concrete one

```ts
type Fn<P extends unknown[], R extends object> = (...args: P) => R;

type DefaultFn<P extends any[] = any[], R extends object = object> = Fn<P, R>;

function fun<
  T extends string,
  P extends any[], // P - generic type
  R extends object
>(type: T, c: Fn<P, R>): Fn<P, R> { // P - still generic
  // ...args: any[]: `any[]` is **more defined** than `P`
  return (...args: any[]) => ({
    ...c(...args),
  })
}

// Solution - function overloading
function fun<
  T extends string,
  P extends any[],
  R extends object
> (t: T, c: Fn<P, R>): Fn<P, R> & { type: string }
function fun<T extends string, F extends DefaultFn>(t: T, c: F) {
  return (...args: any[]) => ({
    ...c(...args),
    type: t,
  })
}

const r = fun('[action]', (u: User) => u);
r({ data: { name: 'a', age: 18 } });
// r(); // ERROR
```

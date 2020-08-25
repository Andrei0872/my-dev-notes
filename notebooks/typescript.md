# TypeScript Notebook

- [TypeScript Notebook](#typescript-notebook)
  - [Knowledge](#knowledge)
    - [types[] & typeRoots[]](#types--typeroots)
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
    - [Subtypes](#subtypes)
      - [Type Constraints](#type-constraints)
    - [Specifying the function's `this` type](#specifying-the-functions-this-type)
  - [Types](#types-1)
    - [Create a condition-based subset of types](#create-a-condition-based-subset-of-types)
    - [Type Assignments](#type-assignments)
    - [infer](#infer)
    - [`as const`](#as-const)
    - [`never`](#never)
    - [Merge Types](#merge-types)
    - [Contextual typing](#contextual-typing)
    - [Generics](#generics)
    - [Mapped tuples](#mapped-tuples)
    - [Opaque types](#opaque-types)
  - [Assertion Functions](#assertion-functions)
  - [Structural and Nominal typing](#structural-and-nominal-typing)
    - [Structural typing](#structural-typing)
    - [Nominal typing](#nominal-typing)
  - [The `declare` keyword](#the-declare-keyword)
  - [`ThisParameterType<F>`](#thisparametertypef)
  - [`Array[number]`](#arraynumber)
    

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

### Subtypes

* `A` is a **subtype** of `B` is `A` is equal to `B`, but it also has additional information(**properties** and/or **methods**)

#### Type Constraints

* **only restricts different types**, **not different subtypes**

```ts
interface Foo {
  prop1: string;
}

interface FooSubtype1 {
  prop1: string;
  prop2: string;
}

// Different subtype
interface FooSubtype2 {
  prop1: string;
  prop3: string;
}

const fooObj: Foo = { prop1: 'prop1 - foo' };
const fooObjSubtype1: FooSubtype1 = { prop1: 'prop1-subtype1', prop2: 'prop2-subtype1'};
const fooObjSubtype2: FooSubtype2 = { prop1: 'prop1-subtype2', prop3: 'prop3-subtype2' };

// No restrictions
const foo = <T>(p: T) => 'andrei';

foo(fooObj);
foo(fooObjSubtype1);
foo(fooObjSubtype2);
foo(undefined);

// Only (different) subtypes of `Foo` are allowed
const foo2 = <T extends Foo>(p: T) => 'hello';

foo2(fooObj);
foo2(fooObjSubtype1);
foo2(fooObjSubtype2);
foo2(undefined); // ERROR
```

### Specifying the function's `this` type

[TypeScript Playground](https://www.typescriptlang.org/play/#code/MYGwhgzhAEBCYCdoG8BQ1oHMEFMcBcAKAOzAFscAuaCfBAS2MwEoV0NpgB7YiLkHADoQXTIQAGACRwgR0ACTJSFAL4BCccwDc7FahXRUqUJBgAxLlzYZuvOgFdg+LgkIAzYtUL4AFvQjU8AgANNDKVDR0jCzQALwAfJEMTKxoHNAegsBgsiQ4AO5wiITMoQDkYMQAJrj0ZdrsGAD0TRnEhBXVtfVa0ACiAEoDAPID0AC00OK+-uLQZPa00ABGODQEuvpGbvbETvQ8GZYACojk3n4BRSFh5BG0yTFp0DMQgth4ROEN7Lj49ghiLcKDo9MYeEs3HEwgVoBYuO4TmcyNogA
).

```ts
class Bar {
  greet(name: string) {
    console.log(`Hello ${name}!`);
  }
} 

class Foo {
  constructor(fn: (this: Bar, name: string) => string) {
    fn.call(new Bar(), 'andrei');
    // fn('andrei'); ERROR - `this` must be set
  }
}

function fooParam(this: Bar, name: string) {
  this.greet(name);

  return name;
}

const f = new Foo(fooParam);
```

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

### Contextual typing

* the type of an expression is determined based on the location

```ts
interface Foo<T> {
  foo: T;
  ok: 'ok',
}

function fun<P extends object>(): Foo<P> {
  return { ok: 'ok', foo: undefined! };
}

function bar<P extends object>(a: Foo<P>): P {
  return {} as P;
}

const r = bar(fun<{ age: number }>());
// r.age
```

```ts
interface Foo<T> {
  foo: T;
}

type Fn<S> = (s: S) => Foo<S>;

interface State {
  users: string[];
}

const initState: State = {
  users: ['andrei'],
}

function bar<S>(state: S, fn: Fn<S>) {}

bar(initState, ({ users }) => {
  return { foo: { users } };
})

```

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

### Mapped tuples

[TypeScript Playground](https://www.typescriptlang.org/play/?ssl=1&ssc=1&pln=39&pc=38#code/C4TwDgpgBAglC8UAUA7ArgWwEYQE5QB8oBnYXASxQHMBKAbQF0AoAYwHsVSoBDALlgRQ6ARgA0UAOTCATAGYJ4iXIkMA3EyahIUAEKC66bHnGkK1Naw5cs-PYhGLTK9ZvDQAwoIDiEYAFUUcg4AHhgAPldtABFvXwCglGCdCMjoH39AkIAVMMEsqAgAD2AIFAATYlhcXG4QYMoAMzwoP1yAfhaofhQIADc8dQB6QYR4MfGJyanpmYmNLTS4zJR3NgwMbNzEfKKS8sqYatrg1fWQxuaAJTD2qEuuqB7+3HUFqAA1bgAbNAgAeQapw2iRyeQKxVKFSgQPOKCa+GuUA6926fQGqSgWTQYC+ECybAACrg1uRiBBgqDtuC9lDDjU6jDEtwUCAbkioABvJhQIQAayglCgvIgIDYDUxDH4RJJZOCnx+-0Ba2BFLovIYNyYAF8Hk90UxKCVcA1uCwPMrsoJTJQqLkuTz2GcUNKwPwsuotRoWF9uMRKgAxNhsAUYHEQDClYCVRnBQw4XB27lQR3Al2CGSydQ8pPsThkNAsYBsXBIMBoLBfcgsR7cCP8a3UGicqCerUub2+yo6bj4cih3ERlBR6EWlCcnOjtOICRYHtQMDEsAAQgkWagE7zuALRfwpfLler3CoEG6mHjTY5Le1XqswB41X0PQA7lBA2wkBJmWVcBByBIaOIz66D2SDCAAHDQFhMMMUAAAa5iw3DALBUA4AAFtwvRBLgGLuMIsQZAkMYLGK94Jq8bjQtIeTYri+LShgpLkiR4o9uRQA)

```ts
type A = (number | string)[]
const a: A = [1, '123', '23'];

type B = [number, string];
const b: B = [1, 'str'];

type C = GetUnion<A>
type D = GetUnion<B>

type GetUnion<T> = T extends Array<infer U> ? U : never;
// =========================================

type GetUnionCommon<T> = T extends Array<Common<infer R>> ? R : never;
type ValueOfCommon<T> = T extends Common<infer R> ? R : never;
type TupleToPromise<T> = T extends Array<Common<any>> ? {
  [k in keyof T]: Promise<ValueOfCommon<T[k]>>
} : never;

interface Common<T = string> {
  commonProp: T;
}

class Foo implements Common<number> {
  commonProp = 123;
  
  constructor(public name: string) { }
};

class Bar implements Common {
  commonProp = 'bar prop!';
  
  constructor (public age: number) { }
}

const arr = [new Foo('andrei'), new Bar(18)];

// `concat` behavior
type C1 = GetUnionCommon<typeof arr>; // string | number
type C2 = TupleToPromise<typeof arr>; // Promise<string | number>[]
```

### Opaque types

* `opaque` - cannot be seen through
* types that you want to hide some parts of the implementation from
* **cannot directly** modify the type's values, can only use what's being made visible by the API that provides that type
* a type that is **only exposed**, **never concretely defined**
* **compatible** only when **explicitly declared/created**, which means that they can also be **statically validated**
* **similar** to **nominal types**

```ts
type Email = string & { _: 'Email' };
type Username = string;

function getDetails (u: Username, e: Email) {
  return `${u}, ${e}`;
}

const username = 'andrei';
const email = 'foo@bar.com';

function assertEmailIsValid(e: string): asserts e is Email {
  if (!e.includes('@')) {
    throw new Error('invalid email!');
  }
}

assertEmailIsValid(email);

// Due to `& { _: 'Email' }`
// `username` will have a squiggle
// getDetails(email, username);

// Works fine, as `email` is explicitly validated above
getDetails(username, email);
```

[TypeScript Playground](https://www.typescriptlang.org/play/?ssl=24&ssc=29&pln=1&pc=1#code/C4TwDgpgBAogtgQwJYBsoF4oGdgCckB2A5lAGRQDeUA+gFxQDk8yKDUAvgNwBQokUAVSwRcBBHGiYc+Yj24AzAK4EAxsCQB7AlCIRgAET0ssUABSL6QkWIkAaKBHrNUASkrconqLj2LRUAAMAEgpFdnsQiHYAnnZubhUtHChFYVFxSUYEAgATHyQGHkSCZIhEVAxGeQ0NAAEAIwRcADpEuEL4pVV1LSgELDTgZxQASSwANQQUJBzTR2w8QiIXen7Bk2gkE2H3LygkeTMAQghmwhUURRyILFMGWoYXNwoPPa9gAAtcDQB3KAIIH8YLhvrg7oQAG5TGYOcooI6PHh7OJxeJrERDOFjSbTWZlFguOQAeiJUH0imgwA0gXIVDojGGbGi3BJgVS1gyASgP1QaA+CAh0AQ2AAjookEQiCgICzSboDEZULd8ah7Oz0hJCfF5YZgMZzGkbBB7CqUFqWQAqKC8cDQHZSRayG38KwazLSJZyLpqTTaHWKlAmcyWQ0ZE1OOHPV6eHzAPzaYKhcJQSLRWLcC1E2VQACySAAHhAcikwFBPtAwE0MsARFANLhrrh7PVFMAoAAVADKUByGhu-w0bbaYBQyAI2f6ZdtJia0HqIB7EHkCEUKDbATw2SwlZ8BGAAWzEmySzL-LbBygACYp5AZz4FrhFGo-FMUAuZhA90gVFN7OWF7OUDDggwD1KgMqsgEwxcugsGeAErpGlyk4BB6xAwXBqGOkQB6sv6epKnMcJqqGmo8EAA).

---

## Assertion Functions

[TypeScript Playground](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgBIFcC2cTIN4BQyyIcmEAXMgM5hSgDmA3EcnA5SVgEbQsC+BAqEixEKAIIhg2ADb5WpclVr0QzVrIgNqVEDz4FBBGOhAIwwAPa441atDABJahmwgAFOipucyAD7IUjJwsgCUVHYOUGDUyOjIwHG+uITEwDDIHgDk7BDZibjoYQrExFAQYOhQICzExsRgABZQVgDuJBAdAKJQrVA5IFbITVg4AITZYQJCJmYW1rgcYN3gwJYAnh4RaGO4gcFypcgINrRsPnvIALz4bBxUAIwATADMADQkZJy5IAAmFWABX4LFYFSqNTYMwIpxA5wg4BuyGWq0sm22oIA9JjkABhPy8eIOP5sOJwZBgDYABxQDHQcCgfwIUUcLhSHgRYGmQk5ADolBAWHy8licSyYosaMAGKQIRBqEJTOZLDZEtQAMp0RgeXQ0LXqAJcTC8KA7OJJPVqBjHcHVXCUmlWTJxa6u5DZVSMbLQpULVXi5wa-UMHUqYOG-TG6A7ANxc1x8NpRKZDwOiBOmg3N0e4NTY7EbHIFwUqDoZobVjlSp2urIBoUlrtTo9PpWAbZIZgNiWxiTbnGX0q3AwKxWDxUsNWiMGU3HQsZLJJTVW8dhEpJwvEKm8sBWACqVJpUHxDgxrEL9fnKbTGapWduOateaTBZx293ABl2tATxAz6+6yEYgAxcZdtSpblzxxJxMjaFAKkQJoIBJZoLSpKwRE+dZkHIHA4gAAypfDkFMWQYGAWQtBQpCThsP51kWVh333Q8fzsP9+yAA).

* as opposed to **type predicates**, which return `true` or `false`, an assertion function either returns **void** or **throws an error**

```ts
interface Human {
  name: string;
  age: number;
}

interface Animal {
  name: string;
  legs: number;
}

function assertIsHuman(u: Human | Animal): asserts u is Human {
  if ('age' in u) {
    return;
  }

  throw new Error('no human!');
}


function getEntitiy(): Human | Animal {
  const a: Human = { age: 123, name: 'andrei' };

  return a;
}

const ent = getEntitiy();

// Can be used as a type guard
assertIsHuman(ent);

ent.name;
ent.age;

// assertion signatures

function isString(s: string | number): s is string {
  return typeof s === 'string';
}

function assertIsString(s: string | number): asserts s is string {
  if (typeof s === 'string') {
    // Is truthy
    return;
  }

  throw new Error('not a string!');
}

function foo(p: string | number) {
  // if (isString(p)) {
  //   p.toUpperCase();
  // }

  // if (typeof p === 'string') {
    // p.toLowerCase();
  // }

  assertIsString(p);

  // If we reached this point, it means `p` fulfilled the condition
  p.toUpperCase();
}
```

---

## Structural and Nominal typing

### Structural typing

* 2 **different types**, with the **same shape** are **compatible**(they have the same structure)

  ```ts
    interface User {
      name: string;
      city: string;
  }

  interface Employee {
      name: string;
      city: string;
  }

  const u: User = { city: 'u_city', name: 'u_name' };
  // Works fine
  const e: Employee = u;
  ```


### Nominal typing

* 2 **different types** are **not** **compatible**(they have different names)
* might be useful when you want fo share a function that should receive an argument of a concrete type;  
  
  ```ts
  type Branded<T, K> = T & { __brand__: K };

  type User = { name: string, age: number };

  type TaggedUser = Branded<User, 'USER'>;
  
  function createUser(u: User) {
    return u as TaggedUser;
  }

  // Make sure it receives an object of `TaggedUser`
  // not just another object that follows this structure: { name: string, age: number }
  function addUser(u: TaggedUser) { /* ... */ }

  const user = createUser({ name: 'andrei', age: 18 });

  // addUser({ name: 'andrei', age: 18 }); // ERROR
  addUser(user); // OK
  ```

* **branding** - making **types** of the **same shape** **incompatible**; it adds **uniqueness** to a type

```ts
// `Branded` is just a type -> there will be no runtime cost, as it will not be
// present in the output code
type Branded<T, K> = T & { __brand__: K };

type Apple = { isRotten: boolean };

type RedApple = Branded<Apple, 'red'>;
type GreenApple = Branded<Apple, 'green'>;

const r: RedApple = { isRotten: false } as RedApple;
const g: GreenApple = r; // ERROR
```

---

## The `declare` keyword

[TypeScript Playground](https://www.typescriptlang.org/play/?ssl=1&ssc=1&pln=20&pc=2#code/MYGwhgzhAEAKCmAnCB7AdtA3tAvgKD1EhgEEB3eVAW3gWXSz2megAcBXAIxAEthoAJinKUUNAMoAXdgDMZACgCUALmgA3FDwFZcefIXBRoAFQAW8GoxbR2EJBFV1UaANoBdaAF5o7gNx6CIiMAETBEAGszC3hoeAAPSXg0ARgoy0wmFgB6LOgAK1tJaAhWeGAeGQBPHjQAc2hJUzAixp4YVkQUUsRJSugmmAEKmSQklsrSmBqG0zboYHREhMzmATLwRBjbe1URalp7dD8Caw5uPkEUKVkFRStrFhkURGh5NTCbOxeUGRm2gDptsg7hkHmDPkh-kI9mJ4Nc5Ep-ODdNZ8DggA).

```typescript
class Person { }

class AwesomePerson {
  public doAwesomeStuff(): void { }
}

class Theme {
  users: Person[] = [];
}

class DarkTheme extends Theme {
  // just specifying that this property has different types in this context
  declare users: AwesomePerson[];

  public doStuff() {
    for (var user of this.users) {
        user.doAwesomeStuff();
    }
  }
}
```

---

## `ThisParameterType<F>`

* extracts the `this` type of a function type

```ts
// `--strictFunctionTypes` must be enabled

interface Person {
  name: string;
  age: number;
}

function foo(this: Person) { }

type R = ThisParameterType<typeof foo> extends Person ? true : false; // true
```

---

## `Array[number]`

[*TypeScript Playground*](https://www.typescriptlang.org/play?#code/FAMwrgdgxgLglgewgAhAhAeAKsgpgDxlwgBMBnZAJVwEMSkAbATwEEAnNmpjAb2Tdr0IzVHFwMSAORoBbXAC5kZGGzgQA5sgC+APh0AKGoqwBKRdSgI2JbAG0IYGQCNcbALq2A5CDETpczzcAGmQndAZaCB1kHmBkeORLCGVkBABeGK1kGgoaCCYAbmA4hIEYMDYUGgA6ARIwKFx9QygoEKg2GBNkNOjYhIHs1tsOmC8fcSlZXEC3HuQVMFwiksH+XHLKoagiga0QhBMirWKklJp52z4Jv2nFb3RPbRDr3ym5e6caNietOZzEkhlCszjB+PM0AhDEdimxql82MA4ZCgA)

```typescript
function foo<T extends ReadonlyArray<{ readonly fieldName: string }>>(a: T): Record<T[number]['fieldName'], boolean> {
    const o= {} as any;

    return a.reduce((acc, crt) => {
        acc[crt['fieldName']] = true;

        return acc;
    }, o);
}

const a = [{ fieldName: 'foo' }, { fieldName: 'bar' }] as const;

const r = foo(a);

r.bar
r.foo
```
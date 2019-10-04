# TypeScript Notebook

* [Knowledge](#knowledge)  
* [Types](#types)
    * [Create a condition-based subset of types](#create-a-condition-based-subset-of-types)
    * [Type Assignments](#type-assignments)
    * [infer](#infer)

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

* allows to `infer` the type from a **conditional**

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
```
</details>

# TypeScript Notebook

[Knowledge](#knowledge)  
[Types](#types)  

## Knowledge

**types[] & typeRoots[]**
- not general-purpose ways to load declarations (*.d.ts) files
- load typing declarations from NPM packages

**typeRoots[]**
- add additional locations from where type packages will be loaded from automatically

**types[]**
- disable automatic loading behavior 

**files**
- specify a list of ts files that will be included by the compiler(url absolute/relative)
- not affected by **exclude** property

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

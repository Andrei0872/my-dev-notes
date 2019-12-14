# GraphQL Notebook

- [GraphQL Notebook](#graphql-notebook)
  - [Knowledge](#knowledge)
    - [GraphQL Document](#graphql-document)
    - [Fields](#fields)
    - [Types](#types)
  - [Fragments](#fragments)
    - [Inline Fragments](#inline-fragments)
  - [Operations](#operations)
    - [Query](#query)
    - [Mutation](#mutation)
    - [Subscription](#subscription)
  - [Directives](#directives)
  - [Schema](#schema)

## Knowledge

- the query is shaped just like the data it returns; it returns exactly what a client asks for
- provides a **separation of structure**(schema - abstract descr of server's capabilities) **and behavior**(actual implementation - resolvers)

### GraphQL Document

- contains **operations**(*subscriptions*, *queries*, *mutations*) as well as **fragments**

### Fields

- describes one piece of information
- might contain selection set (deeply nested requests)
- functions that return values

<details>
<summary>Example</summary>
<br>

```typescript
{
    // It can also be given an alias
    andrei: user (id: 4) {
        id
        name
        smallPic: profilePic (size: 64),
        bigPic: profilePic (size: 1024)
    }
}
```

</details>

### Types

- `scalar`: primitive values
- `object`(can be used as output type): set of fields
- `input`
- `interface`(can be used as output type): defines a list of fields
- `union`(can be used as output type): one of the possible types will be returned
- `enum`: allow the schema to define exactly what data is expected

---

## Fragments

- allow the **reuse** of common repeated selection of fields
- can be specified on **object types**, **interfaces** and **unions**
- **cannot** be specified on any input values (**scalar**, **enumeration**, **input object**)
- the type of the object must match the type the fragment is operating on
- query variables can be used within fragments; **query variables** have **global scope** in a given **operation**


<details>
<summary>Example</summary>
<br>

```typescript
query withFragments {
    user (id: 4) {
            friends (first: 10) {
        ...friendsFragment
        }

        mutualFriends (first: 10) {
        ...friendsFragment
        }
    }
}

// `on` - specify the type they apply to
fragment friendsFragment on User {
    id
    name
    ...standardProfilePic
}

fragment standardProfilePic on User {
    profilePic(size: 50)
}
```

</details>

### Inline Fragments

- conditionally include fields based on their runtime type

<details>
<summary>Example</summary>
<br>

```typescript
{
profiles (...) {
    handle
    ... on User {
        friends {
        count
        }
    }
}
}
```

</details>

---

## Operations

### Query

- read-only fetch
- describe a tree of information

### Mutation

- a write followed by a fetch

<details>
<summary>Example</summary>
<br>

Like a blog post then receive the new number of likes

```typescript
{
   mutation {
      likePost (postID: 12345) {
           post {
            likeCount
           }
      }
   }
}
```

</details>

### Subscription

- long-lived request that fetches data in response to source events

---

## Directives

- provide a way to **describe/alternate** **runtime execution** and **type validation behavior**;example: conditionally including/skipping a field

    <details>
    <summary>Example</summary>
    <br>


    ```typescript
    query myQuery ($someVal: Boolean) {
        # Conditional exclusion
        experimentalField @skip(if: $someVal): String
        
        # Conditional inclusion
        anotherField @include(if: $someVal): Int
    }
    ```
    </details>

- must be used in the locations they are defined to belong in

    <details>
    <summary>Example</summary>
    <br>

    ```ts
    directive @example on FIELD

    fragment someFragment on SomeType {
        field @example // FIELD
    }

    // ======

    // Can also annotate field and argument definitions

    directive @example on FIELD_DEFINITION | ARGUMENT_DEFINITION
    
    type SomeType {
        field (arg: Int @example): String @example # FIELD_DEFINITION
    }

    ```

    </details>

---

## Schema

- **defines** what **types** and **directives** it **supports**
- defines root operation types: **query**, **mutation**, **subscription**
- each **document** must **include** a **schema** definition
    ```typescript
    schema {
        query: MyQueryRootType
        mutation: MyMutationRootType
    }
    ```


---

# Concepts

- [Concepts](#concepts)
  - [Software Architecture](#software-architecture)
  - [Referential Transparency](#referential-transparency)
  - [Component](#component)
    - [Stateful Components](#stateful-components)
    - [Stateless Components](#stateless-components)

## Software Architecture

A **unit** composed of **multiple parts** along with **rules & constraints** that define how these **parts communicate**.

---

## Referential Transparency

A functional programming-related concept, which says that in a program, an **expression** can be **replaced** by a **value** **without changing** the **result** of the **program**.

In order words, it means that given the **same inputs**, the expression will always **produce** the **same output**.

```typescript
function plusOne (num: number) {
    return num + 1;
}
```

The above function is a referential transparent one, because you can **replace** it **with** a **value** instead of calling the function.
We could, for example, use `11` instead of `plusOne(10)`.

---

## Component

An isolated piece of functionality that allows us to achieve a better separation of concerns.

### Stateful Components

- drives state changes
- provides data(i.e from http layers)
- utilises **stateless components**
- has knowledge of the current state

### Stateless Components

- similar to **pure functions**: they **do not** contain **free variables**
- receive **data** via **property binding**(equivalent to **function arguments**)
- emit **changes** via an **event**(equivalent to a **return** statement)

---

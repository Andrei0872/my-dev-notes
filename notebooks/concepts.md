# Concepts

- [Concepts](#concepts)
  - [Software Architecture](#software-architecture)
  - [Referential Transparency](#referential-transparency)

## Software Architecture

* a **unit** composed of **multiple parts** along with **rules & constraints** that define how these **parts communicate** 

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

## zip

`zip(observable|iterators, resultSelector?)`

* uses `formArray` -> meaning that after all the inputs have been sent, it will `complete`, which will cause the `observables` to be `subscribed`
* the observables store their inner values; when all have emitted at least once, the outer subscriber would receive an array composed of the **oldest values** of each observable
* when one observable **completes**
  * if its **buffer**(where inner values are stored) is **not empty**, it becomes **inactive**; if there are **no more active** observables, the **outer subscriber** will `complete` as well
  * if the **buffer** is **empty**, the outer subscriber will emit the `complete` notification to its destination subscriber
* the input can be an `observable` or any other `iterable`(array, custom iterable structure)

```ts
zip(
  fromEvent(b1, 'click').pipe(map((_, idx) => `btn1, click: ${idx}`), take(2)),
  fromEvent(b2, 'click').pipe(map((_, idx) => `btn2, click: ${idx}`)),
  // [1, 2, 3],
  (function * () { const a = [1, 2, 3]; yield * a })(),
)
.subscribe(console.warn)
```

---

## zipWith

```ts
src$.pipe(
  a(),
  zipWith(/* ... */),
  b(),
)
```

* `ZipOperator`'s destination is `bSubscriber`
* `bSubscriber` is destination for each `ZipBufferIterator`(what's inside `zipWith()`) and for each of their `InnerSubscriber`

```ts
src$.pipe(
  zipWith(a$, b$)
)

// ===

zip(src$, a$, b$);
```

---

## zipAll

* must make sure the source completes ❗️

```ts
new Observable(s => {
  s.next(of(1));

  s.next(of(2));

  // Nothing will happen without this
  s.complete();
}).pipe(
  zipAll()
).subscribe(console.log);
```

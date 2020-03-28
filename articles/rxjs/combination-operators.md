## zip

`zip(observable|iterators, resultSelector?)`

* uses `formArray` -> meaning that after all the inputs have been sent, it will `complete`, which will cause the `observables` to be `subscribed`
* the observables store their inner values; when all have emitted at least once, the outer subscriber would receive an array composed of the **oldest values** of each observable
* when one observable **completes**
  * if its **buffer**(where inner values are stored) is **not empty**, it becomes **inactive**; if there are **no more active** observables, the **outer subscriber** will `complete` as well

  ```ts
  notifyInactive() {
    this.active--;
    if (this.active === 0) {
      this.destination.complete();
    }
  }
  ```

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

### zipWith

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

### zipAll

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

---

## combineLatest

* `combineLatest(observables)` === `from(observables).lift(new CombineLatestOperator(resultSelector?))`
* will keep track of `N` observables and values, where `N = observables.length`
* will emit an array of values collected from all the stored `observables`; the array will be emitted to the destination subscriber when `toRespond === 0`, where `toRespond` **decreases** when one observable(which is being tracked) **emits** for the **first time**; thus, `toRespond === 0` when all the observables have **emitted** at **least once**
* if one tracked obs `completes`
  * if it is the only active observable left, the `complete notification` will be sent to the destination subscriber
  * its **last emitted value** will **not** be **removed**
* if one tracked obs `errors`
  * the `error notif` will be passed along to the destination subscriber

* differs from `zip` in the way tracked `observable`'s values are used
  * `zip`: each inner obs has its own buffer
  * `combineLatest`: only the **last emitted value** is **stored** & eventually emitted to the dest subscriber

### combineLatestWith

* `combineLatestWith(observables) === from([source, ...observables])`

### combineAll

`combineAll(projectFn)`

* `from(...)` is no longer used
* it only applies the `CombineLatestOperator(resultSelector?)` to the source -> in order for the observables(/promises/iterables) emitted from source to be subscribed, the **source must complete**

```ts
new Observable(s => {
  s.next(of(1));
  s.next(of(1, 2));

  setTimeout(() => {
    s.next(of(10));
  }, 500)

  setTimeout(() => {
    s.complete();
  }, 700);
}).pipe(
  combineAll()
).subscribe(console.log)
```

---

## forkJoin

_Note: `Subscribable` = `Observable` | `Iterable` | `Array` | `Promise`_

`forkJoin(arrayOfSubscribables | { [k]: Subscribable })`(_non deprecated_)

* all the observables must complete in order for the `ForkJoinSubscriber` to emit at least the `complete` notification
  * otherwise, no `value`/`complete notification` will be sent to the destination subscriber
* assuming all the observables completed
  * if **at least one** did not emit any values, the destination subscriber will only receive the `complete` notification
  ```ts
  if (completed === len || !hasValue) {
    if (emitted === len) {
      subscriber.next(keys ?
        keys.reduce((result, key, i) => ((result as any)[key] = values[i], result), {}) :
        values);
    }
    subscriber.complete();
  }
  ```
  * in order to send an array with the latest arrived values of each observable, then each obs must emit at least once
  ```ts
  next: value => {
    if (!hasValue) {
      hasValue = true;
      emitted++;
    }
    // Storing the last arrived value
    values[i] = value;
  },
  ```

  after the array has been sent, it would then emit a `complete` notification

```ts
forkJoin([
  of(1), of(2), of(3), /* EMPTY, */ /* NEVER */
])
  .subscribe(console.log, null, () => console.warn('COMPLETED'))
```

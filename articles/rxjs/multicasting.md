## multicast

`multicast(Subject|SubjectFactory, selector)`

* the base for other **multicasting selectors**
* puts a middleman(a variation of `Subject`) between the operators that are above and below `multicast()`

### `selector` provided

* the source's callback will be invoked on **every** new subscriber
* the `selector` can be used as a way to share data
  ```ts
  multicast(new Subject(), subject => merge(
    subject.pipe(a()),
    subject.pipe(b()),
    subject.pipe(c()),
  ))
  ``` 

  ```ts
  const src$ = new Observable<number>(s => {
  console.log('SUSBCRIBED');
  s.next(1);

  setTimeout(() => {
      s.next(2);
    }, 500);
  }).pipe(
    multicast(
      () => new Subject(),
      s => merge(
        s.pipe(map(v => v * 2)),
        s.pipe(map(v => v * 4)),
      )
    )
  );


  const s = src$.pipe(
    filter(v => !!v),
  ).subscribe(console.warn);

  src$.pipe(map(v => v * 10)).subscribe(console.log);
  ```

### `selector` not provided
  
* a `ConnectableObservable` will be returned
  * the subscriber will be added to the `Subject`'s list of subscribers
* all the subscribers whose operators are **above** `multicast` will become descendants of `ConnectableSubscriber`
* all the subscribers that are **below** `multicast` will be part of the list of subscribers that belongs to the `Subject` in use
* does not matter if the first arg is a `Subject` or a `SubjectFactory`, as the _factory_ will be needed only once
* when the source `errors`/`completes` - the subject in use will be nulled out
* if the `connectable` is unsubscribed from(with `(connectable$.connect()).unsubscribed()`)
  * the subject in use will be nulled out
  * the `ConnectableSubscribers`'s descendants will be unsubscribed as well

```ts
const src$ = new Observable(s => {
  setTimeout(() => {
    s.next(1);
    s.next(2);
  }, 500);
}).pipe(
  map(v => v),
  multicast(() => new Subject()),
);

src$.pipe(
  filter(v => !!v),
).subscribe(console.warn)

const conn = src$.connect();
```

---

## `ConnectableObservable` 

* will **subscribe** to the `source` when its `connect()` method is invoked
  * a `ConnectableSubscriber` will be provided to the `source`
* maintains a single `Subject` instance(`Subject`/`BehaviorSubject` etc)

### `ConnectableSubscriber`

* it is a `SubjectSubscriber`
* `error/complete` - will first `unsubscribe`, then pass along the notif. to the destination subject, which will in turn pass the notif. along to its registered subscribers
* `unsubscribe`
  * will _close_ the connection: `connection.unsubscribe()`
  * responsible for **clean-up**: `subject`, `connection`, `connectable` of `ConnectableObservable`

---

```ts
const src$ = new Observable(s => {
  console.log('SUBSCRIBED!');
  
  setTimeout(() => {
    s.next(1);
  }, 500);

  // After the second subscriber `subscribed`
  setTimeout(() => {
    s.next(2);
    // s.complete();
  }, 800);
}).pipe(
  // publish(), // multicast(new Subject()),
  // publishBehavior(0), // `BehaviorSubject(0)` as a middleman
  // publishLast(), // `AsyncSubject` as a middleman
  
  // `ReplaySubject` as a middleman
  // publishReplay(1),
  // refCount(),
  // shareReplay(1),

  // share(),
);

const s = src$.subscribe(console.warn);

setTimeout(() => {
  src$.subscribe(console.log);
}, 700);
```

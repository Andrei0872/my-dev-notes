## multicast

### With factory subject

* no need to _manually_ call `connect`
* the source's callback will be invoked on **every** new subscriber
* the **registered subscribers** will all **share** the **values emitted** from the **source subscriber**(the head node in the subscriber chain/the `subscriber` param of the source's callback)
* the registered subscribers will share the resource

```ts
const subj = new Subject();

const src$ = new Observable<number>(s => {
  console.log('SUBSCRIBED');

  // s.next(1);
  s.next(Math.random())

  // setTimeout(() => s.next(2), 500)
}).pipe(multicast(() => subj, sbj => sbj/* .pipe(map(v => v * 10)) */));

src$/* .pipe(map(v => v ** 2)) */.subscribe(console.warn);
src$.subscribe(console.warn);

console.log('========');

setTimeout(() => {
  src$.subscribe(console.log);
}, 500);
```

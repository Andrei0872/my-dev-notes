# RxJS Notebook

- [Concepts](#concepts)  
- [Observable](#observable) 
- [Subject](#subject)
- [Operators](#operators)
   - [Buffering](#buffering)
   - [find](#find)
   - [single](#single)
   - [combineAll](#combineAll)
   - [race](#race)
   - [expand](#expand)
   - [auditTime](#auditTime)
   - [catchError](#catchError)
- [Tricks](#tricks)
- [Custom Operators](#custom-operators)
  - [Understanding custom operators](#understanding-custom-operators)

---

## Concepts

> **rxjs**: has to deal with data that comes over time

### Observable

- wrapper around data source(stream of values)
- async data (not limited to this)
- is **push-based**(the observer pushes data into the observer)

#### `hot` observable

- can start **emitting** values **before** any **observer subscribes** to it

#### `cold` observable

- starts **emitting** values when it has **at least one observer**

### Observer

- does something whenever
    - a value/error occurs
    - the *observable* reports the `complete` status
- 3 methods
    - `next()`
    - `error()`
    - `complete()`
The observable knows when to call these methods throughout the **Subscription**

### Subscription
- `subscribe()`
- tells the observable that someone wants to know about its values
- connects _observer_ with _observable_
- what starts a stream execution

### Stream

* sequence of data elements which are available over time

### Project function

* give shape to the emitted data so that the **subs** can only **see** the **final result** and not the variable collection of emitted values

### High-order mapping operator

* `mergeMap`/`flatMap`, `switchMap`, `concatMap`, `exhaustMap`

* **maps outer** observable **to inner** observable and **automatically subscribes** to the inner one

---

# Observable

- is **unicast**: **each** subscribed observer owns an **independent** execution of the observable

   <details>
   <summary>Example</summary>
   <br>


   ```typescript
   const src = new Observable(obs => {
         obs.next(Math.random().toFixed(2))
      });

   src.subscribe(v => console.log('subscription 1',  v));

   src.subscribe(v => console.log('subscription 2',  v));
   ```
   </details>

## High-order observable

* frequently called `Observable-of-Observables`

* emits **events** that are **Observable themselves**

## Flattening a high-order observable

By default, a **high-order observable** will emit values are that the **streams** resulted from the **inner observable**.

**After** flattening, the **outer** observable will **emit** the **inner observable's events**, **instead of** emitting the **inner observable itself**.

---

## Subject

- is a **hot** observable: the new observers **won't** be able to get the previous values if they do not subscribe at the right time

- is **multicast**: the observable execution is **shared** among __multiple__ subscribers

   <details>
   <summary>Example</summary>
   <br>


   ```typescript
   const subj = new Subject();

   subj.subscribe(v => console.log('subscription 1', v)); // Same number

   subj.subscribe(v => console.log('subscription 2', v)); // Same number

   subj.next(Math.random());
   ```
   </details>

- when **subscribing** to a subject, it **registers** the given Observer in a __list of Observers__ 

- can be used as __data producer__ and as __data consumer__: using subjects as a data consumer, you can **convert Observables from unicast to multicast**

   <details>
   <summary>Example</summary>
   <br>


   ```typescript
   const observable = new Observable(obs => obs.next(Math.random()));
   const subject = new Subject();

   subject.subscribe(v => console.log('subscription 1', v)); // Same number

   subject.subscribe(v => console.log('subscription 2', v)); // Same number

   /*
   * All the subscribers of the subject will receive the value emitted
   * by the initial observable
   */ 
   observable.subscribe(subject);
   ```
   </details>

---

## Operators

### `mergeMap`
   - map into a single observable
   - run subscriptions/reqs in **parallel**
   - post, put, delete requests when **order** is **NOT important**

### `switchMap`
   - **cancels** the **current** inner observable if **another** value is **emitted** by the **stream**
   - use it for search requests or **cancelable requests** (type ahead etc..)

### `concatMap`
   - runs subscriptions/requests **in order**
   - will **wait** for the **current** inner observable to complete **before subscribing** to the **next** one
   - does **buffer** emitted **values**

### `exhaustMap`
   - the **opposite** of `switchMap`
   - will **not** subscribe to the next observable **until** the current one **completes**
   - use for **login**(don't want more requests until the initial one is complete)

### Buffering

#### `buffer(obs$)`
   - keeps **accumulating** values **until** observable **emits** values or **completes**
      <details>
      <summary>Example</summary>
      <br>
      
      
      ```typescript
      const s = new Subject();

      interval(300)
      .pipe(
         take(5)
      )
      .subscribe(
         v => { s.next(v); },
      );

      // Emits value if 1s has passed without something happening
      const debouncedSubj$ = s.pipe(debounceTime(1000));

      // Accumulate the emitted values
      const addVal$ = s.pipe(buffer(debouncedSubj$));

      addVal$.subscribe(res => {
         console.log('res', res);
         // --> [0, 1, 2, 3, 4]
      })
      ```
      </details>




#### `bufferWhen(fn: () => Observable<any>)`

* **collects values** emitted from the source Observable and **stores** them as an **array**;   
when it **starts collecting** values, it **calls** the provided **function**(the function returns an observable);
**after** the returned **observable emits**, the buffer will be closed(thus, the collected items will be sent to the consumer) and then it will restart collecting value;


<details>
<summary>Example</summary>
<br>


```typescript
const clicks = fromEvent(document, 'click');

clicks
  .pipe(
    bufferWhen(() => timer(1000))
  )
  .subscribe(console.log)
```
</details>


#### `bufferToggle(openings, closingSelector)`

* starts **collecting** values **when** `openings` emits and close the buffer when `closingSelector` emits

<details>
<summary>Example</summary>
<br>

```typescript
const clicks = fromEvent(document, 'click');
const openings = of(1, 2);
const buffered = clicks.pipe(bufferToggle(openings, i =>
  i % 2 === 0 ? timer(2000) : EMPTY
));
buffered.subscribe(x => console.log(x));
```
</details>

#### `bufferCount(bufferSize, startBufferEvery)`

* collect values until `bufferSize` is reached

* if `startBufferEvery` is specified, a new buffer will start each `startBufferEvery` values

<details>
<summary>Example</summary>
<br>

```typescript
of(1, 2, 3, 4, 5, 6, 7, 8)
  .pipe(
    bufferCount(3)
  )
  // .subscribe(console.log)
/* 
--->
[1, 2, 3]
[4, 5, 6]
[7, 8]
*/


of(1, 2, 3, 4, 5, 6, 7, 8)
  .pipe(
    bufferCount(3, 2)
  )
  .subscribe(console.log)
/* 
--->
[1, 2, 3]
[3, 4, 5]
[5, 6, 7]
[7, 8]
*/
```
</details>

### `debounce($obs)`

* the `$obs` determines the time span of emission silence

* if **no** other **value** is **emitted while awaiting** `X time`, the **crt value** will be **emitted**, **otherwise discarded**

<details>
<summary>Example</summary>
<br>


```typescript
const example = Observable.create(subs => {

subs.next('123')
subs.next('222')
subs.next('333')

setTimeout(() => {
      subs.next('444')
}, 700)

setTimeout(() => {
      subs.next('555')
   }, 1201)
});

example.pipe(debounce(() => timer(500)))
   .subscribe(console.log)
// => 333, 444, 555
```
</details>

### `defer()`

* emits when the **operation inside**(i.e: `promise`) is **ready**

   <details>
   <summary>Example</summary>
   <br>


   ```typescript
   const p = () => new Promise((resolve, reject) => {
      resolve();
   });

   of({})
      .pipe(
         flatMap(() => defer(() => p())),
      )
      .subscribe(() => {});
   ```
   </details>

* each subscriber gets a **new subscription**

   <details>
   <summary>Example</summary>
   <br>


   ```typescript
   const getObs = () => {
   let cnt = 1;

   return interval(1000)
      .pipe(map(() => cnt++));
   };


   const observable = getObs();

   // observable
   //   .subscribe(v => console.log('SUBSCRIBER 1: ', v))

   // observable
   //   .subscribe(v => console.log('SUBSCRIBER 2: ', v))  

   /*
   SUBSCRIBER 1: 7
   SUBSCRIBER 2: 8
   SUBSCRIBER 1: 9
   SUBSCRIBER 2: 10
   SUBSCRIBER 1: 11
   SUBSCRIBER 2: 12
   ...
   */

   const getObsWithDefer = () => {
   return defer(() => {
      let cnt = 1;

      return interval(1000)
         .pipe(map(() => cnt++))
   });
   }

   const observableWithDefer = getObsWithDefer();

   observableWithDefer
   .subscribe(v => console.log('SUBSCRIBER 1: ', v))

   observableWithDefer
   .subscribe(v => console.log('SUBSCRIBER 2: ', v))  

   /*
   SUBSCRIBER 1: 1
   SUBSCRIBER 2: 1
   SUBSCRIBER 1: 2
   SUBSCRIBER 2: 2
   SUBSCRIBER 1: 3
   SUBSCRIBER 2: 3
   SUBSCRIBER 1: 4
   SUBSCRIBER 2: 4
   */
   ```
   </details>

### `find`

* searches for the **first** item in the Observable that **matches the condition**, then **completes**

* does **not** emit an error if a valid value is not found

<details>
<summary>Example</summary>
<br>


```typescript
of(3, 1, 5, 9, 15, 14, 75, 30)
  .pipe(
    find(v => v % 15 === 0)
  )
  .subscribe(console.log) // 15
```
</details>

### `single`

* like `first`, but if multiple values that match the condition are emitted, it will emit with error notification

* if the source Observable emits items but **none** match the specified predicate, then `undefined` is emitted

<details>
<summary>Example</summary>
<br>


```typescript
of(3, 1, 5, 9, 15, 14, 75, 30)
  .pipe(
    single(v => v % 15 === 0)
  )
  .subscribe(
    console.log, // 15, if /* 14, 75, 30 */ - commented
    console.warn // Sequence contains more than one element, if /* 14, 75, 30 */ - uncommented
  ) 
```
</details>

### combineAll

* **flattens** an Observable-of-Observables by using the `combineLatest` strategy when the source Observable-of-Observables **completes**

<details>
<summary>Example</summary>
<br>


```typescript
// Observable-of-Observables
const highOrder = of(3, 4, 2)
  .pipe(
    map(v => interval(v * 1000).pipe(take(3)))
  )

highOrder
  .pipe(
    combineAll()
  )
  .subscribe(
    console.log,
    null,
    () => console.log('completed')
  )

/* 
3  ------0------1------2
4  --------0--------1--------2
2  ----0----1----2-------------------------
              combineAll()
   3 4 2
   0 0 0
   0 0 1
   1 0 1
   1 0 2
   1 1 2
   2 1 2
   2 2 2
*/
```
</details>

### `race`

* first observable to emit is used, the others are being ignored

<details>
<summary>Example</summary>
<br>


```typescript
race(
  timer(1500).pipe(mapTo('1500!')),
  timer(2000).pipe(mapTo('2000!')),
  timer(1000).pipe(mapTo('1000!')),
  timer(1200).pipe(mapTo('1200!')),
)
.subscribe(console.log) // 1000!
```
</details>

### `generate`

* generates a sequence of values based on an `initialValue`, `condition` and `iteratate`

* very similar to a traditional for loop

<details>
<summary>Example</summary>
<br>


```typescript
generate(
  2, // Initial value
  x => x < 300, // Condition
  x => x ** 2 // Iterate
).subscribe(console.log)
/* 
--->
2
4
16
256
*/
```
</details>

### `expand`

* similar to `mergeMap`, but it applies the **project function** to **every source values** as well as **every output value** - it is **recursive**

* it receives a [project function](#project-function) that will return an Observable;
this function will be **applied** to **each emitted value** by the **source Observable**, but also to the **result** of the function, which will get **merged**

<details>
<summary>Example</summary>
<br>


```typescript
const clicks = fromEvent(document, 'click');
clicks
  .pipe(
    mapTo(1),
    expand(v => of(v + 1).pipe(delay(1000))),
    take(10)
  )
  .subscribe(console.log)
```
</details>

### `auditTime`

* similar to `throttleTime`, but it will get the **last silenced value**

* when a value is emitted, **it is ignored and ignores the next ones** for `durations` ms and then, when it is the case, it emits the most recent **ignored** value

<details>
<summary>Example</summary>
<br>


```typescript
merge(
  of(1), // Ignored, Printed if `throttleTime` was used
  of(2), // Last Ignored
  of(3).pipe(delay(400)), // Printed if `throttleTime` was used
  of(4).pipe(delay(901)), // Printed if `throttleTime` was used
  of(5).pipe(delay(600)), // Last ignored (400(referring to `3`) + 300 > 600)
  of(6).pipe(delay(1200)), // Ignored (901 + 300 > 1200)
)
  .pipe(/* throttleTime */auditTime(300))
  .subscribe(console.log) // 2 5

// ===============================================

merge(
  of(1), // Ignored;
  of(2), // Last ignored
  of(3).pipe(delay(400)), // New value, ignored 3 and any value that will be emitted in the range [400, 400 + 300]!;
  of(4).pipe(delay(800)), // New value!(outside of [400, 400 + 300]); will be that last ignored as `6` will appear outside of [800, 800 + 300]
  of(5).pipe(delay(600)), // Last ignored in the range [400, 400 + 300]
  of(6).pipe(delay(1200)), // If this was missing, `4` wouldn't be printed
)
  .pipe(/* throttleTime */auditTime(300))
  .subscribe(console.log) // 2 5 4

```
</details>

### `catchError`

* you can get the **source observable**(second parameter) and you can **return** it in order to **re-subscribe**

<details>
<summary>Example</summary>
<br>


```typescript
  let cnt = 0;

  concat(of('OK!'), throwError('foo'))
    .pipe(
      tap(v => console.log('emitted value!', v)),
      catchError((err , $src) => {
        console.log('performing logic...', err)

        // Beware! This is a closure...
        return (++cnt) <= 3 ? $src.pipe(map((v) => 'hmm!' + '*'.repeat(cnt) + v)) : of(`err caught: ${err}`);
      })
    )
    .subscribe(console.warn)
```
</details>

---

## Tricks

### Resolve multiple promises depending on their timeout

<details>
<summary>Example</summary>
<br>


```typescript

// ----------------4------------>
// 0---------------------------->
// ----1------------------------>
//          mergeAll()
// 0---1-----------4------------>
function promiseDelay(ms) {
      return new Promise(resolve => {
        setTimeout(() => resolve('done' + ms), ms);
      });
    }

of(promiseDelay(4000), promiseDelay(0), promiseDelay(1000))
   .pipe(
      mergeAll()
   )
   .subscribe(console.log)
/*
--->
done0
done1000
done4000
*/
```
</details>

---

## Custom Operators

### Understanding custom operators

<details>
<summary>Example</summary>
<br>


```typescript
const customFilter = (isEven: boolean) => 
  filter((v: number) => v % 2 === 0 && isEven ? true : !isEven && v % 2 ? true: false)

const customFilterTwo = isEven => obs => obs.pipe(
  filter((v: number) => v % 2 === 0 && isEven ? true : !isEven && v % 2 ? true: false)
)

// The same behavior as `customFilter`
const customFilterThree = isEven => customFilterTwo(isEven);

of(1, 2, 3, 4, 5, 6, 7, 8)
  .pipe(
    // customFilter(false),
    // customFilterTwo(true),
    customFilterThree(false),
  )
  .subscribe(console.log)
```
</details>

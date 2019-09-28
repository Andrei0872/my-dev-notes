# Notes on Reactive Programming

- [Concepts](#concepts)  
- [Observable](#observable) 
- [Subject](#subject)
- [Operators](#operators)
- [Tricks](#tricks)

---

## Concepts

> **rxjs**: has to deal with data that comes over time

### Observable

- wrapper around data source(stream of values)
- async data (not limited to this)
- http request

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

---

## Subject

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

- when **subscribing** to a subject, it **registers** the given Observable in a __list of Observers__ 

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

### `exhaustMap`
   - the **opposite** of `switchMap`
   - will **not** subscribe to the next observable **until** the current one **completes**
   - use for **login**(don't want more requests until the initial one is complete)

### `buffer(obs$)`
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

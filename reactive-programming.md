## Notes on Reactive Programming

- [Concepts](#concepts)  
- [Observables](#observables) 
- [Subject](#subject)
- [Operators](#operators)

---

### Concepts

**Observable**
- wrapper around data source(stream of values)
- async data (not limited to this)
- http request

**Observer**
- does something whenever
    - a value/error occurs
    - the *observable* reports the `complete` status
- 3 methods
    - `next()`
    - `error()`
    - `complete()`
The observable knows when to call these methods throughout the **Subscription**

**Subscription**
- `subscribe()`
- tells the observable that someone wants to know about its values
- connects _observer_ with _observable_

---

### Observables

- is **unicast**: each subscribed observer owns an independent execution of the observable
```javascript
const src = new Observable(obs => {
      obs.next(Math.random().toFixed(2))
    });

src.subscribe(v => console.log('subscription 1',  v));

src.subscribe(v => console.log('subscription 2',  v));
```

---

### Subject

- is **multicast**: the observable execution is shared among _multiple_ subscribers
```javascript 
const subj = new Subject();

subj.subscribe(v => console.log('subscription 1', v)); // Same number

subj.subscribe(v => console.log('subscription 2', v)); // Same number

subj.next(Math.random());
```

- when subscribing to a subject, it registers the given Observable in a _list of Observers_ 

- can be used as _data producer_ and as _data consumer_: using subjects as a data consumer, you can convert Observables _from unicast to multicast_ 
```javascript
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

---

### Operators

- **mergeMap**
   - map into a single observable
   - run subscriptions/reqs in parallel
   - post, put, delete requests when order is NOT important


- **switchMap** 
   - cancels the current subscription/request and can cause race conditions
   - use it for requests or cancelable requests (searches)

- **concatMap**
   - runs subscriptions/requests in order: less performant
   - will wait for the last req to finish
   - get, post, put req when order is important

- **exhaustMap** 
   - ignore all subsequent req until it completes
   - use for login(don't want more reqs until the initial one is complete)
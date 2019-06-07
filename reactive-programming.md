## Notes on Reactive Programming

- [Concepts](#concepts)  
- [Observables](#observables)

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

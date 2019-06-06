## Notes on Reactive Programming

- [Concepts](#concepts)  

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
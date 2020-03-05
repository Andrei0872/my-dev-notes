# Exploring RxJs

## Observable

* implements `Subscribable` -> meaning it can be subscribed to
* `Observe.subscribe()` ->  decides when the `Observable` should become **active**

```ts
// Explicitly specifying the `this` type of the `subscribe` function
constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic) {
  if (subscribe) {
    this._subscribe = subscribe;
  }
}
```

* how can the type be inferred from `observer.next(value)`
* `unsubscribe()`
* `subscribe()`
  * will return a `Subscription`
  * can be listen to notifications in 2 ways
    * an object that (partially) complies with the `Observer` interface;  
      _partially_ because you are not obliged to provide all its methods(`next`, `error`, `complete`), at least one of them is required
    * providing callbacks functions in this order: `.subscribe(nextCb, errCb, completeCb)`; these can be skipped with `null` or `undefined`
  * ❓ `sink` - an object designed to receive events
  * can receive an **empty observer**
* its **source** is the **callback function** provided to the **constructor**

---

### Observer

* _observes_ the notifications emitted by the `Observable`
* if en error occurs and `error` method(in case of an object that implements the `Observer` interface)/function(when simply providing callbacks) is not provided, the error will be uncaught
* ❓ `closed`
* an **observer** is converted to a `Subscription`, in order to gain access to the `unsubscribe()` function
* why the parameter of the function passed to the constructor is called `observer`?(btw, can also be called `subscriber`)
  * because the function will be called with a `Subscriber` instance(which also implements `Observer`); this happens because the `Subscriber` is responsible for sending the received information from the source to the data consumer(the **observers**), but also for subscription-related logic. So, it must be able to _intercept_ the received values somehow

---

## Subscriber

* **teardown**: a function that allows you free up resources after they are no longer needed(e.g: in the `HttpClientModule`, when the pending request is aborted)
  * you can create such **teardown function** by providing a function that also returns a function to the `Observable` constructor
  
  ```ts
  const src$ = new Observable(subscriber => {
    /* ... */

    // Teardown function
    return () => { /* Freeing up resources here... */ }
  });
  ```

* `observer` vs `subscriber`
  * `observer` - only deals with data(notification: value, error, complete) consumption,
  * `subscriber` - delegates the notifications to the observer and handles the subscription/unsubscription logic
* why is it important ?
* read the docs
* can be thought of an of an **orchestrator** of the received notifications;  
  An `Observable` is a **data producer**, it's in charge for emitting notifications(values, errors or complete notifications).
  A `Subscriber` can be seen as a middleman that sits between the **producer**(`Observable`) and the **consumer**(the provided callbacks or object), that's because it decides not only which notifications to propagate, but also **when**(TODO: maybe explain the `closed` property). For example, if the consumers does not to receive data anymore, the `Subscriber` is responsible for making sure that if the observable emits again, the data won't arrive to the consumer.
* extends `Subscription`, which owns the logic that is related to registering observers and unsubscribing from data producers;
  this is very important, because a `Subscriber` _starts_ the unsubscribing process(which is handled with the help of `Subscription`), process which is based on the value received from the `Observable`. For example, if it receives an **error notification** during the `nextCb` or an error is thrown, the subscriber will unsubscribe from the source. Apart from it, it also sends the notification to the observers(data consumers).

  📝❗️
  Additionally, when an `subscriber`(`observer`) is created(calling `Observable.subscribe`), that subscriber will maintain a list of teardown functions, the result from the returned function of the callback provided to the `Observable`'s constructor. TODO: explain what happens on `unsubscribe()`

* when a `Subscriber` is created, it can receive through the constructor:
  * a _partial observer_, an object that must contain at least one of these methods: `next`, `error`, `complete`
  * 1 to 3 callbacks: `nextCb`, `errorCb`, `completeCb`; one callback can be omitted with `null`
  * nothing or a falsy value -> defaults to an **empty observer**
  * ❓ an existing `Subscriber` instance -> when using pipeable operators

```
  Data Producer
      |
      |
      |
  Subscriber (if (!this.closed) {}) (1)
     / \
    /   \
   /     \ 
  /       \
Observer  Subscription(subscribing/unsubscribing logic) 😃 (Subscription.add(returned fn from constructor's cb)) (3)
(Data consumer)
SafeSubscriber.next(v) (2)
```
---

### Subscription

* `unsubscribe()` method
  * not interested anymore in receiving `Observable`'s notifications
  * the `Observable` will stop working(producing anything)
* `L: 142`: `subscription === this` ❓

---

## Questions

* ```ts
  constructor (work: (this: AType, smthElse: any)) { } 
  ```

* why ❓
  
  ```ts
  export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>;
  ```

  instead of

  ```ts
  export type PartialObserver<T> = {
  closed?: boolean;
  next?: (value: T) => void;
  error?: (err: any) => void;
  complete?: () => void;
  }
  ```

* how are promises converted to observables ?

---

## To Do

* explore `docs_app`
* read `docs` 😃

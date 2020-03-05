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
  A `Subscriber` can be seen as a middleman that sits between the **producer**(`Observable`) and the **consumer**(the provided callbacks or object), that's because it decides not only which notifications to propagate, but also **when**(TODO: maybe explain the `closed` property; there is also `isStopped`; what's the diff❓). 
  For example, if the consumers does not to receive data anymore, the `Subscriber` is responsible for making sure that if the observable emits again, the data won't arrive to the consumer.
* extends `Subscription`, which owns the logic that is related to registering observers and unsubscribing from data producers;
  this is very important, because a `Subscriber` _starts_ the unsubscribing process(which is handled with the help of `Subscription`), process which is based on the value received from the `Observable`. For example, if it receives an **error notification** during the `nextCb` or an error is thrown, the subscriber will unsubscribe from the source. Apart from it, it also sends the notification to the observers(data consumers).

  📝❗️
  Additionally, when an `subscriber`(`observer`) is created(calling `Observable.subscribe`), that subscriber will maintain a list of teardown functions, the result from the returned function of the callback provided to the `Observable`'s constructor. TODO: explain what happens on `unsubscribe()`

* when a `Subscriber` is created, it can receive through the constructor:
  * a _partial observer_, an object that must contain at least one of these methods: `next`, `error`, `complete`
  * 1 to 3 callbacks: `nextCb`, `errorCb`, `completeCb`; one callback can be omitted with `null`
  * nothing or a falsy value -> defaults to an **empty observer**
  * ❓ an existing `Subscriber` instance -> when using pipeable operators

* `isStopped` in `SafeSubscriber` ❓

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

## Subscription

* try ! 😃
  
  ```ts
  const s = new Subscription();
  
  // `$src.subscribe()` - will return a `Subscriber`, which internally extends `Subscription`
  s.add($src.subscribe())

  // When doing s.unsubscribe()
  // It will loop through the registered teardown functions and will invoke them
  // For each inner subscriptions(which have the `_unsubscribe` fn set to the provided teardown function), including this `parent subscription`
  // will `null out` the internal `subscriptions` array(there teardown function are added), 
  // the parent(or parents) and the teardown functions


  this.closed = true;
  this._parentOrParents = null;
  this._subscriptions = null;
  ```

* `unsubscribe()` method
  * not interested anymore in receiving `Observable`'s notifications
  * the `Observable` will stop working(producing anything)
* `L: 142`: `subscription === this` ❓

* when does this happen ❓
  
  ```ts
  // Subscription.unsubscribe();

  // null out _subscriptions first so any child subscriptions that attempt
  // to remove themselves from this subscription will noop
  this._subscriptions = null;
  ```

### `Subscription.add(teardown)`  

#### Determining the type of the teardown, an inner `Subscription` instance will be created for it

_if `typeof teardown === object'`_

```ts
// `subscription === this` - prevents from adding the same reference to the teardown list
// `subscription.closed` - cannot add an already unsubscribed subscription; this is also the case for the `Subscription.EMPTY`, which is used when no teardown function is provided
if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
  return subscription;
} else if (this.closed) { // ❓
  subscription.unsubscribe();
  return subscription;
} else if (!(subscription instanceof Subscription)) { // ❓
  const tmp = subscription;
  subscription = new Subscription();
  subscription._subscriptions = [tmp];
}
```

#### Setting the parent of the newly-created inner `Subscription`  

```ts
let { _parentOrParents } = subscription;
if (_parentOrParents === null) {
  // A common case for this would be when an inner subscription is created from just: `(new Observable(() => {})).subscribe(observer)`
  subscription._parentOrParents = this;
} else if (_parentOrParents instanceof Subscription) { // ❓
  if (_parentOrParents === this) {
    // The `subscription` already has `this` as a parent.
    return subscription;
  }
  // If there's already one parent, but not multiple, allocate an
  // Array to store the rest of the parent Subscriptions.
  subscription._parentOrParents = [_parentOrParents, this];
} else if (_parentOrParents.indexOf(this) === -1) { // ❓
  // Only add `this` to the _parentOrParents list if it's not already there.
  _parentOrParents.push(this);
} else { // ❓
  // The `subscription` already has `this` as a parent.
  return subscription;
}
```

#### Adding the inner `Subscription` to the array of subscriptions maintained by the `parent Subscription`

```ts
const subscriptions = this._subscriptions;
if (subscriptions === null) {
  this._subscriptions = [subscription];
} else {
  subscriptions.push(subscription);
}
```

### `Subscription.unsubscribe()`

Will dispose resources that depend on the subscription(e.g: `HttpClientModule`).

#### Make sure the inner subscription is removed from the `parent Subscription`'s list of inner subscribers

❗️ - answer to why this is possible
```ts
// #example1
const src$ = new Observable();

const positives$ = src$.pipe(filter(v => v > 0));

// positives$ - will have 2 inner subscriptions 😃
const squared$ = positives$.pipe(map(v => v ** 2));
const doubled$ = positives$.pipe(map(v => v * 2));
```

❓
```ts
let { _parentOrParents, _unsubscribe, _subscriptions } = (<any> this);

// Won't be able to be re-unsubscribed
this.closed = true;
// Get rid of the reference hold to the parents as they are temporarily kept in the `_parentOrParents` variable
this._parentOrParents = null;

// Make sure all the inner subscriptions are removed from the parent
// An inner subscription might have multiple inner subscriptions, which can also have inner subscriptions an so forth...
// As with `_parentOrParents`, `_subscriptions` are kept in an ephemeral variable
this._subscriptions = null; 

// If the unsubscription process started from the **main source** and this happens in the context of an inner subscription,
// `_parentOrParents._subscriptions` will be null, because, the parent subscription, before looping through inner ones,
// it emptied the child `subscriptions`, meaning that the current child subscription's single responsibility is to manage its child subscriptions
// If the unsubscription process **did not** start from the **main source**(`#example1`), `_parentOrParents._subscriptions` will **not** be null
// as the child `Subscription.unsubscribe()` method was not called from the parent(case which is described before), but it called directly
if (_parentOrParents instanceof Subscription) {
  _parentOrParents.remove(this);
} else if (_parentOrParents !== null) {
  for (let index = 0; index < _parentOrParents.length; ++index) {
    const parent = _parentOrParents[index];
    parent.remove(this);
  }
}
```

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

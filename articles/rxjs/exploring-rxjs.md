# Exploring RxJs

* `MonoTypeOperatorFunction` 
  * the return type is not different from the input type; e.g: `filter`, `delay`
* `OperatorFunctions`
  * the return type might differ from the input type; e.g: `map`, `pluck`

## Observable

* section: `Recreating observables and subscribers chains` 😃
* show why it is unsubscribed when an error/complete notification occurs

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

```ts
protected _complete () {
  // Send the complete notification to destination(subscriber ancestors)
  // which may unsubscribe, which may cause this current subscriber to become `closed`(`this.closed = true`)
  // because the next line `this.unsubscribe()` is reached.
  this.destination.complete();

  // When this(read above) is not the case, this subscriber is unsubscribed anyway, as well as its child `subscriptions` 
  this.unsubscribe();
}
```

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

Will dispose resources that held by the subscription(e.g: `HttpClientModule`).

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
// it emptied the child `subscriptions`, meaning that the current child subscription's single responsibility is to manage its child subscriptions(if any)
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

## higher-order mapping operators

* TODO: 
  * illustrate when the outer unsubscribes, but the inner does not(yet)
  * re-create! (a node from a linked list that acts a tail for another linked list)

TODO: illustrate 😃
* `_complete()`
  * notification emitted by the the **outer observable**
* `notifyComplete()`
  * emitted by the **inner observable**

* the **inner** observable is added to the `_subscriptions` arr of outer subscriber's `destination`; when the **inner completes**, it will automatically remove itself from `_subscriptions`
  * this is desired because if the **outer subscriber** completes and there are still **active inner observables**, then the outer one can be unsubscribed from, because if the source completed, there is no way this outer subscriber will receive any other notifications from the source;  
  this does **not** mean that the inner observables must complete, because, apart from their creation, they're **independent from** the **outer observable**, which indicates that they should be kept _alive_, until all of them complete, which will in turn make the entire stream complete, thus unsubscribed.


* you can access the **outer index** in your **projection function**
  ```ts
  constructor(/* ... */ private project: (value: T, index: number) => ObservableInput<R> /* ... */) { }
  ```

  ```ts
  protected _tryNext(value: T) {
    let result: ObservableInput<R>;
    const index = this.index++;
    try {
      result = this.project(value, index); // Creates the inner observable
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.active++;
    this._innerSub(result, value, index); // Subscribe to this newly created observable and notify this outer subscriber(`mergeMap`) when it emits notifications
  }
  ```

  ```ts
  const s = of(1, 2, 3)
  .pipe(
    mergeMap((v, outerIdx) => (console.log('outer idx', outerIdx), of(v + 1)))
  )
  .subscribe(console.log)
  ```

* inner observable
  * every time a value is intercepted by the outer subscriber(`{ExhaustMap, MergeMap, SwitchMap, ConcatMap}Subscriber`), an inner observable will be created; the outer obs will be notified of all the inner one's values(`next`, `error`, `complete`), and, depending on the value, it will act accordingly
  * an `InnerSubscriber` will intercept all the values from the inner observable and will inform the parent

* the project function
  * it is **not mandatory** to return an `observable`;
    it can return either a **promise**, an **array** or an **iterable**
    ```ts
    export type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T> | Iterable<T>;

    export function mergeMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
    ```

    ```ts
    function * generate (multiplier) {
      yield * [1, 2, 3, 4].map(v => v * multiplier);

      return 19;
    }

    of(1, 2, 3)
      .pipe(
        mergeMap(v => generate(v))
      )
    .subscribe(console.log)
    ```

### mergeMap

* if the source completed, but there are pending inner observables that have not completed yet, the complete notification won't pe propagated to the `mergeMap`'s `destination`;  
  also, if there are any buffered observables(in case `concurrent` is set), the complete notification won't be sent further until the buffer is empty

  ```ts
  // This is how OuterSubscriber(`mergeMap`) will be notified when one of its inner observables will complete
  notifyComplete(innerSub: Subscription): void {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if (buffer.length > 0) {
      this._next(buffer.shift()); // Create an inner obs. out of the oldest buffered value
    } else if (this.active === 0 && this.hasCompleted) {
      // If there are no more active inner observables and the buffer is empty,
      // it means the whole stream can complete
      this.destination.complete();
    }
  }
  ```

* `concurrent` 
  * how many _active_ **inner observables** it should handle at once;
  * the exceeding ones will be buffered;
    ```ts
    _next(value: T): void {
      if (this.active < this.concurrent) {
        this._tryNext(value); // Create inner observable
      } else {
        this.buffer.push(value);
      }
    }
    ```
  * when one inner observable **completes** and the buffer is not empty, it will take the oldest buffered value and will create an inner observable out of it(by using the the **projection function**)


Note: `concatMap` is `mergeMap` with `concurrent` set to `1`: `mergeMap(projectionFn, 1)`

### exhaustMap

* if there's an **active inner observable**, any subsequent value received by the outer subscriber(`ExhaustMapSubscriber`) will be ignored
  ```ts
  _next(value: T): void {
    if (!this.hasSubscription) {
      this.tryNext(value); // Creates inner observable based on `value`
    }
  }
  ```

* `this.hasSubscription`, which indicates whether there is an active inner observable or not, will be set to `false` when the **current** inner observable completes:

  ```ts
  // `notifyComplete` - when the inner observable emits
  notifyComplete(innerSub: Subscription): void {
    destination.remove(innerSub);
    const destination = this.destination as Subscription;

    this.hasSubscription = false;
    if (this.hasCompleted) {
      // If the source completed, send the `complete` notification further in the stream
      this.destination.complete();
    }
  }
  ```

* there can only be a single active inner observable

### switchMap

* if there's an **active inner observable** and a new value(`next()`) is received by the **outer subscriber**(`SwitchMapSubscriber`), the active observable will be unsubscribed and a new inner observable will be created by applying the supplied **projection function** on the just arrived value.
  ```ts
  _next(value: T) {
    let result: ObservableInput<R>;
    const index = this.index++;
    try {
      result = this.project(value, index); // Create a new inner observable from the newly arrived value
    } catch (error) {
      this.destination.error(error);
      return;
    }
    this._innerSub(result, value, index);
  }

  _innerSub(result: ObservableInput<R>, value: T, index: number) {
    const innerSubscription = this.innerSubscription;
    if (innerSubscription) { // Unsubscribe from the inner observable
      innerSubscription.unsubscribe();
    }
    // `innerSubscriber` - will inform the parent subscriber(`SwitchMapSubscriber`) about notifications that take place in the inner observable
    const innerSubscriber = new InnerSubscriber(this, value, index);
    const destination = this.destination as Subscription;
    destination.add(innerSubscriber);
    this.innerSubscription = subscribeToResult(this, result, undefined, undefined, innerSubscriber);
    if (this.innerSubscription !== innerSubscriber) {
      destination.add(this.innerSubscription);
    }
  }
  ``` 

* the **inner observable** becomes **inactive** when it **completes**
  ```ts
  // `notifyComplete` - invoked when the inner observable completes
  notifyComplete(innerSub: Subscription): void {
    const destination = this.destination as Subscription;
    destination.remove(innerSub);
    this.innerSubscription = null!;
    
    // `isStopped` - whether the outer subscriber unsubscribed(e.g: because its source completed)
    if (this.isStopped) {
      super._complete(); // Send the complete the notification to the next parent subscribers(that did not complete due do this inner observable)
    }
  }
  ``` 
* there can only be a single active inner observable

---

## Scheduler

* an orchestrator of `actions`(tasks)
* it has a `flush` method, with the help of which an `action` can be **executed**
* however, an `Action` _decides_ when it's going to executed by the scheduler

### Action

* an action can be **rescheduled** from the **scheduled callback**; this is how the iteration behavior is achieved;
  * additionally, every iteration can _prepare_ a new state that will be available for the **next iteration**, similar to how `Array.prototype.reduce()` works
* can be rescheduled with a different delay time
* can an `Action` be rescheduled before it's executed ❓ (yes)

### AsyncScheduler

* it uses `setInterval`

---

## delay

_Prerequisite: `Scheduler`_

```ts
// The `queue` will not be drained after the first time the action is run
new Observable(s => {
  s.next(1);
  s.next(2);

  setTimeout(() => {
    s.next(3);
  }, 300);
})
  .pipe(
    delay(1000)
  ).subscribe(console.log)****
```

* it uses `AsyncScheduler` by default
* can receive 2 arguments
  * a number that represents the `milliseconds` that need to pass before a value it emitted by this subscriber
  * a `Date` object that represents the moment when the value should be emitted to the parent subscribers;
    internally, it will determine the number of milliseconds between the `Date` provided and current date(`Date.now()`)
    ```ts
    const absoluteDelay = isDate(delay);
    // scheduler.now() - Date.now()
    const delayFor = absoluteDelay ? (+delay - scheduler.now()) : Math.abs(<number>delay);
    ``` 

* when it receives a value at a moment `X`
  * if the subscriber is `inactive`(there is no **scheduled** `action`), it will **schedule** a **new action** for the `Scheduler` that will be run in `delayMs`
  * if the subscriber is `active`(an `action` has already been scheduled), it will be simply added to the queue
  * in both cases, an object will be created from this value; this object indicates the **time** when the **value** **should be emitted**
    ```ts
    // `scheduler.now() + this.delay` - when the value should be emitted to the next subscriber in the chain(also known as `destination`)
    const message = new DelayMessage(scheduler.now() + this.delay, notification);
    this.queue.push(message);
    ```
* when a **scheduled action** is run
  * it will shift elements one by one from the `queue` and will send the notification to the parent subscribers accordingly;
    and element can shifted from the `queue` if its time when it should be emitted is less the current time (`Date.now`)
  * if the queue **is not** empty, it will reschedule this action after the delay resulted from `queue[0].time - Date.now()`, where `queue[0].time` is the time when that item should be emitted
  * if the queue **is** empty, meaning that there will not be any rescheduled action, the subscriber(`DelaySubscriber`) will become `inactive`

---

## delayWhen

* the waiting period is determined by an **inner observable**
  * when it emits/completes, it will then send the value received by the outer subscriber further in the stream
  * the inner observable can depend on the `outerValue` or/and the `outerIndex`

  For each `outerValue`(value intercepted by the outer subscriber), an **inner observable** will be **created**. An `Inner Subscriber` instance will inform the outer subscriber about the inner observable's notifications. This means that there is a `1:1` relationship between an outer value and its inner observable.

  ```ts
  _next(value: T): void {
    const index = this.index++;
    try {
      // Create the inner observable based on the value and the current index
      const delayNotifier = this.delayDurationSelector(value, index);
      if (delayNotifier) {
        // Subscribing to this inner obs and storing the subscription so when we can know when to send the outer value
        this.tryDelay(delayNotifier, value);
      }
    } catch (err) {
      this.destination.error(err);
    }
  }
  ```

  ```ts
  tryDelay(delayNotifier: Observable<any>, value: T): void {
    // Create the inner subscription
    const notifierSubscription = subscribeToResult(this, delayNotifier, value);

    if (notifierSubscription && !notifierSubscription.closed) {
      const destination = this.destination as Subscription;
      destination.add(notifierSubscription);
      // Store the subscription in order to identify the outer value
      this.delayNotifierSubscriptions.push(notifierSubscription);
    }
  }
  ```

  The **inner subscribers** will be kept into an array so that when an inner observable emits/completes, the outer value from which it was created can be sent further in the stream and the inner subscriber can unsubscribe.

  ```ts
  // `notifyNext` - called when the inner obs. emits a value(`next()`)
  notifyNext(outerValue: T, innerValue: any,
            outerIndex: number, innerIndex: number,
            innerSub: InnerSubscriber<T, R>): void {
    // The inner obs. emitted, so send the outer value(the value which was used when creating the inner obs.) to the parent subscriber
    this.destination.next(outerValue);
    // No need to keep track of it anymore
    this.removeSubscription(innerSub);
    
    // If there are no more active subscriptions and the `complete` notification was sent from the source(child subscriber)
    // then the complete notification can be sent farther
    this.tryComplete();
  }

  // `notifyComplete` - called when the inner obs. completes
  notifyComplete(innerSub: InnerSubscriber<T, R>): void {
    const value = this.removeSubscription(innerSub);
    if (value) {
      this.destination.next(value);
    }
    this.tryComplete();
  }
  ```

* if the **source completes** and there are **active inner observables**, the `DelayWhenSubscriber` will wait until there are no more active inner subscriptions, then it will complete;  
  Put differently, this is the condition that has to be met in order to propagate the complete notifications to the parent subscribers:
  
  ```ts
  tryComplete(): void {
    // `this.completed` - true when the source completes
    // an inner subscriber is removed from `delayNotifierSubscriptions` when its inner obs either completes or emits a value
    if (this.completed && this.delayNotifierSubscriptions.length === 0) {
      this.destination.complete();
    }
  }
  ```
* can be thought of as a `mergeMap`, but instead of mapping to the value resulted from the inner observable, it will use the **outer value** instead

* by providing another observable to the `delayWhen` operator, `subscriptionDelay`, you can **delay** the **subscription moment**
  [StackBlitz](https://stackblitz.com/edit/rxjs-delaywhen-subscription-delay?file=index.ts).

  * when `subscriptionDelay` emits once/completes, the `DelayWhenSubscriber` will subscribe to the `SubscriptionDelayObservable`'s (thus, will **activate** the stream) & `subscriptionDelay` will be unsubscribed
  * if `subscriptionDelay` errors, it will be unsubscribed and the error notification will be sent to the parent subscriber

---

## audit

_maybe highlight the diff between `audit` & `throttle`_

* holds a single **inner observable** whose **subscriber**(also called inner subscriber) will inform the parent(the outer subscriber) about the _inner_ notifications
  * if it errors, the error notification will be sent further in the stream
* when the outer subscriber(`AuditSubscriber`) receives a value:
  * if the inner observable is **inactive**
    * the outer subscriber will store the value in a single place
    * the inner observable will become active
  
  ```ts
  _next(value: T): void {
    // Store the value
    this.value = value;
    this.hasValue = true;
    if (!this.throttled) { // If the inner obs. is inactive
      let duration;
      try {
        const { durationSelector } = this;
        duration = durationSelector(value); // Create the inner obs based on the provided function
      } catch (err) {
        return this.destination.error(err);
      }
      // Subscribe to the inner observable
      const innerSubscription = subscribeToResult(this, duration);
      if (!innerSubscription || innerSubscription.closed) {
        // `innerSubscription.closed` might be true if everything happens in the same tick
        // For example, you might have `audit(() => of(1))`
        // This `if` block will be reached after the inner observable had emitted & completed
        this.clearThrottle();
      } else {
        // Store the inner subscriber
        this.add(this.throttled = innerSubscription);
      }
    }
  }
  ```

  * while the inner observable is **active**(did not emitted a value/completed)
    * keep storing the value in that place
    ```ts
    _next(value: T): void {
      // Store the value in the same place
      this.value = value;
      this.hasValue = true;
      
      // `!this.throttled` - would hold the active inner subscriber
      if (!this.throttled) {}
    }  
    ```
  * if the inner observable **becomes inactive**(it emitted/completed)
    * the outer observable will send the **latest stored value**
  
  ```ts
  // Called when the inner obs emits/completes
  clearThrottle() {
    const { value, hasValue, throttled } = this;
    if (throttled) {
      this.remove(throttled);
      this.throttled = null;
      throttled.unsubscribe();
    }
    // Send the latests store value(if any)
    if (hasValue) {
      this.value = null;
      this.hasValue = false;
      this.destination.next(value);
    }
  }
  ``` 
* if the **source completes**, the outer subscriber(`AuditSubscriber`) will not wait for the inner one to emit/complete, it will send the complete notification to the parent subscriber; thus, the inner observable will be unsubscribed 

Note: `auditTime(ms)` is defined as: `audit(() => timer(ms))`

```ts
merge(
  of(1),
  of(2),
  of(3).pipe(delay(400)),
  of(4).pipe(delay(901)),
  of(5).pipe(delay(600)),
  of(6).pipe(delay(1200)),
)
  .pipe(auditTime(300))
  .subscribe(console.log) // 2 5
```

---

## timer

`timer(dueTime, period | scheduler, scheduler)`

_Prerequisite: `Scheduler`_

* can accept a `Date` object or a number(milliseconds) as a parameter
  ```ts
  const due = isNumeric(dueTime)
      ? (dueTime as number)
      : (+dueTime - scheduler!.now()); // scheduler.now() = Date.now()
  ``` 

* it schedules an action to take place in `dueTime` milliseconds(0 by default) and then, if `period` is specified, the action will reschedule itself at intervals determined by `period`
  ```ts
  // These are set when the action was scheduled for the first time
  const { index, period, subscriber } = state;
  subscriber.next(index);

  if (subscriber.closed) {
    // If the subscriber has been unsubscribed after the previous value has been emitted 
    return;
  } else if (period === -1) {
    // Do not reschedule the action!
    return subscriber.complete();
  }

  state.index = index + 1;
  this.schedule(state, period);
  ```

---

## throttle

* comes with 2 options: `{ leading: boolean, trailing: boolean }`; defaults to: `{ leading: true; trailing: false; }`
* can hold a single inner observable, created with the help of the outer value and the `durationSelector`(which creates the inner observable)
* when a value comes in
  * if the inner obs is **inactive**(is not subscribed to)
    * if `leading = true` 
      * sent the value to the parent subscriber; it will emit values to the next subscriber **only when** the **inner obs** is **inactive**
      * this is akin to saying: only one value per finished subscription; TODO: diagram
      * subscribe to the inner observable that was created with the help of this newly arrived value
  * if the inner obs is **active**
    * it will store the received value in a single variable until the inner obs emits/completes
      when this happens, if `trailing = true`; the last stored value will be sent to the next subscriber in the chain and will create _re-activate_ the inner observable, based on the last stored value; TODO: diagram

* TODO: show diagram of what happens when both are set to true

* if the source completes, the inner observable will complete as well

```ts
merge(
  of(1),
  of(2),
  of(3).pipe(delay(400)),
  of(4).pipe(delay(900)),
  of(5).pipe(delay(600)),
  // of(6).pipe(delay(1200)),
  new Observable(s => { setTimeout(() => {s.next(6); s.complete()}, 1200); return function callOnUnsub() { } })
)
  .pipe(
    throttle((v) => of(v * 10).pipe(delay(300)), { leading: true, trailing: true })
  )
  .subscribe(console.log)

  /* 
  leading: true -> 1 3 4
  trailing: true -> 2 5 4
  both: true ->  1 2 5 4 
   */
```

* `throttle` vs `audit` 
  * `audit` will subscribe to the inner obs. as soon as the first outer value comes in and will keep on storing the **last** received value until the inner obs. emits/completes
    when this happens, it will emit the stored value to the next subscriber in the chain
  * `throttle`: every time an outer value is sent to the next subscriber(a.k.a destination), the inner obs will be subscribed(if not already subscribed); if it's already subscribed, it will keep on storing the incoming values
    * if `leading = true` - it will send the value further in the chain and will subscribe to the inner observable
    * if `trailing = true` - it will send the value after the inner obs. emits/completes, after which it will re-create & subscribe to the inner obs, based on the emitted value

---

## throttleTime

* just as `throttle` holds a single inner observable based on which it decides **when** to send the values to the stream, `throttleTime` makes use of an `Action`, which can be scheduled with the help of a `scheduler`(`AsyncScheduler` by default)

* if the source completes and if `trailing = true`, apart from sending the **complete notification** to the **next subscriber** in chain, it will also send the **stored value**, as opposed to `throttle` whose inner observable will complete as well, without allowing it to further send the stored value

* the **action** will be **scheduled** only when a **new outer value** comes in and an action is **not already scheduled**
  * when a new outer value comes, if `leading = true`, that value will be sent over to the next subscriber

* if the **scheduled action** finishes its work, it will send the stored value to the destination subscriber if `trailing = true` and **will not reschedule** another action, in contrast with how `throttle` works(it will subscribe to a newly created inner obs, which depends on the last stored value); an action is scheduled if a new value comes in an there is no action scheduled yet

```ts
merge(
  of(1),
  of(2),
  of(3).pipe(delay(400)),
  of(4).pipe(delay(900)),
  of(5).pipe(delay(600)),
  new Observable(s => { setTimeout(() => {s.next(6); s.complete()}, 1200); return function callOnUnsub() { } })
)
  .pipe(
    throttleTime(300, undefined, { leading: false, trailing: true, })
  )
  .subscribe(console.log)

  /* 
  leading: true -> 1 3 4
  trailing: true -> 2 5 6
  both: true ->  1 2 3 5 4 6
   */
```

_Eventually, show the diff between `throttleTime(300) and throttle(() => timer(300))` using the above example_

---

## debounce

* holds only one inner observable
  * when an outer value comes in
    * it will be stored
    * it will unsubscribe from the current inner observable(if it has been subscribed already) and will create another one based on the newly arrived value;  
      this is how `switchMap` is sort of imitated
  * when the inner obs emits/completes, it will pass the stored value along
* can be thought of as `switchMap`, but instead of passing along the inner value, the **outer value** will be used
* similar to saying: _emit this just arrived value **no other values**  until the inner observable emits/completes_
* if the source completes, the **stored value** and the **complete notification** will be handed over to the **destination** subscriber; 

```ts
merge(
  of(1),
  of(2),
  of(3).pipe(delay(400)),
  of(4).pipe(delay(900)),
  of(5).pipe(delay(600)),
  new Observable(s => { setTimeout(() => {s.next(6); s.complete()}, 1200); return function callOnUnsub() { } })
)
  .pipe(
    debounce(v => timer(300))
  )
  .subscribe(console.log) // 2 6
```

---

## debounceTime

* internally maintains an `Action` that is scheduled every time an outer value is intercepted; if there is an already scheduled action when such value arrives, it will be cancelled, allowing a new one to be scheduled
* when an action's callback is invoked(meaning that the scheduled action wasn't cancelled in the meanwhile), it will **send** the last received **value** to the **destination subscriber** and will **NOT** reschedule the action
* if the source completes, before the action is cancelled, the last stored value will be sent and then the complete notification

---

## Inner Subscriber and Outer Subscriber

* `Inner Subscriber`
  * designed in a way to be able to send to the **outer subscriber** all the needed information:
    * `outerIndex`, `outerValue` - the value & its index of received by the **outer** subscriber
    * `innerIndex`, `innerValue` - the value & its index of received by the **inner** subscriber(e.g: `exhaustMap`, `mergeMap` etc, where the value of the inner obs. will be sent to the data consumer)
    * `innerSub` - the `Inner Subscriber` **instance** that is in charge of informing the outer(e.g: `delayWhen`, when the inner obs emits, the `outerValue` that created the `innerSub` should be sent to the data consumer)

---

## Questions

* what does it mean ? `debounceTime`
  ```ts
  debouncedNext(): void {
    this.clearDebounce();

    if (this.hasValue) {
      const { lastValue } = this;
      // This must be done *before* passing the value
      // along to the destination because it's possible for
      // the value to synchronously re-enter this operator
      // recursively when scheduled with things like
      // VirtualScheduler/TestScheduler.
      this.lastValue = null;
      this.hasValue = false;
      this.destination.next(lastValue);
    }
  }
  ``` 

* why `complete/error` will reach `SafeSubscriber` and will null out its references, whereas `unsubscribe()` will not 🤔 ❓

* how does the chain behave on
  * `error`
  * `complete`

* multiple `_parentOrParents` ? 

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

* making an observable multicast with the help of a subject ?

* in NgRx: `this.source = aSubjectInstance`

* what are notifications(`Notification`)

---

## To Do

* to try :)
  ```ts
  export function scheduleArray<T>(input: ArrayLike<T>, scheduler: SchedulerLike) {
    return new Observable<T>(subscriber => {
      const sub = new Subscription();
      let i = 0;
      sub.add(scheduler.schedule(function () {
        if (i === input.length) {
          subscriber.complete();
          return;
        }
        subscriber.next(input[i++]);
        //! ❓ when might `subscriber.closed` be `true`
        // Maybe when one ancestor(destination subscriber) unsubscribed(e.g: `take(n)`)
        // and this was the `n-th` notification
        if (!subscriber.closed) {
          sub.add(this.schedule());
        }
      }));
      return sub;
    });
  }
  ```


  ```ts
  public flush(action: AsyncAction<any>): void {
    // ❓ how can there be multiple actions
    const {actions} = this;

    //! ❓ when will this be actived?
    // Maybe when the action is first scheduled for a delayX
    // then, in the scheduled callback, the action is rescheduled with a delayY, where delayY < delayX
    if (this.active) {
      actions.push(action);
      return;
    }

    let error: any;
    this.active = true;

    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (action = actions.shift()!); // exhaust the scheduler queue

    this.active = false;

    if (error) {
      while (action = actions.shift()!) {
        action.unsubscribe();
      }
      throw error;
    }
  }
  ```
  
  ```ts
  _unsubscribe() {

    const id = this.id;
    const scheduler = this.scheduler;
    const actions = scheduler.actions;
    const index = actions.indexOf(this);

    this.work  = null!;
    this.state = null!;
    this.pending = false;
    this.scheduler = null!;

    // ❓ when will this be the case ?
    if (index !== -1) {
      actions.splice(index, 1);
    }

    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, null);
    }

    this.delay = null!;
  }
  ```

* to mention 😃
  ```ts
  src$.pipe(
    switchMap(v => of(v).pipe(filter(v => v > 0)))
  )
  ```
  
  and

  ```ts
  src$.pipe(
    switchMap(v => of(v)),
    filter(v => v > 0)
  )
  ```


* illustrate/explain `Observable.subscribe()`
* illustrate/explain `Observable.pipe(operators).subscribe()`
* illustrate/explain `Observable.pipe(operators, mergeMap(), switchMap()).subscribe()`
* illustrate/explain `Scheduler`
* illustrate/explain `unsubscribe()` - the chain 😃

* find cases for 🤔
  
  ```ts
  // Subscription.unsubscribe()
  if (_parentOrParents instanceof Subscription) {
    _parentOrParents.remove(this);
  } else if (_parentOrParents !== null) {
    for (let index = 0; index < _parentOrParents.length; ++index) {
      const parent = _parentOrParents[index];
      parent.remove(this);
    }
  }
  ```

  ```ts
  // Subscription.add()
  else if (this.closed) {
    subscription.unsubscribe();
    return subscription;
  } else if (!(subscription instanceof Subscription)) {
    const tmp = subscription;
    subscription = new Subscription();
    subscription._subscriptions = [tmp];
  }
  ```

* explore `docs_app`
* read `docs` 😃
* read `doc` :)

* cover `error` & `complete` cases

--- 

## Ideas

* when creating diagrams: `code` |-> `diagram`

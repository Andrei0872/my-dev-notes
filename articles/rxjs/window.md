# window

* the **window** itself is actually a `Subject` ❗️

* there can only be one active window

* one inner subscriber for `windowBoundaries$`
  * when it emits, the current window will be closed(i.e: `window.complete()`)
  
* what happens when **source or window** `errors/completes`
  * it will send the notification through the current active window
  * when it will propagate the notification to the next subscriber in the chain

* diagram
  * show `windowBoundaries` 
    * `error`/`complete` -> send notif & remove window
  * show current window(which is a `Subject` instance)
  * show how the dest. subscriber handles the received window(e.g: `mergeMap`)
    * show the flow of the notification that was sent by the window(from window to the inner subscriber of the dest. subscriber 😃)
      * `next`
      * `error`/`complete` -> send notif & remove window

---

## windowTime

* `windowTimeSpan` 
  * how long a window should last
  * `windowTime(windowTimeSpan) === window(timer(windowTimeSpan))`
  * if only this argument is specified, there will only be **one active window**, whose duration is determined by `windowTimeSpan`
  * a new window will be created periodically, depending on `windowTimeSpan`; when a new window is created, the current one will be closed(will emit a `complete` notification)
* `windowCreationInterval` 
  * the period at which a new window will be created and the current one will be closed
  * when this argument is specified as well, there can be **multiple active windows**
  * every `windowCreationInterval` ms a new window will be created; the life span of that window depends on `windowTimeSpan`

* every **value** received from the source will be **sent** to all the **active windows**
  ```ts
  const docClick$ = fromEvent(document, 'click');

  const source = docClick$;
  const example = source.pipe(
    windowTime(6000, 1000, /* 3 */),
    tap(_ => console.log('NEW WINDOW!'))
  );

  const subscribeTwo = example
    .pipe(
      mergeMap(s => s.pipe(
        tap(null, null, () => console.log('complete'))
      ))
    )
    .subscribe(val => console.log(val));
  ```

* every `error`/`complete` notification, will be sent to the **active windows**, while they are being removed from the `windows array`

* `maxWindowSize` - specify the maximum number of items emitted by a window
  * when this number is reached, the window will be closed(will emit a `complete` notification)

* diagram
  * `maxWindowZie`
  * scheduled actions _section_
  * `windows array`
  * action scheduled at every `windowCreationInterval` ms schedules another action that will be closed after `windowTimeSpan`(it is a 1:1 rel. between the action scheduled at every `windowCreationInterval` and the action that it creates)
  * outer value is sent to all the active windows
  * `error`/`complete` notification sent to the windows, then remove window from arr

---

## windowWhen

* accepts a functions that will produce(return) an **observable**
* can be only **one active window**(`Subject` instance)
* when the obs. resulted from the factory function `emits`/`completes`
  * the **current window** will be **closed**(the window will emit a` complete` notification)
  * the current **observable** will be **unsubscribed** an a **new inner subscriber** will be created, that will inform the outer subscriber(`WindowWhenSubscriber`) the inner obs(created by the factory function) emits
* the outer value will be sent to the current active window
* `error`/`complete` notif. from the source
  * send the notif. through the window
  * unsubscribe from the inner observable(that one resulted from the factory function)
  * send the notif. to the destination subscriber
* diagram
  * factory
  * active window sent to the dest. subscriber(`---->`)
  * when the source emits a value, sent it to the window
  * when the obs emits/completes
    * window completes
    * inner obs. unsubscribe
    * create new inner obs. & window

---

# window

* the **window** itself is actually a `Subject` ❗️

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

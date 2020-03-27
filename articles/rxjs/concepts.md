# RxJs Concepts

## Operator

* returns a function whose `inputs` and `outputs` are both `Observables`
  Examples: `map()`, `filter()`, `take()`

## Converting a callback API into an Observable

* `bindCallback` and `bindNodeCallback`

```ts
const fn = bindCallback((a, b, cb) => {
  // When calling `cb` with certain arguments, those arguments
  // will be sent to the subscriber
  // The arguments can be the result of some operations

  cb(result1, result2, result3);

  // When using `bindNodeCallback`, the first arg is the error
  cb(new Error('err!'))
  cb(null, result1, result2);
});

fn(aArg, bArg).subscribe(console.log, console.error/* Visible when an error notif. is sent: calling cb(err) with `bindNodeCallback` */)
```

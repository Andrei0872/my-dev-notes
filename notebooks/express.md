# Express Notebook

## Findings

```ts
next(err);

/* 
err
  * 'router' - layerError = 'router' - exit
  * `route` - layerError = null
*/
```

```ts
router.handle = () => {
  
  // next();
  // if the middleware did not return a boolean and no error has been encountered before(layerError falsy - either 'router' or simply next())
  // then we have a new error(`match`)
  if (typeof match !== 'boolean') {
    // hold on to layerError
    layerError = layerError || match;
  }


  // next();
  // if the middleware returned false - keep searching in the stack
  if (match !== true) {
    continue;
  }

  // next();
  // route handler - app.route('/').get(...).post(...).delete(...)
  // app.get(...)
  if (!route) {
    // process non-route handlers normally
    continue;
  }
}
```

```ts
// lazyrouter();

// this is how queryParams are assigned to `req.query`
this._router.use(query(this.get('query parser fn')));

this._router.use(middleware.init(this));
```

```ts
// middleware/init

res.locals = res.locals || Object.create(null);
```

---

## Questions

```ts
// store route for dispatch on change
if (route) {
  req.route = route;
}
```

* self.mergeParams
* `layer.keys`
  * from `this.regexp = pathRegexp(path, this.keys = [], opts);`

* `app.param([name], cb)` -> `router.param(name, cb)`
  * https://discuss.codecademy.com/t/how-many-ways-can-app-param-be-used/384590
  * tied to `layer.kys`
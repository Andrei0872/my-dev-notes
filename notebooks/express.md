# Express Notebook

## Findings

### `next`'s arguments
```ts
next(err);

/* 
err
  * 'router' - layerError = 'router' - exit
  * `route` - layerError = null
*/
```

#### calling `next` from a route handler

### traversing the _stack_
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

### initialization
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

### applying middlewares

* `app.get('path', [...middlewares], cb)`

### params

* `layer.params` populated in `matchLayer`
  `req.params` are populated afterwards
  ```js
  // Capture one-time layer values
  req.params = self.mergeParams
    ? mergeParams(layer.params, parentParams)
    : layer.params;
  var layerPath = layer.path;
  ```

```js
// the first arg can be an array which contains multiple `params`
app.param(['id'], () => {
  console.log('[id] matched! #1');
});

app.param('id', (req, res, next, idValue) => {
  console.log('[id] matched! #2');
});

// the router will keep track of these param's callbacks this way:
{
  'id': [cb1, cb2, /* ... */],
  'otherParam': [/* ... */]
}
```

* the callbacks will be called **before** the `route handler`
* the `next` cb passed in, when invoked, it will go to the next callback of the currently processed `param`, or if there are no other callbacks, it will go to the next `param` which has any registered callbacks

```js
app.get('/test/:foo/:bar', (req, res) => {
  console.log('[ROUTE HANDLER]');
  const { foo, bar } = req.params;

  res.json({ foo, bar });
});

app.param(['foo', 'bar'], (req, res, next, value, param) => {
  console.log(`param cb (${param}), value: ${value}`);

  next();
});

app.param('foo', (req, res, next, value) => {
  console.log('[foo] param handler', value);

  next();
});

/* 
param cb (foo), value: foo-val
foo.js:26
[foo] param handler foo-val
foo.js:32
param cb (bar), value: bar-val
foo.js:26
[ROUTE HANDLER]
*/
```

### `Router`

* `mergeParams`

### Providing the path

*e.g `app.get(path)`*

* `pathtoRegexp` package
* `new RegExp('\\d+').source`

* `path`
  * a `RegExp` instance
  * a `string` and will then get converted into a `RegExp` instance
  * an array of strings or `RegExp` instances

* `*` -> `(.*)`

```js
const re = /(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/;

app.get('/test/:id(\\d+)', () => {}); // -> new RegExp('^\/test\/(?:(\d+))\/?$')

// the entire (/:id..) is optional
// meaning that `curl http://localhost:8001/test/sadsa` would **not** match this route
// but `curl http://localhost:8001/test/` will
app.get('/test/:id(\\d+)?', () => {}); // -> '^\/test(?:\/(\d+))?\/?$'


/* 
params: {
  0:'/2abdsa' // unnamed group
  id:'123'
}
*/
// what's after the `*`, it will become an unnamed group
app.get('/test/:id(\\d+)*?', () => {});

/* 
{
  keys: [
    { name: 0 },  // because `*` becomes `(.*)`, which represents an unnamed group
    { name: id },
  ],
}
*/
/* 
on `curl http://localhost:8001/abcdef/123`
params: {
  0: 'abcdef',
  id: 123,
}
*/
app.get('/*/:id(\\d+)', () => {});
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

* what happens when a middleware returns `false`

* streams
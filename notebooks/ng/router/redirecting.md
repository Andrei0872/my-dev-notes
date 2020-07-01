# Redirecting

## Absolute vs Relative Redirects

https://stackblitz.com/edit/exp-routing-redirect-abs-vs-nonabs-path?file=src%2Fapp%2Fapp.module.ts

* the diff between `redirectTo: 'foo/bar'` and `redirectTo: '/foo/bar'` (?)
  * `/` - will start again from the **root**(the first outermost array of routes)
  * `` - will start the search from the first route from the array this current route resides in
* only abs redirects can have named outlets (?)
* a redirect operation can be done only once, as specified by the `allowRedirects` flag, which is set to `false` after one redirect op occurs:
  ```ts
  // `expandWildCardWithParamsAgainstRouteUsingRedirect`

  // non-absolute redirect
  return this.expandSegment(ngModule, group, routes, newSegments, outlet, false);
  ```
* absoulte redirects can include `child outlets` in the `redirectTo` url
  ```ts
  {
    path: 'a',
    redirectTo: '/(foo:bar)'
  },
  ```

  ```html
  <router-outlet name="foo"></router-outlet>
  ```

---

## Wildcard vs Non-wildcard path

https://stackblitz.com/edit/exp-routing-redirect-non-wildcard?file=src%2Fapp%2Fapp.module.ts

* you can **reuse** the `query params` and the `positional params` from the current URL
  * `createQueryParams` - `?name=:foo` - `foo` taken from the actual url(e.g: `foo='andrei'`)
  * `createSegmentGroup > createSegments` - `path: 'a/:id'`, `redirectTo: 'err-page/:id'` - `id` taken from `a/:id`
* when using a `non-wildcard` path and a `relative` redirect, that extra segments of the URL will be added to the `redirectTo`'s segments
  ```ts
    {
    path: 'a/b',
    component: AComponent,
    children: [
      {
        path: 'err-page',
        component: BComponent,
      },
      {
        path: 'c',
        redirectTo: 'err-page'
      },
    ],
  },

  router.navigateByUrl("a/b/c/not-matched")
  ```
  which may lead to `NoMatch` errors in some cases

---

```ts
[{path: 'a/:id', redirectTo: 'd/a/:id/e'}, {path: '**', component: ComponentC}],
  '/a;p1=1/1;p2=2', (t: UrlTree) => {
    expectTreeToBe(t, '/d/a;p1=1/1;p2=2/e');
  };
```

```ts
checkRedirect(
  [{
    path: 'a',
    children: [
      {path: 'bb', component: ComponentB}, {path: 'b', redirectTo: 'bb'},

      {path: 'cc', component: ComponentC, outlet: 'aux'},
      {path: 'b', redirectTo: 'cc', outlet: 'aux'}
    ]
  }],
  'a/(b//aux:b)', (t: UrlTree) => {
    expectTreeToBe(t, 'a/(bb//aux:cc)');
  });
```
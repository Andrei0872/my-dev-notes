# An in depth overview of `@angular/router`

* applying redirects 
  * don't have do manually call `router.navigate` in order to redirect, you can simply return an `UrlTree` instance
  * where `NoMatch` errors occur
  * `DFS` applied on the `route config object` until the **first** match is found
  * the module specified in `loadChildren` is loaded ?
  
  * `createChildrenForEmptySegments` what effect has on the further phases in the chain?
  ```ts
  // segm: 'a/b/c'
  {
    path: 'a/b',
    children: [
      { path: '', outlet: 'named' }, // `named`
      { path: 'c', }, // `primary`
    ],
  }
  ```

## Getting to know the `UrlTree`

* introduce `UrlParser`
* diff between this tree and the one created from `RouterState` or `RouterStateSnapshot`
  * in a `UrlTree` tree only outlets(named or `primary` by default) are considered children(child = `UrlSegmentGroup`)
  * in a `RouterStateSnapshot` tree, each matched path of a `Route` object determines a `RouterStateSnapshot` child

---

## Route matcher

---

## ActivatedRouteSnapshot and ActivatedRoute

* `ActivatedRouteSnapshot` plays an important role when using `RouteReuseStrategy`

---

## Route Guards

* when `UrlTree` is returned, it means `redirect`

---

## Router Phases

### _Apply Redirects_ phase

* `NoMatch` errors occur; in this phase it is ensured that the path which would trigger a route navigation has a math among the declared routes(`Routes`)
* `canLoad` guard is invoked
  * can return a `UrlTree` instance, which will result in a redirect operation
  * this means that lazy-loaded modules are loaded during this phase; the resulted module, along with the `routes` specified by it are going to be stored for the subsequent phases(e.g `Recognize` phase);
    the config will be store in `_loadedConfig`
  * in order for a module to be successfully loaded, if any `canLoad` guards are present, all of them must return `true`
    if at least once `false` is returned - the current navigation will be cancelled and a `NavigationCancel` event will be sent
    if at least once `UrlTree` is returned - it will schedule a **new navigation**
* %include redirects

### _Recognize_ Phase

* a tree of `ActivatedRouteSnapshot` is created, based on the `UrlTree` resulted from the previous phase, `Apply Redirects`
* routes with **empty paths** are **recognized**
  ```ts
  {
    path: 'a/b',
    component: AComponent,
    children: [
      {
        path: 'test',
        outlet: 'named',
        component: BComponent,
      },
      {
        path: '',
        canActivate: [AGuard],
        component: CComponent,
      },
    ]
  }
  ```

  ```html
  <button [routerLink]="['a/b/', { outlets: { named: 'test' } }]">go to B</button>
  ```

  ```ts
  // The `UrlTree` resulted from `Apply Redirects`
  {
    segments: [],
    children: {
      primary: {
        segments: ['a', 'b'],
        children: {
          named: { segments: ['test'], children: {} }
        }
      }
    }
  }
  ```

  as you can see from the **route configuration**, the route with `path: ''` is not there, so that's what this phase is responsible for(among other things)

  after this phases, we'd end up with this:

  ```ts
  {
    segments: [],
    children: {
      primary: {
        segments: ['a', 'b'],
        children: {
          named: { segments: ['test'], children: {} }
          /* *** */ primary: { segments: [], children: [] } /* *** */
        }
      }
    }
  }
  ```

  and based on the `UrlSegmentGroup` from above, the `RouterStateSnapshot` tree will be created

  TODO(another example for diff)
  ```ts
  { path, children: [ { path, children: [ { path } ] } ]}
  ```
* the `data`, `resolve` and `params` properties are inherited(`paramsInheritanceStrategy`)
  * when `emptyOnly` is used, a route will inherit the above mentioned if
    the current route has an **empty path**(`path: ''`)
    ```ts
    {
      path: 'foo/:id',
      component: FooComponent,
      children: [{ path: '', component: BarComponent }] // { params: { id: X } } will be available in this route's snapshot
    }
    ```
    or the parent route is componentless(e.g when using `loadChildren`)
    ```ts
    // main-routing.module.ts
    {
      path: 'foo/:id',
      loadChildren: () => import(/* ... */),
    }

    // a-routing.module.ts
    {
      path: 'test',
      component: TestComponent // { params: { id: X } } will be available here
    }
    ```
  * when `always` is used, it will inherit everything from the `ActivatedRouteSnapshot` root

* cannot access `ActivatedRouteSnapshot` because the `ROUTE_PROVIDERS` are provided when calling `forRoot`; however, it can be access through `ActivatedRoute.snapshot`

* https://stackblitz.com/edit/exp-routing-apply-recognize-phase?file=src%2Fapp%2Fcomponents%2Fdefault.component.ts
* TODO: do not forget about diagram on paper
* when sending **segment parameters**(`;k=v`), they will be found in `ActivatedRouteSnapshot.params` only if the segment they are attached to is that **last consumed one** (example in SB)

### Preactivation (retrieving the guards)

* https://stackblitz.com/edit/routing-preactivation-diff-trees?file=src%2Fapp%2Ffoo%2Ffoo.module.ts

* collecting `CanActivate` & `CanDeactivate` guards
* comparing 2 trees: the current `ActivateRouteSnapshot` tree and the future `ActivateRouteSnapshot` tree
* `Route.runGuardsAndResolvers` -> `shouldRunGuardsAndResolvers`: defines when guards and resolvers should be run
  todo: explain other options as well :)

```ts
[
  { // (1)
    path: 'foo/:id',
    loadChildren: () => import('./foo/foo.module').then(m => m.FooModule)
  }
]

// foo.module.ts
[
 { // (2)
    path: 'a',
    component: AComponent,
  },
  { // (3)
    path: 'b',
    component: BComponent,
    outlet: 'named',
  },
  { // (4)
    path: 'c',
    component: CComponent,
  },
]
```

Issued URL: 

```typescript
this.router.navigateByUlr('foo/123/(a//named:b)');
```

```html
<button [routerLink]="['foo/123/', { outlets: { primary: 'a', named: 'b' } }]">foo/123/(a//named:b)</button>
```

RouterStateSnapshot tree
```
(0) - Root

      (0)              (0)
       |                |
      (1)              (1)
      / \              / \
    (2) (3)          (2) (4)

canActivateChecks: [(4)]
canDeactivateChecks: [(3)]
```

### Running Guards

* `canActivate` & `canDeactivate` guards are run here
* if one guard returns a `UrlTree`, a redirect will happen
* if at least one `canActivate`(`canActivateChild` (?)) guard returns `false`, the entire navigation will be cancelled
* `canActivateChild` are run before `canActivate` guards and if at least one returns `false`, the `canActivate` ones won't be run anymore & the current navigation will be cancelled
* `canActivateChild`
  * https://stackblitz.com/edit/routing-can-activate-child?file=src%2Fapp%2Ffoochild.guard.ts
  ```
        APP
         |
         A  <- canActivateChild
        / \
       B   C
  ```
  * `canActivateChild` will be run **twice**, once for each child
  * given a node `A`, when reached, it will call all the `canActivateChild` guards from its ancestors: https://stackblitz.com/edit/routing-can-activate-child-all-ancestors?file=src%2Fapp%2Ffoo%2Ffoo.module.ts
* `prioritizedGuardValue`
  the problem it solves: you have a list of `N` observables and when any of them emits any other value than `true`, you want to stop everything(e.g `complete`) and pass along that value

  Concretely, you have `N` `canActivate` guards and you want to subscribe to all of them at the same time, but if the third one returns `false`, then everything should stop there, as what other observables emit is irrelevant, as the `false` value will result in cancelling the current navigation.

### Running Resolvers

* https://stackblitz.com/edit/routing-resolvers?file=src%2Fapp%2Fapp.module.ts
* the resolvers will be run in parallel
* each resolver **must complete**
* if at least one resolver completes, but does not emit a value -> `NavigationCancel`; however, only the `RouterEvent` will be emitted, but the navigation itself will continue

### Create RouterState

* the `ActivateRoute` tree is created
* here `RouteReuseStrategy` is used
* `_futureSnapshot` in `value._futureSnapshot = curr.value;` will be useful in `advanceActivatedRoute`
* `createNode`
  comparing the _future_ tree of `ActivatedRouteSnapshot` with the current `ActivatedRoute` tree
  
  `routeReuseStrategy.shouldReuseRoute(futureARS, currAR)`
    if `true`: the current `ActivatedRoute`'s `_futureSnapshot` will va assigned to `futureARS`

* `createOrReuseChildren(routeReuseStrategy, curr, prevState))`
  at this point: `curr.value.routeConfig === prevState.value.snapshot.routeConfig`

  what's left to do at this point is to iterate over `curr`'s children(because this is represents the newly issued URL) and find if we can **reuse** other `prevState`'s children; 
  so, for each `curr`'s child we see if `any(prevState.children, prevChild => prevChild.routeConfig === child.routeConfig)`; if `true`, then we should reuse that child; otherwise, we create a new `ActivatedRoute`(out of `child`, which is of `ActivatedRouteSnapshot` type), which will be added to the `curr.children` array. if `child` has any children, then for each of `child.children` a new `ActivatedRoute` will be created. then, the same process is repeated for each child from `child.children` and so on.
  
https://stackblitz.com/edit/routing-reuse-strategy?file=src/app/foo/foo.module.ts

### Activate Routes

https://stackblitz.com/edit/routing-activate-routes?file=src/app/foo/foo.module.ts

* `deactivateChildRoutes`
  comparing the current and previous `Tree<ActivatedRoute>`
  when a diff is found, `deactivateRouteAndItsChildren`
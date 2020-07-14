# An in depth overview of `@angular/router`

<!-- https://github.com/angular/angular/issues/16261 -->

```ts
  // you can have a componentless route, although the `children` property is present
  {
    path: 'parent/:id',
    children: [
      {path: 'simple', component: SimpleCmp},
      {path: 'user/:name', component: UserCmp, outlet: 'right'}
    ]
  },
  {path: 'user/:name', component: UserCmp}
  ```

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

---

## Route matcher

---

## ActivatedRouteSnapshot and ActivatedRoute

* `ActivatedRouteSnapshot` plays an important role 
  * when using `RouteReuseStrategy`;
  * when navigating with `RouterLink` directives(`_lastPathIndex`)

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

---

## Router

* `createUrlTree(commands, navigationExtras)`
  * applies commands to the current URL tree and creates a new URL tree
  * merges query params based on `navigationExtras.queryParamsHandling`
  * removes empty query params -> you can remove query params by assigning `undefined` or `null` to them; https://stackblitz.com/edit/routing-remove-queryparams?file=src/app/app.module.ts

* `NavigationExtras`
* handling errors
* accessing the previous URL

--- 

## `createUrlTree`

* what happens when `commands` is empty
  * https://stackblitz.com/edit/routing-resetting-and-altering-current-route-queryparam-fragmen?file=src/app/app.module.ts
  * a way to refresh the current route's **query params** and **fragment**, without reloading the component
* navigate to root: `Router.navigate(['/'])`
* `Navigation` class (?)
  * `toRoot()` -> `['/']`
* a command can include segment parameters if it's an object that does not have an `outlets` or `segmentPath` property:
  ```ts
  function isMatrixParams(command: any): boolean {
    return typeof command === 'object' && command != null && !command.outlets && !command.segmentPath;
  }
  ``` 

---

## Customizable parts of `angular/router`

* `RouteReuseStrategy`
  by default, when a route is deactivated, its component is destroyed and recreated when the route is activated again
  by using a custom strategy, you can _store_ a **subtree** of `ActivatedRouteSnapshot`, without destroying its components when the route is deactivated and **reuse** it when the routes would be reactivated

  `RouteReuseStrategy.detach` - current `ActivatedRouteSnapshot` and its subtree would be detached and **reused** later
  `RouteReuseStrategy.store`
    store the detached `ActivatedRouteSnapshot`

    ```typescript
    // `route` - `TreeNode<ActivatedRoute>`
    // `componentRef` - the current route's component - from `RouterOutlet.detach()`
    // `contexts` - the child `router-outlet`s
    this.routeReuseStrategy.store(route.value.snapshot, {componentRef, route, contexts});

    // Erase the stored routed
    // this.routeReuseStrategy.store(route.value.snapshot, null)
    ```
  `RouteReuseStrategy.shouldAttach(r)` - determines whether `r`(`ActivatedRouteSnapshot`) should be attached
  `RouteReuseStrategy.retrieve(r)`
    retrieve the previous `r`(`ActivatedRouteSnapshot`): `{ route, componentRef, contexts }`
    it also used during the creation of the `ActivatedRoute` tree; that tree is created based on the `ActivatedRouteSnapshot` tree, and what happens here is that the stored `ActivatedRoute`(and its subtree) will have to have its `_futureSnapshot` value updated; this is done through `setFutureSnapshotsOfActivatedRoutes`; any subscriptions to the `ActivatedRoute`'s properties(e.g `params`, `data`, `queryParams`) will be updated
    also used when the routes are **activated**; it will retrieve the 3 properties and it will use `RouterOutlet.attach(comp)` to insert the component back into the view(this is how it is reused); it will then `advanceActivatedRouteNodeAndItsChildren`(the result of setting `_futureSnapshot`)
    `RouteReuseStrategy.shouldReuseRoute` - if it should reuse **only** a route(`ActivatedRouteSnapshot`)

  (!) - in `retrieve(route)` and `shouldDetach(route)`, `route` will be a different instance of `ActivatedRouteSnapshot`; the same happens in `shouldAttach(route)` and `shouldDetach(route)`

  https://stackblitz.com/edit/angular-custom-route-reuse-strategy?file=src/app/app.module.ts

  ```ts
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (future.routeConfig !== curr.routeConfig) {
      return false;
    }

    if (Object.keys(future.params).length !== Object.keys(curr.params).length) {
      return false;
    }

    return Object.keys(future.params).every(k => future.params[k] === curr.params[k]);
  }

  // an attached tree will also receive params -> from `_futureSnapshot`
  router.navigateByUrl('/a;p=1/b;p=2');
  ```

* `UrlHandlingStrategy` - a way to migrate from AngularJs to Angular

---

## RouterModule

* `ExtraOptions`
  * `useHash` -> `HashLocationStrategy` as `LocationStrategy`
* how is the router set up
  * during `APP_BOOTSTRAP_LISTENER` 

---

## Relevant test cases

```ts
// named outlets + empty paths
// (!) might add in the `features` section
// (!) might also add the diff between `/()` and `()` (url_serializer.spec.ts)

checkRecognize(
[{
  path: 'a',
  component: ComponentA,
  children: [
    {path: 'b', component: ComponentB}, {path: '', component: ComponentC, outlet: 'aux' /* pathMatch: 'full' // would change things */}
  ]
}],
'a/b', (s: RouterStateSnapshot) => {
  checkActivatedRoute((s as any).firstChild(s.root)!, 'a', {}, ComponentA);

  const c = (s as any).children((s as any).firstChild(s.root)!);
  checkActivatedRoute(c[0], 'b', {}, ComponentB);
  checkActivatedRoute(c[1], '', {}, ComponentC, 'aux');
});

checkRecognize(
[{
  path: 'a',
  component: ComponentA,
  children: [
    {path: '', component: ComponentB},
    {path: 'c', component: ComponentC, outlet: 'aux'},
  ]
}],
'a/(aux:c)', (s: RouterStateSnapshot) => {
  checkActivatedRoute((s as any).firstChild(s.root)!, 'a', {}, ComponentA);

  const c = (s as any).children((s as any).firstChild(s.root)!);
  checkActivatedRoute(c[0], '', {}, ComponentB);
  checkActivatedRoute(c[1], 'c', {}, ComponentC, 'aux');
});

// (!) might also mention params (matrix vs pos)
 checkRecognize(
[{
  path: 'p/:id',
  children: [
    {path: 'a', component: ComponentA}, {path: 'b', component: ComponentB, outlet: 'aux'}
  ]
}],
'p/11;pp=22/(a;pa=33//aux:b;pb=44)', (s: RouterStateSnapshot) => {
  const p = (s as any).firstChild(s.root)!;
  checkActivatedRoute(p, 'p/11', {id: '11', pp: '22'}, undefined!);

  const c = (s as any).children(p);
  checkActivatedRoute(c[0], 'a', {id: '11', pp: '22', pa: '33'}, ComponentA);
  checkActivatedRoute(c[1], 'b', {id: '11', pp: '22', pb: '44'}, ComponentB, 'aux');
});
```
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

---

## RouterLink Directive

* `segmentPath` - if the first segment contains slashes and you don't want to split it
* remove an outlet
  ```typescript
  // remove the right secondary node
  router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: null}}]);
  ``` 
* `queryParamsHandling`
  * `preserve`: preserve the current query params(while ignoring the `[queryParams]` ones) when navigating to another route: https://stackblitz.com/edit/routing-queryparamshandling-preserve?file=src/app/app.module.ts
  * `merge`: merge the current `RouterLink`'s query params with the existing query params of the current route; the result will be the query params object for the next route: https://stackblitz.com/edit/routing-queryparamshandling-merge?file=src/app/app.module.ts

* navigating with `..`:
  ```ts
  {
    path: 'a/b/c',
    component: A,
    children: [
      { path: 'd/e/f', component: B }
    ]
  }
  ```

  assuming you are at `B`

  `routerLink=['foo', 'bar']` -> `a/b/c/d/e/f/foo/bar`; `routerLink` has `relativeTo` set to the current `ActivatedRoute`(the one associated with `B`)

  `routerLink=['../foo', 'bar']` -> `a/b/c/d/e/foo/bar`

---

## Router

* `createUrlTree(commands, navigationExtras)`
  * applies commands to the current URL tree and creates a new URL tree
  * merges query params based on `navigationExtras.queryParamsHandling`
  * removes empty query params -> you can remove query params by assigning `undefined` or `null` to them; https://stackblitz.com/edit/routing-remove-queryparams?file=src/app/app.module.ts

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

## RouterOutlet

* can be notified when the `router-outlet` is activated/deactivated
  ```ts
  @Output('activate') activateEvents = new EventEmitter<any>();
  @Output('deactivate') deactivateEvents = new EventEmitter<any>(); // You can receive the component here
  ```

* how everything is organized
  ```ts
  // #1
  {
    path: '',
    component: A,
    children: []
  }
  ``` 

  differs from

  ```ts
  // #2
  {
    path: '',
    loadChildren: () => import(/* ... */)
  }
  ```

  the information about a **router outlet** has this shape:

  ```ts
  export class OutletContext {
    outlet: RouterOutlet|null = null;
    route: ActivatedRoute|null = null;
    resolver: ComponentFactoryResolver|null = null;
    children = new ChildrenOutletContexts();
    attachRef: ComponentRef<any>|null = null;
  }
  ```

  The router outlets hierarchy is achieved with `ChildrenOutletContexts`:

  ```ts
  export class ChildrenOutletContexts {
    // contexts for child outlets, by name.
    private contexts = new Map<string, OutletContext>();
  }
  ```

  After adding the first `router-outlet` to the page, here's how the structure would look like:

  ```typescript
  {
    contexts: { primary: OutletContext }
  }
  ```

  In `#1`'s scenario, the `component` used will also have to include at least one `router-outlet`, each of each will be added to the corresponding `context`, as children.

  For example:

  ```ts
  {
    path: '',
    component: A,
    children: [{ path: 'foo', component: Foo }, { path: 'bar', component: Bar, outlet: 'special' }]
  }
  ```

  If `A` component declares `<router-outlet>` and `<router-outlet name="special">`, then the hierarchy would look as follows:

  ```typescript
  {
    contexts: {
      primary: { // A
        context: {
          primary: OutletContext, // Foo
          special: OutletContext, // Bar
        }
      }
    }
  }
  ```

  And the same pattern would be applied if, for instance, `bar`'s route would have a `children` property.

  In `#2`'s scenario, since the route configuration does not have a component declared in it, and hence no others `router-outlet`s, the initial `router-outlet` will contain the first component from the loaded module which belongs to a route configuration whose `path` matches the current issued URL.

  ```ts
  {
    path: 'test',
    loadChildren: () => import(/* ... */)
  }

  // Inside module
  {
    path: 'foo',
    component: Foo,
  }
  ```

  then, the `router-outlet`s would be organized like this:

  ```ts
  {
    context: {
      primary: OutletContext // Foo
    }
  }
  ```

  If `Foo`'s route configuration contained the `children` property, then it would resemble `#1`.

  https://stackblitz.com/edit/routing-router-outlet?file=src%2Fapp%2Fapp.component.ts

* `Router.activateWith`
  inserting the route's component into the view; everything is based on the `ViewContainerRef`'s API(`private location: ViewContainerRef`) 
  when it adds a new component into the view, in order to properly organize the child `router-outlet`'s, the newly added component will also specify a **custom injector**, `OutletInjector`:

  ```ts
  // Called when a route is activated
  activateWith(activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver|null) {
    if (this.isActivated) {
      throw new Error('Cannot activate an already activated outlet');
    }
    this._activatedRoute = activatedRoute;
    const snapshot = activatedRoute._futureSnapshot;
    const component = <any>snapshot.routeConfig!.component;
    resolver = resolver || this.resolver;
    const factory = resolver.resolveComponentFactory(component);
    const childContexts = this.parentContexts.getOrCreateContext(this.name).children;
    const injector = new OutletInjector(activatedRoute, childContexts, this.location.injector);
    this.activated = this.location.createComponent(factory, this.location.length, injector);
    // Calling `markForCheck` to make sure we will run the change detection when the
    // `RouterOutlet` is inside a `ChangeDetectionStrategy.OnPush` component.
    this.changeDetector.markForCheck();
    this.activateEvents.emit(this.activated.instance);
  }

  class OutletInjector implements Injector {
    constructor(
        private route: ActivatedRoute, private childContexts: ChildrenOutletContexts,
        private parent: Injector) {}

    get(token: any, notFoundValue?: any): any {
      // This is how a routed component is able to inject the right `ActivatedRoute`
      if (token === ActivatedRoute) {
        return this.route;
      }

      // This is an essential piece of logic to properly creating the above mentioned hierarchy
      // A child router-outlet would be added to the current child context's children
      // this.childContexts = this.parentContexts.getOrCreateContext(this.name).children;
      if (token === ChildrenOutletContexts) {
        return this.childContexts;
      }

      return this.parent.get(token, notFoundValue);
    }
  }
  ```

* deactivating vs destroying a `router-outlet`
  `<router-outlet *ngIf="condition"></router-outlet>` - destroying the `router-outlet` doesn't remove the `OutletContext` from the `contexts` Map

  ```ts
  ngOnDestroy(): void {
    this.parentContexts.onChildOutletDestroyed(this.name);
  }

  onChildOutletDestroyed(childName: string): void {
    const context = this.getContext(childName);
    if (context) {
      context.outlet = null;
    }
  }
  ```

  And it will be **re-created** when the `condition` becomes `true` again:

  ```ts
  ngOnInit(): void {
    if (!this.activated) {
      // If the outlet was not instantiated at the time the route got activated we need to populate
      // the outlet when it is initialized (ie inside a NgIf)
      const context = this.parentContexts.getContext(this.name);
      if (context && context.route) { // Already created before; set in `activateRoutes`
        if (context.attachRef) {
          // `attachRef` is populated when there is an existing component to mount
          this.attach(context.attachRef, context.route);
        } else {
          // otherwise the component defined in the configuration is created
          this.activateWith(context.route, context.resolver || null);
        }
      }
    }
  }
  ```

  the `RouterOutlet` is deactivated when there is a new URL tree:

  ```ts
   private deactivateRouteAndOutlet(
      route: TreeNode<ActivatedRoute>, parentContexts: ChildrenOutletContexts): void {
    const context = parentContexts.getContext(route.value.outlet);

    if (context) {
      const children: {[outletName: string]: any} = nodeChildrenAsMap(route);
      const contexts = route.value.component ? context.children : parentContexts;

      // First, deactivate the children
      forEach(children, (v: any, k: string) => this.deactivateRouteAndItsChildren(v, contexts));

      if (context.outlet) {
        // Destroy the component (by destroying the current view)
        // And emit the destroyed component through `this.deactivateEvents.emit(c);`
        context.outlet.deactivate();

        // Destroy the contexts for all the outlets that were in the component
        context.children.onOutletDeactivated();
      }
    }
  }
  ```

  https://stackblitz.com/edit/routing-router-outlet-destroy-vs-deactivate?file=src%2Fapp%2Fapp.component.html

---

## Customizable parts of `angular/router`

* 
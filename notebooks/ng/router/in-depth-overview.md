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

* `ActivatedRouteSnapshot` plays an important role 
  * when using `RouteReuseStrategy`;
  * when navigating with `RouterLink` directives(`_lastPathIndex`)

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

## RouterLinkWithHref

* 

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

* `UrlHandlingStrategy` - a way to migrate from AngularJs to Angular

---

## RouterModule

* `ExtraOptions`
  * `useHash` -> `HashLocationStrategy` as `LocationStrategy`
* how is the router set up
  * during `APP_BOOTSTRAP_LISTENER` 

---

## The connection between Location and Router

* in `Router.initialNavigation()` - listen to `popstate` and `hashchange` events through `Location`
* `Location` - the bridge between `Router` and `LocationStrategy`()
* `Location` - used when setting the browser URL

---

## Relevant test cases

```ts
 [
    {path: 'a', component: ComponentA},
    {path: 'b', component: ComponentB, outlet: 'left'},
    {path: 'c', component: ComponentC, outlet: 'right'}
  ],
  
  'a(left:b//right:c)'

  const c = (state as any).children(state.root);
  checkActivatedRoute(c[0], ComponentA);
  checkActivatedRoute(c[1], ComponentB, 'left');
  checkActivatedRoute(c[2], ComponentC, 'right');

  console.log(r.parseUrl('a(left:b//right:c)'))
  console.log(r.parseUrl('a/(left:b//right:c)'))
```

```ts
// updateSegmentGroupChildren

forEach(outlets, (commands: any, outlet: string) => {
  if (commands !== null) {
    children[outlet] = updateSegmentGroup(segmentGroup.children[outlet], startIndex, commands);
  }
});

forEach(segmentGroup.children, (child: UrlSegmentGroup, childOutlet: string) => {
  if (outlets[childOutlet] === undefined) {
    children[childOutlet] = child;
  }
});

// --->

const p = serializer.parse('/a/11/b(right:c)');
// children: { primary: 'a/11/b', right: 'c' }
const t = createRoot(p, ['/a', 11, 'd']);
expect(serializer.serialize(t)).toEqual('/a/11/d(right:c)');
```

```ts
const p = serializer.parse('/a(right:b)');
// children: { primary: 'a', right: 'b' }

const t = createRoot(p, ['/', {outlets: {right: ['c']}}]);
// commands: = { outlets: { right: ['c'] } }

expect(serializer.serialize(t)).toEqual('/a(right:c)');
```

```ts
const p = serializer.parse('/a(right:b)');
// children: { primary: 'a', right: 'b' }

const t = createRoot(p, [{outlets: {right: ['c', 11, 'd']}}]);
// `lastPathIndex === -1` -> `updateSegmentGroupChildren` -> replace `right`

expect(serializer.serialize(t)).toEqual('/a(right:c/11/d)');
```

```ts
// remove primary segment
const p = serializer.parse('/a/(b//right:c)');
// children: { primary: { segm: 'a', children: { primary: b, right: c } } }

const t = createRoot(p, ['a', {outlets: {primary: null, right: 'd'}}]);
expect(serializer.serialize(t)).toEqual('/a/(right:d)');
```

```ts
console.log(r.parseUrl('/a/(c//left:cp)(left:ap)'));

{
  children: {
    primary: { segm: a, children: { primary: 'c', left: 'cp' } },
    left: 'ap'
  }
}

// would match something like this:

{
  { 
    path: 'a',
    children: [
      { path: 'c' },
      { path: 'cp', outlet: 'left' }
    ]
  },
  { path: 'ap', outlet: 'left', }
}
```

```ts
const p = serializer.parse('/a');
const t = create(p.root.children[PRIMARY_OUTLET], 0, p, [{k: 99}]);
expect(serializer.serialize(t)).toEqual('/a;k=99');
```

```ts
const p = serializer.parse('/a/(c//left:cp)(left:ap)');
// children:{ primary: { segm: 'a', children: { primary: `c`, left: `cp` } }, left: 'ap'}

const t = create(p.root.children[PRIMARY_OUTLET], 0, p, ['c2']);
// `p.root.children[PRIMARY_OUTLET]` === { segm: 'a', children: { primary: `c`, left: `cp` } }

// in `prefixedWith()` -> commandIdx(1) === commands.length ---> updateSegmentGroupChildren
expect(serializer.serialize(t)).toEqual('/a/(c2//left:cp)(left:ap)');
```

```ts
const p = serializer.parse('/a/(c//left:cp)(left:ap)');
const t = create(p.root.children[PRIMARY_OUTLET], 0, p, [{'x': 99}]);
expect(serializer.serialize(t)).toEqual('/a;x=99(left:ap)');
```

```ts
console.log(r.parseUrl('/q/(a/(c//left:cp)//left:qp)(left:ap)'))
```

```ts
// `state` - available in `router.getCurrentNavigation().extras.state`
// `state` - will be stored in an history's item
// can be used, for example, to store the position of the current page, so that on `popstate` event
// that `state` will be available in the `NavigationStart`
router.navigateByUrl('/simple', {state: {foo: 'bar'}});
tick();
```

`This is a fundamental property of the router: it only cares about its latest state.`

```ts
// `skipLocationChange === true` - do not call `router.setBrowserUrl`, which means that nothing will be added to the history stack
// but the router's internal status will be updated accordingly(e.g route params, query params, anything that can be `observed` from `ActivatedRoute`)
router.navigateByUrl('/team/33', {skipLocationChange: true});
```

```ts
// `eager` check
// beforePreactivation
// GUARDS
// afterPreactivation
// `deferred` check
const fixture = TestBed.createComponent(RootCmp);
advance(fixture);

router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

router.navigateByUrl('/team/22');
advance(fixture);
expect(location.path()).toEqual('/team/22');

expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

router.urlUpdateStrategy = 'eager';
(router as any).hooks.beforePreactivation = () => {
  expect(location.path()).toEqual('/team/33');
  expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');
  return of(null);
};
router.navigateByUrl('/team/33');

advance(fixture);
expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
```

```ts
/* 
on `resetConfig`, `navigated` is set to `false`
*/
router.navigate(['/a']);
advance(fixture);
expect(location.path()).toEqual('/a');
expect(fixture.nativeElement).toHaveText('simple');

router.resetConfig([{path: 'a', component: RouteCmp}]);

router.navigate(['/a']);
advance(fixture);
expect(location.path()).toEqual('/a');
expect(fixture.nativeElement).toHaveText('route');
```

```ts
@Component({selector: 'collect-params-cmp', template: `collect-params`})
class CollectParamsCmp {
  private params: any = [];
  private urls: any = [];

  constructor(private route: ActivatedRoute) {
    route.params.forEach(p => this.params.push(p));
    route.url.forEach(u => this.urls.push(u));
  }

  recordedUrls(): string[] {
    return this.urls.map((a: any) => a.map((p: any) => p.path).join('/'));
  }
}
```

```ts
this.router.navigateByUrl().then(booleanVal => /* ... */)
```

```ts
router.resetConfig([{
  path: 'team/:id',
  component: TeamCmp,
  children: [
    {path: 'user/:name', component: UserCmp},
    {path: 'simple', component: SimpleCmp, outlet: 'right'}
  ]
}]);

router.navigateByUrl('/team/22/(user/victor//right:simple)');
```

```ts
/* 
`navigate()` - it will create a new UrlTree according to the current UrlTree; 
since `relativeTo` is not specified, the root `ActivatedRoute` will be chosen -> it will go through each children and it wll replace where it encounters the `outlet`'s name

`navigateByUrl` - will create a new UrlTree, regardless of the current one
*/
router.resetConfig([{
  path: 'team/:id',
  component: TeamCmp,
  children: [
    {path: 'user/:name', component: UserCmp},
    {path: 'simple', component: SimpleCmp, outlet: 'right'}
  ]
}]);

router.navigateByUrl('/team/22/user/victor');
advance(fixture);
router.navigate(['team/22', {outlets: {right: 'simple'}}]);
advance(fixture);

expect(fixture.nativeElement).toHaveText('team 22 [ user victor, right: simple ]');
```

```ts
/* 
non-cancellable
when you know that the observable completes/errors
https://github.com/ReactiveX/rxjs/blob/master/src/internal/Observable.ts#L312
*/
Observable.forEach()
```

```ts
/* 
{ path: 'foo/:id', comp: FooComp }

inside `FooComp`

route.params.subscribe(() => ....)

on `foo/1` -> we'd get { id: 1 }
on `foo/1` -> nothing
on `foo/2` -> we'd get { id: 2 }

create_router_state/createNode()

const value = prevState.value;
value._futureSnapshot = curr.value;
const children = createOrReuseChildren(routeReuseStrategy, curr, prevState);
return new TreeNode<ActivatedRoute>(value, children);

setting `_futureSnapshot` is very imp for the comparison
*/
export function advanceActivatedRoute(route: ActivatedRoute): void {
  if (route.snapshot) {
    const currentSnapshot = route.snapshot;
    const nextSnapshot = route._futureSnapshot;
    route.snapshot = nextSnapshot;
    if (!shallowEqual(currentSnapshot.queryParams, nextSnapshot.queryParams)) {
      (<any>route.queryParams).next(nextSnapshot.queryParams);
    }
    if (currentSnapshot.fragment !== nextSnapshot.fragment) {
      (<any>route.fragment).next(nextSnapshot.fragment);
    }
    if (!shallowEqual(currentSnapshot.params, nextSnapshot.params)) {
      (<any>route.params).next(nextSnapshot.params);
    }
    if (!shallowEqualArrays(currentSnapshot.url, nextSnapshot.url)) {
      (<any>route.url).next(nextSnapshot.url);
    }
    if (!shallowEqual(currentSnapshot.data, nextSnapshot.data)) {
      (<any>route.data).next(nextSnapshot.data);
    }
  } else {
    route.snapshot = route._futureSnapshot;

    // this is for resolved data
    (<any>route.data).next(route._futureSnapshot.data);
  }
}
```

```ts
/* 
if no route is matched, it will be thrown an error(by default) (it uses `throw error`)

this can be avoided, by providing a custom `errorHandler`
*/
export type ErrorHandler = (error: any) => any;

// setUpRouter()
if (opts.errorHandler) {
  router.errorHandler = opts.errorHandler;
}

try {
  t.resolve(this.errorHandler(e));
  } catch (ee) {
  t.reject(ee);
}
```

```ts
router.malformedUriErrorHandler

router.navigateByUrl('/invalid/url%with%percent');
advance(fixture);
expect(location.path()).toEqual('/');
```

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

```html
<router-outlet (activate)="recordActivate($event)" (deactivate)="recordDeactivate($event)"></router-outlet>
```

```ts
/* 
`paramsInheritanceStrategy: 'emptyOnly'|'always' = 'emptyOnly';`

if route config obj has `path: ''` | the parent route has a componentless route -> it will inherit `data` and `params` from the parent 
*/
const fixture = createRoot(router, RootCmpWithTwoOutlets);
router.resetConfig([{
  path: 'parent/:id',
  data: {one: 1},
  resolve: {two: 'resolveTwo'},
  children: [
    {path: '', data: {three: 3}, resolve: {four: 'resolveFour'}, component: RouteCmp}, {
      path: '',
      data: {five: 5},
      resolve: {six: 'resolveSix'},
      component: RouteCmp,
      outlet: 'right'
    }
  ]
}]);

router.navigateByUrl('/parent/1');
advance(fixture);

const primaryCmp = fixture.debugElement.children[1].componentInstance;
const rightCmp = fixture.debugElement.children[3].componentInstance;

expect(primaryCmp.route.snapshot.data).toEqual({one: 1, two: 2, three: 3, four: 4});
expect(rightCmp.route.snapshot.data).toEqual({one: 1, two: 2, five: 5, six: 6});
```

```ts
// worth a visualization! :)
// + `inheritedParamsDataResolve`
inheritParamsAndData(routeNode: TreeNode<ActivatedRouteSnapshot>): void {
  const route = routeNode.value;

  const i = inheritedParamsDataResolve(route, this.paramsInheritanceStrategy);
  route.params = Object.freeze(i.params);
  route.data = Object.freeze(i.data);

  routeNode.children.forEach(n => this.inheritParamsAndData(n));
}
```

```ts
it('should update hrefs when query params or fragment change', fakeAsync(() => {
      @Component({
        selector: 'someRoot',
        template:
            `<router-outlet></router-outlet><a routerLink="/home" preserveQueryParams preserveFragment>Link</a>`
      })
      class RootCmpWithLink {
      }
      TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
      const router: Router = TestBed.inject(Router);
      const fixture = createRoot(router, RootCmpWithLink);

      router.resetConfig([{path: 'home', component: SimpleCmp}]);

      const native = fixture.nativeElement.querySelector('a');

      router.navigateByUrl('/home?q=123');
      advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home?q=123');

      router.navigateByUrl('/home?q=456');
      advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home?q=456');

      router.navigateByUrl('/home?q=456#1');
      advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home?q=456#1');
    }));

// `merge` strategy
@Component({
  selector: 'someRoot',
  template:
    `<router-outlet></router-outlet><a routerLink="/home" [queryParams]="{removeMe: null, q: 456}" queryParamsHandling="merge">Link</a>`
})
class RootCmpWithLink {
}
TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
const router: Router = TestBed.inject(Router);
const fixture = createRoot(router, RootCmpWithLink);

router.resetConfig([{path: 'home', component: SimpleCmp}]);

const native = fixture.nativeElement.querySelector('a');

router.navigateByUrl('/home?a=123&removeMe=123');
advance(fixture);
expect(native.getAttribute('href')).toEqual('/home?a=123&q=456');
```

```ts
router.resetConfig([{
  path: 'team/:id',
  component: TeamCmp,
  children:
      [{path: 'link', component: RelativeLinkCmp}, {path: 'simple', component: SimpleCmp}]
}]);

router.navigateByUrl('/team/22/link');
advance(fixture);
expect(fixture.nativeElement).toHaveText('team 22 [ link, right:  ]');

const native = fixture.nativeElement.querySelector('a');
expect(native.getAttribute('href')).toEqual('/team/22/simple');
native.click();
advance(fixture);

expect(fixture.nativeElement).toHaveText('team 22 [ simple, right:  ]');
```

```ts
/* 
if the guard checks do not pass, the route navigation will simply return false and the current URL will remain intact

`this.resetUrlToCurrentUrlTree();`
*/
const fixture = createRoot(router, RootCmp);

router.resetConfig([
  {path: 'one', component: SimpleCmp},
  {path: 'two', component: SimpleCmp, canActivate: ['alwaysFalse']}
]);

router.navigateByUrl('/one');
advance(fixture);
expect(location.path()).toEqual('/one');

location.go('/two');
advance(fixture);
expect(location.path()).toEqual('/one');
```

```ts
/* 
if `canActivate` returns `false` -> redirect
*/
checkGuards(this.ngModule.injector, (evt: Event) => this.triggerEvent(evt)),
tap(t => {
  if (isUrlTree(t.guardsResult)) {
    const error: Error&{url?: UrlTree} = navigationCancelingError(
        `Redirecting to "${this.serializeUrl(t.guardsResult)}"`);
    error.url = t.guardsResult;
    throw error;
  }
})

/* ... */
if (isNavigationCancelingError(e)) { /* ... */ }

{
  provide: 'returnUrlTree',
  useFactory: (router: Router) => () => {
    return router.parseUrl('/redirected');
  },
  deps: [Router]
},
```

```ts
function configureRouter(router: Router, runGuardsAndResolvers: RunGuardsAndResolvers):
    ComponentFixture<RootCmpWithTwoOutlets> {
  const fixture = createRoot(router, RootCmpWithTwoOutlets);

  router.resetConfig([
    {
      path: 'a',
      runGuardsAndResolvers,
      component: RouteCmp,
      canActivate: ['guard'],
      resolve: {data: 'resolver'}
    },
    {path: 'b', component: SimpleCmp, outlet: 'right'}, {
      path: 'c/:param',
      runGuardsAndResolvers,
      component: RouteCmp,
      canActivate: ['guard'],
      resolve: {data: 'resolver'}
    },
    {
      path: 'd/:param',
      component: WrapperCmp,
      runGuardsAndResolvers,
      children: [
        {
          path: 'e/:param',
          component: SimpleCmp,
          canActivate: ['guard'],
          resolve: {data: 'resolver'},
        },
      ]
    }
  ]);

  router.navigateByUrl('/a');
  advance(fixture);
  return fixture;
}

export type RunGuardsAndResolvers =
    'pathParamsChange'|'pathParamsOrQueryParamsChange'|'paramsChange'|'paramsOrQueryParamsChange'|
    'always'|((from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean);

// `paramsChange` - matrix params changed (default)
 const fixture = configureRouter(router, 'paramsChange');

const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
const recordedData: any[] = [];
cmp.route.data.subscribe((data: any) => recordedData.push(data));

expect(guardRunCount).toEqual(1);
expect(recordedData).toEqual([{data: 0}]);

router.navigateByUrl('/a;p=1');
advance(fixture);
expect(guardRunCount).toEqual(2);
expect(recordedData).toEqual([{data: 0}, {data: 1}]);

router.navigateByUrl('/a;p=2');
advance(fixture);
expect(guardRunCount).toEqual(3);
expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);

// would've changed if `paramsOrQueryParamsChange`
router.navigateByUrl('/a;p=2?q=1');
advance(fixture);
expect(guardRunCount).toEqual(3);
expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);

// `pathParamsChange` - a/1 !== a/2
// Changing any optional params will not result in running guards or resolvers
router.navigateByUrl('/a;p=1');
advance(fixture);
expect(guardRunCount).toEqual(1);
expect(recordedData).toEqual([{data: 0}]);

router.navigateByUrl('/a;p=2');
advance(fixture);
expect(guardRunCount).toEqual(1);
expect(recordedData).toEqual([{data: 0}]);

// `pathParamsOrQueryParamsChange`
// Changing matrix params will not result in running guards or resolvers
router.navigateByUrl('/a;p=1');
advance(fixture);
expect(guardRunCount).toEqual(1);
expect(recordedData).toEqual([{data: 0}]);

router.navigateByUrl('/a;p=2');
advance(fixture);
expect(guardRunCount).toEqual(1);
expect(recordedData).toEqual([{data: 0}]);

// Adding query params will re-run guards/resolvers
router.navigateByUrl('/a;p=2?q=1');
advance(fixture);
expect(guardRunCount).toEqual(2);
expect(recordedData).toEqual([{data: 0}, {data: 1}]);

// `(from, to) => to.paramMap.get('p') === '2'` - a predicate fn
```

```ts
'a/:id' -> 'a/123;k1=v1;k2=v2' --> route.snapshot.paramsMap = { a, k1, k2 }
```

```ts
{
  provide: 'RecordingDeactivate',
  useValue: (c: any, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
    log.push({path: a.routeConfig!.path, component: c});
    return true;
  }
},

router.resetConfig([
  {
    path: 'grandparent',
    canDeactivate: ['RecordingDeactivate'],
    children: [{
      path: 'parent',
      canDeactivate: ['RecordingDeactivate'],
      children: [{
        path: 'child',
        canDeactivate: ['RecordingDeactivate'],
        children: [{
          path: 'simple',
          component: SimpleCmp,
          canDeactivate: ['RecordingDeactivate']
        }]
      }]
    }]
  },
  {path: 'simple', component: SimpleCmp}
]);

router.navigateByUrl('/grandparent/parent/child/simple');
advance(fixture);
expect(location.path()).toEqual('/grandparent/parent/child/simple');

router.navigateByUrl('/simple');
advance(fixture);

const child = fixture.debugElement.children[1].componentInstance;

expect(log.map((a: any) => a.path)).toEqual([
  'simple', 'child', 'parent', 'grandparent'
]);
```

```ts
// `CanActivateChild` is run **before** `CanActivate`
from([
  fireChildActivationStart(check.route.parent, forwardEvent),
  fireActivationStart(check.route, forwardEvent),
  runCanActivateChild(futureSnapshot, check.path, moduleInjector),
  runCanActivate(futureSnapshot, check.route, moduleInjector)
])
```

```ts
// Deactivate: from child to parent
// CanActivate: from parent to child (CanActivateChild called **before** CanActivate)
const fixture = createRoot(router, RootCmp);

router.resetConfig([{
  path: '',
  canActivateChild: ['canActivateChild_parent'],
  children: [{
    path: 'team/:id',
    canActivate: ['canActivate_team'],
    canDeactivate: ['canDeactivate_team'],
    component: TeamCmp
  }]
}]);

router.navigateByUrl('/team/22');
advance(fixture);

router.navigateByUrl('/team/33');
advance(fixture);

expect(logger.logs).toEqual([
  'canActivateChild_parent', 'canActivate_team',

  'canDeactivate_team', 'canActivateChild_parent', 'canActivate_team'
]);
```

---

## Testing practices

`expect(fixture.nativeElement).toHaveText('route');` (`export interface NgMatchers<T = any> extends jasmine.Matchers<T>`)

```ts
router.resetConfig([
  {path: '', component: SimpleCmp},
  {path: 'one', component: RouteCmp},
]);
```

```ts
it('case', inject([Router, Location]), (router, location) => {
  router.resetConfig(/* ... */);

  expect(location.path()).toBe(/* ... */)
});
```

```ts
router.navigateByUrl('/a', {replaceUrl: true});

tick(); // Since a route transition is an async operation
```

```ts
beforeEach(() => {
  warnings = [];
  TestBed.overrideProvider(Console, {useValue: new MockConsole()});
});
```

```ts
expect(() => router.navigate([
  undefined, 'query'
])).toThrowError(`The requested path contains undefined segment at index 0`);
```

```ts
router.resetConfig([{path: 'lazy', loadChildren: 'expected1'}]);

loader.stubbedModules = { expected1: LazyLoadedComp }
```

```ts
it('replaces URL when URL is updated eagerly so back button can still work',
  fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
    router.urlUpdateStrategy = 'eager';
    router.resetConfig([
      {path: '', component: SimpleCmp},
      {path: 'one', component: RouteCmp, canActivate: ['returnUrlTree']},
      {path: 'redirected', component: SimpleCmp}
    ]);
    const fixture = createRoot(router, RootCmp);
    router.navigateByUrl('/one');

    tick();

    expect(location.path()).toEqual('/redirected');

    // `LocationMock.urlChanges`
    // 'replace: /redirected' - because `urlUpdateStrategy` is set to `eager` (replaceUrl: this.urlUpdateStrategy === 'eager')
    expect(location.urlChanges).toEqual(['replace: /', '/one', 'replace: /redirected']);
  })));
```
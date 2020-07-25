# Demystifying angular/router: an in depth look at `RouterLink`, `RouterLinkActive` and `RouterOutlet` directives

<!-- INTRO -->

## RouterOutlet directive

* can be notified when the `router-outlet` is activated/deactivated
  ```ts
  @Output('activate') activateEvents = new EventEmitter<any>();
  @Output('deactivate') deactivateEvents = new EventEmitter<any>(); // You can receive the component here
  ```

  ```html
  <router-outlet (activate)="recordActivate($event)" (deactivate)="recordDeactivate($event)"></router-outlet>
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

  ```ts
  {
    path: 'foo',
    loadChildren: () => Promise.resolve({}),
    component: Foo,
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

* `RouterOutlet.activateWith`
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

## RouterLink directive

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

* relative to the `ActivatedRoute` of the route configuration where this component resides in

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



---

## RouterLinkWithHref directive

---

## RouterLinkActive directive

```ts
/* 
`RouterLinkActive`

* setting the class: `routerLinkActive='cls1 cls2'`; `[routerLinkActive]="['cls1', 'cls2']"`
* `routerLinkActiveOptions: { exact: true }`

* `exact = true` -> the link's UrlTree, that is crtUrlTree + commands applied(from `routerLink`), is contained _exactly_ by the current url tree
*/

// A class can be set based on these conditions:
// `this.link` - <button routerLink="/path" routerLinkActive="cls"></button>
// `this.linkWithHref` - <a routerLink="/path" routerLinkActive="cls"></a>
// `links` | `linksWithHrefs` -> @ContentChildren
return this.link && isActiveCheckFn(this.link) ||
        this.linkWithHref && isActiveCheckFn(this.linkWithHref) ||
        this.links.some(isActiveCheckFn) || this.linksWithHrefs.some(isActiveCheckFn);

// exposes an `isActive` property

// Example
@Component({
  selector: 'link-cmp',
  template: `<router-outlet></router-outlet>
             <div id="link-parent" routerLinkActive="active" [routerLinkActiveOptions]="{exact: exact}">
               <div ngClass="{one: 'true'}"><a [routerLink]="['./']">link</a></div>
             </div>`
})
class DummyLinkWithParentCmp {
  private exact: boolean;
  constructor(route: ActivatedRoute) {
    this.exact = (<any>route.snapshot.params).exact === 'true';
  }
}
it('should set the class on a parent element when the link is active',
    fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
      const fixture = createRoot(router, RootCmp);

      router.resetConfig([{
        path: 'team/:id',
        component: TeamCmp,
        children: [{
          path: 'link',
          component: DummyLinkWithParentCmp,
          children: [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]
        }]
      }]);

      router.navigateByUrl('/team/22/link;exact=true');
      advance(fixture);
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link;exact=true');

      const native = fixture.nativeElement.querySelector('#link-parent');
      expect(native.className).toEqual('active');

      router.navigateByUrl('/team/22/link/simple');
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link/simple');
      expect(native.className).toEqual('');
    })));
```
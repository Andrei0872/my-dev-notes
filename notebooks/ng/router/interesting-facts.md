# Demystifying angular/router: Revealing some interesting facts and features

## Relative vs Absolute Redirect

---

## router.navigate vs router.navigateByUrl

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

---

## How is the URL set in the browser?

`Router.setBrowserUrl`
```ts
// urlUploadingStrategy
// `eager` check
// beforePreactivation
// GUARDS
// afterPreactivation
// `deferred` check
```

---

## Passing state to a route transition

```ts
// `state` - available in `router.getCurrentNavigation().extras.state`
// `state` - will be stored in an history's item
// can be used, for example, to store the position of the current page, so that on `popstate` event
// that `state` will be available in the `NavigationStart`
router.navigateByUrl('/simple', {state: {foo: 'bar'}});
tick();
```

---

## `skipLocationChange` option

```ts
// `skipLocationChange === true` - do not call `router.setBrowserUrl`, which means that nothing will be added to the history stack
// but the router's internal status will be updated accordingly(e.g route params, query params, anything that can be `observed` from `ActivatedRoute`)
router.navigateByUrl('/team/33', {skipLocationChange: true});
```

---

## How are `ActivatedRoute`'s properties updated

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

---

## `paramsInheritanceStrategy` option

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
// `data`
// `paramsInheritanceStrategy`
// (!) could include such comparison in `features of angular/router`
 checkRecognize(
[{
  path: 'a',
  data: {one: 1},
  children: [{path: 'b', data: {two: 2}, component: ComponentB}]
}],
'a/b', (s: RouterStateSnapshot) => {
  const r: ActivatedRouteSnapshot =
      (s as any).firstChild(<any>(s as any).firstChild(s.root))!;
  // because the parent is a componentless route
  expect(r.data).toEqual({one: 1, two: 2});
});

// example where the parent is **not** a componentless route
// assuming `paramsInheritanceStrategy: 'empty'`
// if set on `always` - it will inherit from the parent as well
checkRecognize(
[{
  path: 'a',
  component: ComponentA,
  data: {one: 1},
  children: [{path: 'b', data: {two: 2}, component: ComponentB}]
}],
'a/b', (s: any /* RouterStateSnapshot */) => {
  const r: ActivatedRouteSnapshot = s.firstChild(<any>s.firstChild(s.root))!;
  expect(r.data).toEqual({two: 2});
});

// could also include this in `params` section
it('should inherit params', () => {
  checkRecognize(
      [{
        path: 'a',
        component: ComponentA,
        children:
            [{path: '', component: ComponentB, children: [{path: '', component: ComponentC}]}]
      }],
      '/a;p=1', (s: RouterStateSnapshot) => {
        checkActivatedRoute((s as any).firstChild(s.root)!, 'a', {p: '1'}, ComponentA);
        checkActivatedRoute(
            (s as any).firstChild((s as any).firstChild(s.root)!)!, '', {p: '1'}, ComponentB);
        checkActivatedRoute(
            (s as any).firstChild((s as any).firstChild((s as any).firstChild(s.root)!)!)!,
            '', {p: '1'}, ComponentC);
      });
});

checkRecognize(
[{
  path: 'p/:id',
  children: [{
    path: 'a/:name',
    children: [
      {path: 'b', component: ComponentB, children: [{path: 'c', component: ComponentC}]}
    ]
  }]
}],
'p/11/a/victor/b/c', (s: RouterStateSnapshot) => {
  const p = (s as any).firstChild(s.root)!;
  checkActivatedRoute(p, 'p/11', {id: '11'}, undefined!);

  const a = (s as any).firstChild(p)!;
  checkActivatedRoute(a, 'a/victor', {id: '11', name: 'victor'}, undefined!);

  const b = (s as any).firstChild(a)!;
  checkActivatedRoute(b, 'b', {id: '11', name: 'victor'}, ComponentB);

  const c = (s as any).firstChild(b)!;
  checkActivatedRoute(c, 'c', {}, ComponentC);
});
```

---

## `queryParamsHandling`

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

---

## What happens when a route transition fails ? 

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

---

## How to specify when guards and resolvers should run

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

---

## Positional params and _matrix_ params

* the last matched segment will have its **positional** params and **matrix** params **merged**

```ts
'a/:id' -> 'a/123;k1=v1;k2=v2' --> route.snapshot.paramsMap = { a, k1, k2 }
```
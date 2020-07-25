# Demystifying angular/router: from `router.navigate()` to a new view in the browser

`This is a fundamental property of the router: it only cares about its latest state.`: the big stream

## Guards

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


```ts
it('should match routes in the depth first order', () => {
  checkRecognize(
      [
        {path: 'a', component: ComponentA, children: [{path: ':id', component: ComponentB}]},
        {path: 'a/:id', component: ComponentC}
      ],
      'a/paramA', (s: RouterStateSnapshot) => {
        checkActivatedRoute(s.root, '', {}, RootComponent);
        checkActivatedRoute((s as any).firstChild(s.root)!, 'a', {}, ComponentA);
        checkActivatedRoute(
            (s as any).firstChild(<any>(s as any).firstChild(s.root))!, 'paramA', {id: 'paramA'},
            ComponentB);
      });

  checkRecognize(
      [{path: 'a', component: ComponentA}, {path: 'a/:id', component: ComponentC}], 'a/paramA',
      (s: RouterStateSnapshot) => {
        checkActivatedRoute(s.root, '', {}, RootComponent);
        checkActivatedRoute(
            (s as any).firstChild(s.root)!, 'a/paramA', {id: 'paramA'}, ComponentC);
      });
});

it('should work (nested case)', () => {
checkRecognize(
    [{path: '', component: ComponentA, children: [{path: '', component: ComponentB}]}], '',
    (s: RouterStateSnapshot) => {
      checkActivatedRoute((s as any).firstChild(s.root)!, '', {}, ComponentA);
      checkActivatedRoute(
          (s as any).firstChild(<any>(s as any).firstChild(s.root))!, '', {}, ComponentB);
    });
});

// compare this with the first snippet!
checkRecognize(
[
  {
    path: 'a',
    component: ComponentA,
    children: [
      {path: 'b', component: ComponentB}, {path: 'c', component: ComponentC, outlet: 'left'}
    ]
  },
],
'a/(b//left:c)', (s: RouterStateSnapshot) => {
  const c = (s as any).children(<any>(s as any).firstChild(s.root));
  checkActivatedRoute(c[0], 'b', {}, ComponentB, PRIMARY_OUTLET);
  checkActivatedRoute(c[1], 'c', {}, ComponentC, 'left');
});

// (!) matrix params (could compare with positional params)
// (!) could include such comparison in `features of angular/router`
checkRecognize(
[
  {path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]},
  {path: 'c', component: ComponentC, outlet: 'left'}
],
'a;a1=11;a2=22/b;b1=111;b2=222(left:c;c1=1111;c2=2222)', (s: RouterStateSnapshot) => {
  const c = (s as any).children(s.root);
  checkActivatedRoute(c[0], 'a', {a1: '11', a2: '22'}, ComponentA);
  checkActivatedRoute(
      (s as any).firstChild(<any>c[0])!, 'b', {b1: '111', b2: '222'}, ComponentB);
  checkActivatedRoute(c[1], 'c', {c1: '1111', c2: '2222'}, ComponentC, 'left');
});
```
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
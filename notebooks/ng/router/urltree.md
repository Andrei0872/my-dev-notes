# Demystifying angular/router: Getting to know UrlTree, ActivatedRouteSnapshot and ActivatedRoute

## What is UrlParser and why it is important

* (!) might also add the diff between `/()` and `()` (url_serializer.spec.ts)

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
console.log(r.parseUrl('/q/(a/(c//left:cp)//left:qp)(left:ap)'))
```

```ts
// when explaining `UrlTree` or `UrlParser`

checkRecognize(
  [
    {path: 'a', component: ComponentA}, {path: 'b', component: ComponentB, outlet: 'left'},
    {path: 'c', component: ComponentC, outlet: 'right'}
  ],
  'a(left:b//right:c)', (s: RouterStateSnapshot) => {
    const c = (s as any).children(s.root);
    checkActivatedRoute(c[0], 'a', {}, ComponentA);
    checkActivatedRoute(c[1], 'b', {}, ComponentB, 'left');
    checkActivatedRoute(c[2], 'c', {}, ComponentC, 'right');
  }
);

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

---

## UrlTree

* diff between this tree and the one created from `RouterState` or `RouterStateSnapshot`
  * in a `UrlTree` tree only outlets(named or `primary` by default) are considered children(child = `UrlSegmentGroup`)
  * in a `RouterStateSnapshot` tree, each matched path of a `Route` object determines a `RouterStateSnapshot` child

---

## When is UrlTree used

* based for `ActivatedRouteSnapshot`, which is base for `ActivatedRoute`
* when returned from a guard, it will result in a redirect operation
  ```ts
  /* 
  if `canActivate` returns `UrlTree` -> redirect
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
* when resolving the next `UrlTree` in `RouterLink` directive
* based on `UrlTree`s, the `RouterLinkActive` directive will apply the classes accordingly
* `Router.navigateByUrL()`
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
# Angular Testing Notebook

- [Angular Testing Notebook](#angular-testing-notebook)
  - [Practices](#practices)
    - [Testing the navigation to a lazy-loaded module](#testing-the-navigation-to-a-lazy-loaded-module)
    - [Other examples](#other-examples)
  - [Questions](#questions)

## Practices

### Testing the navigation to a lazy-loaded module

```ts
@NgModule({
  imports: [StoreModule.forRoot({})],
})
class FeatureModule {}

TestBed.configureTestingModule({
  imports: [StoreModule.forRoot({}), RouterTestingModule.withRoutes([])],
});

let router: Router = TestBed.get(Router);
const loader: SpyNgModuleFactoryLoader = TestBed.get(
  NgModuleFactoryLoader
);

loader.stubbedModules = { feature: FeatureModule };
router.resetConfig([{ path: 'feature-path', loadChildren: 'feature' }]);

router.navigateByUrl('/feature-path').catch((err: TypeError) => {
  expect(err.message).toBe(
    'StoreModule.forRoot() called twice. Feature modules should use StoreModule.forFeature() instead.'
  );
  done();
});
```

### Other examples


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

---

## Questions

* [1](#testing-the-navigation-to-a-lazy-loaded-module)
  * how do `router`/`loader` really work?

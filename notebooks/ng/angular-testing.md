# Angular Testing Notebook

- [Angular Testing Notebook](#angular-testing-notebook)
  - [Practices](#practices)
    - [Testing the navigation to a lazy-loaded module](#testing-the-navigation-to-a-lazy-loaded-module)
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

---

## Questions

* [1](#testing-the-navigation-to-a-lazy-loaded-module)
  * how do `router`/`loader` really work?

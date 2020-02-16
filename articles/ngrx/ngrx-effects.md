# @ngrx/effects

- [@ngrx/effects](#ngrxeffects)
  - [Setting up the effects](#setting-up-the-effects)
  - [`ofType`](#oftype)
  - [The `actions$` stream](#the-actions-stream)
  - [Connecting `ngrx/effects` with `ngrx/store`](#connecting-ngrxeffects-with-ngrxstore)
  - [Questions](#questions)

## Setting up the effects

```ts
@NgModule({})
export class EffectsRootModule {
  constructor(
    private sources: EffectSources,
    runner: EffectsRunner,
    store: Store<any>,
    @Inject(ROOT_EFFECTS) rootEffects: any[],
    @Optional() storeRootModule: StoreRootModule,
    @Optional() storeFeatureModule: StoreFeatureModule,
    @Optional()
    @Inject(_ROOT_EFFECTS_GUARD)
    guard: any
  ) {
    runner.start();

    rootEffects.forEach(effectSourceInstance =>
      sources.addEffects(effectSourceInstance)
    );

    store.dispatch({ type: ROOT_EFFECTS_INIT });
  }

  addEffects(effectSourceInstance: any) {
    this.sources.addEffects(effectSourceInstance);
  }
}
```

`@Optional() storeRootModule: StoreRootModule` and `@Optional() storeFeatureModule: StoreFeatureModule` will make sure that effects are initialized **after** the main store has been initialized. This is desirable as some effects classes might inject the `Store` entity and without proper initialization(i.e: reducers, action stream), it may lead to unexpected results. This _beforehand_ initialization includes:

* the creation of the **reducers object**: all the registered reducers, those from **feature modules** as well, will be merged into one big object that will be the shape of the app
* the `State` entity - where the app information is kept, also where the place actions _meet_ reducers, resulting in reducers being invoked, which may cause state changes
* the `Store` entity - the middleman between the data consumer(e.g: a smart component) and the model(the `State` entity)
* the `ScannedActionsSubject` - the **stream** that the **effects (indirectly) subscribe** to; more on this in [The `actions$` stream](#the-actions-stream).

---

## `ofType`

```ts
type A = { type: 'andrei' };
type J = { type: 'john' };
type JA = { type: 'jane' };

type Names = { type: 'andrei' | 'john' | 'jane' };

type JSub = J & { age: number };
type ASub = A & { city: string };

type R = Extract<ASub | JSub, A | JA | J>;
type R2 = Extract<ASub | JSub, Names>;

const o: R = { type: 'andrei', city: 'city', };
const o2: R2 = { type: 'john', age: 18 };
```

---

## The `actions$` stream

```ts
@Injectable()
export class Actions<V = Action> extends Observable<V> {
  constructor(@Inject(ScannedActionsSubject) source?: Observable<V>) {
    super();

    if (source) {
      this.source = source;
    }
  }

  lift<R>(operator: Operator<V, R>): Observable<R> {
    const observable = new Actions<R>();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
}
```

* why does the `lift` method exist ❓

`ScannedActionsSubject` comes from `@ngrx/store` and it is an observable that emits whenever actions are dispatched, but only after the state changes have been handled.  So, when an action is dispatched(`Store.dispatch()`), the `State` entity will first update the application state depending on that action and the current state

```ts
// State
/* ... */
const stateAndAction$: Observable<{
  state: any;
  action?: Action;
}> = withLatestReducer$.pipe(
  scan<[Action, ActionReducer<T, Action>], StateActionPair<T>>(
    reduceState,
    seed
  )
);

this.stateSubscription = stateAndAction$.subscribe(({ state, action }) => {
  this.next(state);
  scannedActions.next(action);
});
```

after which `ScannedActionsSubject` will emit the same action that will be _eventually intercepted_ by the effects.



---

## Connecting `ngrx/effects` with `ngrx/store`

---

## Questions

* what happens if an action is registered in both a reducer and an effect

* https://ngrx.io/guide/effects/lifecycle#resubscribe-on-error
  * how is the source effect automatically unsubscribed ? 😃

* https://ngrx.io/guide/effects/lifecycle#identify-effects-uniquely
  * when would that be useful?

* why sometimes unique effect classes are needed?
  ```ts
  function effectsInstance(sourceInstance: any) {
    if (isOnIdentifyEffects(sourceInstance)) {
      return sourceInstance.ngrxOnIdentifyEffects();
    }

    return '';
  }
  ```

* `export const rootEffectsInit = createAction(ROOT_EFFECTS_INIT);`
  * you can be informed when the effects have been initialized ? 

* re-subscribe on error 😃
  ```ts
    function resubscribeInCaseOfError<T extends Action>(
    observable$: Observable<T>,
    errorHandler?: ErrorHandler
  ): Observable<T> {
    return observable$.pipe(
      catchError(error => {
        if (errorHandler) errorHandler.handleError(error);
        // Return observable that produces this particular effect
        return resubscribeInCaseOfError(observable$, errorHandler);
      })
    );
  }
  ```

  the above is not recursion, meaning we won't get that stack-overflow error, because when an error occurs, the subscription is cancelled, but by returning `resubscribeInCaseOfError(observable$, errorHandler);` we re-subscribe to it! 

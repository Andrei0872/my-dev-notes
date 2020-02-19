# @ngrx/effects

- [@ngrx/effects](#ngrxeffects)
  - [Setting up the effects](#setting-up-the-effects)
    - [EffectSources](#effectsources)
  - [Creating an effect](#creating-an-effect)
  - [Lifecycle](#lifecycle)
  - [`ofType`](#oftype)
  - [The `actions$` stream](#the-actions-stream)
  - [Re-subscribing on error](#re-subscribing-on-error)
  - [Handling errors](#handling-errors)
  - [Connecting `ngrx/effects` with `ngrx/store`](#connecting-ngrxeffects-with-ngrxstore)
  - [Questions](#questions)

## Setting up the effects

* show how to provide effects
* explain how instances are created (the injected dependencies)

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


`runner.start()` will create a **subscription** to a **stream** resulted from the **merging** of all **registered effects**(more on this in the upcoming section). In other words, all the effects(e.g: those created by `createEffect`) will be merged into one **single observable** whose **emitted** values will be **actions**. 

```ts
// EffectsRunner

start() {
  if (!this.effectsSubscription) {
    this.effectsSubscription = this.effectSources
      .toActions()
      .subscribe(this.store);
  }
}
```

The stream's observer will be the `Store` entity, because it implements the `Observer` interface

```ts
export class Store<T = object> extends Observable<T>
  implements Observer<Action> {

    next(action: Action) {
      this.actionsObserver.next(action);
    }
  }
```

meaning that any **action resulted** from the **effects** will be intercepted by the `Store` which will in turn propagate it further so state changes can occur.

### EffectSources

It is the place where all the **registered effects** will be **merged** into **one observable** whose emitted values(**actions**) will be intercepted by the `Store` entity, which is responsible for dispatching them, so that the app state can be updated.

The _merging behavior_ can be achieved with `EffectSources.toActions()` from below:

```ts
export class EffectSources extends Subject<any> {
  constructor(
    /* ... */
    private store: Store<any>,
    /* ... */
  ) {
    super();
  }

  // Pushing an effect into the stream created by `toActions()`
  addEffects(effectSourceInstance: any): void {
    this.next(effectSourceInstance);
  }

  toActions(): Observable<Action> {
    return this.pipe(
      groupBy(getSourceForInstance),
      mergeMap(source$ => {
        return source$.pipe(groupBy(effectsInstance));
      }),
      mergeMap(source$ => {
        const effect$ = source$.pipe(
          exhaustMap(sourceInstance => {
            return resolveEffectSource(
              this.errorHandler,
              this.effectsErrorHandler
            )(sourceInstance);
          }),
          map(output => {
            reportInvalidActions(output, this.errorHandler);
            return output.notification;
          }),
          filter(
            (notification): notification is Notification<Action> =>
              notification.kind === 'N'
          ),
          dematerialize()
        );

        // start the stream with an INIT action
        // do this only for the first Effect instance
        const init$ = source$.pipe(
          take(1),
          filter(isOnInitEffects),
          map(instance => instance.ngrxOnInitEffects())
        );

        return merge(effect$, init$);
      })
    );
  }
}
```

Let's understand what it actually does by going through significant block:

* group the effects by their source(the instance's prototype)  
  As you know, `groupBy` will return an observable for each **new key** found. Then, if a value whose key is not new arrives, `groupBy` will use an existing observable and will push this new value through it.  
  The same thing happens here(`groupBy(getSourceForInstance)`), the key is the class that created this current instance, meaning that if there are 3 **distinct** effect classes, `groupBy` will emit 3 observables.
* group the instances(the effects) by their identifiers
  
  ```ts
  mergeMap(source$ => { // <- `source$` an observable that is resulted from the previous `groupBy`
    return source$.pipe(groupBy(effectsInstance));
  }),
  ```

  `mergeMap` is used because the first `groupBy` may emit multiple observables and the expected behavior is to handle all of them. Now, if the same effect class is loaded multiple times, **only one instance** will be used because these classes, by default, have the same identifier: 
  ```ts
  function effectsInstance(sourceInstance: any) {
    if (isOnIdentifyEffects(sourceInstance)) {
      return sourceInstance.ngrxOnIdentifyEffects();
    }

    return '';
  }
  ```
  This, alongside `groupBy(effectsInstance)` and eventually `exhaustMap`, will make sure that only the first instance is used.  
  For example, if we have `EffectsModule.forRoot([A, A, A])` and they have the same identifier(e.g: `''`), the second `groupBy` will emit only **one observable** with **3 items**.

  With the help of `exhaustMap`

  ```ts
  mergeMap(source$ => {
      const effect$ = source$.pipe(
        exhaustMap(sourceInstance => { /* ... */ }),
    }
  )
  ```

  only one item out of 3(the first `A`) will be taken into account.

  Internally, `exhaustMap` uses a flag(`hasSubscription`) to check whether there is an active inner subscription going on. You can inspect the relevant code [here](https://github.com/ReactiveX/rxjs/blob/master/src/internal/operators/exhaustMap.ts#L105-L122).

* merge all the effects into a single stream  
  
  ```ts
  mergeMap(source$ => {
    const effect$ = source$.pipe(
      exhaustMap(sourceInstance => {
        return resolveEffectSource(
          this.errorHandler,
          this.effectsErrorHandler
      )(sourceInstance);
    }),
    /* ... */
  )
  ```

  `resolveEffectSource` will merge all the existing properties(which are observables, possibly created by `createEffect()`) of the current instance:

  ```ts
    function resolveEffectSource(/* ... */): (sourceInstance: any) => Observable<EffectNotification> {
    return sourceInstance => {
      const mergedEffects$ = mergeEffects(
        sourceInstance,
        errorHandler,
        effectsErrorHandler
      );

      /* ... */

      return mergedEffects$;
    };
  }
  ```

  ```ts
  export function mergeEffects(
    sourceInstance: any,
    globalErrorHandler: ErrorHandler,
    effectsErrorHandler: EffectsErrorHandler
  ): Observable<EffectNotification> {
    const sourceName = getSourceForInstance(sourceInstance).constructor.name;

    // `getSourceMetadata(sourceInstance)` - getting all the effect class' properties
    const observables$: Observable<any>[] = getSourceMetadata(sourceInstance).map(
      ({
        propertyName,
        dispatch,
        useEffectsErrorHandler,
      }): Observable<EffectNotification> => {
        const observable$: Observable<any> =
          typeof sourceInstance[propertyName] === 'function'
            ? sourceInstance[propertyName]()
            : sourceInstance[propertyName];

        // Whether it should re-subscribe if errors occur
        const effectAction$ = useEffectsErrorHandler
          ? effectsErrorHandler(observable$, globalErrorHandler)
          : observable$;

        // You might not want the `Store` to intercept the action
        // and trigger state changes based on it
        if (dispatch === false) {
          return effectAction$.pipe(ignoreElements());
        }

        const materialized$ = effectAction$.pipe(materialize());

        return materialized$.pipe(
          map(
            (notification: Notification<Action>): EffectNotification => ({
              effect: sourceInstance[propertyName],
              notification,
              propertyName,
              sourceName,
              sourceInstance,
            })
          )
        );
      }
    );

    return merge(...observables$);
  }
  ```

  _A smaller example that reproduces this operation can be found [here](https://stackblitz.com/edit/typescript-fv3us6?file=index.ts)_.
  
  At this stage, after all the effect class' properties are merged into one observable, the `ngrxOnInitEffects` lifecycle will be called for each class:

  ```ts
   mergeMap(source$ => {
      const effect$ = source$.pipe(
        exhaustMap(/* ... */),
        /* ... */
      );

      // `source$`'s value an effect class
      const init$ = source$.pipe(
        // Make sure the `exhaustMap`'s behavior is `replicated`
        // as there is only one effect class per identifier!
        take(1),  
        filter(isOnInitEffects),
        map(instance => instance.ngrxOnInitEffects())
      );

      return merge(effect$, init$);
  })
  ```

The above process could be visualized as follows:

<div style="text-align: center;">
  <img src="https://raw.githubusercontent.com/Andrei0872/my-dev-notes/master/screenshots/articles/ngrx-effects/effects-set-up.png">
</div>

---

## Creating an effect

* `createEffect()`
* `getCreateEffectMetadata()`
* TS magic! 😃
  ```ts
  C extends EffectConfig,
  DT extends DispatchType<C>,
  OT extends ObservableType<DT, OT>,
  R extends Observable<OT> | ((...args: any[]) => Observable<OT>)
  ```

---

## Lifecycle

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

## Re-subscribing on error

* cover `materialize()` & `dematerialize()`
* you can provide custom error handlers 
* it has an attempt's limit
* what's the diff ❓
  ```ts
  createEffect(
    () => this.actions$.pipe(
      exhaustMap(
        userId => this.userService.fetchUser(userId).pipe(
          // catchError()
        )
      )
      /* catchError here */
    )
  )
  ```
* search the issue that cause the attempt's limit

---

## Handling errors

* you can provide a custom error handler

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

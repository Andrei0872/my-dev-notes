# @ngrx/effects

- [@ngrx/effects](#ngrxeffects)
  - [Setting up the effects](#setting-up-the-effects)
    - [Providing effects](#providing-effects)
    - [The effects stream](#the-effects-stream)
      - [EffectSources](#effectsources)
  - [Creating effects](#creating-effects)
    - [TypeScript's Magic](#typescripts-magic)
  - [The `actions$` stream](#the-actions-stream)
    - [`ofType`](#oftype)
  - [Connecting `ngrx/effects` with `ngrx/store`](#connecting-ngrxeffects-with-ngrxstore)
  - [Questions](#questions)

## Setting up the effects

### Providing effects

We can use either `EffectsModule.forRoot([effectClass])` or `EffectsModule.forFeature([effectClass])`. The former should be used **only once** as it will instantiate other essential services such as `EffectsRunner` or `EffectSources`.   
Once the effects(classes) are registered, in order to set them up, an observable will be created(with the help of `EffectSources`) an subscribed to(thanks to `EffectRunner`); we'll explore it in the next section.

The observable's emitted values will be the instances of those registered classes:

```ts
// EffectsModule.forRoot(rootEffects)
{
  return {
    ngModule: EffectsRootModule,
    providers: [
      {
        // Make sure the `forRoot` static method is called only once
        provide: _ROOT_EFFECTS_GUARD,
        useFactory: _provideForRootGuard,
        deps: [[EffectsRunner, new Optional(), new SkipSelf()]],
      },
      EffectsRunner,
      EffectSources,
      Actions,
      rootEffects, // The array of classes(effects)
      {
        // Instantiate the classes
        provide: ROOT_EFFECTS,
        deps: rootEffects,
        useFactory: createSourceInstances,
      },
    ],
  };
}
 
export function createSourceInstances(...instances: any[]) {
  return instances;
}
```

In this case, `EffectsRootModule` will inject `ROOT_EFFECTS` which will contain the needed instances and will push them into the _effects stream_:

```ts
@NgModule({})
export class EffectsRootModule {
  constructor(
    private sources: EffectSources,
    runner: EffectsRunner,
    store: Store<any>,
    @Inject(ROOT_EFFECTS) rootEffects: any[],
    /* ... */
  ) {
    // Subscribe to the `effects stream`
    runner.start();

    rootEffects.forEach(effectSourceInstance =>
      // Push values into the stream
      sources.addEffects(effectSourceInstance)
    );

    store.dispatch({ type: ROOT_EFFECTS_INIT });
  }

  addEffects(effectSourceInstance: any) {
    this.sources.addEffects(effectSourceInstance);
  }
}
```

The `EffectsFeatureModule`(returned from `EffectsModule.forFeature()`) follows the same approach:

```ts
@NgModule({})
export class EffectsFeatureModule {
  constructor(
    root: EffectsRootModule,
    @Inject(FEATURE_EFFECTS) effectSourceGroups: any[][],
    /* ... */
  ) {
    effectSourceGroups.forEach(group =>
      group.forEach(effectSourceInstance =>
        root.addEffects(effectSourceInstance)
      )
    );
  }
}
```

with a subtle difference, though. The `FEATURE_EFFECTS` is a `multi` provider token, which means that, when injected, it will contain an array of all provided values.

So, if you have: 

```ts
EffectsModule.forFeature([E1, E2]),
EffectsModule.forFeature([E3, E4])
```

`FEATURE_EFFECTS` will result in: `[[E1, E2], [E3, E4]]`.

### The effects stream

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

#### EffectSources

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

  `mergeMap` is used because the first `groupBy` may emit multiple observables and the expected behavior is to handle all of them. Now, if the same effect class is loaded multiple times, **only one instance** will be used because these classes, by default, have the same identifier(and there can be only **one class** **per identifier**): 
  
  ```ts
  function effectsInstance(sourceInstance: any) {
    if (isOnIdentifyEffects(sourceInstance)) {
      return sourceInstance.ngrxOnIdentifyEffects();
    }

    return '';
  }
  ```

  With `ngrxOnIdentifyEffects`(required by the `OnIdentityEffects` interface), we can specify a unique identifier for the class that contains the effects.

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

  `resolveEffectSource` will merge all the existing properties(which are observables, possibly created by `createEffect()`) of the current instance and will eventually call the `ngrxOnRunEffects` lifecycle method(required by the `OnRunEffects` interface):

  ```ts
    function resolveEffectSource(/* ... */): (sourceInstance: any) => Observable<EffectNotification> {
    return sourceInstance => {
      const mergedEffects$ = mergeEffects(
        sourceInstance,
        errorHandler,
        effectsErrorHandler
      );

      if (isOnRunEffects(sourceInstance)) {
        return sourceInstance.ngrxOnRunEffects(mergedEffects$);
      }

      return mergedEffects$;
    };
  }
  ```

  With `ngrxOnRunEffects` we can alter the **observable resulted** from **merging** all the **effects**(the instance's properties).

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
          map(/* ... */)
        );
      }
    );

    return merge(...observables$);
  }
  ```

  _A smaller example that reproduces the merging operation can be found [here](https://stackblitz.com/edit/typescript-fv3us6?file=index.ts)_.

  What `const materialized$ = effectAction$.pipe(materialize())` does it to make sure that if the re-resubscription on error does **not** occur, it will **suppress** any incoming **errors**.
  
  At this stage, after all the effect class' properties are merged into one observable, the `ngrxOnInitEffects` lifecycle method(required by the `OnInitEffects` interface) will be called for each class(if it exists) so that an **action** will be **dispatched** **immediately** and **once**:

  ```ts
   mergeMap(source$ => {
      const effect$ = source$.pipe(
        exhaustMap(/* ... */),
        /* ... */
      );

      // `source$`'s value is an effect class instance
      const init$ = source$.pipe(
        // `take(1)` -> make sure the `exhaustMap`'s behavior is `replicated`
        // as there is only one effect class per identifier!
        take(1),  
        filter(isOnInitEffects),
        // `instance.ngrxOnInitEffects()` -> Action
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

## Creating effects

Creating an **effect** can be achieved with the `createEffect()` function:

```ts
type DispatchType<T> = T extends { dispatch: infer U } ? U : true;
type ObservableType<T, OriginalType> = T extends false ? OriginalType : Action;

export function createEffect<
  C extends EffectConfig,
  DT extends DispatchType<C>,
  OT extends ObservableType<DT, OT>,
  R extends Observable<OT> | ((...args: any[]) => Observable<OT>)
>(source: () => R, config?: Partial<C>): R & CreateEffectMetadata {
  const effect = source();
  const value: EffectConfig = {
    ...DEFAULT_EFFECT_CONFIG,
    ...config, // Overrides any defaults if values are provided
  };
  Object.defineProperty(effect, CREATE_EFFECT_METADATA_KEY, {
    value,
  });
  return effect as typeof effect & CreateEffectMetadata;
}
```

`createEffect()` will return an **observable** with a property `CREATE_EFFECT_METADATA_KEY` attached to it which will hold the configuration object for that particular effect. When the merging of the effect's class properties into one observable takes place, each observable(property of that effect class) will be slightly altered, depending on the configuration. This object can have 2 properties:

* `dispatch: boolean` - whether the resulting action should be dispatched to the store;  
  ```ts
  const observable$: Observable<any> =
    typeof sourceInstance[propertyName] === 'function'
      ? sourceInstance[propertyName]()
      : sourceInstance[propertyName];

  const effectAction$ = useEffectsErrorHandler
    ? effectsErrorHandler(observable$, globalErrorHandler)
    : observable$;

  if (dispatch === false) {
    return effectAction$.pipe(ignoreElements());
  }
  ```

  The `ignoreElements` operator will ignore everything, **except error** or **complete** notifications.

* `useEffectsErrorHandler: boolean` - whether effect's errors(e.g: due to external API calls) should be handled;  
  
  ```ts
  const observable$: Observable<any> =
    typeof sourceInstance[propertyName] === 'function'
      ? sourceInstance[propertyName]()
      : sourceInstance[propertyName];

  const effectAction$ = useEffectsErrorHandler
    ? effectsErrorHandler(observable$, globalErrorHandler)
    : observable$;
  ```

  `effectsErrorHandler` maps to a value provided by the `EFFECTS_ERROR_HANDLER`. By default, it maps to `defaultEffectsErrorHandler`(the built-in error handler for effects):

  ```ts
  export function defaultEffectsErrorHandler<T extends Action>(
    observable$: Observable<T>,
    errorHandler: ErrorHandler,
    retryAttemptLeft: number = MAX_NUMBER_OF_RETRY_ATTEMPTS
  ): Observable<T> {
    return observable$.pipe(
      catchError(error => {
        if (errorHandler) errorHandler.handleError(error);
        if (retryAttemptLeft <= 1) {
          return observable$; // last attempt
        }
        // Return observable that produces this particular effect
        return defaultEffectsErrorHandler(
          observable$,
          errorHandler,
          retryAttemptLeft - 1
        );
      })
    );
  }
  ```

  _If you'd like to know why there must a limit regarding the number of retries, [here's](https://github.com/ngrx/platform/issues/2303) the issue where this topic is addressed_.

  When an error occurs, the observable will be unsubscribed from. What `defaultEffectsErrorHandler` does is to allow us to re-subscribe to the _just-unsubscribed_ observable as long as the maximum number of allowed attempts is not exceeded. 

  For instance, if you have this effect:
  
  ```ts
  addUser$ = createEffect(
    () => this.actions$.pipe(
      ofType(UserAction.add),
      exhaustMap(u => this.userService.add(u)),
      map(/* Map to action */)
    ),
  )
  ```

  If an error occurs due to calling `userService.add()` and it is not handled anywhere, like:

  ```ts
  // `this.userService.add(u)` is a cold observable
  exhaustMap(u => this.userService.add(u).pipe(catchError(err => /* Action */))),
  ```

  `addUser$` will unsubscribe from the `actions$` stream. `defaultEffectsErrorHandler` will simply re-subscribe to `actions$`, but there's another thing that's worth mentioning: the `actions$` stream is actually a `Subject` so we know for sure that when re-subscribed, we won't receive any of the previously emitted values, only the newer ones. _You can read more about the action stream [here](#the-actions-stream)_.

  You can also provide custom error handlers for effects:

  ```ts
  {
    provide: EFFECTS_ERROR_HANDLER,
    useValue: yourErrorHandler,
  },
  ```

  where `yourErrorHandler` should be a function that accepts an `observable$`(the observable built on top of the `action$` observable) and an `errHandler` object.


### TypeScript's Magic

Consider this effect:

```ts
addUser$ = createEffect(
  () => this.actions$.pipe(/* ... */),
)
```

If you hover over `addUser$`, its type should be: `Observable<Action> & CreateEffectMetadata`. `CreateEffectMetadata` is a way to identify a property created by `createEffect()`. It is particularly useful when the properties are merged into one single observable.

Before revealing why `Observable<Action>` is there, try writing the same effect, but this time specifying the `dispatch: false` in the config object:

```ts
addUser$ = createEffect(
  () => of(1),
  { dispatch: false }
)
```

`addUser$`'s type will be `Observable<number> & CreateEffectMetadata`.

But if we have:

```ts
addUser$ = createEffect(
  () => of(1),
  // { dispatch: false }
)
```

we'd get: `Type 'number' is not assignable to type 'Action'`. What this means is the the `dispatch` property has an **influence** on the **effect's type**.

Let's see how this can be achieved:

```ts
type DispatchType<T> = T extends { dispatch: infer U } ? U : true;
type ObservableType<T, OriginalType> = T extends false ? OriginalType : Action;

export function createEffect<
  C extends EffectConfig, // { dispatch?: boolean, useEffectsErrorHandler?: boolean; }
  DT extends DispatchType<C>, // U(undefined | boolean) || true
  OT extends ObservableType<DT, OT>, // If `DT` is false(`dispatch` explicitly set to `false`), use the original type
  R extends Observable<OT> | ((...args: any[]) => Observable<OT>) // Use `OT` to infer the Observable's type
>(source: () => R, config?: Partial<C>) { }
```

With this in mind, in the second snippet we have(reading backwards):

* `R` - `Observable<number>`
* `OT` - initially is of type `number`
* `DT` - `false` as `dispatch` is explicitly set to `false`
* `OT extends ObservableType<DT, OT>` determines the _final type_ of `OT`: `false extends false ? number : Action` -> we're getting `number`

In the third snippet, `OT extends ObservableType<DT, OT>` can be seen as `undefined extends false ? number : Action`. So, the `OT`'s type will be `Action`, and we're getting the error because `addUser$`'s type is `Observable<number>`, when it should've been `Observable<Action>`.

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

`ScannedActionsSubject` comes from `@ngrx/store` and it is a `Subject`(thus, an `Observable`) that emits whenever actions are dispatched, but only **after** the **state changes** have been **handled**.
So, when an action is dispatched(`Store.dispatch()`), the `State` entity will first update the application state depending on that action and the current state, with the help of the reducers and then it will push that `action` into an **actions stream**, created by `ScannedActionsSubject`. 

```ts
// State
/* ... */
const stateAndAction$: Observable<{
  state: any;
  action?: Action;
}> = withLatestReducer$.pipe(
  scan<[Action, ActionReducer<T, Action>], StateActionPair<T>>(
    reduceState, // Handling state changes
    seed
  )
);

this.stateSubscription = stateAndAction$.subscribe(({ state, action }) => {
  this.next(state); // `state` -> the new state, after reducers have been invoked 
  scannedActions.next(action);
});
```

after `ScannedActionsSubject` emits, that same action will be _eventually intercepted_ by the effects.

### `ofType`

In order to determine which actions should trigger which effects, the `ofType` custom operator is used:

```ts
export function ofType(
  ...allowedTypes: Array<string | ActionCreator<string, Creator>>
): OperatorFunction<Action, Action> {
  return filter((action: Action) =>
    allowedTypes.some(typeOrActionCreator => {
      if (typeof typeOrActionCreator === 'string') {
        // Comparing the string to type
        return typeOrActionCreator === action.type;
      }

      // We are filtering by ActionCreator
      return typeOrActionCreator.type === action.type;
    })
  );
}
```

As you can use, it internally uses the RxJs `filter` operator, whose predicate function's return value depends on whether the current emitted action is among the values provided to `ofType` or not.

What's indeed fascinating here is how **TypeScript's power** is leveraged.

When it comes to `ofType`'s type inference, there are 2 possibilities:

* you can provide actions created by `createAction`, which comply with `ActionCreator` type;  
  
  ```ts
  export type ActionCreator<
    T extends string = string,
    C extends Creator = Creator // `Creator` -> a function that returns an object
  > = C & TypedAction<T>;
  ```

  By using `ofType(action1, action2, ...)`, its return type will be a union comprised of the return types of `action1` and `action2`:
  
  ```ts
  export function ofType<
    AC extends ActionCreator<string, Creator>[],
    U extends Action = Action,
    V = ReturnType<AC[number]>

    // `U` - the type of the incoming observable
    // `V` - the type of the returned observable
  >(...allowedTypes: AC): OperatorFunction<U, V>;
  ```

  What we're particularly interested in is the `V = ReturnType<AC[number]>` part. `AC` is an array of `ActionCreator`(results of `createAction`).  
  `AC[number]` will return a union of all the `AC`'s elements. For example:

  ```ts
  type Action<T extends string = string> = { readonly type: T; }

  function createAction<P extends object, T extends string>(t: T, payload: P): P & Action<T> {
    return {
      ...payload,
      type: t,
    };
  }

  const actions = [createAction('type1', { name: 'andrei' }), createAction('type2', { age: 123 })];

  // `(typeof actions)[number]` -> a union of types
  const action: (typeof actions)[number] = {
    // We can discriminate unions with the help of the `type` property
    // because `createAction` returns an object with one `readonly` property,
    // namely `type`
    type: 'type2',
    age: 123,
    // name: '123' -> 🔥 error
  }
  ```

  Similarly, the union resulted from `AC[number]` can be **discriminated** with the `type` property.

  Next, we have `ReturnType<Union>`. which is the same as `ReturnType<Union_M1 | Union_M2 | ...>`. What it does it to determine the return type of the action, which is what will eventually come from the stream.

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

## Connecting `ngrx/effects` with `ngrx/store`

---

## Questions

* what happens if an action is registered in both a reducer and an effect

* https://ngrx.io/guide/effects/lifecycle#resubscribe-on-error
  * how is the source effect automatically unsubscribed ? 😃

* https://ngrx.io/guide/effects/lifecycle#identify-effects-uniquely
  * when would that be useful?

* `export const rootEffectsInit = createAction(ROOT_EFFECTS_INIT);`
  * you can be informed when the effects have been initialized ? 

* worth reading
  * https://github.com/ngrx/platform/pull/1822
  * https://github.com/ngrx/platform/issues/1826

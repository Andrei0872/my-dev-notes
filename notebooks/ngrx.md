# NgRx Notebook

## Store

* composed of **slices** ❓

---

## Actions

* instructions for reducers
* dispatched from components & services
* events    
* must be descriptive

* write actions before writing the feature so you can get a better understanding of what it is going to happen

### Creating actions

```ts
const action = createAction('[Entity] simple action');
action();
```

```ts
const action = createAction('[Entity] simple action', props<{ name: string, age: number, }>());
action({ name: 'andrei', age: 18 });
```

```ts
const action = createAction('[Entity] simple action', (u: User) => u.response);
const u: User = { /* ... */ };
action(u);
```

In each case, the return value of the function will be an **object** that will contain at least this property: `{ type: T }`.

Also, the **type**(first argument) will be attached as property to the function. This is useful when reducers are created(TODO:(link)).

```ts
return Object.defineProperty(creator, 'type', {
  value: type,
  writable: false,
});
```

```ts
export declare interface TypedAction<T extends string> extends Action {
  readonly type: T;
}

export function createAction<T extends string>(
  type: T
): ActionCreator<T, () => TypedAction<T>>;
export function createAction<T extends string, P extends object>(
  type: T,
  config: Props<P> & NotAllowedCheck<P>
): ActionCreator<T, (props: P & NotAllowedCheck<P>) => P & TypedAction<T>>;
export function createAction<
  T extends string,
  P extends any[],
  R extends object
>(
  type: T,
  creator: Creator<P, R> & NotAllowedCheck<R>
): FunctionWithParametersType<P, R & TypedAction<T>> & TypedAction<T>;
```

---

## Reducers

### Providing reducers

Reducers can be provided with:

* an object whose values are reducers created with the help of `createReducer`
  ```ts
  StoreModule.forRoot({ foo: fooReducer, user: UserReducer })
  ```
* an injection token
  ```ts
  const REDUCERS_TOKEN = new InjectionToken('REDUCERS');

  @NgModule({
    imports: [
      StoreModule.forRoot(REDUCERS_TOKEN)
    ],
    providers: [
      { provide: REDUCERS_TOKEN, useValue: { foo: fooReducer } }
    ],
  }) /* ... */
  ```

### How are reducers set up?

Let's assume reducers are provided this way:

```ts
StoreModule.forRoot({ entity: entityReducer })
```

`StoreModule.forRoot` will return a `ModuleWithProviders` object which contains, among others, these providers:

```ts
/* ... */
{
  provide: _REDUCER_FACTORY,
  useValue: config.reducerFactory
    ? config.reducerFactory
    : combineReducers,
},
{
  provide: REDUCER_FACTORY,
  deps: [_REDUCER_FACTORY, _RESOLVED_META_REDUCERS],
  useFactory: createReducerFactory,
},
/* ... */
```

As you can see, unless you provide a **custom reducer factory**, the `combineReducers` function will be used instead(we'll have a look at it in a moment).
`createReducerFactory` is mainly used to add the **meta reducers**(TODO:(link)).


The `REDUCER_FACTORY` token will only be injected in `ReducerManager` class:

```ts
export class ReducerManager /* ... */ {
  constructor(
    @Inject(INITIAL_STATE) private initialState: any,
    @Inject(INITIAL_REDUCERS) private reducers: ActionReducerMap<any, any>,
    @Inject(REDUCER_FACTORY)
    private reducerFactory: ActionReducerFactory<any, any>
  ) {
    super(reducerFactory(reducers, initialState));
  }
  /* ... */
}
```

As soon as that happens, the `createReducerFactory` function will be invoked, meaning that `reducerFactory` property will hold its **return value**:

```ts
export function createReducerFactory<T, V extends Action = Action>(
  reducerFactory: ActionReducerFactory<T, V>,
  metaReducers?: MetaReducer<T, V>[]
): ActionReducerFactory<T, V> {
  if (Array.isArray(metaReducers) && metaReducers.length > 0) {
    (reducerFactory as any) = compose.apply(null, [
      ...metaReducers,
      reducerFactory,
    ]);
  }

  // `ReducerManager.reducerFactory` will hold this function! - it is immediately invoked in the constructor
  return (reducers: ActionReducerMap<T, V>, initialState?: InitialState<T>) => {
    const reducer = reducerFactory(reducers); // `reducerFactory` = `combineReducer`
    return (state: T | undefined, action: V) => {
      // This function is the value resulted from `super(reducerFactory(reducers, initialState));` - `reducerFactory` belongs to `ReducerManager`
      state = state === undefined ? (initialState as T) : state;
      return reducer(state, action);
    };
  };
}
```

Remember that `reducerFactory` holds the `combineReducer`'s value. It is immediately invoked in the constructor: `super(reducerFactory(reducers, initialState));`

```ts
export function combineReducers(
  reducers: any,
  initialState: any = {}
): ActionReducer<any, Action> {
  const reducerKeys = Object.keys(reducers);
  const finalReducers: any = {};

  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  /* 
  Remember from the previous snippet: `const reducer = reducerFactory(reducers)`
  Now, the `reducer` will be the below function
  */
  return function combination(state, action) {
    state = state === undefined ? initialState : state;
    let hasChanged = false;
    const nextState: any = {};
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer: any = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
```

Additionally, we can see in the above snippet why the **stored data** must be **immutable**. If a reducer would return the same reference of an object, but with a property changed, this would not be reflected into the UI as `nextStateForKey !== previousStateForKey` would fail.

The gist resides in this snippet:

```ts
/* ... */
return (reducers: ActionReducerMap<T, V>, initialState?: InitialState<T>) => { // #Fn1
  const reducer = reducerFactory(reducers);
  return (state: T | undefined, action: V) => { // #Fn2
    state = state === undefined ? (initialState as T) : state;
    return reducer(state, action); // `reducer` = `combination`
  };
};
```

(`reducerFactory` = `combineReducers`) will create an object of _sanitized_ reducers.

In `const reducer = reducerFactory(reducers);`, the `reducer` will act on behalf of `combination` function. When invoked, it will iterate over the reducers and invoke them with the given `state` and `action`.

The function in which `reducer` is invoked will be called every time an **action** is **dispatched**, meaning that the reducers will be combined(on `Fn1` call) once
Of course, if other reducers are added later, the reducer object will be re-sanitized(`Fn1` called again).

If you want to visualize the above process you can open this [ng-run](#https://ng-run.com/edit/ufX1KYcBMOmV0sp78k7A?open=app%2Fapp.module.ts) and follow these steps:

* open dev tools + `CTRL + P` + type `utils.ts`
* put breakpoints on these lines: 18, 31, 95, 103, 106
* refresh
* keep an eye on the `Call Stack` tab

* you might be missing the old class syntax that was used to define actions; with the new API, this is automatically handled for you;

  ```ts
  export interface On<S> {
    reducer: ActionReducer<S>;
    types: string[];
  }

  // Specialized Reducer that is aware of the Action type it needs to handle
  export interface OnReducer<S, C extends ActionCreator[]> {
    (state: S, action: ActionType<C[number]>): S;
  }

  export type ActionType<A> = A extends ActionCreator<infer T, infer C>
    ? ReturnType<C> & { type: T }
    : never;
  ```

  ```ts
  interface Action {
    readonly type: string;
  }

  interface A1 {
    type: 'a1',
    name: string;
  }

  interface A2 {
    type: 'a2',
    age: number;
  }

  type GetUnion<A extends Action[]> = A[number];

  type Union = GetUnion<[A1, A2]>;

  const o: Union = {
    type: 'a1',
    name: 'andrei'
  }
  ```


### `createReducer`

It receives 2 arguments: the `initialState` and an indefinite number of `on` functions whose type will depend on the type of `initialState`.

The `on` functions are an alternative for using the good old `switch` statement.
An `on` function can receive multiple **action creators**(results of `createAction`(TODO:(link))) and the **actual reducer** as the last argument.  
It will return an object `{ types: string[], reducer: ActionReducer<S> }`, where types is the type of each provided action creator and **reducer** is a **pure function** which handles state changes based on the action and has this signature: `(state: T | undefined, action: V): T;`.

```ts
export interface On<S> {
  reducer: ActionReducer<S>;
  types: string[];
}

export interface OnReducer<S, C extends ActionCreator[]> {
  (state: S, action: ActionType<C[number]>): S; // `ActionType` - Will infer the return type of the action
}

export function on<C1 extends ActionCreator, S>(
  creator1: C1,
  reducer: OnReducer<S, [C1]>
): On<S>;
/* ... Overloads ... */
export function on(
  ...args: (ActionCreator | Function)[]
): { reducer: Function; types: string[] } {
  const reducer = args.pop() as Function;
  const types = args.reduce(
    (result, creator) => [...result, (creator as ActionCreator).type],
    [] as string[]
  );
  return { reducer, types };
}
```

❓ multiple action creators - discriminated unions - better types

The `createReducer` function will create a **private** `Map<string, ActionReducer<S, A>>` object, where the **key** is the `type` of the action, and the **value** is the **reducer**.
It will also return a **function** whose **arguments** will be a given **state** and an **action**. Because it is a closure, it has access to the `Map` object.

This function will be invoked every time when an action is dispatched and what will do is to get the **reducer** **based on** the **action type**. Then, if the reducer is found, it will be called and will potentially return a new state.

```ts
export interface ActionReducer<T, V extends Action = Action> {
  (state: T | undefined, action: V): T;
}

export function createReducer<S, A extends Action = Action>(
initialState: S,
...ons: On<S>[]
): ActionReducer<S, A> {
  const map = new Map<string, ActionReducer<S, A>>();
  for (let on of ons) {
    for (let type of on.types) {
      if (map.has(type)) {
        const existingReducer = map.get(type) as ActionReducer<S, A>;
        const newReducer: ActionReducer<S, A> = (state, action) =>
          on.reducer(existingReducer(state, action), action);
        map.set(type, newReducer);
      } else {
        map.set(type, on.reducer);
      }
    }
  }

  return function(state: S = initialState, action: A): S {
    // This is the body of `_counterReducer` function from below
    const reducer = map.get(action.type);
    return reducer ? reducer(state, action) : state;
  };
}
```

For instance, the `Map` object for the following `createReducer` reducer

```ts
const increment = createAction('increment');
const decrement = createAction('decrement');
const reset = createAction('reset');

const _counterReducer = createReducer(initialState,
  on(increment, state => state + 1 /* reducer#1 */),
  on(decrement, state => state - 1 /* reducer#2 */),
  on(reset, state => 0 /* reducer#3 */),
);

export function counterReducer(state, action) {
  return _counterReducer(state, action);
}
```

will look like this:

```ts
{
  key: "increment"
  value: ƒ (state) // reducer#1
},
{
  key: "decrement"
  value: ƒ (state) // reducer#2
},
{
  key: "reset"
  value: ƒ (state) // reducer#3
}
```

❓ Where is the closure called from?
❓ what happens when multiple actions are set to multiple reducers, in the same `createReducer()` ?

### How are the types of the reducer inferred ?

* `OnReducer`
* depends on `ActionCreator`


❓ custom reducer factory

---

## Store

```ts
export class Store<T> extends Observable<T> implements Observer<Action> {
  constructor(
    state$: StateObservable,
    private actionsObserver: ActionsSubject,
    private reducerManager: ReducerManager
  ) {
    super();

    this.source = state$;
  }
  
  /* ... */
}
```

From the above snippet we can tell that the `Store` class is a **hot observable** because its emitted data comes from outside, namely `state$`.
This means that every time the `source`(`state$`) emits, the `Store` class will send the value to its subscribers. _You can find a simplified example [here](https://stackblitz.com/edit/manual-set-source?file=index.ts)_.

It is worth noting the presence of `ActionsSubject`, with which we are able to **push** values in the **action stream** whenever the `Store.dispatch` is called.

```ts
dispatch<V extends Action = Action>(
  action: V /* ... type check here - skipped for brevity ... */
) {
  this.actionsObserver.next(action);
}
```

You can think of this `Store` class as a **dispatcher**, because it can dispatch actions with `Store.dispatch(action)`, but you can also think of it as a **data receiver**, because you can be notified about changes in the state is by subscribing to a `Store` instance(`Store.subscribe()`).

```
allows consumer ↔️ state communication
        ⬆️
        |
        |
-----------      newState          -----------                         
|         | <-------------------   |         |                         
|         |  Store.source=$state   |         |
|         |                        |         | <---- where the data is stored
|  Store  |      Action            |  State  |                         
|         | -------------------->  |         |
|         |   Store.dispatch()     |         |          
-----------                        ----------- 
                                   |        ⬆️
                          Action   |        | newState
                                   |        |
                                   ⬇️        |
                                  ------------- 
                                  |           | 
                                  |  Reducer  | <---- handle state changes
                                  |           | 
                                  ------------- 
```

So, the `State` class is the place where _actions meet reducers_, where the **reducers** are **called** with the **existing state** and based on the action, it will generate and emit a new state through the `Store`(because the `Store`'s source is the `State` itself).

```ts
export class State<T> extends BehaviorSubject<any> implements OnDestroy {
  constructor(
    actions$: ActionsSubject,
    reducer$: ReducerObservable,
    scannedActions: ScannedActionsSubject,
    @Inject(INITIAL_STATE) initialState: any
  ) { 
    /* ... */ 

    this.stateSubscription = stateAndAction$.subscribe(({ state, action }) => {
      this.next(state); // Emitting the new state
      scannedActions.next(action);
    });
  }
  /* ... */
}
```
I'd see the `Store` class as some sort of middleman between the `Model`(the place where the data is actually stored) and the `Data Consumer`:

`Data Consumer` -> `Model`: `Store.dispatch()` 
`Model` -> `Data Consumer`: `Store.subscribe()`

As a side note, `Store` can not only be used as an **observable**, but also as an **observer**.

```ts
next(action: Action) {
  this.actionsObserver.next(action);
}

error(err: any) {
  this.actionsObserver.error(err);
}

complete() {
  this.actionsObserver.complete();
}
```

This might come handy when you can't know which action and when you'll want to dispatch.

```ts
const actions$ = of(FooActions.add({ age: 18, name: 'andrei' }));

actions$.subscribe(this.store)
```

### Selecting from the Store

We can use `Store.select` method:

```ts
export class Store<T> /* ... */ {
  select<Props = any, K = any>(
    pathOrMapFn: ((state: T, props?: Props) => K) | string,
    ...paths: string[]
  ): Observable<any> {
    return (select as any).call(null, pathOrMapFn, ...paths)(this);
  }
}

export function select<T, Props, K>(
  pathOrMapFn: ((state: T, props?: Props) => any) | string,
  propsOrPath?: Props | string,
  ...paths: string[]
) {
  return function selectOperator(source$: Observable<T>): Observable<K> {
    let mapped$: Observable<any>;

    /* ... Important logic here ... */

    return mapped$.pipe(distinctUntilChanged());
  };
}
```
`Store.select` will return an **observable** whose emitted values depend on the arguments passed to the `select` function.
The **select function** is exported for a reason. Find out why in [Using custom selectors](#using-custom-selectors).

Assuming you have have a state that complies with this interface:

```ts
interface AppState { foo: Foo; }

interface Foo {
  fooUsers: User[];
  prop1: string;
  prop2: number;
}

interface User { name: string; age: number; }
```

you'd inject the store like this: 

```ts
export class SmartComponent {
  constructor (private store: Store<AppState>) { }
}
```

There are a few ways to fetch data from the store. 

1) Providing the **path** of the slice we're interested in with the help of a **sequence** of **string** values

  ```ts
  this.store.select('foo', 'fooUsers', /* ... */)
    .subscribe(console.log)
  ```

  This approach is **not** that error-prone as you might expect, and this is due to the multiple **overloads** the `select` function is filled up with.
  
  ```ts
  export function select<
    T,
    a extends keyof T,
    b extends keyof T[a],
    c extends keyof T[a][b],
    d extends keyof T[a][b][c],
    e extends keyof T[a][b][c][d]
  >(
    key1: a,
    key2: b,
    key3: c,
    key4: d,
    key5: e
  ): (source$: Observable<T>) => Observable<T[a][b][c][d][e]>;
  ```

  where `T` is the generic type parameter passed into `Store`: `export class Store<T> extends Observable<T>`. In this case, it's `AppState`.
  `foo` must be a key of `AppState`(the `T`), `fooUsers` must be a key of `AppState['foo']` and so forth...

  Under the hood the mapping is done with the help of the `pluck` operator, which provides a declarative way to **select properties** from objects:

  ```ts
  export function select<T, Props, K>(
    pathOrMapFn: ((state: T, props?: Props) => any) | string,
    propsOrPath?: Props | string,
    ...paths: string[]
  ) {
    return function selectOperator(source$: Observable<T>): Observable<K> {
      let mapped$: Observable<any>;
      
      if (typeof pathOrMapFn === 'string') {
        const pathSlices = [<string>propsOrPath, ...paths].filter(Boolean);
        mapped$ = source$.pipe(pluck(pathOrMapFn, ...pathSlices));
      } 
      
      /* ... */
    }
  }
  ```

2) Provide a custom function that will do the mapping
  
  ```ts
  export function select<T, Props, K>(
    mapFn: (state: T, props: Props) => K,
    props?: Props
  ): (source$: Observable<T>) => Observable<K>;
  ```

  This is similar to the previous approach, but instead of listing the properties, you provide a function and optionally another argument(`props`), based on which you'll do the mapping yourself. `props` may contain some data that is **not part of the store** and you can use it to alter the shape of the state.

  ```ts
  this.store.select(
    (state, props) => {
      return `${props.prefix}${state.foo.prop1}${props.suffix}` 
    },
    { suffix: '_____', prefix: '@@@@@@' }
  )
  .subscribe(console.log)
  ```

  This is achieved with the `map` operator:

  ```ts
  export function select<T, Props, K>(
    pathOrMapFn: ((state: T, props?: Props) => any) | string,
    propsOrPath?: Props | string,
    ...paths: string[]
  ) {
    return function selectOperator(source$: Observable<T>): Observable<K> {
      let mapped$: Observable<any>;

      /* ... */

      if (typeof pathOrMapFn === 'function') {
        mapped$ = source$.pipe(
          map(source => pathOrMapFn(source, <Props>propsOrPath))
        );
      }

      /* ... */
    };
  }
  ```

  Another great benefit of this approach is that it can be used in conjunction with custom selectors, provided by the `createSelector()` function.

  ```ts
  interface UserState { users: { name: string, age: number; }[] };
  interface AppSate { users: UserState; }
  ```

* (Add as paragraph) why you should avoid shallow copying
  where you have a custom selector, which takes a `userSelector`  that depends on `feat.users`.
  when adding a new user to `feat.users`, if you're not creating a new instance of that array, the **projection function** of `userSelector`
  will return the memoized value, because the reference would be same! :)

#### Using custom selectors

Instead of only selecting properties, sometimes you might want to have **more control** on the situation.
In this case, we can use the `createSelector` function which can take a bunch of **selectors** and lastly, a **projection function**.
The **selectors** will allow us to **select** certain **slices** from the store, whereas the last provided function will give the shape of the emitted value(i.e: the state object), based on the existing selectors. It will then project the value into the stream so the subscribers can consume it.

This feature is strongly based on the power of **pure functions**. Because selectors must be pure functions, **memoization** can take place, which prevents us from redoing the same task multiple times if the same arguments are provided.

A selector might look like this:

```ts
export type Selector<T, V> = (state: T) => V;
```

or it might receive some `props` object that contains data which is not part of store, but might influence the final shape of the stream's values:

```ts
export type SelectorWithProps<State, Props, Result> = (
  state: State,
  props: Props
) => Result;
```

As you can notice, there is no hint that indicates that the above selector can be **memoized**.

A memoized selector, which can be the result of `createSelector`,  looks like this:

```ts
export interface MemoizedSelector<
  State,
  Result,
  ProjectorFn = DefaultProjectorFn<Result>
> extends Selector<State, Result> {
  release(): void;
  projector: ProjectorFn;
  setResult: (result?: Result) => void;
  clearResult: () => void;
}

export type DefaultProjectorFn<T> = (...args: any[]) => T;
```

* **projector** is just the projection function mentioned before, it computes the shape of the data based on the selectors
* `release()` - release the memozied value from memory

There is also `MemoizedSelectorWithProps<State, Props, Result>` which simply extends `SelectorWithProps`, but has the same methods as `MemoizedSelector`.

```ts
export function createSelector(
  ...input: any[]
): MemoizedSelector<any, any> | MemoizedSelectorWithProps<any, any, any> {
  return createSelectorFactory(defaultMemoize)(...input);
}
```

`defaultMemoize` will take a projection function and will provide a way to memoize it:

```ts
export function defaultMemoize(
  projectionFn: AnyFn,
  isArgumentsEqual = isEqualCheck,
  isResultEqual = isEqualCheck
): MemoizedProjection {
  let lastArguments: null | IArguments = null;
  let lastResult: any = null;
  let overrideResult: any;

  // Release value from memory 
  function reset() {
    lastArguments = null;
    lastResult = null;
  }

  function setResult(result: any = undefined) { overrideResult = { result }; }

  function clearResult() { overrideResult = undefined; }

  function memoized(): any {
    if (overrideResult !== undefined) {
      return overrideResult.result;
    }

    // First time the function is invoked
    if (!lastArguments) {
      // Call the projection function with the provided arguments
      lastResult = projectionFn.apply(null, arguments as any);
      lastArguments = arguments;
      return lastResult;
    }

    // If the arguments are not different than the previous ones
    // there is no need to re-compute the results
    if (!isArgumentsChanged(arguments, lastArguments, isArgumentsEqual)) {
      return lastResult;
    }

    // If we reached this point, it means the arguments were different
    // which requires a new computation of the result
    const newResult = projectionFn.apply(null, arguments as any);
    lastArguments = arguments;

    if (isResultEqual(lastResult, newResult)) {
      return lastResult;
    }

    lastResult = newResult;

    return newResult;
  }

  return { memoized, reset, setResult, clearResult };
}
```

The memoization happens in the `memoized` function. It is deliberately declared as a **function declaration** in order to gain access to the `arguments` special variable. Arrow functions don't have it!

Consider this example:

```ts
function isEqualCheck(a: any, b: any): boolean {
  return a === b;
}

function sum (a, b) { return a + b; };

const memoizedSum = defaultMemoize(sum, isEqualCheck, isEqualCheck);

/* 
  `sum` is executed

  if (!lastArguments) { // <-- `lastArguments = null`
    // Call the projection function with the provided arguments
    lastResult = projectionFn.apply(null, arguments as any);
    lastArguments = arguments;
    return lastResult;
  }
*/
memoizedSum.memoized(1, 3);

/*
 `sum` will not be executed again as it would be called with the same parameters

 if (!isArgumentsChanged(arguments, lastArguments, isArgumentsEqual)) {
    return lastResult;
  }
*/
memoizedSum.memoized(1, 3);
```

`defaultMemoize` is one of the building blocks of `createSelector` and it is where the **memoization**  happens.
However, when using `createSelector`, the memoization can occur in 2 places: 
  * at **state level** - when the selector receives the same state
    ```ts
    const incomingState = {
      user: {
        hobbies: [ {name: 'a', recent: true}, { name: 'b', recent: false } ],
      },
      otherProperty: 'foo',
    };

    const userSelector = (s: typeof incomingState) => s.user

    const userRecentHobbiesSelector = createSelector(
      (u: typeof incomingState.user) => u.hobbies, // Selector
      hobbies => hobbies.filter(h => h.recent), // Projection Function
    );

    // Similar to `this.store.pipe(select(/* ... */))`
    merge(
      of(incomingState),
      // Receiving an update sometime in the future
      of({ ...incomingState, otherProperty: 'bar' }).pipe(delay(500))
    )
      .pipe(
        pluck('user'),
        select(userRecentHobbiesSelector),
      )
      .subscribe(console.log)
    ```

    In the above example the log would be updated only once, because when the data comes the second time, `userRecentHobbiesSelector` would try to find out whether the new data is different than the previous one. If it's not, it's going to return the memoized value(the previous value).
    This also means that `userRecentHobbiesSelector`'s projection function will be called only once.

  * at **projection function level** - when the projection function is called with the same selectors.  
    Even though the state object might have changed due to some other updates, it does not mean that some **selectors**' return values did as well.

    A **selector** created by `createSelector` can **use** the **memoized** value when **updating** a **slice** of the store that is **not relevant** for the projection function of that selector.

    ```ts
    interface User { name: string; age: number; isOk: boolean; }

    interface State {
      users: User[];
      shouldShow: boolean;
      notRelevantProperty: string;
    }

    const usersSelector = (s: State) => s.users;

    const userProjectionFn = (users: User[]) => {
      return users.filter(u => u.isOk);
    };

    const okUsersSelector = createSelector(
      usersSelector,
      userProjectionFn,
    );

    let dummyState: State = {
      shouldShow: true,
      users: [
        { name: 'a', age: 1, isOk: true },
        { name: 'b', age: 2, isOk: false },
        { name: 'c', age: 3, isOk: false },
        { name: 'd', age: 4, isOk: true },
      ],
      notRelevantProperty: 'not relevant'
    };

    // First time the selector is used with this state object
    // The returned value will be memoized
    console.log(okUsersSelector(dummyState));

    // Although the `dummyState` object changed its reference
    // `dummyState.users` did not, meaning that `userProjectionFn` should use the memoized value
    // because `usersSelector` will return the same `users` object
    dummyState = {
      ...dummyState,
      notRelevantProperty: 'not relevant - updated!',
    };

    console.log(okUsersSelector(dummyState));
    ```

    This happens because you'd usually run more **complex logic** inside the **projection function**, whereas a selector should only return a property's value(a piece of the state), which is not an expensive operation.

These features are brought together with the `createSelectorFactory`:

```ts
export function createSelector(
  ...input: any[]
): MemoizedSelector<any, any> | MemoizedSelectorWithProps<any, any, any> {
  return createSelectorFactory(defaultMemoize)(...input); // `input` - the sequence of selectors followed by the projection function
}
```

```ts
export function createSelectorFactory(
  memoize: MemoizeFn,
  options: SelectorFactoryConfig<any, any> = {
    stateFn: defaultStateFn,
  }
) {
  return function(
    ...input: any[]
  ): MemoizedSelector<any, any> | MemoizedSelectorWithProps<any, any, any> {
    let args = input;
    if (Array.isArray(args[0])) {
      const [head, ...tail] = args;
      args = [...head, ...tail];
    }

    const selectors = args.slice(0, args.length - 1);
    
    // The projection function is always the last argument provided
    const projector = args[args.length - 1];

    // `createSelector()` allows for composability
    // In `createSelector()` you can use selectors resulted from `createSelector()` as well
    const memoizedSelectors = selectors.filter(
      (selector: any) =>
        selector.release && typeof selector.release === 'function'
    );

    // Memoizing the projector
    // If the selectors's return values are not different
    // There is no need to re-run the projector function
    // which might contain expensive logic
    // In this case, `memoize === `defaultMemoize`
    const memoizedProjector = memoize(function(...selectors: any[]) {
      return projector.apply(null, selectors);
    });

    const memoizedState = defaultMemoize(function(state: any, props: any) {
      return options.stateFn.apply(null, [
        state,
        selectors,
        props,
        memoizedProjector,
      ]);
    });

    // Releasing the value from memory
    function release() {
      memoizedState.reset();
      memoizedProjector.reset();

      // Releasing the selectors that were created by `createSelector()`
      memoizedSelectors.forEach(selector => selector.release());
    }

    return Object.assign(memoizedState.memoized, {
      release,
      projector: memoizedProjector.memoized,
      setResult: memoizedState.setResult,
      clearResult: memoizedState.clearResult,
    });
  };
}
```

`options.stateFn` maps to `defaultStateFn`

```ts
if (props === undefined) {
  const args = (<Selector<any, any>[]>selectors).map(fn => fn(state));
  return memoizedProjector.memoized.apply(null, args);
}

// `props` - available in each provided selector as the second argument
const args = (<SelectorWithProps<any, any, any>[]>selectors).map(fn =>
  fn(state, props)
);
// `props` - available in the projector as well
return memoizedProjector.memoized.apply(null, [...args, props]);
```

which is where the selectors are invoked. `memoizedProjector.memoized` will make sure that if the arguments(selectors' return values) are not different than the previous ones, it will **not call** the projector again and will return the memoized value.  
Also, from the above snippets we can tell that the function returned from `createSelector()` and be called with 2 arguments: `state` and `props`, where `props` could be any data which does not necessarily belong to the store, but can influence the shape of the projector's output. 

```ts
const incomingState = {
  user: {
    hobbies: [ {name: 'a', recent: true}, { name: 'b', recent: false } ],
  },
  otherProperty: 'foo',
};

const userSelector = (s: typeof incomingState) => s.user

const userRecentHobbiesSelector = createSelector(
  (u: typeof incomingState.user, props) => (console.log('props', props),u.hobbies),
  (hobbies, props) => hobbies.filter(h => h.recent).map(h => `${props.prefix}${h.name}${props.suffix}`),
);

const props = {
  prefix: '@@@@@',
  suffix: '______',
};

merge(
  of(incomingState),
  of({ ...incomingState, otherProperty: 'bar' }).pipe(delay(500))
)
  .pipe(
    pluck('user'),
    select(userRecentHobbiesSelector, props),
  )
  .subscribe(console.log)
```

We can tell from the above 2 snippets that `props` are **available** both in **selectors** and **projection function**.

#### How does the memoization actually work ?

* using nested custom selectors
* `select(customSelector, { props })`
  
In order to get a better understanding of how this process works, let's have a look at its foundation:

```ts
// createSelectorFactory's returned function body

const selectors = args.slice(0, args.length - 1);
const projector = args[args.length - 1];
const memoizedSelectors = selectors.filter(
  (selector: any) =>
    selector.release && typeof selector.release === 'function'
);

// By default, `memoize === defaultMemoize`
const memoizedProjector = memoize(function(...selectors: any[]) {
  return projector.apply(null, selectors);
});

const memoizedState = defaultMemoize(function(state: any, props: any) {
  return options.stateFn.apply(null, [
    state,
    selectors,
    props,
    memoizedProjector,
  ]);
});

function release() {
  memoizedState.reset();
  memoizedProjector.reset();

  memoizedSelectors.forEach(selector => selector.release());
}

return Object.assign(memoizedState.memoized, {
  release,
  projector: memoizedProjector.memoized,
  setResult: memoizedState.setResult,
  clearResult: memoizedState.clearResult,
});
```

It will return a function(`memoizedState.memoized`) that can be called with 2 arguments: `state` and `props`. `memoizedState.memoized` is also the result of `createSelector()`.

Whenever `memoizedState.memoized` is called, it will verify if there is any difference between the current function's arguments and previous ones. If that's the case, it will call the callback function provided to `defaultMemoize`:

```ts
export function defaultMemoize(projectionFn: AnyFn, /* ... */): MemoizedProjection { /* ... */ }
export type MemoizedProjection = {
  memoized: AnyFn;
  reset: () => void;
  setResult: (result?: any) => void;
  clearResult: () => void;
};
```

The `projectionFn` for `memoizedState` is:

```ts
// #1
function(state: any, props: any) {
  return options.stateFn.apply(null, [
    state,
    selectors,
    props,
    memoizedProjector,
  ]);
}
```

whereas for `memoizedProject` is:

```ts
// #2
function(...selectors: any[]) {
  return projector.apply(null, selectors);
}
```

Consider this example:

```ts

```

---

## State

* it has _the last word_ 
* it's where reducer's invocation is done
* it's where reducers _meet_ actions

Can be provided as a function:

```ts
export function _initialStateFactory(initialState: any): any {
  if (typeof initialState === 'function') {
    return initialState();
  }

  return initialState;
}
```

---

## TODO

* check `example-app`
* meta-reducer -> hooks for `action -> reducer` pipeline

---

## Questions

* what is `resultMemoize` ?

* what is `@ngrx/data` ? 
* `observeOn(queueScheduler)`
* 
```ts
provide: _REDUCER_FACTORY,
  useValue: config.reducerFactory
    ? config.reducerFactory
    : combineReducers,
```
*  `strictActionSerializability || strictStateSerializability` - `runtime_checks`

* you can set the initial state from the config: `{ provide: _INITIAL_STATE, useValue: config.initialState },` ❓

* `reducers instanceof InjectionToken ? reducers : _INITIAL_REDUCERS,` - you can provide reducers outside the store module ❓

* `on` with multiple `creators`(**actions**)

* `createReduce(initState, on(a1, () => ...), on(a1, () => ...))`
  ```ts
  export function createReducer<S, A extends Action = Action>(
    initialState: S,
    ...ons: On<S>[]
  ): ActionReducer<S, A> {
    const map = new Map<string, ActionReducer<S, A>>();
    for (let on of ons) {
      for (let type of on.types) {
        if (map.has(type)) {
          const existingReducer = map.get(type) as ActionReducer<S, A>;
          const newReducer: ActionReducer<S, A> = (state, action) =>
            on.reducer(existingReducer(state, action), action);
          map.set(type, newReducer);
        } else {
          map.set(type, on.reducer);
        }
      }
    }
  ```

* might need `@ngrx/store@8.6.0`
  ```ts
  export function createReducer<S, A extends Action = Action>(
    initialState: S,
    ...ons: On<S>[]
  ): ActionReducer<S, A> {
    const map = new Map<string, ActionReducer<S, A>>();
    for (let on of ons) {
      for (let type of on.types) {
        if (map.has(type)) {
          const existingReducer = map.get(type) as ActionReducer<S, A>;
          const newReducer: ActionReducer<S, A> = (state, action) =>
            on.reducer(existingReducer(state, action), action);
          map.set(type, newReducer);
        } else {
          map.set(type, on.reducer);
        }
      }
    }
  ```

* you can provide an initial state 

```ts
export class ReducerManager extends BehaviorSubject<ActionReducer<any, any>>
implements OnDestroy {
  constructor(
    private dispatcher: ReducerManagerDispatcher,
    @Inject(INITIAL_STATE) private initialState: any,
    @Inject(INITIAL_REDUCERS) private reducers: ActionReducerMap<any, any>,
    @Inject(REDUCER_FACTORY)
    private reducerFactory: ActionReducerFactory<any, any>
  ) {
    super(reducerFactory(reducers, initialState));
    }
}
```

* `Store.addReducer` & `Store.removeReducer`

❓ why do results need to be compared?

```ts
if (isResultEqual(lastResult, newResult)) {
  return lastResult;
}
```

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

## State

* it has _the last word_ 
* it's where reducer's invocation is done
* it's where reducers _meet_ actions

* `select` - uses `pluck()` operator for strings: `this.store.pipe(select('count'))`

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

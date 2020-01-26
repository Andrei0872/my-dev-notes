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
Also, the **type**(first argument) will be attached as property to the function.

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

* pure functions
* handle state changes

* are tracked with the help of a `map` object

* you might be missing the old class syntax that was used to define classes; with the new API, this is automatically handled for you;

  let's see how

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

* `switch` replaced by `on`

---

## State

* `select` - uses `pluck()` operator for strings: `this.store.pipe(select('count'))`

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

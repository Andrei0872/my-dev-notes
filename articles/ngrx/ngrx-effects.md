# @ngrx/effects

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

# Roadmap

* rxjs
    * `lift`
        ```ts
        lift<R>(operator: Operator<T, R>): Store < R > {
            const store = new Store<R>(this, this.actionsObserver, this.reducerManager);
            store.operator = operator;

            return store;
        }
        ```

  * `catchError`
    ```ts
    obs$
      .pipe(
          catchError((err, caught$) => {
              // Re-subscribe once
              return obs$;

              // Re-subscribe every time an error occurs
              return caught$;
          })
      )
    ```

  * rxjs marble testing
    * explore `ngrx/effects` & `ngrx/store` tests
    * `jasmine-marbles`

* angular schematics

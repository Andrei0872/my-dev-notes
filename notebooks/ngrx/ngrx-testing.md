# NgRx Testing Notebook

- [NgRx Testing Notebook](#ngrx-testing-notebook)
  - [Practices](#practices)
    - [Testing the selectors' results](#testing-the-selectors-results)
  - [Takeaways](#takeaways)
    - [The **projector function** of a selector can be called without invoking the selectors it is composed of](#the-projector-function-of-a-selector-can-be-called-without-invoking-the-selectors-it-is-composed-of)

## Practices

### Testing the selectors' results
  
  ```ts
  let crtData;

  combineLatest(
    store.select('slice1'),
    store.select('slice2'),
    resultSelector
  ).subscribe(d => crtData = d);

  store.dispatch(/* ... */) // Will cause the state to be updated -> selectors updated

  expect(crtData)./* ... */
  ```

  ```ts
  const s1 = createSelector(/* ... */);
  const s2 = createSelector(/* ... */);
  const s3 = createSelector(
    s1,
    s2,
    (s1Result, s2Result) => { /* ... complicated logic here ... */ }
  );

  expect(s3.projetor(1, 2)).toBe(/* ... */)
  ```

---

## Takeaways

### The **projector function** of a selector can be called without invoking the selectors it is composed of
  ```ts
  // From source code
  const selector = createSelector(s1, s1, proj);

  selector.projector('andrei', 'gtj');

  expect(s1).not.toHaveBeenCalled();
  expect(s2).not.toHaveBeenCalled();
  expect(proj).toHaveBeenCalledWith('andrei', 'gtj');
  ```

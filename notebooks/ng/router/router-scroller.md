# Demystifying angular/router: what is `RouterScroller` and why is it useful ?

## The connection between Location and Router

* in `Router.initialNavigation()` - listen to `popstate` and `hashchange` events through `Location`
* `Location` - the bridge between `Router` and `LocationStrategy`()
* `Location` - used when setting the browser URL

```ts
// RouterScroller
// how it works & its capabilities
/* 
on each `NavigationEnd`, it keeps track of the `lastId`(the id of the `NavigationEnd`)

on each `NavigationStart`, it stores the position(window.ScrollX, window.ScrollY) of the last navigation(the one the was before this `NavigationStart` was emitted): store

[lastId] = viewportScroller.getScrollPosition()
if `NavigationStart` was the result of click the forward or the back button(e.g history.back(), or historyForward()), it will contain the `state` object(which belongs to an item from the history stack) and that `state` object contains the `navigationId` of the **previous** navigation
with this `id`, we can get the scroll position of the previous navigation.

*/

it('work', fakeAsync(() => {
  const {events, viewportScroller, router} = createRouterScroller(
      {scrollPositionRestoration: 'disabled', anchorScrolling: 'disabled'});

  router.events
      .pipe(filter(e => e instanceof Scroll && !!e.position), switchMap(p => {
              // can be any delay (e.g., we can wait for NgRx store to emit an event)
              const r = new Subject<any>();
              setTimeout(() => {
                r.next(p);
                r.complete();
              }, 1000);
              return r;
            }))
      .subscribe((e: Scroll) => {
        viewportScroller.scrollToPosition(e.position);
      });

  events.next(new NavigationStart(1, '/a'));
  events.next(new NavigationEnd(1, '/a', '/a'));
  setScroll(viewportScroller, 10, 100);

  events.next(new NavigationStart(2, '/b'));
  events.next(new NavigationEnd(2, '/b', '/b'));
  setScroll(viewportScroller, 20, 200);

  events.next(new NavigationStart(3, '/c'));
  events.next(new NavigationEnd(3, '/c', '/c'));
  setScroll(viewportScroller, 30, 300);

  events.next(new NavigationStart(4, '/a', 'popstate', {navigationId: 1}));
  events.next(new NavigationEnd(4, '/a', '/a'));

  tick(500);
  expect(viewportScroller.scrollToPosition).not.toHaveBeenCalled();

  events.next(new NavigationStart(5, '/a', 'popstate', {navigationId: 1}));
  events.next(new NavigationEnd(5, '/a', '/a'));

  tick(5000);
  expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([10, 100]);
  }));

// you can also set the offset
// useful when scrolling to an **anchor**
export function createRouterScroller(
    router: Router, viewportScroller: ViewportScroller, config: ExtraOptions): RouterScroller {
  if (config.scrollOffset) {
    viewportScroller.setOffset(config.scrollOffset);
  }
  return new RouterScroller(router, viewportScroller, config);
}
```

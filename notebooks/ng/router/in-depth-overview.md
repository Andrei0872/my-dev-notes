# An in depth overview of `@angular/router`

* applying redirects 
  * don't have do manually call `router.navigate` in order to redirect, you can simply return an `UrlTree` instance
  * where `NoMatch` errors occur
  * `DFS` applied on the `route config object` until the **first** match is found
  * the module specified in `loadChildren` is loaded ?
  
  * `createChildrenForEmptySegments` what effect has on the further phases in the chain?
  ```ts
  // segm: 'a/b/c'
  {
    path: 'a/b',
    children: [
      { path: '', outlet: 'named' }, // `named`
      { path: 'c', }, // `primary`
    ],
  }
  ```

WIP: https://stackblitz.com/edit/exp-routing-apply-redirects-phase?file=src%2Fapp%2Fapp.module.ts

## Getting to know the `UrlTree`

* introduce `UrlParser`
* diff between this tree and the one created from `RouterState` or `RouterStateSnapshot`
  * in a `UrlTree` tree only outlets(named or `primary` by default) are considered children(child = `UrlSegmentGroup`)
  * in a `RouterStateSnapshot` tree, each matched path of a `Route` object determines a `RouterStateSnapshot` child

---

## Route matcher

---

## ActivatedRouteSnapshot and ActivatedRoute

---

## Route Guards

* when `UrlTree` is returned, it means `redirect`

---

## Router Phases

### _Apply Redirects_ phase

* `NoMatch` errors occur; in this phase it is ensured that the path which would trigger a route navigation has a math among the declared routes(`Routes`)
* `canLoad` guard is invoked
  * can return a `UrlTree` instance, which will result in a redirect operation
  * this means that lazy-loaded modules are loaded during this phase; the resulted module, along with the `routes` specified by it are going to be stored for the subsequent phases(e.g `Recognize` phase);
    the config will be store in `_loadedConfig`
  * in order for a module to be successfully loaded, if any `canLoad` guards are present, all of them must return `true`
    if at least once `false` is returned - the current navigation will be cancelled and a `NavigationCancel` event will be sent
    if at least once `UrlTree` is returned - it will schedule a **new navigation**
* %include redirects

### _Recognize_ Phase

* a tree of `ActivatedRouteSnapshot` is created, based on the `UrlTree` resulted from the previous phase, `Apply Redirects`
* routes with **empty paths** are **recognized**
  ```ts
  {
    path: 'a/b',
    component: AComponent,
    children: [
      {
        path: 'test',
        outlet: 'named',
        component: BComponent,
      },
      {
        path: '',
        canActivate: [AGuard],
        component: CComponent,
      },
    ]
  }
  ```

  ```html
  <button [routerLink]="['a/b/', { outlets: { named: 'test' } }]">go to B</button>
  ```

  ```ts
  // The `UrlTree` resulted from `Apply Redirects`
  {
    segments: [],
    children: {
      primary: {
        segments: ['a', 'b'],
        children: {
          named: { segments: ['test'], children: {} }
        }
      }
    }
  }
  ```

  as you can see from the **route configuration**, the route with `path: ''` is not there, so that's what this phase is responsible for(among other things)

  after this phases, we'd end up with this:

  ```ts
  {
    segments: [],
    children: {
      primary: {
        segments: ['a', 'b'],
        children: {
          named: { segments: ['test'], children: {} }
          /* *** */ primary: { segments: [], children: [] } /* *** */
        }
      }
    }
  }
  ```

  and based on the `UrlSegmentGroup` from above, the `RouterStateSnapshot` tree will be created

  TODO(another example for diff)
  ```ts
  { path, children: [ { path, children: [ { path } ] } ]}
  ```
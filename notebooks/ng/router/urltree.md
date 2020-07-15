# Demystifying angular/router: Getting to know UrlTree, ActivatedRouteSnapshot and ActivatedRoute



## What is UrlParser and why it is important

*Note: You can find each example [here](https://ng-run.com/edit/mzWif1S1fotcDGdwlnEA).*

As we'll see in the following sections, an URL is a **serialized** version of an `UrlTree`. As a result, an `UrlTree` is the **deserialized** version of an `URL`. 

What an `UrlParser` does it to convert a URL into an `UrlTree` and it is primarily used by `DefaultUrlSerializer`. `DefaultUrlSerializer` is the default implementation of `UrlSerializer` and it's used, for instance, by `Router.parseUrl()` method:

```typescript
parseUrl(url: string): UrlTree {
  let urlTree: UrlTree;
  try {
    urlTree = this.urlSerializer.parse(url);
  } catch (e) {
    urlTree = this.malformedUriErrorHandler(e, this.urlSerializer, url);
  }
  return urlTree;
}
```

This also means that, if needed, we can use our **custom** implementation of `UrlSerializer`:

```typescript
// In `providers` array
{ provide: UrlSerializer, useClass: DefaultUrlSerializer },
```

An URL can have this structure: `segments?queryParams#fragment`; but, before diving into some examples, let's first define what are the main components of an `UrlTree`:

```typescript
export class UrlTree {
  constructor(
    public root: UrlSegmentGroup,
    public queryParams: Params, // Params -> {}
    public fragment: string|null
  ) { }
  /* ... */
}
```

From the aforementioned URL structure, we can already see that `queryParams` and `fragment` have found their pair. However, in which way does the `segments` part correspond with `UrlSegmentsGroup`?

An example of an URL would be `a/b/c`. Here, we have no *explicit* groups, only two _implicit_ groups and its **segments**(we'll see why a bit later). Groups are delimited by `()` and are very useful when we're dealing with multiple **router outlets**(e.g **named** outlets).

Let's see the structure of an `UrlSegmentGroup`:

```typescript
export class UrlSegmentGroup {
  parent: UrlSegmentGroup|null = null;

  constructor(
    public segments: UrlSegment[],
    public children: {[key: string]: UrlSegmentGroup}
  ) { }
```

As stated earlier, there are 2 _implicit_ groups. The first one is the **root** `UrlSegmentGroup`, which does not have any segments, only child `UrlSegmentGroup`. The reason behind this is that it should correspond to the root of the component tree, e.g `AppComponent`, which is inherently not included in any route configuration. As we'll discover in the next articles from this series, the way Angular resolves route transitions is based on traversing the `UrlTree`, while taking into account the `Routes` configuration. The second `UrlSegmentGroup`, whose parent is the first one, is the one that actually contains the segments. We'll see what an `UrlSegment` looks in a minute.

We might have a more complex URL, such as `foo/123/(a//named:b)`. The resulted `UrlSegmentGroup` will be this:

```typescript
{
  segments: [], // The root UrlSegmentGroup never has any segments
  children: {
    primary: {
      segments: [{ path: 'foo', parameters: {} }, { path: '123', parameters: {} }],
      children: {
        primary: { segments: [{ path: 'a', parameters: {} }], children: {} },
        named: { segments: [{ path: 'b', parameters: {} }], children: {} },
      },
    },
  },
}
```

which would match a route configuration like this:

```typescript
{
  {
    path: 'foo/:id',
    loadChildren: () => import('./foo/foo.module').then(m => m.FooModule)
  },

  // foo.module.ts
  {
    path: 'a',
    component: AComponent,
  },
  {
    path: 'b',
    component: BComponent,
    outlet: 'named',
  },
}
```

*You can experiment with this example in this [StackBlitz](https://stackblitz.com/edit/routing-base-url-parser?file=src%2Fapp%2Ffoo%2Ffoo.module.ts).*

As seen from above, `UrlSegmentGroup`'s children are delimited by `()`. The names of these children are the **router outlet**.

In `/(a//named:b)`, because it uses a `/` before `(`(the could also be `x/y/z(foo:path)`), `a` will be segment of the **primary outlet**. `//` is the separator for router outlets. Finally, `named:b` follows this structure: `outletName:segmentPath`.

Another thing that should be mentioned is the `UrlSegment`'s `parameters` property:

```typescript
export class UrlSegment {
  constructor(
    public path: string,
    /** The matrix parameters associated with a segment */
    public parameters: {[name: string]: string}) {}
}
```

Besides **positional parameters**(e.g `foo/:a/:b`), segments can have parameters declared like this: `segment/path;k1=v1;k2=v2`.

So, an `UrlTree` can be summarized in: the `root` `UrlSegmentGroup`, the `queryParams` object and the `fragment` of the issued URL.

### What is the difference `/()` and `()`?

Let's begin with a question, what URL would match such configuration?

```typescript
const routes = [
  {
    path: 'foo',
    component: FooComponent,
  },
  {
    path: 'bar',
    component: BarComponent,
    outlet: 'special'
  }
]
```

*You can find a working example [here](https://ng-run.com/edit/dszYKzt8Azuai9VNaUsD).*

It's worth mentioning that in this entire process of resolving the _next_ route, the routes array will be iterated over once for each `UrlSegmentGroup` child. This applies to the nested arrays too(e.g `children`, `loadChildren`).

So, an URL that matches the above configuration would be: `foo(special:bar)`. This is because the root `UrlSegmentGroup`'s child `UrlSegmentGroup`s are:

```typescript
{
  // root's children

  primary: { segments: [{ path: 'foo', /* ... */ }], children: {} },
  special: { segments: [{ path: 'bar', /* ... */ }], children: {} },
}
```

As specified before, for each child(in this case `primary` and `special`) it will try to find a match in the `routes` array.  
If the URL was `foo/(special:bar)`, then the root `UrlSegmentGroup` would have only one child: 

```typescript
{
  // root child

  primary: {
    segments: [{ path: 'foo', /* ... */ }],
    children: {
      special: { segments: [{ path: 'bar', /* ... */ }], children: {} }
    }
  }
}
```

Which would match this configuration:

```typescript
const routes: Routes = [
  {
    path: 'foo',
    component: FooComponent,
    children: [
      {
        path: 'bar',
        component: BarComponent,
        outlet: 'special'
      }
    ],
  },
];
```

*You can find a working example [here](https://ng-run.com/edit/S2lkjjUkVpbM6z5RCHjs?open=app%2Fapp.module.ts).*

Additionally, along the `special` `UrlSegmentGroup`, you can have another primary `UrlSegmentGroup`: `foo/(a/path/primary//special:bar)`. Note that `a/path/primary` is _automatically_ assigned to a `primary` `UrlSegmentGroup` child only if the `/()` syntax is used.

### Exercises

In this section, we're going to go over some exercises in order to get a better understanding of how the `UrlParser` works.

**What URL would match with this configuration ? (to match all of them)**

```typescript
[
  {path: 'a', component: ComponentA},
  {path: 'b', component: ComponentB, outlet: 'left'},
  {path: 'c', component: ComponentC, outlet: 'right'}
],
```

<details>
	<summary>solution</summary>

`a(left:b//right:c)`

The root `UrlSegmentGroup`'s children are:

```typescript
{
  primary: 'a',
  left: 'b',
  right: 'c'
}
```
</details>

**What would the `UrlTree` look like is this case?**

```ts
console.log(r.parseUrl('/q/(a/(c//left:cp)//left:qp)(left:ap)'))
```

<details>
	<summary>solution</summary>

```typescript
{
  // root's children

  // #1
  primary: {
    segments: ['q'],
    children: {
      // #2
      primary: {
        segments: ['a'],
        children: {
          // #3
          primary: { segments: ['c'] },
          left: { segments: ['cp'] }
        }
      },
      left: {
        segments: ['qp']
      }
    }
  },
  left: {
    segments: ['ap']
  }
}
```

*You can find this example [here](https://ng-run.com/edit/mzWif1S1fotcDGdwlnEA) as well.*

* `/q/(...)(left:ap)`: `#1`
* `/q/(a/(...)//left:qp)...`: `#2`
* `/q/(a/(c//left:cp)//...)...`: `#3`
</details>

---

## UrlTree

* diff between this tree and the one created from `RouterState` or `RouterStateSnapshot`
  * in a `UrlTree` tree only outlets(named or `primary` by default) are considered children(child = `UrlSegmentGroup`)
  * in a `RouterStateSnapshot` tree, each matched path of a `Route` object determines a `RouterStateSnapshot` child

---

## When is UrlTree used ?

* based for `ActivatedRouteSnapshot`, which is base for `ActivatedRoute`
* when returned from a guard, it will result in a redirect operation
  ```ts
  /* 
  if `canActivate` returns `UrlTree` -> redirect
  */
  checkGuards(this.ngModule.injector, (evt: Event) => this.triggerEvent(evt)),
  tap(t => {
    if (isUrlTree(t.guardsResult)) {
      const error: Error&{url?: UrlTree} = navigationCancelingError(
          `Redirecting to "${this.serializeUrl(t.guardsResult)}"`);
      error.url = t.guardsResult;
      throw error;
    }
  })

  /* ... */
  if (isNavigationCancelingError(e)) { /* ... */ }

  {
    provide: 'returnUrlTree',
    useFactory: (router: Router) => () => {
      return router.parseUrl('/redirected');
    },
    deps: [Router]
  },
  ``` 
* when resolving the next `UrlTree` in `RouterLink` directive
* based on `UrlTree`s, the `RouterLinkActive` directive will apply the classes accordingly
* `Router.navigateByUrL()`
  ```ts
  router.resetConfig([{
    path: 'team/:id',
    component: TeamCmp,
    children: [
      {path: 'user/:name', component: UserCmp},
      {path: 'simple', component: SimpleCmp, outlet: 'right'}
    ]
  }]);

  router.navigateByUrl('/team/22/(user/victor//right:simple)');
  ```
# Demystifying angular/router: Getting to know UrlTree, ActivatedRouteSnapshot and ActivatedRoute - Part 1

In this part, we're going to cover why `UrlTree` is the foundation of a route transition and how `ActivatedRouteSnapshot` and `ActivatedRoute` provide a way to achieve features like **guards**, **resolvers**, or how an `ActivatedRoute` can be _updated_.

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

As stated earlier, there are 2 _implicit_ groups. The first one is the **root** `UrlSegmentGroup`, which does not have any segments, only one child `UrlSegmentGroup`. The reason behind this is that it should correspond to the root of the component tree, e.g `AppComponent`, which is inherently not included in any route configuration. As we'll discover in the next articles from this series, the way Angular resolves route transitions is based on traversing the `UrlTree`, while taking into account the `Routes` configuration. The second `UrlSegmentGroup`, whose parent is the first one, is the one that actually contains the segments. We'll see how an `UrlSegment` looks in a minute.

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

### What is the difference between `/()` and `()`?

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

It's worth mentioning that in this entire process of resolving the _next_ route, the routes array will be iterated over once for each `UrlSegmentGroup` child at a certain level. This applies to the nested arrays too(e.g `children`, `loadChildren`).

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

## UrlTree, ActivatedRouteSnapshot and ActivatedRoute

As we've seen from the previous section, an `UrlTree` contains the `fragment`, `queryParams` and the `UrlSegmentGroup`s that create the URL segments. At the same time, there are other important units that make up the process of resolving the next route: `ActivatedRouteSnapshot` and `ActivatedRoute`. This process also consists of multiple **phrases**, e.g: running guards, running resolvers, activating the routes(i.e updating the view accordingly); these phases will operate on 2 other _tree structures_: a tree of `ActivatedRouteSnapshot`s(also named `RouterStateSnapshot`) and a tree of `ActivatedRoute`s(also named `RouterState`).

The `ActivatedRouteSnapshot` tree will be immediately created after the `UrlTree` has been built. One significant difference between these two tree structures is that in an `UrlTree` only outlets(named or `primary` ,by default) are considered children(child = `UrlSegmentGroup`), whereas in `RouterStateSnapshot`, each matched path of a `Route` object determines an `ActivatedRouteSnapshot` child.

Let's see an example. For this route configuration:

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

and the next URL `foo/(special:bar)`, the `ActivatedRouteSnapshot` tree would look like this:

```typescript
{
  // root
  url: 'foo/(special:bar)',
  outlet: 'primary',
  /* ... */
  children: [
    {
      url: 'foo',
      outlet: 'primary',
      /* ... */
      children: [
        { url: 'bar', outlet: 'special', children: [], /* ... */ }
      ]
    }
  ]
}
```

This tree is constructed by iterating through the route configuration array, while also using the previously created `UrlTree`. For example,

```typescript
{
  path: 'foo',
  component: FooComponent,
  children: [/* ... */],
}
```

will match with this `UrlSegmentGroup`:

```typescript
{
  segments: [{ path: 'foo' }]
  children: { special: /* ... */ }
}
```

Then, the resulted `ActivatedRouteSnapshot` from above will have a child `ActivatedRouteSnapshot`, because the **matched path**(i.e `foo`) belongs to a route configuration object which also has the `children` property(the same would've happened if there was `loadChildren`).

Based on the `RouterStateSnapshot`, Angular will determine which guards and which resolvers should run, and also how to create the `ActivatedRoute` tree. `RouterState` will essentially have the same structure as `RouterStateSnapshot`, except that, instead of `ActivatedRouteSnapshot` nodes, it will contain `ActivatedRoute` nodes. This step is necessary because the developer has the opportunity to opt for a custom `RouteReuseStrategy`, which is a way to _store_ a subtree of `ActivatedRouteSnapshot` nodes and can be useful if we don't want do recreate components if the same navigation occurs multiple times.

Furthermore, we can also highlight the difference between `ActivatedRoute` and `ActivatedRouteSnapshot`. The `ActivatedRouteSnapshot` tree will always be **recreated**(from the `UrlTree`), but some nodes of the `ActivatedRoute` tree can be **reused**, which explains how it's possible to be notified, for example, when **positional params**(e.g `foo/:id/:param`) change, by subscribing to `ActivatedRoute`'s observable properties(`params`, `data`, `queryParams`, `url` etc...).  
This is achieved by comparing the current `RouterState`(before the navigation) and the next `RouterState`(after the navigation). An `ActivatedRoute` node can be reused if `current.routeConfig === next.routeConfig`, where `routeConfig` is the object we place inside the `routes` array.

To illustrate that, let's consider this route configuration:

```typescript
const routes: Routes = [
  {
    path: 'empty/:id',
    component: EmptyComponent,
    children: [
      {
        path: 'foo',
        component: FooComponent,
      },
      {
        path: 'bar',
        component: BarComponent,
        outlet: 'special'
      },
      {
        path: 'beer',
        component: BeerComponent,
        outlet: 'special',
      },
    ]
  }
];
```

and this initial issued URL: `'empty/123/(foo//special:bar)'`. If we would now navigate to `empty/999/(foo//special:beer)`, then we could visualize the comparison between `RouterState` trees like this:

<div style="text-align: center;">
  <img src="https://raw.githubusercontent.com/Andrei0872/my-dev-notes/master/screenshots/routerstate.jpg">
</div>

As you can see, the `Empty` node(which corresponds to `path: 'empty/:id'`) is reused, because this expression evaluates to `true`: `current.routeConfig === next.routeConfig`, where `routeConfig` is:

```typescript
{
  path: 'empty/:id',
  children: [/* ... */]
}
```

We can also see these lines from `EmptyComponent`:

```typescript
export class EmptyComponent {
  constructor (activatedRoute: ActivatedRoute) {
    console.warn('[EmptyComponent]: constructor');

    activatedRoute.params.subscribe(console.log);
  }
}
```

and also from clicking these buttons:

```html
<button (click)="router.navigateByUrl('empty/123/(foo//special:bar)')">empty/123/(foo//special:bar)</button>

<br><br>

<button (click)="router.navigateByUrl('empty/999/(foo//special:beer)')">empty/123/(foo//special:beer)</button>
```

The same logic can be applied for each of `ActivatedRoute`'s observable properties:

```typescript
url: Observable<UrlSegment[]>,
/** An observable of the matrix parameters scoped to this route. */
params: Observable<Params>,
/** An observable of the query parameters shared by all the routes. */
queryParams: Observable<Params>,
/** An observable of the URL fragment shared by all the routes. */
fragment: Observable<string>,
/** An observable of the static and resolved data of this route. */
data: Observable<Data>,

/**
 * An Observable that contains a map of the required and optional parameters
  * specific to the route.
  * The map supports retrieving single and multiple values from the same parameter.
  */
get paramMap(): Observable<ParamMap> {
  if (!this._paramMap) {
    this._paramMap = this.params.pipe(map((p: Params): ParamMap => convertToParamMap(p)));
  }
  return this._paramMap;
}

/**
 * An Observable that contains a map of the query parameters available to all routes.
 * The map supports retrieving single and multiple values from the query parameter.
 */
get queryParamMap(): Observable<ParamMap> {
  if (!this._queryParamMap) {
    this._queryParamMap =
        this.queryParams.pipe(map((p: Params): ParamMap => convertToParamMap(p)));
  }
  return this._queryParamMap;
}
```

*A working example can be found [here](https://ng-run.com/edit/45kL9ml80w1K8i81EzTk?open=app%2Fapp.component.html).*

---

## When is UrlTree used ?

Now that we've understood what an `UrlTree` is, we can explore a few use cases.

### When an `UrlTree` is returned from a guard, it will result in a redirect operation

As we can see from the [source code](https://github.com/angular/angular/blob/master/packages/router/src/router.ts#L617-L625):

```typescript
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
```

For example:

```typescript
const routes = [
  {
    path: 'foo/:id',
    component: FooComponent,
    canActivate: ['fooGuard']
  },
  {
    path: 'bar',
    component: BarComponent
  }
];

// `providers` array
[
  {
    provide: 'fooGuard',
    
    // `futureARS` - future `ActivatedRouteSnapshot`
    useFactory: (router: Router) => (futureARS) => {
      return +futureARS.paramMap.get('id') === 1 ? router.parseUrl('/bar') : true;
    },
    deps: [Router]
  },
]
```

*An example can be found [here](https://ng-run.com/edit/0MKTWXshcBEd49BH1be7?open=app%2Fapp.module.ts).*

### `Router.navigateByUrl()`

The [`Router.navigateByUrl(url)`](https://github.com/angular/angular/blob/master/packages/router/src/router.ts#L1080-L1091) method converts the provided `url` into an `UrlTree`:

```typescript
navigateByUrl(url: string|UrlTree, extras: NavigationExtras = {skipLocationChange: false}):
    Promise<boolean> {
  /* ... */

  // `parseUrl` -> create `UrlTree`
  const urlTree = isUrlTree(url) ? url : this.parseUrl(url);
  const mergedTree = this.urlHandlingStrategy.merge(urlTree, this.rawUrlTree);

  return this.scheduleNavigation(mergedTree, 'imperative', null, extras);
}
```

### Router Directives

`RouterLink` and `RouterLinkActive` rely on `UrlTree`s in order to achieve their functionality.

`RouterLinkActive` will compare the current `UrlTree` with the one resulted from `RouterLink`'s commands and, based on the results, will add/remove classes accordingly.

`RouterLink` will create a new `UrlTree`, based on the current `UrlTree` and the provided commands.

We will explore them in detail in future articles from this series, as they are pretty complex.

---

**Thanks for reading!**
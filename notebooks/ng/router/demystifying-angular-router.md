# Demystifying Angular Router

---

## `UrlSerializer`

This is a fundamental unit, because it is responsible for **serializing** `UrlTree`s and **deserializing** URLs(which are strings).
To serialize an `UrlTree` object means to transform in into an URL and deserialization is the opposing process.

The default implementation of `UrlSerializer` is `DefaultUrlSerializer`, but we can also use our own strategy, by adding

```typescript
{
  provide: UrlSerializer,
  useClass: CustomUrlSerializer
}
```

to the `AppModule`'s `providers` array.

The `CustomUrlSerializer` class must comply with `UrlSerializer`:

```typescript
export abstract class UrlSerializer {
  /** Parse a url into a `UrlTree` */
  abstract parse(url: string): UrlTree;

  /** Converts a `UrlTree` into a url */
  abstract serialize(tree: UrlTree): string;
}
```

---

## `UrlTree`

`DefaultUrlSerializer.parse(url)` will be eventually called after doing `Router.navigateByUrl`, and it looks like this:

```typescript
parse(url: string): UrlTree {
  const p = new UrlParser(url);
  return new UrlTree(p.parseRootSegment(), p.parseQueryParams(), p.parseFragment());
}
```

Let's take a closer look at what `UrlParser` does. An URL can have this structure: `segment?queryParams#fragment`. `UrlParser` will distinguish between these parts that are essential to creating an `UrlTree`, which we'll explore a bit later.

`UrlParser.parseRootSegment` will return a `UrlSegmentGroup` which is useful because URLs might not always look like this: `a/b/c`.

An `UrlSegmentGroup` can have an array of `UrlSegments` and an object of child `UrlSegmentGroup`s:

```typescript
export class UrlSegmentGroup {
  /* ... */

  parent: UrlSegmentGroup|null = null;

  constructor(
      public segments: UrlSegment[],
      public children: {[key: string]: UrlSegmentGroup}) {
    forEach(children, (v: any, k: any) => v.parent = this);
  }

  /* ... */
}
```

For example, we might have a more complex URL, such as `foo/123/(a//named:b)`. The resulted `UrlSegmentGroup` will be this:

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

You can experiment with this example in this [StackBlitz](https://stackblitz.com/edit/routing-base-url-parser?file=src%2Fapp%2Ffoo%2Ffoo.module.ts).

As you can see, `UrlSegmentGroup`'s children are delimited by `()`. The names of these children are the **router outlet**.

In `/(a//named:b)`, because it uses a `/` before `(`, `a` will be segment of the **primary outlet**. `//` is the separator for router outlets. Finally, `named:b` follows this structure: `outletName:segmentPath`.

Another thing that should be mentioned is the `UrlSegment`'s `parameters` property. Besides **positional parameters**(e.g `foo/:a/:b`), segments can have parameters declared like this: `segment/path;k1=v1;k2=v2`;

So, an `UrlTree` has 3 important properties: the `root` `UrlSegmentGroup`, the `queryParams` object and the `fragment` of the issued URL.

---

## From `Router.navigate` to a new view on the page

*Note: `Router.navigate` will internally call `Router.navigateByUrl(u)`, where `u` is already an `UrlTree`.*

When the `Router` is initialized, it will create a stream of **route transitions**

Assuming the URL we want to navigate to `foo/123/(a//named:b)`, we'd get an `UrlTree` that looks like this:

```typescript
{
  root: {
    segments: [],
    children: {
      primary: {
        segments: [{ path: 'foo', parameters: {} }, { path: '123', parameters: {} }],
        children: {
          primary: { segments: [{ path: 'a', parameters: {} }], children: {} },
          named: { segments: [{ path: 'b', parameters: {} }], children: {} },
        },
      },
    },
  },
  queryParams: {},
  fragment: null,
}
```

The above `UrlTree` will be passed to `navigateByUrl`, which will schedule a navigation:

```typescript
navigateByUrl(url: string|UrlTree, extras: NavigationExtras = {skipLocationChange: false}):
    Promise<boolean> {
  /* ... */

  const urlTree = isUrlTree(url) ? url : this.parseUrl(url);
  // `urlHandlingStrategy.merge` returns the `urlTree` by default
  const mergedTree = this.urlHandlingStrategy.merge(urlTree, this.rawUrlTree);

  return this.scheduleNavigation(mergedTree, 'imperative', null, extras);
}
```
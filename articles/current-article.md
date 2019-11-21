# Exploring the HttpClientModule in Angular

<!-- Preface -->
In this post, we are going to understand how the `HttpClientModule` actually works behind the scenes and find answers to some questions that might have arisen while using this module.

_Note: This article is based on **Angular 8.2.x**_.

## What is HttpClientModule?

<!-- A brief description -->
The `HttpClientModule` is a **service module** provided by Angular that allows us to perform **HTTP requests** and easily manipulate those requests and their responses. It is called a **service module** because it **only instantiates services** and **does not export** any components, directives or pipes.

## Let's start exploring 🚧

_This is a section that I'll be referencing a lot during the next section, [Connecting the dots](#connecting-the-dots). 
Here I'm just exposing each significant **entity** that belongs to this module along with its explanation_.

* show module
* paragraphs which describe the purpose of each entity
* `HTTP_INTERCEPTORS`

These are the *services* this module provides:

<img src="../screenshots/articles/current-article/_http-client-module.png" style="text-align: center">


### HttpClient

With the help of this service, we are able to specify how we want to communicate with the server. It comprises the methods for the well-known HTTP verbs:

```typescript
export class HttpClient {
    constructor(private handler: HttpHandler) {}
  
    /* ... Method overloads ... */
    request(first: string|HttpRequest<any>, url?: string, options: {}): Observable<any> {
      /* ... */
    }
   
    /* ... Method overloads ... */
    delete(url: string, options: {}): Observable<any> {
      return this.request<any>('DELETE', url, options as any);
    }
    
    /* ... Method overloads ... */
    get(url: string, options: { /* ... */ } ): Observable<any> {
      return this.request<any>('GET', url, options as any);
    }

    /* ... Method overloads ... */
    post(url: string, body: any|null, options: { /* ... */ }): Observable<any> {
      return this.request<any>('POST', url, addBody(options, body));
    }
    
    /* ... Method overloads ... */
    put(url: string, body: any|null, options: { /* ... */ }): Observable<any> {
      return this.request<any>('PUT', url, addBody(options, body));
    }
  }
```

<!-- TODO: add link for `DI token` -->
* `HttpHandler` - a **DI token** which maps to `HttpInterceptingHandler`, to which we will have a look later.  

* `addBody(options, body)` - function simply **merges** the provided 2 objects(`options` & `body`) into a single object

#### `HttpClient.request()`

* called by each method of the `HttpClient` that represents an HTTP verb(`get`, `delete` etc...)

* returns an **observable** that, when subscribed to, will allow us to **send the request** to the server.


```typescript
request(first: string|HttpRequest<any>, url?: string, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    observe?: HttpObserve,
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    let req: HttpRequest<any>;

    // If `req` is not already an instance of `HttpRequest`

      /* ... Figure out the headers from `options` ... */

      /* ... Figure out the params from `options` ... */

    // Construct the request.
    req = new HttpRequest(first, url !, (options.body !== undefined ? options.body : null), {
      headers,
      params,
      reportProgress: options.reportProgress,
      responseType: options.responseType || 'json',
      withCredentials: options.withCredentials,
    });
    
    const events$: Observable<HttpEvent<any>> =
        of (req).pipe(concatMap((req: HttpRequest<any>) => this.handler.handle(req)));

    const res$: Observable<HttpResponse<any>> = <Observable<HttpResponse<any>>>events$.pipe(
        filter((event: HttpEvent<any>) => event instanceof HttpResponse));

  // Most of the times you will want to map to the response body
  return res$.pipe(map((res: HttpResponse<any>) => res.body));
```

[_Original source here_](https://github.com/angular/angular/blob/8.2.x/packages/common/http/src/client.ts#L100)

The most significant line here is this one:
```typescript
of (req).pipe(concatMap((req: HttpRequest<any>) => this.handler.handle(req)));
```

There are a few things that can be deduced from the above snippet:

<!-- TODO: reference link to the code -->
* we can know for sure that if the request has completed successfully, the observable will complete, due to `of`'s nature

<!-- TODO: link to the interceptors' section -->
* `this.handler.handle(req)` will return an observable as well, which explains why it used along with the `concatMap` operator; here is where the **interceptors** are **composed and applied** to the request


### P2

### P3

...

## Connecting the dots

## Questions

<!-- Notes -->

### Other topics
* how does Angular send the HTTP requests?
* the 2 ways of creating a header
* why not to import the HttpClientModule twice
* retry intercetpro(line: 487)
* understanding the `reduceRight` method and eventually why it has been used
* understanding the flow of the request
* how does Angular aborts requests ? `xhr.abort()`
* why should the module be imported only once, in the `AppModule` ?

### HttpInterceptingHandler
  * explain(if u haven't doen it already), to the this class got there
  * explain `HTTP_INTERCEPTORS`
  * everything starts when `res$` is subscribed to(by using `httpClient.{get|post|etc...}.subscribe()`)
  * `events$` is part of res, so when `res$` is subscribed to, the logic inside `events$` will run
  * explain using the linked list analogy

### HTTP_INTERCEPTORS
* where it comes from
* explain what's inside that file(the interface, the )
* `HttpInterceptorHandler`
* explain the order of HttpInterceptors
* why `next.hadle(req).pipe(/* access the response here */)`
* how does **retrying** work?

### leafs
  * `HttpHeaders`
    * headers instance
    * headers obj
    * string: split by `\n`
    * when `typeof headers === 'string'`
      * when an instance is created from  `partialFromXhr()`
  * `HttpParams`
  * `HttpRequest` - creating the actual request object
    * `third`(body, if body not specified(`GET`), this will be the `options`)
    * `fourth`(if body is specified as `third`, this will be the `options`)
  * `HttpResponse`
    * `HttpEvent`
  * `HttpHeaderResponse`
    * partial response(no body)
    * when **progress events** are **requested**

## TODO

- [ ] provide breakpoints in order to understand the flow
- [ ] check the existence of `X-XSRF-TOKEN` in network tab

```typescript
backend = {
  handle (req): Observable<any> { }
}

class InterceptorHandler () {
 constructor () { }
 
 handle (req) { }
}


[ i1, i2, i3 ].reduceRight((next, i) => new InterceptorHandler(i, next), backend) 



o1 = intHandl(i3, be)

o2 = intHandl(i2, o1)

o3 = intHandl(i1, o2);

o3.handle(req)
```

## TODO

* add links between sections

* try the `retry` stuff
```typescript
// Start with an Observable.of() the initial request, and run the handler (which
    // includes all interceptors) inside a concatMap(). This way, the handler runs
    // inside an Observable chain, which causes interceptors to be re-run on every
    // subscription (this also makes retries re-run the handler, including interceptors).
    const events$: Observable<HttpEvent<any>> =
      of (req).pipe(concatMap((req: HttpRequest<any>) => this.handler.handle(req)));
```

* `HttpHeaders` - `this.lazyInit()`

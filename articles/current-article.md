# Demystifying the HttpClientModule in Angular 

<!-- Preface -->

## What is HttpClientModule and how does it work?

<!-- A brief description -->
* a service module - only instantiates services, does exports any components, directives or pipes


### Other topics
* how does Angular send the HTTP requests?
* the 2 ways of creating a header
* why not to import the HttpClientModule twice
* retry intercetpro(line: 487)
* understanding the `reduceRight` method and eventually why it has been used
* understanding the flow of the request
* how does Angular aborts requests ? `xhr.abort()`

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

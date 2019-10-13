# Angular Notebook

* [Concepts](#concepts)
* [Interceptors](#interceptors)
* [Directives](#directives)

## Concepts

### AOT

* **before** JS code is run in the browser, it is **pre-compiled** into an **optimized format**, then is **sent** to the browser

* notify **template errors** at **build time**

### JIT

* **uses** the **browser** to **compile** the code

* the **browser** has to **download** the **compiler**

### `{ static: true | false }`

* encountered in 
    * `@ContentChild(/* ... */, { static: true | false })` 
    * `@ViewChild(/* ... */, { static: true | false })`

* **true**
    * queries that can be solved statically - not in `*ngFor` or `*ngIf`
    * accessible in `ngOnInit()`

* **false**
    * will ensure query matches that are dependent on binding resolution(`*ngIf` etc...)
    * accessible in `ngAfterViewChecked()` or `ngAfterContentChecked()`

### `ngProjectAs`

[Example](https://stackoverflow.com/questions/57820385/how-can-i-get-an-ng-content-select-filter-to-work-with-projected-template-conten/57822471#57822471) :sparkles:

* useful when you want to project an `ng-container` with a certain selector

### Pure pipes

* triggered on **pure** changes - changes to primitive data types(number, string, boolean etc...) or a **changed object reference**

---

## Interceptors

[Understanding how interceptors act on HttpRequest and HttpResponse](https://dev.to/anduser96/angular-understanding-how-interceptors-act-on-httprequest-and-httpresponse-bf8) :sparkles:

### The `HttpRequest` & `HttpResponse` flow

Assuming a request will be intercepted by these interceptors:
```typescript
@NgModule({
    /* ... */
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: Interceptor1
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: Interceptor2
            multi: true,
        },
        /* ... */
        {
            provide: HTTP_INTERCEPTORS,
            useClass: InterceptorN
            multi: true,
        }
    ]
    /* ... */
})
```

#### `HttpRequest`

> INTERCEPTOR_1.request -> INTERCEPTOR_2.request -> INTERCEPTOR_3.request -> ... -> INTERCEPTOR_n.request

#### `HttpResponse`

> INTERCEPTOR_n.response -> ... -> INTERCEPTOR_3.response -> INTERCEPTOR_2.response -> INTERCEPTOR_1.response

[Working Example](https://stackblitz.com/edit/ng-understanding-interceptors?file=src%2Fapp%2Fapp.component.ts)

--- 

## Directives

* you can add an event on an element by attaching a directive to it and using `HostListener()` on the directive
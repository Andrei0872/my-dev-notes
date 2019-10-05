# Angular Notebook

* [Concepts](#concepts)

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

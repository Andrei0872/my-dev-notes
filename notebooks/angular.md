# Angular Notebook

* [Concepts](#concepts)
* [Interceptors](#interceptors)
* [Directives](#directives)
    * [Structural directives](#structural-directives)
* [Forms](#forms)
* [Cool Stuff](#cool-stuff)
    * [`ngProjectAs`](#ngProjectAs)


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

* unlike components, directives do **not require a view**

* can add **custom behavior** to a DOM element or component

* you can add an event on an element by attaching a directive to it and using `HostListener()` on the directive

### Structural directives

* alter DOM's structure(`removing`/`adding`/`manipulating` elements)

<details>
<summary>Looping through data in template</summary>
<br>


```html
<ng-template 
    ngFor 
    let-user 
    let-index="index" 
    [ngForOf]="users$ | async"
>
  <p>{{ user.name + ' ' + index }}</p>
</ng-template>
<!-- 
Will yield: 
    <p>USERNAME</p>
-->

<!-- --------------------------- -->

<ng-container *ngFor="let user of users$ | async">
  <p>{{ user.name }}</p>
</ng-container>
<!-- 
Will yield:
    <! ---- >
    <p>USERNAME</p>
 -->

<!-- Here is why a comment is also rendered above its `p` tag -->
<!-- The above snippet would be translated into this(ignore the `index` variable) -->
<ng-template 
    ngFor 
    let-user 
    let-index="index"
    [ngForOf]="users$ | async"
>
  <ng-container>
    <p>{{ user.name + ' ' + index }}</p>
  </ng-container>
</ng-template>
```
</details>

---

## Forms

[Playground](https://stackblitz.com/edit/ng-working-with-forms?file=src/app/app.component.ts) :sparkles:

### Two-way data binding

*   ```html 
    <input [(ngModel)]="value" />
    ```

*   ```html
    <app-foo [(value)]="myValue" (valueChange)="customFnWhenValueChanged($event)"></app-foo>
    ```
    <details>
    <summary><code>app-foo</code></summary>
    <br>


    ```typescript
    @Component({ /* ... */ })
    export class FooComponent {    
        @Input()
        value: string;

        @Output()
        valueChange = new EventEmitter<string>();

        public chnageValue () {
            this.valueChange.emit(this.value + '@');
        }
    }
    ```
    </details>

---

## Cool Stuff

### `ngProjectAs`

[A use case for `ngProjectAs`](https://dev.to/anduser96/angular-a-use-case-for-ngprojectas-pnj)  

[SO post](https://stackoverflow.com/questions/57820385/how-can-i-get-an-ng-content-select-filter-to-work-with-projected-template-conten/57822471#57822471)

* can be used when  you want to **project** an `ng-container` with a certain selector

<details>
    <summary>Example</summary>
    
<h3>test.component.html</h3>

```html
<ng-content select="[test]"></ng-content>
```

<h3>consumer.component.html</h3>

```html
<app-test>
  <ng-container 
    *ngTemplateOutlet="testTemplate; context: { $implicit: 'andrei' }" 
    ngProjectAs="[test]"
  ></ng-container>
</app-test>

<ng-template #testTemplate let-implicitVar>
  <p>this is test!</p>
  <b>{{ implicitVar }}</b>
</ng-template>
```
</details>

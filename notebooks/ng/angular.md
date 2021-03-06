# Angular Notebook

- [Angular Notebook](#angular-notebook)
  - [Concepts](#concepts)
    - [AOT](#aot)
    - [JIT](#jit)
    - [{ static: true | false }](#static-true--false)
    - [Pure pipes](#pure-pipes)
    - [View](#view)
      - [view container](#view-container)
    - [View Encapsulation](#view-encapsulation)
    - [Shadow DOM vs Light DOM](#shadow-dom-vs-light-dom)
    - [Components](#components)
  - [Interceptors](#interceptors)
    - [The HttpRequest &amp; HttpResponse flow](#the-httprequest-amp-httpresponse-flow)
      - [HttpRequest](#httprequest)
      - [HttpResponse](#httpresponse)
  - [Change Detection](#change-detection)
    - [OnPush](#onpush)
  - [Directives](#directives)
    - [Structural directives](#structural-directives)
      - [*ngFor](#ngfor)
    - [ngIf with async pipe](#ngif-with-async-pipe)
  - [</details>](#details)
  - [Dependency Injection](#dependency-injection)
    - [provider](#provider)
    - [injector](#injector)
    - [Dynamically configure an injector for dynamic views](#dynamically-configure-an-injector-for-dynamic-views)
  - [Forms](#forms)
    - [Two-way data binding](#two-way-data-binding)
  - [Cool Stuff](#cool-stuff)
    - [ngProjectAs](#ngprojectas)
    - [Load module as a child route](#load-module-as-a-child-route)
    - [Dynamically load components within ngIf](#dynamically-load-components-within-ngif)


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
    * accessible in `ngAfterViewChecked()` | `ngAfterContentChecked()` | `ngAfterViewInit()` | `ngAfterContentInit()`

### Pure pipes

* triggered on **pure** changes - changes to primitive data types(number, string, boolean etc...) or a **changed object reference**

### View

* an **abstraction** that **binds** the **component class** to a **DOM** element

#### view container

* **holds the views** and **provides** an **API** to **manipulate** these views

### View Encapsulation

[StackBlitz](https://stackblitz.com/edit/pass-ng-content-to-children)

* **Emulated**(_default_)
  * will identify each component using `_nghost-*` and `_ngcontent-*`
  * achieves **best support** across **browsers**

  <details>
    <summary>Example</summary>

    ```html
    <my-app _nghost-xnu-c6="" ng-version="8.0.0">
        <h1 _ngcontent-xnu-c6="">App comp</h1>
        <hook _ngcontent-xnu-c6="" class="foo" _nghost-xnu-c7="">
            <h2 _ngcontent-xnu-c7="">Hook comp</h2>
            <!---->
            <!---->
            <hook-child>
                <h3>Hook child comp</h3>
                <!--bindings={
        "ng-reflect-ng-template-outlet": "[object Object]"
      }--> awesome content here!!
                <!---->
            </hook-child>
        </hook>
    </my-app>
    ```
  </details>

* **Native**
  * use the **Native Shadow DOM**
  * note that if you want a **stricter** encapsulation, you must provide this option to the **children** of this shadow root as well

  <details>
    <summary>Example</summary>

    ```html
    <my-app ng-version="8.0.0">
      #shadow-root (open)
        <style>h1, h2, h3 { color: red; }</style>
        <h1>App Comp</h1>

        <hook class="foo">
          #shadow-root (open)
        </hook>
    </my-app>
    ```
  </details>

* **None**
  * **disable encapsulation** for a **specific component**; its **children** will still **keep** the **default behavior**, unless something else is manually specified

### Shadow DOM vs Light DOM

* **Shadow DOM**
  * **DOM elements** or **child components** that a **component internally** creates or/and manages

  <details>
    <summary>Example</summary>

    ```typescript
    @Component({
      selector: 'foo',
      template: `
        <h1>Hello!</h1>
        <foo-child></foo-child>
      `
    })
    ```
  </details>

* **Light DOM**
  * refers to the **projected content**

  <details>
    <summary>Example</summary>

    ```html
    <foo>
      <h1>Hello!</h1>
      <foo-child></foo-child>
    </foo>
    ```
  </details>

---

### Components

- **declarative**
  - **referenced** in the **template**

- **imperative**
  - `entryComponents`
  - **not referenced** in the **template**
  - examples: the bootstrapped root component, route components

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

## Change Detection

### OnPush

Will **check** the component, but **only run change detection** if:

* input property's reference changes
* an **event** is **internally emitted**(**DOM** event/**EventEmitter**)
* the **async pipe** receives a **new event**
* change detection is manually invoked: `ChangeDetectorRef.detectChanges()`

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

#### `*ngFor`

* accepts any object that **implements** the `Iterable` inteface(exept for `Map`, which returns entries as `[k, v]`) 

### `ngIf` with async pipe

<details>
<summary>Example</summary>
<br>


```html
<ng-container *ngIf="{
  users: users$ | async,
  todos: todos$ | async
} as foo">
  <ng-template ngFor let-user let-index="index" [ngForOf]="foo.users" >
    <ng-container>
      <p>{{ user.name + ' ' + index }}</p>
    </ng-container>
  </ng-template>


  <ng-template ngFor let-todo let-index="index" [ngForOf]="foo.todos" >
    <ng-container>
      <p>{{ todo.title }}</p>
    </ng-container>
  </ng-template>
</ng-container>
```
</details>
---

## Dependency Injection

* if a **directive** `X` **comes with providers**, any directive that will inject `X`, will also get access to `X`'s providers

* if an element/component uses a directive `X`(which comes with providers) and directive `Y`, `Y` will be able to inject `X`'s providers;  
in this case, the providers will be singletons: **one singleton per element/component**


  <details>
  <summary>Example</summary>
  <br>


  ```typescript
  class FooDep {
    constructor () { console.log('this is foo!') }
  }

  @Directive({
    selector: '[s1]',
    providers: [FooDep],
  })
  export class Dir1 {
    constructor (private fooDep: FooDep) {
      console.log('[DIR 1]: foo deep');
    }
  }

  @Directive({
    selector: '[s2]',
  })
  export class Dir2 {
    constructor (private fooDep: FooDep) {
      console.log('[DIR 2]: foo deep');
    }
  }

  @Directive({
    selector: '[s3]',
  })
  export class Dir3 {
    constructor (private fooDep: FooDep) {
      console.log('[DIR 3]: foo deep');
    }
  }

  @Component({
    selector: 'app-bar',
    template: `
      bar!
    `,
  })
  export class BarComponent { }

  @Component({
    selector: 'my-app',
    template: `
      <app-bar s1 s2 s3></app-bar>
    `,
  })
  export class AppComponent { }
  /* 
  --->
  this is foo!
  [DIR 1]: foo deep
  [DIR 2]: foo deep
  [DIR 3]: foo deep
  */
  ```
  </details>

### provider

- object that can be **injected** in the **constructor** of a component/service/directive/pipe
- used by the **injector** to **create** a **new instance** of a **dependency** for a class the requires it
- **tells** the **injector** how to **obtain** an **injectable dependency** associated with a DI token

### injector

- responsible for **creating dependency instances** and **injecting** them into the classes

### Dynamically configure an injector for dynamic views

* [SO thread](https://stackoverflow.com/questions/58686590/create-dynamic-components-with-different-location-in-logical-component-tree/58688619#58688619)
* [Article](https://dev.to/anduser96/angular-dynamically-configure-an-injector-for-dynamic-views-1lb4)

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

### Strategies

#### Creating dynamic form components

* create a `dynamic-form` module
* export one component, `dynamic-form-container`, which will receive a config object based in which it will display the desired form controls
* in that module, declare some **form-control-based** components which will only be used internally 
* create a directive(`dynamic-form-directive`) that will handle rendering logic
  * could be attached to an `<ng-container>`
  ```ts
  const formControlBasedComponents = [/* ... */];

  {
    @Input('type') fcType: 'text' | 'select' | 'radio'

    constructor (private vcr: ViewContainerRef) { }
  
    ngOnInit () {
      const factory = this.cfr.resolveComponentFactory(formControlBasedComponents[this.fc.type])

      const viewRef = this.vcr.createComponent(factory);

      viewRef.instance.prop1 = 'prop1231';
      viewRef.instance.prop2 = 'prop1231';
    }
  }
  ```

### Custom components

#### Accessibility 'gotcha'

[ng-run](https://ng-run.com/edit/d32P1dYCKg1jALxIUsuJ?open=app%2Fcustom-input%2Fcustom-input.component.ts).

```html
<!-- parent.component.html -->
<form>
  <label for="foo">Foo input</label>
  <app-custom-input id="foo"></app-custom-input>
</form>
```

```ts
// app-custom-input.component.ts

@Component({
  selector: 'app-custom-input',
  template: `
    <input [id]="id" type="text">
  `
})
export class CustomInputComponent implements OnInit {
  @HostBinding('attr.id')
  private externalId = '';
  
  @Input() id: string;
}
```

Without `@HostBinding('attr.id')`, the `id` would've been set twice: once as an attribute on the `app-custom-input` and once on `<input>` tag. Because of this, when clicking on the label, nothing would happen. The solution is to remove the `id` attribute from the `app-custom-input`.

### Synchronizing multiple `AbstractControls`

```ts
const fg = this.fb.array([
  this.fb.group({ name: '', city: '' }),
  this.fb.group({ name: '', city: '' }),
  this.fb.group({ name: '', city: '' }),
]);
```

```ts
const getControlsToSync = (container: FormArray, nameOfChild: string) => {
  return (container.controls as Array<FormGroup>).reduce((acc, ctrlChild) => {
    const ctrl = ctrlChild.get(nameOfChild);

    acc.controls.push(ctrl);
    acc.valueChanges.push(ctrl.valueChanges);

    return acc;
  }, { controls: [], valueChanges: [] })
};

const ctrlToSync = getControlsToSync(fg, 'name');

const subscription = merge(...ctrlToSync.valueChanges)
  .subscribe(v => {
      ctrlToSync.controls.forEach(c => c.setValue(v, { emitEvent: false, }));
  });

// At a later point
// All the `valueChanges` will be unsubscribed from as well
subscription.unsubscribe();
```

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

### Load module as a child route

<details>
<summary>Example</summary>
<br>


```typescript
{
  path: '...'
  children: [
    {
      path: 'path-to-module',
      loadChildren: () => YourEagerlyLoadedModule
    }
  ]
}
```
</details>

### Dynamically load components within `ngIf`

* [SO thread](https://stackoverflow.com/questions/58646928/load-dynamic-component-within-ngif-createcomponent-is-undefined/58651746#58651746)

* [StackBlitz](https://stackblitz.com/edit/ng-dynamic-comp-3-ways)

<details>
  <summary>
    <code>changeDetectorRef.detectChanges()</code>
  </summary>

  ```html
  <button (click)="showContent()">Show Panel</button>

  <div *ngIf="showPanel">
      <ng-template #ref></ng-template>
  </div>
  ```

  ```typescript
  showContent () {
    this.showPanel = !this.showPanel;

   if (this.showPanel) {
      this.cdr.detectChanges();
      this.loadComponent();
    }
  }
  ```
</details>

<br>

<details>
  <summary>
    setter for<code> ViewChild</code>
  </summary>

  ```html
  <button (click)="showContent()">Show Panel</button>

  <div *ngIf="showPanel">
      <ng-template #ref></ng-template>
  </div>
  ```

  ```typescript
  private _ref: ViewContainerRef;

  private get ref () {
    return this._ref;
  }

  @ViewChild('ref', { static: false, read: ViewContainerRef })
  private set ref (r) {
    console.log('setting ref', r)
    this._ref = r;

    if (this._ref) {
      this.loadComponent();
    }
  }

  showPanel = false;

  constructor (
    private cdr: ChangeDetectorRef,
    private cfr: ComponentFactoryResolver,
  ) { }

  loadComponent () {
    const factory = this.cfr.resolveComponentFactory(ChildComponent);
    const component = this.ref.createComponent(factory);
  }

  showContent () {
    this.showPanel = !this.showPanel;
  }
  ```
</details>

<br>

<details>
  <summary>
    using <code>ng-container</code>
  </summary>

  ```html
  <button (click)="showContent()">Show Panel</button>

  <ng-container #vcr></ng-container>
  ```

  ```typescript
  @ViewChild('vcr', { static: true, read: ViewContainerRef })
  vcr: ViewContainerRef;

  showContent () {
    this.showPanel = !this.showPanel;  

    this.showPanel && this.attachComponent();

    !this.showPanel && this.removeComponent();  
}

  private attachComponent () {
    const compFactory = this.cfr.resolveComponentFactory(ChildComponent);

    const compView = this.vcr.createComponent(compFactory);
  }

  private removeComponent () {
      this.vcr.clear();
  }
  ```
</details>

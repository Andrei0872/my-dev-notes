# TODO: find a good title about forms! :)

---

## Ideas

* before showing any feature(ex: `What happens when you disable an AbstractControl?`), start by showing a tree-like representation of a `AbstractControl` instances so that the feature can be easily understood
  ex:
  `What happens when you disable an AbstractControl`
  
  ```ts
  const f = new FormGroup({ /* ... */ });

  f.disable();
  ```

  ```
      (3)FG (FG.disable())
      /   \
  (1)FC   (2)FC
  ```

  The disabling order: `(1), (2), (3)`..
  * notes
  * further explanations
  * :)

## Base entities

In order to get the most out of the **Forms API**, we must ensure that look over some of its essential parts.

### AbstractControl

This (**abstract**) class contains logic shared across `FormControl`, `FormGroup` and `FormArray`: 

* running validators
* changing and calculating UI status - `markAsDirty()`, `markAsTouched()`, `dirty`, `touched`, `pristine` etc...
* resetting status
* keeping track of validation status(`invalid`, `valid`)

This class, as well as its subclasses, can referred to as the **model layer** - it stores data related to a specific entity.

Multiple `AbstractControl`s can be seen as tree where the leaves are always going to be `FormControl` instances and the other 2 (`FormArray`, `FormGroup`) can be thought of as `FormControl` containers, which entails that they **can't be used as leaves** because they must contain at least on `AbstractControl` instance.

```ts
// FG - FormGroup
// FA - FormArray
// FC - FormControl

    FG
  /   \
FC    FG
    /    \
  FC     FA
        / | \
      FC FC FC
```

The above tree can be the result of

```html
<form>
  <input type="text" formControlName="companyName">

  <ng-container formGroupName="personal">
    <input type="text" formControlName="name">

    <ng-container formArrayName="hobbies">
      <input type="checkbox" formControlName="0">
      <input type="checkbox" formControlName="1">
      <input type="checkbox" formControlName="2">
    </ng-container>
  </ng-container>
</form>
```

You can find more about `formArrayName` and `formGroupName` in the upcoming sections.

#### FormControl

It extends `AbstractControl`, which means it will inherit all the characteristics listed above. What's important to mention here is that `FormControl` is put together with **only one** form control(a **DOM element**: `<input>`, `<textarea>`) or a custom component(with the help of `ControlValueAccessor`- more on that later!).

A `FormControl` can be considered **standalone** if it **does not belong** to an `AbstractControl` tree. As a result, it will be **completely independent**, meaning that its validity, value and user interaction won't be affect any of its **form container ancestors**([Example](https://ng-run.com/edit/Xx0irFLVo4FdueEBtSAF?open=app%2Fexample-standalone.component.ts)).

#### FormArray

It extends `AbstractControl` and its job is to group multiple `AbstractControl`s together.

From a tree perspective, it is a node that must contain at least one descendant. Its **validation status**, **dirtiness**, **touched status** and **value** usually depend on its descendants. There could be cases, though, where a container has certain validators so errors might appear at that node's level.

Its defining characteristic is that it stores its children in an **array**.

#### FormGroup

Same as `FormArray`, except that it stores its descendants in an **object**.

### AbstractControlDirective

It is the base class for **form-control-based directives**(`NgModel`, `FormControlName`, `FormControlDirective`) and contains **boolean getters** that reflect the current status of the control(`valid`, `touched`, `dirty` etc...).  
The previously mentioned control is bound to a **DOM element** with the help of a concrete implementation of `AbstractControlDirective`(`NgModel`, `FormControlName`) and a `ControlValueAccessor`.

Thus, this class can be thought of as a `middleman` that connects `ControlValueAccessor`(**view layer**) with `AbstractControl`(**model layer**) - more on that in the forthcoming sections.

It is worth mentioning that multiple `AbstractControlDirective`s can **bind the same** `AbstractControl` to multiple **DOM elements or custom components**, to multiple `ControlValueAccessor`s

Consider this example:

```html
<form>
  <input ngModel name="option" value="value1" type="radio">

  <input ngModel="value3" name="option" value="value2" type="radio">

  <input ngModel="value1" name="option" value="value3" type="radio">
</form>
```

As a side node, providing a default value right from the template can be achieved by setting the `ngModel` directive's value to the value of the radio button you want to be checked by default. In the above snippet, the first button will be checked.

This happens because the last directive will be the one which will have the _final_ call
of `setUpControl()` function.

```ts
export function setUpControl(control: FormControl, dir: NgControl): void {
  if (!control) _throwError(dir, 'Cannot find control with');
  if (!dir.valueAccessor) _throwError(dir, 'No value accessor for form control with');

  /* ... */

  dir.valueAccessor !.writeValue(control.value); // <-- Here!
  
  /* ... */
}
```

[ng-run Example](https://ng-run.com/edit/Xx0irFLVo4FdueEBtSAF?open=app%2Fradio-example.component.ts).

### AbstractFormGroupDirective

It's a container for `AbstractFromGroupDirective` and `AbstractControlDirective` instances and its useful when you want to create a sub-group of `AbstractControl`s(eg: `address: { city, street, zip }`) or run validators for some specific `AbstractControls`(eg: min-max validator that makes sure that `min` control can't have a value that is greater than `max` control's value).

Its concrete implementations are: `formGroupName`, `formArrayName`, `ngModelGroup`.

Now you might be wondering, what's the difference between `FormGroupName` and `FormGroup`?
We'll dive deeper into this here(TODO: add link), but here's a quick explanation:

```html
<form [formGroup]="filterForm">
  <ng-container formGroupName="price">
    <input formControlName="min" type="text">
    <input formControlName="max" type="text">
  </ng-container>
</form>
```

`FormGroupName`, being a subclass of `AbstractFromGroupDirective` it has all the attributes listed at the beginning of this section. It acts as a container for `AbstractControl` instances as well.
But, `FormGroup` can only be the top-level container. This means, you can't use `FormGroupName` as a top-level container as it will result in an error.

`AbstractFormGroupDirective` provides a way to access to top level `FormGroup` instance: 

```ts
get formDirective(): Form|null { return this._parent ? this._parent.formDirective : null; }
```

where `this._parent` can be another `AbstractFormGroupDirective` or a `FormGroupDirective` instance. The `FormGroupDirective` does not have a `_parent` property.

### ControlValueAccessor

`ControlValueAccessor` is an essential part for the **Forms API** and can be thought of as the **view layer**.

Its job is to connect a **DOM element**(eg: `<input>`, `<textarea>`) or a custom component(eg: `<app-custom-input>`) with an `AbstractControlDirective`(eg:`NgModel`, `FormControlName`). `AbstractControlDirective` will eventually become a bridge between `ControlValueAccessor`(**view layer**) and `AbstractControl`(**model layer**). This way, the 2 layers can interact with each other.

For instance:

* when user is typing into an input: `View` -> `Model`
* when the value is set programmatically(`FormControl.setValue('newValue')`): `Model` -> `View`

Only `FormControl` instances can 'directly' interact with a `ControlValueAccessor`, because a `FormControl`, in a tree of `AbstractControl`s, can only be the leaf node as it is not supposed to contains other nodes. Along these lines, we can deduce that **updates** that come **from the view** will **start** **from leaf** nodes.

```ts
// FG - FormGroup
// FA - FormArray
// FC - FormControl
                                  FG
                                /   \
user typing into an input  <- FC    FA
                                   / | \
                                FC  FC  FC <- user selecting checkbox
```

The `ControlValueAccessor` interface looks like this: 

```ts
export interface ControlValueAccessor {
  writeValue(obj: any): void;

  registerOnChange(fn: any): void;

  registerOnTouched(fn: any): void;

  setDisabledState?(isDisabled: boolean): void;
}
```

* `writeValue()` - writes a new value to an element; the new value comes from the **MODEL**(`FormControl/setValue` -> `ControlValueAccessor.writeValue` -> update element -> change is visible in the UI)
* `registerOnChange()` - registers a **callback function** that will be called whenever the value **changes** **in** the **UI** and will **propagate** the new value to the model.
* `registerOnTouched()` - registers a **callback function** that will be called when the **blur** event occurs; the `FormControl` will be notified of this event as it may need to perform some updates when this event occurs.
* `setDisabledState` - will **disable/enable** the **DOM element** depending on the value provided; this method is usually called as a result of a change in the **MODEL**.

You can see these methods' usefulness in the following section: Connecting...(TODO: add link)

There are 3 types of `ControlValueAccessor`s:

* default
  
  ```ts
  @Directive({
  selector:
      'input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]',
  })
  export class DefaultValueAccessor implements ControlValueAccessor { }
  ```

* built-in
  
  ```ts
  const BUILTIN_ACCESSORS = [
    CheckboxControlValueAccessor,
    RangeValueAccessor,
    NumberValueAccessor,
    SelectControlValueAccessor,
    SelectMultipleControlValueAccessor,
    RadioControlValueAccessor,
  ];
  ```

  You can read more about **built-in** accessor here(TODO: add link).

* custom - when you want a custom component to be part of the `AbstractControl` tree

  ```ts
  @Component({
    selector: 'app-custom-component',
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: CustomInputComponent,
      }
    ]
    /* ... */
  })
  export class CustomInputComponent implements ControlValueAccessor { }
  ```
  
  ```html
  <form>
    <app-custom-component ngModel name="name"></app-custom-component>
  </form>
  ```

  Remember that `ngModel` is a **form-control-based** directive, so it will become a bridge between a `ControlValueAccessor`(**view**) and `FormControl`(**model**).
  
  You can read more about **custom** accessor here(TODO: add link).

### Connecting `FormControl` with `ControlValueAccessor`

As mentioned in the previous sections, `AbstractControlDirective` is what the **view layer**(`ControlValueAccessor`) needs in order to effectively communicate with the **model layer**(`AbstractControl`, concretely `FormControl`) and vice versa.

This connection can be visualized like as follows:

```ts
  -------------------------- 
  |                        | 
  |  ControlValueAccessor  |  <--- View Layer
  |                        | 
  -------------------------- 
    |                 ▲
    |                 |
    |                 |
    ▼                 |
------------------------------ 
|                            | 
|  AbstractControlDirective  | 
|                            | 
------------------------------ 
        |           ▲
        |           |
        |           |
        ▼           |
      ----------------- 
      |               | 
      |  FormControl  |  <--- Model Layer
      |               | 
      ----------------- 
```

The `↓` indicates the **ViewToModelPipeline**, whereas `↑` indicates the **ModelToViewPipeline**.

`AbstractControlDirective` plays a critical role here. Let's examine the actual implementation!

The above diagram is the result of this code snippet:

_Note: In reality, `NgControl` extends `AbstractControlDirective` and it mainly acts as a provider for **form-control-based** directives: `NgModel`, `FormControlName` etc..., but doesn't have any default implementation._

The `setUpControl` function is **called** every time a **form-control-based** directive is **initialized**.

```ts
export function setUpControl(control: FormControl, dir: NgControl): void {
  if (!control) _throwError(dir, 'Cannot find control with');
  if (!dir.valueAccessor) _throwError(dir, 'No value accessor for form control with');

  control.validator = Validators.compose([control.validator !, dir.validator]);
  control.asyncValidator = Validators.composeAsync([control.asyncValidator !, dir.asyncValidator]);
  dir.valueAccessor !.writeValue(control.value);

  setUpViewChangePipeline(control, dir);
  setUpModelChangePipeline(control, dir);

  setUpBlurPipeline(control, dir);

  /* ... Skipped for brevity ... */
}

// VIEW -> MODEL
function setUpViewChangePipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnChange((newValue: any) => {
    control._pendingValue = newValue;
    control._pendingChange = true;
    control._pendingDirty = true;

    if (control.updateOn === 'change') updateControl(control, dir);
  });
}

// Update the MODEL based on the VIEW's value
function updateControl(control: FormControl, dir: NgControl): void {
  if (control._pendingDirty) control.markAsDirty();
  
  // `{emitModelToViewChange: false}` will make sure that `ControlValueAccessor.writeValue` won't be called
  // again since the value is already updated, because this change comes from the view
  control.setValue(control._pendingValue, {emitModelToViewChange: false});

  // If you have something like `<input [(ngModel)]="myValue">`
  // this will allow `myValue` to be the new value that comes from the view
  dir.viewToModelUpdate(control._pendingValue);

  control._pendingChange = false;
}

// MODEL -> VIEW
function setUpModelChangePipeline(control: FormControl, dir: NgControl): void {
  control.registerOnChange((newValue: any, emitModelEvent: boolean) => {
    // control -> view
    dir.valueAccessor !.writeValue(newValue);

    // control -> ngModel
    if (emitModelEvent) dir.viewToModelUpdate(newValue);
  });
}
```

Here is once again the `ControlValueAccessor` interface:

```ts
export interface ControlValueAccessor {
  writeValue(obj: any): void;

  registerOnChange(fn: any): void;

  registerOnTouched(fn: any): void;

  setDisabledState?(isDisabled: boolean): void;
}
```

As you can see, the `setUpViewChangePipeline` method is how the `AbstractControlDirective`(the `dir` argument) connects the **view** with the **model**(unidirectional connection), by assigning a **callback function** to `ControlValueAccessor.onChange`. This will allow an action of that happens in the view to be propagated into the model.

Here's a concrete implementation of `ControlValueAccessor.registerOnChange`:

```ts
@Directive({
  selector: 'input[custom-value-accessor][type=text][ngModel]',
  host: {
    '(input)': 'onChange($event.target.value)',
  }
})
export class CustomValueAccessor {
  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
}
```

The `setUpModelChangePipeline` will allow the `AbstractControlDirective` to **connect** the **model** with the **view**. This means that every time `FormControl.setValue()` is invoked, **all the callback functions registered** within that `FormControl` will be invoked as well, in order to update that view based on the new model's value.

Notice that I said **all the callback function**. This is because multiple `AbstractControlDirective` can make use of the same `FormControl` instance.

```ts
// Inside `FormControl`
_onChange: Function[] = [];
registerOnChange(fn: Function): void { this._onChange.push(fn); }
```

```ts
// FormControl.setValue
setValue(value: any, options: {
  onlySelf?: boolean,
  emitEvent?: boolean,
  emitModelToViewChange?: boolean,
  emitViewToModelChange?: boolean
} = {}): void {
  (this as{value: any}).value = this._pendingValue = value;
  if (this._onChange.length && options.emitModelToViewChange !== false) {
    this._onChange.forEach(
        (changeFn) => changeFn(this.value, options.emitViewToModelChange !== false));
  }
  this.updateValueAndValidity(options); // Update ancestors
}
```

Here's an example:

```html
<form>
  <input type="radio" ngModel name="genre" value="horror">
  <input type="radio" ngModel name="genre" value="comedy">
</form>
```

The `setUpControl(control, dir)` will be called twice, once for every `ngModel`. But, on every call, the `control`(a `FormControl` instance) argument will be the same(you can read more on why this happens inside: A better understanding of(TODO: add link)). This means that `control.onChanges` will contain 2 callback function, one for each `ControlValueAccessor`(`<input type="radio">` has the `RadioControlValueAccessor` bound to it).

The `ControlValueAccessor.registerOnTouched` follows the same principle as `ControlValueAccessor.registerOnChange`:

```ts
// Called inside `setUpControl`
function setUpBlurPipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnTouched(() => {
    control._pendingTouched = true;

    if (control.updateOn === 'blur' && control._pendingChange) updateControl(control, dir);
    if (control.updateOn !== 'submit') control.markAsTouched();
  });
}
```

This will allow the **model** to be **updated** whenever the **blur event occurs** inside the view.

---

## Template Driven Forms and Reactive Forms

Both strategies are very powerful, but, in my opinion, `Reactive Forms` come handy when dealing with complex, dynamic logic.

### Template Driven Forms

When using this strategy, most of the logic that concerns the form's construction is performed inside the view. This means that the `AbstractControl` tree **is** being **created** **while** the **view** is **being built**.

Here are the tools we can use when following this **template-driven** approach:

```ts
export const TEMPLATE_DRIVEN_DIRECTIVES: Type<any>[] =
    [NgModel, NgModelGroup, NgForm];
```

#### NgModel

It's a **form-control-based** directive, **connects** the **view layer** with the **model layer**(`FormControl`) and vice versa and. It also registers the `FormControl` into the `AbstractControl` tree.

When using this directive, you can also specify some options:

```ts
@Input('ngModelOptions')
  options !: {name?: string, standalone?: boolean, updateOn?: 'change' | 'blur' | 'submit'};
```

The `updateOn` option is discussed in Observing(TODO:(link)).

If you want to use a **standalone** `FormControl` instance, you can follow this approach:

TODO:(ng-run)

```html
<form #f="ngForm">
  <input [ngModelOptions]="{ standalone: true }" #myNgModel="ngModel" name="name" ngModel type="text">
</form>

{{ myNgModel.value }}

<br>

{{ f.value | json }}
```

#### NgModelGroup

Provides a way to group multiple `NgModel` and `NgModelGroup` directives. In the model layer, this is represented by a **non-top-level** `FormGroup` instance.
It also registers the `FormGroup` into the `AbstractControl` tree.

```html
<form> <!-- `NgForm` - automatically bound to `<form>` -->
  <input type="text" ngModel name="companyName"/>

  <div ngModelGroup="personal">
    <input type="text" ngModel name="name"/>

    <div ngModelGroup="address">
      <input type="text" ngModel name="city"/>
      <input type="text" ngModel name="street" />
    </div>
  </div>
</form>
```

The first occurrence of `NgModelGroup` must be a child of `NgForm`:

```html
<!-- Valid -->
<form>
  <ng-container #myGrp="ngModelGroup" ngModelGroup="address">
    <input type="text"ngModel name="city" />
    <input type="text" ngModel name="street">
  </ng-container>
</form>
```

```html
<!-- Invalid: `No provider for ControlContainer ...` -->
<div #myGrp="ngModelGroup" ngModelGroup="address">
  <input type="text"ngModel name="city" />
  <input type="text" ngModel name="street">
</div>
```

#### NgForm

It groups multiple `NgModel` and `NgModelGroup` directives. In the model layer, it is represented by a **top-level** instance, so it listens to form-specific events, such as `reset` and `submit`. Also, it is automatically bound to `<form>` tags. 

In the model, this is the root `FormGroup` instance of the `AbstractControl` tree.

```html
<form> <!-- NgForm -->
  <input ngModel name="companyName" type="text"> <!-- NgModel -->

  <div ngModelGroup="address"> <!-- NgModelGroup -->
    <input ngModel name="city" type="text"> <!-- NgModel -->
    <input ngModel name="street" type="text"> <!-- NgModel -->
  </div>
</form>
```

### Reactive Forms

As opposed to `Template Driven Forms`, when using `Reactive Forms` the form is **already created** **when** the **view** is **being built**.

Here are the tools we can use when following this **reactive** approach:

```ts
export const REACTIVE_DRIVEN_DIRECTIVES: Type<any>[] =
    [FormControlDirective, FormGroupDirective, FormControlName, FormGroupName, FormArrayName];
```

#### FormControlDirective

It is a **form-control-based** directive, it is the bridge between the 2 main layers: **view** and **model**.

It receives a `FormControl` instance(`[formControl]="formControlInstance"`) which is already synced with, because `formControlInstance` is already part of an existing `AbstractControl` tree. Therefore, the important thing to do here is just to bind the `formControlInstance` to the current **DOM element** by using the **value accessor**.

If you want to use a **standalone** `FormControl` instance, you can follow this approach:

```html
<input #f="ngForm" [formControl]="formControlInstance" type="text">

{{ f.value }}
```

#### FormGroupDirective

In the model layer, it is a top-level `FormGroup` instance(`<form [formGroup]="formGroupInstance">`). This also means that it listens to form-specific events, such as `reset` and `submit`. `formGroupInstance` is the root of an **already built** `AbstractControl` tree.

#### FormControlName

It receives a string as argument(`[formControlName]="nameOfFormControlInstance"`) and its task is to determine the `FormControl` instance depending on the provided control name(`nameOfFormControlInstance`) and the position in the view. If the `FormControl` instance is not found based on the path, an error will be thrown.

Thus, `nameOfFormControlInstance` must be a valid name, because it relies on the **form container** to correctly add this `FormControl` to the `AbstractControl` tree.

As mentioned before, the path is inferred based on the position of the **DOM element**(or custom component) and `nameOfFormControlInstance`:

```ts
// control - is, in this case, the top level `FormGroup` instance
function _find(control: AbstractControl, path: Array<string|number>| string, delimiter: string) {
  if (path == null) return null;

  if (!(path instanceof Array)) {
    path = (<string>path).split(delimiter);
  }
  if (path instanceof Array && (path.length === 0)) return null;

  return (<Array<string|number>>path).reduce((v: AbstractControl | null, name) => {
    if (v instanceof FormGroup) {
      return v.controls.hasOwnProperty(name as string) ? v.controls[name] : null;
    }

    if (v instanceof FormArray) {
      return v.at(<number>name) || null;
    }

    return null;
  }, control);
}
```

```html
<form [formGroup]="myFormGroup">
  <!-- path: 'name' -->
  <input formControlName="name" type="text">

  <!-- path: 'address' -->
  <ng-container formGroupName="address">
    <!-- path: ['address', 'city'] -->
    <input formControlName="city" type="text">

    <!-- path: ['address', 'street'] -->
    <input formControlName="street" type="text">
  </ng-container>
</form>
```

And this is how the path of each directive is determined:

```ts
export function controlPath(name: string, parent: ControlContainer): string[] {
  return [...parent.path !, name];
}
```

It is worth mentioning that `nameOfFormControlInstance` can't be dynamic. Once the `FormControl` is added, it can't be changed **automatically**.([Example](https://ng-run.com/edit/o2piqt1V5jzCxhSj2HJB))

Here's why:

```ts
@Directive({selector: '[formControlName]', providers: [controlNameBinding]})
export class FormControlName extends NgControl implements OnChanges, OnDestroy {
  /* ... */
  ngOnChanges(changes: SimpleChanges) {
    if (!this._added) this._setUpControl();
  }

  private _setUpControl() {
    this._checkParentType();

    // formDirective - points to the top-level `FormGroup` instance
    (this as{control: FormControl}).control = this.formDirective.addControl(this);
    if (this.control.disabled && this.valueAccessor !.setDisabledState) {
      this.valueAccessor !.setDisabledState !(true);
    }
    this._added = true;
  }
  /* ... */
}
```

However, if you still want to change the `FormControl` instance when the `nameOfFormControlInstance` changes, you can use this:

```ts
{FormArray|FormGroup}.setControl(ctrlName, formControlInstance)
```

#### FormGroupName

It receives a string as an argument(`[formGroupName]="nameOfFormGroupInstance"`) and based on that argument, it has to find the right `FormGroup` instance.

It can't be used as a top-level form control container, it must be registered within an exiting `FormGroupDirective`.

Suppose you have a form like this:

```ts
const address = this.fb.group({
  street: this.fb.control(''),
});

this.form = this.fb.group({
  name: this.fb.control(''),
  address,
});
```

Writing this in the view will result in an error(`Cannot find control with name: 'street'`):

```html
<form #f="ngForm" [formGroup]="form">
  <input formControlName="name" type="text">

  <input formControlName="street" type="text">
</form>
```

The way to solve this is to use the `FormGroupName` directive in order to create a **sub-group**, so that the view will correlate with model.

```html
<form #f="ngForm" [formGroup]="form">
  <input formControlName="name" type="text">

  <ng-container formGroupName="address">
    <input formControlName="street" type="text">
  </ng-container>
</form>

{{ f.value | json }}
```

Note: when using `FormControlDirective`(`[formControl]="formControlInstance"`)  this is not needed, because the `FormControlDirective` does not have to find the `FormControl` instance since it already receives one through `formControlInstance`.

#### FormArrayName

Same as `FormGroupName`, except that is has to find an existing `FormArray` instance in the `AbstractControl` tree.

```ts
this.fooForm = this.fb.group({
  movies: this.fb.array([
    this.fb.control('action'),
    this.fb.control('horror'),
    this.fb.control('mistery'),
  ]),
});
```

```html
<form #f="ngForm" [formGroup]="fooForm">
  <ng-container formArrayName="movies">
    <input
      *ngFor="let _ of fooForm.controls['movies'].controls; let idx = index;"
      [formControlName]="idx"
      type="text"
    >
  </ng-container>
</form>

{{ f.value | json }}
```

---

## Validators

Validators allow developers to put constraints on `AbstractControl` instances(`FormControl`, `FormArray`, `FormGroup`).

Validators are **set and run** when the `AbstractControl` tree is initialized. If you want to set them after the initialization has taken place, you can use `AbstractFormControl.setValidators` and `AbstractFormControl.setAsyncValidators` to set them and `AbstractFormControl.updateValueAndValidity` to run them.

```ts
setValidators(newValidator: ValidatorFn|ValidatorFn[]|null): void {
  this.validator = coerceToValidator(newValidator);
}

updateValueAndValidity(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
  /* ... */

  if (this.enabled) {
    this._cancelExistingSubscription();
    // Run sync validators
    // and will invoke `this.validator`
    (this as{errors: ValidationErrors | null}).errors = this._runValidator();
    // If `errors` property is not null -> status = 'INVALID'
    (this as{status: string}).status = this._calculateStatus();

    if (this.status === VALID || this.status === PENDING) {
      this._runAsyncValidator(opts.emitEvent);
    }
  }

  /* ... */

  if (this._parent && !opts.onlySelf) {
    this._parent.updateValueAndValidity(opts);
  }
}
```

From the above code snippet we can also deduce that **async validators** will **not** run if the **sync validators** returned **errors**.

### Usage of built-in Validators

The built-in validators are available as **directives** or as **static members** of `Validator` class.

For example, the **email validator** can be used directly in the view like this:

```html
<form>
  <input email ngModel name="email" type="text">
</form>
```

```ts
@Directive({
  selector: '[email][formControlName],[email][formControl],[email][ngModel]',
  providers: [EMAIL_VALIDATOR]
})
export class EmailValidator implements Validator {
  /* ... */

  validate(control: AbstractControl): ValidationErrors|null {
    return this._enabled ? Validators.email(control) : null;
  }

  /* ... */
}
```

Whereas with `Reactive Forms` you'd use it like this:

```ts
this.form = new FormGroup({
  name: new FormControl(defaultValue, [Validators.Email])
})
```

Although when using `Reactive Forms` the validators are usually set in the component class, you can still provide validators inside the view; when the `AbstractControl` instance is created, the validators will eventually be merged inside `setUpControl`

```ts
// dir.validator - sync validators provided via directives
// control.validator - sync validators provided through `Reactive Forms`(eg: new FormControl('', [syncValidators]))
export function setUpControl(control: FormControl, dir: NgControl): void {
  if (!control) _throwError(dir, 'Cannot find control with');
  if (!dir.valueAccessor) _throwError(dir, 'No value accessor for form control with');

  control.validator = Validators.compose([control.validator !, dir.validator]);
  control.asyncValidator = Validators.composeAsync([control.asyncValidator !, dir.asyncValidator]);
  
  /* ... */
}
```

### Validators' Composition

Validators can be provided from multiple sources: either form the view, or from the class, or from both.

All the validators will be eventually be **merged into** a **single function** that, when invoked, will execute all of them sequentially and accumulate their results(returned errors). 

Those which implement the `Validator` interface will be normalized first, meaning that will be transformed into a function that, when invoked, will execute the `Validator.validate` method:

```ts
export function normalizeValidator(validator: ValidatorFn | Validator): ValidatorFn {
  if ((<Validator>validator).validate) {
    return (c: AbstractControl) => (<Validator>validator).validate(c);
  } else {
    return <ValidatorFn>validator;
  }
}
```

Validators are set and merged(if needed) inside `setUpControl` function:

```ts
export function setUpControl(control: FormControl, dir: NgControl): void {
  if (!control) _throwError(dir, 'Cannot find control with');
  if (!dir.valueAccessor) _throwError(dir, 'No value accessor for form control with');

  control.validator = Validators.compose([control.validator !, dir.validator]);
  control.asyncValidator = Validators.composeAsync([control.asyncValidator !, dir.asyncValidator]);
  
  /* ... */
}
```

Let's explore the magic behind `Validators.compose`:

```ts
export class Validators {
  static compose(validators: (ValidatorFn|null|undefined)[]|null): ValidatorFn|null {
    if (!validators) return null;
    const presentValidators: ValidatorFn[] = validators.filter(isPresent) as any;
    if (presentValidators.length == 0) return null;

    return function(control: AbstractControl) {
      return _mergeErrors(_executeValidators(control, presentValidators));
    };
  }
}

function _executeValidators(control: AbstractControl, validators: ValidatorFn[]): any[] {
  return validators.map(v => v(control));
}

// Accumulate errors
function _mergeErrors(arrayOfErrors: ValidationErrors[]): ValidationErrors|null {
  const res: {[key: string]: any} =
      arrayOfErrors.reduce((res: ValidationErrors | null, errors: ValidationErrors | null) => {
        return errors != null ? {...res !, ...errors} : res !;
      }, {});
  return Object.keys(res).length === 0 ? null : res;
}
```

The same logic applies to `Validator.composeAsync`, with the exception of the way validators are executed. First, it will convert all the async validators into observables and then will execute them with the help of the `forkJoin` operator.

```ts
export class Validators {
  static composeAsync(validators: (AsyncValidatorFn|null)[]): AsyncValidatorFn|null {
    if (!validators) return null;
    const presentValidators: AsyncValidatorFn[] = validators.filter(isPresent) as any;
    if (presentValidators.length == 0) return null;

    return function(control: AbstractControl) {
      const observables = _executeAsyncValidators(control, presentValidators).map(toObservable);
      return forkJoin(observables).pipe(map(_mergeErrors));
    };
  }
}
```

### Custom Validators

A recommended way to create a custom validator is to create is as a directive:

```ts
// min-max-validator.directive.ts
@Directive({
  selector: '[min-max-validator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MinMaxValidator),
      multi: true,
    }
  ]
})
export class MinMaxValidator implements Validator {

  constructor() { }

  validate (f: FormGroup): ValidationErrors | null {
    if (f.pristine) {
      return null;
    }

    const { min, max } = f.controls;

    // `min` or `max` is not a number or is empty
    if (min.invalid || max.invalid) {
      return null;
    }

    if (+min.value >= +max.value) {
      return { minGreaterMax: 'min cannot be greater than max!' };
    }

    return null;
  }
}
```

```html
<form #f="ngForm">
  <ng-container min-max-validator ngModelGroup="price" #priceGrp="ngModelGroup">
    <input type="text" ngModel name="min" pattern="^\d+$" required />
    <input type="text" ngModel name="max" pattern="^\d+$" required >
  </ng-container>
</form>
```

[ng-run Example](https://ng-run.com/edit/Xx0irFLVo4FdueEBtSAF?open=app%2Fmin-max-example.component.ts)

### Dynamic Validators

The `Validator` interface looks like this:

```ts
export interface Validator {
  validate(control: AbstractControl): ValidationErrors|null;

  registerOnValidatorChange?(fn: () => void): void;
}
```

We can use the `registerOnValidatorChange` to register a **callback function** that should be called whenever the validator's inputs change. Invoking that callback function will ensure that your `AbstractControl` instance is in line with the updated validator.

Example: `<input [required]="true">` --> `<input [required]="false">`

```ts
@Directive({
selector:
    ':not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]',
providers: [REQUIRED_VALIDATOR],
host: {'[attr.required]': 'required ? "" : null'}
})
export class RequiredValidator implements Validator {
  set required(value: boolean|string) {
    this._required = value != null && value !== false && `${value}` !== 'false';
    if (this._onChange) this._onChange();
  }

  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }
}
```

```ts
export function setUpControl(control: FormControl, dir: NgControl): void {
  /* ... */
  
  // re-run validation when validator binding changes, e.g. minlength=3 -> minlength=4
  dir._rawValidators.forEach((validator: Validator | ValidatorFn) => {
    if ((<Validator>validator).registerOnValidatorChange)
      (<Validator>validator).registerOnValidatorChange !(() => control.updateValueAndValidity());
  });

  dir._rawAsyncValidators.forEach((validator: AsyncValidator | AsyncValidatorFn) => {
    if ((<Validator>validator).registerOnValidatorChange)
      (<Validator>validator).registerOnValidatorChange !(() => control.updateValueAndValidity());
  });

  /* ... */
}
```

[ng-run Example](https://ng-run.com/edit/Xx0irFLVo4FdueEBtSAF?open=app%2Fdynamic-validator.component.ts).

---

## Exploring built-in `ControlValueAccessor`s

These are the built-in value accessors that Angular provides us with:

```ts
const BUILTIN_ACCESSORS = [
  CheckboxControlValueAccessor,
  RangeValueAccessor,
  NumberValueAccessor,
  SelectControlValueAccessor,
  SelectMultipleControlValueAccessor,
  RadioControlValueAccessor,
];
```

In the upcoming sections we are going to explore the internals of some of the built-in value accessors.

### `SelectValueAccessor`

We can use this value accessor in 2 ways: by using either `[value]` or `[ngValue]`.

#### Using `<option [value]="primitiveValue">`

The `primitiveValue` argument, as its name implies, can't be something else than a **primitive value**. If you'd like to bind an object, `[ngValue]` should be your choice.

Each `<option>` will set its **value** to `primitiveValue`.

```ts
@Input('value')
set value(value: any) {
  this._setElementValue(value);
}

_setElementValue(value: string): void {
  this._renderer.setProperty(this._element.nativeElement, 'value', value);
}
```

[ng-run Example](https://ng-run.com/edit/Xx0irFLVo4FdueEBtSAF?open=app%2Fselect-example.component.ts).

#### Using `<option [ngValue]="primitiveOrNonPrimitiveValue">`

Unlike `[value]`, `[ngValue]` can take both **primitive** and **non-primitive** as arguments.

It will set the value of the `<option>` tag depending on the value provided to `[ngValue]`.

```ts
@Input('ngValue')
  set ngValue(value: any) {
    if (this._select == null) return;
    this._select._optionMap.set(this.id, value);
    this._setElementValue(_buildValueString(this.id, value));
    this._select.writeValue(this._select.value);
}

/* ... */

function _buildValueString(id: string | null, value: any): string {
  if (id == null) return `${value}`;
  if (value && typeof value === 'object') value = 'Object';
  return `${id}: ${value}`.slice(0, 50);
}
```

We can see that if we pass an object, the value will be something like `'1: Object'`. If we pass a primitive value, like the name of a city, the will be: `0: 'NY'`

It is important to notice that when you change the value of the `<select>`(by using `FormControl.setValue(arg)`), if `arg` is an object, you must make sure it is the same object that you've passed to `<option [ngValue]="arg"></option>`. That's because, by default, `SelectControlValueAccessor.writeValue(obj)`, it will use the `===` to identify the selected `option`.

```ts
writeValue(value: any): void {
    this.value = value;
    const id: string|null = this._getOptionId(value); // <---- Here!
    if (id == null) {
      this._renderer.setProperty(this._elementRef.nativeElement, 'selectedIndex', -1);
    }
    const valueString = _buildValueString(id, value);
    this._renderer.setProperty(this._elementRef.nativeElement, 'value', valueString);
}

_getOptionId(value: any): string|null {
  for (const id of Array.from(this._optionMap.keys())) {
    if (this._compareWith(this._optionMap.get(id), value)) return id;
  }

  return null;
}
```

Where `_compareWith` looks like this(by default):

```ts
return a === b || typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b);
```

[Here's a StackBlitz example](https://stackblitz.com/edit/select-ng-value?file=src%2Fapp%2Fapp.component.html) with a custom `_compareWith` function:

```ts
compareWith(existing, toCheckAgainst) {
  if (!toCheckAgainst) {
    return false;
  }
  return existing.id === toCheckAgainst.id;
}
```

```html
<!-- 
  1) Try without '[compareWith]="compareWith"'
  2) select another option(`B`, or `C`)
  3) click `change`

  You should not see the value updated inside the `<select>`
  and that is because the default impl. of `compareWith` will compare the values with `===`
-->
<select
  #s="ngModel"
  [ngModel]="selectedItem"
  [compareWith]="compareWith"
>
  <option
    *ngFor="let item of items"
    [ngValue]="item"
  >
    {{item.name}}
  </option>
</select>

<br><br>

<button (click)="s.control.setValue({ id: '1', name: 'A' })">change</button>
```

[Here](https://github.com/angular/angular/blob/master/packages/forms/test/value_accessor_integration_spec.ts#L216-L240) is the test case for such behavior.

### `SelectMultipleValueAccessor`

Each option is tracked(added to the internal `_optionMap` property), because
  
* when **change event** occurs on the `<select>`, the value accessor needs to provide the right values(the value provided to `[value]` or `[ngValue]` in `<option>`) to the model; this can be achieved with iterating over the selected options(`event.target.selectedOptions`) and retrieve their values from `_optionMap`.

  ```ts
  // _ - the select element
  this.onChange = (_: any) => {
    const selected: Array<any> = [];
    if (_.hasOwnProperty('selectedOptions')) {
      const options: HTMLCollection = _.selectedOptions;
      for (let i = 0; i < options.length; i++) {
        const opt: any = options.item(i);
        const val: any = this._getOptionValue(opt.value);
        selected.push(val);
      }
    }

    this.value = selected;
    fn(selected);
  };
  ```

* when value of the `FormControl` bound to the `<select>` element is changed programmatically(`FormControl.setValue()`), it needs to somehow determine which of the existing options match with the new provided values

  ```ts
  writeValue(value: any): void {
    this.value = value;
    let optionSelectedStateSetter: (opt: ɵNgSelectMultipleOption, o: any) => void;
    if (Array.isArray(value)) {
      // convert values to ids
      const ids = value.map((v) => this._getOptionId(v));
      optionSelectedStateSetter = (opt, o) => { opt._setSelected(ids.indexOf(o.toString()) > -1); };
    } else {
      optionSelectedStateSetter = (opt, o) => { opt._setSelected(false); };
    }
    this._optionMap.forEach(optionSelectedStateSetter);
  }
  ```

### `RadioValueAccessor`

This value accessor keeps track of the radio buttons with the help of an internal service: `RadioControlRegistry`, which holds an array of `[NgControl, RadioValueAccessor]` pairs, where `NgControl` is a provider token that maps to one of the form-control-based directives: `NgModel`, `FormControl`, `FormControlName`.

Let's see how it actually works:

```ts
@Injectable()
export class RadioControlRegistry {
  private _accessors: any[] = [];

  add(control: NgControl, accessor: RadioControlValueAccessor) {
    this._accessors.push([control, accessor]);
  }

  remove(accessor: RadioControlValueAccessor) {
    for (let i = this._accessors.length - 1; i >= 0; --i) {
      if (this._accessors[i][1] === accessor) {
        this._accessors.splice(i, 1);
        return;
      }
    }
  }

  select(accessor: RadioControlValueAccessor) {
    this._accessors.forEach((c) => {
      if (this._isSameGroup(c, accessor) && c[1] !== accessor) {
        c[1].fireUncheck(accessor.value);
      }
    });
  }

  private _isSameGroup(
      controlPair: [NgControl, RadioControlValueAccessor],
      accessor: RadioControlValueAccessor): boolean {
    if (!controlPair[0].control) return false;
    return controlPair[0]._parent === accessor._control._parent &&
        controlPair[1].name === accessor.name;
  }
}
```

Keep your eyes on the `RadioControlRegistry._isSameGroup` method.

Let's narrow it down with a simpler example:

```html
<form>
  <input ngModel name="option" value="value1" type="radio"> <!-- #1 NgModel._parent = the top-level `FormGroup` which results from `<form>` -->

  <ng-container ngModelGroup="foo">
    <input ngModel name="option" value="value1" type="radio"> <!-- #2 NgModel._parent = the sub-group `FormGroup` which results from `ngModelGroup` -->
  </ng-container>
</form>
```

_Note that both radio buttons have the same value!_

The `RadioControlRegistry._accessors` array would look like this:

```ts
[
  NgControl(-> NgModel) /* #1 */, RadioControlValueAccessor,
  NgControl(-> NgModel) /* #2 */, RadioControlValueAccessor,
]
```

When the user clicks on the first radio button, this method from `RadioControlRegistry` will be executed:

```ts
select(accessor: RadioControlValueAccessor) {
  this._accessors.forEach((c) => {
    if (this._isSameGroup(c, accessor) && c[1] !== accessor) {
      c[1].fireUncheck(accessor.value);
    }
  });
}
```

where `accessor` will be the `RadioControlValueAccessor` that belongs to the first radio button.

Here is once again the `_isSameGroup` method:

```ts
private _isSameGroup(
    controlPair: [NgControl, RadioControlValueAccessor],
    accessor: RadioControlValueAccessor): boolean {
  if (!controlPair[0].control) return false;
  return controlPair[0]._parent === accessor._control._parent &&
      controlPair[1].name === accessor.name;
}
```

`controlPair[0]._parent === accessor._control._parent` is what prevents the first radio button from affecting the second one.

With the following example, if we click on the **second button**, the first one will be marked as checked.

```html
<form>
  <input ngModel name="option" value="value1" type="radio">

  <input ngModel name="option" value="value1" type="radio">
</form>
```

That's because out of `N` radio buttons with the same `name` and `value` attributes, only one can be marked as checked. In this case, it is the last one that fulfills these conditions:

`this._isSameGroup(c, accessor) && c[1] !== accessor`

where `accessor` is the `RadioControlValueAccessor` of the selected radio button.

[ng-run Example](https://ng-run.com/edit/Xx0irFLVo4FdueEBtSAF?open=app%2Fradio-example.component.ts).

---

## A better understanding of the `AbstractControl` tree

Throughout the article you might have noticed the phrase **`AbstractControl` tree**. Remember that `AbstractControl` is an abstract class and its concrete implementations are `FormControl`, `FormGroup` and `FormArray`.

In order to make things more intuitive, we can visualize their connections as a tree structure.

For instance, this

```ts
new FormGroup({
  name: new FormControl(''),
  address: new FormGroup({
    city: new FormControl(''),
    street: new FormControl(''),
  }),
});
```

can be pictured as follows:

```ts
   FG
  /  \
 FC  FG
    /  \
   FC  FC
```

Using the above diagram we are going to understand how the tree is altered by common `AbstractControl` actions, such as `reset()`, `submit()`, `markAsDirty()`.

TODO: (link)
_I'd recommend reading [Basic Entities](#basic-entities) before continuing on._

TODO: search for the `statusChanges` subsection
* `FormControl.status` = DISABLED | INVALID | VALID | PENDING

### `_pendingDirty`, `_pendingValue`, `_pendingChange` and `_pendingTouched`

* link to [Connecting the dots](#add-link) - where you explain how `ControlValueAccessor` can communicate with a `FormControl`
* explain what they do and why they are useful - prevent from traversing the tree redundantly; TODO:(ex): `updateOn: 'blur'` - `input`, `blur`, `blur` - `pendingChange!`

These private properties of the `AbstractControl` class are details that you might not have to be concerned about. However, they play a significant role regarding the `AbstractControl` tree's effectiveness.

These properties are encountered in the context of a `FormControl` because their values depend on the values that are sent from the view(from the `ControlValueAccessor`). `FormControl` nodes are eventually going to update their ancestors.

#### `_pendingDirty`

A `FormControl` is considered `dirty` if the user has changed its value in the UI.

```ts
function setUpViewChangePipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnChange((newValue: any) => {
    /* ... */
    control._pendingDirty = true;

    if (control.updateOn === 'change') updateControl(control, dir);
  });
}

function updateControl(control: FormControl, dir: NgControl): void {
  if (control._pendingDirty) control.markAsDirty();
  /* ... */
}
```

The callback registered in with `dir.valueAccessor !.registerOnChange(cb)` will be invoked by the `ControlValueAccessor`(which resides in the **view layer**) whenever the value the UI changed.

The `AbstractControl.markedAsDirty` implementation looks like this:

```ts
markAsDirty(opts: {onlySelf?: boolean} = {}): void {
  (this as{pristine: boolean}).pristine = false;

  if (this._parent && !opts.onlySelf) {
    this._parent.markAsDirty(opts);
  }
}
```

So, if a `FormControl` is marked as dirty(due to UI change), all its ancestors will be updated accordingly(in this case, they will be marked as dirty).

```
   FG (3)
  /  \
 FC  FG (2)
    /  \
   FC  FC (1)

(1).parent = (2)
(2).parent = (3)
(3).parent = null(root)
```

Assuming `(1)` a `FormControl` bound to an `<input>` and the user has just typed in it, the above method will be invoked from the `updateControl` function: `control.markAsDirty()`, where `control` is `(1)`. This will propagate up to the root, the order being this: `(1) -> (2) -> (3)`. Thus, the entire tree will be marked as dirty!

There is also an option to solely mark `(1)` as dirty: `(1).markedAsDirty({ onlySelf: true })`.

#### `_pendingChange`

* prevent the tree from being redundantly traversed, as well as they 

#### `_pendingTouched`s

#### `_pendingValue`

* on `FormControl.setValue(newValue)` - the `_pendingValue` also becomes `newValue`; add example: `updateOn = 'blur'` and the user had already typed into the input, but in the meanwhile `FormControl.setValue(newValue)` was executed

### `AbstractControl.setValue()`

TODO: make sure it precedes `updateValueAndValidity` ! 😄

* `{FormGroup|FormArray}.setValue` vs `{FormGroup|FormArray}.patchValue`
  * the former will **require** you to **provide** a **value** for **all** the **existing controls**, whereas the latter will allow you to provide **values** for **any** of the **existing controls**
  * `{FormGroup|FormArray}.setValue`
    * will first check if you _provided_ an object which consists of all the existing controls
    * then it will check if you provided any **redundant** controls(controls that are **not** among the existing ones)

_`patchValue` example_ TODO: refactor with clearer examples :D

```ts
c = new FormControl('');
c2 = new FormControl('');
a = new FormArray([c, c2]);

a.patchValue([null]);
expect(a.value).toEqual([null, '']);

a.patchValue([, , 'three']);
expect(a.value).toEqual(['', '']);
```

_`setValue` example_

```ts
const c1 = new FormControl('c1');
const c2 = new FormControl('c2');

const a = new FormArray([c1, c2]);

a.setValue(['c1-updated', 'c2-updated', 'c3']); // Error: Cannot find form control at index 2
a.setValue(['c1-updated']); // Error: Must supply a value for form control at index: 1

a.setValue(['c1-updated', 'c2-updated']);

console.log(a.value); // ["c1-updated", "c2-updated"]
```

* when setting the value to an `AbstractControl`, unless `{ onlySelf: true }` is specified, its ancestors are also going to be updated:

```ts
c = new FormControl('');
c2 = new FormControl('');
a = new FormArray([c, c2]);

it('should emit one valueChange event per control', () => {
  form.valueChanges.subscribe(() => logger.push('form'));
  a.valueChanges.subscribe(() => logger.push('array'));
  c.valueChanges.subscribe(() => logger.push('control1'));
  c2.valueChanges.subscribe(() => logger.push('control2'));

  a.setValue(['one', 'two']);
  expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
});
```

* what happens with the `AbstractControl` tree on **reset**
parent ----> children(**depth first**)

* what happens with the `AbstractControl` tree on **submit**

```typescript
onSubmit($event) {
  (this as{submitted: boolean}).submitted = true;
  syncPendingControls(this.form, this.directives);
  this.ngSubmit.emit($event);
  return false;
}
```
* the `submitted` property becomes true, so you can **access** it now the **view** or in the **class**
* `syncPendingControls()`: some `AbstractControl` instances might have set the option `updateOn` differently. Therefore, if one `FormControl` has the `updateOn` option set to `submit`, it means that its **value** and **UI status**(`dirty`, `untouched`) will only be updated when the `submit` event occurs. It is important to mention that the above statement holds true unless the `FormControl` is manually altered(`control.markAsDirty`).
TODO: show example! :)

Consider this example:

```ts
this.form = this.fb.group({ name: this.fb.control('', { updateOn: 'submit' }) });

this.form.valueChanges.subscribe(console.warn);
```

When having a view like this

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input [formControl]="form.get('name')" type="text">

  <br><br>
  <button type="submit">Submit</button>
</form>
```
you get the **same values** **every time** the **submit** event occurs, whereas with this view

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="name" type="text">

  <br><br>
  <button type="submit">Submit</button>
</form>
```

   you get the **values** **only once**, when the **submit** event occurs

   That's because of the way `FormControlName` directives work inside a `FormGroupDirective`. A `FormGroupDirective` will keep track of `FormControlName` directives with the help of `directives` property. When the **submit** event occurs, each `FormControlName` will set the `_pendingChange` property of their bound `FormControl` to `false`.

   ```ts
  directives.forEach(dir => {
    const control = dir.control as FormControl;
    if (control.updateOn === 'submit' && control._pendingChange) {
      dir.viewToModelUpdate(control._pendingValue);
      control._pendingChange = false;
    }
  });
   ```

  `FormControl._pendingChange` is set to `true` every time the `change` event occurs.

  You can find more about `_pendingChange` [here](#add-link). TODO:

* how to get the form value, including the disabled controls ? : `FormGroup.getRawValue()`

#### How to mark all descendants of a control and the control itself as touched

* `markAllAsTouched`

```ts
// Put numbers beside child nodes so you can show the order in which they are marked as touched
// TODO: show ASCII graph! :)
const formArray: FormArray = new FormArray([
  new FormControl('v1'), new FormControl('v2'),
  new FormGroup({'c1': new FormControl('v1')}),
  new FormArray([new FormGroup({'c2': new FormControl('v2')})])
]);
markAllAsTouched(): void {
  this.markAsTouched({onlySelf: true});

  this._forEachChild((control: AbstractControl) => control.markAllAsTouched());
}
```

If you want to only mark this `AbstractControl` as touched you can use `AbstractControl.markAsTouched({ onlySelf: true })`, whereas if you want to mark its ancestors as well, you can simply omit the `{ onlySelf: true }` argument.

#### `_onCollectionChange`

* show when it is used(`FormGroupDirective`)
* when the **root of the tree** is **altered** **after the view** has been **built**; it's like **refreshing** the **tree**;
    https://ng-run.com/edit/rrYWgA7tmNKCSsFbpmfX
    If, for instance, a `FormArray`(let's call it `fa`) or a `FormGroup`(let's call it `fg`) is added to the root, every addition/removal of `fa` or `fg` will cause the entire tree to refresh itself

    ```html
     <form [formGroup]="form">
      <div formGroupName="signin" login-is-empty-validator>
        <input formControlName="login">
        <input formControlName="password">
      </div>
      <input *ngIf="form.contains('email')" formControlName="email">
    </form>`
    ```

    ```ts
    form.addControl('email', new FormControl('', Validators.email))
    fixture.detectChanges();
    ```

#### Retrieving `AbstractControl`s from the tree

* ways to retrieve form controls: `this.form.get(path)` -> `shared.ts: find()`
* `this.form.controls[nameOfCtrl]`
* `this.form.get('path.to.ctrl')`
* when the container is a `FormArray` instance `this.form.get('0.path')`
* `this.form.get(['path', 'to', 'ctrl'])`
* when verifying whether an `AbstractControl` has a certain error or not: `this.form.hasError(errName, 'path.to.ctrl')`

#### AbstractControl.updateValueAndValidity()

* how do a **FormControl container**'s status, value get updated ? (explain the flow: `child` -> `parent` : `this._parent.updateValueAndValidity`)
* invoked inside `AbstractControl.setValue()`
* explain visually :D
* arguments(options)
* how are value/status changes emitted ? :`updateValueAndValidity`

```ts
updateValueAndValidity(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
  this._setInitialStatus(); // DISABLED | VALID
  this._updateValue();

  if (this.enabled) {
    this._cancelExistingSubscription();
    (this as{errors: ValidationErrors | null}).errors = this._runValidator(); // Sync validators
    (this as{status: string}).status = this._calculateStatus(); // VALID | INVALID | PENDING | DISABLED

    if (this.status === VALID || this.status === PENDING) {
      this._runAsyncValidator(opts.emitEvent);
    }
  }

  /* Skipped for brevity */
}
```

### Setting Errors

* how are errors set ?
* why a validator must return null when there haven't been found any errors?
* manually setting errors: 
  * what happens to the form-control tree after `AbstractControl.setErrors(null)`?
    * only the status of this node and of each ancestor will be updated(and also `statusChanges` will emit if `emitEvent !== false`): `_updateControlsErrors`

### Disabling/enabling `AbstractControls`s

* explain `ControlValueAccessor.setDisabledState`
* The value is updated in the UI through `ControlValueAccessor.setDisabledState`

* when **disabling** an `AbstractControl` instance
  * you can choose not to update its ancestors by using `this.control.disable({ onlySelf: true })` (TODO: example); i.e: a `FormControl` might be part of the a `FormGroup` and because of this **control** being **invalid**, the entire `FormGroup` is marked as invalid; disabling this `FormControl` can influence the parent `FormGroup` or not(`this.control.disable({ onlySelf: true })`)
    ```ts
    const fg = this.fb.group({
      name: this.fb.control('', Validators.required),
      age: '',
      city: this.fb.control('', Validators.required)
    });


    fg.controls['name'].disable();
    fg.controls['city'].disable({ onlySelf: true });
    
    console.log(fg.valid) // false
    ```
  * you can be notified when an `AbstractControl` is **disabled** with the help of `valueChanges` and `statusChanges` event emitters; you can also choose not to be notified at all: `this.control.disable({ emitEvent: false })`(TODO: example)
  * when an `AbstractControl` is **disabled**, its validators won't run and its errors will be marked as `null`;
  * its children are also going to be disabled
  * only the `touch` and `dirtiness` statuses are affecting the control's ancestors
  * if **parent** has been marked **artificially dirty**(dirtiness **not determined** by its children: manually doing `control.markAsDirty`) -> there is **no need** to **recalculate** the **parent's dirtiness** based on the children because they don't have any influence the parent;
  for example
  
  ```typescript
  this.form = this.fb.group({
    name: this.fb.control({ value: 'andrei', disabled: false }),
    age: this.fb.control(''),
  });

  const nameCtrl = this.form.controls['name'];

  // Simulating user input...
  // Now, its ancestors will be marked as dirty as well
  // In this case, there is only one `FormGroup`(=form)
  nameCtrl.markAsDirty();

  nameCtrl.disable();

  // Now, form will be marked as `pristine`, because the child that influenced the parent's dirtiness
  // is disabled
  ```

If a `FormControl` container(`FormGroup` or `FormArray`) is disabled, its `value` will the value collected from all its descendants, regardless of their `disabled` value.

```typescript
const g = new FormGroup({
  name: new FormControl('name'),
  address: new FormGroup({
    city: new FormControl('city'),
    street: new FormControl('street'),
  }),
});

g.get('address.city').disable();
g.controls['name'].disable();

console.log(g.value);
/* 
{
  "address": {
    "street": "street"
  }
}
*/

g.disable();
console.log(g.value)
/* 
{
  "name": "name",
  "address": {
    "city": "city",
    "address": "address"
  }
}
```

The reason behind this is the way `AbstractControl.disable()` works. Starting from the current `AbstractControl` it will **first disable all its ancestors**, then collect their value. For example, here is how a `FormArray` would accumulate the values from its descendants:

```ts
_updateValue(): void {
  (this as{value: any}).value =
      this.controls.filter((control) => control.enabled || this.disabled)
          .map((control) => control.value);
}
```

The `control.enabled || this.disabled` expression allows us to get the value, even though the child control might be disabled.


mention that when a **control** is **disabled**, its `dirty` and `touched` statuses won't affect the status determination for its ancestors
  * a few things you can do while an `AbstractControl` is disabled
    * `setValue` - the validators won't be run
  
  ```ts
  it('should ignore disabled controls when determining touched state', () => {
      const c = new FormControl('one');
      const c2 = new FormControl('two');
      const g = new FormGroup({one: c, two: c2});
      c.markAsTouched();
      expect(g.touched).toBe(true);

      c.disable();
      expect(c.touched).toBe(true);
      expect(g.touched).toBe(false);

      c.enable();
      expect(g.touched).toBe(true);
    });
  ```

#### `FormGroup.reset()`

* `FormGroup.reset()`: 2 phases:
  * 1) its children are reset (top -> bottom)
  * 2) the ancestors are being updated(setting `pristine`, `touched` state and value) depending on their (fresh) children
* `_syncPendingControls`
* exemplify tree
* starting from the `FormGroup` in question, it will reset its descendants, if any descendants have other descendants on their own, it will reset them first and so on. Then, the ancestors will determine their **value**, **status**(`valid`, `invalid`), **UI status**(`dirty`, `touched`) based on those provided by the ancestors
* you can reset with initial values

```html
<form #f="ngForm">
    <input type="radio" ngModel name="food" value="chicken">
    <input type="radio" ngModel name="food" value="fish">
    <input type="radio" ngModel name="drink" value="cola">
    <input type="radio" ngModel name="drink" value="sprite">
</form>

<button (click)="f.resetForm({ food: 'fish' })">reset with val</button>

<button (click)="f.resetForm()">reset(empty)</button>
```

### How are CSS classes added depending on AbstractControl's status ?

* how are classes being added depending on status?
  * with the help of `NgControlStatus`, a directive that is automatically bound to a form control element when using `ngModel`, `formControl`, `formControlName`
  * at the same time, `NgControlStatusGroup` is added to the form group(`<form>`, `formGroupName`, `formGroup`, `ngModelGroup`, `formArrayName`)
  * both `NgControlStatus` and `NgControlStatusGroup` will be updated when change detection occurs
  * you can add your custom **css class** depending on form control's(or form control-container's) validity or user interaction status
  * in a **custom directive**, inject `NgControlStatus` or `NgControlStatusGroup` and based on their getters, add the corresp. classes
    ```ts
    constructor (private ngControlStatus: NgControlStatus) { }

    @HostBinding('[class.card__price--incorrect]') this.ngControlStatus.ngClassInvalid();
    ```
    _Note: in order for this to work, your element(or component), besides the above directive, must include one of these **FromControl**-based directives: `[formControlName],[ngModel],[formControl]`_

---

### When can an AbstractControl be updated ?

* `AbstractControl.updateOn` - unless explicitly set(i.e `new FormControl('', { updateOn: 'change' /* 'change' | 'blur' | 'submit' */ })`), it will be determined when this property will be accessed.

  ```ts
  get updateOn(): FormHooks {
    return this._updateOn ? this._updateOn : (this.parent ? this.parent.updateOn : 'change');
  }
  ```

  For instance, `AbstractControl.updateOn` is needed whenever the form is **submitted** 

  However, you can still set the value of any status of the control(`dirty`, `touched`, `pending`) **programmatically**, through: `FormControl.setValue`, `FormControl.markAsDirty()` etc...

  Consider this test case:

  ```ts
  @Component({selector: 'form-control-comp', template: `<input type="text" [formControl]="control">`})
  class FormControlComp {
    control !: FormControl;
  }

  it('should not use stale pending value if value set programmatically', () => {
    const fixture = initTest(FormControlComp);
    const control = new FormControl('', {validators: Validators.required, updateOn: 'blur'});
    fixture.componentInstance.control = control;
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'aa';
    dispatchEvent(input, 'input'); // (1)
    fixture.detectChanges();

    control.setValue('Nancy'); // (2)
    fixture.detectChanges();

    dispatchEvent(input, 'blur');
    fixture.detectChanges();

    expect(input.value).toEqual('Nancy', 'Expected programmatic value to stick after blur.');
  });
  ```
  **(1)**: `FormControl._pendingValue = 'aa'`
  **(2)**: `FormControl.value = FormControl._pendingValue = 'Nancy'`

  `FormControl._pendingValue` - an internal property, whose value changes on every `input` event;

  When a `FormControl` has the **update strategy** set on `blur`, this callback function will be invoked

  ```ts
    function updateControl(control: FormControl, dir: NgControl): void {
    if (control._pendingDirty) control.markAsDirty();
    control.setValue(control._pendingValue, {emitModelToViewChange: false});
    dir.viewToModelUpdate(control._pendingValue);
    control._pendingChange = false;
  }
  ```

  `FormControl.setValue` is defined like this

  ```ts
  setValue(value: any, options: /* ... */) {
    (this as{value: any}).value = this._pendingValue = value;

    /* ... Skipped for brevity ... */
  }
  ```

  _`(this as{value: any}).value` is used as opposed to `this.value` because the `value` property is declared like this `public readonly value: any;`_

  Consequently, after `control.setValue('Nancy')`(step **(2)**), the `control._pendingValue` will be `Nancy`, because after the **blur event** finally occurs, the previous `control._pendingValue='aa'` will have already been replaced with `Nancy`.

  The same goes for the `submit` strategy, except that the updates are executed inside `AbstractControl._syncPendingControls`, which for `FormControl` looks like this:

  ```ts
  _syncPendingControls(): boolean {
    if (this.updateOn === 'submit') {
      if (this._pendingDirty) this.markAsDirty();
      if (this._pendingTouched) this.markAsTouched();
      if (this._pendingChange) {
        this.setValue(this._pendingValue, {onlySelf: true, emitModelToViewChange: false});
        return true;
      }
    }
    return false;
  }
  ```

  _You can find more about `_syncPendingControls` in [What happens when a form is submitted](#add-link); TODO:_
  _You can read more about `_pendingDirty`, `_pendingValue`, `_pendingChange` [here](#add-link)_ TODO:
* `[ngFormOptions]="{ updateOn: 'change' | 'blur' | 'submit' }"` - applicable to `NgForm`
* `FormControl.updateOn` can me inherited from parent control(which will inherit from its parent and so on; defaults to `change`), unless manually specified(`this.fb.control('', { updateOn })`, or `<input [ngModelOptions]="{ updateOn }">`). If the `FormControl` is standalone, unless manually specified, `FormControl.updateOn` will default to `change` - TODO: examples
* `updatedOn` property
* why does `FormGroupDirective` keep track of `directives` when `FormControl`s are registered with `formControlName` ?
* the top level form directive(`NgForm`) tracks the existing directives. Because the form controls can be updated on `submit` event, after the form is submitted, the `NgForm` directive will go through each registered `NgModel` directive and will update its internal state and the view(if the view depends on that `NgModel` directive - `(ngModelChange)="doSmth()"`)

---

## FormBuilder

const address = this.fb.group({
  city: this.fb.control('default value', { 
    validators: [],
    asyncValidators: [],
    updateOn: 'blur' /* 'blur' | 'change'(default) | 'submit' */
  }),
  street: this.fb.control('', [/* validators */], [/* async validators */]),
  streetNumber: ['', [/* validators */] /* | validatorFn */, [/* async validators */] /* | asyncValidatorFn */],
  zip: '',
  country: { value: '', disabled: true },
});

With `FormBuilder`, you can create forms with less boilerplate.

Instead of doing this

```ts
this.form = new FormGroup({
  name: new FormControl(''),
  address: new FormGroup({ city: new FormControl({ value: '', disabled: true }) })
})
```

you can do this

```ts
this.form = this.fb.group({
  name: this.fb.control(''),
  address: this.fb.group({ city: this.fb.control({ value: '', disabled: true }) })
})
```

Using `FormBuilder`, `FormControl` instances can be declared as follows:

```ts
const address = this.fb.group({
  city: this.fb.control('default value', {
    validators: [],
    asyncValidators: [],
    updateOn: 'blur' /* 'blur' | 'change'(default) | 'submit' */
  }),
  street: this.fb.control('', [/* validators */], [/* async validators */]),
  streetNumber: ['', [/* validators */] /* | validatorFn */, [/* async validators */] /* | asyncValidatorFn */],
  zip: '',
});
```

---

## TODO

* create `ng-run` examples ! 😃
* check for **FROM** instead of **FORM** misspellings 😟
* diagrams for `disable()/enable()`, `reset()` ❓
* intro
* expect that...
* convert `Example` to `ng-run Example`

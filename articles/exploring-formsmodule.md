# A thorough exploration of Angular Forms

After delving into the `@angular/forms` package I've been able to get a better understanding of how things really work under the hood. In this article I'd like to share my vision with you. 

_Note: This article is based on **Angular 8.2.x**_.

## Contents

- [Base entities](#base-entities)
  - [AbstractControl](#abstractcontrol)
    - [FormControl](#formcontrol)
    - [FormArray](#formarray)
    - [FormGroup](#formgroup)
  - [AbstractControlDirective](#abstractcontroldirective)
  - [AbstractFormGroupDirective](#abstractformgroupdirective)
  - [ControlValueAccessor](#controlvalueaccessor)
  - [Connecting `FormControl` with `ControlValueAccessor`](#connecting-formcontrol-with-controlvalueaccessor)
- [Template Driven Forms and Reactive Forms](#template-driven-forms-and-reactive-forms)
  - [Template Driven Forms](#template-driven-forms)
    - [NgModel](#ngmodel)
    - [NgModelGroup](#ngmodelgroup)
    - [NgForm](#ngform)
  - [Reactive Forms](#reactive-forms)
    - [FormControlDirective](#formcontroldirective)
    - [FormGroupDirective](#formgroupdirective)
    - [FormControlName](#formcontrolname)
    - [FormGroupName](#formgroupname)
    - [FormArrayName](#formarrayname)
- [Validators](#validators)
  - [Usage of built-in Validators](#usage-of-built-in-validators)
  - [Validators' Composition](#validators-composition)
  - [Custom Validators](#custom-validators)
  - [Dynamic Validators](#dynamic-validators)
- [Exploring built-in `ControlValueAccessor`s](#exploring-built-in-controlvalueaccessors)
  - [`SelectValueAccessor`](#selectvalueaccessor)
    - [Using `<option [value]="primitiveValue">`](#using-option-value%22primitivevalue%22)
    - [Using `<option [ngValue]="primitiveOrNonPrimitiveValue">`](#using-option-ngvalue%22primitiveornonprimitivevalue%22)
  - [`SelectMultipleValueAccessor`](#selectmultiplevalueaccessor)
  - [`RadioValueAccessor`](#radiovalueaccessor)
- [A better understanding of the `AbstractControl` tree](#a-better-understanding-of-the-abstractcontrol-tree)
  - [`_pendingDirty`, `_pendingValue`, `_pendingChange`](#pendingdirty-pendingvalue-pendingchange)
    - [`_pendingChange`](#pendingchange)
    - [`_pendingDirty`](#pendingdirty)
    - [`_pendingValue`](#pendingvalue)
  - [`AbstractControl.setValue()` and `AbstractControl.patchValue()`](#abstractcontrolsetvalue-and-abstractcontrolpatchvalue)
    - [`patchValue` example](#patchvalue-example)
    - [`setValue` example](#setvalue-example)
  - [What happens with the `AbstractControl` tree on submit?](#what-happens-with-the-abstractcontrol-tree-on-submit)
  - [Retrieving `AbstractControl`s from the tree](#retrieving-abstractcontrols-from-the-tree)
  - [AbstractControl.updateValueAndValidity()](#abstractcontrolupdatevalueandvalidity)
  - [Disabling/enabling `AbstractControl`s](#disablingenabling-abstractcontrols)
  - [How are CSS classes added depending on AbstractControl's status ?](#how-are-css-classes-added-depending-on-abstractcontrols-status)
- [Conclusion](#conclusion)

## Base entities

In order to get the most out of the **Forms API**, we must ensure that we look over some of its essential parts.

### AbstractControl

This (**abstract**) class contains logic shared across `FormControl`, `FormGroup` and `FormArray`: 

* running validators
* changing and calculating UI status - `markAsDirty()`, `markAsTouched()`, `dirty`, `touched`, `pristine` etc...
* resetting status
* keeping track of validation status(`invalid`, `valid`)

This class, as well as its subclasses, can referred to as the **model layer** - it stores data related to a specific entity.

Multiple `AbstractControl`s can be seen as tree where the leaves are always going to be `FormControl` instances and the other 2 (`FormArray`, `FormGroup`) can be thought of as `AbstractControl` containers, which entails that they **can't be used as leaves** because they must contain at least on `AbstractControl` instance.

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

A `FormControl` can be considered **standalone** if it **does not belong** to an `AbstractControl` tree. As a result, it will be **completely independent**, meaning that its validity, value and user interaction won't be affect any of its **form container ancestors**([ng-run Example](https://ng-run.com/edit/Xx0irFLVo4FdueEBtSAF?open=app%2Fexample-standalone.component.ts)).

#### FormArray

It extends `AbstractControl` and its job is to group multiple `AbstractControl`s together.

From a tree perspective, it is a node that must contain at least one descendant. Its **validation status**, **dirtiness**, **touched status** and **value** usually depend on its descendants. There could be cases, though, where a container has certain validators so errors might appear at that node's level.

Its defining characteristic is that it stores its children in an **array**.

#### FormGroup

Same as `FormArray`, except that it stores its descendants in an **object**.

### AbstractControlDirective

It is the base class for **form-control-based directives**(`NgModel`, `FormControlName`, `FormControlDirective`) and contains **boolean getters** that reflect the current status of the bound control(`valid`, `touched`, `dirty` etc...).  
The previously mentioned control is bound to a **DOM element** with the help of a concrete implementation of `AbstractControlDirective`(`NgModel`, `FormControlName`) and a `ControlValueAccessor`.

Thus, this class can be thought of as a `middleman` that connects `ControlValueAccessor`(**view layer**) with `AbstractControl`(**model layer**) - more on that in the forthcoming sections.

It is worth mentioning that multiple `AbstractControlDirective`s can **bind the same** `AbstractControl` to multiple **DOM elements or custom components**, to multiple `ControlValueAccessor`s.

Consider this example:

```html
<form>
  <input ngModel name="option" value="value1" type="radio">

  <input ngModel="value3" name="option" value="value2" type="radio">

  <input ngModel="value1" name="option" value="value3" type="radio">
</form>
```

As a side note, providing a default value right from the template can be achieved by setting the last `ngModel` directive's value to the value of the radio button you want to be checked by default. In the above snippet, the first button will be checked.

This happens because the last directive will be the one which will have the _final_ call
of `setUpControl()` function.

```ts
export function setUpControl(control: FormControl, dir: NgControl): void {
  if (!control) _throwError(dir, 'Cannot find control with');
  if (!dir.valueAccessor) _throwError(dir, 'No value accessor for form control with');

  /* ... */

  dir.valueAccessor !.writeValue(control.value);
  
  /* ... */
}
```

[ng-run Example](https://ng-run.com/edit/Xx0irFLVo4FdueEBtSAF?open=app%2Fradio-example.component.ts).

### AbstractFormGroupDirective

It's a container for `AbstractFormGroupDirective` and `AbstractControlDirective` instances and its useful when you want to create a sub-group of `AbstractControl`s(eg: `address: { city, street, zipcode }`) or run validators for some specific `AbstractControls`(eg: min-max validator that makes sure that `min` control can't have a value that is greater than `max` control's value).

Its concrete implementations are: `formGroupName`, `formArrayName`, `ngModelGroup`.

```html
<form [formGroup]="filterForm">
  <ng-container formGroupName="price">
    <input formControlName="min" type="text">
    <input formControlName="max" type="text">
  </ng-container>
</form>
```

`FormGroupName`, being a subclass of `AbstractFormGroupDirective` it has all the attributes listed at the beginning of this section. It acts as a container for `AbstractControl` instances as well.
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

Only `FormControl` instances can 'directly' interact with a `ControlValueAccessor`, because, in a tree of `AbstractControl`s, a `FormControl` can only be the leaf node as it is not supposed to contain other nodes. Along these lines, we can deduce that **updates** that come **from the view** will **start** **from leaf** nodes.

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

* `writeValue()` - writes a new value to an element; the new value comes from the **MODEL**(`FormControl.setValue` -> `ControlValueAccessor.writeValue` -> update element -> change is visible in the UI)
* `registerOnChange()` - registers a **callback function** that will be called whenever the value **changes** **in** the **UI** and will **propagate** the new value to the model.
* `registerOnTouched()` - registers a **callback function** that will be called when the **blur** event occurs; the `FormControl` will be notified of this event as it may need to perform some updates when this event occurs.
* `setDisabledState` - will **disable/enable** the **DOM element** depending on the value provided; this method is usually called as a result of a change in the **MODEL**.

You can see these methods' usefulness in the following section: [Connecting `FormControl` with `ControlValueAccessor`](#connecting-formcontrol-with-controlvalueaccessor).

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

  You can read more about **built-in** accessors in [Exploring built-in `ControlValueAccessor`s](#exploring-built-in-controlvalueaccessors).

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

As you can see, the `setUpViewChangePipeline` method is how the `AbstractControlDirective`(the `dir` argument) connects the **view** with the **model**(unidirectional connection), by assigning a **callback function** to `ControlValueAccessor.onChange`. This will allow an action that happens in the view to be propagated into the model.

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

Notice that I said **all the callback functions**. This is because multiple `AbstractControlDirective` can make use of the same `FormControl` instance.

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

The `setUpControl(control, dir)` will be called twice, once for every `ngModel`. But, on every call, the `control`(a `FormControl` instance) argument will be the same. This means that `control.onChanges` will contain 2 callback function, one for each `ControlValueAccessor`(`<input type="radio">` has the `RadioControlValueAccessor` bound to it).

As a side note, the `ControlValueAccessor.registerOnTouched` follows the same principle as `ControlValueAccessor.registerOnChange`:

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

_[Back to Contents](#contents)_

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

If you want to use a **standalone** `FormControl` instance, you can follow this approach:

```html
<form #f="ngForm">
  <input [ngModelOptions]="{ standalone: true }" #myNgModel="ngModel" name="name" ngModel type="text">
</form>

{{ myNgModel.value }}

<br>

{{ f.value | json }}
```

[ng-run Example](https://ng-run.com/edit/Xx0irFLVo4FdueEBtSAF?open=app%2Fexample-standalone.component.ts).

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

_[Back to Contents](#contents)_

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
// dir.validator - sync validators provided via directives(eg: `<input email type="text">`)
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

A recommended way to create a custom validator is to use it as a directive that implements the `Validator` interface:

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

_[Back to Contents](#contents)_

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

When the user clicks on the **first** radio button, this method from `RadioControlRegistry` will be executed:

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

_[Back to Contents](#contents)_

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

_I'd recommend reading [Base entities](#base-entities) before continuing on._

### `_pendingDirty`, `_pendingValue`, `_pendingChange`

These private properties of the `AbstractControl` class are details that you might not have to be concerned about. However, they play a significant role regarding the `AbstractControl` tree's effectiveness.

These properties are encountered in the context of a `FormControl` because their values depend on the values that are sent from the view(from the `ControlValueAccessor`).

#### `_pendingChange`

This property indicates whether or not the user has changed the `FormControl`'s value.

Suppose you have an `<input ngModel name="name" type="text">` and the user types in it. As soon as that happens, the `ControlValueAccessor`'s `onChange` function will be invoked. The function that has been assigned to `onChange` looks as follows:

```ts
function setUpViewChangePipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnChange((newValue: any) => {
    control._pendingValue = newValue;
    control._pendingChange = true;
    control._pendingDirty = true;

    if (control.updateOn === 'change') updateControl(control, dir);
  });
}
```

`control._pendingChange = true` marks that the user has **visibly interacted** with the `<input>`.

Why is this useful anyway? It is because you can set the event on which the `AbstractControl` updates itself(it defaults to `change`).  
You can se the **update strategy** through `_updateOn` property: `_updateOn: 'change'|'blur'|'submit';`

With this mind, what would happen if the `FormControl` has the update strategy set to `blur`, and the `blur` event occurs in the view, without the user typing anything in the `<input>`? In this case, `_pendingChange` prevents the tree from being redundantly traversed.

```ts
function setUpBlurPipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnTouched(() => {
    /* ... */
    if (control.updateOn === 'blur' && control._pendingChange) updateControl(control, dir);
    /* ... */
  });
}
```

Had the user typed anything in the `<input>`, the `control._pendingChange` would've been set to `true`. As a result, the `FormControl` and its **ancestors** would've been updated when the blur event had occurred.

#### `_pendingDirty`

A `FormControl` is considered `dirty` if the user has changed its value in the UI.

```ts
function setUpViewChangePipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnChange((newValue: any) => {
    /* ... */
    control._pendingChange = true;
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

So, if a `FormControl` is marked as dirty(due to UI change), its ancestors will be updated accordingly(in this case, they will be marked as dirty).

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

Now you be wondering, what's the need of `_pendingDirty`, if the control's dirtiness will be changed as soon as the user types something in? This is because the default strategy defaults to `change`, but it can be changed to something else like `blur` or `submit`.

For example, here's what happens when the **blur event** occurs in the view:

```ts
function setUpBlurPipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnTouched(() => {
    /* ... */
    if (control.updateOn === 'blur' && control._pendingChange) updateControl(control, dir);
    /* ... */
  });
}
```


#### `_pendingValue`

You can think of the property as being the _freshest_ value of a `FormControl`.

Its value is set when the `ControlValueAccessor.onChange` is invoked, where `ControlValueAccessor.onChange` does this:

```ts
function setUpViewChangePipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnChange((newValue: any) => {
    control._pendingValue = newValue;

    /* ... */

    if (control.updateOn === 'change') updateControl(control, dir);
  });
}

function updateControl(control: FormControl, dir: NgControl): void {
  if (control._pendingDirty) control.markAsDirty();
  control.setValue(control._pendingValue, {emitModelToViewChange: false});
  dir.viewToModelUpdate(control._pendingValue);
  control._pendingChange = false;
}
```

However, what is the difference between `_pendingValue` and `value`? `_pendingValue` is the most recent value, whereas `value` is the value that is visible to the `AbstractControl` tree. The `value` is not always equal to `_pendingValue` as the `FormControl` might have a different update strategy than `change`. Of course, the view layer can hold the most recent value, but it doesn't mean that the model layer can.

For example, if the `FormControl`'s update strategy is set to `submit`, the model's value(`FormControl.value`) won't be equal to `_pendingValue`(which is the value that reflects the view) until the submit event occurs.

### `AbstractControl.setValue()` and `AbstractControl.patchValue()`

```ts
// {FormGroup|FormArray}.setValue
setValue(value: {[key: string]: any}, options: {onlySelf?: boolean, emitEvent?: boolean} = {}):
    void {
  this._checkAllValuesPresent(value);
  Object.keys(value).forEach(name => {
    this._throwIfControlMissing(name);
    this.controls[name].setValue(value[name], {onlySelf: true, emitEvent: options.emitEvent});
  });
  this.updateValueAndValidity(options);
}
```

```ts
// {FormGroup|FormArray}.patchValue
patchValue(value: {[key: string]: any}, options: {onlySelf?: boolean, emitEvent?: boolean} = {}):
    void {
  Object.keys(value).forEach(name => {
    if (this.controls[name]) {
      this.controls[name].patchValue(value[name], {onlySelf: true, emitEvent: options.emitEvent});
    }
  });
  this.updateValueAndValidity(options);
}
```

`AbstractControl.setValue` will **require** you to **provide** a **value** for **all** the **existing controls**, whereas `AbstractControl.patchValue` will allow you to provide **values** for **any** of the **existing controls**.

`{FormGroup|FormArray}.setValue` will first check if you provided an object which contains of all the existing controls, then it will check if you provided any **redundant** controls(controls that are **not** among the existing ones)

When calling `setValue`/`patchValue`, if `AbstractControl` is `FormControl`, it will first update the `FormControl` instance, then its ancestors. Otherwise, it will first update its descendants, then its ancestors.

Updating the ancestors can be avoided with `{ onlySelf: true }` passed as the second argument.

Here's once again the first example:

```ts
const fg = new FormGroup({
  name: new FormControl(''),
  address: new FormGroup({
    city: new FormControl(''),
    street: new FormControl(''),
  }),
});
```

```ts
   FG (4)
  /  \
 FC  FG (3) - address 
    /  \
   FC  FC
   (1) (2)
```

After performing

```ts
fg.get('address').setValue({ city: 'city', street: 'street' })
```

It will first update `(1)` and `(2)`, then it will update the value and validity of their container(`3`) and then it will finally update its ancestors.

#### `patchValue` example

```ts
const c = new FormControl('');
const c2 = new FormControl('');
const a = new FormArray([c, c2]);

a.patchValue(['andrei']);
console.log(a.value) // ['andrei', '']
```

#### `setValue` example

```ts
const c1 = new FormControl('c1');
const c2 = new FormControl('c2');

const a = new FormArray([c1, c2]);

a.setValue(['c1-updated', 'c2-updated', 'c3']); // Error: Cannot find form control at index 2
a.setValue(['c1-updated']); // Error: Must supply a value for form control at index: 1

a.setValue(['c1-updated', 'c2-updated']);

console.log(a.value); // ["c1-updated", "c2-updated"]
```

### What happens with the `AbstractControl` tree on submit?

_Note: Only `FormGroupDirective` and `NgForm` can call `onSubmit`_.

```typescript
onSubmit($event) {
  (this as{submitted: boolean}).submitted = true;
  syncPendingControls(this.form, this.directives);
  this.ngSubmit.emit($event);
  return false;
}
```

Some `AbstractControl` instances might have set the option `updateOn` differently. Therefore, if one `FormControl` has the `updateOn` option set to `submit`, it means that its **value** and **UI status**(`dirty`, `untouched` etc...) will only be updated when the `submit` event occurs. This is what `syncPendingControls()` does.

```ts
// FormControl
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

// FormArray - FormGroup works in a very similar fashion
_syncPendingControls(): boolean {
    let subtreeUpdated = this.controls.reduce((updated: boolean, child: AbstractControl) => {
      return child._syncPendingControls() ? true : updated;
    }, false);
    if (subtreeUpdated) this.updateValueAndValidity({onlySelf: true});
    return subtreeUpdated;
  }
```

Consider this example:

```ts
this.form = this.fb.group({ name: this.fb.control('', { updateOn: 'submit' }) });

this.form.valueChanges.subscribe(console.warn);
```

When having a view like this

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input [formControl]="form.get('name')" type="text">
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
    /* ... */
    control._pendingChange = false;
  }
});
```

`FormControl._pendingChange` is set to `true` every time the `change` event occurs in the UI.

```ts
function setUpViewChangePipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnChange((newValue: any) => {
    control._pendingValue = newValue;
    control._pendingChange = true;
    control._pendingDirty = true;

    if (control.updateOn === 'change') updateControl(control, dir);
  });
}
```

You can find more about `_pendingChange` [here](#pendingchange).

[ng-run Example](https://ng-run.com/edit/Xx0irFLVo4FdueEBtSAF?open=app%2Fsubmit-catch.component.ts).

### Retrieving `AbstractControl`s from the tree

```ts
const fg = new FormGroup({
  name: new FormControl(''),
  address: new FormGroup({
    city: new FormControl(''),
    street: new FormControl(''),
  }),
});
```

There are a couple of ways to retrieve an `AbstractControl`.

If the `AbstractControl` you want to retrieve is a direct descendant of a **form control container**(`fg` in this case), you can do this:

```ts
fg.controls[nameOfCtrl];

// In our example
fg.controls['name']
fg.controls['address']
```

However, if the `AbstractControl` is a few levels deep, you might find it annoying to write such things:

```ts
fg.controls['address'].controls['city']
```

You can use the `AbstractControl.get()` method instead

```ts
fg.get('address.city')

// Or

fg.get(['address', 'street'])
```

`AbstractControl.get()` will internally call a function `_find` which will traverse the tree downwards based on the path provided.
```ts

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

As you might have noticed, if `fg` had been a `FormArray` instance, you could've retrieved its descendants by specifying an **index**, as opposed to a **property name**(like you'd do with `FormGroup`)

```ts
fg.get('1.city');

// Or

fg.get(['1', 'city']);
```

### AbstractControl.updateValueAndValidity()

```ts
updateValueAndValidity(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
  this._setInitialStatus();
  this._updateValue();

  if (this.enabled) {
    this._cancelExistingSubscription();
    (this as{errors: ValidationErrors | null}).errors = this._runValidator(); // Sync validators
    (this as{status: string}).status = this._calculateStatus(); // VALID | INVALID | PENDING | DISABLED

    if (this.status === VALID || this.status === PENDING) {
      this._runAsyncValidator(opts.emitEvent);
    }
  }

  if (opts.emitEvent !== false) {
    (this.valueChanges as EventEmitter<any>).emit(this.value);
    (this.statusChanges as EventEmitter<string>).emit(this.status);
  }

  if (this._parent && !opts.onlySelf) {
    this._parent.updateValueAndValidity(opts);
  }
}
```

As shown above, this method is responsible for multiple things:

1) updating the current `AbstractControl`'s value
2) running validators(sync & async)
3) calculating status based on what validators return
4) emitting the new value and the new status to the subscribers(unless `emitEvent = false`)
5) repeating 1-4 for the parent(unless `onlySelf = true`)

```ts
const fg = new FormGroup({
  name: new FormControl(''),
  address: new FormGroup({
    city: new FormControl(''),
    street: new FormControl(''),
  }),
});
```

```
   FG (3)
  /  \
 FC  FG (2)
    /  \
   FC  FC (1)

(1) - fg.get('address.street')
(2) - fg.get('address')
(3) - fg
```

As soon as you do `(1).setValue('new value')`, `(1).updateValueAndValidity()` will be invoked.

```ts
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
  this.updateValueAndValidity(options);
}
```

After `(1)` has been updated, `(2)` will be updated and so on.. until the root is reached.

### Disabling/enabling `AbstractControl`s

An `AbstractControl` can be disabled/enabled from the **model**. The change can be seen in the view with the help of `ControlValueAccessor.setDisabledState`:

```ts
export function setUpControl(control: FormControl, dir: NgControl): void {
  /* ... */
  
  if (dir.valueAccessor !.setDisabledState) {
    control.registerOnDisabledChange(
        (isDisabled: boolean) => { dir.valueAccessor !.setDisabledState !(isDisabled); });
  }

  /* ... */
}
```

When **disabling** an `AbstractControl` instance you can choose not to update its ancestors by using `this.control.disable({ onlySelf: true })`. This might be the case when a `FormControl` might be part of the a `FormGroup` and because of this control being **invalid**, the entire `FormGroup` is marked as invalid.   

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

Had we omitted `{ onlySelf: true }`, the entire form group(`fg`) would've been valid(`fg.valid === true`).

```ts
disable(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
  // If parent has been marked artificially dirty we don't want to re-calculate the
  // parent's dirtiness based on the children.
  const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);

  (this as{status: string}).status = DISABLED;
  (this as{errors: ValidationErrors | null}).errors = null;
  this._forEachChild(
      (control: AbstractControl) => { control.disable({...opts, onlySelf: true}); });
  this._updateValue();

  if (opts.emitEvent !== false) {
    (this.valueChanges as EventEmitter<any>).emit(this.value);
    (this.statusChanges as EventEmitter<string>).emit(this.status);
  }

  // Will update the value, validity, dirtiness, and touch status
  this._updateAncestors({...opts, skipPristineCheck});
  this._onDisabledChange.forEach((changeFn) => changeFn(true));
}

private _updateAncestors(
    opts: {onlySelf?: boolean, emitEvent?: boolean, skipPristineCheck?: boolean}) {
  if (this._parent && !opts.onlySelf) {
    this._parent.updateValueAndValidity(opts);
    if (!opts.skipPristineCheck) {
      this._parent._updatePristine();
    }
    this._parent._updateTouched();
  }
}
```

When an `AbstractControl` is **disabled**, its validators won't run and its errors will be marked as `null` and its children are also going to be disabled.

If a **parent** has been marked **artificially dirty**(dirtiness is **not determined** by its children: manually doing `{FormGroup|FormArray}.markAsDirty`), there is **no need** to **recalculate** the **parent's dirtiness** based on the children because they don't have any effect on the parent:
  
```typescript
this.form = this.fb.group({
  name: this.fb.control({ value: 'andrei', disabled: false }),
  age: this.fb.control(''),
});

const nameCtrl = this.form.controls['name'];

// Now, its ancestors will be marked as dirty as well
// In this case, there is only one `FormGroup`(this.form)
nameCtrl.markAsDirty();

nameCtrl.disable();

// Now, `this.form` will be marked as `pristine`, because 
// the child that influenced the parent's dirtiness is disabled
```

Also, if a **form-control-container**(`FormGroup` or `FormArray`) is disabled, its `value` will the value collected from all its descendants, regardless of their `disabled` value:

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

The reason behind this is the way `AbstractControl.disable()` works. Starting from the current `AbstractControl` it will **first disable all its descendants**, then collect their value. For example, here is how a `FormArray` would accumulate the values from its descendants:

```ts
_updateValue(): void {
  (this as{value: any}).value =
      this.controls.filter((control) => control.enabled || this.disabled)
          .map((control) => control.value);
}
```

The `control.enabled || this.disabled` expression allows us to get the value, even though the child control might be disabled.

However, if the container is **not disabled** and the child control is, its value won't be taken into account.

If you still want to get the form value, **including** the **disabled controls** you can use `{FormGroup|FormArray}.getRawValue()`:

```ts
// FormArray.getRawValue()
getRawValue(): any[] {
  return this.controls.map((control: AbstractControl) => {
    return control instanceof FormControl ? control.value : (<any>control).getRawValue();
  });
}
```

### How are CSS classes added depending on AbstractControl's status ?

CSS classes(`ng-valid`, `ng-pristine`, `ng-touched` etc) are added with the help of `NgControlStatus` directive, which is automatically bound to a form control element when using `ngModel`, `formControl`, `formControlName`.

Additionally, `NgControlStatusGroup` is added to the form group(`<form>`, `formGroupName`, `formGroup`, `ngModelGroup`, `formArrayName`).

Both `NgControlStatus` and `NgControlStatusGroup` will be updated when change detection occurs.

```ts
export class AbstractControlStatus {
  private _cd: AbstractControlDirective;

  constructor(cd: AbstractControlDirective) { this._cd = cd; }

  get ngClassUntouched(): boolean { return this._cd.control ? this._cd.control.untouched : false; }
  get ngClassTouched(): boolean { return this._cd.control ? this._cd.control.touched : false; }
  get ngClassPristine(): boolean { return this._cd.control ? this._cd.control.pristine : false; }
  get ngClassDirty(): boolean { return this._cd.control ? this._cd.control.dirty : false; }
  get ngClassValid(): boolean { return this._cd.control ? this._cd.control.valid : false; }
  get ngClassInvalid(): boolean { return this._cd.control ? this._cd.control.invalid : false; }
  get ngClassPending(): boolean { return this._cd.control ? this._cd.control.pending : false; }
}

export const ngControlStatusHost = {
  '[class.ng-untouched]': 'ngClassUntouched',
  '[class.ng-touched]': 'ngClassTouched',
  '[class.ng-pristine]': 'ngClassPristine',
  '[class.ng-dirty]': 'ngClassDirty',
  '[class.ng-valid]': 'ngClassValid',
  '[class.ng-invalid]': 'ngClassInvalid',
  '[class.ng-pending]': 'ngClassPending',
};

@Directive({selector: '[formControlName],[ngModel],[formControl]', host: ngControlStatusHost})
export class NgControlStatus extends AbstractControlStatus {
  constructor(@Self() cd: NgControl) { super(cd); }
}
```

With that in mind you can add your custom **css class** depending on form control's(or form-control-container's) validity or user interaction status by using a **custom directive**
    
```ts
constructor (private ngControlStatus: NgControlStatus) { }

@HostBinding('[class.card__price--incorrect]') this.ngControlStatus.ngClassInvalid();
```

_Note: in order for this to work, your element(or component), besides the above directive, must include one of these **form-control-based** directives: `[formControlName],[ngModel],[formControl]`_

_[Back to Contents](#contents)_

## Conclusion

I hope this article has clarified some concepts and emphasized how powerful can this package be.

Thanks for reading!

# Exploring `FormsModule` in Angular

* if you used both `Template Driven Forms` and `Reactive Forms` until now, these should summarize them pretty well!

```typescript
export const TEMPLATE_DRIVEN_DIRECTIVES: Type<any>[] =
    [NgModel, NgModelGroup, NgForm, NgFormSelectorWarning];

export const REACTIVE_DRIVEN_DIRECTIVES: Type<any>[] =
    [FormControlDirective, FormGroupDirective, FormControlName, FormGroupName, FormArrayName];
```

* `SHARED_FORM_DIRECTIVES`

---

## Article Plan

* start with exposing
  * the base classes: `AbstractControl`, `AbstractFromGroupDirective`, `AbstractControlDirective`
    * `AbstractControl` contains logic shared across `FormControl`, `FormGroup` and `FormArray`; ex: `markAsDirty()`
  * the base classes which are also **DI tokens**: `NgControl`, `ControlContainer`
* define `AbstractControl` tree
* what is `ControlValueAccessor` and why is it essential for the **Forms API**?

* expose validators and how they can be used, depending on the context(add examples! :D)
  * explain validators' composition

---

## TODO

* Diff between `ngModelGroup` and `NgForm`/`FormGroup`
  * `NgForm` directive or `FormGroup` directive should be top-level `FormGroup` instance, because they have no `_parent` property

* ways to retrieve form controls: `this.form.get(path)` -> `shared.ts: find()`

* how to handle multiple checkbox buttons using `TDR`: `ngModelGroup`

* Ways to set the default value on multiple radio buttons
  *  `{{ true && first.valueAccessor.writeValue('foo1') }}`
  *  `<input ngModel="foo3" name="option" value="foo4" type="radio"> - explain why you use the last radio btn`

* Connecting `ControlValueAccessor` and `AbstractControl`
  * `registerOnDisabledChange`

* `AbstractControl.updateValueAndValidity()` - explain visually :D

* how are value/status changes emitted ? :`updateValueAndValidity`

* component registered as a `FormArray`

* how are errors set ?

* `_syncPendingControls`

* `Validator.registerOnValidatorChange`

* using components as form controls inside forms(`TDF`, `RF`)

* When is it recommended to use one over the other?
  * add `generalization`
  * `RF` - when dealing with checkboxes
  * `RF` - the form is **already created** **when** the **view** is **being built**
  * `TDF` - the form **is** being **created** **while** the **view** is **being built**

* explain the flow (setting up, how entities communicate with each other)
  * come up with an illustration eventually
  * 3 main entities(`ControlValueAccessor`, `FormDirective`, `AbstractControl`)

* show how can one use `NgControl` provider token in order to get the current `FormControl`-based directive

* explain how validators are set up for a **FormControl**(`FormControl.updateValueAndValidity`)

* `PENDING` status

* how do a **FormControl container**'s status, value get updated ? (explain the flow: `child` -> `parent` : `this._parent.updateValueAndValidity`)

* explain `/home/anduser/Documents/WORKSPACE/tiy/04_angular/angular/packages/examples/forms/ts/ngModelGroup/ng_model_group_example.ts`

* why a validator must return null when there haven't been found any errors?

* custom `control.registerOnDisabledChange` (`shared.ts`)

* make illustrations! :)

* title: `Observing an AbstractControl`

* raise GitHub issue about `required if control is dirty` :D

### NgModel


TODO: create GIF
`standalone` - won't be registered as a child **form control**, will be **completely independent**. This means that its validity, value and user interaction reflect into any of its **form container ancestors**

```html
<form #f="ngForm">
  <input [ngModelOptions]="{ standalone: true }" #myNgModel="ngModel" name="name" ngModel type="text">
</form>

{{ myNgModel.value }}

<br>

{{ f.value | json }}
```

---

## Questions

* how to get the form value, including the disabled controls ? : `FormGroup.getRawValue()`

* why does `FormGroupDirective` keep track of `directives` when `FormControl`s are registered with `formControlName` ?

* control must be defined as `standalone` in ngModelOptions.

* how does angular track radio buttons ?

* how are classes being added depending on status?  `/home/anduser/Documents/WORKSPACE/tiy/04_angular/angular/packages/forms/src/directives/ng_control_status.ts`
  * with the help of `NgControlStatus`, a directive that is automatically bound to a form control element when using `ngModel`, `formControl`, `formControlName`
  * at the same time, `NgControlStatusGroup` is added to the form group(`<form>`, `formGroupName`, `formGroup`, `ngModelGroup`, `formArrayName`)
  * both `NgControlStatus` and `NgControlStatusGroup` will be updated when change detection occurs

* what happens with the `AbstractControl` tree on
  * **submit** ?
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
  * **reset** ?

---

## Notes

* `form_provider.ts` exports `FormsModule` &  `ReactiveFormsModule`; both make use of `InternalFormsSharedModule` which only exports `SHARED_FORM_DIRECTIVES`

* 3 types of **ValueAccessors**: `custom`, `built-in`, `default`

### FormsModule

* imports/exports `TEMPLATE_DRIVEN_DIRECTIVES`

* template-driven - most of the form logic is done inside the template

* you can use the email validator in the context of template driven like this:
 `[email][formControlName],[email][formControl],[email][ngModel]`;
  whereas when using reactive forms you have to add the validator this way:
  `({ name: this.fb.control(defaultValue, [Validators.Email]) })`

### ReactiveFormsModule

* the `AbstractControl`'s tree is already built

* imports/exports `REACTIVE_DRIVEN_DIRECTIVES`

### Template Driven Forms

* the `AbstractControl`'s tree is built in parallel with the view

## Try

* `AbstractControlDirective`
* `NgControl` - `_pendingChange`, `control.updateOn`
* `NG_VALUE_ACCESSOR`
* `ng_form.ts` - L184
* `form_group_directive` - `addControl()` - how are the validators bounded?
* track the `pending` status when `AsyncValidators` occur
* nested form groups
* `control.validator = Validators.compose([control.validator !, dir.validator]);`(`shared.ts`) - because of `FormControl`(`RF`)
* how do `AsyncValidators` fit in?
* nested form groups + **validators**

## Takeaways

* use case for `FormGroupName`

Suppose you have a form like this

```ts
// TODO: simply it! :)
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

console.log(address)

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

The way to solve this is to use the `FormGroupName` directive in order to create a **sub-group** that will reflect the **top-level** `FormGroup` instance

```html
<form #f="ngForm" [formGroup]="form">
  <input formControlName="name" type="text">

  <ng-container formGroupName="address">
    <input formControlName="street" type="text">
  </ng-container>
</form>

{{ f.value | json }}
```

* (using `FormBuilder`) when creating a `FormGroup` instance, its `FormControl` instances can be declared as follows

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

* using radio buttons with same names, but different parents:

```html
<form #f="ngForm"> 
  <input ngModel name="name" type="text">

  <input #first="ngModel" ngModel name="option" value="foo1" type="radio">
  <input ngModel name="option" value="foo2" type="radio">
  <input ngModel name="option" value="foo3" type="radio">
  <input ngModel name="option" value="foo4" type="radio">

  <br>
  
  <!-- Same name, but different parents -->
  <ng-container ngModelGroup="foo">
    <input ngModel name="option" value="foo2" type="radio">
    <input ngModel name="option" value="foo3" type="radio">
  </ng-container>
</form>

{{ f.value | json }}
```

* `FormGroup.setValue` vs `FormGroup.patchValue`: the former will **require** you to **provide** a **value** for **all** the **existing controls**, whereas the latter will allow you to provide **values** for **any** of the **existing controls**

* implement a **custom validator** by using a **directive** that implements `Validator`; this way, you can use the validator with both `Template Driven Forms` and `Reactive Forms`

* you can get the current **form group instance** by using `ngForm`
  * when using `TDF` - `NgForm` is automatically created
  * when using `RF` - `<form>` is inert. a `FromGroupDirective` instance will only be created if using `[formGroup]`

* using `<input ngModel name="foo">` - won't trigger change detection `NgModel.ngOnChanges()` as there is **no property binding**

* `FormControl.status` = DISABLED | INVALID | VALID | PENDING

* a **model** is an object that stores data related to a specific entity

TODO: Question: What happens when an `AbstractControl` is disabled ?
TODO: add case when the children do not influence parent's dirtiness
* when **disabling** an `AbstractControl` instance
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

### AbstractControlDirective(abstract class)

* base class for **FormControl-based directives**(`NgModel`, `FormControlName`, which are classes that extend `NgControl`)
* contains **boolean properties**(getters) that reflect the current status(`valid`, `touched`, `dirty`)
* contains `getError` && `hasError() -> !!getError()`

### NgControl(abstract class)

* a token for `FormControl`-based directives(`NgModel`, `FormControlName`, `FormGroupName` etc...)
* **binds** the `FormControl` to a **DOM element**(**form control element**) through the **directives** that **extend** this class(`NgModel`, `FormControl` etc..)
* contains information about the **validators**, the **value accessor** and the parent of the current directive

### FormControl(implements AbstractControl)

* tracks value, use interaction(`touched`, `pristine` statuses) and validation status(`VALID`, `INVALID`, `PENDING`)
* keeps the **view synced** with the **model**<p></p>

### FormGroup(implements AbstractControl)

* aggregates the value from its child `FormControl`s
* calculates its status depending on its children(if one `FormControl` child is invalid(has `errors !== null`), the entire `FormGroup` will be invalid)`

### AbstractControl

* base class for `FormControl`, `FormGroup`, `FormArray`
* provides functionality such as **running validators**, **resetting state** and calculating/accessing **validity status**

### ControlContainer

* contains multiple `NgControl` instances

### AbstractFormGroupDirective

* `AbstractFormGroupDirective.formDirective` will always return the top-level `FormGroup` instance

### FormControlDirective

* `[formControl]="formControlInstance"`: the `formControlInstance` is already placed in an existing `AbstractControl`'s tree; therefore, the important thing to do here is just bind the `formControlInstance` to the current **DOM element** by using the value accessor.

### FormControlName

* binds an existing `FormControl` instance to a **DOM element**
* `[formControlName]="existingControlName"`: `existingControlName` must be the name of an existing `FormControl` instance

```typescript
this.form = this.formBuilder.group({ name: this.formBuilder.control('') })
```

```html
<form>
  <input type="text" formControlName="name" placeholder="Enter Name..">
</form>
```

This condition must be met because it relies on the **form container**(a parent `FormGroup` instance) to correctly add this `FormControl` to the `AbstractControl` tree.

---

### NgModelGroup

TODO: try this!

* **binds** a `FormGroup` instance to a **DOM element**; the bound `FormGroup` instance must be a child of `NgModelGroup` or `NgForm`

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

* the first occurrence of `NgModelGroup` must be a child of `NgForm`

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

* TODO: show an example of how to properly create a validator so that it can be used with both forms
  * must implement `Validator/AsyncValidator`

* particularly useful when you want to validate a sub-group of controls
  For example, you have a **filter form** and you need to make sure that the **min filter** is always smaller than **max filter**:
  ```html
  <form #f="ngForm">
    <ng-container min-max-validator ngModelGroup="price" #priceGrp="ngModelGroup">
      <input type="text" ngModel name="min" pattern="^\d+$" required />
      <input type="text" ngModel name="max" pattern="^\d+$" required >
    </ng-container>
  </form>
  ```

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

```

---

### `NgModelGroup` vs `NgForm` and `FormGroupName` vs `FormGroup`

_`NgForm` in the context of `Template Driven Forms` === `FormGroup` in the context of `Reactive Forms`_.

_`NgModelGroup` in the context of `Template Driven Forms` === `FormGroupName` in the context of `Reactive Forms`_.

* an `NgForm`'s `FormGroup` instance is always the top-level one, because `NgForm` **does not** have a `_parent` property, whereas `NgModelGroup` **does**

* `NgForm` has the `submit` and `reset` event listeners **bound** to it
  
```ts
@Directive({
  selector: 'form:not([ngNoForm]):not([formGroup]),ngForm,ng-form,[ngForm]',
  providers: [formDirectiveProvider],
  host: {'(submit)': 'onSubmit($event)', '(reset)': 'onReset()'},
  outputs: ['ngSubmit'],
  exportAs: 'ngForm'
})
export class NgForm extends ControlContainer implements Form, AfterViewInit {}
```

---

### How does a control-based directive binds a `FormControl` instance to a DOM element with the help of a value accessor ?

```typescript
export function setUpControl(control: FormControl, dir: NgControl): void {
  if (!control) _throwError(dir, 'Cannot find control with');
  if (!dir.valueAccessor) _throwError(dir, 'No value accessor for form control with');

  control.validator = Validators.compose([control.validator !, dir.validator]);
  control.asyncValidator = Validators.composeAsync([control.asyncValidator !, dir.asyncValidator]);
  dir.valueAccessor !.writeValue(control.value);

  setUpViewChangePipeline(control, dir);
  setUpModelChangePipeline(control, dir);

  setUpBlurPipeline(control, dir);

  if (dir.valueAccessor !.setDisabledState) {
    control.registerOnDisabledChange(
        (isDisabled: boolean) => { dir.valueAccessor !.setDisabledState !(isDisabled); });
  }

  // re-run validation when validator binding changes, e.g. minlength=3 -> minlength=4
  dir._rawValidators.forEach((validator: Validator | ValidatorFn) => {
    if ((<Validator>validator).registerOnValidatorChange)
      (<Validator>validator).registerOnValidatorChange !(() => control.updateValueAndValidity());
  });

  dir._rawAsyncValidators.forEach((validator: AsyncValidator | AsyncValidatorFn) => {
    if ((<Validator>validator).registerOnValidatorChange)
      (<Validator>validator).registerOnValidatorChange !(() => control.updateValueAndValidity());
  });
}

// VIEW -> MODEL (input event)
function setUpViewChangePipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnChange((newValue: any) => {
    control._pendingValue = newValue;
    control._pendingChange = true;
    control._pendingDirty = true;

    if (control.updateOn === 'change') updateControl(control, dir);
  });
}

function setUpBlurPipeline(control: FormControl, dir: NgControl): void {
  dir.valueAccessor !.registerOnTouched(() => {
    control._pendingTouched = true;

    if (control.updateOn === 'blur' && control._pendingChange) updateControl(control, dir);
    if (control.updateOn !== 'submit') control.markAsTouched();
  });
}

function updateControl(control: FormControl, dir: NgControl): void {
  if (control._pendingDirty) control.markAsDirty();
  control.setValue(control._pendingValue, {emitModelToViewChange: false});
  dir.viewToModelUpdate(control._pendingValue);
  control._pendingChange = false;
}

function setUpModelChangePipeline(control: FormControl, dir: NgControl): void {
  control.registerOnChange((newValue: any, emitModelEvent: boolean) => {
    // control -> view
    dir.valueAccessor !.writeValue(newValue);

    // control -> ngModel
    if (emitModelEvent) dir.viewToModelUpdate(newValue);
  });
}
```

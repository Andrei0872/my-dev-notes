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

## TODO

* explain the flow (setting up, how entities communicate with each other)
  * come up with an illustration eventually

* show how can one use `NgControl` provider token in order to get the current `FormControl`-based directive

* explain how validators are set up for a **FormControl**(`FormControl.updateValueAndValidity`)

* `PENDING` status

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

* control must be defined as `standalone` in ngModelOptions.

* how does angular track radio buttons ?

* what is `NgModelGroup` ?

* how are classes being added depending on status?  `/home/anduser/Documents/WORKSPACE/tiy/04_angular/angular/packages/forms/src/directives/ng_control_status.ts`
  * with the help of `NgControlStatus`, a directive that is automatically bound to a form control element when using `ngModel`, `formControl`, `formControlName`
  * at the same time, `NgControlStatusGroup` is added to the form group(`<form>`, `formGroupName`, `formGroup`, `ngModelGroup`, `formArrayName`)

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

* imports/exports `REACTIVE_DRIVEN_DIRECTIVES`

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

## Takeaways

* implement a **custom validator** by using a **directive** that implements `Validator`; this way, you can use the validator with both `Template Driven Forms` and `Reactive Forms`

* you can get the current **form group instance** by using `ngForm`
  * when using `TDF` - `NgForm` is automatically created
  * when using `RF` - `<form>` is inert. a `FromGroupDirective` instance will only be created if using `[formGroup]`

* using `<input ngModel name="foo">` - won't trigger change detection `NgModel.ngOnChanges()` as there is **no property binding**

* `FormControl.status` = DISABLED | INVALID | VALID | PENDING

* a **model** is an object that stores data related to a specific entity

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
* keeps the **view synced** with the **model**

### AbstractControl

* base class for `FormControl`, `FormGroup`, `FormArray`
* provides functionality such as **running validators**, **resetting state** and calculating **validity status**

### ControlContainer

* contains multiple `NgControl` instances

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

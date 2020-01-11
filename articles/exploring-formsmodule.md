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

### Ideas

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


### Base entities

* define `AbstractControl`
  * `AbstractControl` contains logic shared across `FormControl`, `FormGroup` and `FormArray`; ex: `markAsDirty()`
* define `AbstractControlDirective` tree
  * an `AbstractControlDirective` contains an `AbstractControl` instance
  * **form-control-based** directive
  * binds an `AbstractControl` instance to a **DOM element**
* define `AbstractFromGroupDirective`

* what is `ControlValueAccessor` and why is it essential for the **Forms API**?(only a `FormControl` instance can directly interact with a `ControlValueAccessor`)

* show diagram(the simple one / first one)
* explain how a `FormControl` is set up + code snippets ❗️

* explain the **ViewToModel** and **ModelToView** pipelines

### Validators

* expose validators and how they can be used, depending on the context(add examples! :D)
  * explain validators' composition

### Built-in Control Value Accessors

* talk about the relevant ones(`RadioValueAccessor`, `SelectControlValueAccessor`)
  * `SelectControlValueAccessor` - 2 ways of using its API

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

### Use-cases

* the base classes which are also **DI tokens**: `NgControl`, `ControlContainer`
  * an example: a directive that injects one of these providers

---

### What happens when you perform
  
#### `FormGroup.reset()`

* exemplify tree
* starting from the `FormGroup` in question, it will reset its descendants, if any descendants have other descendants on their own, it will reset them first and so on. Then, the ancestors will determine their **value**, **status**(`valid`, `invalid`), **UI status**(`dirty`, `touched`) based on those provided by the ancestors

---

## TODO

* check for **FROM** instead of **FORM** misspellings 😟

* `_updateDOMValue`

* `_onCollectionChange`
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

* Diff between `NgModelGroup`/`FormGroupName` and `NgForm`/`FormGroup`
  * `NgForm`/`FormGroup` directive should be top-level `FormGroup` instance, because they have no `_parent` property
  * `NgForm`/`FormGroup` has **form events**(`reset`, `submit`) bound to it

* ways to retrieve form controls: `this.form.get(path)` -> `shared.ts: find()`

* how to handle multiple checkbox buttons using `TDR`: `ngModelGroup`

* Ways to set the default value on multiple radio buttons
  *  `{{ true && first.valueAccessor.writeValue('foo1') }}`
  *  `<input ngModel="foo3" name="option" value="foo4" type="radio"> - explain why you use the last radio btn`

* Connecting `ControlValueAccessor` and `AbstractControl`
  * `registerOnDisabledChange`
  * `registerOnChange`
  * example: a custom component that could be used as a form control

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

* make sure you check the paper! :)

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

* how to mark all descendants of a control and the control itself as touched ? : `markAllAsTouched`

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

* what happens to the form-control tree after `AbstractControl.setErrors(null)`?
  * only the status of this node and of each ancestor will be updated(and also `statusChanges` will emit if `emitEvent !== false`): `_updateControlsErrors`

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
  * **reset**: parent ----> children(**depth first**)

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
* because the form is built in parallel with the view, the top level form directive(`NgForm`) tracks the existing directives. Because the form controls can be updated on `submit` event, after the form is submitted, the `NgForm` directive will go through each registered `NgModel` directive and will update its interval state and the view(if the view depends on that `NgModel` directive - `(ngModelChange)="doSmth()"`)

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

* add to _Disabling section_; mention that when a **control** is **disabled**, its `dirty` and `touched` statuses won't affect the status determination for its ancestors
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

* `FormGroup.reset()`: 2 phases:
  * 1) its children are reset (top -> bottom)
  * 2) the ancestors are being updated(setting `pristine`, `touched` state and value) depending on their (fresh) children

* TODO: add to first section of the article(how things are connected with each other)
  * `View` -> `Model`: `ControlValueAccessor.onChange()`
  * `Model` -> `View`: `AbstractControl._onChange.forEach(fn => fn(v))`

* you can add your custom class depending on form control's(or form control-container's) validity or user interaction status
  * in a **custom directive**, inject `NgControlStatus` or `NgControlStatusGroup` and based on their getters, add the corresp. classes
    ```ts
    constructor (private ngControlStatus: NgControlStatus) { }

    @HostBinding('[class.card__price--incorrect]') this.ngControlStatus.ngClassInvalid();
    ```
    _Note: in order for this to work, your element(or component), besides the above directive, must include one of these **FromControl**-based directives: `[formControlName],[ngModel],[formControl]`_

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

* after `AbstractFormControl.setValidators` you'll have to manually run `AbstractFormControl.updateValueAndValidity` in order to **run** the new validators

* `FormArrayName`
  * similar to `FormGroupName`, but the **controls** are **stored** in an **array**, **instead** of an **object**
  * cannot be used as a top-level form control container, it must be registered within an exiting form directive
  * can have one of these parents: `FormGroupName`, `FormGroupDirective` or `FormArrayName`
  * use-case: an app where the user can choose a number of favorite movies

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

* `AbstractControl.updateOn` - unless explicitly set(i.e `new FormControl('', { updateOn: 'change' /* 'change' | 'blur' | 'submit' */ })`), it will be determined when this property will be accessed.

  ```ts
  get updateOn(): FormHooks {
    return this._updateOn ? this._updateOn : (this.parent ? this.parent.updateOn : 'change');
  }
  ```

  For instance, `AbstractControl.updateOn` is needed whenever the form is **submitted** 

* diff between `FormControlName` and `FormControl`

* `FormControlName`' values cannot be changed: https://ng-run.com/edit/o2piqt1V5jzCxhSj2HJB
  * `[formControlName]="dynamicValue"` - no matter how many times you change it, the `FormControl` instance will be bound to the first value of `dynamicValue`; 
    however, if you still want to change that form control, you can use `{FormArray|FormGroup}.setControl(ctrlName, AbstractControlInstance)`

* the `FormControl` is **already synced** within a `FormGroup` instance

```ts
// `form_control_name`
private _setUpControl() {
  this._checkParentType();
  (this as{control: FormControl}).control = this.formDirective.addControl(this);
  if (this.control.disabled && this.valueAccessor !.setDisabledState) {
    this.valueAccessor !.setDisabledState !(true);
  }
  this._added = true;
}
```

`this.formDirective` points to a parent `ControlContainer`(`FormGroupDirective`, `FormGroupName`, `FormArrayName`)

* use case for `FormGroupName`

_Note: when using `FormControlDirective`(`[formControl]="formControlInstance"`) - this is not needed_

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

This is possible because, under the hood, Angular keeps track of the radio buttons from the current view with the help of `RadioControlRegistry`.

`RadioControlRegistry` holds an array of `[NgControl, RadioValueAccessor]` pairs, where `NgControl` is a provider token that maps to one of the form-control-based directives: `NgModel`, `FormControl`, `FormControlName`

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
  <input ngModel name="option" value="value1" type="radio"> <!-- #1 NgControl._parent = the top-level `FormGroup` which results from `<form>` -->

  <ng-container ngModelGroup="foo">
    <input ngModel name="option" value="value1" type="radio"> <!-- #2 NgControl._parent = the sub-group `FormGroup` which results from `ngModelGroup` -->
  </ng-container>
</form>
```

_Note that both radio buttons have the same value!_

The `RadioControlRegistry._accessors` array would look like this:

```ts
[
  NgControl /* #1 */, RadioControlValueAccessor,
  NgControl /* #2 */, RadioControlValueAccessor,
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

* implement a **custom validator** by using a **directive** that implements `Validator`; this way, you can use the validator with both `Template Driven Forms` and `Reactive Forms`

* you can get the current **form group instance** by using `ngForm`
  * when using `TDF` - `NgForm` is automatically created
  * when using `RF` - `<form>` is inert. a `FromGroupDirective` instance will only be created if using `[formGroup]`

* using `<input ngModel name="foo">` - won't trigger change detection `NgModel.ngOnChanges()` as there is **no property binding**

* `FormControl.status` = DISABLED | INVALID | VALID | PENDING

* a **model** is an object that stores data related to a specific entity

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

### AbstractControlDirective(abstract class)

* base class for **FormControl-based directives**(`NgModel`, `FormControlName`, which are classes that extend `NgControl`)
* contains **boolean properties**(getters) that reflect the current status(`valid`, `touched`, `dirty`)
* contains `getError` && `hasError() -> !!getError()` - these methods are **facades** for `AbstractControl.{getError, hasError}`

### NgControl(abstract class)

* a token for `FormControl`-based directives(`NgModel`, `FormControlName`, `FormControl` etc...)
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
* the **async validators** will **not** run if the **sync validators** returned **errors**

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

### ControlContainer

* used as a provider token for form control **containers**(`FormGroupName`, `FormArrayName`, `NgForm`, `NgModelGroup`, `FormGroup`)
* contains multiple `NgControl` instances

### AbstractFormGroupDirective

* `AbstractFormGroupDirective.formDirective` will always return the top-level `FormGroup` instance

### FormControlDirective

* **binds** an **existing** `FormControl` instance to a **DOM element**

* the `FormControl` instance can be **standalone**

```html
<input #f="ngForm" [formControl]="form.controls['name']" type="text">

{{ f.value }}
```

* `[formControl]="formControlInstance"`: the `formControlInstance` is already placed in an existing `AbstractControl`'s tree; therefore, the important thing to do here is just bind the `formControlInstance` to the current **DOM element** by using the value accessor.

### FormControlName

* the `FormControl` must **not be standalone**: must have a parent `FromGroupDirective`(`[formGroup]`) or `FormGroupName` or `FormArrayName`
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

#### `NgModelGroup` & `FormGroupName` & `FormArrayName`

* both will have direct(sort of - through getters) access to the **top-level** `FormGroupDirective`

```ts
// TODO: use TS :D
testing_internal_1.beforeEach(function () {
                formModel = new forms_1.FormGroup({ 'login': new forms_1.FormControl(null) });
                var parent = new forms_1.FormGroupDirective([], []);
                parent.form = new forms_1.FormGroup({ 'group': formModel });
                p = parent;
                controlGroupDir = new forms_1.FormGroupName(parent, [], []);
                controlGroupDir.name = 'group';
            });
            testing_internal_1.it('should reexport control properties', function () {

              console.log(controlGroupDir.formDirective.form === p.form) // true
              console.log(controlGroupDir.formDirective === p) // true
```

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

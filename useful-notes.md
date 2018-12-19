
## List of useful terms

---

### Imperative Rendering

* describing how you want to render your view (jQuery)

### Declarative Rendering

* describing what you want to render


### .env file

* automatically picked up by the cli(for example: VUE cli)

* key:value pairs

* in VUE to be available: VUE_APP_YOURNAME

* you have 3 available modes: .env.test; .env.development; .env.production

### Binding

* the association of code/data with an identifier

### Lexical Binding

* the portion of source in which a binding of an identifier(scope) with a value exists

* taking(retrieving) values from the parent scope

<br>
```javascript
function outer() { // Parent scope
  const x = 5; // `free` variable
  return function () {
    const y = 7; // `bound` variable
    return x + y;
  }
}
```

### Arrow functions

* don't have their own this

* can't be called as a constructor

* don't have the `arguments` special variable

* can't change the `this` binding. however, you can still use `bind()`, `apply()`, `call()` for passing parameters

* can't be used as generator functions


### Checking if an input is empty with CSS

```
input:not(:placeholder-shown) {
  border-color: hsl(0, 76%, 50%);
}
```


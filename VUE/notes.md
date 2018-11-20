
## List of terms extracted from the documentation or other resources

---

### v- prefix for directives

``` v-bind:title="message"``` : {
    keep this element's title attribute up to date with the message property on the Vue instance
}

---

```v-on``` : let user interact with your app
attach event listeners that invoke methods on our Vue instances


---

```v-model``` = 2 way binding

---

```component``` = essentially a Vue instance with pre-defined options

---
```
Root Instance
└─ TodoList
   ├─ TodoItem
   │  ├─ DeleteTodoButton
   │  └─ EditTodoButton
   └─ TodoListFooter
      ├─ ClearTodosButton
      └─ TodoListStatistics
```
---

### Vue instance

When a Vue ```Instance``` is ```created```, it adds all the ```props found``` in 
its ```"data"``` obj ```to "Vue's reactivity system"```
When the ```values``` ```of``` those ```props change```, the ```view will "react"```, ```updating``` to match 
the ```new values```

props in "data" are only reactive if they existed when the instance was created
Vue's instance properties and methods : prefixed with $

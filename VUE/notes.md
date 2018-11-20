
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

4 steps 
1. set up data observation,
2. compile the template,
3. mount the instance to the DOM,
4. update the DOM when data changes


---

lifecycle hooks - give users the opportunity to add their own code at specific stages

all lifecycles hooks are called with their ```this``` context

---

v-once :  do not update on data change

---

v-bind : add attributes

---

you should not attempt to access user-defined globals in template expressions

---

### Directives

prefixed by ```v-```

its job is to ```reactively apply side effects to the DOM``` when the value of its expr changes

some directives can take an ```argument```, denoted by ```a colon``` after the directive name
```v-bind``` - used to reactively update an html attribute

---

### Computerd Properties and Watchers

computed properties are ```cached``` based on their dependencies
```computed prop ```- will only ```re-evaluate``` when some of ```its dependencies have changed```

```method``` -  will ```always``` run the function whenever a re-render happens

#### Computed vs Watched

when you have data that needs to change based on some other data: use ```watch```
however, it is ofter a ```better idea``` to use ```computed properties```

#### Watchers

useful when you want to perfom asynchronous or expensive operations in respons to changing data

---

### Controlling Reusable Elements

```key``` attr - unique values; don't reuse them
when Vue is updating a list of elements rendered with ```v-for```, by default it uses an ```in-place patch``` strategy
if the order has changed, instead of moving the DOM elems to match the order of items
Vue will patch each element in-place and make sure it reflects what should be rendered at that particular index
suitable when ```ur list render output does not rely on child componenent state or temporary DOM state(e.g form input value)```
<br>
to ```track``` each node's identity, and thus reuse and reorder existing elements, you need to ```provide an unique key```





----

```v-show``` -  the element will always be rendered and remain in the DOM;
             -  only toggles the ```display``` CSS property of the element
             - higher render costs
             - recommended if you need to toggle something very often

```v-if``` - it ensures that event listeners and child componentes inside the conditional block are ```properly destroyed``` and ```re-created``` during toggles
            - lazy : if the condition is false on initial render, it will not do anything
            - higher toggle costs
<br>
<br>

```v-for``` has a higher priority than ```v-if``` ===> ```v-if``` will run on each iteration of the loop separately

---

```components``` have isolated scopes of their own. To pass data into the component, use ```props```


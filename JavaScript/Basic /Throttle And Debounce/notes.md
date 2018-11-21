
### Debouncing and Throttling

* techniques to control how many times we allow a function to be executed over time

---

### Problems

<p>
Scrolling slowly in a smartphone could trigger as much as 100 events per second during test
</p>

### Debounce

* allow us to group multiple sequential calls in a single one
* execute this function only if X ms have passed without it being executed

---

### Throttle

* execute this function at most once every X ms 
* don't allow our function to execute more than once every X ms
* ensures the execution of the function regularly, at least every X ms
# Node.js Notebook

## Contents

- [Event Loop](#event-loop)

---

### Event Loop

**Knowledge**

* one macrotask should be processed in one cycle of the event loop

* after a macrotask has finished, all the available microtask should be processed within the same cycle

* microtasks can queue more microtasks which will be run one by one, until the microtask is exhaused

* when the stack is empty: microtasks are run

* when the microtask queue is empty: a pending macrotaks handler can be run

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


### DOM Stuff

```javascript 
  window.scrollX(Y)  //  returns the number of pixels that the document is currently scrolled horizontally(vertically)
  ``` 

```javascript
  window.scrollY || window.pageYOffset // window.scrollY - not supported in IE(11 or below)
```

### Fetch API

**The promise does not reject on HTTP error statuses**. The promise gets rejected only on **network error** (connection refused || name not solved)
<br>
Requesting a URL from a server that will return a 404 **will not fail**
<br>
To reject a promise, check the staus

```javascript
  fetch('https://jsonplaceholder.typicode.com/404')
  .then(res => {
    if(res.ok) {
      return res;
    } else {
      throw Error(`Request rejected with status ${res.status}`);
    }
  })
  .catch(console.error)
```

---

### Data Access Layer

- abstract the actual db engine or other data store, such that the app can switch from on db to another

- abstract the logical data model such that the Business Layer is decoupled from this knowledge and is agnostic of it(giving you the ability to modify the logical data model without impacting the business layer)

---

### Business Logic  

- refers to all algorithms and codes needed to make a piece of software work

- just the guts of the software needed to change a customer click into a request that the server can provide a response to

---

### Normalization && Denormalization

Normalization
- dividing data into multiple collections with references between these collections

- efficient data representation

Normalization Example
```bash
# We have a `users` collection
# We store each user's preferences in an `accountsPref` collection
# We store each article written by users in an `articles` collection

# Not really recommended
db.users.findOne({_id: userId})
{
  _id: ObjectId("5977aad83abbae8aef44b47b"),
  name: "John Doe",
  email: "johndoe@gmail.com",
  articles: [ # One-to-many relationship
    ObjectId("5977aad83abbae8aef44b47a"),
    ObjectId("5977aad83abbae8aef44b478"),
    ObjectId("5977aad83abbae8aef44b477")
  ],
  accountsPref: ObjectId("5977aad83abbae8aef44b476")
}

db.accountsPref.findOne({_id: id})
{
  _id: ObjectId("5977aad83abbae8aef44b490"),
  userId: ObjectId("5977aad83abbae8aef44b47b"),
  showFriends: true,
  notificationsOne: false,
  style: "light"
}
```
<br>
Denormalization

- will make data reading efficient

Denormalization Example

```bash
# Store the accounts preferences of each user as an embedded document

{
  _id: ObjectId("5977aad83abbae8aef44b47b"),
  name: "John Doe",
  email: "johndoe@gmail.com",
  articles: [
    ObjectId("5977aad83abbae8aef44b47a"),
    ObjectId("5977aad83abbae8aef44b478"),
    ObjectId("5977aad83abbae8aef44b477")
  ],
  accountsPref: {
    style: "light",
    showFriends: true,
    notificationsOn: false
  }
}
```

Pros

- one less query to get the information

Cons

- takes up more space and is more difficult to keep in sync

**Solution**
```bash
# Use a hybrid of referencing and embedding

{
  _id: ObjectId("5977aad83abbae8aef44b47b"),
  name: "John Doe",
  email: "johndoe@gmail.com",
  articles: [
    ObjectId("5977aad83abbae8aef44b47a"),
    ObjectId("5977aad83abbae8aef44b478"),
    ObjectId("5977aad83abbae8aef44b477")
  ],
  accountsPref: {
    _id: ObjectId("5977aad83abbae8aef44b490"),
    style: "light" # Assuming this filed is frequently used in our app
  }
}
```
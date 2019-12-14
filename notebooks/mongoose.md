
# Mongoose Notebook

- [Mongoose Notebook](#mongoose-notebook)
  - [About Mongoose](#about-mongoose)
  - [Mongoose Schema](#mongoose-schema)
  - [Models](#models)
  - [Virtual properties](#virtual-properties)
  - [Instance Methods](#instance-methods)
  - [Static Methods](#static-methods)
  - [Middlewares](#middlewares)

## About Mongoose

* ODM(Object Data Modeling) lib for MongoDB and Node.js

* manages relationships between data, provides schema validation and it is used to **translate** between obj in code and the repr of those object in MongoDB

---

## Mongoose Schema

* document data structure (shape of the document) that is enforced via the app layer

---

## Models

* high-order constructors that take schema and **create an instance of a document**

* wrapper on the Mongoose Schema

* provides an interface to the db for creating, updating etc...

---

## Virtual properties

- not persisted to the database

```javascript

userSchema.virtual('fullname').get(function () {
    return `${this.firstName} ${this.lastName}`;
})

userSchema.virtual('fullname').set(function (name) {
    const str = name.split(' ');
    
    this.firstName = str[0];
    this.lastName = str[1];
})

// Use case
const model = new UserModel();

model.fullname = 'Andrei Gatej';

```

--- 

## Instance Methods

* helper methods on the schema

* accessed via the **model instandce**

* will have access tot the model object

```javascript

userSchema.methods.getInitials = function () {
    return this.firstName[0] + this.lastName[0];
}

// Use case
console.log(model.getInitials())

```

---

## Static Methods

* accessible via the Model Class

```javascript

userSchema.statics.getUsers = function () {
    return new Promise((resolve, reject) => {
        this.find((err, docs) => {
            if(err) {
                console.error(err)
                return reject(err)
            }

            resolve(docs)
        })
    });
}

// Use case
UserModel.getUsers()
  .then(console.log)
  .catch(console.error)


```

---

## Middlewares 

* functions that run at specific stages of a pipeline

* for the following operations: Aggregation, Document, Query, Model

* *pre* and *post* take 2 params:
    * the type of the event: init, validate, savec, remove
    * cb tjat os executed wotj `this` referencing the **Model Instance**

```

User Model -> Pre-save Middl ->   save  -> Post save Middl
                |                   |               |
                |                   |               |
        generate pass hash      write to DB     send email when user acc is created

```

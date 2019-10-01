# Database Notebook


* [Concepts](#concepts)
* [Indexing](#indexing)
* [Normalization and Denormalization](#normalization-and-denormalization)

## Concepts

### Atomic operation

* **operations** that can be **performed** with the **data**, which are atomic(unbreakable) in nature

* the operation can **either succeed** or **fail**, it should never half succeed or half fail

* runs as a **single unit** and **avoid concurrency issues** with other operations in the db

### Transactions

* **group operations** into a **single unit** that can **avoid half succeeding** or **half failing** between operations

* won't lock rows during reading --> `concurrency`

### Data Access Layer

* abstract the actual db engine or other data store, such that the app can switch from on db to another

* abstract the logical data model such that the Business Layer is decoupled from this knowledge and is agnostic of it(giving you the ability to modify the logical data model without impacting the business layer)

---

## Indexing

[Resource](https://medium.freecodecamp.org/database-indexing-at-a-glance-bb50809d48bd) :sparkles:

### index vs key

* **index** - special **data structure** that **facilitates** data **search** across the table
  
* **key** - a **constraint** imposed on the **behavior** of the **column** is created on the columns specified in the `WHERE` clause

* a proper index can be created only when you know exactly what your query & data access patterns look like

* if you don't create an index, the db _scans all the rows_

* secondary indexes do not impact physical storage locations unlike primary indices

<details>
<summary>With index</summary>
<br>


```bash
explain select * from index_demo where phone_no = '7111';
+----+-------------+------------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
| id | select_type | table      | partitions | type  | possible_keys | key     | key_len | ref   | rows | filtered | Extra |
+----+-------------+------------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | index_demo | NULL       | const | PRIMARY       | PRIMARY | 22      | const |    1 |   100.00 | NULL  |
+----+-------------+------------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
# `rows` returns 1 -  the query optimizer just goes directly to the record & fetches it
```
</details>

<details>
<summary>Without index</summary>
<br>

```bash
explain select * from index_demo_2 where phone_no = '7111';
+----+-------------+--------------+------------+------+---------------+------+---------+------+------+----------+-------------+
| id | select_type | table        | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra       |
+----+-------------+--------------+------------+------+---------------+------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | index_demo_2 | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |    25.00 | Using where |
+----+-------------+--------------+------------+------+---------------+------+---------+------+------+----------+-------------+
```
</details>

---

## Normalization and Denormalization

### Normalization

* **dividing** data into multiple collections **with references** between these **collections**

* efficient data representation

<details>
<summary>
    Normalization Example
</summary>

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
</details>

### Denormalization

* will make data **reading efficient**

* one **less query** to get the **information**

* takes up **more space** and is more **difficult** to keep in **sync**

  <details>
  <summary>Solution</summary>
  <br>


  ```bash
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
      # Assuming this filed is frequently used in our app
      style: "light"
    }
  }
  ```
  </details>

<details>
  <summary>
      Denormalization Example
  </summary>

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
</details>

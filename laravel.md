
## Laravel pocket reference

### Middleware

- a man between the base layer of your app and getting to your controllers

```bash
# Create a middleware
php artisan make:middleware <name>

# In Kernel.php add path to $middleware
```

---

### Remove from db

```bash
php artisan migrate:rollback
```

---

### Notification

```bash
php artisan make:notificaiton <name>
```

- Every type of notification is a class

- Notifications are stored in db as JSON

---

### Schedule

- register them in Kernel.php

```bash
php artisan make:command <name>
php artisan schedule:run
```

---

### Job

```bash
# Create a queue 
php artisan queue:table
php artisan migrate

# Create a job
php artisan make:job <name>

# Run job
php artisan queue:work
```

---

### Pagination

```bash
# Modify the existing implementation
php artisan vender:publish --tag=laravel-pagination
```

---

### Creating stuff

```bash
# Create a model and also create a migration
php artisan make:model <name> -m (also make a migration)

# Controller for a CRUD app
php artisan make:controller <name> --resource
```

---

### JWT

* make sure that User.php implements JWTSubject

* auth.php : set driver: jwt

### Factory & Seeder

* UserFactory.php - define factories

```bash
# Create factory
php artisan make:factory <name>

# Create seeder
php artisan make:seeder <name> 

# Inside the seeder class
factory(<name>::class, <how_many>)->create();
```

---

### Validation

```bash
# Validate requests on back-end
php artisan make:request CreateCustomerRequest
```
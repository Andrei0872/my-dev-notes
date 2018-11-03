
-- https://www.youtube.com/watch?v=2HVMiPPuPIM

 select * from Customer;
+----+---------+-------------------+
| id | city_id | customer_name     |
+----+---------+-------------------+
|  1 |       3 | Shane Dooley      |
|  2 |       2 | Lavon Schroeder   |
|  3 |       1 | Mariela Emard     |
|  4 |       3 | Margie Macejkovic |
+----+---------+-------------------+

------------------------------------------
select * from City;
+----+--------------+
| id | city_name    |
+----+--------------+
|  1 | Willashire   |
|  2 | West Karson  |
|  3 | Port Bridget |
+----+--------------+

-------------------------------------------
--* Inner Join
select * from Customer inner join City on Customer.city_id = City.id;
+----+---------+-------------------+----+--------------+
| id | city_id | customer_name     | id | city_name    |
+----+---------+-------------------+----+--------------+
|  1 |       3 | Shane Dooley      |  3 | Port Bridget |
|  2 |       2 | Lavon Schroeder   |  2 | West Karson  |
|  3 |       1 | Mariela Emard     |  1 | Willashire   |
|  4 |       3 | Margie Macejkovic |  3 | Port Bridget |
+----+---------+-------------------+----+--------------+

-------------------------------------------
--* Left Join
-- Update the city_id from Customer table in order to see the difference
update Customer set city_id = 4 where Customer.id = 4;

select * from Customer;
+----+---------+-------------------+
| id | city_id | customer_name     |
+----+---------+-------------------+
|  1 |       3 | Shane Dooley      |
|  2 |       2 | Lavon Schroeder   |
|  3 |       1 | Mariela Emard     |
|  4 |       4 | Margie Macejkovic |
+----+---------+-------------------+

select * from City;
+----+--------------+
| id | city_name    |
+----+--------------+
|  1 | Willashire   |
|  2 | West Karson  |
|  3 | Port Bridget |
+----+--------------+

select * from Customer left join City on Customer.city_id = City.id;
+----+---------+-------------------+------+--------------+
| id | city_id | customer_name     | id   | city_name    |
+----+---------+-------------------+------+--------------+
|  3 |       1 | Mariela Emard     |    1 | Willashire   |
|  2 |       2 | Lavon Schroeder   |    2 | West Karson  |
|  1 |       3 | Shane Dooley      |    3 | Port Bridget |
|  4 |       4 | Margie Macejkovic | NULL | NULL         |
+----+---------+-------------------+------+--------------+

-- With left join, we get all results from the left table even if the codintion isn't met
 
-------------------------------------------
--* Right Join
-- Add a city that doesn't have a customer
insert into City( city_name) VALUES (  'Bucharest' );
insert into City( city_name) VALUES (  'Cluj' );


select * from Customer;
+----+---------+-------------------+
| id | city_id | customer_name     |
+----+---------+-------------------+
|  1 |       3 | Shane Dooley      |
|  2 |       2 | Lavon Schroeder   |
|  3 |       1 | Mariela Emard     |
|  4 |       4 | Margie Macejkovic |
+----+---------+-------------------+

select * from City;
+----+--------------+
| id | city_name    |
+----+--------------+
|  1 | Willashire   |
|  2 | West Karson  |
|  3 | Port Bridget |
|  4 | Bucharest    |
|  5 | Cluj         |
+----+--------------+

select * from Customer right  join City on Customer.city_id = City.id;
+------+---------+-------------------+----+--------------+
| id   | city_id | customer_name     | id | city_name    |
+------+---------+-------------------+----+--------------+
|    1 |       3 | Shane Dooley      |  3 | Port Bridget |
|    2 |       2 | Lavon Schroeder   |  2 | West Karson  |
|    3 |       1 | Mariela Emard     |  1 | Willashire   |
|    4 |       4 | Margie Macejkovic |  4 | Bucharest    |
| NULL |    NULL | NULL              |  5 | Cluj         |
+------+---------+-------------------+----+--------------+

-- With right join, we get all results from the right table even if the codintion isn't met


-------------------------------------------
--* Select specific columns

select cs.*, cy.city_name
    -> from Customer as cs
    -> inner join City cy on cs.city_id = cy.id;
+----+---------+-------------------+--------------+
| id | city_id | customer_name     | city_name    |
+----+---------+-------------------+--------------+
|  1 |       3 | Shane Dooley      | Port Bridget |
|  2 |       2 | Lavon Schroeder   | West Karson  |
|  3 |       1 | Mariela Emard     | Willashire   |
|  4 |       4 | Margie Macejkovic | Bucharest    |
+----+---------+-------------------+--------------+




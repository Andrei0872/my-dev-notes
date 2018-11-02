
select * from employee;
+----+------------+-----------+--------+
| id | first_name | last_name | salary |
+----+------------+-----------+--------+
|  1 | gatej      | andrei    |   5000 |
|  2 | mihai      | vasile    |   7600 |
|  3 | popescu    | ioana     |   4900 |
+----+------------+-----------+--------+


-- Select the max salary
select * from employee
    -> where salary = (select Max(salary) from employee)
    -> ;
+----+------------+-----------+--------+
| id | first_name | last_name | salary |
+----+------------+-----------+--------+
|  2 | mihai      | vasile    |   7600 |
+----+------------+-----------+--------+


-- Select the second max salary
SELECT Max(salary) as "Salary" 
    -> from employee
    -> where salary not in (select Max(salary) from employee);
+--------+
| Salary |
+--------+
|   5000 |
+--------+

-----------------------------------

SELECT `first_name`,Max(salary) as "Salary"      from employee     where salary not in (select Max(salary) from employee) group by first_name LIMIT 1;
+------------+--------+
| first_name | Salary |
+------------+--------+
| gatej      |   5000 |
+------------+--------+



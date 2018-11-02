


--* Inner Join Example

 select * from test.posts;
+----+-------+---------------------+-------------+
| id | name  | created_at          | category_id |
+----+-------+---------------------+-------------+
|  1 | post1 | 2018-08-31 14:47:47 |           1 |
|  2 | post2 | 2018-08-31 14:48:31 |           2 |
|  3 | post3 | 2018-08-31 14:48:28 |           2 |
|  4 | post4 | 2018-08-31 14:48:24 |           3 |
+----+-------+---------------------+-------------+


select * from category;
+----+------------+
| id | name       |
+----+------------+
|  1 | Business   |
|  2 | Technology |
|  3 | School     |
+----+------------+


-- Inner Join Without Extra Condition
select * from posts inner join category on posts.category_id = category.id;
+----+-------+---------------------+-------------+----+------------+
| id | name  | created_at          | category_id | id | name       |
+----+-------+---------------------+-------------+----+------------+
|  1 | post1 | 2018-08-31 14:47:47 |           1 |  1 | Business   |
|  2 | post2 | 2018-08-31 14:48:31 |           2 |  2 | Technology |
|  3 | post3 | 2018-08-31 14:48:28 |           2 |  2 | Technology |
|  4 | post4 | 2018-08-31 14:48:24 |           3 |  3 | School     |
+----+-------+---------------------+-------------+----+------------+


-- Inner Join With Extra Condition
select * from posts inner join category on posts.id = category.id 
        where posts.category_id = 2;
+----+-------+---------------------+-------------+----+------------+
| id | name  | created_at          | category_id | id | name       |
+----+-------+---------------------+-------------+----+------------+
|  2 | post2 | 2018-08-31 14:48:31 |           2 |  2 | Technology |
|  3 | post3 | 2018-08-31 14:48:28 |           2 |  3 | School     | -- 3 -> the id of School category
+----+-------+---------------------+-------------+----+------------+


--* Alter Table/Column

select *  from posts;
+----+-------+---------------------+-------------+
| id | name  | created_at          | category_id |
+----+-------+---------------------+-------------+
|  1 | post1 | 2018-08-31 14:47:47 |           1 |
|  2 | post2 | 2018-08-31 14:48:31 |           2 |
|  3 | post3 | 2018-08-31 14:48:28 |           2 |
|  4 | post4 | 2018-08-31 14:48:24 |           3 |
+----+-------+---------------------+-------------+

-- Change Table Name
alter table posts rename to posts_test;
select *  from posts_test;
+----+-------+---------------------+-------------+
| id | name  | created_at          | category_id |
+----+-------+---------------------+-------------+
|  1 | post1 | 2018-08-31 14:47:47 |           1 |
|  2 | post2 | 2018-08-31 14:48:31 |           2 |
|  3 | post3 | 2018-08-31 14:48:28 |           2 |
|  4 | post4 | 2018-08-31 14:48:24 |           3 |
+----+-------+---------------------+-------------+


-- Add Column after certaing existing columnn
-- ADD new_column_name datatype(length) AFTER existing_column
alter table posts_test add column test_column varchar(255) after created_at;
select * from posts_test;
+----+-------+---------------------+-------------+-------------+
| id | name  | created_at          | test_column | category_id |
+----+-------+---------------------+-------------+-------------+
|  1 | post1 | 2018-08-31 14:47:47 | NULL        |           1 |
|  2 | post2 | 2018-08-31 14:48:31 | NULL        |           2 |
|  3 | post3 | 2018-08-31 14:48:28 | NULL        |           2 |
|  4 | post4 | 2018-08-31 14:48:24 | NULL        |           3 |
+----+-------+---------------------+-------------+-------------+


-- Delete Column from Table
-- DROP column_to_delete
alter table posts_test drop column test_column;
select * from posts_test;
+----+-------+---------------------+-------------+
| id | name  | created_at          | category_id |
+----+-------+---------------------+-------------+
|  1 | post1 | 2018-08-31 14:47:47 |           1 |
|  2 | post2 | 2018-08-31 14:48:31 |           2 |
|  3 | post3 | 2018-08-31 14:48:28 |           2 |
|  4 | post4 | 2018-08-31 14:48:24 |           3 |
+----+-------+---------------------+-------------+


-- Change column name
alter table posts_test change name post_name varchar(255);
select * from posts_test;
+----+-----------+---------------------+-------------+
| id | post_name | created_at          | category_id |
+----+-----------+---------------------+-------------+
|  1 | post1     | 2018-08-31 14:47:47 |           1 |
|  2 | post2     | 2018-08-31 14:48:31 |           2 |
|  3 | post3     | 2018-08-31 14:48:28 |           2 |
|  4 | post4     | 2018-08-31 14:48:24 |           3 |
+----+-----------+---------------------+-------------+

-- Change column type

describe posts_test;
+-------------+--------------+------+-----+-------------------+-----------------------------+
| Field       | Type         | Null | Key | Default           | Extra                       |
+-------------+--------------+------+-----+-------------------+-----------------------------+
| id          | int(2)       | NO   | PRI | NULL              | auto_increment              |
| post_name   | varchar(255) | YES  |     | NULL              |                             |
| created_at  | timestamp    | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
| category_id | int(2)       | YES  |     | NULL              |                             |
+-------------+--------------+------+-----+-------------------+-----------------------------+

alter table posts_test modify post_name varchar(111);

 describe posts_test;
+-------------+--------------+------+-----+-------------------+-----------------------------+
| Field       | Type         | Null | Key | Default           | Extra                       |
+-------------+--------------+------+-----+-------------------+-----------------------------+
| id          | int(2)       | NO   | PRI | NULL              | auto_increment              |
| post_name   | varchar(111) | YES  |     | NULL              |                             |
| created_at  | timestamp    | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
| category_id | int(2)       | YES  |     | NULL              |                             |
+-------------+--------------+------+-----+-------------------+-----------------------------+

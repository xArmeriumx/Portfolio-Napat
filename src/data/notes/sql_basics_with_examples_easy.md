# SQL พื้นฐานสำหรับงานจริง (ฉบับเข้าใจง่าย)

เอกสารนี้สรุปเฉพาะหัวข้อที่เราเรียนกันไปก่อน โดยเน้นสิ่งที่ใช้จริงในงาน และอธิบายแบบค่อยเป็นค่อยไป พร้อมตัวอย่างตารางและ SQL

---

# 1) JOIN คืออะไร

JOIN คือการเชื่อมข้อมูลจากหลายตารางเข้าด้วยกัน เพราะในระบบจริงข้อมูลมักไม่ถูกเก็บไว้ตารางเดียว

ตัวอย่างข้อมูล

## ตาราง `customers`

| customer_id | name |
|---:|---|
| 1 | Aom |
| 2 | Bank |
| 3 | Chai |

## ตาราง `orders`

| order_id | customer_id | product |
|---:|---:|---|
| 101 | 2 | Mouse |
| 102 | 3 | Keyboard |
| 103 | 4 | Monitor |

สังเกตว่า:
- `orders.customer_id` ใช้อ้างถึงลูกค้า
- แต่ `customer_id = 4` ไม่มีอยู่ใน `customers`

---

## 1.1 INNER JOIN

ใช้เมื่ออยากได้เฉพาะข้อมูลที่ match กันทั้งสองตาราง

```sql
SELECT c.customer_id, c.name, o.order_id, o.product
FROM customers c
INNER JOIN orders o
  ON c.customer_id = o.customer_id;
```

ผลลัพธ์

| customer_id | name | order_id | product |
|---:|---|---:|---|
| 2 | Bank | 101 | Mouse |
| 3 | Chai | 102 | Keyboard |

ความหมาย:
- `Aom` ไม่แสดง เพราะไม่มี order
- `order_id 103` ไม่แสดง เพราะอ้างถึง customer ที่ไม่มีอยู่จริง

ใช้งานจริงเมื่อ:
- ต้องการเฉพาะข้อมูลที่สัมพันธ์กันจริง
- เช่น รายงาน order ที่มีลูกค้าจริง

---

## 1.2 LEFT JOIN

ใช้เมื่ออยากได้ข้อมูลฝั่งซ้ายทั้งหมด แม้ฝั่งขวาจะไม่มีข้อมูล

```sql
SELECT c.customer_id, c.name, o.order_id, o.product
FROM customers c
LEFT JOIN orders o
  ON c.customer_id = o.customer_id;
```

ผลลัพธ์

| customer_id | name | order_id | product |
|---:|---|---:|---|
| 1 | Aom | NULL | NULL |
| 2 | Bank | 101 | Mouse |
| 3 | Chai | 102 | Keyboard |

ความหมาย:
- เอาลูกค้าทุกคน
- ถ้าไม่มี order ให้ค่าฝั่ง order เป็น `NULL`

ใช้งานจริงเมื่อ:
- ต้องการข้อมูลหลักทั้งหมด
- เช่น ลูกค้าทั้งหมดพร้อม order ถ้ามี

---

## 1.3 LEFT JOIN ... IS NULL

ใช้หา “ข้อมูลฝั่งซ้ายที่ยังไม่มีคู่”

```sql
SELECT c.customer_id, c.name
FROM customers c
LEFT JOIN orders o
  ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;
```

ผลลัพธ์

| customer_id | name |
|---:|---|
| 1 | Aom |

ใช้งานจริงเมื่อ:
- หาลูกค้าที่ยังไม่เคยสั่งซื้อ
- หาสินค้าที่ยังไม่มีหมวดหมู่
- หาพนักงานที่ยังไม่มีแผนก

---

# 2) Self Join คืออะไร

Self Join คือการ join ตารางเดิมกับตัวเอง  
ใช้เมื่อข้อมูลในตารางเดียวกันมีความสัมพันธ์กันเอง เช่น พนักงานกับหัวหน้า

## ตาราง `employees`

| emp_id | emp_name | title | manager_id |
|---:|---|---|---:|
| 1 | Andrew Adams | General Manager | NULL |
| 2 | Nancy Edwards | Sales Manager | 1 |
| 3 | Jane Peacock | Sales Support Agent | 2 |
| 4 | Margaret Park | Sales Support Agent | 2 |

คำอธิบาย:
- `manager_id` คือรหัสหัวหน้า
- หัวหน้าเองก็อยู่ในตาราง `employees` เดิม

```sql
SELECT
  e.emp_id,
  e.emp_name,
  e.title,
  m.emp_name AS manager_name,
  m.title AS manager_title
FROM employees e
LEFT JOIN employees m
  ON e.manager_id = m.emp_id
ORDER BY e.emp_id;
```

ผลลัพธ์

| emp_id | emp_name | title | manager_name | manager_title |
|---:|---|---|---|---|
| 1 | Andrew Adams | General Manager | NULL | NULL |
| 2 | Nancy Edwards | Sales Manager | Andrew Adams | General Manager |
| 3 | Jane Peacock | Sales Support Agent | Nancy Edwards | Sales Manager |
| 4 | Margaret Park | Sales Support Agent | Nancy Edwards | Sales Manager |

แนวคิดสำคัญ:
- `e` = employee
- `m` = manager
- ใช้ `LEFT JOIN` เพราะบางคนไม่มีหัวหน้า

---

# 3) ความสัมพันธ์ของข้อมูล

## 3.1 One-to-One

1 แถวในตาราง A คู่กับ 1 แถวในตาราง B เท่านั้น

ตัวอย่าง:
- user 1 คน มี profile 1 อัน

## ตาราง `users`

| user_id | name |
|---:|---|
| 1 | Aom |
| 2 | Bank |

## ตาราง `user_profiles`

| profile_id | user_id | phone |
|---:|---:|---|
| 10 | 1 | 0811111111 |
| 11 | 2 | 0822222222 |

ตัวอย่าง schema

```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE user_profiles (
  profile_id INT PRIMARY KEY,
  user_id INT UNIQUE,
  phone VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

จุดสำคัญ:
- `user_profiles.user_id` เป็น `UNIQUE`
- จึงบังคับให้ user 1 คนมี profile ได้แค่ 1 แถว

---

## 3.2 One-to-Many / Many-to-One

แบบนี้ใช้จริงบ่อยมากที่สุด

ตัวอย่าง:
- customer 1 คน มี order ได้หลายรายการ
- order หลายรายการ เป็นของ customer 1 คน

## ตาราง `customers`

| customer_id | name |
|---:|---|
| 1 | Aom |
| 2 | Bank |

## ตาราง `orders`

| order_id | customer_id | product |
|---:|---:|---|
| 101 | 1 | Mouse |
| 102 | 1 | Keyboard |
| 103 | 2 | Monitor |

schema

```sql
CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT,
  product VARCHAR(100),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

วิธีจำ:
- FK อยู่ฝั่ง `orders`
- แปลว่า order หลายรายการอ้างถึง customer คนเดียวได้
- ดังนั้น `customers -> orders` = one-to-many
- และ `orders -> customers` = many-to-one

---

# 4) Foreign Key และ On Delete / On Update

Foreign Key ใช้รักษาความสัมพันธ์ระหว่างตาราง และกำหนด behavior ตอนข้อมูลแม่ถูกลบหรือแก้

ตัวอย่างความสัมพันธ์

- ตารางแม่: `customers`
- ตารางลูก: `orders`

## ตาราง `customers`

| customer_id | name |
|---:|---|
| 1 | Aom |
| 2 | Bank |

## ตาราง `orders`

| order_id | customer_id | product |
|---:|---:|---|
| 101 | 1 | Mouse |
| 102 | 1 | Keyboard |
| 103 | 2 | Monitor |

---

## 4.1 ON DELETE CASCADE

ถ้าลบแม่ ให้ลูกหายตาม

```sql
CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT,
  product VARCHAR(100),
  FOREIGN KEY (customer_id)
    REFERENCES customers(customer_id)
    ON DELETE CASCADE
);
```

ถ้าเราทำ:

```sql
DELETE FROM customers
WHERE customer_id = 1;
```

ผลลัพธ์:
- customer 1 หาย
- orders ที่ `customer_id = 1` หายตามทั้งหมด

เหมาะกับ:
- child แท้ ๆ ที่ไม่มีความหมายถ้า parent หาย
- เช่น `order_items` ของ `orders`

---

## 4.2 ON DELETE RESTRICT / NO ACTION

ถ้ายังมีลูกอ้างอยู่ ห้ามลบแม่

```sql
CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT,
  product VARCHAR(100),
  FOREIGN KEY (customer_id)
    REFERENCES customers(customer_id)
    ON DELETE RESTRICT
);
```

ถ้าพยายามลบ customer ที่ยังมี orders:
- database จะ error
- ต้องลบหรือแก้ orders ก่อน

เหมาะกับ:
- ข้อมูลธุรกิจสำคัญ
- เช่น customer, department, product master

---

## 4.3 ON DELETE SET NULL

ถ้าแม่หาย ให้ FK ฝั่งลูกกลายเป็น `NULL`

```sql
CREATE TABLE tasks (
  task_id INT PRIMARY KEY,
  assignee_id INT NULL,
  task_name VARCHAR(100),
  FOREIGN KEY (assignee_id)
    REFERENCES users(user_id)
    ON DELETE SET NULL
);
```

ถ้าลบ user:
- task ยังอยู่
- แต่ `assignee_id` จะเป็น `NULL`

เหมาะกับ:
- ความสัมพันธ์ที่ไม่บังคับ
- เช่น manager, assignee, reviewer

---

## แนวคิดที่ใช้จริงใน Prod

โดยทั่วไป:
- ใช้ `RESTRICT` เป็น baseline
- ใช้ `CASCADE` เฉพาะ child แท้ ๆ
- ใช้ `SET NULL` กับ optional relation

---

# 5) Transaction

Transaction คือการครอบหลาย query ให้เป็น “ก้อนงานเดียว”

ถ้าทุกอย่างสำเร็จ:
- `COMMIT`

ถ้ามีบางขั้นพลาด:
- `ROLLBACK`

---

## ตัวอย่างงานจริง: สร้าง order แล้วตัด stock

## ตาราง `products`

| product_id | name | stock |
|---:|---|---:|
| 1 | Mouse | 10 |

## ตาราง `orders`

| order_id | user_id | total | status |
|---:|---:|---:|---|

## ตาราง `order_items`

| item_id | order_id | product_id | qty | price |
|---:|---:|---:|---:|---:|

ตัวอย่าง SQL

```sql
BEGIN;

SELECT stock
FROM products
WHERE product_id = 1
FOR UPDATE;

INSERT INTO orders (user_id, total, status)
VALUES (101, 500, 'pending');

-- สมมติได้ order_id = 9001

INSERT INTO order_items (order_id, product_id, qty, price)
VALUES (9001, 1, 2, 250);

UPDATE products
SET stock = stock - 2
WHERE product_id = 1;

COMMIT;
```

ถ้าเกิดปัญหาระหว่างทาง:

```sql
ROLLBACK;
```

ผลลัพธ์:
- order ไม่ถูกสร้างค้าง
- order_items ไม่ถูกสร้างค้าง
- stock ไม่ถูกตัดค้าง

---

## หลักคิดสำคัญใน Prod

- Transaction ต้องสั้น
- ใช้กับหลาย query ที่ต้องสำเร็จพร้อมกัน
- อย่าเอางานช้า ๆ เช่น เรียก external API, ส่ง email ไปใส่ใน transaction
- backend ต้องคุม `commit` และ `rollback` ให้ชัด

---

# 6) Trigger

Trigger คือคำสั่งอัตโนมัติใน database ที่ทำงานเมื่อมี event เช่น

- `INSERT`
- `UPDATE`
- `DELETE`

ตัวอย่าง:
- เมื่อแก้ข้อมูลพนักงาน ให้เก็บค่าเก่าลงตาราง audit อัตโนมัติ

## ตาราง `EmployeeAudit`

| AuditId | EmployeeId | OldLastName | OldFirstName | OldEmail | ChangeDate |
|---:|---:|---|---|---|---|
| 1 | 2 | Edwards | Nancy | old@example.com | 2026-03-31 10:00:00 |

ตัวอย่างแนวคิด trigger

```sql
CREATE TRIGGER AfterEmployeeUpdate
AFTER UPDATE ON Employee
FOR EACH ROW
BEGIN
  INSERT INTO EmployeeAudit (EmployeeId, OldLastName, OldFirstName, OldEmail)
  VALUES (OLD.EmployeeId, OLD.LastName, OLD.FirstName, OLD.Email);
END;
```

แนวคิด:
- `OLD` = ค่าเดิมก่อนแก้
- `NEW` = ค่าใหม่หลังแก้

---

## แต่งานจริงใช้บ่อยไหม

มีใช้ แต่ไม่ใช่ตัวหลักที่ใช้บ่อยที่สุด

หลายทีมใช้ให้น้อย เพราะ:
- debug ยาก
- logic ซ่อนอยู่ใน database
- คนอ่าน backend code อาจไม่เห็นว่า DB มี trigger ทำงานเพิ่ม

---

# 7) ถ้าไม่ใช้ Trigger เก็บ Log ทำยังไง

แนวที่นิยมกว่าในโปรเจกต์ทั่วไปคือ
**Application-level Audit Log**

คือให้ backend เป็นคนเขียน log เองใน transaction เดียวกับการแก้ข้อมูล

---

## ตัวอย่างตาราง `audit_logs`

| id | table_name | record_id | action | old_data | new_data | changed_by | changed_at |
|---:|---|---|---|---|---|---:|---|
| 1 | customers | 10 | UPDATE | {"name":"Old"} | {"name":"New"} | 99 | 2026-03-31 10:00:00 |

ตัวอย่างแนวคิดตอน update customer

```sql
BEGIN;

-- 1) อ่านข้อมูลเดิม
SELECT * FROM customers WHERE id = 10;

-- 2) update ข้อมูลจริง
UPDATE customers
SET name = 'New Name'
WHERE id = 10;

-- 3) เขียน audit log
INSERT INTO audit_logs (
  table_name,
  record_id,
  action,
  old_data,
  new_data,
  changed_by,
  changed_at
)
VALUES (
  'customers',
  '10',
  'UPDATE',
  '{"name":"Old Name"}',
  '{"name":"New Name"}',
  99,
  CURRENT_TIMESTAMP
);

COMMIT;
```

ข้อดี:
- flow ชัด
- debug ง่าย
- ใส่ข้อมูลประกอบได้ เช่น user_id, ip, request_id

---

# 8) SQL Functions ที่ใช้จริงบ่อย

เรายังไม่ต้องจำทุก function  
ให้โฟกัสตัวที่ใช้จริงบ่อยก่อน

---

## 8.1 Text Functions

### `TRIM()`

```sql
SELECT TRIM(first_name)
FROM customers;
```

ใช้เมื่อ:
- ลบ space เกิน

### `UPPER()`

```sql
SELECT UPPER(country)
FROM customers;
```

ใช้เมื่อ:
- ทำข้อมูลให้เป็นตัวพิมพ์ใหญ่ทั้งหมด

### `LOWER()`

```sql
SELECT LOWER(email)
FROM customers;
```

ใช้เมื่อ:
- normalize email

### `REPLACE()`

```sql
SELECT REPLACE(email, '@googlemail.com', '@gmail.com')
FROM customers;
```

ใช้เมื่อ:
- แก้ข้อความบางส่วน

### `CONCAT()`

```sql
SELECT CONCAT(first_name, ' ', last_name) AS full_name
FROM customers;
```

ใช้เมื่อ:
- รวมข้อความเป็นชื่อเต็ม

---

## 8.2 NULL Handling

### `COALESCE()`

```sql
SELECT COALESCE(phone, '-') AS phone
FROM customers;
```

ใช้เมื่อ:
- ถ้า `phone` เป็น `NULL` ให้แสดง `-`

---

## 8.3 Aggregate Functions

### `COUNT(*)`

```sql
SELECT COUNT(*)
FROM orders;
```

ใช้เมื่อ:
- นับจำนวนแถวทั้งหมด

### `SUM()`

```sql
SELECT SUM(total)
FROM orders;
```

ใช้เมื่อ:
- รวมยอด

### `AVG()`

```sql
SELECT AVG(total)
FROM orders;
```

ใช้เมื่อ:
- หาค่าเฉลี่ย

### `MIN()` / `MAX()`

```sql
SELECT MIN(price), MAX(price)
FROM products;
```

ใช้เมื่อ:
- หาค่าน้อยสุด/มากสุด

---

## 8.4 Number Function

### `ROUND()`

```sql
SELECT ROUND(AVG(total), 2)
FROM orders;
```

ใช้เมื่อ:
- ปัดทศนิยม

---

## 8.5 Date / Time Functions

### `CURRENT_TIMESTAMP`

```sql
SELECT CURRENT_TIMESTAMP;
```

ใช้เมื่อ:
- เก็บเวลาปัจจุบัน

### `DATE()`

```sql
SELECT DATE(created_at)
FROM orders;
```

ใช้เมื่อ:
- ดึงเฉพาะวันที่

### `EXTRACT()`

```sql
SELECT EXTRACT(YEAR FROM created_at) AS year
FROM orders;
```

ใช้เมื่อ:
- ดึงปี เดือน วัน เพื่อทำ report

---

## 8.6 Conditional

### `CASE WHEN`

```sql
SELECT order_id,
       CASE
         WHEN total >= 10000 THEN 'high'
         WHEN total >= 5000 THEN 'medium'
         ELSE 'low'
       END AS order_level
FROM orders;
```

ใช้เมื่อ:
- แบ่งกลุ่มข้อมูล
- แปลง status/code ให้เป็นข้อความอ่านง่าย

---

# 9) สิ่งที่ควรแม่นก่อนในงานจริง

ถ้าจะโฟกัสเฉพาะแกนที่ใช้จริงก่อน ให้แม่นเรื่องนี้

1. `INNER JOIN`
2. `LEFT JOIN`
3. `LEFT JOIN ... IS NULL`
4. `Self Join`
5. `One-to-Many / Many-to-One`
6. `RESTRICT / CASCADE / SET NULL`
7. `Transaction`
8. `Application-level Audit Log`
9. `TRIM`, `COALESCE`, `COUNT`, `SUM`, `AVG`, `ROUND`, `CASE WHEN`

ถ้าเข้าใจชุดนี้:
- อ่าน query งานจริงได้เยอะ
- ออกแบบ schema เบื้องต้นได้
- ทำ report พื้นฐานได้
- ทำ CRUD backend ได้ดีขึ้นมาก

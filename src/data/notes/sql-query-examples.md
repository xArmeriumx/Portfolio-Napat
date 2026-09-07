# SQL สรุปโค้ด + Response Table ให้เห็นภาพ

เอกสารนี้สรุปแบบ “ดูโค้ด แล้วดูผลลัพธ์”  
เหมาะกับใช้ทบทวนเร็ว

---

# 1) INNER JOIN

## ตารางตั้งต้น

### `customers`

| customer_id | name |
|---:|---|
| 1 | Aom |
| 2 | Bank |
| 3 | Chai |

### `orders`

| order_id | customer_id | product |
|---:|---:|---|
| 101 | 2 | Mouse |
| 102 | 3 | Keyboard |
| 103 | 4 | Monitor |

## โค้ด

```sql
SELECT c.customer_id, c.name, o.order_id, o.product
FROM customers c
INNER JOIN orders o
  ON c.customer_id = o.customer_id;
```

## ผลลัพธ์

| customer_id | name | order_id | product |
|---:|---|---:|---|
| 2 | Bank | 101 | Mouse |
| 3 | Chai | 102 | Keyboard |

---

# 2) LEFT JOIN

## โค้ด

```sql
SELECT c.customer_id, c.name, o.order_id, o.product
FROM customers c
LEFT JOIN orders o
  ON c.customer_id = o.customer_id;
```

## ผลลัพธ์

| customer_id | name | order_id | product |
|---:|---|---:|---|
| 1 | Aom | NULL | NULL |
| 2 | Bank | 101 | Mouse |
| 3 | Chai | 102 | Keyboard |

---

# 3) LEFT JOIN ... IS NULL

## โค้ด

```sql
SELECT c.customer_id, c.name
FROM customers c
LEFT JOIN orders o
  ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;
```

## ผลลัพธ์

| customer_id | name |
|---:|---|
| 1 | Aom |

---

# 4) SELF JOIN

## ตารางตั้งต้น `employees`

| emp_id | emp_name | title | manager_id |
|---:|---|---|---:|
| 1 | Andrew Adams | General Manager | NULL |
| 2 | Nancy Edwards | Sales Manager | 1 |
| 3 | Jane Peacock | Sales Support Agent | 2 |
| 4 | Margaret Park | Sales Support Agent | 2 |

## โค้ด

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

## ผลลัพธ์

| emp_id | emp_name | title | manager_name | manager_title |
|---:|---|---|---|---|
| 1 | Andrew Adams | General Manager | NULL | NULL |
| 2 | Nancy Edwards | Sales Manager | Andrew Adams | General Manager |
| 3 | Jane Peacock | Sales Support Agent | Nancy Edwards | Sales Manager |
| 4 | Margaret Park | Sales Support Agent | Nancy Edwards | Sales Manager |

---

# 5) One-to-Many / Many-to-One

## ตาราง

### `customers`

| customer_id | name |
|---:|---|
| 1 | Aom |
| 2 | Bank |

### `orders`

| order_id | customer_id | product |
|---:|---:|---|
| 101 | 1 | Mouse |
| 102 | 1 | Keyboard |
| 103 | 2 | Monitor |

## มุมมอง
- `customers -> orders` = One-to-Many
- `orders -> customers` = Many-to-One

## โค้ด

```sql
SELECT c.name, o.order_id, o.product
FROM customers c
LEFT JOIN orders o
  ON c.customer_id = o.customer_id;
```

## ผลลัพธ์

| name | order_id | product |
|---|---:|---|
| Aom | 101 | Mouse |
| Aom | 102 | Keyboard |
| Bank | 103 | Monitor |

---

# 6) ON DELETE CASCADE

## ตารางก่อนลบ

### `customers`

| customer_id | name |
|---:|---|
| 1 | Aom |
| 2 | Bank |

### `orders`

| order_id | customer_id | product |
|---:|---:|---|
| 101 | 1 | Mouse |
| 102 | 1 | Keyboard |
| 103 | 2 | Monitor |

## โค้ด

```sql
DELETE FROM customers
WHERE customer_id = 1;
```

## ผลลัพธ์ถ้าใช้ `ON DELETE CASCADE`

### `customers`

| customer_id | name |
|---:|---|
| 2 | Bank |

### `orders`

| order_id | customer_id | product |
|---:|---:|---|
| 103 | 2 | Monitor |

---

# 7) ON DELETE RESTRICT

## โค้ด

```sql
DELETE FROM customers
WHERE customer_id = 1;
```

## ผลลัพธ์
- ระบบจะ error
- เพราะยังมี order ที่อ้างถึง customer 1 อยู่

---

# 8) ON DELETE SET NULL

## ตารางตั้งต้น `tasks`

| task_id | task_name | assignee_id |
|---:|---|---:|
| 1 | Prepare report | 10 |
| 2 | Follow up client | 11 |
| 3 | Update dashboard | 10 |

## โค้ด

```sql
DELETE FROM users
WHERE user_id = 10;
```

## ผลลัพธ์ถ้าใช้ `ON DELETE SET NULL`

| task_id | task_name | assignee_id |
|---:|---|---:|
| 1 | Prepare report | NULL |
| 2 | Follow up client | 11 |
| 3 | Update dashboard | NULL |

---

# 9) TRANSACTION

## ตารางตั้งต้น

### `products`

| product_id | name | stock |
|---:|---|---:|
| 1 | Mouse | 10 |

## โค้ด

```sql
BEGIN;

SELECT stock
FROM products
WHERE product_id = 1
FOR UPDATE;

INSERT INTO orders (user_id, total, status)
VALUES (101, 500, 'pending');

INSERT INTO order_items (order_id, product_id, qty, price)
VALUES (9001, 1, 2, 250);

UPDATE products
SET stock = stock - 2
WHERE product_id = 1;

COMMIT;
```

## ผลลัพธ์หลังสำเร็จ

### `products`

| product_id | name | stock |
|---:|---|---:|
| 1 | Mouse | 8 |

### `orders`

| order_id | user_id | total | status |
|---:|---:|---:|---|
| 9001 | 101 | 500 | pending |

### `order_items`

| item_id | order_id | product_id | qty | price |
|---:|---:|---:|---:|---:|
| 1 | 9001 | 1 | 2 | 250 |

## ถ้า error ระหว่างทาง

```sql
ROLLBACK;
```

## ผลลัพธ์
- ไม่มี order ใหม่
- ไม่มี order_items ใหม่
- stock กลับไปเหมือนเดิม

---

# 10) Application-level Audit Log

## ตาราง `customers` ก่อน update

| id | name |
|---:|---|
| 10 | Old Name |

## ตาราง `audit_logs` ก่อน update
ยังไม่มีข้อมูล

## โค้ด

```sql
BEGIN;

UPDATE customers
SET name = 'New Name'
WHERE id = 10;

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

## ผลลัพธ์

### `customers`

| id | name |
|---:|---|
| 10 | New Name |

### `audit_logs`

| table_name | record_id | action | old_data | new_data | changed_by |
|---|---|---|---|---|---:|
| customers | 10 | UPDATE | {"name":"Old Name"} | {"name":"New Name"} | 99 |

---

# 11) SQL Functions

---

## 11.1 TRIM

### ตาราง `customers`

| first_name | last_name |
|---|---|
| `" John "` | `" Doe "` |

## โค้ด

```sql
SELECT TRIM(first_name) AS first_name_clean,
       TRIM(last_name) AS last_name_clean
FROM customers;
```

## ผลลัพธ์

| first_name_clean | last_name_clean |
|---|---|
| John | Doe |

---

## 11.2 LOWER

### ตาราง `customers`

| email |
|---|
| JOHN@MAIL.COM |

## โค้ด

```sql
SELECT LOWER(email) AS email_clean
FROM customers;
```

## ผลลัพธ์

| email_clean |
|---|
| john@mail.com |

---

## 11.3 COALESCE

### ตาราง `customers`

| name | phone |
|---|---|
| Aom | NULL |
| Bank | 0812345678 |

## โค้ด

```sql
SELECT name, COALESCE(phone, '-') AS phone_display
FROM customers;
```

## ผลลัพธ์

| name | phone_display |
|---|---|
| Aom | - |
| Bank | 0812345678 |

---

## 11.4 COUNT / SUM / AVG

### ตาราง `orders`

| order_id | total |
|---:|---:|
| 101 | 100 |
| 102 | 200 |
| 103 | 300 |

## โค้ด

```sql
SELECT COUNT(*) AS total_orders,
       SUM(total) AS revenue,
       AVG(total) AS avg_order
FROM orders;
```

## ผลลัพธ์

| total_orders | revenue | avg_order |
|---:|---:|---:|
| 3 | 600 | 200 |

---

## 11.5 ROUND

## โค้ด

```sql
SELECT ROUND(AVG(total), 2) AS avg_order
FROM orders;
```

## ผลลัพธ์

| avg_order |
|---:|
| 200.00 |

---

## 11.6 CASE WHEN

### ตาราง `orders`

| order_id | total |
|---:|---:|
| 101 | 12000 |
| 102 | 7000 |
| 103 | 3000 |

## โค้ด

```sql
SELECT order_id,
       total,
       CASE
         WHEN total >= 10000 THEN 'high'
         WHEN total >= 5000 THEN 'medium'
         ELSE 'low'
       END AS order_level
FROM orders;
```

## ผลลัพธ์

| order_id | total | order_level |
|---:|---:|---|
| 101 | 12000 | high |
| 102 | 7000 | medium |
| 103 | 3000 | low |

---

# 12) สรุปสั้นสุด

ถ้าเอาแค่ของที่ใช้จริงบ่อยสุด ให้จำภาพนี้

- `INNER JOIN` = เอาเฉพาะที่ match
- `LEFT JOIN` = เอาฝั่งซ้ายทั้งหมด
- `LEFT JOIN ... IS NULL` = หาแถวที่ยังไม่มีคู่
- `SELF JOIN` = join ตารางเดิมกับตัวเอง
- `One-to-Many / Many-to-One` = ความสัมพันธ์ที่ใช้จริงบ่อยสุด
- `RESTRICT` = กันลบมั่ว
- `CASCADE` = ลบลูกตามแม่
- `SET NULL` = แม่หาย ลูกยังอยู่
- `TRANSACTION` = หลาย query ต้องสำเร็จพร้อมกัน
- `Audit Log` = ให้ backend เขียน log เองใน transaction เดียวกัน
- Functions ที่ควรรู้ก่อน = `TRIM`, `COALESCE`, `COUNT`, `SUM`, `AVG`, `ROUND`, `CASE WHEN`

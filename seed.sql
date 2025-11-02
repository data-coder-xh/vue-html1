CREATE DATABASE IF NOT EXISTS test;
USE test;

DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS suppliers;

CREATE TABLE employees
(
  eid VARCHAR(3) NOT NULL,
  ename VARCHAR(15),
  city VARCHAR(15),
  PRIMARY KEY (eid)
);

CREATE TABLE customers
(
  cid VARCHAR(4) NOT NULL,
  cname VARCHAR(15),
  city VARCHAR(15),
  visits_made INT(5),
  last_visit_time DATETIME,
  PRIMARY KEY (cid)
);

CREATE TABLE suppliers
(
  sid VARCHAR(2) NOT NULL,
  sname VARCHAR(15) NOT NULL,
  city VARCHAR(15),
  telephone_no CHAR(10),
  PRIMARY KEY (sid),
  UNIQUE (sname)
);

CREATE TABLE products
(
  pid VARCHAR(4) NOT NULL,
  pname VARCHAR(15) NOT NULL,
  qoh INT(5) NOT NULL,
  qoh_threshold INT(5),
  original_price DECIMAL(6,2),
  discnt_rate DECIMAL(3,2),
  sid VARCHAR(2),
  PRIMARY KEY (pid),
  FOREIGN KEY (sid) REFERENCES suppliers (sid)
);

CREATE TABLE purchases
(
  purid INT NOT NULL,
  cid VARCHAR(4) NOT NULL,
  eid VARCHAR(3) NOT NULL,
  pid VARCHAR(4) NOT NULL,
  qty INT(5),
  ptime DATETIME,
  total_price DECIMAL(7,2),
  PRIMARY KEY (purid),
  FOREIGN KEY (cid) REFERENCES customers(cid),
  FOREIGN KEY (eid) REFERENCES employees(eid),
  FOREIGN KEY (pid) REFERENCES products(pid)
);

CREATE TABLE logs
(
  logid INT(5) NOT NULL AUTO_INCREMENT,
  who VARCHAR(10) NOT NULL,
  time DATETIME NOT NULL,
  table_name VARCHAR(20) NOT NULL,
  operation VARCHAR(6) NOT NULL,
  key_value VARCHAR(4),
  PRIMARY KEY (logid)
);

INSERT INTO employees (eid, ename, city) VALUES
('E01', 'Alice', 'Beijing'),
('E02', 'Brian', 'Shanghai'),
('E03', 'Carol', 'Shenzhen');

INSERT INTO customers (cid, cname, city, visits_made, last_visit_time) VALUES
('C001', 'Acme Co', 'Beijing', 12, '2024-05-10 10:30:00'),
('C002', 'Blue Sky', 'Shanghai', 5, '2024-05-08 15:45:00'),
('C003', 'Nova Labs', 'Shenzhen', 8, '2024-05-06 09:15:00');

INSERT INTO suppliers (sid, sname, city, telephone_no) VALUES
('S1', 'Sunrise', 'Beijing', '0101234567'),
('S2', 'Harbor', 'Shanghai', '0217654321'),
('S3', 'Everest', 'Shenzhen', '0755123456');

INSERT INTO products (pid, pname, qoh, qoh_threshold, original_price, discnt_rate, sid) VALUES
('P001', 'Laptop', 45, 20, 5500.00, 0.10, 'S1'),
('P002', 'Router', 120, 40, 320.00, 0.05, 'S2'),
('P003', 'Monitor', 60, 25, 1280.00, 0.15, 'S3');

INSERT INTO purchases (purid, cid, eid, pid, qty, ptime, total_price) VALUES
(1001, 'C001', 'E01', 'P001', 2, '2024-05-11 11:20:00', 9900.00),
(1002, 'C002', 'E02', 'P002', 5, '2024-05-09 14:10:00', 1520.00),
(1003, 'C003', 'E03', 'P003', 1, '2024-05-07 16:40:00', 1088.00);

INSERT INTO logs (who, time, table_name, operation, key_value) VALUES
('system', '2024-05-01 08:00:00', 'employees', 'INIT', NULL),
('system', '2024-05-01 08:05:00', 'customers', 'INIT', NULL);

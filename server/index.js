// index.js
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const app = express();
app.use(cors());
app.use(express.json());

// SQLite connection
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

// Create tables + enable FKs
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON;');

  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone_number TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      address_details TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON addresses(customer_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_addresses_city ON addresses(city)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_addresses_state ON addresses(state)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_addresses_pin ON addresses(pin_code)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number)`);

  console.log('✅ Tables ready.');
});

// ───────────── CRUD ROUTES ─────────────

// Create customer
app.post('/api/customers', (req, res) => {
  const { first_name, last_name, phone_number } = req.body || {};
  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: 'All fields are required!' });
  }
  db.run(
    `INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)`,
    [first_name, last_name, phone_number],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Customer created ✅', data: { id: this.lastID, first_name, last_name, phone_number } });
    }
  );
});

// Add address
app.post('/api/customers/:id/addresses', (req, res) => {
  const { address_details, city, state, pin_code } = req.body || {};
  const customer_id = req.params.id;
  if (!address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: 'All fields are required!' });
  }
  db.run(
    `INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`,
    [customer_id, address_details, city, state, pin_code],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Address added ✅', data: { id: this.lastID, customer_id, address_details, city, state, pin_code } });
    }
  );
});

// List customers
app.get('/api/customers', (req, res) => {
  let { page = 1, limit = 10, search, city, state, pin_code, sortBy = 'id', order = 'asc' } = req.query;
  page = Math.max(parseInt(page, 10) || 1, 1);
  limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const whereClauses = [];
  const params = [];
  if (search) {
    whereClauses.push('(c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone_number LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (city) {
    whereClauses.push('c.id IN (SELECT customer_id FROM addresses WHERE city = ?)');
    params.push(city);
  }
  if (state) {
    whereClauses.push('c.id IN (SELECT customer_id FROM addresses WHERE state = ?)');
    params.push(state);
  }
  if (pin_code) {
    whereClauses.push('c.id IN (SELECT customer_id FROM addresses WHERE pin_code = ?)');
    params.push(pin_code);
  }
  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const SORT_FIELDS = new Set(['id', 'first_name', 'last_name', 'phone_number', 'address_count']);
  const sortField = SORT_FIELDS.has(String(sortBy)) ? String(sortBy) : 'id';
  const sortOrder = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const countSql = `SELECT COUNT(*) AS total FROM customers c ${whereSQL}`;
  const dataSql = `
    SELECT c.*, (SELECT COUNT(*) FROM addresses a WHERE a.customer_id = c.id) AS address_count
    FROM customers c
    ${whereSQL}
    ORDER BY ${sortField} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  db.get(countSql, params, (countErr, countRow) => {
    if (countErr) return res.status(500).json({ error: countErr.message });
    const total = countRow?.total ?? 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const offset = (page - 1) * limit;

    db.all(dataSql, [...params, limit, offset], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'success', page, limit, total, totalPages, hasNext: page < totalPages, data: rows });
    });
  });
});



// Update customer
app.put('/api/customers/:id', (req, res) => {
  const { first_name, last_name, phone_number } = req.body || {};
  db.run(
    'UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?',
    [first_name, last_name, phone_number, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ message: 'Customer not found' });
      res.json({ message: 'Customer updated ✅', data: { id: req.params.id, first_name, last_name, phone_number } });
    }
  );
});

// Update address
app.put('/api/addresses/:addressId', (req, res) => {
  const { address_details, city, state, pin_code } = req.body || {};
  db.run(
    'UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?',
    [address_details, city, state, pin_code, req.params.addressId],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Address not found' });
      res.json({ message: 'Address updated ✏️', data: { id: req.params.addressId, address_details, city, state, pin_code } });
    }
  );
});

// Delete customer
app.delete('/api/customers/:id', (req, res) => {
  db.run('DELETE FROM customers WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted 🗑️' });
  });
});

// Delete address
app.delete('/api/addresses/:addressId', (req, res) => {
  db.run('DELETE FROM addresses WHERE id = ?', [req.params.addressId], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Address deleted 🗑️' });
  });
});

// ───────────── SPECIAL ROUTES ─────────────

// Customer with addresses
app.get('/api/customers/:id/details', (req, res) => {
  const customerId = req.params.id;
  db.get('SELECT * FROM customers WHERE id = ?', [customerId], (err, customer) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    db.all('SELECT * FROM addresses WHERE customer_id = ?', [customerId], (err, addresses) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'success', data: { ...customer, addresses } });
    });
  });
});

// Customers with single address
app.get('/api/customers/single-address', (req, res) => {
  const sql = `
    SELECT c.*, COUNT(a.id) AS address_count
    FROM customers c
    LEFT JOIN addresses a ON c.id = a.customer_id
    GROUP BY c.id
    HAVING address_count = 1
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'success', data: rows });
  });
});

// Customers with multiple addresses
app.get('/api/customers/multiple-addresses', (req, res) => {
  const sql = `
    SELECT c.*, COUNT(a.id) AS address_count
    FROM customers c
    LEFT JOIN addresses a ON c.id = a.customer_id
    GROUP BY c.id
    HAVING address_count > 1
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'success', data: rows });
  });
});

// Get customer by ID
app.get('/api/customers/:id', (req, res) => {
  db.get('SELECT * FROM customers WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'success', data: row });
  });
});


// Clear all customers
app.delete("/api/customers/clear", (req, res) => {
  db.run("DELETE FROM customers", [], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "All customers deleted" });
  });
});

// Clear all addresses
app.delete("/api/addresses/clear", (req, res) => {
  db.run("DELETE FROM addresses", [], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "All addresses deleted" });
  });
});

// ───────────── START SERVER ─────────────
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

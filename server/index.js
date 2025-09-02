// index.js
// ─────────────────────────────────────────────────────────────────────────────
// Imports
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

// ─────────────────────────────────────────────────────────────────────────────
// Initialize express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// SQLite connection
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

// Create tables (once) + enable FKs
db.serialize(() => {
  // Important in SQLite: enforce foreign keys
  db.run('PRAGMA foreign_keys = ON;');

  // customers table (exactly per spec)
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone_number TEXT NOT NULL UNIQUE
    )
  `);

  // addresses table (per spec) + ON DELETE CASCADE to avoid orphans
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

  // Helpful indexes for lookups & filters
  db.run(`CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON addresses(customer_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_addresses_city ON addresses(city)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_addresses_state ON addresses(state)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_addresses_pin ON addresses(pin_code)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number)`);

  console.log('✅ Tables ready.');

  // Seed one row (idempotent)
  // db.run(`
  //   INSERT OR IGNORE INTO customers (id, first_name, last_name, phone_number)
  //   VALUES (1, 'John', 'Doe', '1234567890')
  // `);
});

// ─────────────────────────────────────────────────────────────────────────────
// Routes (all prefixed with /api)

// Create new customer
app.post('/api/customers', (req, res) => {
  const { first_name, last_name, phone_number } = req.body || {};

  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const sql = `INSERT INTO customers (first_name, last_name, phone_number)
               VALUES (?, ?, ?)`;

  db.run(sql, [first_name, last_name, phone_number], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({
      message: 'Customer created successfully ✅',
      data: { id: this.lastID, first_name, last_name, phone_number },
    });
  });
});

// Add new address for a customer
app.post('/api/customers/:id/addresses', (req, res) => {
  const { address_details, city, state, pin_code } = req.body || {};
  const customer_id = req.params.id;

  if (!address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const sql = `INSERT INTO addresses (customer_id, address_details, city, state, pin_code)
               VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [customer_id, address_details, city, state, pin_code], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({
      message: 'Address added successfully ✅',
      data: { id: this.lastID, customer_id, address_details, city, state, pin_code },
    });
  });
});

// GET all customers with search, filters, sorting & pagination
// Query params:
// - page (default 1), limit (default 10)
// - search (or name) — matches first_name/last_name/phone_number
// - city, state, pin_code — filter by address fields
// - sortBy: id | first_name | last_name | phone_number | address_count
// - order: asc | desc
app.get('/api/customers', (req, res) => {
  let {
    page = 1,
    limit = 10,
    city,
    state,
    pin_code,
    search,
    name, // alias
    sortBy = 'id',
    order = 'asc',
  } = req.query;

  page = Math.max(parseInt(page, 10) || 1, 1);
  limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  // Build WHERE
  const whereClauses = [];
  const params = [];

  const q = search || name;
  if (q) {
    whereClauses.push('(c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone_number LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
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

  // Whitelist sort fields & order to avoid SQL injection
  const SORT_FIELDS = new Set(['id', 'first_name', 'last_name', 'phone_number', 'address_count']);
  const sortField = SORT_FIELDS.has(String(sortBy)) ? String(sortBy) : 'id';
  const sortOrder = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  // Count for pagination
  const countSql = `SELECT COUNT(*) AS total FROM customers c ${whereSQL}`;

  // Main query
  const dataSql = `
    SELECT
      c.*,
      (SELECT COUNT(*) FROM addresses a WHERE a.customer_id = c.id) AS address_count
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
      res.json({
        message: 'success',
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        data: rows,
      });
    });
  });
});

// Get all addresses for a customer
app.get('/api/customers/:id/addresses', (req, res) => {
  const sql = 'SELECT * FROM addresses WHERE customer_id = ?';
  db.all(sql, [req.params.id], (err, rows) => {
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

// Update customer
app.put('/api/customers/:id', (req, res) => {
  const { first_name, last_name, phone_number } = req.body || {};
  db.run(
    'UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?',
    [first_name, last_name, phone_number, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ message: 'Customer not found' });
      res.json({
        message: 'Customer updated successfully ✅',
        data: { id: req.params.id, first_name, last_name, phone_number },
      });
    }
  );
});

// Update a specific address
app.put('/api/addresses/:addressId', (req, res) => {
  const { address_details, city, state, pin_code } = req.body || {};
  const sql = `
    UPDATE addresses
    SET address_details = ?, city = ?, state = ?, pin_code = ?
    WHERE id = ?
  `;
  db.run(sql, [address_details, city, state, pin_code, req.params.addressId], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Address not found' });
    res.json({
      message: 'Address updated successfully ✏️',
      data: { id: req.params.addressId, address_details, city, state, pin_code },
    });
  });
});

// Delete customer (addresses cascade automatically)
app.delete('/api/customers/:id', (req, res) => {
  db.run('DELETE FROM customers WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully 🗑️' });
  });
});

// Delete address
app.delete('/api/addresses/:addressId', (req, res) => {
  db.run('DELETE FROM addresses WHERE id = ?', [req.params.addressId], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Address deleted successfully 🗑️' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

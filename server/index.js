//import statements
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

//initialize express
const app = express();

//registering CORS middleware
app.use(cors());


//parse incoming requests
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database.');
    }
});

// Create tables if they don’t exist
db.serialize(() => {
   // Create customers table
    db.run(`
        CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone_number TEXT NOT NULL UNIQUE
        )
    `);
    // Create addresses table
    db.run(`
        CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        address_details TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        FOREIGN KEY(customer_id) REFERENCES customers(id)
        )
    `);

    console.log("✅ Tables ready.");
    db.run(`
        INSERT OR IGNORE INTO customers (id, first_name, last_name, phone_number)
        VALUES (1, 'John', 'Doe', '1234567890')
    `);
});

// Create new customer
app.post('/api/customers', (req, res) => {
  const { first_name, last_name, phone_number } = req.body;

  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const sql = `INSERT INTO customers (first_name, last_name, phone_number)
               VALUES (?, ?, ?)`;
  const params = [first_name, last_name, phone_number];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({
      message: "Customer created successfully ✅",
      data: { id: this.lastID, first_name, last_name, phone_number }
    });
  });
});


// Add new address for a customer
app.post('/api/customers/:id/addresses', (req, res) => {
  const { address_details, city, state, pin_code } = req.body;
  const customer_id = req.params.id;

  if (!address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const sql = `INSERT INTO addresses (customer_id, address_details, city, state, pin_code)
               VALUES (?, ?, ?, ?, ?)`;
  const params = [customer_id, address_details, city, state, pin_code];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({
      message: "Address added successfully ✅",
      data: { id: this.lastID, customer_id, address_details, city, state, pin_code }
    });
  });
});


// Get all customers
// app.get('/api/customers', (req, res) => {
//   const sql = "SELECT * FROM customers";
//   db.all(sql, [], (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({
//       message: "success",
//       data: rows
//     });
//   });
// });

// GET all customers with filters & pagination
app.get('/api/customers', (req, res) => {
  let { page = 1, limit = 10, city, state, pin_code, name } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  let whereClauses = [];
  let params = [];

  if (city) {
    whereClauses.push("c.id IN (SELECT customer_id FROM addresses WHERE city = ?)");
    params.push(city);
  }
  if (state) {
    whereClauses.push("c.id IN (SELECT customer_id FROM addresses WHERE state = ?)");
    params.push(state);
  }
  if (pin_code) {
    whereClauses.push("c.id IN (SELECT customer_id FROM addresses WHERE pin_code = ?)");
    params.push(pin_code);
  }
  if (name) {
    whereClauses.push("(c.first_name LIKE ? OR c.last_name LIKE ?)");
    params.push(`%${name}%`, `%${name}%`);
  }

  let whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const sql = `
    SELECT c.*, 
      (SELECT COUNT(*) FROM addresses a WHERE a.customer_id = c.id) as address_count
    FROM customers c
    ${whereSQL}
    LIMIT ? OFFSET ?
  `;

  params.push(limit, (page - 1) * limit);

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: "success",
      page,
      limit,
      data: rows
    });
  });
});


// Get all addresses for a customer
app.get('/api/customers/:id/addresses', (req, res) => {
  const sql = "SELECT * FROM addresses WHERE customer_id = ?";
  const params = [req.params.id];

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: "success",
      data: rows
    });
  });
});


// Get customer by ID
app.get("/api/customers/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM customers WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }
    res.json({ message: "success", data: row });
  });
});

// Update customer
app.put("/api/customers/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone_number } = req.body;

  db.run(
    "UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?",
    [first_name, last_name, phone_number, id],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }
      res.json({
        message: "Customer updated successfully ✅",
        data: { id, first_name, last_name, phone_number }
      });
    }
  );
});

// Update a specific address
app.put('/api/addresses/:addressId', (req, res) => {
  const { address_details, city, state, pin_code } = req.body;
  const sql = `UPDATE addresses
               SET address_details = ?, city = ?, state = ?, pin_code = ?
               WHERE id = ?`;
  const params = [address_details, city, state, pin_code, req.params.addressId];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Address not found" });
    }
    res.json({
      message: "Address updated successfully ✏️",
      data: { id: req.params.addressId, address_details, city, state, pin_code }
    });
  });
});


// Delete customer
app.delete('/api/customers/:id', (req, res) => {
  const sql = "DELETE FROM customers WHERE id = ?";
  const params = [req.params.id];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully 🗑️" });
  });
});

// Delete address
app.delete('/api/addresses/:addressId', (req, res) => {
  const sql = "DELETE FROM addresses WHERE id = ?";
  const params = [req.params.addressId];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Address not found" });
    }
    res.json({ message: "Address deleted successfully 🗑️" });
  });
});



//starting the server
const PORT=5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
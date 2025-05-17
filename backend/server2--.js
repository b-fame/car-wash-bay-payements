// ======= REQUIRE DEPENDENCIES =======
const express = require('express');          // Express framework for building the API
const mysql = require('mysql');              // MySQL database driver
const cors = require('cors');                // Cross-Origin Resource Sharing middleware
const session = require('express-session');  // Session management
const moment = require('moment');            // Date/time handling library

// Initialize Express application
const app = express();

// ======= DATABASE CONNECTION CONFIGURATION =======
const db = mysql.createConnection({
  host: 'localhost',     // Database server host
  user: 'root',          // Database username
  password: '',          // Database password (empty in this case)
  database: 'xy_shop'    // Database name
});

// Connect to MySQL database
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    process.exit(1); // Exit application if database connection fails
  }
  console.log('Connected to database as ID', db.threadId);
});

// ======= MIDDLEWARE SETUP =======
app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from frontend
  credentials: true                 // Enable credentials (cookies, sessions)
}));

app.use(express.json());  // Parse JSON request bodies

// Session configuration
app.use(session({
  secret: 'your_secret_key',       // Secret key for signing session ID cookie
  resave: false,                   // Don't save session if unmodified
  saveUninitialized: false,        // Don't create session until something stored
  cookie: { 
    secure: false,                 // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000    // Session expiration (24 hours)
  }
}));

// ======= UTILITY FUNCTIONS =======
/**
 * Get current datetime in MySQL format
 * @returns {string} Formatted datetime string (YYYY-MM-DD HH:mm:ss)
 */
const getCurrentDateTime = () => moment().format('YYYY-MM-DD HH:mm:ss');

/**
 * Get today's date in MySQL format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
const getTodayDate = () => moment().format('YYYY-MM-DD');

// ======= AUTHENTICATION MIDDLEWARE =======
/**
 * Middleware to check if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const authenticate = (req, res, next) => {
  if (!req.session.shopkeeper) {
    return res.status(401).json({ error: 'Unauthorized - Please login first' });
  }
  next();
};

// ======= AUTHENTICATION ROUTES =======

// Check authentication status
app.get('/api/check-auth', (req, res) => {
  res.json({
    authenticated: !!req.session.shopkeeper,
    user: req.session.shopkeeper || null
  });
});

// User login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Check user credentials
  db.query('SELECT * FROM shopkeeper WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error during login' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const shopkeeper = results[0];
    if (shopkeeper.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    req.session.shopkeeper = { 
      username: shopkeeper.username,
      id: shopkeeper.id 
    };
    
    res.json({ 
      message: 'Login successful', 
      user: req.session.shopkeeper 
    });
  });
});

// User registration
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Check if username exists
  db.query('SELECT * FROM shopkeeper WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error during registration' });
    if (results.length > 0) return res.status(409).json({ error: 'Username already exists' });

    // Create new user
    db.query('INSERT INTO shopkeeper (username, password) VALUES (?, ?)', 
      [username, password], 
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to create user' });
        
        res.status(201).json({ 
          message: 'User registered successfully',
          userId: result.insertId 
        });
      }
    );
  });
});

// User logout
app.post('/api/logout', authenticate, (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ message: 'Logged out successfully' });
  });
});

// ======= PRODUCT MANAGEMENT ROUTES =======

// Get all products
app.get('/api/products', authenticate, (req, res) => {
  db.query('SELECT * FROM product ORDER BY productname ASC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch products' });
    res.json(results);
  });
});

// Add new product
app.post('/api/products', authenticate, (req, res) => {
  const { productname } = req.body;
  
  if (!productname || productname.trim() === '') {
    return res.status(400).json({ error: 'Product name is required' });
  }

  db.query('INSERT INTO product (productname) VALUES (?)', 
    [productname.trim()], 
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to add product' });
      
      res.status(201).json({
        message: 'Product added successfully',
        product: { 
          productcode: result.insertId, 
          productname: productname.trim() 
        }
      });
    }
  );
});

// Update product
app.put('/api/products/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { productname } = req.body;

  if (!productname || productname.trim() === '') {
    return res.status(400).json({ error: 'Product name is required' });
  }

  db.query('UPDATE product SET productname = ? WHERE productcode = ?', 
    [productname.trim(), id], 
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to update product' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json({ message: 'Product updated successfully' });
    }
  );
});

// Delete product
app.delete('/api/products/:id', authenticate, (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM product WHERE productcode = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete product' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  });
});

// Check available stock for a product
app.get('/api/stock/available/:productcode', authenticate, (req, res) => {
  const { productcode } = req.params;

  db.query(
    `SELECT 
      p.productname,
      IFNULL((SELECT SUM(quantity) FROM productin WHERE productcode = ?), 0) AS stock_in,
      IFNULL((SELECT SUM(quantity) FROM productout WHERE productcode = ?), 0) AS stock_out
    FROM product p
    WHERE p.productcode = ?`,
    [productcode, productcode, productcode],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to check stock' });
      if (results.length === 0) return res.status(404).json({ error: 'Product not found' });

      const available = results[0].stock_in - results[0].stock_out;
      res.json({
        productName: results[0].productname,
        available: available,
        stockIn: results[0].stock_in,
        stockOut: results[0].stock_out
      });
    }
  );
});

// ======= STOCK MANAGEMENT ROUTES =======

// Record stock in (purchase/restock)
app.post('/api/stock/in', authenticate, (req, res) => {
  const { productcode, quantity, unitprice } = req.body;
  
  // Validate input
  if (!productcode || !quantity || !unitprice) {
    return res.status(400).json({ error: 'Product code, quantity and unit price are required' });
  }
  if (quantity <= 0 || unitprice <= 0) {
    return res.status(400).json({ error: 'Quantity and unit price must be positive values' });
  }

  const totalprice = quantity * unitprice;
  const date = getCurrentDateTime();

  db.query(
    'INSERT INTO productin (productcode, quantity, unitprice, totalprice, date) VALUES (?, ?, ?, ?, ?)',
    [productcode, quantity, unitprice, totalprice, date],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to record stock in' });
      res.json({ 
        message: 'Stock in recorded successfully',
        transaction: { productcode, quantity, unitprice, totalprice, date }
      });
    }
  );
});

// Record stock out (sale/usage)
app.post('/api/stock/out', authenticate, (req, res) => {
  const { productcode, quantity, unitprice } = req.body;
  
  // Validate input
  if (!productcode || !quantity || !unitprice) {
    return res.status(400).json({ error: 'Product code, quantity and unit price are required' });
  }
  if (quantity <= 0 || unitprice <= 0) {
    return res.status(400).json({ error: 'Quantity and unit price must be positive values' });
  }

  // Check available stock first
  db.query(
    `SELECT 
      IFNULL((SELECT SUM(quantity) FROM productin WHERE productcode = ?), 0) AS stock_in,
      IFNULL((SELECT SUM(quantity) FROM productout WHERE productcode = ?), 0) AS stock_out`,
    [productcode, productcode],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to check stock availability' });

      const available = results[0].stock_in - results[0].stock_out;
      if (available < quantity) {
        return res.status(400).json({ 
          error: 'Insufficient stock', 
          available: available,
          requested: quantity 
        });
      }

      // Record stock out if available
      const totalprice = quantity * unitprice;
      const date = getCurrentDateTime();

      db.query(
        'INSERT INTO productout (productcode, quantity, unitprice, totalprice, date) VALUES (?, ?, ?, ?, ?)',
        [productcode, quantity, unitprice, totalprice, date],
        (err) => {
          if (err) return res.status(500).json({ error: 'Failed to record stock out' });
          res.json({ 
            message: 'Stock out recorded successfully',
            transaction: { productcode, quantity, unitprice, totalprice, date }
          });
        }
      );
    }
  );
});

// ======= REPORT GENERATION ROUTES =======

// Get reports by type (daily, weekly, monthly, yearly, stock)
app.get('/api/reports/:type', authenticate, (req, res) => {
  const { type } = req.params;
  let startDate, endDate;

  // Stock report doesn't need date filtering
  if (type === 'stock') {
    return generateStockReport(res);
  }

  // Set date range based on report type
  switch (type) {
    case 'daily':
      startDate = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      endDate = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      break;
    case 'weekly':
      startDate = moment().startOf('week').format('YYYY-MM-DD HH:mm:ss');
      endDate = moment().endOf('week').format('YYYY-MM-DD HH:mm:ss');
      break;
    case 'monthly':
      startDate = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
      endDate = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');
      break;
    case 'yearly':
      startDate = moment().startOf('year').format('YYYY-MM-DD HH:mm:ss');
      endDate = moment().endOf('year').format('YYYY-MM-DD HH:mm:ss');
      break;
    default:
      return res.status(400).json({ error: 'Invalid report type' });
  }

  // Generate report with date filtering
  generateDateRangeReport(res, startDate, endDate, type);
});

/**
 * Generates a comprehensive stock report
 * @param {Object} res - Express response object
 */
function generateStockReport(res) {
  const query = `
    SELECT 
      p.productcode, 
      p.productname,
      IFNULL(SUM(pi.quantity), 0) AS total_in,
      IFNULL(SUM(pi.totalprice), 0) AS total_in_value,
      IFNULL(SUM(po.quantity), 0) AS total_out,
      IFNULL(SUM(po.totalprice), 0) AS total_out_value,
      (IFNULL(SUM(pi.quantity), 0) - IFNULL(SUM(po.quantity), 0)) AS current_stock
    FROM product p
    LEFT JOIN productin pi ON p.productcode = pi.productcode
    LEFT JOIN productout po ON p.productcode = po.productcode
    GROUP BY p.productcode
    ORDER BY p.productname ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to generate stock report' });
    res.json(results);
  });
}

/**
 * Generates a report filtered by date range
 * @param {Object} res - Express response object
 * @param {string} startDate - Start date in MySQL format
 * @param {string} endDate - End date in MySQL format
 * @param {string} reportType - Type of report (daily, weekly, etc.)
 */
function generateDateRangeReport(res, startDate, endDate, reportType) {
  const query = `
    SELECT 
      p.productcode, 
      p.productname,
      IFNULL(SUM(pi.quantity), 0) AS total_in,
      IFNULL(SUM(pi.totalprice), 0) AS total_in_value,
      IFNULL(SUM(po.quantity), 0) AS total_out,
      IFNULL(SUM(po.totalprice), 0) AS total_out_value,
      (IFNULL(SUM(pi.quantity), 0) - IFNULL(SUM(po.quantity), 0)) AS current_stock
    FROM product p
    LEFT JOIN productin pi ON p.productcode = pi.productcode 
      AND pi.date BETWEEN ? AND ?
    LEFT JOIN productout po ON p.productcode = po.productcode 
      AND po.date BETWEEN ? AND ?
    GROUP BY p.productcode
    ORDER BY p.productname ASC
  `;

  db.query(query, [startDate, endDate, startDate, endDate], (err, results) => {
    if (err) return res.status(500).json({ error: `Failed to generate ${reportType} report` });
    
    // Add metadata to the report
    const report = {
      type: reportType,
      startDate,
      endDate,
      products: results,
      summary: {
        totalProducts: results.length,
        totalStockIn: results.reduce((sum, item) => sum + item.total_in, 0),
        totalStockOut: results.reduce((sum, item) => sum + item.total_out, 0)
      }
    };
    
    res.json(report);
  });
}

// ======= DASHBOARD ROUTES =======

// Get dashboard summary
app.get('/api/dashboard/summary', authenticate, (req, res) => {
  const today = getTodayDate();

  db.query(
    `SELECT 
      (SELECT COUNT(*) FROM product) AS total_products,
      (SELECT IFNULL(SUM(quantity), 0) FROM productin WHERE DATE(date) = ?) AS today_stock_in,
      (SELECT IFNULL(SUM(totalprice), 0) FROM productin WHERE DATE(date) = ?) AS today_value_in,
      (SELECT IFNULL(SUM(quantity), 0) FROM productout WHERE DATE(date) = ?) AS today_stock_out,
      (SELECT IFNULL(SUM(totalprice), 0) FROM productout WHERE DATE(date) = ?) AS today_value_out`,
    [today, today, today, today],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch dashboard summary' });
      
      const summary = {
        ...results[0],
        date: today,
        profit: results[0].today_value_out - results[0].today_value_in
      };
      
      res.json(summary);
    }
  );
});

// ======= ERROR HANDLING =======

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ======= START SERVER =======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Stock Management API running on port ${PORT}`);
  console.log(`Server started at: ${getCurrentDateTime()}`);
});
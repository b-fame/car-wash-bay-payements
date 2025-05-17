// 📦 Dependencies
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require('mysql2');

const app = express();
const PORT = 5000;

// 🔧 Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// 🛢️ Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'schooldb'
});

// 🧑 Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

      req.session.user = results[0];
      res.json({ user: results[0] });
    }
  );
});

// 🚪 Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.json({ message: 'Logged out' });
});

// 🔒 Middleware to protect routes
const authenticate = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// 📚 Add Student
app.post('/api/students', authenticate, (req, res) => {
  const { name, email } = req.body;
  db.query('INSERT INTO students (name, email) VALUES (?, ?)', [name, email], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to add student' });
    res.json({ message: 'Student added' });
  });
});

// ❌ Delete Student by ID
app.delete('/api/students/:id', authenticate, (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM students WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete student' });
    res.json({ message: 'Student deleted' });
  });
});

// 📊 Get All Students (for dashboard)
app.get('/api/students', authenticate, (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch students' });
    res.json(results);
  });
});

// 📅 Reports
app.get('/api/reports/:type', authenticate, (req, res) => {
  const type = req.params.type;
  let interval = '';

  if (type === 'daily') interval = 'INTERVAL 1 DAY';
  else if (type === 'weekly') interval = 'INTERVAL 7 DAY';
  else if (type === 'yearly') interval = 'INTERVAL 365 DAY';
  else return res.status(400).json({ error: 'Invalid report type' });

  db.query(
    `SELECT COUNT(*) AS total_students FROM students WHERE created_at >= NOW() - ${interval}`,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to generate report' });
      res.json({ reportType: type, ...results[0] });
    }
  );
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const moment = require('moment');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'washing_bay'
});

db.connect(() => console.log('✅ Database connected'));

app.use(session({
    secret: 'washing_bay_secret_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

// Pricing configuration
const PRICING = {
    small: { Basic: 1000, Special: 2000, VIP: 3000 },
    medium: { Basic: 2000, Special: 3000, VIP: 4000 },
    big: { Basic: 3000, Special: 4000, VIP: 6000 }
};

const calculateFee = (size, pkg, entry, exit) => {
    const base = PRICING[size.toLowerCase()][pkg];
    const hours = Math.ceil(moment(exit).diff(moment(entry), 'hours', true));
    return hours <= 1 ? base : base + ((hours - 1) * (base * 0.2));
};

// Log activity
const logActivity = (userId, action, details, ip) => {
    db.query('INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
        [userId, action, details, ip]);
};

// ==================== AUTHENTICATION ====================
app.post('/api/auth/register', async (req, res) => {
    const { username, password, email, full_name, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Required fields missing' });
    
    const hashed = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [username, hashed, email, full_name, role || 'cashier'], (err) => {
        if (err) return res.status(500).json({ error: 'Username exists' });
        res.json({ message: 'User created successfully' });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ? AND is_active = 1', [username], async (err, users) => {
        if (err || users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const match = await bcrypt.compare(password, users[0].password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });
        
        req.session.user = {
            id: users[0].user_id,
            username: users[0].username,
            role: users[0].role,
            full_name: users[0].full_name
        };
        
        db.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [users[0].user_id]);
        logActivity(users[0].user_id, 'LOGIN', 'User logged in', req.ip);
        
        res.json({ success: true, user: req.session.user });
    });
});

app.post('/api/auth/logout', (req, res) => {
    if (req.session.user) {
        logActivity(req.session.user.id, 'LOGOUT', 'User logged out', req.ip);
    }
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/auth/session', (req, res) => {
    res.json({ loggedIn: !!req.session.user, user: req.session.user });
});

// Middleware for role checking
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
        if (roles.includes(req.session.user.role)) return next();
        res.status(403).json({ error: 'Access denied' });
    };
};

// ==================== VEHICLES ====================
app.get('/api/vehicles', checkRole(['admin', 'manager', 'cashier']), (req, res) => {
    db.query('SELECT v.*, u.username as created_by_name FROM vehicles v LEFT JOIN users u ON v.created_by = u.user_id ORDER BY v.entry_time DESC', (err, results) => {
        res.json(results);
    });
});

app.get('/api/vehicles/active', checkRole(['admin', 'manager', 'cashier']), (req, res) => {
    db.query('SELECT * FROM vehicles WHERE exit_time IS NULL AND payment_status = "unpaid"', (err, results) => {
        res.json(results);
    });
});

app.post('/api/vehicles', checkRole(['admin', 'manager', 'cashier']), (req, res) => {
    const { license_plate, vehicle_type, vehicle_size, ownername, ownerphone } = req.body;
    const entry_time = moment().format('YYYY-MM-DD HH:mm:ss');
    const created_by = req.session.user.id;
    
    db.query('INSERT INTO vehicles (license_plate, vehicle_type, vehicle_size, ownername, ownerphone, entry_time, created_by) VALUES (?,?,?,?,?,?,?)',
        [license_plate, vehicle_type, vehicle_size, ownername, ownerphone, entry_time, created_by], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logActivity(req.session.user.id, 'ADD_VEHICLE', `Added vehicle ${license_plate}`, req.ip);
        res.json({ success: true });
    });
});

app.put('/api/vehicles/:id', checkRole(['admin', 'manager']), (req, res) => {
    const { license_plate, vehicle_type, vehicle_size, ownername, ownerphone } = req.body;
    db.query('UPDATE vehicles SET license_plate=?, vehicle_type=?, vehicle_size=?, ownername=?, ownerphone=? WHERE vehicle_id=?',
        [license_plate, vehicle_type, vehicle_size, ownername, ownerphone, req.params.id], (err) => {
        if (!err) logActivity(req.session.user.id, 'EDIT_VEHICLE', `Edited vehicle ID ${req.params.id}`, req.ip);
        res.json({ success: !err });
    });
});

app.delete('/api/vehicles/:id', checkRole(['admin']), (req, res) => {
    db.query('DELETE FROM vehicles WHERE vehicle_id=?', [req.params.id], (err) => {
        if (!err) logActivity(req.session.user.id, 'DELETE_VEHICLE', `Deleted vehicle ID ${req.params.id}`, req.ip);
        res.json({ success: !err });
    });
});

app.post('/api/vehicles/:id/exit', checkRole(['admin', 'manager', 'cashier']), (req, res) => {
    db.query('UPDATE vehicles SET exit_time=NOW() WHERE vehicle_id=?', [req.params.id], (err) => {
        if (!err) logActivity(req.session.user.id, 'MARK_EXIT', `Marked exit for vehicle ID ${req.params.id}`, req.ip);
        res.json({ success: !err });
    });
});

// ==================== PACKAGES ====================
app.get('/api/packages', checkRole(['admin', 'manager', 'cashier']), (req, res) => {
    db.query('SELECT * FROM packages', (err, results) => {
        res.json(results);
    });
});

app.post('/api/packages', checkRole(['admin']), (req, res) => {
    const { package_name, fee_charged } = req.body;
    db.query('INSERT INTO packages (package_name, fee_charged) VALUES (?, ?)', [package_name, fee_charged], (err) => {
        if (!err) logActivity(req.session.user.id, 'ADD_PACKAGE', `Added package ${package_name}`, req.ip);
        res.json({ success: !err });
    });
});

app.put('/api/packages/:id', checkRole(['admin']), (req, res) => {
    const { package_name, fee_charged } = req.body;
    db.query('UPDATE packages SET package_name=?, fee_charged=? WHERE pack_id=?', [package_name, fee_charged, req.params.id], (err) => {
        res.json({ success: !err });
    });
});

app.delete('/api/packages/:id', checkRole(['admin']), (req, res) => {
    db.query('DELETE FROM packages WHERE pack_id=?', [req.params.id], (err) => {
        res.json({ success: !err });
    });
});

// ==================== PAYMENTS ====================
app.post('/api/payments', checkRole(['admin', 'manager', 'cashier']), (req, res) => {
    const { vehicle_id, package_id } = req.body;
    const userId = req.session.user.id;
    
    db.query('SELECT * FROM vehicles WHERE vehicle_id=?', [vehicle_id], (err, vehicles) => {
        if (err || vehicles.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        const vehicle = vehicles[0];
        
        db.query('SELECT * FROM packages WHERE pack_id=?', [package_id], (err, packages) => {
            const pkg = packages[0];
            const exitTime = moment().format('YYYY-MM-DD HH:mm:ss');
            const amount = calculateFee(vehicle.vehicle_size, pkg.package_name, vehicle.entry_time, exitTime);
            
            db.query('INSERT INTO payments (vehicle_id, amount, package_id, user_id, entry_time, exit_time) VALUES (?,?,?,?,?,?)',
                [vehicle_id, amount, package_id, userId, vehicle.entry_time, exitTime], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                
                db.query('UPDATE vehicles SET payment_status="paid", exit_time=? WHERE vehicle_id=?', [exitTime, vehicle_id]);
                logActivity(userId, 'RECORD_PAYMENT', `Payment of ${amount} for vehicle ${vehicle.license_plate}`, req.ip);
                res.json({ success: true, amount });
            });
        });
    });
});

app.get('/api/payments', checkRole(['admin', 'manager', 'cashier']), (req, res) => {
    db.query(`SELECT p.*, v.license_plate, v.vehicle_type, pk.package_name, u.username as cashier 
              FROM payments p 
              JOIN vehicles v ON p.vehicle_id=v.vehicle_id 
              JOIN packages pk ON p.package_id=pk.pack_id 
              JOIN users u ON p.user_id=u.user_id 
              ORDER BY p.payment_date DESC`, (err, results) => {
        res.json(results);
    });
});

app.get('/api/payments/daily', checkRole(['admin', 'manager']), (req, res) => {
    const date = req.query.date || moment().format('YYYY-MM-DD');
    db.query(`SELECT v.vehicle_size, pk.package_name, COUNT(*) as count, SUM(p.amount) as revenue 
              FROM payments p 
              JOIN vehicles v ON p.vehicle_id=v.vehicle_id 
              JOIN packages pk ON p.package_id=pk.pack_id 
              WHERE DATE(p.payment_date)=? 
              GROUP BY v.vehicle_size, pk.package_name`, [date], (err, results) => {
        res.json(results);
    });
});

// ==================== REPORTS ====================
app.get('/api/reports/daily', checkRole(['admin', 'manager']), (req, res) => {
    const date = req.query.date || moment().format('YYYY-MM-DD');
    db.query(`SELECT v.vehicle_size, pk.package_name, COUNT(*) as count, SUM(p.amount) as revenue 
              FROM payments p 
              JOIN vehicles v ON p.vehicle_id=v.vehicle_id 
              JOIN packages pk ON p.package_id=pk.pack_id 
              WHERE DATE(p.payment_date)=? 
              GROUP BY v.vehicle_size, pk.package_name`, [date], (err, results) => {
        res.json(results);
    });
});

app.get('/api/reports/monthly', checkRole(['admin', 'manager']), (req, res) => {
    db.query(`SELECT DATE(payment_date) as date, SUM(amount) as revenue, COUNT(*) as payments 
              FROM payments 
              WHERE MONTH(payment_date)=MONTH(CURDATE()) 
              GROUP BY DATE(payment_date)`, (err, results) => {
        res.json(results);
    });
});

app.get('/api/reports/vehicles', checkRole(['admin', 'manager']), (req, res) => {
    db.query(`SELECT vehicle_type, vehicle_size, COUNT(*) as total, 
              SUM(CASE WHEN payment_status='paid' THEN 1 ELSE 0 END) as paid 
              FROM vehicles GROUP BY vehicle_type, vehicle_size`, (err, results) => {
        res.json(results);
    });
});

// ==================== USERS (Admin only) ====================
app.get('/api/users', checkRole(['admin']), (req, res) => {
    db.query('SELECT user_id, username, email, full_name, role, is_active, last_login, created_at FROM users', (err, results) => {
        res.json(results);
    });
});

app.post('/api/users', checkRole(['admin']), async (req, res) => {
    const { username, password, email, full_name, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password, email, full_name, role) VALUES (?,?,?,?,?)',
        [username, hashed, email, full_name, role], (err) => {
        if (err) return res.status(500).json({ error: 'Username exists' });
        logActivity(req.session.user.id, 'ADD_USER', `Added user ${username}`, req.ip);
        res.json({ success: true });
    });
});

app.put('/api/users/:id', checkRole(['admin']), (req, res) => {
    const { email, full_name, role, is_active } = req.body;
    db.query('UPDATE users SET email=?, full_name=?, role=?, is_active=? WHERE user_id=?',
        [email, full_name, role, is_active, req.params.id], (err) => {
        res.json({ success: !err });
    });
});

app.delete('/api/users/:id', checkRole(['admin']), (req, res) => {
    db.query('DELETE FROM users WHERE user_id=? AND role != "admin"', [req.params.id], (err) => {
        res.json({ success: !err });
    });
});

app.get('/api/activity-logs', checkRole(['admin']), (req, res) => {
    db.query(`SELECT l.*, u.username FROM activity_logs l JOIN users u ON l.user_id=u.user_id ORDER BY l.created_at DESC LIMIT 100`, (err, results) => {
        res.json(results);
    });
});

// ==================== STATS DASHBOARD ====================
app.get('/api/stats', checkRole(['admin', 'manager', 'cashier']), (req, res) => {
    db.query('SELECT COUNT(*) as total_vehicles FROM vehicles', (err, vehicles) => {
        db.query('SELECT COUNT(*) as total_payments FROM payments', (err, payments) => {
            db.query('SELECT SUM(amount) as total_revenue FROM payments', (err, revenue) => {
                db.query('SELECT COUNT(*) as active_vehicles FROM vehicles WHERE exit_time IS NULL', (err, active) => {
                    db.query('SELECT COUNT(*) as total_users FROM users', (err, users) => {
                        db.query('SELECT SUM(amount) as today_revenue FROM payments WHERE DATE(payment_date)=CURDATE()', (err, today) => {
                            res.json({
                                total_vehicles: vehicles[0]?.total_vehicles || 0,
                                total_payments: payments[0]?.total_payments || 0,
                                total_revenue: revenue[0]?.total_revenue || 0,
                                active_vehicles: active[0]?.active_vehicles || 0,
                                total_users: users[0]?.total_users || 0,
                                today_revenue: today[0]?.today_revenue || 0
                            });
                        });
                    });
                });
            });
        });
    });
});

const PORT = 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
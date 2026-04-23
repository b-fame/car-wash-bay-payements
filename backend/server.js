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

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Database connected successfully');
});

app.use(session({
    secret: 'washing_bay_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
        httpOnly: true,
        secure: false
    }
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

// Log activity helper
const logActivity = (userId, action, details, ip) => {
    if (!userId) return;
    db.query('INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
        [userId, action, details || '', ip || ''], (err) => {
        if (err) console.error('Log error:', err);
    });
};

// ==================== AUTHENTICATION ====================

// REGISTER with role selection
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, email, full_name, role } = req.body;
        
        // Validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        // Check if username already exists
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Set role (default to 'cashier' if not provided or invalid)
            let userRole = 'cashier';
            if (role && ['admin', 'manager', 'cashier'].includes(role)) {
                userRole = role;
            }
            
            // Insert new user with selected role
            db.query(
                'INSERT INTO users (username, password, email, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
                [username, hashedPassword, email || null, full_name || null, userRole],
                (err, result) => {
                    if (err) {
                        console.error('Registration error:', err);
                        return res.status(500).json({ error: 'Failed to create account' });
                    }
                    
                    const newUserId = result.insertId;
                    
                    // Log the registration
                    logActivity(newUserId, 'REGISTER', `New user registered with ${userRole} role`, req.ip);
                    
                    res.json({ 
                        success: true, 
                        message: `Account created successfully with ${userRole} role`,
                        role: userRole
                    });
                }
            );
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM users WHERE username = ? AND is_active = 1', [username], async (err, users) => {
        if (err || users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        req.session.user = {
            id: user.user_id,
            username: user.username,
            role: user.role,
            full_name: user.full_name,
            email: user.email
        };
        
        // Update last login time
        db.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);
        
        // Log login activity
        logActivity(user.user_id, 'LOGIN', 'User logged in', req.ip);
        
        res.json({ 
            success: true, 
            user: req.session.user,
            message: `Welcome back, ${user.full_name || user.username}!`
        });
    });
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
    if (req.session.user) {
        logActivity(req.session.user.id, 'LOGOUT', 'User logged out', req.ip);
    }
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// CHECK SESSION
app.get('/api/auth/session', (req, res) => {
    if (req.session.user) {
        res.json({ 
            loggedIn: true, 
            user: req.session.user 
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// GET CURRENT USER
app.get('/api/auth/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(req.session.user);
});

// Middleware for role checking
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (roles.includes(req.session.user.role)) {
            return next();
        }
        res.status(403).json({ error: 'Access denied. Required role: ' + roles.join(' or ') });
    };
};

// ==================== VEHICLES ====================

// Get all vehicles
app.get('/api/vehicles', checkAuth, (req, res) => {
    db.query('SELECT * FROM vehicles ORDER BY entry_time DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get active vehicles (in bay, not paid)
app.get('/api/vehicles/active', checkAuth, (req, res) => {
    db.query('SELECT * FROM vehicles WHERE exit_time IS NULL AND payment_status = "unpaid"', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add vehicle
app.post('/api/vehicles', checkAuth, (req, res) => {
    const { license_plate, vehicle_type, vehicle_size, ownername, ownerphone } = req.body;
    const entry_time = moment().format('YYYY-MM-DD HH:mm:ss');
    const created_by = req.session.user.id;
    
    // Check if vehicle already in bay
    db.query('SELECT * FROM vehicles WHERE license_plate = ? AND exit_time IS NULL', [license_plate], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            return res.status(400).json({ error: 'Vehicle already in the washing bay' });
        }
        
        db.query(
            'INSERT INTO vehicles (license_plate, vehicle_type, vehicle_size, ownername, ownerphone, entry_time, created_by) VALUES (?,?,?,?,?,?,?)',
            [license_plate, vehicle_type, vehicle_size, ownername, ownerphone, entry_time, created_by], 
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                logActivity(req.session.user.id, 'ADD_VEHICLE', `Added vehicle ${license_plate}`, req.ip);
                res.json({ success: true, message: 'Vehicle added successfully' });
            }
        );
    });
});

// Update vehicle (Admin & Manager only)
app.put('/api/vehicles/:id', checkRole(['admin', 'manager']), (req, res) => {
    const { license_plate, vehicle_type, vehicle_size, ownername, ownerphone } = req.body;
    db.query(
        'UPDATE vehicles SET license_plate=?, vehicle_type=?, vehicle_size=?, ownername=?, ownerphone=? WHERE vehicle_id=?',
        [license_plate, vehicle_type, vehicle_size, ownername, ownerphone, req.params.id], 
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            logActivity(req.session.user.id, 'EDIT_VEHICLE', `Edited vehicle ID ${req.params.id}`, req.ip);
            res.json({ success: true, message: 'Vehicle updated successfully' });
        }
    );
});

// Delete vehicle (Admin only)
app.delete('/api/vehicles/:id', checkRole(['admin']), (req, res) => {
    db.query('DELETE FROM vehicles WHERE vehicle_id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logActivity(req.session.user.id, 'DELETE_VEHICLE', `Deleted vehicle ID ${req.params.id}`, req.ip);
        res.json({ success: true, message: 'Vehicle deleted successfully' });
    });
});

// Mark vehicle as exited
app.post('/api/vehicles/:id/exit', checkAuth, (req, res) => {
    db.query('UPDATE vehicles SET exit_time=NOW() WHERE vehicle_id=? AND exit_time IS NULL', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logActivity(req.session.user.id, 'MARK_EXIT', `Marked exit for vehicle ID ${req.params.id}`, req.ip);
        res.json({ success: true, message: 'Exit recorded successfully' });
    });
});

// ==================== PACKAGES ====================

// Get all packages
app.get('/api/packages', checkAuth, (req, res) => {
    db.query('SELECT * FROM packages', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add package (Admin only)
app.post('/api/packages', checkRole(['admin']), (req, res) => {
    const { package_name, fee_charged } = req.body;
    db.query('INSERT INTO packages (package_name, fee_charged) VALUES (?, ?)', [package_name, fee_charged], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logActivity(req.session.user.id, 'ADD_PACKAGE', `Added package ${package_name}`, req.ip);
        res.json({ success: true, message: 'Package added successfully' });
    });
});

// Update package (Admin only)
app.put('/api/packages/:id', checkRole(['admin']), (req, res) => {
    const { package_name, fee_charged } = req.body;
    db.query('UPDATE packages SET package_name=?, fee_charged=? WHERE pack_id=?', [package_name, fee_charged, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Package updated successfully' });
    });
});

// Delete package (Admin only)
app.delete('/api/packages/:id', checkRole(['admin']), (req, res) => {
    db.query('DELETE FROM packages WHERE pack_id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Package deleted successfully' });
    });
});

// ==================== PAYMENTS ====================

// Record payment
app.post('/api/payments', checkAuth, (req, res) => {
    const { vehicle_id, package_id } = req.body;
    const userId = req.session.user.id;
    
    db.query('SELECT * FROM vehicles WHERE vehicle_id=?', [vehicle_id], (err, vehicles) => {
        if (err) return res.status(500).json({ error: err.message });
        if (vehicles.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        
        const vehicle = vehicles[0];
        
        db.query('SELECT * FROM packages WHERE pack_id=?', [package_id], (err, packages) => {
            if (err) return res.status(500).json({ error: err.message });
            if (packages.length === 0) return res.status(404).json({ error: 'Package not found' });
            
            const pkg = packages[0];
            const exitTime = moment().format('YYYY-MM-DD HH:mm:ss');
            const amount = calculateFee(vehicle.vehicle_size, pkg.package_name, vehicle.entry_time, exitTime);
            
            db.query(
                'INSERT INTO payments (vehicle_id, amount, package_id, user_id, entry_time, exit_time) VALUES (?,?,?,?,?,?)',
                [vehicle_id, amount, package_id, userId, vehicle.entry_time, exitTime], 
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    db.query('UPDATE vehicles SET payment_status="paid", exit_time=? WHERE vehicle_id=?', [exitTime, vehicle_id]);
                    logActivity(userId, 'RECORD_PAYMENT', `Payment of ${amount} for vehicle ${vehicle.license_plate}`, req.ip);
                    res.json({ success: true, amount: amount, message: 'Payment recorded successfully' });
                }
            );
        });
    });
});

// Get all payments
app.get('/api/payments', checkAuth, (req, res) => {
    db.query(`SELECT p.*, v.license_plate, v.vehicle_type, pk.package_name, u.username as cashier 
              FROM payments p 
              JOIN vehicles v ON p.vehicle_id=v.vehicle_id 
              JOIN packages pk ON p.package_id=pk.pack_id 
              JOIN users u ON p.user_id=u.user_id 
              ORDER BY p.payment_date DESC`, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ==================== REPORTS ====================

// Daily report (Admin & Manager only)
app.get('/api/reports/daily', checkRole(['admin', 'manager']), (req, res) => {
    const date = req.query.date || moment().format('YYYY-MM-DD');
    db.query(`SELECT v.vehicle_size, pk.package_name, COUNT(*) as count, SUM(p.amount) as revenue 
              FROM payments p 
              JOIN vehicles v ON p.vehicle_id=v.vehicle_id 
              JOIN packages pk ON p.package_id=pk.pack_id 
              WHERE DATE(p.payment_date)=? 
              GROUP BY v.vehicle_size, pk.package_name`, [date], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Monthly report (Admin & Manager only)
app.get('/api/reports/monthly', checkRole(['admin', 'manager']), (req, res) => {
    db.query(`SELECT DATE(payment_date) as date, SUM(amount) as revenue, COUNT(*) as payments 
              FROM payments 
              WHERE MONTH(payment_date)=MONTH(CURDATE()) 
              GROUP BY DATE(payment_date)`, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Vehicle statistics report (Admin & Manager only)
app.get('/api/reports/vehicles', checkRole(['admin', 'manager']), (req, res) => {
    db.query(`SELECT vehicle_type, vehicle_size, COUNT(*) as total, 
              SUM(CASE WHEN payment_status='paid' THEN 1 ELSE 0 END) as paid 
              FROM vehicles GROUP BY vehicle_type, vehicle_size`, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ==================== USERS (Admin only) ====================

// Get all users
app.get('/api/users', checkRole(['admin']), (req, res) => {
    db.query('SELECT user_id, username, email, full_name, role, is_active, last_login, created_at FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Create user (Admin only)
app.post('/api/users', checkRole(['admin']), async (req, res) => {
    try {
        const { username, password, email, full_name, role } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'cashier';
        
        db.query(
            'INSERT INTO users (username, password, email, full_name, role) VALUES (?,?,?,?,?)',
            [username, hashedPassword, email || null, full_name || null, userRole], 
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                logActivity(req.session.user.id, 'ADD_USER', `Added user ${username} with role ${userRole}`, req.ip);
                res.json({ success: true, message: 'User created successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user (Admin only)
app.put('/api/users/:id', checkRole(['admin']), (req, res) => {
    const { email, full_name, role, is_active } = req.body;
    db.query(
        'UPDATE users SET email=?, full_name=?, role=?, is_active=? WHERE user_id=?',
        [email, full_name, role, is_active, req.params.id], 
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'User updated successfully' });
        }
    );
});

// Delete user (Admin only)
app.delete('/api/users/:id', checkRole(['admin']), (req, res) => {
    db.query('DELETE FROM users WHERE user_id=? AND role != "admin"', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'User deleted successfully' });
    });
});

// ==================== ACTIVITY LOGS (Admin only) ====================
app.get('/api/activity-logs', checkRole(['admin']), (req, res) => {
    db.query(`SELECT l.*, u.username FROM activity_logs l JOIN users u ON l.user_id=u.user_id ORDER BY l.created_at DESC LIMIT 100`, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ==================== STATS DASHBOARD ====================
app.get('/api/stats', checkAuth, (req, res) => {
    const queries = {
        total_vehicles: 'SELECT COUNT(*) as count FROM vehicles',
        total_payments: 'SELECT COUNT(*) as count FROM payments',
        total_revenue: 'SELECT SUM(amount) as total FROM payments',
        active_vehicles: 'SELECT COUNT(*) as count FROM vehicles WHERE exit_time IS NULL',
        today_revenue: 'SELECT SUM(amount) as total FROM payments WHERE DATE(payment_date)=CURDATE()'
    };
    
    Promise.all(Object.entries(queries).map(([key, query]) => {
        return new Promise((resolve) => {
            db.query(query, (err, result) => {
                if (err) resolve({ [key]: 0 });
                else if (key === 'total_revenue' || key === 'today_revenue') resolve({ [key]: result[0]?.total || 0 });
                else resolve({ [key]: result[0]?.count || 0 });
            });
        });
    })).then(results => {
        const stats = Object.assign({}, ...results);
        res.json(stats);
    }).catch(() => {
        res.json({ total_vehicles: 0, total_payments: 0, total_revenue: 0, active_vehicles: 0, today_revenue: 0 });
    });
});

// ==================== START SERVER ====================
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`✅ Authentication enabled with bcrypt`);
    console.log(`✅ Role-based access control active`);
    console.log(`✅ Available roles: admin, manager, cashier`);
});
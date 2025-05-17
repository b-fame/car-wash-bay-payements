const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const moment = require('moment');
const session = require('express-session');
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'washing_bay'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to database successfully');
    }
});

// Session configuration
app.use(session({
    secret: 'parking_system_secret_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000, // 1 hour being loged in 
        httpOnly: true,
        secure: false
    }
}));

// Pricing configuration
const PRICING = {
    small: {
        Basic: 1000,
        Special: 2000,
        VIP: 3000
    },
    medium: {
        Basic: 2000,
        Special: 3000,
        VIP: 4000
    },
    big: {
        Basic: 3000,
        Special: 4000,
        VIP: 6000
    }
};

// Helper function to calculate parking fee
const calculateParkingFee = (vehicleSize, packageName, entryTime) => {
    const size = vehicleSize.toLowerCase();
    const pkg = packageName.trim();
    
    if (!PRICING[size] || !PRICING[size][pkg]) {
        throw new Error('Invalid vehicle size or package type');
    }
    
    const basePrice = PRICING[size][pkg];
    const hoursParked = moment().diff(moment(entryTime), 'hours');
    
    // Example: Charge per hour after first hour
    if (hoursParked > 1) {
        return basePrice + ((hoursParked - 1) * (basePrice * 0.2)); // 20% of base price per extra hour
    }
    
    return basePrice;
};

// ==================== Authentication Endpoints ==================== //

// Login
app.post('/api/auth/login', (req, res) => {
    const { Username, password } = req.body;
    
    db.query('SELECT * FROM users WHERE Username = ?', [Username], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (result.length === 0) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        
        const user = result[0];
        if (user.password === password) {
            req.session.user = {
                userId: user.UserId,
                username: user.Username
            };
            return res.json({ 
                success: true, 
                message: 'Login successful',
                user: { userId: user.UserId, username: user.Username }
            });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }
    });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logout successful' });
    });
});

// Check session
app.get('/api/auth/session', (req, res) => {
    if (req.session.user) {
        res.json({ 
            isLoggedIn: true, 
            user: req.session.user 
        });
    } else {
        res.json({ isLoggedIn: false });
    }
});

// ==================== Account Creation Endpoint ==================== //

// Create new account
app.post('/api/auth/register', (req, res) => {
    const { Username, password, confirmPassword } = req.body;
    
    // Validate input
    if (!Username || !password || !confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }
    
    if (password !== confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Passwords do not match' 
        });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password must be at least 6 characters long' 
        });
    }
    
    // Check if username already exists
    db.query('SELECT * FROM users WHERE Username = ?', [Username], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ 
                success: false, 
                message: 'Database error during username check' 
            });
        }
        
        if (result.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }
        
        // Create new user
        db.query(
            'INSERT INTO users (Username, password) VALUES (?, ?)',
            [Username, password],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Failed to create account' 
                    });
                }
                
                return res.json({ 
                    success: true, 
                    message: 'Account created successfully. Redirecting to login...',
                    redirect: true,
                    redirectDelay: 2000, // 2 seconds
                    redirectTo: '/login' 
                });
            }
        );
    });
});

// ==================== Vehicle Endpoints ==================== //

// Add vehicle
// Add vehicle with entry time
app.post('/api/vehicles', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const { license_plate, vehicle_type, vehicle_size, ownername, ownerphone } = req.body;
    const entry_time = moment().format('YYYY-MM-DD HH:mm:ss');
    
    // Validate vehicle size
    if (!['small', 'medium', 'big'].includes(vehicle_size.toLowerCase())) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid vehicle size. Must be small, medium, or big' 
        });
    }
    
    db.query('SELECT * FROM vehicles WHERE license_plate = ? AND exit_time IS NULL', [license_plate], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (result.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'This vehicle is already in the washing bay' 
            });
        }
        
        db.query(
            'INSERT INTO vehicles (license_plate, vehicle_type, vehicle_size, ownername, ownerphone, entry_time, payment_status) VALUES (?, ?, ?, ?, ?, ?, "unpaid")',
            [license_plate, vehicle_type, vehicle_size, ownername, ownerphone, entry_time],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Failed to add vehicle' });
                }
                return res.status(201).json({ 
                    success: true, 
                    message: 'Vehicle added successfully',
                    vehicleId: result.insertId,
                    entry_time
                });
            }
        );
    });
});

// Mark vehicle as exited
app.post('/api/vehicles/:id/exit', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const { id } = req.params;
    const exit_time = moment().format('YYYY-MM-DD HH:mm:ss');
    
    db.query(
        'UPDATE vehicles SET exit_time = ? WHERE vehicle_id = ? AND exit_time IS NULL',
        [exit_time, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Failed to update vehicle exit time' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Vehicle not found or already exited' 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Vehicle exit recorded successfully',
                exit_time 
            });
        }
    );
});

// Get all vehicles
app.get('/api/vehicles', (req, res) => {
    db.query('SELECT * FROM vehicles', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
        }
        res.json({ success: true, vehicles: result });
    });
});

// Get single vehicle
app.get('/api/vehicles/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT * FROM vehicles WHERE vehicle_id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        
        res.json({ success: true, vehicle: result[0] });
    });
});

// Update vehicle
app.put('/api/vehicles/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const { id } = req.params;
    const { license_plate, vehicle_type, vehicle_size, ownername, ownerphone } = req.body;
    
    db.query(
        'UPDATE vehicles SET license_plate = ?, vehicle_type = ?, vehicle_size = ?, ownername = ?, ownerphone = ? WHERE vehicle_id = ?',
        [license_plate, vehicle_type, vehicle_size, ownername, ownerphone, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Failed to update vehicle' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Vehicle not found' });
            }
            
            res.json({ success: true, message: 'Vehicle updated successfully' });
        }
    );
});

// Delete vehicle
app.delete('/api/vehicles/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const { id } = req.params;
    
    db.query('DELETE FROM vehicles WHERE vehicle_id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to delete vehicle' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        
        res.json({ success: true, message: 'Vehicle deleted successfully' });
    });
});

// ==================== Package Endpoints ==================== //

// Get all packages
app.get('/api/packages', (req, res) => {
    db.query('SELECT * FROM packages', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to fetch packages' });
        }
        
        // Add pricing information to the response
        const packagesWithPricing = result.map(pkg => ({
            ...pkg,
            pricing: {
                small: PRICING.small[pkg.package_name],
                medium: PRICING.medium[pkg.package_name],
                big: PRICING.big[pkg.package_name]
            }
        }));
        
        res.json({ success: true, packages: packagesWithPricing });
    });
});

// ==================== Payment Endpoints ==================== //

// Create payment
//  payment endpoint
app.post('/api/payments', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const { vehicle_id, package_id } = req.body;
    const payment_date = moment().format('YYYY-MM-DD HH:mm:ss');
    const User_Id = req.session.user.userId;
    
    // Start transaction
    db.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Transaction error' 
            });
        }
        
        // First get vehicle details with entry time
        db.query(`
            SELECT v.vehicle_size, v.entry_time, p.package_name 
            FROM vehicles v, packages p 
            WHERE v.vehicle_id = ? AND p.pack_id = ?`, 
            [vehicle_id, package_id], 
            (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error(err);
                        res.status(500).json({ success: false, message: 'Database error' });
                    });
                }
                
                if (result.length === 0) {
                    return db.rollback(() => {
                        res.status(404).json({ 
                            success: false, 
                            message: 'Vehicle or package not found' 
                        });
                    });
                }
                
                const { vehicle_size, entry_time, package_name } = result[0];
                const exit_time = moment().format('YYYY-MM-DD HH:mm:ss');
                
                try {
                    const amount = calculateParkingFee(vehicle_size, package_name);
                    
                    // Insert payment with entry and exit times
                    db.query(
                        'INSERT INTO payments (vehicle_id, amount, payment_date, package_id, User_Id, entry_time, exit_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [vehicle_id, amount, payment_date, package_id, User_Id, entry_time, exit_time],
                        (err, paymentResult) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error(err);
                                    res.status(500).json({ 
                                        success: false, 
                                        message: 'Failed to record payment' 
                                    });
                                });
                            }
                            
                            // Update vehicle status and exit time
                            db.query(
                                'UPDATE vehicles SET payment_status = "paid", exit_time = ? WHERE vehicle_id = ?',
                                [exit_time, vehicle_id],
                                (err, updateResult) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            console.error(err);
                                            res.status(500).json({ 
                                                success: false, 
                                                message: 'Failed to update vehicle status' 
                                            });
                                        });
                                    }
                                    
                                    // Commit transaction
                                    db.commit(err => {
                                        if (err) {
                                            return db.rollback(() => {
                                                console.error(err);
                                                res.status(500).json({ 
                                                    success: false, 
                                                    message: 'Transaction commit failed' 
                                                });
                                            });
                                        }
                                        
                                        res.status(201).json({ 
                                            success: true, 
                                            message: 'Payment recorded successfully',
                                            paymentId: paymentResult.insertId,
                                            amount,
                                            payment_date,
                                            entry_time,
                                            exit_time
                                        });
                                    });
                                }
                            );
                        }
                    );
                } catch (error) {
                    return db.rollback(() => {
                        res.status(400).json({ 
                            success: false, 
                            message: error.message 
                        });
                    });
                }
            }
        );
    });
});
app.get('/api/vehicles/:id/status', (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT payment_status FROM vehicles WHERE vehicle_id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        
        res.json({ success: true, status: result[0].payment_status });
    });
});

// Get all payments
app.get('/api/payments', (req, res) => {
    const { startDate, endDate, vehicleId } = req.query;
    
    let query = `
        SELECT p.*, v.license_plate, v.vehicle_type, v.vehicle_size, 
               v.ownername, v.ownerphone, pk.package_name, u.Username as cashier
        FROM payments p
        JOIN vehicles v ON p.vehicle_id = v.vehicle_id
        JOIN packages pk ON p.package_id = pk.pack_id
        JOIN users u ON p.User_Id = u.UserId
    `;
    
    const queryParams = [];
    const conditions = [];
    
    if (startDate && endDate) {
        conditions.push('p.payment_date BETWEEN ? AND ?');
        queryParams.push(startDate, endDate);
    }
    
    if (vehicleId) {
        conditions.push('p.vehicle_id = ?');
        queryParams.push(vehicleId);
    }
    
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.payment_date DESC';
    
    db.query(query, queryParams, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch payments' 
            });
        }
        
        res.json({ success: true, payments: result });
    });
});

// Get currently active vehicles (in the washing bay)
app.get('/api/vehicles/active', (req, res) => {
    db.query('SELECT * FROM vehicles WHERE exit_time IS NULL', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to fetch active vehicles' });
        }
        res.json({ success: true, vehicles: result });
    });
});

// Get vehicle history with time spent
app.get('/api/vehicles/:id/history', (req, res) => {
    const { id } = req.params;
    
    db.query(`
        SELECT 
            v.*, 
            TIMESTAMPDIFF(MINUTE, entry_time, IFNULL(exit_time, NOW())) as minutes_in_bay,
            p.amount, p.payment_date, pk.package_name
        FROM vehicles v
        LEFT JOIN payments p ON v.vehicle_id = p.vehicle_id
        LEFT JOIN packages pk ON p.package_id = pk.pack_id
        WHERE v.vehicle_id = ?
        ORDER BY entry_time DESC`,
        [id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            
            if (result.length === 0) {
                return res.status(404).json({ success: false, message: 'Vehicle not found' });
            }
            
            res.json({ success: true, history: result });
        }
    );
});

// ==================== Report Endpoints ==================== //

// Daily summary report
app.get('/api/reports/daily-summary', (req, res) => {
    const { date = moment().format('YYYY-MM-DD') } = req.query;
    
    const startOfDay = moment(date).startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endOfDay = moment(date).endOf('day').format('YYYY-MM-DD HH:mm:ss');
    
    const query = `
        SELECT 
            COUNT(*) as total_payments,
            SUM(amount) as total_revenue,
            v.vehicle_size,
            p.package_name
        FROM payments py
        JOIN vehicles v ON py.vehicle_id = v.vehicle_id
        JOIN packages p ON py.package_id = p.pack_id
        WHERE py.payment_date BETWEEN ? AND ?
        GROUP BY v.vehicle_size, p.package_name
        ORDER BY v.vehicle_size, p.package_name
    `;
    
    db.query(query, [startOfDay, endOfDay], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to generate daily summary' 
            });
        }
        
        res.json({ 
            success: true, 
            date,
            startTime: startOfDay,
            endTime: endOfDay,
            summary: result 
        });
    });
});

// Time-based analysis report
app.get('/api/reports/time-analysis', (req, res) => {
    const { startDate, endDate } = req.query;
    
    let query = `
        SELECT 
            v.vehicle_type,
            AVG(TIMESTAMPDIFF(MINUTE, p.entry_time, p.exit_time)) as avg_time_minutes,
            COUNT(*) as total_vehicles
        FROM payments p
        JOIN vehicles v ON p.vehicle_id = v.vehicle_id
    `;
    
    const queryParams = [];
    
    if (startDate && endDate) {
        query += ' WHERE p.payment_date BETWEEN ? AND ?';
        queryParams.push(startDate, endDate);
    }
    
    query += ' GROUP BY v.vehicle_type ORDER BY avg_time_minutes DESC';
    
    db.query(query, queryParams, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to generate time analysis report' 
            });
        }
        
        res.json({ 
            success: true, 
            startDate,
            endDate,
            report: result 
        });
    });
});
// Vehicle type summary report
app.get('/api/reports/vehicle-type-summary', (req, res) => {
    const { startDate, endDate } = req.query;
    
    let query = `
        SELECT 
            v.vehicle_type,
            COUNT(*) as total_payments,
            SUM(py.amount) as total_revenue
        FROM payments py
        JOIN vehicles v ON py.vehicle_id = v.vehicle_id
    `;
    
    const queryParams = [];
    
    if (startDate && endDate) {
        query += ' WHERE py.payment_date BETWEEN ? AND ?';
        queryParams.push(startDate, endDate);
    }
    
    query += ' GROUP BY v.vehicle_type ORDER BY total_revenue DESC';
    
    db.query(query, queryParams, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to generate vehicle type summary' 
            });
        }
        
        res.json({ 
            success: true, 
            startDate,
            endDate,
            summary: result 
        });
    });
});

// Start server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



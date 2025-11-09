const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'marketplace-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database connection - untuk auth saja
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'marketplace'
};

// Create connection pool
let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('Database connection pool created');
} catch (error) {
    console.error('Error creating database pool:', error);
}

// Test database connection
async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Routes untuk Authentication saja

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;
        
        // Check if email already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const [result] = await pool.execute(
            'INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)',
            [full_name, email, phone, hashedPassword]
        );
        
        res.status(201).json({ 
            message: 'Registrasi berhasil',
            user: {
                id: result.insertId,
                full_name,
                email,
                phone
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { credential, password, user_type } = req.body;
        
        // Find user by email or phone
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE (email = ? OR phone = ?) AND user_type = ?',
            [credential, credential, user_type]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email/nomor telepon atau password salah' });
        }
        
        const user = users[0];
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Email/nomor telepon atau password salah' });
        }
        
        // Generate token
        const token = jwt.sign(
            { userId: user.id, userType: user.user_type },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                user_type: user.user_type
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// Verify token (untuk check auth status)
app.get('/api/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Token required' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const [users] = await pool.execute(
            'SELECT id, email, phone, full_name, user_type FROM users WHERE id = ?',
            [decoded.userId]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        res.json({ user: users[0] });
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Server is running' 
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Login page: http://localhost:${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
        console.log('💡 Tips: Pastikan MySQL berjalan dan database "marketplace" sudah dibuat');
        console.log('💡 Jalankan: mysql -u root -p < database.sql');
    }
});
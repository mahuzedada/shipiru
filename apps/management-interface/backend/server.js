const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { generateToken, verifyToken, hashPassword, comparePassword } = require('./auth');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./shipiru.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to the shipiru database.');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    app_id INTEGER,
    FOREIGN KEY (app_id) REFERENCES apps (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS deployments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER,
    version TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    condition TEXT NOT NULL,
    threshold REAL NOT NULL,
    service_id INTEGER,
    FOREIGN KEY (service_id) REFERENCES services (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )`);
});

// Middleware to check JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

// User registration
app.post('/api/register', (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = hashPassword(password);

  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashedPassword, role], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

// User login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'User not found' });

    if (comparePassword(password, user.password)) {
      const token = generateToken(user);
      res.json({ token });
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  });
});
app.use('/api', authenticateToken);

// Routes for apps
app.get('/api/apps', (req, res) => {
  db.all('SELECT * FROM apps', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/apps', (req, res) => {
  const { name, description } = req.body;
  db.run('INSERT INTO apps (name, description) VALUES (?, ?)', [name, description], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Routes for services
app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/services', (req, res) => {
  const { name, app_id } = req.body;
  db.run('INSERT INTO services (name, app_id) VALUES (?, ?)', [name, app_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Routes for deployments
app.get('/api/deployments', (req, res) => {
  db.all('SELECT * FROM deployments', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/deployments', (req, res) => {
  const { service_id, version, status } = req.body;
  db.run('INSERT INTO deployments (service_id, version, status) VALUES (?, ?, ?)',
    [service_id, version, status], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

// Routes for alerts
app.get('/api/alerts', (req, res) => {
  db.all('SELECT * FROM alerts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/alerts', (req, res) => {
  const { name, condition, threshold, service_id } = req.body;
  db.run('INSERT INTO alerts (name, condition, threshold, service_id) VALUES (?, ?, ?, ?)',
    [name, condition, threshold, service_id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

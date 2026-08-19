const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

// SQLite verilənlər bazası
// Railway Volume: /data qovluğuna mount et → sıfırlanmır
// Lokalde: ./birthday.db istifadə olunur
const DB_PATH = process.env.DB_PATH || (process.env.RAILWAY_ENVIRONMENT ? '/data/birthday.db' : './birthday.db');
const db = new Database(DB_PATH);

// Cədvəl yarat
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET /api/messages — bütün mesajları gətir
app.get('/api/messages', (req, res) => {
  const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
  res.json(messages);
});

// POST /api/messages — yeni mesaj əlavə et
app.post('/api/messages', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'Ad və mesaj mütləqdir!' });
  }
  const stmt = db.prepare('INSERT INTO messages (name, message) VALUES (?, ?)');
  const result = stmt.run(name.trim(), message.trim());
  const newMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newMessage);
});

app.listen(PORT, () => {
  console.log(`🎮 Uğur-un ad günü serveri işə düşdü!`);
  console.log(`🌐 Brauzerinizdə açın: http://localhost:${PORT}`);
});

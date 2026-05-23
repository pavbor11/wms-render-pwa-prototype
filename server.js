const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

const db = new Database('wms-test.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`).run();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/records', (req, res) => {
  const records = db.prepare(`
    SELECT id, code, created_at AS createdAt
    FROM records
    ORDER BY created_at DESC
  `).all();

  res.json(records);
});

app.post('/api/records', (req, res) => {
  const { code } = req.body;

  if (!/^\d{8}$/.test(code || '')) {
    return res.status(400).json({ error: 'Kod musi mieć dokładnie 8 cyfr.' });
  }

  const record = {
    id: crypto.randomUUID(),
    code,
    createdAt: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO records (id, code, created_at)
    VALUES (?, ?, ?)
  `).run(record.id, record.code, record.createdAt);

  res.status(201).json(record);
});

app.delete('/api/records', (req, res) => {
  db.prepare('DELETE FROM records').run();
  res.json({ ok: true });
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WMS prototype running on port ${PORT}`);
});

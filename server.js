const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database('wms-test.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/records', (req, res) => {
  db.all(
    `
    SELECT id, code, created_at AS createdAt
    FROM records
    ORDER BY created_at DESC
    `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Błąd odczytu danych.' });
      res.json(rows);
    }
  );
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

  db.run(
    `
    INSERT INTO records (id, code, created_at)
    VALUES (?, ?, ?)
    `,
    [record.id, record.code, record.createdAt],
    err => {
      if (err) return res.status(500).json({ error: 'Błąd zapisu danych.' });
      res.status(201).json(record);
    }
  );
});

app.delete('/api/records', (req, res) => {
  db.run('DELETE FROM records', [], err => {
    if (err) return res.status(500).json({ error: 'Błąd usuwania danych.' });
    res.json({ ok: true });
  });
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WMS prototype running on port ${PORT}`);
});
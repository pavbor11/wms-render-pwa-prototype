const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

let records = [];

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/records', (req, res) => {
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

  records = [record, ...records];

  res.status(201).json(record);
});

app.delete('/api/records', (req, res) => {
  records = [];
  res.json({ ok: true });
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WMS prototype running on port ${PORT}`);
});
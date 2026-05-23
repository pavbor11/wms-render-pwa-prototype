import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pl-PL');
}

function App() {
  const [code, setCode] = useState('');
  const [records, setRecords] = useState([]);
  const [view, setView] = useState('add');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isValid = useMemo(() => /^\d{8}$/.test(code), [code]);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/records');
      if (!response.ok) throw new Error('Nie udało się pobrać danych.');
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(value) {
    setCode(value.replace(/\D/g, '').slice(0, 8));
  }

  async function saveRecord(e) {
    e.preventDefault();

    if (!isValid) {
      alert('Kod musi mieć dokładnie 8 cyfr.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Nie udało się zapisać danych.');
      }

      setCode('');
      await loadRecords();
      setView('dashboard');
      setMessage('Zapisano rekord.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function clearRecords() {
    if (!confirm('Usunąć wszystkie dane testowe?')) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/records', { method: 'DELETE' });
      if (!response.ok) throw new Error('Nie udało się wyczyścić danych.');
      await loadRecords();
      setMessage('Wyczyszczono dane.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>WMS Render PWA</h1>
        <p>Telefon zapisuje dane na serwerze, komputer widzi je w dashboardzie.</p>
      </header>

      <nav>
        <button className={view === 'add' ? 'active' : ''} onClick={() => setView('add')}>Dodaj</button>
        <button className={view === 'dashboard' ? 'active' : ''} onClick={() => { setView('dashboard'); loadRecords(); }}>Dashboard</button>
      </nav>

      {message && <div className="message">{message}</div>}

      {view === 'add' && (
        <main className="card">
          <h2>Dodaj kod</h2>
          <form onSubmit={saveRecord}>
            <label>
              Kod 8 cyfr
              <input
                autoFocus
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="8"
                value={code}
                onChange={e => handleCodeChange(e.target.value)}
                placeholder="np. 12345678"
              />
            </label>

            <div className={isValid ? 'status ok' : 'status'}>{code.length}/8 cyfr</div>

            <button className="primary" type="submit" disabled={loading}>
              {loading ? 'ZAPIS...' : 'ZAPISZ'}
            </button>
          </form>
        </main>
      )}

      {view === 'dashboard' && (
        <main className="card">
          <div className="toolbar">
            <h2>Dashboard</h2>
            <button className="danger" onClick={clearRecords} disabled={loading}>Wyczyść</button>
          </div>

          <div className="summary">
            Liczba rekordów: <strong>{records.length}</strong>
          </div>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Kod</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td colSpan="2" className="empty">{loading ? 'Ładowanie...' : 'Brak danych'}</td></tr>
              )}

              {records.map(record => (
                <tr key={record.id}>
                  <td>{formatDate(record.createdAt)}</td>
                  <td className="code">{record.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      )}

      <footer>
        Dane są zapisywane przez API. Wersja testowa używa SQLite.
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

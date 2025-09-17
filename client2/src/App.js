

import React, { useEffect, useState } from 'react';
import './App.css';
import CanvasNetwork from './CanvasNetwork';
//import CanvasNetworkND2 from './CanvasNetworkND2';

const API_URL = 'http://localhost:5000/api/records';

const initialForm = {
  componentId: '',
  txnid: '',
  trpLegName: '',
  componentName: '',
  componentType: '',
  level: 1,
  scope: '',
  unit: '',
  energyType: '',
  parentUuid: '',
  consumedQty: '',
  qty: '',
};

function App() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingUuid, setEditingUuid] = useState(null);
  const [page, setPage] = useState('home');

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(setRecords);
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = {
      ...form,
      level: Number(form.level),
      consumedQty: Number(form.consumedQty),
  qty: Number(form.qty),
      parentUuid: form.parentUuid || null
    };
    if (editingUuid) {
      fetch(`${API_URL}/${editingUuid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(updated => {
          setRecords(records.map(r => (r.componentUuid === editingUuid ? updated : r)));
          setEditingUuid(null);
          setForm(initialForm);
        });
    } else {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(newRec => {
          setRecords([...records, newRec]);
          setForm(initialForm);
        });
    }
  };

  const handleEdit = rec => {
    setEditingUuid(rec.componentUuid);
    setForm({
      componentId: rec.componentId,
      txnid: rec.txnid,
      trpLegName: rec.trpLegName,
      componentName: rec.componentName,
      componentType: rec.componentType,
      level: rec.level,
      scope: rec.scope,
      unit: rec.unit,
      energyType: rec.energyType,
      parentUuid: rec.parentUuid || '',
      consumedQty: rec.consumedQty,
  qty: rec.qty,
    });
  };

  const handleDelete = uuid => {
    fetch(`${API_URL}/${uuid}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => setRecords(records.filter(r => r.componentUuid !== uuid)));
  };

  // Clone handler
  const handleClone = rec => {
    // Remove unique fields and create a new record
    const { componentUuid, createdAt, updatedAt, ...cloneData } = rec;
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cloneData),
    })
      .then(res => res.json())
      .then(newRec => {
        setRecords([...records, newRec]);
      });
  };

  return (
    <div className="App" style={{ background: 'linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)', minHeight: '100vh', padding: 32 }}>
      <nav style={{ textAlign: 'center', marginBottom: 24 }}>
        <button onClick={() => setPage('home')} style={{ marginRight: 12, background: page === 'home' ? '#2a5298' : '#b6c6e0', color: page === 'home' ? '#fff' : '#2a5298', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Home</button>
        <button onClick={() => setPage('canvas')} style={{ background: page === 'canvas' ? '#2a5298' : '#b6c6e0', color: page === 'canvas' ? '#fff' : '#2a5298', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Network Diagram</button>
      </nav>
      {page === 'canvas' ? (
        <CanvasNetwork />
      ) : (
        <>
          <h1 style={{ color: '#2a5298', textAlign: 'center', marginBottom: 32, letterSpacing: 1 }}>Carbon Capture Component WebForm</h1>
          <form onSubmit={handleSubmit} style={{
            marginBottom: 32,
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: '14px 18px',
            maxWidth: 520,
            margin: '0 auto',
            alignItems: 'center',
            background: '#fff',
            padding: 28,
            borderRadius: 12,
            boxShadow: '0 4px 16px #2a529820',
            border: '1px solid #e0eafc'
          }}>
            <label htmlFor="componentId" style={{ color: '#2a5298', fontWeight: 500 }}>Component ID</label>
            <input id="componentId" name="componentId" value={form.componentId} onChange={handleChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }} />
            <label htmlFor="txnid" style={{ color: '#2a5298', fontWeight: 500 }}>Transaction ID</label>
            <input id="txnid" name="txnid" value={form.txnid} onChange={handleChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }} />
            <label htmlFor="trpLegName" style={{ color: '#2a5298', fontWeight: 500 }}>Transport Leg Name</label>
            <input id="trpLegName" name="trpLegName" value={form.trpLegName} onChange={handleChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }} />
            <label htmlFor="componentName" style={{ color: '#2a5298', fontWeight: 500 }}>Component Name</label>
            <input id="componentName" name="componentName" value={form.componentName} onChange={handleChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }} />
            <label htmlFor="componentType" style={{ color: '#2a5298', fontWeight: 500 }}>Network Item / Category</label>
            <input id="componentType" name="componentType" value={form.componentType} onChange={handleChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }} />
            <label htmlFor="level" style={{ color: '#2a5298', fontWeight: 500 }}>Level</label>
            <input id="level" name="level" type="number" value={form.level} onChange={handleChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }} />
            <label htmlFor="scope" style={{ color: '#2a5298', fontWeight: 500 }}>Scope</label>
            <input id="scope" name="scope" value={form.scope} onChange={handleChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }} />
            <label htmlFor="unit" style={{ color: '#2a5298', fontWeight: 500 }}>Unit</label>
            <input id="unit" name="unit" value={form.unit} onChange={handleChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }} />
            <label htmlFor="energyType" style={{ color: '#2a5298', fontWeight: 500 }}>Energy Type</label>
            <input id="energyType" name="energyType" value={form.energyType} onChange={handleChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }} />
            <label htmlFor="parentUuid" style={{ color: '#2a5298', fontWeight: 500 }}>Parent UUID (optional)</label>
            <select
              id="parentUuid"
              name="parentUuid"
              value={form.parentUuid}
              onChange={handleChange}
              style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }}
            >
              <option value="">None</option>
              {records.map(r => (
                <option key={r.componentUuid} value={r.componentUuid}>
                  {r.componentId}
                </option>
              ))}
            </select>
            <label htmlFor="consumedQty" style={{ color: '#2a5298', fontWeight: 500 }}>Consumed Qty</label>
            <input id="consumedQty" name="consumedQty" type="number" step="any" value={form.consumedQty} onChange={handleChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }} />
            <label htmlFor="qty" style={{ color: '#2a5298', fontWeight: 500 }}>Qty</label>
            <input id="qty" name="qty" type="number" step="any" value={form.qty} onChange={handleChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #b6c6e0', background: '#f4f8fb' }} />
            <div></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={{ background: '#2a5298', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px #2a529820' }}>{editingUuid ? 'Update' : 'Add'}</button>
              {editingUuid && (
                <button type="button" onClick={() => { setEditingUuid(null); setForm(initialForm); }} style={{ background: '#b6c6e0', color: '#2a5298', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
          <table style={{
            margin: '0 auto',
            borderCollapse: 'collapse',
            background: '#fff',
            borderRadius: 10,
            boxShadow: '0 2px 12px #2a529820',
            overflow: 'hidden',
            minWidth: 900
          }}>
            <thead style={{ background: 'linear-gradient(90deg, #2a5298 0%, #1e3c72 100%)' }}>
              <tr>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Component ID</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Txn ID</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Leg Name</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Name</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Type</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Level</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Scope</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Unit</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Energy</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Parent</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>C.Quantity</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Quantity</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Total</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Created</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Updated</th>
                <th style={{ color: '#fff', padding: 10, fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(rec => (
                <tr key={rec.componentUuid} style={{ background: '#f4f8fb', borderBottom: '1px solid #e0eafc' }}>
                  <td style={{ padding: 8 }}>{rec.componentId}</td>
                  <td style={{ padding: 8 }}>{rec.txnid}</td>
                  <td style={{ padding: 8 }}>{rec.trpLegName}</td>
                  <td style={{ padding: 8 }}>{rec.componentName}</td>
                  <td style={{ padding: 8 }}>{rec.componentType}</td>
                  <td style={{ padding: 8 }}>{rec.level}</td>
                  <td style={{ padding: 8 }}>{rec.scope}</td>
                  <td style={{ padding: 8 }}>{rec.unit}</td>
                  <td style={{ padding: 8 }}>{rec.energyType}</td>
                  <td style={{ padding: 8 }}>
                    {(() => {
                      if (!rec.parentUuid) return '';
                      const parent = records.find(r => r.componentUuid === rec.parentUuid);
                      return parent ? parent.componentId : rec.parentUuid;
                    })()}
                  </td>
                  <td style={{ padding: 8 }}>{rec.consumedQty}</td>
                  <td style={{ padding: 8 }}>{rec.qty}</td>
                  <td style={{ padding: 8, fontWeight: 600, color: '#2a5298' }}>{rec.total}</td>
                  <td style={{ padding: 8, fontSize: 12 }}>{rec.createdAt ? new Date(rec.createdAt).toLocaleString() : ''}</td>
                  <td style={{ padding: 8, fontSize: 12 }}>{rec.updatedAt ? new Date(rec.updatedAt).toLocaleString() : ''}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => handleEdit(rec)} style={{ background: '#1e90ff', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', marginRight: 6, cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                    <button onClick={() => handleDelete(rec.componentUuid)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', marginRight: 6, cursor: 'pointer', fontWeight: 500 }}>Delete</button>
                    <button onClick={() => handleClone(rec)} style={{ background: '#2ecc40', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 500 }}>Clone</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;
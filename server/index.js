const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Helper to read data
function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return data ? JSON.parse(data) : [];
}

// Helper to write data
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all records
app.get('/api/records', (req, res) => {
  res.json(readData());
});


// Add a new record (with new schema)
app.post('/api/records', (req, res) => {
  const records = readData();
  const now = new Date().toISOString();
  const {
    componentUuid = cryptoRandomUUID(),
    componentId = '',
    txnid = '',
    trpLegName = '',
    componentName = '',
    componentType = '',
    level = 1,
    scope = '',
    unit = '',
    energyType = '',
    parentUuid = null,
    consumedQty = 0,
    emissionFactor = 0
  } = req.body;
  const total = Number(consumedQty) * Number(emissionFactor);
  const newRecord = {
    componentUuid,
    componentId,
    txnid,
    trpLegName,
    componentName,
    componentType,
    level,
    scope,
    unit,
    energyType,
    parentUuid,
    consumedQty: Number(consumedQty),
    emissionFactor: Number(emissionFactor),
    total,
    createdAt: now,
    updatedAt: now
  };
  records.push(newRecord);
  writeData(records);
  res.status(201).json(newRecord);
});


// Update a record (with new schema)
app.put('/api/records/:componentUuid', (req, res) => {
  const records = readData();
  const { componentUuid } = req.params;
  const idx = records.findIndex(r => r.componentUuid === componentUuid);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  const {
    componentId = records[idx].componentId,
    txnid = records[idx].txnid,
    trpLegName = records[idx].trpLegName,
    componentName = records[idx].componentName,
    componentType = records[idx].componentType,
    level = records[idx].level,
    scope = records[idx].scope,
    unit = records[idx].unit,
    energyType = records[idx].energyType,
    parentUuid = records[idx].parentUuid,
    consumedQty = records[idx].consumedQty,
    emissionFactor = records[idx].emissionFactor
  } = req.body;
  const total = Number(consumedQty) * Number(emissionFactor);
  records[idx] = {
    ...records[idx],
    componentId,
    txnid,
    trpLegName,
    componentName,
    componentType,
    level,
    scope,
    unit,
    energyType,
    parentUuid,
    consumedQty: Number(consumedQty),
    emissionFactor: Number(emissionFactor),
    total,
    updatedAt: now
  };
  writeData(records);
  res.json(records[idx]);
});


// Delete a record (by componentUuid)
app.delete('/api/records/:componentUuid', (req, res) => {
  let records = readData();
  const { componentUuid } = req.params;
  const initialLen = records.length;
  records = records.filter(r => r.componentUuid !== componentUuid);
  if (records.length === initialLen) return res.status(404).json({ error: 'Not found' });
  writeData(records);
  res.json({ success: true });
});
// Helper to generate UUID (Node 18+)
function cryptoRandomUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // fallback for older Node
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

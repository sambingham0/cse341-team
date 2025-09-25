const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const PORT = 8080;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// MongoDB Atlas connection
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function startServer() {
  try {
    await client.connect();
    db = client.db('professionalDB');
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}


startServer();

// Gracefully close MongoDB connection on shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await client.close();
  process.exit(0);
});

app.get('/professional', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected.' });
  }
  try {
    const data = await db.collection('professionals').findOne({});
    if (!data) {
      return res.status(404).json({ error: 'No professional data found.' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const uploadRoutes = require('./routes/upload');
const reconcileRoutes = require('./routes/reconcile');
const reportRoutes = require('./routes/report');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', uploadRoutes);
app.use('/api', reconcileRoutes);
app.use('/api', reportRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/', (req, res) => res.send("Kaam pe lag ja!!!!"))

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

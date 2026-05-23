const express = require('express');
const router = express.Router();
const { runReconciliation } = require('../controllers/reconcileController');

router.post('/reconcile', runReconciliation);

module.exports = router;

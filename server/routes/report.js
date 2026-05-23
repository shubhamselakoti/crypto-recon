const express = require('express');
const router = express.Router();
const { getFullReport, getSummary, getUnmatched, getAllRuns } = require('../controllers/reportController');

router.get('/report/runs', getAllRuns);
router.get('/report/:runId/summary', getSummary);
router.get('/report/:runId/unmatched', getUnmatched);
router.get('/report/:runId', getFullReport);

module.exports = router;
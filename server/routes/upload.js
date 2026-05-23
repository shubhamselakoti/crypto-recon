const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadCSVs } = require('../controllers/uploadController');

router.post(
  '/upload',
  upload.fields([
    { name: 'user_file', maxCount: 1 },
    { name: 'exchange_file', maxCount: 1 },
  ]),
  uploadCSVs
);

module.exports = router;

const express = require('express');
const authMiddleware = require('../../middlewares/auth');

const router = express.Router();

/* GET users listing. */
router.get('/', authMiddleware.required, (req, res) => {
  res.json({ title: 'API' });
});

module.exports = router;

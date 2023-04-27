const express = require('express');
const router = express.Router();

/* Users Route */
router.use('/users', require('./users/api_users'));

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/seedController');

router.get('/procedures/rules', controller.seedProceduresRules);

module.exports = router;

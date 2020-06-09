const express = require('express');
const router = express.Router();
const controller = require('../controllers/authorizationsController');

router.post('/', controller.get);
router.get('/:id', controller.getById);
router.post('/create', controller.post);
router.put('/:id', controller.put);
router.delete('/:id', controller.delete);

module.exports = router;

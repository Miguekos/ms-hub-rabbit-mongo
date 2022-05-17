var express = require('express');
var router = express.Router();
const { notify } = require('../controllers/general');
const { token } = require('../controllers/config');

/* realizar pedido */
router.post('/notify?:code', notify);
router.get('/token', token);

module.exports = router;
var express = require('express');
var router = express.Router();
const { notify, token, refresh_token, polling } = require('../controllers/general');

/* realizar pedido */
router.post('/notify?:code', notify);
router.post('/refresh_token', refresh_token);
router.post('/token', token);
router.get('/polling', polling);

module.exports = router;
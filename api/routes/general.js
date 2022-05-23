var express = require('express');
var router = express.Router();
const { notify } = require('../controllers/general');
const { refresh_token, token } = require('../controllers/config');

/* realizar pedido */
router.post('/notify?:code', notify);
router.get('/refresh_token', refresh_token);
router.get('/token', token);

module.exports = router;
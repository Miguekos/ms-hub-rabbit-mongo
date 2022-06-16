var express = require('express');
var router = express.Router();
const { notify, token, refresh_token } = require('../controllers/general');

/* realizar pedido */
router.post('/notify?:code', notify);
router.get('/refresh_token', refresh_token);
router.post('/token', token);

module.exports = router;
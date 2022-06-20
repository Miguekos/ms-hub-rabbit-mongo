var express = require('express');
var router = express.Router();
const { notify, token, refresh_token, polling, pollingProducts } = require('../controllers/general');

/* realizar pedido */
router.post('/notify?:code', notify);
router.post('/refresh_token', refresh_token);
router.post('/token', token);
router.get('/polling', polling);
router.get('/pollingProducts', pollingProducts);


module.exports = router;
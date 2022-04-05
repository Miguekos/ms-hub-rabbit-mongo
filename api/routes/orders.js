var express = require('express');
var router = express.Router();
const { getOrder } = require('../controllers/orders');

/* realizar pedido */
router.get('/orders', getOrder);

module.exports = router;
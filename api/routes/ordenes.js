var express = require('express');
var router = express.Router();
const { getHello, getlogs, insertlogws, getlogswhastapp, dellogswhastapp } = require('../controllers/ordenes');

/* realizar pedido */
router.get('/', getHello);

module.exports = router;
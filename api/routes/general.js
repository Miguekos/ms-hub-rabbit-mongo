var express = require('express');
var router = express.Router();
const { notify } = require('../controllers/general');

/* realizar pedido */
router.post('/notify?:code', notify);

module.exports = router;
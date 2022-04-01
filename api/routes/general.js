var express = require('express');
var router = express.Router();
const { notify } = require('../controllers/general');

/* realizar pedido */
router.post('/notify', notify);

module.exports = router;
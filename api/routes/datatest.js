var express = require('express');
var router = express.Router();
const { datatest, getlogs, insertlogws, getlogswhastapp, dellogswhastapp } = require('../controllers/datatest');

/* realizar pedido */
router.post('/insertlog', datatest);
router.get('/getlogs', getlogs);

router.post('/insertlogws', insertlogws);
router.get('/getlogswhastapp', getlogswhastapp);
router.get('/dellogswhastapp', dellogswhastapp);

module.exports = router;
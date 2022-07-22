var express = require('express');
var router = express.Router();
const {
    notify,
    token,
    refresh_token,
    polling,
    pollingProducts,
    updateStatusOrder,
    getOrdersforDate
} = require('../controllers/general');

/* realizar pedido */
router.post('/notify?:code', notify);
router.post('/refresh_token', refresh_token);
router.post('/token', token);
router.get('/polling', polling);
router.get('/pollingProducts', pollingProducts);
router.get('/updateStatusOrder', updateStatusOrder);
router.get('/orders/:fechaini/:fechafin/:order', getOrdersforDate);


module.exports = router;
var express = require('express');
var router = express.Router();
const { accessTokenValidator } = require('../middlewares/auth')
const { login } = require('../controllers/auth');

/* realizar pedido */
router.post('/auth/login', login);
// router.post('/auth/generateToken', generateToken);
// router.post('/auth/validateToken', accessTokenValidator, validateToken);


module.exports = router;
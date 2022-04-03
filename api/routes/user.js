var express = require('express');
var router = express.Router();
const { accessTokenValidator } = require('../middlewares/auth')
const { createUser, getAllUser, getOneUser, deleteUser, updateUser } = require('../controllers/user');


/* usuarios */
router.post('/user', accessTokenValidator, createUser);
router.get('/user', accessTokenValidator, getAllUser);
router.get('/user/:id', accessTokenValidator, getOneUser);
router.delete('/user/:id', accessTokenValidator, deleteUser);
router.put('/user/:id', accessTokenValidator, updateUser);

module.exports = router;
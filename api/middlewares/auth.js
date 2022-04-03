// @ts-check
require('dotenv').config()
const creatError = require('http-errors')
const _getKeyValue = require('lodash/get')
const { verifyJwtToken } = require('../../utils/jwt')

module.exports = {
    accessTokenValidator: async (req, res, next) => {
        try {
            // console.log('middleware');
            // console.log('req.headers', req.headers);
            let token = _getKeyValue(req.headers, 'token', null)
            // console.log(token);
            if (!token) throw new creatError.Unauthorized()
            // token = token.split(' ')[1]
            req.payload = await verifyJwtToken({ token, secret: process.env.JWT_SECRET_KEY })
            next()
        } catch (error) {
            // console.log('error', error);
            next(error)
        }
    }
}
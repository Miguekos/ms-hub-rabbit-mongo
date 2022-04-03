const creatError = require('http-errors')
const jwt = require('jsonwebtoken')
module.exports = {
    signJwtToken: (data, { secret, expiresIn }) => {
        return new Promise((resolve, reject) => {
            const options = {
                expiresIn
            }
            jwt.sign(data, secret, options, (err, token) => {
                if (err) return reject(creatError.InternalServerError())
                resolve(token)
            })
        })
    },
    // verify tokens
    verifyJwtToken: ({ token, secret }) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, payload) => {
                if (err) {
                    const message = err.name === 'TokenExpiredError' ? err.message : 'Unauthorized'
                    return reject(creatError.NotAcceptable(message))
                }
                resolve(payload)
            })
        })
    }
}
const jwt = require('jsonwebtoken');
exports.generateToken = async (info) => {
    try {
        // Validate User Here
        // Then generate JWT Token

        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let data = {
            time: Date(),
            ...info
        }
        return jwt.sign(data, jwtSecretKey);

    } catch (error) {
        console.log(error.message)
        return { message: 'ERROR', data: false }
    }
}
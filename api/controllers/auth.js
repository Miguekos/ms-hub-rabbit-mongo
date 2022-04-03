// @ts-check
const clienteMongo = require('../database/mongo')
const { publishRabbitMq } = require('../../utils/rabbitmq')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const { generateToken } = require('./auth/functions');
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

exports.login = async (req, res, next) => {
    try {
        const { email, pass } = req.body
        const userexists = await clienteMongo.GET_ONE('users', { email: email });
        // console.log('userexists', userexists);
        if (!userexists)
            return res.status(401).json({
                data: 'Username or password is wrong',
                message: 'ok'
            });

        //check password
        const validPass = await bcrypt.compare(pass, userexists.pass);
        if (!validPass)
            return res.status(403).json({
                data: 'Password is incorrect',
                message: 'ok'
            });

        return res.status(200).json({
            token: await generateToken({
                name: userexists.name,
                email: userexists.email,
            }),
            name: userexists.name,
            lastname: userexists.lastname,
            email: userexists.email
        })
        // next();
    } catch (error) {
        console.log(error.message)
        return { message: 'ERROR', data: false }
    }
}

exports.validateToken = async (req, res, next) => {
    // Tokens are generally passed in the header of the request
    // Due to security reasons.

    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;

    try {
        const token = req.header(tokenHeaderKey);

        const verified = jwt.verify(token, jwtSecretKey);
        if (verified) {
            return res.send("Successfully Verified");
        } else {
            // Access Denied
            return res.status(401).send(Error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
}
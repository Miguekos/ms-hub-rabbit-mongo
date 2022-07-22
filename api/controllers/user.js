// @ts-check
// const { publishRabbitMq } = require('../../utils/rabbitmq')
const clienteMongo = require('../database/mongo')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

exports.getAllUser = async (req, res, next) => {
    try {
        const getAllUser = await clienteMongo.GET_ALL_FILTER('users', {}, { pass: 0 })
        // console.log('getAllUser', getAllUser);
        return res.status(200).json({
            data: getAllUser,
            message: 'ok'
        })
    } catch (error) {
        next(error)
    }
}

exports.getOneUser = async (req, res) => {
    const { id } = req.params
    console.log('req.params.id', id);
    const getOneUser = await clienteMongo.GET_BY_ID('users', id, { pass: 0 })
    console.log('getOneUser', getOneUser);
    return res.status(200).json({
        data: getOneUser,
        message: 'ok'
    })
}

exports.createUser = async (req, res) => {
    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.pass, salt);
    const { name, lastname, email, pass } = req.body
    const bodyForCreateUser = {
        name: name,
        lastname: lastname,
        email: email,
        pass: hashedPassword
    }
    const userCreate = await clienteMongo.INSERT_ONE('users', bodyForCreateUser)
    console.log('userCreate', userCreate);
    return res.status(200).json({
        data: {
            id: userCreate,
            ...bodyForCreateUser
        },
        message: 'ok'
    })

}

exports.deleteUser = async (req, res) => {
    const { id } = req.params
    const resDelete = await clienteMongo.DEL('users', id)
    // console.log('resDelete', resDelete);
    return res.status(200).json({
        data: `user delete ${resDelete.deletedCount}`,
        message: 'ok'
    })
}

exports.updateUser = async (req, res) => {
    const { id } = req.params
    const { name, lastname, email } = req.body
    const bodyUpdate = {
        name: name,
        lastname: lastname,
        email: email
    }
    const resUpdate = await clienteMongo.UPDATE_ONE_BY('users', id, bodyUpdate)
    // console.log('resUpdate', resUpdate);
    return res.status(200).json({
        data: `user update ${resUpdate}`,
        message: 'ok'
    })
}
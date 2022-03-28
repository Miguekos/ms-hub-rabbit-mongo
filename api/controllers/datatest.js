const clienteMongo = require('../database/mongo')
const { publishRabbitMq } = require('../../utils/rabbitmq')
const dotenv = require("dotenv");

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const datatest = async (req, res = response) => {
    try {
        const body = req.body
        console.log("body->", body);
        await publishRabbitMq('', 'logs', JSON.stringify(body))
        
        res.json({
            result: body
        });
    } catch (error) {
        res.status(404).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}


const getlogs = async (req, res = response) => {
    try {
        const response = await clienteMongo.GET_LOGS('logs');
        res.json({
            result: response
        });
    } catch (error) {
        res.status(404).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}

const insertlogws = async (req, res = response) => {
    try {
        const body = req.body
        console.log("body->", body);
        const responseGet = await clienteMongo.GET_ONE('logs_whatsapp', {
            step: body.step
        });
        console.log('responseGet', responseGet);
        if (responseGet) {

        } else {
            const response = await clienteMongo.INSERT_ONE('logs_whatsapp', body);
            console.log("response_id", response);
        }


        res.json({
            result: "dataTestCargada"
        });
    } catch (error) {
        res.status(404).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}


const getlogswhastapp = async (req, res = response) => {
    try {
        const response = await clienteMongo.GET_LOGS('logs_whatsapp');
        res.json({
            result: response
        });
    } catch (error) {
        res.status(404).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}

const dellogswhastapp = async (req, res = response) => {
    try {
        const response = await clienteMongo.CLEAN('logs_whatsapp');
        res.json({
            result: response
        });
    } catch (error) {
        res.status(404).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}




module.exports = {
    insertlogws,
    getlogswhastapp,
    datatest,
    dellogswhastapp,
    getlogs
}
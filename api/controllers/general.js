const dotenv = require("dotenv");
var axios = require('axios');

const clienteMongo = require('../database/mongo')
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const { newOrder } = require('./orders')
const { newProduct } = require('./products')
const multivende = require('../helpers/functions/multivende')

const notify = async (req, res = response) => {
    try {
        console.log('NOTIFICAR PROCESO')
        console.log('Input', req.body)
        const notifyJson = req.body
        var notify;
        const typeProcess = 
            notifyJson.CheckoutId ? 1 : // ORDER
            //notifyJson.DeliveryOrderId ? 1 : // ORDER
            notifyJson.ProductId ? 2 : // PRODUCT
            null; // NINGUNO
        console.log('Tipo de proceso:',typeProcess)
        switch (typeProcess) {
            case 1:
                notify = await newOrder(notifyJson);
                break;
            case 2:
                console.log('PRODUCT')
                notify = await newProduct(notifyJson);                
                break;
            default:
                break;
        }

        res.status(200).json(notify);
    } catch (error) {
        res.status(404).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}

const token = async (req, res = response) => {
    try {
        console.log('token')
        console.log('Input:',req.body)
        const token = await multivende.TOKEN_OAUTH({...req.body, type: 1})
        res.status(token.status).json(token.data);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}

const refresh_token = async (req, res = response) => {
    try {
        console.log('token')
        console.log('Input:',req.body)
        const token = await multivende.TOKEN_OAUTH({...req.body, type: 2})
        res.status(token.status).json(token.data);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}

const polling = async (req, res) => {
    try {
        console.log('token')
        const polling = await multivende.POLLING()
        res.status(polling.status).json(polling);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}

const pollingProducts = async (req, res) => {
    try {
        console.log('pollingProducts')
        const polling = await multivende.PRODUCTS()
        res.status(polling.status).json(polling);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}

const updateStatusOrder = async (req, res) => {
    try {
        console.log('token')
        console.log('Input:',req.body)
        const { orderID, status, comment } = req.body
        const update = await multivende.UPDATE_STATUS({ orderID, status, comment })
        res.status(update.status).json(update);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            ok: false,
            msg: error.message
        });
    }
}

module.exports = {
    notify,
    token,
    refresh_token,
    polling,
    updateStatusOrder,
    pollingProducts
}
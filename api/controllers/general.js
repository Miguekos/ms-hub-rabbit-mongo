const dotenv = require("dotenv");
var axios = require('axios');

const clienteMongo = require('../database/mongo')
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const { newOrder } = require('./orders')
const { newProduct } = require('./products')
const tokenMultivende = require('../helpers/functions/multivende')

const notify = async (req, res = response) => {
    try {
        console.log('NOTIFICAR PROCESO')
        console.log('Input', req.body)
        const notifyJson = req.body
        var notify;
        const typeProcess = 
            notifyJson.DeliveryOrderId ? 1 : // ORDER
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
        console.log('TOKEN')
        console.log('Input:',req.body)
        const token = await tokenMultivende.TOKEN_OAUTH(req.body)
        console.log(token)
        if (token.status == 200) {
            res.status(200).json({
                ok: true,
                data: token.data
            });
        } else {
            res.status(token.status).send(token.message);
        }
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
        console.log('TOKEN')
        const mdb = await clienteMongo.GET_ONE_LATEST_TIME('token_multivende', {}) 

        if(JSON.stringify(mdb) == '[]') {
            console.log('NO EXISTE DATA')
            throw {
                ok: false,
                msg: 'Error de envio de data'
            }
        }
        console.log('refreshToken:',mdb[0].refreshToken)

        var data = {
            client_id: 585956977825,
            client_secret: "LXDKAfFzh7cIUUkBL4LtAYSZM8nweAgnDLJekK2zZdr2BavODC",
            grant_type: "refresh_token",
            refresh_token: mdb[0].refreshToken
        }

        var config = {
            method: 'post',
            //baseURL: 'https://app.multivende.com',
            url: 'https://app.multivende.com/oauth/access-token',
            headers: { 
                'cache-control': 'no-cache', 
                'Content-Type': 'application/json'
            },
            data : data
        };

        axios(config)
        .then(async function (response) {
        console.log(JSON.stringify(response.data));
        const inputToken = {
            ...response.data,
            idMultivende: response._id
        }
        delete inputToken._id
        const mdb1 = await clienteMongo.INSERT_ONE('token_multivende', inputToken)
            console.log('_ID',mdb1)
            res.status(200).json(response.data);
        })
        .catch(function (error) {
            var statusText
            var status
            if (error.response) {// La respuesta fue hecha y el servidor respondió con un código de estado
              status = error.response.status
              //statusText = error.response.statusText
              statusText = error.response.data.name
              console.log(statusText);
            } else { // La petición fue hecha pero no se recibió respuesta o algo paso al preparar la petición que lanzo un Error
              status = 400
            }
            console.log(status)
            res.status(400).json({
                ok: false,
                msg: statusText
            });
        });
    } catch (error) {
        console.log(error.message)
        res.status(400).json(error);
    }
}

module.exports = {
    notify,
    token,
    refresh_token
}
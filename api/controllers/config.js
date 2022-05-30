var axios = require('axios');
const clienteMongo = require('../database/mongo')

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
        // "code": "ac-c2d0b749-d3e8-4ee7-a4cf-ee02fa380333"
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
        const mdb1 = await clienteMongo.INSERT_ONE('token_multivende', response.data)
            console.log(mdb1)
            res.status(200).json(response.data);
        })
        .catch(function (error) {
            console.log(error);
            res.status(404).json({
                ok: false,
                msg: 'Error de envio de data'
            });
        });
    } catch (error) {
        console.log(error.message)
        res.status(404).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}

const token = async (req, res = response) => {
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
            grant_type: "authorization_code",
            code: "ac-4f3970de-3711-4086-a988-b9129b7645f2"
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
        const mdb1 = await clienteMongo.INSERT_ONE('token_multivende', {client_id: data.client_id,client_secret: data.client_secret, ...response.data})
            console.log(mdb1)
            res.status(200).json(response.data);
        })
        .catch(function (error) {
            console.log(error);
            res.status(404).json({
                ok: false,
                msg: 'Error de envio de data'
            });
        });
    } catch (error) {
        console.log(error.message)
        res.status(404).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}

module.exports = {
    refresh_token,
    token
}
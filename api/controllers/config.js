var axios = require('axios');
const clienteMongo = require('../database/mongo')

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
            client_id: 166355247921,
            client_secret: "dKPFHHmLhgNNsE6bGKRzTadSovsxblyPsEWd4q6mc1xn57Aw5a",
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

module.exports = {
    token
}
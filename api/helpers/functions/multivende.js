var axios = require('axios');
const clienteMongo = require('../../database/mongo')

const TOKEN_OAUTH = async (data) => {
    try {
        console.log('TOKEN_OAUTH')
        const token = data.token
        const client_id = parseInt(data.client_id)
        const client_secret = data.client_secret
        var output

        var data = {
            client_id: client_id,
            client_secret: client_secret,
            grant_type: "authorization_code",
            code: token
        }
        console.log(data)
        var config = {
            method: 'post',
            baseURL: 'https://app.multivende.com',
            url: '/oauth/access-token',
            //url: 'https://app.multivende.com/oauth/access-token',
            headers: { 
                'cache-control': 'no-cache', 
                'Content-Type': 'application/json'
            },
            data : data
        };

        await axios(config)
        .then(async function (response) {
            console.log(JSON.stringify(response.data));
            const inputToken = {
                ...response.data,
                idMultivende: response._id
            }
            delete inputToken._id
            const mdb1 = await clienteMongo.INSERT_ONE('token_multivende', {client_id: data.client_id,client_secret: data.client_secret, ...inputToken})
            console.log('_ID',mdb1)
            output = { status: 200, id: mdb1, data: inputToken }
        })
        .catch(async function (error) {
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
            output = { status: status, message: statusText }
        });
        return output
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}

module.exports = {
    TOKEN_OAUTH
}
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
            const inputToken = {
                idMultivende: response.data._id,
                client_id: data.client_id,
                client_secret: data.client_secret,
                ...response.data,
                
            }
            delete inputToken._id
            const mdb1 = await clienteMongo.INSERT_ONE('token_multivende', inputToken)
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
        output = { status: 500, message: error.message }
        return output
    }
}

const RERESH_TOKEN_OAUTH = async (data) => {
    try {
        console.log('RERESH_TOKEN_OAUTH')
        const client_id = parseInt(data.client_id)
        const client_secret = data.client_secret
        var output

        const inputMDB = {
            client_id: client_id,
            client_secret: client_secret
        }
        const mdb = await clienteMongo.GET_ONE_LATEST_TIME('token_multivende', inputMDB)
        if(JSON.stringify(mdb) == '[]') {
            console.log('NO EXISTE DATA')
            throw  { status: 500, message: 'No existe token registrado anteriormente.' }
        }
        console.log('refreshToken:',mdb[0].refreshToken)

        var data = {
            client_id: client_id,
            client_secret: client_secret,
            grant_type: "refresh_token",
            refresh_token: mdb[0].refreshToken
        }

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
            const inputToken = {
                idMultivende: response.data._id,
                client_id: client_id,
                client_secret: client_secret,
                ...response.data
            }
            delete inputToken._id
            const mdb1 = await clienteMongo.INSERT_ONE('token_multivende', inputToken)
            console.log('_ID',mdb1)
            output = { status: 200, id: mdb1, data: inputToken }
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
            output = { status: status, message: statusText }
        });
        return output
    } catch (error) {
        console.log(error.message)
        output = { status: 500, message: error.message }
        return output
    }
}

// const POLLING = async (data) => {
//     try {
//         var merchant_id = 'd70308c6-0e76-46d8-9d02-5d55a7706f71'
//         var config = {
//             method: 'get',
//             url: '{{base_url}}/api/m/{{merchant_id}}/checkouts/light/p/{{page}}?_updated_at_from=2019-09-10T00:00:00.000Z&_updated_at_to=2019-12-10T00:00:00.000Z',
//             headers: { 
//               'Authorization': 'Bearer {{access_token}}'
//             }
//         };
//         var config = {
//             method: 'GET',
//             baseURL: 'https://app.multivende.com',
//             url: `/api/m/${merchant_id}/checkouts/light/p/1?_updated_at_from=2019-09-10T00:00:00.000Z&_updated_at_to=2019-12-10T00:00:00.000Z`,
//             //url: 'https://app.multivende.com/oauth/access-token',
//             headers: { 
//                 'cache-control': 'no-cache', 
//                 'Content-Type': 'application/json'
//             },
//             data : data
//         };

//         axios(config)
//         .then(function (response) {
//         console.log(JSON.stringify(response.data));
//         })
//         .catch(function (error) {
//         console.log(error);
//         });
//     } catch (error) {
        
//     }
// }

module.exports = {
    TOKEN_OAUTH,
    RERESH_TOKEN_OAUTH
}
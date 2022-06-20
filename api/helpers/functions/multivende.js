var axios = require('axios');
const clienteMongo = require('../../database/mongo')
const apis = require('../../../utils/axios')
const moment = require('moment')

const TOKEN_OAUTH = async (data) => {
    try {
        console.log('TOKEN_OAUTH')
        const token = data.token
        const client_id = parseInt(data.client_id)
        const client_secret = data.client_secret
        const type = data.type
        var output
        var inputMultivende

        if (type == 1) { // CREATE
            inputMultivende = {
                client_id: client_id,
                client_secret: client_secret,
                grant_type: "authorization_code",
                code: token
            }
        } else if (type == 2){ // REFRESH
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

            inputMultivende = {
                client_id: client_id,
                client_secret: client_secret,
                grant_type: "refresh_token",
                refresh_token: mdb[0].refreshToken
            }
        }

        console.log(inputMultivende)

        const tokenOauth = await apis.TOKEN_MULTIVENDE(inputMultivende)

        if (tokenOauth.status == 200) {
            console.log('future refreshToken:',tokenOauth.data.refreshToken)
            const inputMDB = {
                idMultivende: tokenOauth.data._id,
                client_id: inputMultivende.client_id,
                client_secret: inputMultivende.client_secret,
                ...tokenOauth.data,
                
            }
            delete inputMDB._id
            const mdb = await clienteMongo.INSERT_ONE('token_multivende', inputMDB)
            console.log('_ID',mdb)
            output = { status: tokenOauth.status, id: mdb, data: inputMDB }
        } else {
            output = { status: tokenOauth.status, data: tokenOauth.message}
        }
        return output
    } catch (error) {
        console.log(error.message)
        output = { status: 500, data: error.message }
        return output
    }
}

const POLLING = async () => {
    try {
        const ayer = moment().subtract(1, 'days').utc().format()
        const hoy = moment().utc().format()
        console.log(ayer)
        console.log(hoy)

        var rptaPolling = { status: 500}
        const token = await TOKEN_OAUTH({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            type: 2
        })

        if (token.status == 200) {
            const auth = token.data.token
            console.log(auth)
            var totalPage = 0
            var j = 1

            do {
                const inputPolling = {
                    startData: ayer,
                    endData: hoy,
                    auth,
                    page: j
                }
                rptaPolling = await apis.POLLING(inputPolling)
                if(rptaPolling.status == 200) {
                    const arrayPolling = rptaPolling.data.entries
                    totalPage = rptaPolling.data.pagination.total_pages
                    if (JSON.stringify(arrayPolling) != '[]') {
                        console.log(arrayPolling.length)
                        for (let i = 0; i < arrayPolling.length; i++) {
                            const element = arrayPolling[i];
                            console.log(element._id)
                            const query = {
                                _id:element._id
                            }
                            const ventaPolling = await clienteMongo.GET_ONE('pollingDetail', query)
                            if(ventaPolling.response == false) { // Data Nueva
                                const inputCheckout = {
                                    checkout_id: element._id,
                                    auth
                                }
                                const rptaCheckout = await apis.CHECKOUTS(inputCheckout)
    
                                if (rptaCheckout.status == 200){
                                    const mdb = await clienteMongo.INSERT_ONE('pollingDetail', rptaCheckout.data)
                                    console.log(mdb)
                                }
                                
                            }
                        }
                        
                    }
                } 
                j = j + 1;
            } while (j <= totalPage && totalPage != 0);
            return rptaPolling
        } else {
            return token
        }
    } catch (error) {
        console.log(error.message)
        output = { status: 500, message: error.message }
        return output
    }
}

const PRODUCTS = async () => {
    try {
        console.log('PRODUCTS')
        var rptaProd = { status: 500}
        const token = await TOKEN_OAUTH({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            type: 2
        })

        
        if (token.status == 200) {
            const auth = token.data.token
            console.log(auth)
            var totalPage = 0
            var j = 1

            do {
                const inputProd = {
                    auth,
                    page: j
                }
                rptaProd = await apis.GET_PRODUCTS(inputProd)
                
                if(rptaProd.status == 200) {
                    const arrayProd = rptaProd.data.entries
                    totalPage = rptaProd.data.pagination.total_pages
                    if (JSON.stringify(arrayProd) != '[]') {
                        console.log(arrayProd.length)
                        for (let i = 0; i < arrayProd.length; i++) {
                            const element = arrayProd[i];
                            console.log(element._id)
                            const query = {
                                _id:element._id
                            }
                            const ventaPolling = await clienteMongo.GET_ONE('productDetail', query)
                            if(ventaPolling.response == false) { // Data Nueva
                                const mdb = await clienteMongo.INSERT_ONE('productDetail', element)
                                console.log(mdb)
                                
                            }
                        }
                    }
                }
                j = j + 1;
            } while (j <= totalPage && totalPage != 0);
            return rptaProd
        } else {
            return token
        }

    } catch (error) {
        
    }
}

module.exports = {
    TOKEN_OAUTH,
    POLLING,
    PRODUCTS
}
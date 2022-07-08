var axios = require('axios');
const clienteMongo = require('../../database/mongo')
const apis = require('../../../utils/axios')
const moment = require('moment')
const { publishRabbitMq } = require('../../../utils/rabbitmq')

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
            output = { status: tokenOauth.status, id: mdb, data: inputMDB }
        } else {
            output = { status: tokenOauth.status, data: tokenOauth.message}
        }
        return output
    } catch (error) {
        console.log(error.message)
        output = { status: 500, message: error.message }
        return output
    }
}

const POLLING = async () => {
    try {
        const ayer = moment().subtract(1, 'days').utc().format()
        const hoy = moment().utc().format()
        const channel = 'POLLING'
        let cantidad
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
                        cantidad = arrayPolling.length
                        console.log(cantidad)
                        for (let i = 0; i < cantidad; i++) {
                            const checkoutId = arrayPolling[i]._id;
                            console.log(checkoutId)

                            const jsonDetail = {checkoutId, channel, auth, data: arrayPolling[i]}
                            await POLLING_DETAILS(jsonDetail)
                        }
                        
                    }
                } 
                j = j + 1;
            } while (j <= totalPage && totalPage != 0);
            return { status : rptaPolling.status, totalVentas : cantidad }
        } else {
            return token
        }
    } catch (error) {
        console.log(error.message)
        output = { status: 500, message: error.message }
        return output
    }
}

const POLLING_DETAILS = async (json) => {
    try {
        var esquema = 'orders'
        const { data, checkoutId, auth, channel } = json
        const query = {
            _id: checkoutId
        }
        const ventaPolling = await clienteMongo.GET_ONE(esquema, query)
        if(ventaPolling.response == false) { // Data Nueva
            const inputCheckout = {
                checkout_id: checkoutId,
                auth
            }
            const rptaCheckout = await apis.CHECKOUTS(inputCheckout)

            if (rptaCheckout.status == 200){
                const bodyDetail = {
                    ...data,
                    ...rptaCheckout.data, 
                    channel
                }
                const mdb = await clienteMongo.INSERT_ONE(esquema, bodyDetail)
                console.log(mdb)

                if (mdb.status == false) {
                    await clienteMongo.INSERT_ONE('log_error', {...rptaCheckout.data, error:mdb.message, channel, type: 'Order'})
                    return { status: 500, message: 'ERROR', data: mdb.status}
                } else {
                    await publishRabbitMq('ex_order', '', JSON.stringify(bodyDetail))
                    return { status: 200, message: 'OK', data: bodyDetail}
                }
            } else {
                return { status: 500, message: 'Error Checkout' }
            }
        } else {
            return { status: 200, message: 'Data repetida' }
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

const UPDATE_STATUS = async (data) => {
    try {
        console.log('UPDATE_STATUS')
        
        const query = { theHub: data.status }
        const statusMongo = await clienteMongo.GET_ONE('listStatus', query)
        if (statusMongo.response) {
            const codeStatusMultivende = statusMongo.data.multivende
            const token = await TOKEN_OAUTH({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                type: 2
            })
    
            if (token.status == 200) {
                const auth = token.data.token
                const statusData = await apis.GET_ORDER_STATUS_MULTIVENDE({auth})
        
                if(statusData.status == 200) {
                    const arrayStatusMult = statusData.data.entries
                    const findStatusMult = arrayStatusMult.find( e => e.code === codeStatusMultivende );
    
                    const input = {
                        orderID: data.orderID,
                        updateDate: moment().utc().format(),
                        statusID: findStatusMult._id,
                        comment: data.comment,
                        auth
                    }
    
                    const rpta = await apis.UPDATE_ORDER_STATUS_VENDEMAS(input)
                    return rpta
                } else {
                    return statusData
                }
            } else {
                return token
            }
        } else {
            return { status: 200, message:'Estado no definido'}
        }
    } catch (error) {
        console.log(error.message)
        output = { status: 500, message: error.message }
        return output
    }
}

module.exports = {
    TOKEN_OAUTH,
    POLLING,
    POLLING_DETAILS,
    PRODUCTS,
    UPDATE_STATUS
}
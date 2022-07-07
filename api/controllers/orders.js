const clienteMongo = require('../database/mongo')
const { publishRabbitMq } = require('../../utils/rabbitmq')
const multivende = require("../helpers/functions/multivende")
const apis = require('../../utils/axios')
const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const newOrder = async (data) => {
    try {
        console.log('New Order')
        var esquema = 'orders'

        const token = await multivende.TOKEN_OAUTH({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            type: 2
        })
        //console.log(token)

        if (token.status == 200) {
            const auth = token.data.token

            const jsonDetail = { 
                checkoutId: data.CheckoutId, 
                auth, 
                channel : 'WEBHOOK'
            } 
            console.log('jsonDetail:',jsonDetail)
            const rptaCheckout = await multivende.POLLING_DETAILS(jsonDetail)
            console.log(rptaCheckout)
            if (rptaCheckout.status == 200){
                if (rptaCheckout.data){
                    const mdb = await clienteMongo.INSERT_ONE(esquema, {...rptaCheckout.data, channel: 'WEBHOOK'})
                    console.log('MDB:',mdb)
                    if (mdb.status == false) {
                        await clienteMongo.INSERT_ONE('log_error', {...data, error:mdb.message, type: 'Order'})
                        return {message: 'ERROR', data: mdb.status}
                    } else {
                        await publishRabbitMq('ex_order', '', JSON.stringify({...rptaCheckout.data, channel: 'WEBHOOK'}))
                        return {message: 'OK', data}
                    }
                } else {
                    return {message: 'OK', rptaCheckout}
                }
            } else {
                await clienteMongo.INSERT_ONE('log_error', {...rptaCheckout, type: 'Order'})
                return {message: 'ERROR', data: rptaCheckout}
            }
        } else {
            await clienteMongo.INSERT_ONE('log_error', {...token, type: 'Order'})
            return {message: 'ERROR', data: token}
        }
    } catch (error) {
        console.log(error.message)
        return {message: 'ERROR', data: false}
    }
}
module.exports = {
    newOrder
}